"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var TagSchema = (0, _mongoose.Schema)({
  color: String,
  label: String,
  tenant_id: _mongoose.Schema.Types.ObjectId
});

var Tag = _mongoose2.default.model("tags", TagSchema, "tags");
exports.default = Tag;