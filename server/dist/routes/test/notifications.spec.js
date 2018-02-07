"use strict";

var _supertest = require("supertest");

var _supertest2 = _interopRequireDefault(_supertest);

var _superagentDefaults = require("superagent-defaults");

var _superagentDefaults2 = _interopRequireDefault(_superagentDefaults);

var _chai = require("chai");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _lodash = require("lodash");

var _builder = require("./builder");

var _User = require("../../models/User");

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _2.default);

var base_url = "/api/v1/notifications";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var auth = void 0;

describe(base_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        request.set("x-auth-cloud-storage", res.body.body.token);
        done();
      });
    });
  });

  describe("get /", function () {
    it("http(200)が返却される", function (done) {
      request.get(base_url).expect(200).end(function (err, res) {
        (0, _chai.expect)(res.status).equal(200);
        done();
      });
    });
    it("返却値に success が含まれる", function (done) {
      request.get(base_url).end(function (err, res) {
        (0, _chai.expect)((0, _lodash.has)(res.body.status, 'success')).equal(true);
        (0, _chai.expect)(res.body.status.success).equal(true);
        done();
      });
    });
    it("返却値に total が含まれる", function (done) {
      request.get(base_url).end(function (err, res) {
        (0, _chai.expect)((0, _lodash.has)(res.body.status, 'total')).equal(true);
        done();
      });
    });
    it("返却値に unread が含まれる", function (done) {
      request.get(base_url).end(function (err, res) {
        (0, _chai.expect)((0, _lodash.has)(res.body.status, 'unread')).equal(true);
        done();
      });
    });
    it("返却値に page が含まれる", function (done) {
      request.get(base_url).end(function (err, res) {
        (0, _chai.expect)((0, _lodash.has)(res.body.status, 'page')).equal(true);
        done();
      });
    });
  });

  describe("post /", function () {

    describe("request notifications がundefinedの場合", function () {
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "お知らせが空のためお知らせの登録に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.notifications).equal(expected.detail);
          done();
        });
      });
    });

    describe("request title が undefined の場合", function () {
      var body = { "notifications": {} };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.title).equal(expected.detail);
          done();
        });
      });
    });

    describe("request title が null の場合", function () {
      var body = { "notifications": { title: null } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.title).equal(expected.detail);
          done();
        });
      });
    });

    describe('request title が "" の場合', function () {
      var body = { "notifications": { title: "" } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.title).equal(expected.detail);
          done();
        });
      });
    });

    describe('request body が undefined の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト"
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.body).equal(expected.detail);
          done();
        });
      });
    });

    describe('request body が null の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: null
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.body).equal(expected.detail);
          done();
        });
      });
    });

    describe('request body が "" の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: ""
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.body).equal(expected.detail);
          done();
        });
      });
    });

    describe('request users が undefined の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: "お知らせの本文"
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.users).equal(expected.detail);
          done();
        });
      });
    });

    describe('request users が null の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: null
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.users).equal(expected.detail);
          done();
        });
      });
    });

    describe('request users が null の場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: ""
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.users).equal(expected.detail);
          done();
        });
      });
    });

    describe('request users に存在しないユーザを指定した場合', function () {
      var body = { "notifications": {
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: [_mongoose2.default.Types.ObjectId('aa000538487b17bb156ffdd1')]
        } };
      // 期待するエラーの情報
      var expected = {
        message: "お知らせの登録に失敗しました",
        detail: "指定されたユーザーが存在しないためお知らせの登録に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        request.post(base_url).send(body).expect(400).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("status は false", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.user).equal(expected.detail);
          done();
        });
      });
    });

    describe('お知らせの登録,および,取得', function () {

      // 登録するデータ
      var body = { notifications: {
          title: "お知らせテスト",
          body: "お知らせの本文"
        } };

      describe('taroにお知らせを登録', function () {
        it('http(200)が返却される', function (done) {
          _User2.default.findOne({ name: "taro" }, function (err, res) {
            body.notifications.users = [res._id];

            request.post(base_url).send(body).expect(200).end(function (err, res) {
              (0, _chai.expect)(res.status).equal(200);
              done();
            });
          });
        });
      });

      describe('ログインユーザ（taro）のお知らせを取得する', function () {
        it('お知らせが一件登録されている', function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(1);
            (0, _chai.expect)(res.body.status.total).equal(1);
            done();
          });
        });

        it('お知らせの未読件数が1件', function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.body.status.unread).equal(1);
            done();
          });
        });

        it("\u304A\u77E5\u3089\u305B\u306E\u30BF\u30A4\u30C8\u30EB\u304C\u300C" + body.notifications.title + "\u300D", function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)((0, _lodash.first)(res.body.body).notifications.title).equal(body.notifications.title);
            done();
          });
        });

        it("\u304A\u77E5\u3089\u305B\u306E\u672C\u6587\u304C\u300C" + body.notifications.body + "\u300D", function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)((0, _lodash.first)(res.body.body).notifications.body).equal(body.notifications.body);
            done();
          });
        });

        it('お知らせの状態が未読', function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)((0, _lodash.first)(res.body.body).notifications.read).equal(false);
            done();
          });
        });
      });
    });

    describe('登録されているお知らせを既読にする', function () {

      it('http(200)が返却される', function (done) {
        request.get(base_url).expect(200).end(function (err, res) {
          var body = {
            notifications: [(0, _lodash.first)(res.body.body).notifications._id]
          };
          request.patch(base_url + "/read").send(body).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(200);
            done();
          });
        });
      });
      it('お知らせの状態が既読', function (done) {
        request.get(base_url).expect(200).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.first)(res.body.body).notifications.read).equal(true);
          done();
        });
      });
    });

    describe('お知らせを複数(10件)登録する', function () {

      before(function (done) {

        // 登録するデータ
        var body = { notifications: {
            title: "お知らせテスト",
            body: "お知らせの本文"
          } };

        _User2.default.findOne({ name: "taro" }, function (err, res) {
          body.notifications.users = [res._id];
          var hoge = (0, _lodash.range)(2, 12).map(function (i) {

            body.notifications.title;
            body.notifications.body;

            return new Promise(function (resolve, reject) {
              request.post(base_url).send(body).expect(200).end(function (err, res) {
                resolve(res.body.body);
              });
            });
          });

          Promise.all(hoge).then(function (res) {
            done();
          });
        });
      });

      it("\u304A\u77E5\u3089\u305B\u304C\u516811\u4EF6,\u3046\u3061\u672A\u8AAD10\u4EF6\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u308B", function (done) {
        request.get(base_url).expect(200).end(function (err, res) {
          (0, _chai.expect)(res.body.status.total).equal(11);
          (0, _chai.expect)(res.body.status.unread).equal(10);
          done();
        });
      });

      describe('1ページ目を取得', function () {
        it("\u53D6\u5F97\u4EF6\u6570\u304C5\u4EF6\u3067\u3042\u308B", function (done) {
          request.get(base_url).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(5);
            done();
          });
        });
      });
      describe('2ページ目を取得', function () {
        it("\u53D6\u5F97\u4EF6\u6570\u304C5\u4EF6\u3067\u3042\u308B", function (done) {
          request.get(base_url).query({ page: '1' }).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(5);
            done();
          });
        });
      });
      describe('3ページ目を取得', function () {
        it("\u53D6\u5F97\u4EF6\u6570\u304C1\u4EF6\u3067\u3042\u308B", function (done) {
          request.get(base_url).query({ page: '2' }).expect(200).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(1);
            done();
          });
        });
        it("\u65E2\u8AAD\u4EF6\u6570\u304C1\u4EF6\u3067\u3042\u308B", function (done) {
          request.get(base_url).query({ page: '2' }).expect(200).end(function (err, res) {
            var readNotification = res.body.body.filter(function (notification) {
              return notification.notifications.read === true;
            });
            (0, _chai.expect)(readNotification.length).equal(1);
            done();
          });
        });
      });
    });
  });
});