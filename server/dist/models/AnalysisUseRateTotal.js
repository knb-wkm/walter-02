"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var AnalysisUseRateTotalSchema = (0, _mongoose.Schema)({
  reported_at: Number,
  tenant_id: _mongoose.Schema.Types.ObjectId,
  name: String,
  label: String,
  threshold: Number,
  used: Number,
  free: Number,
  used_rate: Number,
  created_at: { type: Date, default: Date.now }
});

var AnalysisUseRateTotal = _mongoose2.default.model("analysis_use_rate_totals", AnalysisUseRateTotalSchema, "analysis_use_rate_totals");

exports.default = AnalysisUseRateTotal;