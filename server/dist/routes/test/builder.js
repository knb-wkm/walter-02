"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authData = exports.initdbPromise = exports.mongoUrl = exports.app = undefined;

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _child_process = require("child_process");

var _server = require("../../configs/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// express初期化
var app = (0, _express2.default)();
app.use(_bodyParser2.default.json({ limit: "100MB" }));

// mongodbのurl(mongodb://xxxx)
var url = _server.SERVER_CONF.development.url;
var db_name = _server.SERVER_CONF.development.db_name;
var mongoUrl = url + "/" + db_name;

// mongoをinitするコマンド
var batch_path = _path2.default.join(__dirname, "../../../jobs/loadTestData.js");
var db_host = _server.SERVER_CONF.development.db_host;
var command = "/usr/local/bin/mongo " + db_host + "/" + db_name + " --quiet " + batch_path;

// mochaのbeforeはPromiseを返却する必要があるので
var initdbPromise = new Promise(function (resolve, reject) {
  (0, _child_process.exec)(command, function (err, stdout, stderr) {
    if (err) return reject({ err: err, stderr: stderr });
    return resolve();
  });
}).then(function (res) {
  // elasticsearchのmapping
  return new Promise(function (resolve, reject) {
    (0, _child_process.exec)("npm run init-elasticsearch", function (err, stdout, stderr) {
      if (err) return reject({ err: err, stderr: stderr });
      return resolve();
    });
  });
});

// とりあえず
var authData = {
  account_name: "taro",
  name: "taro",
  email: "taro",
  password: "test",
  tenant_name: "test"
};

exports.app = app;
exports.mongoUrl = mongoUrl;
exports.initdbPromise = initdbPromise;
exports.authData = authData;