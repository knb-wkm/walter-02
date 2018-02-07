"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var RoleMenuSchema = (0, _mongoose.Schema)({
  name: String,
  description: String,
  menus: Array,
  tenant_id: _mongoose.Schema.Types.ObjectId
});

var RoleMenu = _mongoose2.default.model("role_menus", RoleMenuSchema, "role_menus");

exports.default = RoleMenu;