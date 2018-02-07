"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _logger = require("../logger");

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var AuthoritySchema = (0, _mongoose.Schema)({
  files: _mongoose.Schema.Types.ObjectId,
  role_files: { type: _mongoose.Schema.Types.ObjectId, ref: 'role_files' },
  users: { type: _mongoose.Schema.Types.ObjectId, ref: 'users' },
  groups: { type: _mongoose.Schema.Types.ObjectId, ref: 'groups' }
});

/**
 * Authority の roles から actions を取得する
 * @param Object condition
 * @returns Array
 */
AuthoritySchema.statics.getActions = function (condition) {
  var _this = this;
  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var authorityActions, actions;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _this.aggregate({ $match: condition }, { $lookup: {
                from: "role_files",
                localField: "role_files",
                foreignField: "_id",
                as: "roles"
              } }, { $unwind: "$roles" }, { $project: {
                roles: {
                  $filter: {
                    input: "$roles.actions",
                    as: "action",
                    cond: {}
                  }
                },
                _id: false
              }
            }, { $unwind: "$roles" }, { $group: { _id: "$roles" } }, // 重複をまとめる
            { $lookup: {
                from: "actions",
                localField: "_id",
                foreignField: "_id",
                as: "actions"
              } }, { $project: { actions: 1, _id: false } }, { $unwind: "$actions" });

          case 3:
            authorityActions = _context.sent;
            actions = authorityActions.map(function (action) {
              return action.actions;
            });
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              return resolve(actions);
            }));

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            throw _context.t0;

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
};

var AuthorityFile = _mongoose2.default.model("authority_files", AuthoritySchema, "authority_files");

exports.default = AuthorityFile;