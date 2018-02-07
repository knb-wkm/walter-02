"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var PreviewSchema = (0, _mongoose.Schema)({
  image: Object,
  creating: { type: Boolean, default: false }
});

var Preview = _mongoose2.default.model("previews", PreviewSchema, "previews");

exports.default = Preview;