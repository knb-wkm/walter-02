import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import co from "co";
import jwt from "jsonwebtoken";
import multer from "multer";
import moment from "moment";
import morgan from "morgan";
import { exec } from "child_process";
import util from "util";
import crypto from "crypto";
import esClient from "../elasticsearchclient";
import {
  intersection,
  zipWith,
  flattenDeep,
  reject,
  chain,
  uniq,
  findIndex,
  find,
  isNaN,
  first,
  sortBy,
  max,
  indexOf
} from "lodash";

// etc
import logger from "../logger";
import * as commons from "./commons";
import {
  ValidationError,
  RecordNotFoundException,
  PermisstionDeniedException
} from "../errors/AppError";

// constants
import { SECURITY_CONF } from "../configs/server";
import * as constants from "../configs/constants";

// models
import Dir from "../models/Dir";
import File from "../models/File";
import Preview from "../models/Preview";
import Tag from "../models/Tag";
import MetaInfo from "../models/MetaInfo";
import User from "../models/User";
import Group from "../models/Group";
import Tenant from "../models/Tenant";
import RoleFile from "../models/RoleFile";
import AuthorityFile from "../models/AuthorityFile";
import Action from "../models/Action";
import FileMetaInfo from "../models/FileMetaInfo";
import DisplayItem from "../models/DisplayItem";
import { Swift } from "../storages/Swift";

import { moveDir } from "./dirs";

export const index = (req, res, next, export_excel=false, no_limit=false) => {
  return co(function* () {
    try {
      let { dir_id, page ,sort ,order, is_display_unvisible } = req.query;
      const { tenant_id } = res.user;

      // デフォルトはテナントのホーム
      if (dir_id === null || dir_id === undefined || dir_id === "") {
        dir_id = res.user.tenant.home_dir_id;
      }

      if ( !mongoose.Types.ObjectId.isValid(dir_id) ) throw new ValidationError("dir_id is not valid");
      const _dir = yield File.findById(dir_id);

      if(_dir === null) throw new RecordNotFoundException("dir is not found");

      // 権限チェック
      const file_ids = [
        ...(yield getAllowedFileIds(res.user._id, constants.PERMISSION_VIEW_LIST )),
        res.user.tenant.home_dir_id,
        res.user.tenant.trash_dir_id
      ];

      if(findIndex(file_ids, mongoose.Types.ObjectId(dir_id)) === -1) throw new PermisstionDeniedException("permission denied");

      if ( typeof sort === "string" && !mongoose.Types.ObjectId.isValid(sort)  ) throw new ValidationError("sort is empty");
      if ( typeof order === "string" && order !== "asc" && order !== "desc" ) throw new ValidationError("sort is empty");
      const sortOption = yield createSortOption(sort, order);

      // pagination
      if ( page === undefined || page === null ) page = 0;
      if ( page === "" || isNaN( parseInt(page) ) ) throw new ValidationError("page is not number");

      const action_id = (yield Action.findOne({name:constants.PERMISSION_VIEW_LIST}))._id;  // 一覧表示のアクションID

      // デフォルト表示させたくないファイル
      const isDisplayUnvisible = is_display_unvisible.toLowerCase() === "true";
      const isDisplayUnvisibleCondition = isDisplayUnvisible
            ? {} : { "match": { "file.unvisible": false } };

      const esQuery = {
        index: tenant_id.toString(),
        type: "files",
        sort: [ "file.is_dir:desc", (sort === undefined) ? "_score" : `file.${sort}.raw:${order}`],
        body:
          {
            "query" :{
              "bool":{
                "must": [
                  {
                    "match": {"file.dir_id":{ "query":dir_id, "operator": "and" }
                  }},{
                    "match" : {
                    [`file.actions.${action_id}`]:
                      {
                        "query": res.user._id,　  // 一覧の表示権限のあるユーザを対象
                        "operator": "and"         // operator の default は or なので and のする
                      }
                  }},{
                    "match" : {
                      "file.is_display": true
                  }},{
                    "match" : {
                    "file.is_deleted": false
                  }},
                  isDisplayUnvisibleCondition
                ]
              }
          }
        }
      };

      const offset = page * constants.FILE_LIMITS_PER_PAGE;
      if(!export_excel){
        esQuery["from"] = offset;
        esQuery["size"] = parseInt( offset ) + 30;
      }else{
        esQuery["from"] = 0;
        esQuery["size"] = 0;
      }

      let esResult = yield esClient.search(esQuery);
      const { total } = esResult.hits;

      if(export_excel){
        // elasticsearchが無制限にレコードを取得できないので一度totalを取得してから再検索する
        esQuery["size"] = total;
        esResult = yield esClient.search(esQuery);
      }

      const esResultIds = esResult.hits.hits
      .map(hit => {
        return mongoose.Types.ObjectId( hit._id );
      });

      const conditions = {
        is_display: true,
        is_deleted: false,
        $and: [
          {_id: {$in : esResultIds} },
        ]
      };

      const limit = ( export_excel && total !== 0 ) ? total : constants.FILE_LIMITS_PER_PAGE;

      let files = yield File.searchFiles(conditions, 0, limit, sortOption, mongoose.Types.ObjectId(sort));

      files = files.map( file => {
        file.actions = extractFileActions(file.authorities, res.user);
        return file;
      });

      if(export_excel){

        files = files.map( file => {
          const route = file.dirs
                .filter( dir => dir.ancestor.is_display )
                .map( dir => dir.ancestor.name );

          file.dir_route = route.length > 0
            ? route.reverse().join("/")
            : "";

          return file;
        });

        return files;
      }else{
          res.json({
            status: { success: true, total },
            body: files
          });
      }
    }
    catch (e) {

      let errors = {};
      switch (e.message) {
        case "dir_id is not valid":
        case "dir is not found":
          errors.dir_id = "指定されたフォルダが存在しないためファイル一覧の取得に失敗しました";
          break;
        case "dir_id is empty":
          errors.dir_id = "dir_id is empty";
          break;
        case "permission denied":
          errors.dir_id = "閲覧権限が無いためファイル一覧の取得に失敗しました";
          break;
        case "page is not number":
          errors.page = "pageが数字では無いためファイル一覧の取得に失敗しました";
          break;
        case "sort is empty":
          errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
          break;
        default:
          errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, message:"ファイル一覧の取得に失敗しました", errors }
      });

    }
  });
};

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") {
        throw new ValidationError("file_idが空です");
      }
      if( !mongoose.Types.ObjectId.isValid( file_id ) ) throw new ValidationError("ファイルIDが不正なためファイルの取得に失敗しました");

      const file_ids = yield getAllowedFileIds(
        res.user._id, constants.PERMISSION_VIEW_DETAIL
      );

      if (!file_ids.map( f => f.toString() ).includes(file_id)) {
        throw new PermisstionDeniedException("指定されたファイルが見つかりません");
      }

      const conditions = {
        $and:[
          {_id: mongoose.Types.ObjectId(file_id)},
          {_id: {$in : file_ids}}
        ]
      };

      const file = yield File.searchFileOne(conditions);

      if (file === null || file === "" || file === undefined) {
        throw new RecordNotFoundException("指定されたファイルが見つかりません");
      }

      if (file.is_deleted) {
        throw new RecordNotFoundException("ファイルは既に削除されているためファイルの取得に失敗しました");
      }

      const tags = yield Tag.find({ _id: { $in: file.tags } });

      const actions = extractFileActions(file.authorities, res.user);

      res.json({
        status: { success: true },
        body: { ...file, tags, actions }
      });

    }
    catch (e) {
      logger.error(e);

      res.status(400).json({
        status: { success: false,message:"ファイルの取得に失敗しました", errors: e }
      });
    }
  });
};

export const download = (req, res, next) => {
  co(function* () {
    try {
      const { file_id }  = req.query;

      if ( file_id === null || file_id === undefined || file_id === "") throw new ValidationError( "file_id is empty" );
      if (! mongoose.Types.ObjectId.isValid(file_id)) throw new ValidationError( "file_id is invalid" );

      const fileRecord = yield File.findById(file_id);
      if (fileRecord === null) throw new ValidationError( "file is empty" );
      if (fileRecord.is_deleted) throw new ValidationError( "file is deleted" );

      const tenant_name = res.user.tenant.name;

      const swift = new Swift();
      const readStream = yield swift.downloadFile(tenant_name, fileRecord);
      readStream.on("data", data => res.write(data) );
      readStream.on("end", () => res.end() );
    }
    catch (e) {
      let errors = {};

      switch(e.message) {
      case "file_id is empty":
        errors.file_id = "ファイルIDが空のためファイルのダウンロードに失敗しました";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイルのダウンロードに失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイルのダウンロードに失敗しました";
        break;
      default:
        errors.unknown = e;
      }

      logger.error(e);

      res.status(400).json({
        status: {
          success: false,
          message: "ファイルのダウンロードに失敗しました",
          errors: e
        }
      });
    }
  });
};

