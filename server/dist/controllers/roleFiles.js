"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addActionToRoleFile = exports.removeActionOfRoleFile = exports.remove = exports.updateDescription = exports.updateName = exports.view = exports.create = exports.index = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _RoleFile = require("../models/RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

var _Action = require("../models/Action");

var _Action2 = _interopRequireDefault(_Action);

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _commons = require("./commons");

var commons = _interopRequireWildcard(_commons);

var _lodash = require("lodash");

var _AppError = require("../errors/AppError");

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;

// constants

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var tenant_id, roles, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            tenant_id = res.user.tenant_id;
            _context.next = 4;
            return _RoleFile2.default.aggregate([{
              $match: {
                tenant_id: ObjectId(tenant_id)
              }
            }, {
              $lookup: {
                from: "actions",
                localField: "actions",
                foreignField: "_id",
                as: "actions"
              }
            }]);

          case 4:
            roles = _context.sent;


            res.json({
              status: { success: true },
              body: roles
            });
            _context.next = 13;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            errors = {};


            errors = _context.t0;
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
};

var create = exports.create = function create(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var role, _role, newRoleFile, createdRoleFile, errors;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            role = req.body.role;

            if (!(role === undefined)) {
              _context2.next = 4;
              break;
            }

            throw new _AppError.ValidationError("role is empty");

          case 4:
            if (!(role.name === undefined || role.name === null || role.name === "")) {
              _context2.next = 6;
              break;
            }

            throw new _AppError.ValidationError("name is empty");

          case 6:
            if (!(role.name.length > constants.MAX_STRING_LENGTH)) {
              _context2.next = 8;
              break;
            }

            throw new _AppError.ValidationError("name is too long");

          case 8:
            if (!(role.description !== undefined && typeof role.description === "string" && role.description.length > constants.MAX_STRING_LENGTH)) {
              _context2.next = 10;
              break;
            }

            throw new _AppError.ValidationError("description is too long");

          case 10:
            _context2.next = 12;
            return _RoleFile2.default.findOne({
              name: role.name,
              tenant_id: res.user.tenant_id
            });

          case 12:
            _role = _context2.sent;

            if (!(_role !== null)) {
              _context2.next = 15;
              break;
            }

            throw new _AppError.ValidationError("name is duplicate");

          case 15:
            newRoleFile = new _RoleFile2.default();

            newRoleFile.name = role.name;
            newRoleFile.description = role.description;
            newRoleFile.tenant_id = res.user.tenant_id;

            _context2.next = 21;
            return newRoleFile.save();

          case 21:
            createdRoleFile = _context2.sent;


            res.json({
              status: { success: true },
              body: createdRoleFile
            });
            _context2.next = 44;
            break;

          case 25:
            _context2.prev = 25;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0.message;
            _context2.next = _context2.t1 === "role is empty" ? 31 : _context2.t1 === "name is empty" ? 33 : _context2.t1 === "name is duplicate" ? 35 : _context2.t1 === "name is too long" ? 37 : _context2.t1 === "description is too long" ? 39 : 40;
            break;

          case 31:
            errors.role = "ロールが空のため作成に失敗しました";
            return _context2.abrupt("break", 42);

          case 33:
            errors.name = "ロール名が空です";
            return _context2.abrupt("break", 42);

          case 35:
            errors.name = "そのロール名は既に使用されています";
            return _context2.abrupt("break", 42);

          case 37:
            errors.name = "ロール名が長すぎます";
            return _context2.abrupt("break", 42);

          case 39:
            errors.description = "備考が長すぎます";

          case 40:
            errors.unknown = commons.errorParser(_context2.t0);
            return _context2.abrupt("break", 42);

          case 42:
            _logger2.default.error(_context2.t0);
            res.status(400).json({
              status: { success: false, message: "ロールの作成に失敗しました", errors: errors }
            });

          case 44:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 25]]);
  }));
};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var role_id, role, actions, errors;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            role_id = req.params.role_id;

            if (ObjectId.isValid(role_id)) {
              _context3.next = 4;
              break;
            }

            throw new _AppError.ValidationError("role_id is not valid");

          case 4:
            _context3.next = 6;
            return _RoleFile2.default.findById(role_id);

          case 6:
            role = _context3.sent;

            if (!(role === null || role === undefined)) {
              _context3.next = 9;
              break;
            }

            throw new _AppError.ValidationError("role is not found");

          case 9:
            _context3.next = 11;
            return _Action2.default.find({ _id: { $in: role.actions } });

          case 11:
            actions = _context3.sent;


            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, role.toObject(), { actions: actions })
            });
            _context3.next = 27;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0.message;
            _context3.next = _context3.t1 === "role is not found" ? 21 : _context3.t1 === "role_id is not valid" ? 23 : 25;
            break;

          case 21:
            errors.role = "指定されたロールが存在しないためロールの取得に失敗しました";
            return _context3.abrupt("break", 26);

          case 23:
            errors.role = "ロールIDが不正なためロールの取得に失敗しました";
            return _context3.abrupt("break", 26);

          case 25:
            errors = _context3.t0;

          case 26:

            res.status(400).json({
              status: { success: false, message: "ロールの取得に失敗しました", errors: errors }
            });

          case 27:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 15]]);
  }));
};

