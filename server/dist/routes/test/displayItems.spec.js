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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _3.default);

var ObjectId = _mongoose2.default.Types.ObjectId;


var items_url = "/api/v1/display_items";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

describe(items_url, function () {

  before(function (done) {
    _builder.initdbPromise.then(function () {
      new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          request.set("x-auth-cloud-storage", res.body.body.token);
          resolve(res);
        });
      }).then(function (res) {
        var user_id = res.body.body._id;

        return new Promise(function (resolve, reject) {
          request.get("/api/v1/users/" + user_id).end(function (err, res) {
            return resolve(res);
          });
        });
      }).then(function (res) {
        user = res.body.body;
        done();
      });
    });
  });

  describe("get /", function () {
    var payload = void 0;

    before(function (done) {
      request.get(items_url).end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(200);
      done();
    });

    it("successはtrue", function (done) {
      (0, _chai.expect)(payload.body.status.success).equal(true);
      done();
    });

    it("必要なカラムを含んでいる", function (done) {
      var needle = ["_id", "tenant_id", "meta_info_id", "label", "name", "is_display", "order", "width"];

      var columns = payload.body.body.map(function (item) {
        return _.keys(item);
      }).map(function (keys) {
        return _.intersection(keys, needle);
      }).map(function (keys) {
        return keys.length === needle.length;
      });

      (0, _chai.expect)(columns.every(function (b) {
        return b === true;
      })).equal(true);
      done();
    });
  });

  describe("get /excels", function () {
    var payload = void 0;

    before(function (done) {
      request.get(items_url + "/excels").end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(200);
      done();
    });

    it("必要なカラムを含んでいる", function (done) {
      var needle = ["_id", "tenant_id", "meta_info_id", "label", "name", "is_display", "is_excel", "order"];

      var columns = payload.body.body.map(function (item) {
        return _.keys(item);
      }).map(function (keys) {
        return _.intersection(keys, needle);
      }).map(function (keys) {
        return keys.length === needle.length;
      });

      (0, _chai.expect)(columns.every(function (b) {
        return b === true;
      })).equal(true);
      done();
    });

    it("is_excelはtrue", function (done) {
      var isExcels = payload.body.body.map(function (item) {
        return item.is_excel;
      });
      (0, _chai.expect)(isExcels.every(function (excel) {
        return excel === true;
      })).equal(true);
      done();
    });

    it("orderは昇順", function (done) {
      var payloadIds = payload.body.body.map(function (b) {
        return b._id;
      }).join(",");

      var lodashIds = _.sortBy(payload.body.body, function (o) {
        return o.order;
      }).map(function (b) {
        return b._id;
      }).join(",");

      (0, _chai.expect)(payloadIds).equal(lodashIds);
      done();
    });
  });
});