export const search = (req, res, next, export_excel=false) => {
  return co(function* () {
    try {

      const { q, page, sort, order, is_display_unvisible } = req.query;
      const { tenant_id } = res.user;

      if(q=== undefined || q===null || q==="") throw new ValidationError( "q is empty" );
      const { trash_dir_id } = yield Tenant.findOne(tenant_id);

      const _page = page === undefined || page === null
        ? 0 : page;
      if ( _page === "" || isNaN( parseInt(_page) ) ) throw new ValidationError("page is not number");

      const action_id = (yield Action.findOne({name:constants.PERMISSION_VIEW_LIST}))._id;  // 一覧表示のアクションID

      const isDisplayUnvisible = is_display_unvisible.toLowerCase() === "true";
      const isDisplayUnvisibleCondition = isDisplayUnvisible
            ? {} : { "match": { "file.unvisible": false } };

      // 閲覧できるフォルダの一覧を取得する
      const esQueryDir = {
        index: tenant_id.toString(),
        type: "files",
        body:{
          "query": {
            "bool":{
              "must_not": [{
                "match": {"file.dir_id":{ "query":trash_dir_id.toString(), "operator": "and" }}   // ゴミ箱内のファイルは対象外
              }],
              "must": [{
                "match" : {
                  [`file.actions.${action_id}`]:
                    {
                      "query": res.user._id,　  // 一覧の表示権限のあるユーザを対象
                      "operator": "and"         // operator の default は or なので and のする
                    }
                }},{
                  "match" : {
                    "file.is_dir": true
                  }
                }, isDisplayUnvisibleCondition   
              ]
            }
          }
        }
      };
      let esResultDir = yield esClient.search(esQueryDir);

      // 取得した一覧とTopが閲覧可能なフォルダとなる
      const authorizedDirIds = [ ...(esResultDir.hits.hits.map(file=> file._id)), res.user.tenant.home_dir_id.toString()];

      const esQuery = {
        index: tenant_id.toString(),
        type: "files",
        sort: ["file.is_dir:desc", (sort === undefined) ? "_score" : `file.${sort}.raw:${order}`, `file.name:${order}`],
        body:
          {
            "query" :{
              "bool":{
                "must_not": [{
                  "match": {"file.dir_id":{ "query":trash_dir_id.toString(), "operator": "and" }}   // ゴミ箱内のファイルは対象外
                }],
                "must": [
                  {
                  "query_string":{
                    "query": escapeRegExp( q.toString().replace(/[　]/g,' ') ).split(" ").map(s => `"${s}"`).join(" "),
                    "default_operator": "AND"
                    }
                  },{
                  "match" : {
                    [`file.actions.${action_id}`]:
                      {
                        "query": res.user._id,　  // 一覧の表示権限のあるユーザを対象
                        "operator": "and"         // operator の default は or なので and のする
                      }
                  }},{
                    "match" : {
                    "file.is_display": true
                  }},{
                    "match" : {
                    "file.is_deleted": false
                  }},{
                    "match" : {
                    "file.is_trash": false
                    }},
                  isDisplayUnvisibleCondition,
                  {
                    "terms" : {
                      "file.dir_id": authorizedDirIds
                  }}
                ]
              }
          }
        }
      };

      const offset = _page * constants.FILE_LIMITS_PER_PAGE;
      if(!export_excel){
        esQuery["from"] = offset;
        esQuery["size"] = parseInt( offset ) + 30;
      }else{
        esQuery["from"] = 0;
        esQuery["size"] = 0;
      }

      let esResult = yield esClient.search(esQuery);
      const { total } = esResult.hits;

      if(export_excel){
        // elasticsearchが無制限にレコードを取得できないので一度totalを取得してから再検索する
        esQuery["size"] = total;
        esResult = yield esClient.search(esQuery);
      }

      const esResultIds = esResult.hits.hits
      .map(hit => {
        return mongoose.Types.ObjectId( hit._id );
      });

      const conditions = {
        dir_id: { $ne: trash_dir_id },
        is_display: true,
        is_deleted: false,
        $and: [
          {_id: {$in : esResultIds} },
        ]
      };

      const limit = ( export_excel && total !== 0 ) ? total : constants.FILE_LIMITS_PER_PAGE;

      if ( typeof sort === "string" && !mongoose.Types.ObjectId.isValid(sort)  ) throw new ValidationError("sort is empty");
      if ( typeof order === "string" && order !== "asc" && order !== "desc" ) throw new ValidationError("sort is empty");

      const _sort = yield createSortOption(sort, order);

      let files = yield File.searchFiles(conditions, 0, limit, _sort, mongoose.Types.ObjectId(sort));
      files = files.map( file => {
        const route = file.dirs
              .filter( dir => dir.ancestor.is_display )
              .map( dir => dir.ancestor.name );

        file.dir_route = route.length > 0
          ? route.reverse().join("/")
          : "";

        files = files.map( file => {

          file.actions = chain(file.authorities)
            .filter( auth => auth.users._id.toString() === res.user._id.toString() )
            .map( auth => auth.actions )
            .flattenDeep()
            .uniq();

          return file;
        });

        return file;
      });

      if(export_excel){
        return files;
      }else{
        res.json({
          status: { success: true, total },
          body: files
        });
      }
    }
    catch (e) {
      let errors = {};
      switch (e.message) {
      case "q is empty":
        errors.q = "検索文字列が空のためファイル一覧の取得に失敗しました";
        break;
      case "page is not number":
        errors.page = "pageが数字ではないためファイル一覧の取得に失敗しました";
        break;
      case "sort is empty":
        errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
        break;
      default:
        errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, message: "ファイル一覧の取得に失敗しました", errors },
        body: []
      });
    }
  });
};

export const searchItems = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = res.user;

      if (tenant_id === undefined ||
          tenant_id === null ||
          tenant_id === "") throw new ValidationError( "tenant_id is empty" );

      let { meta_only } = req.query;

      if (meta_only === undefined ||
          meta_only === null ||
          meta_only === "") {
        meta_only = false;
      }

      if( !(
        meta_only === "true"
        || meta_only === "false"
        || meta_only === true
        || meta_only === false
      )) throw new ValidationError( "meta_only is not boolean" );

      const conditions = {
          tenant_id: mongoose.Types.ObjectId(tenant_id)
      };

      let items;

      if (meta_only === "true") {
        items = yield MetaInfo.find(conditions);
      } else {
        const metaInfos = (yield MetaInfo.find(conditions)).map( meta => {
          meta = meta.toObject();
          meta.meta_info_id = meta._id;
          return meta;
        });

        const displayItems = yield DisplayItem.find({
          ...conditions,
          // meta_info_id: null,
          name: { $nin: ["file_checkbox", "action"] }
        });

        items = displayItems.map(displayItem => {
          const idx = findIndex(metaInfos, {_id: displayItem.meta_info_id} ) ;
          if(idx>=0){
            const displayItemObject = displayItem.toObject();
            return {
              _id: metaInfos[idx]._id,
              tenant_id: metaInfos[idx].tenant_id,
              meta_info_id: metaInfos[idx].meta_info_id,
              label: metaInfos[idx].label,
              name: metaInfos[idx].name,
              value_type: metaInfos[idx].value_type,
              meta_info_id: metaInfos[idx].meta_info_id,
              is_display: displayItemObject.is_display,
              is_excel: displayItemObject.is_excel,
              is_search: displayItemObject.is_search,
              width: displayItemObject.width,
              order: displayItemObject.order,
              between: displayItemObject.between
            };
          }else{
            return displayItem;
          }
        });

      }

      res.json({
        status: { success: true, message: "正常に取得が完了" },
        body: items
      });
    }
    catch (e) {
      const errors = {};
      switch (e.message) {
        case "meta_only is not boolean":
          errors.meta_only = "指定したオプションが真偽値以外のため検索項目の取得に失敗しました";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }

      res.status(400).json({
        status: { success: false, message: "検索項目の取得に失敗しました", errors }
      });
    }
  });
};

