"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRoleMenus = exports.getWithGroups = exports.updateAccountName = exports.removeUserOfGroup = exports.addUserToGroup = exports.updateEmail = exports.updateName = exports.toggleEnabled = exports.updatePasswordForce = exports.updatePassword = exports.add = exports.view = exports.index = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

var _Group = require("../models/Group");

var _Group2 = _interopRequireDefault(_Group);

var _AuthorityMenu = require("../models/AuthorityMenu");

var _AuthorityMenu2 = _interopRequireDefault(_AuthorityMenu);

var _RoleMenu = require("../models/RoleMenu");

var _RoleMenu2 = _interopRequireDefault(_RoleMenu);

var _lodash = require("lodash");

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;
var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var q, tenant_id, tenant, conditions, users, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            q = req.query.q;
            tenant_id = res.user.tenant_id;

            if (!(tenant_id === undefined || tenant_id === null || tenant_id === "")) {
              _context.next = 5;
              break;
            }

            throw "tenant_id is empty";

          case 5:
            _context.next = 7;
            return _Tenant2.default.findById(tenant_id);

          case 7:
            tenant = _context.sent;

            if (!(tenant === null)) {
              _context.next = 10;
              break;
            }

            throw "tenant is empty";

          case 10:
            conditions = void 0;


            if (q) {
              conditions = {
                $and: [{ tenant_id: _mongoose2.default.Types.ObjectId(tenant_id) }],
                $or: [{ name: new RegExp(q, "i") }, { account_name: new RegExp(q, "i") }]
              };
            } else {
              conditions = {
                tenant_id: _mongoose2.default.Types.ObjectId(tenant_id)
              };
            }

            _context.next = 14;
            return _User2.default.aggregate([{ $match: conditions }, { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups" }
            }]);

          case 14:
            users = _context.sent;


            res.json({
              status: { success: true },
              body: users
            });

            _context.next = 31;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = _context.t1 === "tenant_id is empty" ? 24 : _context.t1 === "tenant is empty" ? 26 : 28;
            break;

          case 24:
            errors.tenant_id = _context.t0;
            return _context.abrupt("break", 30);

          case 26:
            errors.tenant = _context.t0;
            return _context.abrupt("break", 30);

          case 28:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 30);

          case 30:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 18]]);
  }));
};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var user_id, user, tenant, group_ids, groups, _ref, role_menus, errors;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            user_id = req.params.user_id;

            if (!(user_id === undefined || user_id === null || user_id === "")) {
              _context2.next = 4;
              break;
            }

            throw "user_id is empty";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context2.next = 6;
              break;
            }

            throw "user_id is invalid";

          case 6:
            _context2.next = 8;
            return _User2.default.findById(user_id);

          case 8:
            user = _context2.sent;

            if (!(user === null)) {
              _context2.next = 11;
              break;
            }

            throw "user is empty";

          case 11:
            _context2.next = 13;
            return _Tenant2.default.findById(user.tenant_id);

          case 13:
            tenant = _context2.sent;
            group_ids = user.groups.map(function (group) {
              return _mongoose2.default.Types.ObjectId(group);
            });
            _context2.next = 17;
            return _Group2.default.find({ _id: group_ids });

          case 17:
            groups = _context2.sent;
            _context2.next = 20;
            return _AuthorityMenu2.default.findOne({ users: user });

          case 20:
            _ref = _context2.sent;
            role_menus = _ref.role_menus;


            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, user.toObject(), {
                tenant: tenant.toObject(),
                role_id: role_menus,
                groups: groups
              })
            });
            _context2.next = 40;
            break;

          case 25:
            _context2.prev = 25;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0;
            _context2.next = _context2.t1 === "user_id is invalid" ? 31 : _context2.t1 === "user_id is empty" ? 33 : _context2.t1 === "user is empty" ? 35 : 37;
            break;

          case 31:
            errors.user_id = "ユーザIDが不正のためユーザの取得に失敗しました";
            return _context2.abrupt("break", 39);

          case 33:
            errors.user_id = "指定されたユーザが存在しないためユーザの取得に失敗しました";
            return _context2.abrupt("break", 39);

          case 35:
            errors.user = _context2.t0;
            return _context2.abrupt("break", 39);

          case 37:
            errors.unknown = _context2.t0;
            return _context2.abrupt("break", 39);

          case 39:

            res.status(400).json({
              status: { success: false, message: "ユーザの取得に失敗しました", errors: errors }
            });

          case 40:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 25]]);
  }));
};

