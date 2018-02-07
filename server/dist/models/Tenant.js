"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var TenantSchema = (0, _mongoose.Schema)({
  name: String,
  home_dir_id: _mongoose.Schema.Types.ObjectId,
  trash_dir_id: _mongoose.Schema.Types.ObjectId,
  threshold: _mongoose.Schema.Types.Number
});

var Tenant = _mongoose2.default.model("tenants", TenantSchema, "tenants");
exports.default = Tenant;