export const searchDetail = (req, res, next, export_excel=false) => {
  const buildQuery = (item) => {
    return co(function*(){
      switch ( item.key_type ) {
        case "name":
          return ({
            [item.key_type]: {
              $regex: escapeRegExp( item.value )
            },
            is_display: true
          });
        case "modified_less":
          return ({
            modified: {
              $lt: new Date(item.value)
            },
            is_display: true
          });
        case "modified_greater":
          return ({
            modified: {
              $gt: new Date(item.value)
            },
            is_display: true
          });
        case "meta":
          return ({
            meta_info_id: mongoose.Types.ObjectId(item._id),
            value: createMetaSearchValue(item),
            // is_display: true
          });
        case "tag":
          return ({
            tags: mongoose.Types.ObjectId(item.value),
            is_display: true
          });
        case "favorite":
          return ({
            is_star: item.value,
            is_display: true
          });
        case "dir_route":
            const files = yield File.find({is_dir:true, name:{ $regex: escapeRegExp( item.value ) } }).select({ _id:1,name:1 });
            const ret = { dir_id: { $in : files.map(file => file._id ) } };
          return ret;
        default:
          return ({
            [item.key_type]: item.value,
            is_display: true
          });
        }
    });
  };

  const createMetaSearchValue = (item) =>{
    switch (item.value_type) {
      case "Date":
      return {
          $gte: moment( item.value.gt ).utc().format("YYYY-MM-DD 00:00:00") ,
          $lt: moment( item.value.lt ).add(1,"days").utc().format("YYYY-MM-DD 00:00:00")
        };
      case "String":
      default:
        return { $regex: escapeRegExp( item.value ) };
    }
  };

  return co(function* () {
    try {

      const params = req.body;
      if ( params.page === undefined || params.page === null ) page = 0;
      if ( params.page === "" || isNaN( parseInt(params.page) ) ) throw new ValidationError("page is not number");

      if ( typeof params.sort === "string" && !mongoose.Types.ObjectId.isValid(params.sort)  ) throw new ValidationError("sort is empty");
      if ( typeof params.order === "string" && params.order !== "asc" && params.order !== "desc" ) throw new ValidationError("sort is empty");

      const param_ids = Object.keys(params)
            .filter( p => !["page", "order", "sort"].includes(p) );

      const conditions = { _id: param_ids };

      const metaInfos = (yield MetaInfo.find(conditions)).map( meta => {
        meta = meta.toObject();
        meta.meta_info_id = meta._id;
        return meta;
      });

      const displayItems = (yield DisplayItem.find({
        ...conditions,
        meta_info_id: null,
        name: { $nin: ["file_checkbox", "action"] }
      })).map(items => items.toObject()) ;

      const items = metaInfos.concat(displayItems);

      const queries = items.map( meta => {
        const _meta = meta;
        _meta.value = params[meta._id];
        return _meta;
      });

      // ユーザで検索する場合 ユーザが閲覧できるファイルを取得
      let authorities = find(queries, {name:'authorities'});
      let authority_file_ids = [];
      if( authorities !== undefined ){
        const authorityUser = yield User.findById(authorities.value)  ;
        authority_file_ids = yield getAllowedFileIds(authorityUser._id, constants.PERMISSION_VIEW_LIST );
      }

      const base_items = queries.filter( q => ( q.meta_info_id === null && !(q.name === "authorities") ) ).map(q => {
        q.key_type = q.name;
        return q;
      });
      const meta_items = queries.filter( q => q.meta_info_id !== null ).map(q => {
        q.key_type = "meta";
        return q;
      });

      let base_queries;
      if(base_items[0] === undefined){
        base_queries = {};
      }else{
        const query = yield base_items.map( item =>{
        const query = buildQuery(item);
          return query;
        });
        base_queries = Object.assign(...query);
      }

      const meta_queries = meta_items[0] === undefined
            ? []
            : yield (meta_items.map(item => {
              const query  = buildQuery(item);
              return query;
            }));

      let file_metainfo_ids = [];

      if(meta_items.length > 0){
        // メタ情報検索条件に一致するfile_idを取得する
        for(const key in meta_queries){

          const fileMetainfoConditions = {
            meta_info_id: mongoose.Types.ObjectId(meta_queries[key].meta_info_id),
            value: meta_queries[key].value
          };
          const file_metainfo_id = (yield FileMetaInfo.find( fileMetainfoConditions )).map(metainfo => metainfo.file_id.toString() );

          if(file_metainfo_ids.length){
            // 既に取得済みのIDと今回取得したIDのうち共通するもののみ残す
            file_metainfo_ids = intersection(file_metainfo_ids, file_metainfo_id );
          }else{
            file_metainfo_ids = file_metainfo_id;
          }
        }
        // intersectionするために文字列にしたIDをObjectIdに戻す
        file_metainfo_ids = file_metainfo_ids.map(id => mongoose.Types.ObjectId(id));
      }

      const file_ids = authority_file_ids.concat(file_metainfo_ids);

      let query;
      if(file_ids.length > 0){
        query = { ...base_queries, ...{ _id: { "$in":file_ids } } };
      }else{
        query = base_queries;
      }

      const total = yield File.find(query).count();

      const limit = ( export_excel && total !== 0 ) ? total : constants.FILE_LIMITS_PER_PAGE;
      let { page } = req.body;
      if (!page) page = 0;
      const offset = page * limit;

      const { sort, order } = params;
      const _sort = yield createSortOption(sort, order);

      let files = {};
      let ret_files = {};
      if(Object.keys(query).length !== 0){
        // 権限チェックおよび検索条件作成段階で対象となるファイルがある場合のみ検索
        files = yield File.searchFiles(query,offset,limit,_sort, mongoose.Types.ObjectId(sort));

        ret_files = yield files.map( file => {
          const route = file.dirs
                  .filter( dir => dir.ancestor.is_display )
                  .map( dir => dir.ancestor.name );

          file.dir_route = route.length > 0
            ? route.reverse().join("/")
            : "";

          file.actions = chain(file.authorities)
            .filter( auth => auth.users._id.toString() === res.user._id.toString() )
            .map( auth => auth.actions )
            .flattenDeep()
            .uniq();

          return file;
        });
      }


      if(export_excel){
        return ret_files;
      }else{
        res.json({
          status: { success: true, total },
          body: ret_files
        });
      }
    }
    catch (e) {
      let errors = {};
      switch (e.message) {
        case "page is not number":
          errors.page = "pageが数字ではないためファイル一覧の取得に失敗しました";
          break;
        case "sort is empty":
          errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
          break;
        default:
          errors.unknown = e;
      }

      logger.error(errors);
      res.status(400).json({
        status: { success: false, message:"ファイル一覧の取得に失敗しました", errors }
      });

    }
  });
};

export const rename = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      const changedFileName = req.body.name;

      if (file_id === null ||
          file_id === undefined ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      if (changedFileName === null ||
          changedFileName === undefined ||
          changedFileName === "") throw "name is empty";

      if (changedFileName.match( new RegExp(constants.ILLIGAL_CHARACTERS.join("|")))) {
        throw "name is invalid";
      }

      const file = yield File.findById(file_id);
      if (file === null) throw "file is empty";
      file.name = changedFileName;
      const changedFile = yield file.save();

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = "file_id is empty";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイル名の変更に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイル名の変更に失敗しました";
        break;
      case "name is empty":
        errors.file_name = "ファイル名が空のためファイル名の変更に失敗しました";
        break;
      case "name is invalid":
        errors.file_name = "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイル名の変更に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: {
          success: false,
          message: "ファイル名の変更に失敗しました",
          errors
        }
      });
    }
  });
};

