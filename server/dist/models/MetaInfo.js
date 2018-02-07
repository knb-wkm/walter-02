"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var MetaInfoSchema = (0, _mongoose.Schema)({
  tenant_id: _mongoose.Schema.Types.ObjectId,
  label: String,
  name: String,
  value_type: String
});

var MetaInfo = _mongoose2.default.model("meta_infos", MetaInfoSchema, "meta_infos");

exports.default = MetaInfo;