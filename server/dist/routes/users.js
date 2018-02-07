"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

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

var _users = require("../controllers/users");

var controllers = _interopRequireWildcard(_users);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();

router.route("/").get(controllers.index) // 一覧
.post(controllers.add); // 作成

router.route("/with_groups").get(controllers.getWithGroups);

router.route("/:user_id").get(controllers.view); // 詳細

router.route("/:user_id/groups").post(controllers.addUserToGroup); // 所属グループの追加

router.route("/:user_id/password").patch(controllers.updatePassword); // パスワード変更

router.route("/:user_id/password_force").patch(controllers.updatePasswordForce); // パスワード変更(管理者)

router.route("/:user_id/enabled").patch(controllers.toggleEnabled); // 有効/無効

router.route("/:user_id/account_name").patch(controllers.updateAccountName); // アカウント名変更

router.route("/:user_id/name").patch(controllers.updateName); // 表示名変更

router.route("/:user_id/email").patch(controllers.updateEmail); // メールアドレス変更

router.route("/:user_id/groups").post(controllers.addUserToGroup); // 所属グループの追加

router.route("/:user_id/groups/:group_id").delete(controllers.removeUserOfGroup); // 所属グループの削除


router.route("/:user_id/role_menus").patch(controllers.updateRoleMenus); // role_menusの変更

exports.default = router;