export const move = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;
      const { tenant_id }= res.user;
      const { trash_dir_id } = yield Tenant.findOne(tenant_id);

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      const dir_id = req.body.dir_id;

      if (dir_id === undefined ||
          dir_id === null ||
          dir_id === "") throw "dir_id is empty";

      if (! mongoose.Types.ObjectId.isValid(dir_id)) throw "dir_id is invalid";

      const user = yield User.findById(res.user._id);

      if (user === null) throw "user is empty";

      const isPermitted = yield checkFilePermission(file_id, user._id, constants.PERMISSION_MOVE);

      if( !isPermitted ) throw "permission denied";

      const [ file, dir ] = yield [ File.findById(file_id), File.findById(dir_id) ];

      if (file === null) throw "file is empty";
      if (dir === null) throw "dir is empty";

      let changedFile;
      if( file.is_dir ){
        if(file._id.toString() === dir._id.toString()) throw "target is the same as folder";

        const movedDirs = ( yield moveDir(file._id, dir._id, user, "移動") ).map(dir=>dir._id );
        // 移動フォルダ自身と子を取得
        const movedFiles = yield File.find({
          $or: [
            { _id: { $in: movedDirs }},
            { dir_id:{ $in: movedDirs }}
          ]
        });
        for(let i in movedFiles ){
          movedFiles[i].is_trash = dir._id.toString() === trash_dir_id;
          yield movedFiles[i].save();
          // フォルダ内のファイルについて elasticsearch index更新
          const updatedFile = yield File.searchFileOne({_id: movedFiles[i]._id });
          yield esClient.createIndex(tenant_id,[updatedFile]);
        }

      } else {
        file.is_trash = dir._id.toString() === trash_dir_id;
        changedFile = yield moveFile(file, dir._id, user, "移動");
      }
      // elasticsearch index作成
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: changedFile
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = "";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイルの移動に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイルの移動に失敗しました";
        break;
      case "dir_id is empty":
        errors.dir_id = "フォルダIDが空のためファイルの移動に失敗しました";
        break;
      case "dir_id is invalid":
        errors.dir_id = "フォルダIDが不正のためファイルの移動に失敗しました";
        break;
      case "dir is empty":
        errors.dir_id = "指定されたフォルダが存在しないためファイルの移動に失敗しました";
        break;
      case "target is the same as folder":
        errors.dir_id = "移動対象のフォルダと指定されたフォルダが同じため移動に失敗しました";
        break;
      case "permission denied":
        errors.file_id = "指定されたファイルを移動する権限がないため移動に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ファイルの移動に失敗しました",
          errors
        }
      });
    }
  });
};

