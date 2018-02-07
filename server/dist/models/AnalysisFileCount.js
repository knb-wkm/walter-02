"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var AnalysisFileCountSchema = (0, _mongoose.Schema)({
  reported_at: Number,
  tenant_id: _mongoose.Schema.Types.ObjectId,
  name: String,
  label: String,
  count: Number,
  created_at: { type: Date, default: Date.now }
});

var AnalysisFileCount = _mongoose2.default.model("analysis_file_counts", AnalysisFileCountSchema, "analysis_file_counts");

exports.default = AnalysisFileCount;