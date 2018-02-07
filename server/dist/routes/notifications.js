"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _notifications = require("../controllers/notifications");

var controller = _interopRequireWildcard(_notifications);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.get("/", controller.view) // お知らせ一覧取得
.post("/", controller.add); // お知らせの追加

// すべてのお知らせ一覧取得
router.get("/all", controller.index);

// 既読に更新
router.patch("/read", controller.updateRead);
// 未読に更新
router.patch("/unread", controller.updateUnRead);

exports.default = router;