export const upload = (req, res, next) => {
  co(function* () {
    try {
      const myFiles  = req.body.files;
      let dir_id = req.body.dir_id;
      const tenant_id  = res.user.tenant_id.toString();

      if (myFiles === null ||
          myFiles === undefined ||
          myFiles === "" ||
          myFiles.length === 0) throw "files is empty";

      if (dir_id === null ||
          dir_id === undefined ||
          dir_id === "" ||
          dir_id === "undefined") {

        dir_id = res.user.tenant.home_dir_id; // デフォルトはテナントのホーム
      }

      const dir = yield File.findById(dir_id);

      if (dir === null) throw "dir is not found";

      const user = yield User.findById(res.user._id);

      if (user === null) throw "user is not found";

      const isPermitted = yield checkFilePermission(dir_id, user._id, constants.PERMISSION_UPLOAD );
      if(isPermitted === false ) throw "permission denied";

      // ファイルの基本情報
      // Modelで定義されていないプロパティを使いたいので
      // オブジェクトで作成し、後でModelObjectに一括変換する
      let files = myFiles.map( _file => {
        const file = {
          hasError: false,  // エラーフラグ
          errors: {}        // エラー情報
        };

        if (_file.name === null || _file.name === undefined ||
            _file.name === "" || _file.name === "undefined") {
          file.hasError = true;
          file.errors = { name: "ファイル名が空のためファイルのアップロードに失敗しました" };
          return file;
        }

        if (_file.name.match( new RegExp(constants.ILLIGAL_CHARACTERS.join("|")))) {
          file.hasError = true;
          file.errors = { name: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました" };
          return file;
        }

        if (_file.mime_type === null || _file.mime_type === undefined ||
            _file.mime_type === "" || _file.mime_type === "undefined") {
          file.hasError = true;
          file.errors = { mime_type: "mime_typeが空のためファイルのアップロードに失敗しました" };
          return file;
        }

        if (_file.size === null || _file.size === undefined ||
            _file.size === "" || _file.size === "undefined") {
          file.hasError = true;
          file.errors = { size: "size is empty" };
          return file;
        }

        if (_file.base64 === null || _file.base64 === undefined ||
            _file.base64 === "" || _file.base64 === "undefined") {
          file.hasError = true;
          file.errors = { base64: "base64が空のためファイルのアップロードに失敗しました" };
          return file;
        }

        if (_file.base64.match(/;base64,(.*)$/) === null) {
          file.hasError = true;
          file.errors = { base64: "base64が不正のためファイルのアップロードに失敗しました" };
          return file;
        }

        if (_file.checksum === null || _file.checksum === undefined ||
            _file.checksum === "" ) {
          file.hasError = true;
          file.errors = { checksum: "checksumが空のためファイルのアップロードに失敗しました" };
          return file;
        }

        file.name = _file.name;
        file.mime_type = _file.mime_type;
        file.size = _file.size;
        file.modified = moment().format("YYYY-MM-DD HH:mm:ss");
        file.is_dir = false;
        file.dir_id = dir_id;
        file.is_display = true;
        file.is_star = false;
        file.tags = _file.tags;
        file.is_crypted = constants.USE_CRYPTO;
        file.meta_infos = _file.meta_infos;
        file.base64 = _file.base64;
        file.checksum = _file.checksum;
        file.authorities = _file.authorities;

        return file;
      });

      // checksumを比較
      files = files.map( file => {
        if (file.hasError) return file;

        const hexdigest = crypto.createHash("md5")
              .update(new Buffer(file.base64))
              .digest("hex");

        if (file.checksum === hexdigest) {
          return file;
        } else {
          return {
            ...file,
            hasError: true,
            errors: {
              checksum: "checksumが不正のためファイルのアップロードに失敗しました"
            }
          };
        }

      });

      // postされたメタ情報の_idがマスタに存在するかのチェック用
      const metainfos = yield MetaInfo.find({ tenant_id: res.user.tenant_id });

      // メタ情報のチェック
      files = files.map( file => {
        if (file.hasError) return file;

        if (file.meta_infos === undefined ||
            file.meta_infos.length === 0) return file;

        // 値の空チェック
        const valueCheck = file.meta_infos.filter( meta => (
          meta.value === undefined || meta.value === null ||
          meta.value === "" || meta.value === "undefined"
        ));

        if (valueCheck.length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              meta_info_value: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
            }
          };
        }

        // idのnullチェック
        const idIsEmpty = file.meta_infos.filter( meta => (
          meta._id === undefined || meta._id === null ||
          meta._id === "" || meta._id === "undefined"
        ));

        if (idIsEmpty.length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              meta_info_id: "メタ情報IDが空のためファイルのアップロードに失敗しました"
            }
          };
        }

        const idIsInvalid = file.meta_infos.filter( meta => (
          ! mongoose.Types.ObjectId.isValid(meta._id)
        ));

        if (idIsInvalid.length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              meta_info_id: "メタ情報IDが不正のためファイルのアップロードに失敗しました"
            }
          };
        }

        // メタ情報idが存在するかのチェック
        const intersec = intersection(
          file.meta_infos.map( meta => meta._id),
          metainfos.map( meta => meta._id.toString() )
        );

        if (file.meta_infos.length !== intersec.length) {
          return {
            ...file,
            hasError: true,
            errors: {
              meta_info_id: "指定されたメタ情報が存在しないためファイルのアップロードに失敗しました"
            }
          };
        }

        // 日付型チェック
        const date_is_invalid = file.meta_infos.filter( meta => {
          const _meta = metainfos.filter( m => m._id.toString() === meta._id )[0];

          if (_meta.value_type === "Date") {
            return ! moment(meta.value).isValid();
          }
          else {
            return false;
          }
        });

        if (date_is_invalid.length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              meta_info_value: "指定されたメタ情報の値が日付型ではないためファイルのアップロードに失敗しました"
            }
          };
        }

        return file;
      });

      // タグがマスタに存在するかのチェック
      const tags = (yield Tag.find({ tenant_id: res.user.tenant_id }))
            .map( tag => tag._id.toString() );

      files = files.map( file => {
        if (file.hasError) return file;
        if (file.tags === undefined || file.tags === null ||
            file.tags === "" || file.tags.length === 0) {
          return file;
        }

        const tagIsEmpty = file.tags.filter( tag => (
          tag === undefined || tag === null || tag === ""
        ));

        if (tagIsEmpty.length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              tag_id: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
            }
          };
        }

        if (uniq(file.tags).length === intersection(file.tags, tags).length) {
          // stringからBSONに変換
          file.tags = file.tags.map( tag => mongoose.Types.ObjectId(tag) );
          return file;
        } else {
          return {
            ...file,
            hasError: true,
            errors: {
              tag_id: "タグIDが不正のためファイルのアップロードに失敗しました"
            }
          };
        }
      });

      // ロール、ユーザ、グループがマスタに存在するかのチェック
      const role_files = (yield RoleFile.find({ tenant_id: res.user.tenant_id }))
            .map( role => role._id.toString() );

      const users = (yield User.find({ tenant_id: res.user.tenant_id }))
            .map( user => user._id.toString() );

      const groups = (yield Group.find({ tenant_id: res.user.tenant_id }))
            .map( group => group._id.toString() );

      files = files.map( file => {
        if (file.hasError) return file;

        if (file.authorities === undefined || file.authorities === null ||
            file.authorities === "" || file.authorities.length === 0) {

          file.authorities = [];
          return file;
        }

        const roleIds = file.authorities.map( auth => auth.role_files );

        if (roleIds.filter( id => id === undefined || id === null || id === "").length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_file_id: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
            }
          };
        }

        if (roleIds.filter( id => ! mongoose.Types.ObjectId.isValid(id) ).length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_file_id: "指定されたロールIDが不正のためファイルのアップロードに失敗しました"
            }
          };
        }

        if (uniq(roleIds).length !== intersection(roleIds, role_files).length) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_file_id: "指定されたロールが存在しないためファイルのアップロードに失敗しました"
            }
          };
        }

        const userIds = file.authorities.map( auth => auth.users );

        if (userIds.filter( id => id === undefined || id === null || id === "").length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_user_id: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
            }
          };
        }

        if (userIds.filter( id => ! mongoose.Types.ObjectId.isValid(id) ).length > 0) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_user_id: "指定されたユーザIDが不正のためファイルのアップロードに失敗しました"
            }
          };
        }

        if (userIds.length !== intersection(userIds, users).length) {
          return {
            ...file,
            hasError: true,
            errors: {
              role_user_id: "指定されたユーザが存在しないためファイルのアップロードに失敗しました"
            }
          };
        }

        return file;
      });

      // 履歴
      files = files.map( file => {
        if (file.hasError) return file;

        const histories = [{
          modified: moment().format("YYYY-MM-DD hh:mm:ss"),
          user: user,
          action: "新規作成",
          body: ""
        }];

        file.histories = histories;
        return file;
      });

      // ファイルオブジェクト作成
      let fileModels = files.map( file => (
        file.hasError ? false : new File(file)
      ));

      // swift
      const swift = new Swift();
      const zipFiles = zipWith(files, fileModels, (file, model) => ({ file: file, model: model }));

      for ( let i = 0; i < zipFiles.length; i++ ) {
        const { file, model } = zipFiles[i];

        if (file.hasError) continue;

        const regex = /;base64,(.*)$/;
        const matches = file.base64.match(regex);
        const data = matches[1];
        const tenant_name = res.user.tenant.name;

        try {
          yield swift.upload(tenant_name, new Buffer(data, 'base64'), model._id.toString());
        } catch (e) {
          logger.info(e);
          fileModels[i] = false;
          files[i] = {
            ...files[i],
            hasError: true,
            errors: {
              data: "ファイル本体の保存に失敗しました"
            }
          };
        }
      }

      // 権限
      const role = yield RoleFile.findOne({
        tenant_id: mongoose.Types.ObjectId(res.user.tenant_id),
        name: "フルコントロール" // @fixme
      });

      const authorityFiles = zipWith(files, fileModels, (file, model) => {
        if (file.hasError) return false;

        const authorityFile = new AuthorityFile();
        authorityFile.users = user._id;
        authorityFile.files = model;
        authorityFile.role_files = role._id;

        if (file.authorities.length === 0) return [ authorityFile ];

        const authorityFiles = file.authorities.map( auth => {
          const authorityFile = new AuthorityFile();
          authorityFile.users = mongoose.Types.ObjectId(auth.users);
          authorityFile.files = model;
          authorityFile.role_files = mongoose.Types.ObjectId(auth.role_files);
          return authorityFile;
        });

        return authorityFiles.concat(authorityFile);
      });

      // メタ情報
      const fileMetaInfos = zipWith(files, fileModels, (file, model) => {
        if (file.hasError) return false;
        if (file.meta_infos === undefined ||
            file.meta_infos === null ||
            file.meta_infos.length === 0) return false;

        return file.meta_infos.map( meta => (
          new FileMetaInfo({
            file_id: model._id,
            meta_info_id: meta._id,
            value: meta.value
          })
        ));
      });

      // mongoへの保存開始
      let changedFiles = [];

      for ( let i = 0; i < fileModels.length; i++ ) {

        // ファイル本体(files)の保存
        if (! fileModels[i]) continue;

        const saveFileModel = yield fileModels[i].save();
        changedFiles.push(saveFileModel);

        if (! saveFileModel) {
          files[i] = {
            ...files[i],
            hasError: true,
            errors: {
              body: "基本情報の書き込みに失敗しました"
            }
          };
          continue;  // 保存に失敗した場合、メタ情報や権限の書き込みは行わない
        }

        // メタ情報の保存
        if (fileMetaInfos[i].length > 0) {
          for ( let j = 0; j < fileMetaInfos[i].length; j++ ) {
            if (fileMetaInfos[i][j]) {
              const saveFileMetaInfo = yield fileMetaInfos[i][j].save();
              if (! saveFileMetaInfo) {

                files[i] = {
                  ...files[i],
                  hasError: true,
                  errors: {
                    meta_infos: "メタ情報の書き込みに失敗しました"
                  }
                };
              }
            }
          }
        }

        // 権限の保存
        if (authorityFiles[i].length > 0) {
          for ( let j = 0; j < authorityFiles[i].length; j++ ) {
            const saveAuthorityFile = yield authorityFiles[i][j].save();
            if (! saveAuthorityFile) {
              files[i] = {
                ...files[i],
                hasError: true,
                errors: {
                  authority_files: "権限の書き込みに失敗しました"
                }
              };
            }
          }
        }
      }

      // elasticsearchへ登録
      let returnfiles;

      if (changedFiles.length > 0) {
        const changedFileIds = changedFiles.map(file => file._id);
        const sortOption = yield createSortOption();
        const indexingFile = yield File.searchFiles({ _id: { $in:changedFileIds } },0,changedFileIds.length, sortOption );
        yield esClient.createIndex(tenant_id, indexingFile);

        returnfiles = indexingFile.map( file => {
          file.actions = extractFileActions(file.authorities, res.user);
          return file;
        });
      }

      // validationErrors
      if (files.filter( f => f.hasError ).length > 0) {
        const _errors = files.map( f => {
          if (f.hasError === false) return {};
          return f.errors;
        });

        logger.error(_errors);
        res.status(400).json({
          status: {
            success: false,
            message: "ファイルのアップロードに失敗しました",
            errors: _errors
          }
        });
      } else {
        res.json({
          status: { success: true },
          body: returnfiles
        });
      }
    }
    catch (e) {
      let errors = {};
      logger.error(e);

      switch(e) {
      case "files is empty":
        errors.files = "アップロード対象のファイルが空のためファイルのアップロードに失敗しました";
        break;
      case "dir_id is empty":
        errors.dir_id = "フォルダIDが空のためファイルのアップロードに失敗しました";
        break;
      case "permission denied":
        errors.dir_id = "フォルダにアップロード権限が無いためファイルのアップロードに失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      res.status(400).json({
        status: {
          success: false,
          message: "ファイルのアップロードに失敗しました",
          errors
        }
      });
    }
  });
};

export const addTag = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;
      const tag_id = req.body._id;
      if (file_id === null ||
          file_id === undefined ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      if (tag_id === null ||
          tag_id === undefined ||
          tag_id === "") throw "tag_id is empty";

      if (! mongoose.Types.ObjectId.isValid(tag_id)) throw "tag_id is invalid";

      const [ file, tag ] = yield [ File.findById(file_id), Tag.findById(tag_id)];

      if (file === null) throw "file is empty";
      if (tag === null) throw "tag is empty";

      file.tags = [ ...file.tags, tag._id ];
      const changedFile = yield file.save();

      const tags = yield Tag.find({ _id: { $in: file.tags } });

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: { ...file.toObject(), tags }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためタグの追加に失敗しました";
        break;
      case "tag_id is empty":
        errors.tag_id = e;
        break;
      case "tag_id is invalid":
        errors.tag_id = "タグIDが不正のためタグの追加に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためタグの追加に失敗しました";
        break;
      case "tag is empty":
        errors.tag_id = "指定されたタグが存在しないためタグの追加に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "タグの追加に失敗しました",
          errors
        }
      });
    }
  });
};

