"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _2.default);

var users_url = "/api/v1/users";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

describe(users_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        request.set("x-auth-cloud-storage", res.body.body.token);
        user = res.body.body.user;
        done();
      });
    });
  });

  // ユーザ一覧
  describe("get /", function () {
    describe("queryを省略した場合", function () {
      var payload = void 0;

      before(function (done) {
        request.get(users_url).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("0個以上のオブジェクトが返却される", function (done) {
        (0, _chai.expect)(payload.body.body.length > 0).equal(true);
        done();
      });

      describe("userオブジェクトの型", function () {
        var payload = void 0;

        before(function (done) {
          request.get(users_url).end(function (err, res) {
            payload = res.body.body;
            done();
          });
        });

        it("_id, name, account_name, email, tenant_idが含まれている", function (done) {
          var needle = ["_id", "name", "account_name", "email", "tenant_id"];
          var columns = payload.map(function (obj) {
            return (0, _lodash.chain)(obj).pick(needle).keys().value().length === needle.length;
          });

          (0, _chai.expect)(columns.every(function (col) {
            return col === true;
          })).equal(true);
          done();
        });

        it("groupsが含まれている", function (done) {
          var needle = ["groups"];
          var columns = payload.map(function (obj) {
            return (0, _lodash.chain)(obj).pick(needle).keys().value().length === needle.length;
          });

          (0, _chai.expect)(columns.every(function (col) {
            return col === true;
          })).equal(true);
          done();
        });

        it("groups[0]に_id, name, description, tenant_idが含まれている", function (done) {
          var groups = (0, _lodash.chain)(payload).head().value().groups;
          var needle = ["_id", "name", "description", "tenant_id"];
          var intersec = (0, _lodash.chain)(groups).head().pick(needle).keys().value();
          (0, _chai.expect)(intersec.length === needle.length).equal(true);
          done();
        });
      });
    });

    describe("queryにキーワードを指定した場合", function () {
      var payload = void 0;
      var query = { q: "hanako" };

      before(function (done) {
        request.get(users_url).query(query).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("0個以上のオブジェクトが返却される", function (done) {
        (0, _chai.expect)(payload.body.body.length > 0).equal(true);
        done();
      });

      it("指定したキーワードを含んだ(name, account_nameカラム)結果が返却される", function (done) {
        var results = payload.body.body.map(function (obj) {
          return (0, _lodash.includes)(obj.name, query.q) || (0, _lodash.includes)(obj.account_name, query.q);
        });
        (0, _chai.expect)(results.every(function (r) {
          return r === true;
        })).equal(true);
        done();
      });

      describe("userオブジェクトの型", function () {
        it("_id, name, account_name, email, tenant_idが含まれている", function (done) {
          var needle = ["_id", "name", "account_name", "email", "tenant_id"];
          var columns = payload.body.body.map(function (obj) {
            return (0, _lodash.chain)(obj).pick(needle).keys().value().length === needle.length;
          });
          (0, _chai.expect)(columns.every(function (col) {
            return col === true;
          })).equal(true);
          done();
        });

        it("groupsが含まれている", function (done) {
          var needle = ["groups"];
          var columns = payload.body.body.map(function (obj) {
            return (0, _lodash.chain)(obj).pick(needle).keys().value().length === needle.length;
          });
          (0, _chai.expect)(columns.every(function (col) {
            return col === true;
          })).equal(true);
          done();
        });

        it("groups[0]に_id, name, tenant_idが含まれている", function (done) {
          var needle = ["_id", "name", "tenant_id"];
          (0, _chai.expect)((0, _lodash.chain)(payload.body.body).head().pick(needle).keys().value().length).equal(needle.length);
          done();
        });
      });
    });
  });

  // ユーザ作成
  describe("post /", function () {
    describe("account_name, name, email, passwordを正しく指定した場合", function () {
      var payload = void 0;
      var user = {
        account_name: "jiro",
        name: "jiro",
        email: "example@localhost",
        password: "test",
        role_id: null
      };

      before(function (done) {
        request.get("/api/v1/role_menus").end(function (err, res) {
          user.role_id = (0, _lodash.head)(res.body.body)._id;

          request.post(users_url).send({ user: user }).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("作成したユーザの各カラムは0文字以上", function (done) {
        var needle = ["account_name", "name", "email", "role_id", "password"];
        var values = (0, _lodash.chain)(payload.body.body).pick(needle).values().value();
        (0, _chai.expect)(values.every(function (p) {
          return p.length > 0;
        })).equal(true);
        done();
      });

      describe("作成したユーザでログインした場合", function (done) {
        var loginPayload = void 0;

        before(function (done) {
          request.post("/api/login").send({ account_name: user.account_name, password: user.password }).end(function (err, res) {
            loginPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(loginPayload.status).equal(200);
          done();
        });

        it("100文字以上のtokenが返却される", function (done) {
          (0, _chai.expect)(loginPayload.body.body.token.length > 100).equal(true);
          done();
        });
      });
    });

    describe("account_nameが", function () {
      var expected = {
        message: "ユーザの作成に失敗しました",
        detail: "アカウント名が空のためユーザの作成に失敗しました"
      };

      describe("undefinedの場合", function () {

        var payload = void 0;
        var user = {
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var user = {
          account_name: null,
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var user = {
          account_name: "",
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("重複する場合", function () {
        var payload = void 0;
        var user = {
          account_name: _builder.authData.account_name,
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "既に同アカウント名のユーザが存在するためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("255文字以上の場合", function () {
        var payload = void 0;

        var user = {
          account_name: (0, _lodash.range)(256).join(""),
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "アカウント名が制限文字数(255)を超過したためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "アカウント名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        describe("バックスラッシュ", function () {
          var payload = void 0;
          var user = {
            account_name: "\a\b\c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", function () {
          var payload = void 0;
          var user = {
            account_name: "a/b/c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", function () {
          var payload = void 0;
          var user = {
            account_name: "a:b:c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", function () {
          var payload = void 0;
          var user = {
            account_name: "a*b*c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var payload = void 0;
          var user = {
            account_name: "a?b?c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var payload = void 0;
          var user = {
            account_name: "a<b<c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var payload = void 0;
          var user = {
            account_name: "a>b>c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var payload = void 0;
          var user = {
            account_name: "a|b|c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;
              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("statusはfalse", function (done) {
            (0, _chai.expect)(payload.body.status).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("nameが", function () {
      describe("undefinedの場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: null,
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: "",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      // 重複禁止はaccount_nameのみ
      describe.skip("重複する場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "その表示名は既に使用されています"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: _builder.authData.name,
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
            });
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
          (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("255文字以上の場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が制限文字数(255)を超過したためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: (0, _lodash.range)(256).join(""),
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        describe("バックスラッシュ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j\\i\\r\\o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe("スラッシュ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j/i/r/o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe("コロン", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j:i:r:o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe("アスタリスク", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j*i*r*o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j?i?r?o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j<i<r<o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j>i>r>o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "j|i|r|o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("emailが", function () {
      describe("undefinedの場合", function () {
        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: "jiro",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: "jiro",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var user = {
          account_name: "jiro",
          email: "",
          name: "jiro",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("重複する場合", function () {
        var payload = void 0;
        var user = {
          account_name: "email duplicate",
          name: "email duplicate",
          email: _builder.authData.email,
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが重複しているためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("64文字以上の場合", function () {
        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: "jiro",
          email: "jugemjugemjugemjugemjugemjugemjugemjugemjugemjugemjugem@jugem.com",
          password: "test",
          role_id: null
        };

        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが制限文字数(64)を超過したためユーザの作成に失敗しました"
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      // emailの妥当性はライブラリを使用する
      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        describe("バックスラッシュ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j\\i\\r\\o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe("スラッシュ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j/i/r/o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j:i:r:o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j*i*r*o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j?i?r?o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j<i<r<o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j>i>r>o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = {
            account_name: "jiro",
            name: "jiro",
            email: "j|i|r|o",
            password: "test",
            role_id: null
          };

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("passwordが", function () {
      describe("undefinedの場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          password: null,
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        var payload = void 0;
        var user = {
          account_name: "jiro",
          password: "",
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before(function (done) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            user.role_id = (0, _lodash.head)(res.body.body)._id;

            request.post(users_url).send({ user: user }).end(function (err, res) {
              payload = res;
              done();
            });
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      // 対象外
      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        describe("バックスラッシュ", function () {
          var _user;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user = {
            account_name: "jiro",
            name: "jiro",
            password: "t\\e\\s\\t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user, "password", "test"), (0, _defineProperty3.default)(_user, "role_id", null), _user);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", function () {
          var _user2;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user2 = {
            account_name: "jiro",
            name: "jiro",
            password: "t/e/s/t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user2, "password", "test"), (0, _defineProperty3.default)(_user2, "role_id", null), _user2);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", function () {
          var _user3;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user3 = {
            account_name: "jiro",
            name: "jiro",
            password: "t:e:s:t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user3, "password", "test"), (0, _defineProperty3.default)(_user3, "role_id", null), _user3);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", function () {
          var _user4;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user4 = {
            account_name: "jiro",
            name: "jiro",
            password: "t*e*s*t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user4, "password", "test"), (0, _defineProperty3.default)(_user4, "role_id", null), _user4);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var _user5;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user5 = {
            account_name: "jiro",
            name: "jiro",
            password: "t?e?s?t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user5, "password", "test"), (0, _defineProperty3.default)(_user5, "role_id", null), _user5);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var _user6;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user6 = {
            account_name: "jiro",
            name: "jiro",
            password: "t<e<s<t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user6, "password", "test"), (0, _defineProperty3.default)(_user6, "role_id", null), _user6);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var _user7;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user7 = {
            account_name: "jiro",
            name: "jiro",
            password: "t>e>s>t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user7, "password", "test"), (0, _defineProperty3.default)(_user7, "role_id", null), _user7);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var _user8;

          var expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          var payload = void 0;
          var user = (_user8 = {
            account_name: "jiro",
            name: "jiro",
            password: "t|e|s|t",
            email: "example@localhost"
          }, (0, _defineProperty3.default)(_user8, "password", "test"), (0, _defineProperty3.default)(_user8, "role_id", null), _user8);

          before(function (done) {
            request.get("/api/v1/role_menus").end(function (err, res) {
              user.role_id = (0, _lodash.head)(res.body.body)._id;

              request.post(users_url).send({ user: user }).end(function (err, res) {
                payload = res;
                done();
              });
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
            (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
    });
  });

  // ユーザとグループの一覧
  describe("get /with_groups", function () {
    it("frontから呼ばれていないのでテスト不要");
  });
});