var updateName = exports.updateName = function updateName(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var role_id, name, tenant_id, _role, role, changedRoleFile, errors;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            role_id = req.params.role_id;
            name = req.body.name;
            tenant_id = res.user.tenant_id;

            if (ObjectId.isValid(role_id)) {
              _context4.next = 6;
              break;
            }

            throw new _AppError.ValidationError("role_id is not valid");

          case 6:
            if (!(name === undefined || name === null || name === "")) {
              _context4.next = 8;
              break;
            }

            throw new _AppError.ValidationError("name is empty");

          case 8:
            if (!(name.length > constants.MAX_STRING_LENGTH)) {
              _context4.next = 10;
              break;
            }

            throw new _AppError.ValidationError("name is too long");

          case 10:
            _context4.next = 12;
            return _RoleFile2.default.find({ name: name, tenant_id: tenant_id });

          case 12:
            _role = _context4.sent;

            if (!(_role.length > 0)) {
              _context4.next = 15;
              break;
            }

            throw new _AppError.ValidationError("name is duplicate");

          case 15:
            _context4.next = 17;
            return _RoleFile2.default.findById(role_id);

          case 17:
            role = _context4.sent;

            if (!(role === undefined || role === null)) {
              _context4.next = 20;
              break;
            }

            throw new _AppError.RecordNotFoundException("role is not found");

          case 20:

            role.name = name;
            _context4.next = 23;
            return role.save();

          case 23:
            changedRoleFile = _context4.sent;


            res.json({
              status: { success: true },
              body: changedRoleFile
            });
            _context4.next = 46;
            break;

          case 27:
            _context4.prev = 27;
            _context4.t0 = _context4["catch"](0);
            errors = {};
            _context4.t1 = _context4.t0.message;
            _context4.next = _context4.t1 === "name is empty" ? 33 : _context4.t1 === "name is duplicate" ? 35 : _context4.t1 === "name is too long" ? 37 : _context4.t1 === "role_id is not valid" ? 39 : _context4.t1 === "role is not found" ? 41 : 43;
            break;

          case 33:
            errors.name = "ロール名が空です";
            return _context4.abrupt("break", 45);

          case 35:
            errors.name = "そのロール名は既に使用されています";
            return _context4.abrupt("break", 45);

          case 37:
            errors.name = "ロール名が長すぎます";
            return _context4.abrupt("break", 45);

          case 39:
            errors.role_id = "ロールIDが不正なためロール名の変更に失敗しました";
            return _context4.abrupt("break", 45);

          case 41:
            errors.role = "指定されたロールが見つからないため変更に失敗しました";
            return _context4.abrupt("break", 45);

          case 43:
            errors.unknown = commons.errorParser(_context4.t0);
            return _context4.abrupt("break", 45);

          case 45:

            res.status(400).json({
              status: { success: false, message: "ロール名の変更に失敗しました", errors: errors }
            });

          case 46:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 27]]);
  }));
};