export const removeTag = (req, res, next) => {
  co(function* () {
    try {
      const { file_id, tag_id } = req.params;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      if (tag_id === undefined ||
          tag_id === null ||
          tag_id === "") throw "tag_id is empty";

      if (! mongoose.Types.ObjectId.isValid(tag_id)) throw "tag_id is invalid";

      const [ file, tag ] = yield [ File.findById(file_id), Tag.findById(tag_id) ];

      if (file === null) throw "file is empty";
      if (tag === null) throw "tag is empty";

      file.tags = file.tags.filter( file_tag => file_tag.toString() !== tag.id );
      const changedFile = yield file.save();

      const tags = yield Tag.find({ _id: { $in: file.tags } });

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: { ...file.toObject(), tags }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためタグの削除に失敗しました";
        break;
      case "tag_id is empty":
        errors.tag_id = e;
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためタグの削除に失敗しました";
        break;
      case "tag is empty":
        errors.tag_id = "指定されたタグが存在しないためタグの削除に失敗しました";
        break;
      case "tag_id is invalid":
        errors.tag_id = "タグIDが不正のためタグの削除に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "タグの削除に失敗しました",
          errors
        }
      });
    }
  });
};

export const addMeta = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      const { tenant_id } = res.user;

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      const { meta, value } = req.body;

      if (meta._id === undefined || meta._id === null || meta._id === "") throw "metainfo_id is empty";

      if (! mongoose.Types.ObjectId.isValid(meta._id)) throw "metainfo_id is invalid";

      if (value === undefined ||
          value === null ||
          value === "") throw "metainfo value is empty";

      const [ file, metaInfo ] = yield [
        File.findById(file_id),
        MetaInfo.findById(meta._id)
      ];

      if (file === null) throw "file is empty";
      if (metaInfo === null) throw "metainfo is empty";

      const registMetaInfo = yield FileMetaInfo.findOne({
        file_id: file_id,
        meta_info_id: meta._id
      });

      let changedMeta;

      // 既に登録されている場合
      if (registMetaInfo) {
        registMetaInfo.value = value;
        changedMeta = yield registMetaInfo.save();
      } else {
        const addMeta = new FileMetaInfo({
          file_id, meta_info_id: metaInfo._id, value
        });

        changedMeta = yield addMeta.save();
      }

      // elasticsearch index作成
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);


      res.json({
        status: { success: true },
        body: changedMeta
      });

    }
    catch (e) {
      let errors = {};
      switch(e) {
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためメタ情報の追加に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためメタ情報の追加に失敗しました";
        break;
      case "metainfo_id is empty":
        errors.metainfo_id = "メタ情報IDが空のためメタ情報の追加に失敗しました";
        break;
      case "metainfo_id is invalid":
        errors.metainfo_id = "メタ情報IDが不正のためメタ情報の追加に失敗しました";
        break;
      case "metainfo is empty":
        errors.metainfo_id = "指定されたメタ情報が存在しないためメタ情報の追加に失敗しました";
        break;
      case "metainfo value is empty":
        errors.metainfo_value = "メタ情報の値が空のためメタ情報の追加に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の追加に失敗しました",
          errors
        }
      });
    }
  });
};

export const removeMeta = (req, res, next) => {
  co(function* () {
    try {
      const { file_id, meta_id } = req.params;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      if (meta_id === undefined ||
          meta_id === null ||
          meta_id === "") throw "meta_id is empty";

      if (! mongoose.Types.ObjectId.isValid(meta_id)) throw "meta_id is invalid";

      const [ file, metaInfo ] = yield [
        File.findById(file_id),
        MetaInfo.findById(meta_id)
      ];

      if (file === null) throw "file is empty";
      if (metaInfo === null) throw "metaInfo is empty";

      const removeMeta = yield FileMetaInfo.findOne({
        file_id: mongoose.Types.ObjectId(file_id),
        meta_info_id: mongoose.Types.ObjectId(meta_id)
      });

      if (removeMeta) {
        removeMeta.remove();
      } else {
        throw "meta_id is not registered";
      }

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: removeMeta
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = "ファイルIDが空のためメタ情報の削除に失敗しました";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためメタ情報の削除に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためメタ情報の削除に失敗しました";
        break;
      case "meta_id is empty":
        errors.meta_id = e;
        break;
      case "meta_id is invalid":
        errors.meta_id = "メタ情報IDが不正のためメタ情報の削除に失敗しました";
        break;
      case "metaInfo is empty":
        errors.meta_id = "指定されたメタ情報が存在しないためメタ情報の削除に失敗しました";
        break;
      case "meta_id is not registered":
        errors.meta_id = "指定されたメタ情報IDがファイルに存在しないためメタ情報の削除に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の削除に失敗しました",
          errors
        }
      });
    }
  });
};

export const toggleStar = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      const file = yield File.findById(file_id);

      if (file === null) throw "file is empty";

      file.is_star = !file.is_star;
      const changedFile = yield file.save();

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = "ファイルIDが空のためファイルのお気に入りの設定に失敗しました";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイルのお気に入りの設定に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイルのお気に入りの設定に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ファイルのお気に入りの設定に失敗しました",
          errors
        }
      });

    }
  });
};

export const addAuthority = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      const { user, role } = req.body;
      const { tenant_id } = res.user;

      if(file_id === undefined || file_id === null || file_id === "") throw "file_id is empty";

      if (! mongoose.Types.ObjectId.isValid(file_id)) throw "file_id is invalid";

      const file = yield File.findById(file_id);
      if (file === null) throw "file is empty";

      const _role = yield RoleFile.findById(role._id);
      if (_role === null) throw "role is empty";

      if (! mongoose.Types.ObjectId.isValid(user._id)) throw "user_id is invalid";

      if (user.type === undefined || user.type === null || user.type === "") throw new ValidationError( "user.type is empty" );

      const authority = new AuthorityFile();

      if(user.type === 'user'){
        const _user = yield User.findById(user._id);
        if (_user === null) throw "user is empty";

        authority.files = file;
        authority.users = _user;
        authority.role_files = _role;
      }else{
        const _group = yield Group.findById(user._id);
        if (_group === null) throw new RecordNotFoundException("group is empty");

        authority.files = file;
        authority.groups = _group;
        authority.role_files = _role;
      }

      const duplicated = yield AuthorityFile.findOne({
        files: authority.files,
        users: authority.users,
        role_files: authority.role_files
      });

      if (duplicated !== null) throw "role set is duplicate";

      const createdAuthority = yield authority.save();

      // elasticsearch index作成
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: createdAuthority
      });

    }
    catch (e) {
      const errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = "ファイルIDが空のためファイルへの権限の追加に失敗しました";
        break;
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイルへの権限の追加に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイルへの権限の追加に失敗しました";
        break;
      case "user is empty":
        errors.user_id = "指定されたユーザが存在しないためファイルへの権限の追加に失敗しました";
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためファイルへの権限の追加に失敗しました";
        break;
      case "role is empty":
        errors.role_file_id = "指定された権限が存在しないためファイルへの権限の追加に失敗しました";
        break;
      case "user.type is empty":
        errors.user = "ユーザの種類が不明です";
        break;
      case "group is empty":
        errors.group = "追加対象のユーザが見つかりません";
        break;
      case "role set is duplicate":
        errors.role_set = "指定されたユーザ、権限は既に登録されているためファイルへの権限の追加に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false, message: "ファイルへの権限の追加に失敗しました", errors }
      });
    }
  });
};

