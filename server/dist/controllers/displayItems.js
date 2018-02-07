"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.excel = exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _mongoose = require("mongoose");

var _DisplayItem = require("../models/DisplayItem");

var _DisplayItem2 = _interopRequireDefault(_DisplayItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var index = exports.index = function index(req, res, next) {
  var exportExcel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var items;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _DisplayItem2.default.find({
              is_display: true,
              tenant_id: _mongoose.Types.ObjectId(res.user.tenant_id)
            }).sort({ order: 1 });

          case 3:
            items = _context.sent;

            if (!exportExcel) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", items);

          case 8:
            res.json({
              status: { success: true },
              body: items
            });

          case 9:
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);

            res.status(400).json();

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 11]]);
  }));
};

var excel = exports.excel = function excel(req, res, next) {
  var exportExcel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var body;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _DisplayItem2.default.find({
              is_excel: true,
              tenant_id: _mongoose.Types.ObjectId(res.user.tenant_id)
            }).sort({ order: 1 });

          case 3:
            body = _context2.sent;

            if (!exportExcel) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt("return", body);

          case 8:
            res.json({ status: { success: true }, body: body });

          case 9:
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](0);

            res.status(400).json();

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 11]]);
  }));
};