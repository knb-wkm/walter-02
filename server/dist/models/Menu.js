"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var MenuSchema = (0, _mongoose.Schema)({
  label: _mongoose.Schema.Types.String,
  name: _mongoose.Schema.Types.String
});

var Menu = _mongoose2.default.model("menus", MenuSchema, "menus");

exports.default = Menu;