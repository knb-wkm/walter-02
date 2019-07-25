import co from "co";
import { Types } from "mongoose";
import moment from "moment";
import util from "util";
import * as _ from "lodash";

import esClient from "../../elasticsearchclient";

// logger
import logger from "../../logger";

// models
import Tenant from "../../models/Tenant";
import DisplayItem from "../../models/DisplayItem";
import MetaInfo from "../../models/MetaInfo";
import Action from "../../models/Action";
import File from "../../models/File";
import Dir from "../../models/Dir";

import * as constants from "../../configs/constants";

const task = async (tenant_name) => {
//  co(function* () {
  console.log("init-elasticsearch start.....")
  try {
    if (!tenant_name) throw new Error("引数にテナント名を指定する必要があります");

    //const tenant_name = process.argv[3];
    const tenant = await Tenant.findOne({"name": tenant_name});
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
          },
          "full_text_analyzer": {
            "type": "custom",
            "tokenizer": "kuromoji_search",
            "filter": [ "ja_stop", "kuromoji_part_of_speech", "kuromoji_number" ]
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
      name: {
        type:"text",
        fielddata: true,
        fields: {
          raw: { type: "keyword" }
        }
      },
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
      actions:{ properties:{}},
      tag: { type: "text" },
      full_text: {
        type: "text",
        fielddata: true,
        search_analyzer: "full_text_analyzer",
        analyzer: "full_text_analyzer"
      },
      meta_text: {
        type: "text",
        fielddata: true,
        search_analyzer: "full_text_analyzer",
        analyzer: "full_text_analyzer"
      },
      tstExpirationDate: {
        "type": "date"
      },
      tstStatus: {
        "type": "keyword"
      },
    };

    // meta_infoのマッピング
    const meta_infos = await MetaInfo.find({
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

    const actions = await Action.find();
    actions.forEach((item,index)=>{
      file_properties["actions"]["properties"][item._id] = {
        "type":  "keyword"
      };
    });

    const mappings = {
      index: tenant_id,
      type: type,
      include_type_name: true,
      body:{
        properties: {
          file:{
            properties: file_properties
          }
        }
      }
    };

    console.log(`check old indedices:${tenant_id}`);
    const isExists = await esClient.indices.exists( { index: tenant_id } );

    if( isExists.body ){
      console.log(`delete index: ${tenant_id}`);
      await esClient.indices.delete({ index: tenant_id });
    }
    console.log(`create index:${tenant_id}`);

    await esClient.indices.create(
      { index: tenant_id ,
        body: {
          settings
        }
      }
    );
    console.log("put mapping");
    await esClient.indices.putMapping(mappings);
    console.log("done!");
    await reCreateElasticCache(tenant_name)

  } catch (error) {
    console.log(error);
  } finally {
    //process.exit();

  }

//  });
};

/**
 * init後に行う
 * @param {*} tenant_id
 */
export const reCreateElasticCache = async (tenant_name) => {
//  co(function* (){
  console.log("recreate-elasticsearch start....")
  try {

    if (!tenant_name) throw new Error("引数にテナント名を指定する必要があります");

    //const tenant_name = process.argv[3];
    const tenant = await Tenant.findOne({"name": tenant_name});
    if (tenant === null) throw new Error(`指定されたテナントは存在しません ${tenant_name}`);
    const folder_ids = (await Dir.find({
        ancestor: tenant.home_dir_id,
        descendant: { $nin: [tenant.trash_dir_id ] } //trashを含まない
      }))
      .map( folder => folder.descendant ) // フォルダのidリストを取得

    console.log('インデックス作成されるフォルダリスト：')
    console.log(folder_ids)
    for(let i = 0 ; i< folder_ids.length; i++){
      const folder_id = folder_ids[i];

      const folder_count = await File.find({_id: folder_id, is_display: true}).countDocuments();
      if(folder_count > 0) { // is_display:trueの場合のみ、フォルダを検索対象にする（Topは対象外になる）
        const folder = await File.searchFileOne({_id: folder_id});
        const result = await esClient.createIndex(tenant._id.toString(), [folder]);
      }
      const file_ids = (await File.find({dir_id: folder_id, is_dir: false, is_display: true})).map( file => file._id );

      for(let i= 0; i < file_ids.length; i += constants.FILE_LIMITS_PER_PAGE ){
        const ids = file_ids.slice(i, i + ( constants.FILE_LIMITS_PER_PAGE - 1 ) );
        const files = await File.searchFiles({ _id: { $in: ids } }, 0, constants.FILE_LIMITS_PER_PAGE, { _id: "asc" });
        await esClient.createIndex(tenant._id.toString(), files);
      }
    }

  } catch (error) {
    console.log(error);
  } finally {
    //process.exit();
  }
//  });
}

export default task;
