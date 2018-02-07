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

describe(files_url, function () {
  var user = void 0;
  var body = {
    files: [{
      name: "test.txt",
      size: 4,
      mime_type: "text/plain",
      base64: "data:text/plain;base64,Zm9vCg==",
      checksum: "8f3bee6fbae63be812de5af39714824e"
    }]
  };

  before(function (done) {
    _builder.initdbPromise.then(function () {
      new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          request.set("x-auth-cloud-storage", res.body.body.token);
          resolve(res);
        });
      }).then(function (res) {
        user = res.body.body.user;
        done();
      });
    });
  });

  describe("patch /:file_id/toggle_star", function () {
    describe("正しいfile_idを指定した場合", function () {
      var file = void 0;
      var payload = void 0;
      var nextPayload = void 0;

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.head(res.body.body);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + file._id + "/toggle_star")).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + file._id + "/toggle_star")).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          nextPayload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("作成時、is_starはfalseになっている", function (done) {
        (0, _chai.expect)(file.is_star).equal(false);
        done();
      });

      it("トグル実行後、is_starはfalse -> trueになっている", function (done) {
        (0, _chai.expect)(payload.body.body.is_star).equal(true);
        done();
      });

      it("再度トグル実行後、is_starはtrue -> falseになっている", function (done) {
        (0, _chai.expect)(nextPayload.body.body.is_star).equal(false);
        done();
      });
    });

    describe("file_idがoid形式ではない場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルのお気に入りの設定に失敗しました",
        detail: "ファイルIDが不正のためファイルのお気に入りの設定に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.head(res.body.body);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + "/invalid_oid/toggle_star").end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;
          done();
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("file_idが存在しないidの場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルのお気に入りの設定に失敗しました",
        detail: "指定されたファイルが存在しないためファイルのお気に入りの設定に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.head(res.body.body);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + ObjectId() + "/toggle_star")).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;
          done();
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });
  });
});