var add = exports.add = function add(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var user, tenant_id, role_id, _user, hash, authority_menus, _ref2, createdUser, createdAuthorityMenu, errors;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            user = new _User2.default(req.body.user);
            tenant_id = res.user.tenant_id;
            role_id = req.body.user.role_id;

            if (!(tenant_id === undefined || tenant_id === null || tenant_id === "")) {
              _context3.next = 6;
              break;
            }

            throw "tenant_id is empty";

          case 6:

            user.tenant_id = tenant_id;

            if (!(user.account_name === undefined || user.account_name === null || user.account_name === "")) {
              _context3.next = 9;
              break;
            }

            throw "account_name is empty";

          case 9:
            if (!(user.account_name.length >= constants.MAX_STRING_LENGTH)) {
              _context3.next = 11;
              break;
            }

            throw "account_name is too long";

          case 11:
            if (!(user.name === undefined || user.name === null || user.name === "")) {
              _context3.next = 13;
              break;
            }

            throw "name is empty";

          case 13:
            if (!(user.name.length >= constants.MAX_STRING_LENGTH)) {
              _context3.next = 15;
              break;
            }

            throw "name is too long";

          case 15:
            if (!(user.email === undefined || user.email === null || user.email === "")) {
              _context3.next = 17;
              break;
            }

            throw "email is empty";

          case 17:
            if (!(user.email.length >= constants.MAX_EMAIL_LENGTH)) {
              _context3.next = 19;
              break;
            }

            throw "email is too long";

          case 19:
            if (!(user.password === undefined || user.password === null || user.password === "")) {
              _context3.next = 21;
              break;
            }

            throw "password is empty";

          case 21:
            if (!(role_id === undefined || role_id === null || role_id === "")) {
              _context3.next = 23;
              break;
            }

            throw "role_id is empty";

          case 23:
            _context3.next = 25;
            return _User2.default.findOne({ account_name: user.account_name });

          case 25:
            _user = _context3.sent;

            if (!(_user !== null)) {
              _context3.next = 28;
              break;
            }

            throw "account_name is duplicate";

          case 28:
            _context3.next = 30;
            return _User2.default.findOne({ email: user.email });

          case 30:
            _user = _context3.sent;

            if (!(_user !== null)) {
              _context3.next = 33;
              break;
            }

            throw "email is duplicate";

          case 33:
            hash = _crypto2.default.createHash("sha512").update(user.password).digest("hex");

            user.password = hash;

            authority_menus = new _AuthorityMenu2.default();

            authority_menus.role_menus = ObjectId(role_id);
            authority_menus.users = user;
            authority_menus.groups = null;

            _context3.next = 41;
            return { createdUser: user.save(), createdAuthorityMenu: authority_menus.save() };

          case 41:
            _ref2 = _context3.sent;
            createdUser = _ref2.createdUser;
            createdAuthorityMenu = _ref2.createdAuthorityMenu;


            res.json({
              status: { success: true },
              body: createdUser
            });
            _context3.next = 76;
            break;

          case 47:
            _context3.prev = 47;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0;
            _context3.next = _context3.t1 === "name is empty" ? 53 : _context3.t1 === "name is too long" ? 55 : _context3.t1 === "account_name is empty" ? 57 : _context3.t1 === "account_name is too long" ? 59 : _context3.t1 === "account_name is duplicate" ? 61 : _context3.t1 === "email is empty" ? 63 : _context3.t1 === "email is too long" ? 65 : _context3.t1 === "email is duplicate" ? 67 : _context3.t1 === "password is empty" ? 69 : _context3.t1 === "role_id is empty" ? 71 : 73;
            break;

          case 53:
            errors.name = "表示名が空のためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 55:
            errors.name = "\u8868\u793A\u540D\u304C\u5236\u9650\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E6\u30FC\u30B6\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context3.abrupt("break", 75);

          case 57:
            errors.account_name = "アカウント名が空のためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 59:
            errors.account_name = "\u30A2\u30AB\u30A6\u30F3\u30C8\u540D\u304C\u5236\u9650\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E6\u30FC\u30B6\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context3.abrupt("break", 75);

          case 61:
            errors.account_name = "既に同アカウント名のユーザが存在するためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 63:
            errors.email = "メールアドレスが空のためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 65:
            errors.email = "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304C\u5236\u9650\u6587\u5B57\u6570(" + constants.MAX_EMAIL_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E6\u30FC\u30B6\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context3.abrupt("break", 75);

          case 67:
            errors.email = "メールアドレスが重複しているためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 69:
            errors.password = "パスワードが空のためユーザの作成に失敗しました";
            return _context3.abrupt("break", 75);

          case 71:
            errors.role_id = "ユーザ種類が空です";
            return _context3.abrupt("break", 75);

          case 73:
            errors = _context3.t0;
            return _context3.abrupt("break", 75);

          case 75:

            res.status(400).json({
              status: { success: false, message: "ユーザの作成に失敗しました", errors: errors }
            });

          case 76:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 47]]);
  }));
};