var updateDescription = exports.updateDescription = function updateDescription(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var role_id, description, role, changedRoleFile, errors;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            role_id = req.params.role_id;
            description = req.body.description;

            if (ObjectId.isValid(role_id)) {
              _context5.next = 5;
              break;
            }

            throw new _AppError.ValidationError("role_id is not valid");

          case 5:
            _context5.next = 7;
            return _RoleFile2.default.findById(role_id);

          case 7:
            role = _context5.sent;

            if (!(role === undefined || role === null)) {
              _context5.next = 10;
              break;
            }

            throw new _AppError.ValidationError("role is not found");

          case 10:

            role.description = description;
            _context5.next = 13;
            return role.save();

          case 13:
            changedRoleFile = _context5.sent;


            res.json({
              status: { success: true },
              body: changedRoleFile
            });
            _context5.next = 30;
            break;

          case 17:
            _context5.prev = 17;
            _context5.t0 = _context5["catch"](0);
            errors = {};
            _context5.t1 = _context5.t0.message;
            _context5.next = _context5.t1 === "role is not found" ? 23 : _context5.t1 === "role_id is not valid" ? 25 : 27;
            break;

          case 23:
            errors.role = "指定されたロールが見つからないため備考の変更に失敗しました";
            return _context5.abrupt("break", 29);

          case 25:
            errors.role_id = "ロールIDが不正なため備考の変更に失敗しました";
            return _context5.abrupt("break", 29);

          case 27:
            errors.unknown = commons.errorParser(_context5.t0);
            return _context5.abrupt("break", 29);

          case 29:

            res.status(400).json({
              status: { success: false, message: "備考の変更に失敗しました", errors: errors }
            });

          case 30:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 17]]);
  }));
};

var remove = exports.remove = function remove(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
    var role_id, role, deletedRoleFile, errors;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            role_id = req.params.role_id;

            if (ObjectId.isValid(role_id)) {
              _context6.next = 4;
              break;
            }

            throw new _AppError.ValidationError("role is not valid");

          case 4:
            _context6.next = 6;
            return _RoleFile2.default.findById(role_id);

          case 6:
            role = _context6.sent;

            if (!(role === null)) {
              _context6.next = 9;
              break;
            }

            throw new _AppError.ValidationError("role is empty");

          case 9:
            deletedRoleFile = role.remove();


            res.json({
              status: { success: true },
              body: deletedRoleFile
            });

            _context6.next = 26;
            break;

          case 13:
            _context6.prev = 13;
            _context6.t0 = _context6["catch"](0);
            errors = {};
            _context6.t1 = _context6.t0.message;
            _context6.next = _context6.t1 === "role is empty" ? 19 : _context6.t1 === "role is not valid" ? 21 : 23;
            break;

          case 19:
            errors.role = "指定されたロールが見つからないため削除に失敗しました";
            return _context6.abrupt("break", 25);

          case 21:
            errors.role = "ロールIDが不正なため削除に失敗しました";
            return _context6.abrupt("break", 25);

          case 23:
            errors.unknown = commons.errorParser(_context6.t0);
            return _context6.abrupt("break", 25);

          case 25:

            res.status(400).json({
              status: { success: false, message: "ロールの削除に失敗しました", errors: errors }
            });

          case 26:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 13]]);
  }));
};

var removeActionOfRoleFile = exports.removeActionOfRoleFile = function removeActionOfRoleFile(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
    var _req$params, role_id, action_id, _ref, _ref2, role, action, changedRoleFile, errors;

    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _req$params = req.params, role_id = _req$params.role_id, action_id = _req$params.action_id;

            if (ObjectId.isValid(role_id)) {
              _context7.next = 4;
              break;
            }

            throw new _AppError.ValidationError("role_id is not Valid");

          case 4:
            if (ObjectId.isValid(action_id)) {
              _context7.next = 6;
              break;
            }

            throw new _AppError.ValidationError("action_id is not Valid");

          case 6:
            _context7.next = 8;
            return [_RoleFile2.default.findById(role_id), _Action2.default.findById(action_id)];

          case 8:
            _ref = _context7.sent;
            _ref2 = (0, _slicedToArray3.default)(_ref, 2);
            role = _ref2[0];
            action = _ref2[1];

            if (!(role === null)) {
              _context7.next = 14;
              break;
            }

            throw new _AppError.RecordNotFoundException("role is empty");

          case 14:
            if (!(action === null)) {
              _context7.next = 16;
              break;
            }

            throw new _AppError.RecordNotFoundException("action is empty");

          case 16:
            if (!((0, _lodash.findIndex)(role.actions, action._id) === -1)) {
              _context7.next = 18;
              break;
            }

            throw new _AppError.ValidationError("action is not found");

          case 18:

            role.actions = role.actions.filter(function (_action) {
              return _action.toString() !== action._id.toString();
            });

            _context7.next = 21;
            return role.save();

          case 21:
            changedRoleFile = _context7.sent;


            res.json({
              status: { success: true },
              body: changedRoleFile
            });

            _context7.next = 44;
            break;

          case 25:
            _context7.prev = 25;
            _context7.t0 = _context7["catch"](0);
            errors = {};
            _context7.t1 = _context7.t0.message;
            _context7.next = _context7.t1 === "role_id is not Valid" ? 31 : _context7.t1 === "action_id is not Valid" ? 33 : _context7.t1 === "role is empty" ? 35 : _context7.t1 === "action is empty" ? 37 : _context7.t1 === "action is not found" ? 39 : 41;
            break;

          case 31:
            errors.role_id = "ロールIDが不正なためアクションの削除に失敗しました";
            return _context7.abrupt("break", 42);

          case 33:
            errors.action_id = "アクションIDが不正なためアクションの削除に失敗しました";
            return _context7.abrupt("break", 42);

          case 35:
            errors.role = "指定されたロールが存在しないため削除に失敗しました";
            return _context7.abrupt("break", 42);

          case 37:
            errors.action = "指定されたアクションが存在しないため削除に失敗しました";
            return _context7.abrupt("break", 42);

          case 39:
            errors.action = "指定されたアクションは登録されていないため削除に失敗しました";
            return _context7.abrupt("break", 42);

          case 41:
            errors.unknown = commons.errorParser(_context7.t0);

          case 42:
            _logger2.default.error(_context7.t0);
            res.status(400).json({
              status: { success: false, message: "アクションの削除に失敗しました", errors: errors }
            });

          case 44:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 25]]);
  }));
};

