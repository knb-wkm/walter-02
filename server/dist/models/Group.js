"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var GroupSchema = (0, _mongoose.Schema)({
  name: String,
  description: String,
  tenant_id: _mongoose.Schema.Types.ObjectId,
  roles: Array
});

var Group = _mongoose2.default.model("groups", GroupSchema, "groups");

exports.default = Group;