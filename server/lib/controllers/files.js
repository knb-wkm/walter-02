import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import co from "co";
import jwt from "jsonwebtoken";
import multer from "multer";
import moment from "moment";
import morgan from "morgan";

// constants
import { SECURITY_CONF } from "../../configs/server";

// models
import File from "../models/File";
import Tag from "../models/Tag";
import MetaInfo from "../models/MetaInfo";
import User from "../models/User";
import Tenant from "../models/Tenant";
import Role from "../models/Role";
import { Swift } from "../storages/Swift";

export const index = (req, res, next) => {
  co(function* () {
    try {
      let { dir_id, page } = req.query;
      // デフォルトはテナントのホーム
      if (dir_id === null || dir_id === undefined || dir_id === "") {
        dir_id = res.user.tenant.home_dir_id;
      }

      const conditions = {
        dir_id: mongoose.Types.ObjectId(dir_id)
      };

      // pagination
      if (page === undefined || page === null || page === "") page = 0;
      const limit = 30; // @todo 件数はconfigなどに持たせる？
      const offset = page * limit;

      const total = yield File.find(conditions).count();

      const files = yield File.aggregate([
        { $match: conditions },
        { $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags"
        } }
      ]).skip(offset).limit(limit);

      res.json({
        status: { success: true, total },
        body: files
      });
    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "dir_id is empty":
        errors.dir_id = "dir_id is empty";
        break;
      default:
        errors.unknown = e;
      }

      res.status(400).json({
        status: { success: false, errors }
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
          file_id === "") throw "file_id is empty";

      const file = yield File.findById(file_id);
      const tags = yield Tag.find({ _id: { $in: file.tags } });

      res.json({
        status: { success: true },
        body: { ...file.toObject(), tags }
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = "file_id is empty";
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

export const download = (req, res, next) => {
  co(function* () {
    try {
      const swift = new Swift();

      const { file_id }  = req.query;
      const tenant_name = res.user.tenant.name;

      const fileRecord = yield File.findById(file_id);
      if (fileRecord === null) throw "file not found";

      // @fixme tenant_name=container_nameにする
      const readStream = yield swift.downloadFile("walter", fileRecord);
      readStream.on("data", data => res.write(data) );
      readStream.on("end", () => res.end() );
    }
    catch (e) {
      console.log(e);
    }
  });
};

export const search = (req, res, next) => {
  co(function* () {
    try {
      const conditions = {
        $or: [
          { name: { $regex: req.query.q } },
          { "meta_infos.value": { $regex: req.query.q } }
        ],
        is_display: true
      };

      const files = yield File.aggregate([
        { $match: conditions },
        { $lookup: { from: "tags", localField: "tags", foreignField: "_id", as: "tags" } }
      ]);

      res.json({
        status: { success: true },
        body: files
      });
    }
    catch (e) {
      res.json({
        status: { success: false, message: "ファイルの取得に失敗", errors: e },
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
          tenant_id === "") throw "tenant_id is empty";

      const meta_infos = yield MetaInfo.find({
        tenant_id: mongoose.Types.ObjectId(tenant_id)
      }).select({ key: 1, key_type: 1, value_type: 1 });

      res.json({
        status: { success: true },
        body: meta_infos
      });
    }
    catch (e) {
      const errors = {};
      errors.unknown = e;

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const searchDetail = (req, res, next) => {
  const buildQuery = (item) => {
    switch ( item.key_type ) {
    case "name":
      return ({
        [item.key_type]: {
          $regex: item.value
        },
        is_display: true
      });
    case "modified_less":
      return ({
        modified: {
          $lt: item.value
        },
        is_display: true
      });
    case "modified_greater":
      return ({
        modified: {
          $gt: item.value
        },
        is_display: true
      });
    case "meta":
      return ({
        "meta_infos.meta_info_id": mongoose.Types.ObjectId(item._id),
        "meta_infos.value": { $regex: item.value },
        is_display: true
      });
    case "tags":
      return ({
        tags: mongoose.Types.ObjectId(item.value),
        is_display: true
      });
    default:
      return ({
        [item.key_type]: item.value,
        is_display: true
      });
    }
  };

  co(function* () {
    try {
      const queries = Object.keys(req.query)
            .map( k => JSON.parse(req.query[k]) );

      const base_items = queries.filter( q => q.key_type !== "meta" );
      const meta_items = queries.filter( q => q.key_type === "meta" );

      const base_queries = base_items[0] === undefined 
            ? {}
            : Object.assign(...base_items.map(buildQuery));

      const meta_queries = meta_items[0] === undefined
            ? {}
            : Object.assign(...meta_items.map(buildQuery));

      console.log({ ...base_queries, ...meta_queries });
      const files = yield File.find({ ...base_queries, ...meta_queries });

      res.json({
        status: { success: true },
        body: files
      });
    }
    catch (e) {
      console.log(e);
      res.json({e});
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

      if (changedFileName === null ||
          changedFileName === undefined ||
          changedFileName === "") throw "name is empty";

      const file = yield File.findById(file_id);
      file.name = changedFileName;
      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      console.log(e);
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.fild_id = "file_id is empty";
        break;
      case "name is empty":
        errors.name = "ファイル名が空のため変更に失敗しました";
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

export const move = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;
      const dir_id = req.body.dir_id;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (dir_id === undefined ||
          dir_id === null ||
          file_id === "") throw "dir_id is empty";

      const [ file, dir ] = yield [ File.findById(file_id), File.findById(dir_id) ];

      if (file === null) throw "file is empty";
      if (dir === null) throw "dir is empty";

      file.dir_id = dir._id;
      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });
    }
    catch (e) {
      let errors = {};
      // @todo ちゃんとメッセージを実装する
      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "dir_id is empty":
        errors.dir_id = e;
        break;
      case "file is empty":
        errors.file = e;
        break;
      case "dir is empty":
        errors.dir = e;
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

export const upload = (req, res, next) => {
  co(function* () {
    try {
      const myFiles = req.files["myFile[]"];
      let dir_id = req.body.dir_id;

      if (myFiles === null ||
          myFiles === undefined ||
          myFiles === "" ||
          myFiles.length === 0) throw "myFile is empty";

      if (dir_id === null ||
          dir_id === undefined ||
          dir_id === "" ||
          dir_id === "undefined") {

        dir_id = res.user.tenant.home_dir_id;
      }

      const dir = yield File.findById(dir_id);

      if (dir === null) throw "dir is empty";

      const user = yield User.findById(res.user._id);

      const role = yield Role.findOne({
        tenant_id: mongoose.Types.ObjectId(res.user.tenant_id),
        name: "フルコントロール" // @fixme
      });

      const createFiles = myFiles.map( _file => {
        const file = new File();
        file.name = _file.originalname;
        file.blob_path = _file.path;
        file.mime_type = _file.mimetype;
        file.size = _file.size;
        file.modified = moment().format("YYYY-MM-DD HH:mm:ss");
        file.is_dir = false;
        file.dir_id = dir_id;
        file.is_display = true;
        file.is_star = false;
        file.tags = [];
        file.histories = [];
        file.authorities = [];
        file.meta_infos = [];

        if (user === null) throw "user is empty";

        // アップロードしたユーザが所有者となる
        file.authorities = file.authorities.concat({ user: user, group: null, role });

        const history = {
          modified: moment().format("YYYY-MM-DD hh:mm:ss"),
          user: user,
          action: "新規作成",
          body: ""
        };

        file.histories = file.histories.concat(history);

        // ここからswiftへのput
        const swift = new Swift();
        swift.upload(path.resolve(_file.path), file._id.toString());

        return file;
      });

      const changedFiles = yield createFiles.map( file => file.save() );

      res.json({
        status: { success: true },
        body: changedFiles
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "myFile is empty":
        errors.myFile = e;
        break;
      case "dir_id is empty":
        errors.dir_id = e;
        break;
      case "dir is empty":
        errors.dir = e;
        break;
      case "user is empty":
        errors.user = e;
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

export const addTag = (req, res, next) => {
  co(function* () {
    try {
      const file_id = req.params.file_id;
      const tag_id = req.body._id;
      if (file_id === null ||
          file_id === undefined ||
          file_id === "") throw "file_id is empty";

      if (tag_id === null ||
          tag_id === undefined ||
          tag_id === "") throw "tag_id is empty";

      const [ file, tag ] = yield [ File.findById(file_id), Tag.findById(tag_id)];

      if (file === null) throw "file is empty";
      if (tag === null) throw "tag is empty";

      file.tags = [ ...file.tags, tag._id ];
      const changedFile = yield file.save();

      const tags = yield Tag.find({ _id: { $in: file.tags } });

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
      case "tag_id is empty":
        errors.tag_id = e;
        break;
      case "file is empty":
        errors.file = e;
        break;
      case "tag is empty":
        errors.tag = e;
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

export const removeTag = (req, res, next) => {
  co(function* () {
    try {
      const { file_id, tag_id } = req.params;    

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (tag_id === undefined ||
          tag_id === null ||
          tag_id === "") throw "tag_id is empty";

      const [ file, tag ] = yield [ File.findById(file_id), Tag.findById(tag_id) ];

      if (file === null) throw "file is empty";
      if (tag === null) throw "tag is empty";

      file.tags = file.tags.filter( file_tag => file_tag.toString() !== tag.id );
      const changedFile = yield file.save();

      const tags = yield Tag.find({ _id: { $in: file.tags } });

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
      case "tag_id is empty":
        errors.tag_id = e;
        break;
      case "file is empty":
        errors.file = e;
        break;
      case "tag is empty":
        errors.tag = e;
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

export const addMeta = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      const { meta, value } = req.body;

      if (meta._id === undefined) throw "meta is empty";

      if (value === undefined ||
          value === null ||
          value === "") throw "value is empty";

      const [ file, metaInfo ] = yield [
        File.findById(file_id),
        MetaInfo.findById(meta._id)
      ];

      if (file === null) throw "file is empty";
      if (metaInfo === null) throw "metaInfo is empty";

      const pushMeta = {
        meta_info_id: metaInfo._id,
        key: metaInfo.key,
        value: value,
        value_type: metaInfo.value_type
      };

      file.meta_infos = [ ...file.meta_infos, pushMeta ];

      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "meta is empty":
        errors.meta = e;
        break;
      case "value is empty":
        errors.value = e;
        break;
      case "file is empty":
        errors.file = e;
        break;
      case "metaInfo is empty":
        errors.metaInfo = e;
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

export const removeMeta = (req, res, next) => {
  co(function* () {
    try {
      const { file_id, meta_id } = req.params;

      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      if (meta_id === undefined ||
          meta_id === null ||
          meta_id === "") throw "meta_id is empty";

      const [ file, metaInfo ] = yield [
        File.findById(file_id),
        MetaInfo.findById(meta_id)
      ];

      if (file === null) throw "file is empty";
      if (metaInfo === null) throw "metaInfo is empty";

      file.meta_infos = file.meta_infos.filter( _meta => {
        return _meta.meta_info_id.toString() !== metaInfo._id.toString();
      });

      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "meta_id is empty":
        errors.meta_id = e;
        break;
      case "file is empty":
        errors.file = e;
        break;
      case "metaInfo is empty":
        errors.metaInfo = e;
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

export const toggleStar = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      if (file_id === undefined ||
          file_id === null ||
          file_id === "") throw "file_id is empty";

      const file = yield File.findById(file_id);

      if (file === null) throw "file is empty";

      file.is_star = !file.is_star;
      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "file_id is empty":
        errors.file_id = e;
        break;
      case "file is empty":
        errors.file = e;
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

export const addAuthority = (req, res, next) => {
  co(function* () {
    try {
      const { file_id } = req.params;
      const { user, role } = req.body;

      const file = yield File.findById(file_id);
      if (file === null) throw "file is empty";

      const _user = yield User.findById(user._id);
      if (_user === null) throw "user is empty";

      const _role = yield Role.findById(role._id);
      if (_role === null) throw "role is empty";

      file.authorities = [ 
        ...file.authorities,
        {
          role: _role,
          group: null,
          user: _user
        }
      ];

      const changedFile = yield file.save();

      res.json({
        status: { success: true },
        body: changedFile
      });

    }
    catch (e) {
      console.log(e);
      const errors = {};
      switch (e) {
      case "file is empty":
        errors.file = "追加対象のファイルが見つかりません";
        break;
      case "user is empty":
        errors.user = "追加対象のユーザが見つかりません";
        break;
      case "role is empty":
        errors.role = "追加対象のロールが見つかりません";
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

export const removeAuthority = (req, res, next) => {
};
