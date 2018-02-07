"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _excels = require("../controllers/excels");

var controller = _interopRequireWildcard(_excels);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

// excel形式でダウンロード
router.get("/", controller.index);
router.get("/search", controller.search);
router.post("/search_detail", controller.searchDetail);

exports.default = router;