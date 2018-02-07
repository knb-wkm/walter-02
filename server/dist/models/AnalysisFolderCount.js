"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var AnalysisFolderCountSchema = (0, _mongoose.Schema)({
  reported_at: Number,
  tenant_id: _mongoose.Schema.Types.ObjectId,
  name: String,
  label: String,
  count: Number,
  created_at: { type: Date, default: Date.now }
});

var AnalysisFolderCount = _mongoose2.default.model("analysis_folder_counts", AnalysisFolderCountSchema, "analysis_folder_counts");

exports.default = AnalysisFolderCount;