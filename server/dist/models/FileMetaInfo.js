"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _File = require("./File");

var _File2 = _interopRequireDefault(_File);

var _MetaInfo = require("./MetaInfo");

var _MetaInfo2 = _interopRequireDefault(_MetaInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// models
_mongoose2.default.Promise = global.Promise;

var FileMetaInfoSchema = (0, _mongoose.Schema)({
  file_id: _mongoose.Schema.Types.ObjectId,
  meta_info_id: _mongoose.Schema.Types.ObjectId,
  value: String
});

var FileMetaInfo = _mongoose2.default.model("file_meta_infos", FileMetaInfoSchema, "file_meta_infos");

exports.default = FileMetaInfo;