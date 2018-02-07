"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var DirSchema = (0, _mongoose.Schema)({
  ancestor: [{ type: _mongoose.Schema.Types.ObjectId, ref: 'files' }],
  descendant: _mongoose.Schema.Types.ObjectId,
  depth: Number
});

var Dir = _mongoose2.default.model("dirs", DirSchema, "dirs");

exports.default = Dir;