"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _tags = require("../controllers/tags");

var controller = _interopRequireWildcard(_tags);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

// 一覧
router.route("/").get(controller.index).post(controller.create);

// 詳細
router.route("/:tag_id").get(controller.view).delete(controller.remove);

// label変更
router.route("/:tag_id/label").patch(controller.changeLabel);

// color変更
router.route("/:tag_id/color").patch(controller.changeColor);

exports.default = router;