"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

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

var _User = require("../../models/User");

var _User2 = _interopRequireDefault(_User);

var _url = require("url");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// model
_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use('/', _3.default);

var base_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user;
var meta_infos;

describe(base_url, function () {
  var uploadFile = {
    name: "file_exists_test_01.txt",
    size: 4,
    mime_type: "text/plain",
    base64: "data:text/plain;base64,Zm9vCg==",
    checksum: "8f3bee6fbae63be812de5af39714824e"
  };

  before(function (done) {
    _builder.initdbPromise.then(function () {
      return new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          user = res.body.body.user;
          request.set('x-auth-cloud-storage', res.body.body.token);
          resolve();
        });
      });
    }).then(function (res) {
      var uploadFiles = {
        dir_id: user.tenant.home_dir_id,
        files: [uploadFile]
      };

      return new Promise(function (resolve, reject) {
        request.post(base_url).send(uploadFiles).end(function (err, res) {
          return resolve(res.body);
        });
      });
    }).then(function (res) {
      done();
    });
  });

  describe("get /exists", function () {
    describe("正常系", function () {
      describe("重複しているファイル名を単数で指定した場合", function () {
        var payload = void 0;
        var existsFiles = void 0;

        before(function (done) {
          existsFiles = {
            dir_id: user.tenant.home_dir_id,
            files: [{ name: uploadFile.name }]
          };

          request.post(base_url + "/exists").send(existsFiles).end(function (err, res) {
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

        it("レスポンスは配列型", function (done) {
          (0, _chai.expect)(Array.isArray(payload.body.body)).equal(true);
          done();
        });

        it("配列のサイズは1つ", function (done) {
          (0, _chai.expect)(payload.body.body.length).equal(1);
          done();
        });

        it("配列内にはオブジェクトが格納されている", function (done) {
          (0, _chai.expect)((0, _typeof3.default)(_.head(payload.body.body))).equal("object");
          done();
        });

        it("オブジェクトはnameのキーが存在する", function (done) {
          var obj = _.head(payload.body.body);
          (0, _chai.expect)(_.has(obj, "name")).equal(true);
          done();
        });

        it("オブジェクトはis_existsのキーが存在する", function (done) {
          var obj = _.head(payload.body.body);
          (0, _chai.expect)(_.has(obj, "is_exists")).equal(true);
          done();
        });

        it("is_existsはtrue", function (done) {
          (0, _chai.expect)(_.head(payload.body.body).is_exists).equal(true);
          done();
        });

        it("nameはrequestにて指定したファイル名と同じ値", function (done) {
          (0, _chai.expect)(_.head(payload.body.body).name).equal(uploadFile.name);
          done();
        });
      });

      describe("重複しているファイル名としていないファイル名を複数で指定した場合", function () {
        var payload = void 0;
        var existsFiles = void 0;

        before(function (done) {
          existsFiles = {
            dir_id: user.tenant.home_dir_id,
            files: [{ name: uploadFile.name }, { name: "arienai.txt" }]
          };

          request.post(base_url + "/exists").send(existsFiles).end(function (err, res) {
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

        it("レスポンスは配列型", function (done) {
          (0, _chai.expect)(Array.isArray(payload.body.body)).equal(true);
          done();
        });

        it("配列のサイズは2つ", function (done) {
          (0, _chai.expect)(payload.body.body.length).equal(2);
          done();
        });

        it("配列内にはオブジェクトが格納されている", function (done) {
          (0, _chai.expect)((0, _typeof3.default)(_.head(payload.body.body))).equal("object");
          done();
        });

        it("オブジェクトはnameのキーが存在する", function (done) {
          var hasColumns = payload.body.body.map(function (body) {
            return _.has(body, "name");
          });
          (0, _chai.expect)(hasColumns.every(function (n) {
            return n === true;
          })).equal(true);
          done();
        });

        it("オブジェクトはis_existsのキーが存在する", function (done) {
          var hasColumns = payload.body.body.map(function (body) {
            return _.has(body, "is_exists");
          });
          (0, _chai.expect)(hasColumns.every(function (n) {
            return n === true;
          })).equal(true);
          done();
        });

        it("先頭のオブジェクトのis_existsはtrue", function (done) {
          (0, _chai.expect)(_.head(payload.body.body).is_exists).equal(true);
          done();
        });

        it("末尾のオブジェクトのis_existsはfalse", function (done) {
          (0, _chai.expect)(_.last(payload.body.body).is_exists).equal(false);
          done();
        });

        it("nameはrequestにて指定したファイル名と同じ値", function (done) {
          (0, _chai.expect)(_.head(payload.body.body).name).equal(uploadFile.name);
          done();
        });
      });
    });
  });
});