var updatePassword = exports.updatePassword = function updatePassword(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var user_id, _req$body, current_password, new_password, user, current_hash, new_hash, changedUser, errors;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            user_id = req.params.user_id;
            _req$body = req.body, current_password = _req$body.current_password, new_password = _req$body.new_password;

            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context4.next = 5;
              break;
            }

            throw "user_id is invalid";

          case 5:
            if (!(current_password === null || current_password === "" || current_password === undefined)) {
              _context4.next = 7;
              break;
            }

            throw "current password is empty";

          case 7:
            if (!(new_password === null || new_password === "" || new_password === undefined)) {
              _context4.next = 9;
              break;
            }

            throw "new password is empty";

          case 9:
            _context4.next = 11;
            return _User2.default.findById(user_id);

          case 11:
            user = _context4.sent;

            if (!(user === null || user === undefined)) {
              _context4.next = 14;
              break;
            }

            throw "user not found";

          case 14:
            current_hash = _crypto2.default.createHash("sha512").update(current_password).digest("hex");

            if (!(current_hash !== user.password)) {
              _context4.next = 17;
              break;
            }

            throw "password is not match";

          case 17:
            new_hash = _crypto2.default.createHash("sha512").update(new_password).digest("hex");

            user.password = new_hash;

            _context4.next = 21;
            return user.save();

          case 21:
            changedUser = _context4.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });

            _context4.next = 44;
            break;

          case 25:
            _context4.prev = 25;
            _context4.t0 = _context4["catch"](0);
            errors = {};
            _context4.t1 = _context4.t0;
            _context4.next = _context4.t1 === "user_id is invalid" ? 31 : _context4.t1 === "current password is empty" ? 33 : _context4.t1 === "new password is empty" ? 35 : _context4.t1 === "password is not match" ? 37 : _context4.t1 === "user not found" ? 39 : 41;
            break;

          case 31:
            errors.user_id = "ユーザIDが不正のため変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 33:
            errors.current_password = "現在のパスワードが空のため変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 35:
            errors.new_password = "新しいパスワードが空のため変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 37:
            errors.current_password = "変更前のパスワードが一致しないため変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 39:
            errors.user = "指定されたユーザが存在しないため変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 41:
            errors.unknown = "変更に失敗しました";
            return _context4.abrupt("break", 43);

          case 43:

            res.status(400).json({
              status: { success: false, message: "パスワードの変更に失敗しました", errors: errors }
            });

          case 44:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 25]]);
  }));
};

