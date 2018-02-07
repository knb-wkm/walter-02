"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _groups = require("../controllers/groups");

var controller = _interopRequireWildcard(_groups);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.route("/").get(controller.index).post(controller.create);

router.route("/:group_id").get(controller.view).delete(controller.remove);

router.route("/:group_id/name").patch(controller.updateName);
router.route("/:group_id/description").patch(controller.updateDescription);
router.route("/:group_id/role_menus").patch(controller.updateRoleMenus);

exports.default = router;