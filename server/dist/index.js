"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _log4js = require("log4js");

var _log4js2 = _interopRequireDefault(_log4js);

var _events = require("events");

var _logger = require("./logger");

var _logger2 = _interopRequireDefault(_logger);

var _server = require("./configs/server");

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

var _constants = require("./configs/constants");

var constants = _interopRequireWildcard(_constants);

var _Swift = require("./storages/Swift");

var _elasticsearchclient = require("./elasticsearchclient");

var _elasticsearchclient2 = _interopRequireDefault(_elasticsearchclient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// mongoのipなど
var app = (0, _express2.default)();
// import morgan from "morgan";


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Cache-Control", "no-store");
  next();
});

app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json({ limit: '100mb' }));
// app.use(morgan({ format: "dev", immediate: true }));
app.use(_express2.default.static(_path2.default.join(__dirname, '../../client/build')));
app.use(_log4js2.default.connectLogger(_logger2.default));

// 環境変数
// 開発 => development、社内テスト => integration、本番 => production
var mode = process.env.NODE_ENV;

var url = void 0;
var db_name = void 0;
var port = void 0;

switch (mode) {
  case "integration":
    url = _server.SERVER_CONF.integration.url;
    db_name = _server.SERVER_CONF.integration.db_name;
    port = _server.SERVER_CONF.integration.port;
    break;

  case "production":
    if (!process.env.MONGO_HOST_NAME) throw new Error("env.MONGO_HOST_NAME is not set");

    url = _server.SERVER_CONF.production.url;
    db_name = _server.SERVER_CONF.production.db_name;
    port = _server.SERVER_CONF.production.port;
    break;

  default:
    url = _server.SERVER_CONF.development.url;
    db_name = _server.SERVER_CONF.development.db_name;
    port = _server.SERVER_CONF.development.port;
    break;
}

var event = new _events.EventEmitter();
var status = {};

// mongo, swift, elasticsearchのヘルスチェックが完了通知を受け取ったらappを起動する
event.on("success", function (middleware_name) {
  status[middleware_name] = true;

  if (status.mongo && status.swift && status.elastic) {
    var server = app.listen(port, function () {
      console.log("start server port: " + port);
      _logger2.default.info("start server port: " + port);
    });

    app.use("/", _routes2.default);
  }
});

_mongoose2.default.Promise = global.Promise;

var checkMongo = function checkMongo() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  _mongoose2.default.connect(url + "/" + db_name, { useMongoClient: true }).then(function (res) {
    console.log("mongo connection success");
    _logger2.default.info("mongo connection success");
    event.emit("success", "mongo");
  }).catch(function (e) {
    console.log("mongo connection failed", count + 1);
    _logger2.default.info("mongo connection failed", count + 1);

    setTimeout(function () {
      if (constants.MONGO_CONNECTION_RETRY <= count) throw new Error("mongodb connection failed");
      checkMongo(count + 1);
    }, constants.MONGO_CONNECTION_INTERVAL);
  });
};

var checkSwift = function checkSwift() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var swift = new _Swift.Swift();

  swift.getContainers().then(function (res) {
    console.log("swift connection success");
    _logger2.default.info("swift connection success");
    event.emit("success", "swift");
  }).catch(function (e) {
    console.log("swift connection failed", count + 1);
    _logger2.default.info("swift connection failed", count + 1);

    if (constants.SWIFT_CONNECTION_RETRY <= count) throw new Error("swift connection failed");

    setTimeout(function () {
      checkSwift(count + 1);
    }, constants.SWIFT_CONNECTION_INTERVAL);
  });
};

var checkElastic = function checkElastic() {
  var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  _elasticsearchclient2.default.ping({ requestTimeout: constants.ELASTIC_CONNECTION_TIMEOUT }, function (err) {
    if (err) {
      console.log("elasticsearch connection failed", count + 1);
      _logger2.default.info("elasticsearch connection failed", count + 1);

      if (constants.ELASTIC_CONNECTION_RETRY <= count) throw new Error("elasticsearch connection failed");

      setTimeout(function () {
        checkElastic(count + 1);
      }, constants.ELASTIC_CONNECTION_INTERVAL);
    } else {
      console.log("elasticsearch connection success");
      _logger2.default.info("elasticsearch connection success");
      event.emit("success", "elastic");
    }
  });
};

try {
  checkMongo();
  checkSwift();
  checkElastic();
} catch (e) {
  _logger2.default.error(e);
  process.exit();
}