var updatePasswordForce = exports.updatePasswordForce = function updatePasswordForce(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var user_id, password, user, sha, hash, changedUser, errors;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            user_id = req.params.user_id;
            password = req.body.password;

            if (!(user_id === undefined || user_id === null || user_id === "")) {
              _context5.next = 5;
              break;
            }

            throw "user_id is empty";

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context5.next = 7;
              break;
            }

            throw "user_id is invalid";

          case 7:
            if (!(password === undefined || password === null || password === "")) {
              _context5.next = 9;
              break;
            }

            throw "password is empty";

          case 9:
            _context5.next = 11;
            return _User2.default.findById(user_id);

          case 11:
            user = _context5.sent;

            if (!(user === null)) {
              _context5.next = 14;
              break;
            }

            throw "user is empty";

          case 14:
            sha = _crypto2.default.createHash("sha512");

            sha.update(password);
            hash = sha.digest("hex");


            user.password = hash;
            _context5.next = 20;
            return user.save();

          case 20:
            changedUser = _context5.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });
            _context5.next = 37;
            break;

          case 24:
            _context5.prev = 24;
            _context5.t0 = _context5["catch"](0);
            errors = {};
            _context5.t1 = _context5.t0;
            _context5.next = _context5.t1 === "user_id is invalid" ? 30 : _context5.t1 === "user_id is empty" ? 30 : _context5.t1 === "user is empty" ? 30 : _context5.t1 === "password is empty" ? 32 : 34;
            break;

          case 30:
            errors.user_id = "ユーザIDが不正のためパスワードの変更に失敗しました";
            return _context5.abrupt("break", 36);

          case 32:
            errors.password = "パスワードが空のため変更に失敗しました";
            return _context5.abrupt("break", 36);

          case 34:
            errors.unknown = _context5.t0;
            return _context5.abrupt("break", 36);

          case 36:

            res.status(400).json({
              status: { success: false, message: "パスワードの変更に失敗しました", errors: errors }
            });

          case 37:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 24]]);
  }));
};

var toggleEnabled = exports.toggleEnabled = function toggleEnabled(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
    var user_id, user, changedUser, errors;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            user_id = req.params.user_id;

            if (!(user_id === undefined || user_id === null || user_id === "")) {
              _context6.next = 4;
              break;
            }

            throw "user_id is empty";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context6.next = 6;
              break;
            }

            throw "user_id is invalid";

          case 6:
            _context6.next = 8;
            return _User2.default.findById(user_id);

          case 8:
            user = _context6.sent;

            if (!(user === null)) {
              _context6.next = 11;
              break;
            }

            throw "user is empty";

          case 11:

            user.enabled = !user.enabled;
            _context6.next = 14;
            return user.save();

          case 14:
            changedUser = _context6.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });
            _context6.next = 33;
            break;

          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6["catch"](0);
            errors = {};
            _context6.t1 = _context6.t0;
            _context6.next = _context6.t1 === "user_id is empty" ? 24 : _context6.t1 === "user_id is invalid" ? 26 : _context6.t1 === "user is empty" ? 28 : 30;
            break;

          case 24:
            errors.user_id = _context6.t0;
            return _context6.abrupt("break", 32);

          case 26:
            errors.user_id = "ユーザIDが不正のためユーザの有効化/無効化に失敗しました";
            return _context6.abrupt("break", 32);

          case 28:
            errors.user = "指定されたユーザは存在しません";
            return _context6.abrupt("break", 32);

          case 30:
            errors.unknown = _context6.t0;
            return _context6.abrupt("break", 32);

          case 32:

            res.status(400).json({
              status: { success: false, message: "ユーザの有効化/無効化に失敗しました", errors: errors }
            });

          case 33:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 18]]);
  }));
};

var updateName = exports.updateName = function updateName(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
    var user_id, name, user, changedUser, errors;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            user_id = req.params.user_id;
            name = req.body.name;

            if (!(name === null || name === undefined || name === "")) {
              _context7.next = 5;
              break;
            }

            throw "name is empty";

          case 5:
            if (!(name.length >= constants.MAX_STRING_LENGTH)) {
              _context7.next = 7;
              break;
            }

            throw "name is too long";

          case 7:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context7.next = 9;
              break;
            }

            throw "user_id is invalid";

          case 9:
            _context7.next = 11;
            return _User2.default.findById(user_id);

          case 11:
            user = _context7.sent;

            if (!(user === null)) {
              _context7.next = 14;
              break;
            }

            throw "user not found";

          case 14:

            user.name = name;
            _context7.next = 17;
            return user.save();

          case 17:
            changedUser = _context7.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });

            _context7.next = 38;
            break;

          case 21:
            _context7.prev = 21;
            _context7.t0 = _context7["catch"](0);
            errors = {};
            _context7.t1 = _context7.t0;
            _context7.next = _context7.t1 === "name is empty" ? 27 : _context7.t1 === "name is too long" ? 29 : _context7.t1 === "user_id is invalid" ? 31 : _context7.t1 === "user not found" ? 33 : 35;
            break;

          case 27:
            errors.name = "表示名が空のため変更に失敗しました";
            return _context7.abrupt("break", 37);

          case 29:
            errors.name = "\u8868\u793A\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u5909\u66F4\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context7.abrupt("break", 37);

          case 31:
            errors.user_id = "ユーザIDが不正のため表示名の変更に失敗しました";
            return _context7.abrupt("break", 37);

          case 33:
            errors.user = "指定されたユーザが見つからないため変更に失敗しました";
            return _context7.abrupt("break", 37);

          case 35:
            errors = _context7.t0;
            return _context7.abrupt("break", 37);

          case 37:

            res.status(400).json({
              status: { success: false, message: "ユーザの表示名の変更に失敗しました", errors: errors }
            });

          case 38:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 21]]);
  }));
};

