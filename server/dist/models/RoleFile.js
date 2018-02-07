"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var RoleFileSchema = (0, _mongoose.Schema)({
  name: String,
  description: String,
  actions: Array,
  tenant_id: _mongoose.Schema.Types.ObjectId
});

var RoleFile = _mongoose2.default.model("role_files", RoleFileSchema, "role_files");

exports.default = RoleFile;