export const removeAuthority = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      const { user_id, role_id } = req.query;

      if (! mongoose.Types.ObjectId.isValid(file_id) ) throw "file_id is invalid";

      if (user_id === undefined ||
          user_id === null ||
          user_id === "") throw "user_id is empty";

      if (role_id === undefined ||
          role_id === null ||
          role_id === "") throw "role_id is empty";

      if (! mongoose.Types.ObjectId.isValid(user_id) ) throw "user_id is invalid";
      if (! mongoose.Types.ObjectId.isValid(role_id) ) throw "role_id is invalid";

      const file = yield File.findById(file_id);
      if (file === null) throw "file is empty";

      const role_user = yield User.findById(user_id);
      if (role_user === null) throw "user is empty";

      const role_file = yield RoleFile.findById(role_id);
      if (role_file === null) throw "role is empty";

      if (role_user.type === undefined ||
          role_user.type === null ||
          role_user.type === "") throw "user.type is empty";

      const authority = AuthorityFile.findOne({
        role_files: role_file._id,
        users: role_user._id,
        files: file._id
      });

      if (authority === null) throw "authority is empty";

      const removeResult = yield authority.remove();

      if (removeResult.result.ok !== 1) throw "remove authority is failed";

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: { role_files: role_file, users: role_user, files: file }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is invalid":
        errors.file_id = "ファイルIDが不正のためファイルへの権限の削除に失敗しました";
        break;
      case "user_id is empty":
        errors.user_id = "ユーザIDが空のためファイルへの権限の削除に失敗しました";
        break;
      case "role_id is empty":
        errors.role_id = "ファイル権限IDが空のためファイルへの権限の削除に失敗しました";
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためファイルへの権限の削除に失敗しました";
        break;
      case "role_id is invalid":
        errors.role_id = "ファイル権限IDが不正のためファイルへの権限の削除に失敗しました";
        break;
      case "file is empty":
        errors.file_id = "指定されたファイルが存在しないためファイルへの権限の削除に失敗しました";
        break;
      case "user is empty":
        errors.user_id = "指定されたユーザが存在しないためファイルへの権限の削除に失敗しました";
        break;
      case "role is empty":
        errors.role_id = "指定されたファイル権限が存在しないためファイルへの権限の削除に失敗しました";
        break;
      case "user.type is empty":
        errors.user_type = "ユーザ種別が空のためファイルへの権限の削除に失敗しました";
        break;
      case "authority is empty":
        errors.role = "指定された権限セットが存在しないためファイルへの権限の削除に失敗しました";
        break;
      case "remove authority is failed":
        errors.remove = "原因不明のエラーで権限の削除に失敗しました";
        errors.unknown = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ファイルへの権限の削除に失敗しました", errors }
      });
    }
  });
};

export const moveTrash = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;

      const { tenant_id } = res.user;
      const { trash_dir_id } = yield Tenant.findOne(tenant_id);

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      const user = yield User.findById(res.user._id);
      const file = yield File.findById(file_id);

      if (file === null) throw "file is empty";
      if (user === null) throw "user is empty";

      let changedFile;
      if( file.is_dir ){
        const changedFiles = yield moveDir(file._id, trash_dir_id, user, "削除");
        changedFile = changedFiles[0];  // response用。指定されたフォルダを返す
        const movedDirs = changedFiles.map(dir=>dir._id );
        const movedFiles = yield File.find({
          $or: [
            { _id: { $in: movedDirs }},
            { dir_id:{ $in: movedDirs }}
          ]
        });
        for(let i in movedFiles ){
          movedFiles[i].is_trash = true;
          yield movedFiles[i].save();
          // フォルダ内のファイルについて elasticsearch index更新
          const updatedFile = yield File.searchFileOne({_id: movedFiles[i]._id });
          yield esClient.createIndex(tenant_id,[updatedFile]);
        }

      } else {
        file.is_trash = true;
        changedFile = yield moveFile(file, trash_dir_id, user, "削除");
      }

      // 選択したファイルについて elasticsearchのindex更新
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: changedFile
      });
    } catch (e) {
      const errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = "削除対象のファイルが見つかりません";
        break;
      case "file is empty":
        errors.file = "削除対象のファイルが見つかりません";
        break;
      case "user is empty":
      errors.user = "実行ユーザーが見つかりません";
      break;
      case "file is dir":
        errors.file = "削除対象がフォルダです";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });

    }
  });
};

export const restore = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      const user = yield User.findById(res.user._id);
      const file = yield File.findById(file_id);
      const { dir_id } = file.histories[file.histories.length - 1].body;

      if (file === null) throw "file is empty";
      if (user === null) throw "user is empty";
      if (dir_id === null || dir_id === undefined || dir_id === "" ) throw "dir_id is empty";

      const changedFile = yield moveFile(file, dir_id, user, "復元");

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });

      yield esClient.createIndex(tenant_id,[updatedFile]);
      res.json({
        status: { success: true },
        body: changedFile
      });

    } catch (e) {
      const errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = "対象のファイルが見つかりません";
        break;
      case "file is empty":
        errors.file = "対象のファイルが見つかりません";
        break;
      case "user is empty":
        errors.user = "実行ユーザーが見つかりません";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });

    }
  });
};

export const deleteFileLogical = (req,res,next) => {
  co(function* (){
    try {
      const file_id = req.params.file_id;

      if (file_id === undefined ||
        file_id === null ||
        file_id === "") throw "file_id is empty";

      const user = yield User.findById(res.user._id);
      const file = yield File.findById(file_id);

      const history = {
        modified: moment().format("YYYY-MM-DD hh:mm:ss"),
        user: user,
        action: "完全削除",
        body: {
          _id: file._id,
          is_star: file.is_star,
          is_display: file.is_display,
          dir_id: file.dir_id,
          is_dir: file.is_dir,
          size: file.size,
          mime_type: file.mime_type,
          blob_path: file.blob_path,
          name: file.name,
          meta_infos: file.meta_infos,
          tags: file.tags,
          is_deleted: file.is_deleted,
          modified: file.modified,
          __v: file.__v
        }
      };
      file.histories = file.histories.concat(history);

      file.is_deleted = true;
      const deletedFile = yield file.save();

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(file_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: deletedFile
      });

    } catch (e) {
      const errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = "対象のファイルが見つかりません";
        break;
      case "file is empty":
        errors.file = "対象のファイルが見つかりません";
        break;
      case "user is empty":
        errors.user = "実行ユーザーが見つかりません";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });

    }
  });


};

