import co from "co";
import { Types } from "mongoose";
import moment from "moment";
import util from "util";

import esClient from "../../lib/elasticsearchclient";

// logger
import logger from "../../lib/logger";

// models
import Tenant from "../../lib/models/Tenant";
import DisplayItem from "../../lib/models/DisplayItem";
import MetaInfo from "../../lib/models/MetaInfo";
import Action from "../../lib/models/Action";
import File from "../../lib/models/File";
import Dir from "../../lib/models/Dir";

import * as constants from "../../lib/configs/constants";

const task = () => {
  co(function* () {
    try {
      if (! process.argv[3]) throw new Error("引数にテナント名を指定する必要があります");

      const tenant_name = process.argv[3];
      const tenant = yield Tenant.findOne({"name": tenant_name});
      if (tenant === null) throw new Error(`指定されたテナントは存在しません ${tenant_name}`);

      const tenant_id = tenant._id.toString();

      const type = "files";

      let settings = {
        "analysis": {
          "tokenizer": {
            "kuromoji_search": {
              "type": "kuromoji_tokenizer",
              "mode": "search",
              "discard_punctuation": "false"
            }
          },
          "analyzer":{
            "default": {
              "tokenizer": "kuromoji_search"
            }
          }
        }
      };

      if (process.env.NODE_ENV === "production") {
        const index = { number_of_replicas: 2 };
        settings = { ...settings, index };
      }

      const file_properties={
        _id: { type:"text", },
        name: { type:"text", fielddata:true },
        mime_type: { type:"text", index: false },
        size: { type:"long", index: false },
        is_dir: { type:"boolean" },
        dir_id: { type:"keyword" },
        is_display: { type:"boolean" },
        is_star: { type:"boolean" },
        is_trash: { type:"boolean" },
        is_crypted: { type:"boolean", index: false },
        is_deleted: { type:"boolean" },
        modified: {
          type:"date",
          index: true,
          fields: {
            raw: { type: "keyword" }
          }
        },
        preview_id: { type:"text", index: false },
        authorities: { type:"nested" },
        dirs: { type:"nested" },
        unvisible: { type: "boolean" },
        sort_target: { type:"text", index: false },
        actions:{ properties:{}}
      };

      // meta_infoのマッピング
      const meta_infos = yield MetaInfo.find({
        tenant_id: Types.ObjectId( tenant_id )
      });

      meta_infos.forEach((item,index)=>{
        file_properties[item._id] = {
          type: item.value_type === "Date" ? "date" : "text",
          "fields": { // sort用のフィールドを持つ
            "raw": {
              "type": "keyword"
            }
          }

        };
      });

      const actions = yield Action.find();
      actions.forEach((item,index)=>{
        file_properties["actions"]["properties"][item._id] = {
          "type":  "keyword"
        };
      });

      const mappings = {
        index: tenant_id,
        type: type,
        body:{
          properties: {
            file:{
              properties: file_properties
            }
          }
        }
      };

    console.log(`check old indedices:${tenant_id}`);
    const isExists = yield esClient.indices.exists( { index: tenant_id } );

    if( isExists ){
      console.log(`delete index: ${tenant_id}`);
      yield esClient.indices.delete({ index: tenant_id });
    }
    console.log(`create index:${tenant_id}`);

    yield esClient.indices.create(
      { index: tenant_id ,
        body: {
          settings
        }
      }
    );
    console.log("put mapping");
    yield esClient.indices.putMapping(mappings);
    console.log("done!");

    } catch (error) {
      console.log(error);
    } finally {
      process.exit();

    }

  });
};

/**
 * init後に行う
 * @param {*} tenant_id
 */
export const reCreateElasticCache = () => {
  co(function* (){
    try {

      if (! process.argv[3]) throw new Error("引数にテナント名を指定する必要があります");

      const tenant_name = process.argv[3];
      const tenant = yield Tenant.findOne({"name": tenant_name});
      if (tenant === null) throw new Error(`指定されたテナントは存在しません ${tenant_name}`);
      const folder_ids = (yield Dir.find({
          ancestor: tenant.home_dir_id,
          descendant: { $nin: [tenant.trash_dir_id ] } //trashを含まない
        }))
        .map( folder => folder.descendant ) // フォルダのidリストを取得

      console.log('インデックス作成されるフォルダリスト：')
      console.log(folder_ids)
      for(let i = 0 ; i< folder_ids.length; i++){
        const folder_id = folder_ids[i];

        const folder_count = yield File.find({_id: folder_id, is_display: true}).count();
        if(folder_count > 0) { // is_display:trueの場合のみ、フォルダを検索対象にする（Topは対象外になる）
          const folder = yield File.searchFileOne({_id: folder_id});
          const result = yield esClient.createIndex(tenant._id.toString(), [folder]);
        }
        const file_ids = (yield File.find({dir_id: folder_id, is_dir: false, is_display: true})).map( file => file._id );

        for(let i= 0; i < file_ids.length; i += constants.FILE_LIMITS_PER_PAGE ){
          const ids = file_ids.slice(i, i + ( constants.FILE_LIMITS_PER_PAGE - 1 ) );
          const files = yield File.searchFiles({ _id: { $in: ids } }, 0, constants.FILE_LIMITS_PER_PAGE, { _id: "asc" });
          yield esClient.createIndex(tenant._id.toString(), files);
        }
      }

    } catch (error) {
      console.log(error);
    } finally {
      process.exit();
    }
  });
}

export default task;