var updateEmail = exports.updateEmail = function updateEmail(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
    var user_id, email, user, changedUser, errors;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            user_id = req.params.user_id;
            email = req.body.email;

            if (!(user_id === "" || user_id === undefined || user_id === null)) {
              _context8.next = 5;
              break;
            }

            throw "user_id is empty";

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context8.next = 7;
              break;
            }

            throw "user_id is invalid";

          case 7:
            if (!(email === "" || email === null || email === undefined)) {
              _context8.next = 9;
              break;
            }

            throw "email is empty";

          case 9:
            if (!(email.length >= constants.MAX_EMAIL_LENGTH)) {
              _context8.next = 11;
              break;
            }

            throw "email is too long";

          case 11:
            _context8.next = 13;
            return _User2.default.findById(user_id);

          case 13:
            user = _context8.sent;

            if (!(user === null)) {
              _context8.next = 16;
              break;
            }

            throw "user is empty";

          case 16:

            user.email = email;
            _context8.next = 19;
            return user.save();

          case 19:
            changedUser = _context8.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });
            _context8.next = 42;
            break;

          case 23:
            _context8.prev = 23;
            _context8.t0 = _context8["catch"](0);
            errors = {};
            _context8.t1 = _context8.t0;
            _context8.next = _context8.t1 === "user_id is empty" ? 29 : _context8.t1 === "email is too long" ? 31 : _context8.t1 === "user_id is invalid" ? 33 : _context8.t1 === "email is empty" ? 35 : _context8.t1 === "user is empty" ? 37 : 39;
            break;

          case 29:
            errors.user_id = _context8.t0;
            return _context8.abrupt("break", 41);

          case 31:
            errors.email = "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_EMAIL_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306E\u5909\u66F4\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context8.abrupt("break", 41);

          case 33:
            errors.user_id = "ユーザIDが不正のためメールアドレスの変更に失敗しました";
            return _context8.abrupt("break", 41);

          case 35:
            errors.email = "指定されたメールアドレスが空のためメールアドレスの変更に失敗しました";
            return _context8.abrupt("break", 41);

          case 37:
            errors.user = "指定されたユーザが存在しないため変更に失敗しました";
            return _context8.abrupt("break", 41);

          case 39:
            errors.unknown = _context8.t0;
            return _context8.abrupt("break", 41);

          case 41:

            res.status(400).json({
              status: {
                success: false,
                message: "メールアドレスの変更に失敗しました",
                errors: errors
              }
            });

          case 42:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this, [[0, 23]]);
  }));
};

