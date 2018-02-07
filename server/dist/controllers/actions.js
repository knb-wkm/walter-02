"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _Action = require("../models/Action");

var _Action2 = _interopRequireDefault(_Action);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var actions, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _Action2.default.find();

          case 3:
            actions = _context.sent;


            res.json({
              status: { success: true },
              body: actions
            });
            _context.next = 16;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = 13;
            break;

          case 13:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 15);

          case 15:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));
};