var addActionToRoleFile = exports.addActionToRoleFile = function addActionToRoleFile(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
    var _req$params2, role_id, action_id, _ref3, _ref4, role, action, changedRoleFile, errors;

    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _req$params2 = req.params, role_id = _req$params2.role_id, action_id = _req$params2.action_id;

            if (ObjectId.isValid(role_id)) {
              _context8.next = 4;
              break;
            }

            throw new _AppError.ValidationError("role_id is not Valid");

          case 4:
            if (ObjectId.isValid(action_id)) {
              _context8.next = 6;
              break;
            }

            throw new _AppError.ValidationError("action_id is not Valid");

          case 6:
            _context8.next = 8;
            return [_RoleFile2.default.findById(role_id), _Action2.default.findById(action_id)];

          case 8:
            _ref3 = _context8.sent;
            _ref4 = (0, _slicedToArray3.default)(_ref3, 2);
            role = _ref4[0];
            action = _ref4[1];

            if (!(role === null)) {
              _context8.next = 14;
              break;
            }

            throw new _AppError.RecordNotFoundException("role is empty");

          case 14:
            if (!(action === null)) {
              _context8.next = 16;
              break;
            }

            throw new _AppError.RecordNotFoundException("action is empty");

          case 16:
            if (!(role.actions.indexOf(action._id) >= 0)) {
              _context8.next = 18;
              break;
            }

            throw new _AppError.ValidationError("action is duplicate");

          case 18:

            role.actions = [].concat((0, _toConsumableArray3.default)(role.actions), [action._id]);
            _context8.next = 21;
            return role.save();

          case 21:
            changedRoleFile = _context8.sent;


            res.json({
              status: { success: true },
              body: changedRoleFile
            });

            _context8.next = 45;
            break;

          case 25:
            _context8.prev = 25;
            _context8.t0 = _context8["catch"](0);
            errors = {};
            _context8.t1 = _context8.t0.message;
            _context8.next = _context8.t1 === "role_id is not Valid" ? 31 : _context8.t1 === "action_id is not Valid" ? 33 : _context8.t1 === "role is empty" ? 35 : _context8.t1 === "action is empty" ? 37 : _context8.t1 === "action is duplicate" ? 39 : 41;
            break;

          case 31:
            errors.role_id = "ロールIDが不正なためアクションの追加に失敗しました";
            return _context8.abrupt("break", 43);

          case 33:
            errors.action_id = "アクションIDが不正なためアクションの追加に失敗しました";
            return _context8.abrupt("break", 43);

          case 35:
            errors.role = "指定されたロールが見つからないためアクションの追加に失敗しました";
            return _context8.abrupt("break", 43);

          case 37:
            errors.action = "指定されたアクションが見つからないため追加に失敗しました";
            return _context8.abrupt("break", 43);

          case 39:
            errors.action = "指定されたアクションが既に登録されているため追加に失敗しました";
            return _context8.abrupt("break", 43);

          case 41:
            errors.unknown = commons.errorParser(_context8.t0);
            return _context8.abrupt("break", 43);

          case 43:

            _logger2.default.error(_context8.t0);
            res.status(400).json({
              status: { success: false, message: "アクションの追加に失敗しました", errors: errors }
            });

          case 45:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this, [[0, 25]]);
  }));
};