var addUserToGroup = exports.addUserToGroup = function addUserToGroup(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
    var user_id, group_id, _ref3, _ref4, user, group, changedUser, errors;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            user_id = req.params.user_id;
            group_id = req.body.group_id;

            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context9.next = 5;
              break;
            }

            throw "user_id is invalid";

          case 5:
            if (!(group_id === undefined || group_id === null || group_id === "")) {
              _context9.next = 7;
              break;
            }

            throw "group_id is empty";

          case 7:
            if (_mongoose2.default.Types.ObjectId.isValid(group_id)) {
              _context9.next = 9;
              break;
            }

            throw "group_id is invalid";

          case 9:
            _context9.next = 11;
            return [_User2.default.findById(user_id), _Group2.default.findById(group_id)];

          case 11:
            _ref3 = _context9.sent;
            _ref4 = (0, _slicedToArray3.default)(_ref3, 2);
            user = _ref4[0];
            group = _ref4[1];

            if (!(user === null)) {
              _context9.next = 17;
              break;
            }

            throw "\u5B58\u5728\u3057\u306A\u3044\u30E6\u30FC\u30B6\u3067\u3059 user_id: " + user_id;

          case 17:
            if (!(group === null)) {
              _context9.next = 19;
              break;
            }

            throw "\u5B58\u5728\u3057\u306A\u3044\u30B0\u30EB\u30FC\u30D7\u3067\u3059 group_id: " + group_id;

          case 19:
            if (!(user.groups.filter(function (id) {
              return id.toString() === group_id;
            }).length > 0)) {
              _context9.next = 21;
              break;
            }

            throw "group_id is already exists";

          case 21:

            user.groups = [].concat((0, _toConsumableArray3.default)(user.groups), [group._id]);

            _context9.next = 24;
            return user.save();

          case 24:
            changedUser = _context9.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });
            _context9.next = 45;
            break;

          case 28:
            _context9.prev = 28;
            _context9.t0 = _context9["catch"](0);
            errors = {};
            _context9.t1 = _context9.t0;
            _context9.next = _context9.t1 === "user_id is invalid" ? 34 : _context9.t1 === "group_id is empty" ? 36 : _context9.t1 === "group_id is invalid" ? 38 : _context9.t1 === "group_id is already exists" ? 40 : 42;
            break;

          case 34:
            errors.user_id = "ユーザIDが不正のためグループの追加に失敗しました";
            return _context9.abrupt("break", 44);

          case 36:
            errors.group_id = "グループIDが空のためグループの追加に失敗しました";
            return _context9.abrupt("break", 44);

          case 38:
            errors.group_id = "グループIDが不正のためグループの追加に失敗しました";
            return _context9.abrupt("break", 44);

          case 40:
            errors.group_id = "指定されたユーザは既に指定したグループに所属しているためグループの追加に失敗しました";
            return _context9.abrupt("break", 44);

          case 42:
            errors.unknown = _context9.t0;
            return _context9.abrupt("break", 44);

          case 44:
            res.status(400).json({
              status: { success: false, message: "グループの追加に失敗しました", errors: errors }
            });

          case 45:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this, [[0, 28]]);
  }));
};

var removeUserOfGroup = exports.removeUserOfGroup = function removeUserOfGroup(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
    var _req$params, user_id, group_id, _ref5, _ref6, user, group, filtered, changedUser, errors;

    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _req$params = req.params, user_id = _req$params.user_id, group_id = _req$params.group_id;

            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context10.next = 4;
              break;
            }

            throw "user_id is invalid";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(group_id)) {
              _context10.next = 6;
              break;
            }

            throw "group_id is invalid";

          case 6:
            _context10.next = 8;
            return [_User2.default.findById(user_id), _Group2.default.findById(group_id)];

          case 8:
            _ref5 = _context10.sent;
            _ref6 = (0, _slicedToArray3.default)(_ref5, 2);
            user = _ref6[0];
            group = _ref6[1];

            if (!(user === null)) {
              _context10.next = 14;
              break;
            }

            throw "user is empty";

          case 14:
            if (!(group === null)) {
              _context10.next = 16;
              break;
            }

            throw "group is empty";

          case 16:
            filtered = user.groups.filter(function (_group) {
              return _group.toString() !== group._id.toString();
            });

            if (!(user.groups.length === filtered.length)) {
              _context10.next = 19;
              break;
            }

            throw "group_id is not found";

          case 19:

            user.groups = filtered;

            _context10.next = 22;
            return user.save();

          case 22:
            changedUser = _context10.sent;

            res.json({
              status: { success: true },
              body: changedUser
            });
            _context10.next = 41;
            break;

          case 26:
            _context10.prev = 26;
            _context10.t0 = _context10["catch"](0);
            errors = {};
            _context10.t1 = _context10.t0;
            _context10.next = _context10.t1 === "user_id is invalid" ? 32 : _context10.t1 === "group_id is invalid" ? 34 : _context10.t1 === "group_id is not found" ? 36 : 38;
            break;

          case 32:
            errors.user_id = "ユーザIDが不正のためグループのメンバ削除に失敗しました";
            return _context10.abrupt("break", 40);

          case 34:
            errors.group_id = "グループIDが不正のためグループのメンバ削除に失敗しました";
            return _context10.abrupt("break", 40);

          case 36:
            errors.group_id = "指定されたグループにユーザが所属していないためグループのメンバ削除に失敗しました";
            return _context10.abrupt("break", 40);

          case 38:
            errors.unknown = _context10.t0;
            return _context10.abrupt("break", 40);

          case 40:
            res.status(400).json({
              status: {
                success: false,
                message: "グループのメンバ削除に失敗しました",
                errors: errors
              }
            });

          case 41:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this, [[0, 26]]);
  }));
};

