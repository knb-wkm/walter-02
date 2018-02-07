"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _metaInfos = require("../controllers/metaInfos");

var controllers = _interopRequireWildcard(_metaInfos);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.route("/").get(controllers.index) // 一覧
.post(controllers.add); // 作成

router.route("/value_type").get(controllers.valueType); // データ型一覧

router.route("/:metainfo_id").get(controllers.view); // 詳細

router.route("/:metainfo_id/label").patch(controllers.updateLabel); // 表示名更新

router.route("/:metainfo_id/name").patch(controllers.updateName); // 表示名更新

exports.default = router;