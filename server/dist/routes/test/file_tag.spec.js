"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

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

  describe("タグ追加(post /:file_id/tags)", function () {
    var tag = void 0;

    before(function (done) {
      request.get("/api/v1/tags").end(function (err, res) {
        tag = _.get(res, ["body", "body", "0"]);
        done();
      });
    });

    describe("正しいファイルid, タグidを指定した場合", function () {
      var createdFile = void 0;
      var payload = void 0;

      before(function (done) {
        request.post(files_url).send(body).end(function (err, res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          request.post(files_url + ("/" + createdFile._id + "/tags")).send(tag).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("返却されるオブジェクトに追加したタグidが含まれている", function (done) {
        var matched = _.get(payload, ["body", "body", "tags"]).filter(function (_tag) {
          return _tag._id === tag._id;
        });

        (0, _chai.expect)(matched.length === 1).equal(true);
        done();
      });
    });

    describe("ファイルidがoid形式ではない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの追加に失敗しました",
        detail: "ファイルIDが不正のためタグの追加に失敗しました"
      };

      before(function (done) {
        request.post(files_url).send(body).end(function (err, res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          request.post(files_url + "/invalid_oid/tags").send(tag).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("successはfalse", function (done) {
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

    describe("ファイルidが存在しない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの追加に失敗しました",
        detail: "指定されたファイルが存在しないためタグの追加に失敗しました"
      };

      before(function (done) {
        request.post(files_url).send(body).end(function (err, res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          request.post(files_url + ("/" + ObjectId() + "/tags")).send(tag).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("successはfalse", function (done) {
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

    describe("タグidがoid形式ではない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの追加に失敗しました",
        detail: "タグIDが不正のためタグの追加に失敗しました"
      };

      before(function (done) {
        request.post(files_url).send(body).end(function (err, res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          request.post(files_url + ("/" + createdFile._id + "/tags")).send((0, _extends3.default)({}, tag, { _id: "invalid_id" })).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("successはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidが存在しない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの追加に失敗しました",
        detail: "指定されたタグが存在しないためタグの追加に失敗しました"
      };

      before(function (done) {
        request.post(files_url).send(body).end(function (err, res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          request.post(files_url + ("/" + createdFile._id + "/tags")).send((0, _extends3.default)({}, tag, { _id: ObjectId() })).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(400)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(400);
        done();
      });

      it("successはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });
  });

  describe("タグ削除(delete /:file_id/tags/:tag_id)", function () {
    var tag = void 0;

    before(function (done) {
      request.get("/api/v1/tags").end(function (err, res) {
        tag = _.get(res, ["body", "body", "0"]);
        done();
      });
    });

    describe("正しいファイルid, タグidを指定した場合", function () {
      var createdFile = void 0;
      var payload = void 0;

      before(function (done) {
        var _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise(function (resolve, reject) {
          request.post(files_url).send(_body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/" + createdFile._id + "/tags/" + tag._id)).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("返却されるオブジェクトに追加したタグidが含まれていない", function (done) {
        var matched = _.get(payload, ["body", "body", "tags"]).filter(function (_tag) {
          return _tag._id === tag._id;
        });

        (0, _chai.expect)(matched.length === 0).equal(true);
        done();
      });
    });

    describe("ファイルidがoid形式ではない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの削除に失敗しました",
        detail: "ファイルIDが不正のためタグの削除に失敗しました"
      };

      before(function (done) {
        var _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise(function (resolve, reject) {
          request.post(files_url).send(_body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/invalid_id/tags/" + tag._id)).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("ファイルidが存在しない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの削除に失敗しました",
        detail: "指定されたファイルが存在しないためタグの削除に失敗しました"
      };

      before(function (done) {
        var _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise(function (resolve, reject) {
          request.post(files_url).send(_body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/" + ObjectId() + "/tags/" + tag._id)).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidがoid形式ではない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの削除に失敗しました",
        detail: "タグIDが不正のためタグの削除に失敗しました"
      };

      before(function (done) {
        var _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise(function (resolve, reject) {
          request.post(files_url).send(_body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/" + createdFile._id + "/tags/invalid_id")).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidが存在しない場合", function () {
      var createdFile = void 0;
      var payload = void 0;
      var expected = {
        message: "タグの削除に失敗しました",
        detail: "指定されたタグが存在しないためタグの削除に失敗しました"
      };

      before(function (done) {
        var _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise(function (resolve, reject) {
          request.post(files_url).send(_body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/" + createdFile._id + "/tags/" + ObjectId())).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });
  });
});