var updateAccountName = exports.updateAccountName = function updateAccountName(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
    var user_id, account_name, user, changedUser, errors;
    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            user_id = req.params.user_id;
            account_name = req.body.account_name;

            if (!(account_name === null || account_name === undefined || account_name === "")) {
              _context11.next = 5;
              break;
            }

            throw "account_name is empty";

          case 5:
            if (!(account_name.length >= constants.MAX_STRING_LENGTH)) {
              _context11.next = 7;
              break;
            }

            throw "account_name is too long";

          case 7:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context11.next = 9;
              break;
            }

            throw "user_id is invalid";

          case 9:
            _context11.next = 11;
            return _User2.default.findById(user_id);

          case 11:
            user = _context11.sent;

            if (!(user === null)) {
              _context11.next = 14;
              break;
            }

            throw "user not found";

          case 14:

            user.account_name = account_name;
            _context11.next = 17;
            return user.save();

          case 17:
            changedUser = _context11.sent;


            res.json({
              status: { success: true },
              body: changedUser
            });

            _context11.next = 38;
            break;

          case 21:
            _context11.prev = 21;
            _context11.t0 = _context11["catch"](0);
            errors = {};
            _context11.t1 = _context11.t0;
            _context11.next = _context11.t1 === "account_name is empty" ? 27 : _context11.t1 === "account_name is too long" ? 29 : _context11.t1 === "user_id is invalid" ? 31 : _context11.t1 === "user not found" ? 33 : 35;
            break;

          case 27:
            errors.account_name = "アカウント名が空のためログイン名の変更に失敗しました";
            return _context11.abrupt("break", 37);

          case 29:
            errors.account_name = "\u30A2\u30AB\u30A6\u30F3\u30C8\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30ED\u30B0\u30A4\u30F3\u540D\u306E\u5909\u66F4\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context11.abrupt("break", 37);

          case 31:
            errors.user_id = "ユーザIDが不正のためログイン名の変更に失敗しました";
            return _context11.abrupt("break", 37);

          case 33:
            errors.user = "指定されたユーザが見つからないため変更に失敗しました";
            return _context11.abrupt("break", 37);

          case 35:
            errors = _context11.t0;
            return _context11.abrupt("break", 37);

          case 37:

            res.status(400).json({
              status: { success: false, message: "ログイン名の変更に失敗しました", errors: errors }
            });

          case 38:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this, [[0, 21]]);
  }));
};

var getWithGroups = exports.getWithGroups = function getWithGroups(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
    var tenant_id, tenant, conditions, users, groups, returnGroups, mergedUsers, errors;
    return _regenerator2.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            tenant_id = res.user.tenant_id;

            if (!(tenant_id === undefined || tenant_id === null || tenant_id === "")) {
              _context12.next = 4;
              break;
            }

            throw "tenant_id is empty";

          case 4:
            _context12.next = 6;
            return _Tenant2.default.findById(tenant_id);

          case 6:
            tenant = _context12.sent;

            if (!(tenant === null)) {
              _context12.next = 9;
              break;
            }

            throw "tenant is empty";

          case 9:
            conditions = {
              tenant_id: _mongoose2.default.Types.ObjectId(tenant_id)
            };
            _context12.next = 12;
            return _User2.default.aggregate([{ $match: conditions }, { $lookup: { from: "groups", localField: "groups", foreignField: "_id", as: "groups" }
            }]);

          case 12:
            users = _context12.sent;
            _context12.next = 15;
            return _Group2.default.aggregate([{ $match: conditions }]);

          case 15:
            groups = _context12.sent;
            returnGroups = groups.map(function (group) {
              group.type = "group";
              return group;
            });
            mergedUsers = (0, _lodash.concat)(users, returnGroups);


            res.json({
              status: { success: true },
              body: mergedUsers
            });
            _context12.next = 30;
            break;

          case 21:
            _context12.prev = 21;
            _context12.t0 = _context12["catch"](0);
            errors = {};
            _context12.t1 = _context12.t0;
            _context12.next = 27;
            break;

          case 27:
            errors = _context12.t0;
            return _context12.abrupt("break", 29);

          case 29:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 30:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this, [[0, 21]]);
  }));
};

