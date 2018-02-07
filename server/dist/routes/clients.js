"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();

router.route("/").get(function (req, res) {
  res.sendFile(_path2.default.join(__dirname, '../../../client/build', 'index.html'));
});

exports.default = router;