export const deleteFilePhysical = (req,res,next) => {
  co(function* (){
    try {
      // is_delete === true のみ対象ファイル
      // swiftコンテナから削除
      // mongoから削除
      const swift = new Swift();

      const file_id = req.params.file_id;

      const fileRecord = yield File.findById(file_id);
      if (fileRecord === null) throw "file not found";
      if (fileRecord.is_deleted !== true) throw "file is not deleted";

      const tenant_name = res.user.tenant.name;
      const readStream = yield swift.remove(tenant_name, fileRecord);

      const deletedFile = yield fileRecord.remove();

      const deletedAutholity = yield AuthorityFile.remove({files: fileRecord._id });

      // elasticsearch index削除
      const { tenant_id }= res.user;
      yield esClient.delete({ index:tenant_id, type:"files", id:file_id });

      res.json({
        status:{ success: true },
        body: deletedFile
      });

    } catch (e) {
      const errors = {};
      errors.unknown = e;
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const previewExists = (req, res, next) => {
  co(function* (){
    try {
      // プレビュー画像の存在チェック
      const { file_id } = req.params;

      if (file_id === undefined ||
        file_id === null ||
        file_id === "") throw "file_id is empty";

      const file = yield File.findById(file_id);

      if(file.size > constants.MAX_CREATE_PREVIEW_FILE_SIZE) throw "file size is too large";

      let { preview_id } = file;

      let preview;
      if(preview_id === null || preview_id === undefined || preview_id === ""){
        preview = new Preview();
      }else{
        preview = yield Preview.findById(preview_id);
      }

      if(preview.image === undefined && preview.creating === false){
        const tmpDirPath = path.join(__dirname,'../../tmp');
        const tmpFileName = path.join(tmpDirPath,file.name);

        fs.mkdir(tmpDirPath, (err)=>{
          if(err && err.code !== "EEXIST") logger.info(err);
        });

        const tenant_name = res.user.tenant.name;
        const swift = new Swift();
        const downloadFile = yield swift.exportFile(tenant_name, file, tmpFileName);

        let command = '';

        switch(file.mime_type){
          case "text/csv":
          case "text/plain":
            // csv,txtファイルはnkfでUTF8に変換後,PDFを経てpng形式に変換する
            command = `cd ${tmpDirPath} && nkf -w "${file.name}" > buf.txt && ${constants.LIBRE_OFFICE_PATH()} --headless --nologo --nofirststartwizard --convert-to pdf buf.txt && convert -background white -alpha remove -density ${constants.CONVERT_DPI} -antialias -format png buf.pdf[0] "${file.name}.png" && rm "${file.name}" buf.*`;
            break;
          case "application/msword":
          case "application/vnd.ms-excel":
          case "application/vnd.ms-powerpoint":
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.template":
          case "application/vnd.openxmlformats-officedocument.presentationml.template":
          const pdfFileName = path.extname(file.name) === ""
            ? file.name + ".pdf"
            : file.name.replace(path.extname(file.name),".pdf" );

            command = `cd ${tmpDirPath} && ${constants.LIBRE_OFFICE_PATH()} --headless --nologo --nofirststartwizard --convert-to pdf "${file.name}" && convert -background white -alpha remove -density ${constants.CONVERT_DPI} -antialias -format png "${pdfFileName}[0]" "${file.name}.png" && rm "${file.name}" "${pdfFileName}"`;
          break;
          case "application/pdf":
            command = `cd ${tmpDirPath} && convert -background white -alpha remove -density ${constants.CONVERT_DPI} -antialias -format png "${file.name}[0]" "${file.name}.png" && rm "${file.name}"`;
            break;
          case "image/jpeg":
          case "image/png":
          case "image/gif":
          case "image/tiff":
            command = `cd ${tmpDirPath} && convert -density ${constants.CONVERT_DPI} -antialias -format png "${file.name}" -resize 1024x\\> "${file.name}.png" && rm "${file.name}"`;
            break;
          default:
            throw "this mime_type is not supported yet";
            break;
        }

        if(command !== ""){
          preview.creating = true;
          // 大きいファイルの場合、タイムアウトするので一度idだけ登録してコマンドの再実行を防止する
          yield preview.save();
          file.preview_id = preview._id;
          const changedFile = yield file.save();

          try {
            const execResult = yield _exec(command);
            preview.image = fs.readFileSync(`${tmpFileName}.png`);
          }catch(error){
            throw error;
          }finally{
            preview.creating = false;
            const previewImage = yield preview.save();
          }
          preview_id = file.preview_id;
          fs.unlink(path.join(`${tmpFileName}.png`));
        }
      }else{
        if(preview.image === undefined) preview_id = null;
      }


      res.json({
        status:{ success: true },
        body: {
          preview_id: preview_id
        }
      });


    } catch (e) {
      logger.error(e);
      const errors = {};
      switch(e){
        case "this mime_type is not supported yet":
          errors.mime_type = "このファイルはプレビュー画像を表示できません";
          break;
        case "file size is too large":
          errors.file_size = "このファイルはプレビュー画像を表示できません";
          break;
        default:
          errors.unknown = e;
          break;
      }
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const exists = (req, res, next) => {
  co(function* () {
    try {
      const { dir_id, files } = req.body;

      if (dir_id === null ||
          dir_id === undefined ||
          dir_id === "") throw new ValidationError("dir_idが空です");

      if (files === null ||
          files === undefined ||
          files === "" ||
          files.length === 0) {
        // validationErrorではなく空で返却するのが正解？
        res.json({ status: { success: true }, body: [] });
      }

      const fileNames = reject( files.map( f => f.name ), name => (
        name === undefined || name === null ||
        name === "" || name === "undefined"
      ));

      if (files.length !== fileNames.length) {
        throw new ValidationError("ファイル名に空のものが存在します");
      }

      const records = yield files.map( file => (
        File.findOne({
          dir_id: mongoose.Types.ObjectId(dir_id),
          name: file.name
        })
      ));

      const exists = zipWith(records, files, (record, file) => {
        if (record === null) {
          return {
            name: file.name,
            is_exists: false
          };
        }
        else {
          return {
            name: record.name,
            is_exists: true
          };
        }
      });

      res.json({
        status: { success: true },
        body: exists
      });

    }
    catch (e) {
      let errors;

      if (e.name === "Error") {
        errors = commons.errorParser(e);
      } else {
        errors = e;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

// ここからプライベート的なメソッド
const _exec = command => {
  return new Promise((resolve, reject)=>{
    exec(command, (err,stdout,stderr) => {
      if(err) return reject({ err, stderr });
      return resolve(true);
    });
  });
};

const moveFile = (file, dir_id, user, action) => {
    if(file.is_dir) throw "file is dir";

    const history = {
      modified: moment().format("YYYY-MM-DD hh:mm:ss"),
      user: user,
      action: action,
      body: {
        _id: file._id,
        is_star: file.is_star,
        is_display: file.is_display,
        dir_id: file.dir_id,
        is_dir: file.is_dir,
        size: file.size,
        mime_type: file.mime_type,
        blob_path: file.blob_path,
        name: file.name,
        meta_infos: file.meta_infos,
        tags: file.tags,
        is_deleted: file.is_deleted,
        modified: file.modified,
        __v: file.__v
      }
    };

    file.histories = file.histories.concat(history);

    file.dir_id = dir_id;

    const changedFile = file.save();

    return changedFile;

};

const createSortOption = co.wrap( function* (_sort=null, _order=null) {
  let sort = {"is_dir":"desc"};
  const order =  _order === "DESC" || _order === "desc" ? -1 : 1;

  if ( _sort === undefined || _sort === null || _sort === "" ) {
    sort["id"] = order;

  } else {
    const conditions = { _id: mongoose.Types.ObjectId(_sort) };
    const metaInfos = (yield MetaInfo.find(conditions)).map( meta => {
      meta = meta.toObject();
      meta.meta_info_id = meta._id;
      return meta;
    });

    const displayItems = (yield DisplayItem.find({
      ...conditions,
      name: { $nin: ["file_checkbox", "action"] }
    })).map(items => items.toObject()) ;

    const item = metaInfos.concat(displayItems)[0];
    if (item.meta_info_id === null) {
      // メタ情報以外でのソート
      sort[item.name] = order;
    } else if(item.meta_info_id !== null) {
      // メタ情報でのソート
      sort = {
        "is_dir":"desc",
        "sort_target": order
      };
    } else {
      // @fixme
      sort["id"] = order;
    }
  }
  sort["name"] = order;
  return Promise.resolve(sort);
});

export const getAllowedFileIds = (user_id, permission) => {
  return co(function*(){

    const action = yield Action.findOne({ name:permission });
    const role = (yield RoleFile.find({ actions:{$all : [action._id] } },{'_id':1})).map( role => mongoose.Types.ObjectId(role._id) );

    const user = yield User.findById(user_id);

    const authorities = yield AuthorityFile.find(
      {
        $or : [
          { users: mongoose.Types.ObjectId(user_id) },
          { groups: {$in: user.groups } }],
        role_files: {$in: role }
      });

    const file_ids = authorities.filter( authority => (authority.files !== undefined)).map( authority => authority.files );

    return new Promise((resolve, reject) => resolve(file_ids) );

  });
};

export const checkFilePermission = (file_id, user_id, permission) => {
  return co(function*(){

    const action = yield Action.findOne({ name:permission });
    const role = (yield RoleFile.find({ actions:{$all : [action._id] } },{'_id':1})).map( role => mongoose.Types.ObjectId(role._id) );

    const user = yield User.findById(user_id);

    const authorities = yield AuthorityFile.find(
      {
        $or : [
          { users: mongoose.Types.ObjectId(user_id) },
          { groups: {$in: user.groups } }],
        role_files: {$in: role },
        files: file_id
      });

    return new Promise((resolve, reject) => resolve( authorities.length > 0 ) );

  });
};

const escapeRegExp = (input) => {
  const replace_target = {
    '\\':'\\\\',
    '^': '\\^',
    '$': '\\$',
    '.': '\\.',
    '*': '\\*',
    '+': '\\+',
    '?': '\\?',
    '[': '\\[',
    ']': '\\]',
    '{': '\\{',
    '}': '\\}',
    '(': '\\(',
    ')': '\\)',
    '/': '\\/'
  };
  return input.replace(/[\^\$\.\*\+\?\[\]\{\}\(\)\/]/g, function(m) { return replace_target[m]; });
};


export const extractFileActions = (authorities, user) => {

  const user_id = user._id.toString();

  const user_actions = chain(authorities)
    .filter( auth => {
      return ( auth.users !== undefined && auth.users._id.toString() == user_id );
    } )
    .map( auth => auth.actions )
    .flattenDeep()
    .uniq().value();

  const group_ids = user.groups.map(group => group.toString());
  const group_actuions = chain(authorities)
    .filter( auth => {
      return ( auth.groups !== undefined && indexOf(group_ids, auth.groups._id.toString()) >= 0 );
    } )
    .map( auth => auth.actions )
    .flattenDeep()
    .uniq().value();

  return user_actions.concat(group_actuions);
};
