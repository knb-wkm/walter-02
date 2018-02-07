"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _elasticsearches = require("../controllers/elasticsearches");

var controller = _interopRequireWildcard(_elasticsearches);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

// 検索用インデックス更新
router.route("/reindex").post(controller.reIndex);
router.route("/reindex_all").get(controller.reIndexAll);
router.route("/reindex_search_detail").post(controller.reIndexSearchResult);

exports.default = router;