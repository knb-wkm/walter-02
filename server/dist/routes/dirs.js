"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _dirs = require("../controllers/dirs");

var controllers = _interopRequireWildcard(_dirs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var router = (0, _express.Router)();

router.route("/").get(controllers.index) // ディレクトリの階層
.post(controllers.create); // 作成

// ディレクトリのツリー(以下みたいなやつ)
//   root --- folder1 -- folder1-1
//         |- folder2
//         |- folder3 -- folder3-1
router.route("/tree").get(controllers.tree);

router.route("/:dir_id").get(controllers.view); // ディレクトリの詳細

// フォルダ移動
router.route("/:moving_id/move").patch(controllers.move);

exports.default = router;