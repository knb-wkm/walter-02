"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var DownloadInfoSchema = (0, _mongoose.Schema)({
  tenant_id: _mongoose.Schema.Types.ObjectId,
  type: String, // file,excel
  value: String, // "{bbbbbbbbb}_{aaaaaaa:YYYYMMDD}{extension}"
  extensionTarget: _mongoose.Schema.Types.ObjectId
});

var DownloadInfo = _mongoose2.default.model("download_infos", DownloadInfoSchema);

exports.default = DownloadInfo;