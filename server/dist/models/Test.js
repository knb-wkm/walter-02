"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var TestSchema = (0, _mongoose.Schema)({
  name: String,
  age: Number
});

TestSchema.statics.test_method = function () {
  return "test_method is called";
};

// TestSchema.statics = {
//   test_method: () => {
//     return "test_method is called";
//   }
// };

var Test = _mongoose2.default.model("tests", TestSchema, "tests");

exports.default = Test;