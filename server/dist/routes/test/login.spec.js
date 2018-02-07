"use strict";

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _supertest = require("supertest");

var _supertest2 = _interopRequireDefault(_supertest);

var _chai = require("chai");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _builder = require("./builder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var base_url = "/api/login";

describe(base_url, function () {
  _builder.app.use("/", _2.default);
  _mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });

  // 前処理でdbを初期化しておく
  // shellがtimeoutになる場合、mochaの--timeoutオプションを変更する
  before(function (done) {
    _builder.initdbPromise.then(function () {
      return done();
    });
  });

  describe("post /", function () {
    describe("request bodyがundefineの場合", function () {

      // 期待するエラーの情報
      var expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名が空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("statusはfalse", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });
    });

    describe("account_nameがnullの場合", function () {
      var body = { account_name: null };
      var expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名が空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("statusはfalse", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });
    });

    describe("passwordがnullの場合", function () {
      var body = { account_name: "hanako", password: null };
      var expected = {
        message: "ユーザ認証に失敗しました",
        detail: "パスワードが空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("statusはfalse", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.password).equal(expected.detail);
          done();
        });
      });
    });

    describe("指定されたaccount_nameがユーザマスタに存在しない場合", function () {
      var body = { account_name: "nanashi", password: "nanashi" };
      var expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名またはパスワードが不正のため認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("statusはfalse", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });
    });

    describe("パスワードが保存されたものと一致しない場合", function () {
      var body = { account_name: "hanako", password: "xxxx" };
      var expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名またはパスワードが不正のため認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("statusはfalse", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.success).equal(false);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.password).equal(expected.detail);
          done();
        });
      });
    });

    describe("適切なaccount_name, passwordを渡した場合", function () {
      var body = { account_name: "hanako", password: "test" };
      var expected = {
        message: "ユーザ認証に成功しました"
      };

      it("http(200)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(200);
          done();
        });
      });

      it("\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("100文字以上のtoken文字列が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.body.token.length > 100).equal(true);
          done();
        });
      });

      it("ユーザの_id, tenant_idを含んだオブジェクトが返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.body.user._id.length > 0).equal(true);
          (0, _chai.expect)(res.body.body.user.tenant_id.length > 0).equal(true);
          done();
        });
      });
    });
  });

  describe("post /verify_token", function () {
    var verify_token_url = base_url + "/verify_token";

    describe("tokenが未定義の場合", function () {
      var body = {};
      var expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが空のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.token).equal(expected.detail);
          done();
        });
      });
    });

    describe("tokenがnullの場合", function () {
      var body = { token: null };
      var expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが空のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.token).equal(expected.detail);
          done();
        });
      });
    });

    describe("tokenの検証に失敗した場合", function (done) {
      var body = { token: "foobazbar" };
      var expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが不正のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(400);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.errors.token).equal(expected.detail);
          done();
        });
      });
    });

    describe("検証可能なトークンを渡した場合", function (done) {
      var body = {};
      var expected = {
        message: "トークン認証に成功しました"
      };

      before(function (done) {
        (0, _supertest2.default)(_builder.app).post(base_url).send({ account_name: "hanako", password: "test" }).end(function (err, res) {
          body.token = res.body.body.token;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(200);
          done();
        });
      });

      // 成功時はメッセージ不要
      it.skip("\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.status.message).equal(expected.message);
          done();
        });
      });

      it("ユーザid, nameを含んだユーザオブジェクトが返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.body.user._id.length > 0).equal(true);
          (0, _chai.expect)(res.body.body.user.name.length > 0).equal(true);
          done();
        });
      });

      it("token期限の開始、終了が返却される", function (done) {
        (0, _supertest2.default)(_builder.app).post(verify_token_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.body.body.user.iat * 2 > 1).equal(true);
          done();
        });
      });
    });
  });
});