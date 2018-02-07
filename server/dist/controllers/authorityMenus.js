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

var _AuthorityMenu = require("../models/AuthorityMenu");

var _AuthorityMenu2 = _interopRequireDefault(_AuthorityMenu);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;
var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var user_id, user, condition, menus, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            user_id = res.user._id;
            _context.next = 4;
            return _User2.default.findById(user_id);

          case 4:
            user = _context.sent;
            condition = {
              $or: [{ users: ObjectId(user_id) }, { groups: { $in: user.groups } }]
            };
            _context.next = 8;
            return _AuthorityMenu2.default.getMenus(condition);

          case 8:
            menus = _context.sent;


            res.json({
              status: { success: true },
              body: menus
            });

            _context.next = 17;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            errors = {};


            errors = _context.t0;
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 12]]);
  }));
};