"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var UserSchema = (0, _mongoose.Schema)({
  type: { type: String, default: "user" },
  account_name: String,
  name: String,
  email: String,
  password: String,
  enabled: Boolean,
  groups: Array,
  tenant_id: _mongoose.Schema.Types.ObjectId
});

var User = _mongoose2.default.model("users", UserSchema, "users");

exports.default = User;