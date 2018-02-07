"use strict";

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _supertest = require("supertest");

var _supertest2 = _interopRequireDefault(_supertest);

var _superagentDefaults = require("superagent-defaults");

var _superagentDefaults2 = _interopRequireDefault(_superagentDefaults);

var _chai = require("chai");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _2 = require("../");

var _3 = _interopRequireDefault(_2);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _builder = require("./builder");

var _helper = require("./helper");

var helper = _interopRequireWildcard(_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _3.default);

var ObjectId = _mongoose2.default.Types.ObjectId;


var files_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

describe(files_url + "/search_items", function () {

  before(function (done) {
    _builder.initdbPromise.then(function () {
      new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          request.set("x-auth-cloud-storage", res.body.body.token);
          resolve(res);
        });
      }).then(function (res) {
        var user_id = res.body.body.user._id;
        done();
      });
    });
  });

  describe("queryなしで取得した場合", function () {
    var payload = void 0;

    before(function (done) {
      request.get(files_url + "/search_items").end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(200);
      done();
    });

    it("返却されるオブジェクトは1以上の配列", function (done) {
      (0, _chai.expect)(payload.body.body.length > 0).equal(true);
      done();
    });

    it("返却されるオブジェクトは「_id, tenant_id, label, name, meta_info_id」を含む", function (done) {
      var needle = ["_id", "tenant_id", "label", "name", "meta_info_id"];

      var columns = payload.body.body.map(function (obj) {
        return _.intersection(_.keys(obj), needle);
      }).map(function (keys) {
        return keys.length === needle.length;
      });

      (0, _chai.expect)(columns.every(function (col) {
        return col === true;
      })).equal(true);
      done();
    });
  });

  describe("queryにmeta_only=trueを指定した場合", function () {
    var payload = void 0;

    before(function (done) {
      request.get(files_url + "/search_items").query({ meta_only: true }).end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(200);
      done();
    });

    it("返却されるオブジェクトは1以上の配列", function (done) {
      (0, _chai.expect)(payload.body.body.length > 0).equal(true);
      done();
    });

    it("返却されるオブジェクトは「_id, tenant_id, label, name, value_type」を含む", function (done) {
      var needle = ["_id", "tenant_id", "label", "name", "value_type"];

      var columns = payload.body.body.map(function (obj) {
        return _.intersection(_.keys(obj), needle);
      }).map(function (keys) {
        return keys.length === needle.length;
      });

      (0, _chai.expect)(columns.every(function (col) {
        return col === true;
      })).equal(true);
      done();
    });
  });

  describe("queryにmeta_only=bool以外の値を指定した場合", function () {
    var payload = void 0;

    var expected = {
      message: "検索項目の取得に失敗しました",
      detail: "指定したオプションが真偽値以外のため検索項目の取得に失敗しました"
    };

    before(function (done) {
      request.get(files_url + "/search_items").query({ meta_only: "invalid_params" }).end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(400)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(400);
      done();
    });

    it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
      (0, _chai.expect)(payload.body.status.message).equal(expected.message);
      done();
    });

    it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
      (0, _chai.expect)(payload.body.status.errors.meta_only).equal(expected.detail);
      done();
    });
  });
});