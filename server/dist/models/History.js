"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _User = require("./User");

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var History = {
  user: _User2.default,
  action: String,
  body: String
};

exports.default = History;