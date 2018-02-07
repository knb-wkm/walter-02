"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PermisstionDeniedException = exports.RecordNotFoundException = exports.ValidationError = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppError = function (_Error) {
  (0, _inherits3.default)(AppError, _Error);

  function AppError(message, body) {
    (0, _classCallCheck3.default)(this, AppError);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AppError.__proto__ || Object.getPrototypeOf(AppError)).call(this));

    _this.message = message;
    _this.name = _this.constructor.name;
    _this.body = body === undefined ? null : body;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return AppError;
}(Error);

var ValidationError = exports.ValidationError = function (_AppError) {
  (0, _inherits3.default)(ValidationError, _AppError);

  function ValidationError(message, body) {
    (0, _classCallCheck3.default)(this, ValidationError);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)).call(this, message, body));

    _this2.name = "ValidationError";
    return _this2;
  }

  return ValidationError;
}(AppError);

var RecordNotFoundException = exports.RecordNotFoundException = function (_AppError2) {
  (0, _inherits3.default)(RecordNotFoundException, _AppError2);

  function RecordNotFoundException(message, body) {
    (0, _classCallCheck3.default)(this, RecordNotFoundException);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (RecordNotFoundException.__proto__ || Object.getPrototypeOf(RecordNotFoundException)).call(this, message, body));

    _this3.name = "RecordNotFoundException";
    return _this3;
  }

  return RecordNotFoundException;
}(AppError);

var PermisstionDeniedException = exports.PermisstionDeniedException = function (_AppError3) {
  (0, _inherits3.default)(PermisstionDeniedException, _AppError3);

  function PermisstionDeniedException(message, body) {
    (0, _classCallCheck3.default)(this, PermisstionDeniedException);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (PermisstionDeniedException.__proto__ || Object.getPrototypeOf(PermisstionDeniedException)).call(this, message, body));

    _this4.name = "PermisstionDeniedException";
    return _this4;
  }

  return PermisstionDeniedException;
}(AppError);