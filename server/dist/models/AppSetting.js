"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var AppSettingSchema = (0, _mongoose.Schema)({
  tenant_id: _mongoose.Schema.Types.ObjectId,
  name: _mongoose.Schema.Types.String,
  description: _mongoose.Schema.Types.String,
  enable: _mongoose.Schema.Types.Boolean,
  default_value: _mongoose.Schema.Types.Mixed
});

var AppSetting = _mongoose2.default.model("app_settings", AppSettingSchema, "app_settings");

exports.default = AppSetting;