var updateRoleMenus = exports.updateRoleMenus = function updateRoleMenus(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
    var user_id, role_menu_id, _ref7, _ref8, user, role, authorityMenus, savedAuthorityMenus, errors;

    return _regenerator2.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            user_id = req.params.user_id;
            role_menu_id = req.body.role_menu_id;

            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context13.next = 5;
              break;
            }

            throw "user_id is invalid";

          case 5:
            if (!(role_menu_id === undefined || role_menu_id === null || role_menu_id === "")) {
              _context13.next = 7;
              break;
            }

            throw "role_menu_id is empty";

          case 7:
            if (_mongoose2.default.Types.ObjectId.isValid(role_menu_id)) {
              _context13.next = 9;
              break;
            }

            throw "role_menu_id is invalid";

          case 9:
            _context13.next = 11;
            return [_User2.default.findById(user_id), _RoleMenu2.default.findById(role_menu_id)];

          case 11:
            _ref7 = _context13.sent;
            _ref8 = (0, _slicedToArray3.default)(_ref7, 2);
            user = _ref8[0];
            role = _ref8[1];

            if (!(user === null)) {
              _context13.next = 17;
              break;
            }

            throw "user is empty";

          case 17:
            if (!(role === null)) {
              _context13.next = 19;
              break;
            }

            throw "role is empty";

          case 19:
            _context13.t0 = _lodash.first;
            _context13.next = 22;
            return _AuthorityMenu2.default.find({ users: ObjectId(user._id) });

          case 22:
            _context13.t1 = _context13.sent;
            authorityMenus = (0, _context13.t0)(_context13.t1);

            if (authorityMenus === undefined) {
              authorityMenus = new _AuthorityMenu2.default();
              authorityMenus.users = user;
            }

            authorityMenus.role_menus = role;
            _context13.next = 28;
            return authorityMenus.save();

          case 28:
            savedAuthorityMenus = _context13.sent;


            res.json({
              status: { success: true },
              body: savedAuthorityMenus
            });

            _context13.next = 52;
            break;

          case 32:
            _context13.prev = 32;
            _context13.t2 = _context13["catch"](0);
            errors = {};
            _context13.t3 = _context13.t2;
            _context13.next = _context13.t3 === "user_id is invalid" ? 38 : _context13.t3 === "user is empty" ? 40 : _context13.t3 === "role_menu_id is empty" ? 42 : _context13.t3 === "role_menu_id is invalid" ? 44 : _context13.t3 === "role is empty" ? 46 : 48;
            break;

          case 38:
            errors.user_id = "ユーザIDが不正のためメニュー権限の変更に失敗しました";
            return _context13.abrupt("break", 50);

          case 40:
            errors.user = "存在しないユーザです";
            return _context13.abrupt("break", 50);

          case 42:
            errors.role_id = "メニュー権限IDが空のためメニュー権限の変更に失敗しました";
            return _context13.abrupt("break", 50);

          case 44:
            errors.role_id = "メニュー権限IDが不正のためメニュー権限の変更に失敗しました";
            return _context13.abrupt("break", 50);

          case 46:
            errors.role = "存在しないユーザタイプです";
            return _context13.abrupt("break", 50);

          case 48:
            errors = _context13.t2;
            return _context13.abrupt("break", 50);

          case 50:
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, message: "メニュー権限の変更に失敗しました", errors: errors }
            });

          case 52:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this, [[0, 32]]);
  }));
};