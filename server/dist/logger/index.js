"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log4js = require("log4js");

var _log4js2 = _interopRequireDefault(_log4js);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_log4js2.default.configure(constants.LOGGER_CONFIG);
var mode = process.env.NODE_ENV;
exports.default = _log4js2.default.getLogger(mode);