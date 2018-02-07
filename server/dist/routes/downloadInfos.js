"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _downloadInfos = require("../controllers/downloadInfos");

var controller = _interopRequireWildcard(_downloadInfos);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.post("/", controller.add);
router.put("/:downloadinfo_id/update", controller.update);
router.get("/:downloadinfo_type", controller.index);

exports.default = router;