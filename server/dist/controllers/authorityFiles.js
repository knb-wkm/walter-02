"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.files = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

var _AuthorityFile = require("../models/AuthorityFile");

var _AuthorityFile2 = _interopRequireDefault(_AuthorityFile);

var _RoleFile = require("../models/RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

var _Action = require("../models/Action");

var _Action2 = _interopRequireDefault(_Action);

var _AppError = require("../errors/AppError");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var files = exports.files = function files(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var user_id, _files, condition, actions, errors;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            user_id = res.user._id;

            if (!(req.body.files === undefined)) {
              _context.next = 4;
              break;
            }

            throw new _AppError.ValidationError("files is undefined");

          case 4:
            _files = req.body.files.filter(function (id) {
              return _mongoose2.default.Types.ObjectId.isValid(id);
            }).map(function (id) {
              return _mongoose2.default.Types.ObjectId(id);
            });
            condition = {
              users: _mongoose2.default.Types.ObjectId(user_id),
              files: { $in: _files }
            };
            _context.next = 8;
            return _AuthorityFile2.default.getActions(condition);

          case 8:
            actions = _context.sent;


            res.json({
              status: { success: true },
              body: actions
            });

            _context.next = 24;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);

            _logger2.default.error(_context.t0);
            errors = {};
            _context.t1 = _context.t0.message;
            _context.next = _context.t1 === "files is undefined" ? 19 : 21;
            break;

          case 19:
            errors.files = "ファイルIDが空のためファイル権限の取得に失敗しました";
            return _context.abrupt("break", 22);

          case 21:
            errors.unknown = _context.t0;

          case 22:
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, message: "ファイル権限の取得に失敗しました", errors: errors }
            });

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 12]]);
  }));
};