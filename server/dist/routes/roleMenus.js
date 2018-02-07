"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _roleMenus = require("../controllers/roleMenus");

var controller = _interopRequireWildcard(_roleMenus);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

// 一覧,作成
router.route("/").get(controller.index).post(controller.create);

// 詳細,削除
router.route("/:role_id").get(controller.view).delete(controller.remove);

// 名前変更
router.route("/:role_id/name").patch(controller.updateName);

// 備考変更
router.route("/:role_id/description").patch(controller.updateDescription);

// menu追加,削除
router.route("/:role_id/menus/:menu_id").patch(controller.addMenuToRoleMenu).delete(controller.removeMenuOfRoleMenu);

exports.default = router;