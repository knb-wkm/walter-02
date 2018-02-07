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

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _lodash = require("lodash");

var _builder = require("./builder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _2.default);

var user_url = "/api/v1/users";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

// ユーザ詳細
describe(user_url + "/:user_id", function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        request.set("x-auth-cloud-storage", res.body.body.token);
        user = res.body.body.user;
        done();
      });
    });
  });

  describe("get /", function () {
    describe("ログインユーザのuser_idを指定した場合", function () {
      var payload = void 0;

      before(function (done) {
        request.get(user_url + ("/" + user._id)).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("1個のオブジェクトが返却される", function (done) {
        (0, _chai.expect)((0, _typeof3.default)(payload.body.body) === "object").equal(true);
        done();
      });

      describe("userオブジェクトの型", function () {
        it("_id, name, account_name, email, tenant_idが含まれている", function (done) {
          var needle = ["_id", "name", "account_name", "email", "tenant_id"];
          (0, _chai.expect)((0, _lodash.chain)(payload.body.body).pick(needle).keys().value().length === needle.length).equal(true);

          done();
        });

        it("groupsが含まれている", function (done) {
          var needle = ["groups"];
          (0, _chai.expect)((0, _lodash.chain)(payload.body.body).pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it("groups[0]に_id, name, description, tenant_idが含まれている", function (done) {
          var needle = ["_id", "name", "description", "tenant_id"];
          var columns = (0, _lodash.chain)(payload.body.body.groups).head().pick(needle).keys().value();
          (0, _chai.expect)(columns.length === needle.length).equal(true);
          done();
        });

        it("groups[0].tenantにはname, role_files, tenant_id, rolesが含まれている", function (done) {
          var needle = ["name", "role_files", "tenant_id", "roles"];
          var tenant = (0, _lodash.chain)(payload.body.body.groups).head().value();
          var columns = (0, _lodash.chain)(tenant).pick(needle).keys().value();
          (0, _chai.expect)(columns.length === needle.length).equal(true);
          done();
        });
      });
    });

    describe("指定されたuser_idが", function () {
      describe("存在しないoidの場合", function () {
        var payload = void 0;
        var expected = {
          message: "ユーザの取得に失敗しました",
          detail: "ユーザIDが不正のためユーザの取得に失敗しました"
        };

        before(function (done) {
          request.get(user_url + "/undefined_oid").end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });
  });

  // 所属グループの追加
  describe("post /:user_id/groups", function () {
    describe("user_id, group_idを正しく指定した場合", function () {
      var payload = void 0;
      var group_id = void 0;
      var changedUser = void 0;

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.get("/api/v1/groups").end(function (err, res) {
            if (err) reject(err);
            resolve(res);
          });
        }).then(function (res) {
          group_id = res.body.body[1]._id;

          return new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).send({ group_id: group_id }).end(function (err, res) {
              if (err) reject(err);
              resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.get(user_url + ("/" + user._id)).end(function (err, res) {
              if (err) reject(err);
              resolve(res);
            });
          });
        }).then(function (res) {
          changedUser = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("変更したユーザを取得した場合、追加したグループを含めた結果が返却される", function (done) {
        var group_ids = changedUser.body.body.groups.map(function (group) {
          return group._id;
        }).filter(function (id) {
          return id === group_id;
        });

        (0, _chai.expect)(group_ids.length === 1).equal(true);
        done();
      });
    });

    describe("指定されたuser_idが", function () {
      describe("存在しないoidの場合", function () {
        var payload = void 0;
        var group_id = void 0;
        var expected = {
          message: "グループの追加に失敗しました",
          detail: "ユーザIDが不正のためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.get("/api/v1/groups").end(function (err, res) {
              resolve(res);
            });
          }).then(function (res) {
            group_id = (0, _lodash.head)(res.body.body)._id;

            return new Promise(function (resolve, reject) {
              request.post(user_url + "/invalid_oid/groups").send({ group_id: group_id }).end(function (err, res) {
                resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("指定されたgroup_idが", function () {
      describe("undefinedの場合", function () {
        var payload = void 0;
        var expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var group_id = null;
        var expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).send({ group_id: group_id }).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var group_id = "";
        var expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).send({ group_id: group_id }).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないoidの場合", function () {
        var payload = void 0;
        var group_id = "invalid_oid";
        var expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが不正のためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).send({ group_id: group_id }).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("重複している場合", function () {
        var payload = void 0;

        var expected = {
          message: "グループの追加に失敗しました",
          detail: "指定されたユーザは既に指定したグループに所属しているためグループの追加に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(user_url + ("/" + user._id + "/groups")).send({ group_id: (0, _lodash.head)(user.groups) }).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });
    });
  });

  // パスワード変更(ユーザ向け)
  describe("patch /:user_id/password", function () {

    // 変更したパスワードを元に戻す
    afterEach(function (done) {
      new Promise(function (resolve, reject) {
        request.patch(user_url + ("/" + user._id + "/password_force")).send({ password: _builder.authData.password }).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        done();
      });
    });

    describe("ログインユーザのuser_id、正しいパスワードを指定した場合", function () {
      var payload = void 0;
      var afterPayload = void 0;
      var body = {
        current_password: _builder.authData.password,
        new_password: _builder.authData.password + _builder.authData.password
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.post(login_url).send({
              account_name: _builder.authData.account_name,
              password: body.new_password
            }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          afterPayload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("変更したパスワードでログインした場合", function () {
        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(afterPayload.status).equal(200);
          done();
        });

        it("tokenが返却される", function (done) {
          (0, _chai.expect)(afterPayload.body.body.token.length > 0).equal(true);
          done();
        });

        it("userオジェクトが返却される", function (done) {
          (0, _chai.expect)(afterPayload.body.body.user._id.length > 0).equal(true);
          done();
        });
      });
    });

    describe("current_passwordが", function () {
      describe("undefinedの場合", function () {
        var payload = void 0;
        var body = {
          new_password: _builder.authData.password + _builder.authData.password
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var body = {
          current_password: null,
          new_password: _builder.authData.password + _builder.authData.password
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var body = {
          current_password: "",
          new_password: _builder.authData.password + _builder.authData.password
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("現在のパスワードと一致しない場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password + _builder.authData.password,
          new_password: _builder.authData.password + _builder.authData.password
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "変更前のパスワードが一致しないため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });
    });

    describe("new_passwordが", function () {
      describe("undefinedの場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password,
          new_password: null
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password,
          new_password: ""
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      // パスワードは文字数制限の対象外
      describe.skip("255文字以上の場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password,
          new_password: (0, _lodash.range)(256).join("")
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが長すぎます"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      // パスワードは禁止文字の対象外
      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        describe("バックスラッシュ", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo\\foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo/foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("コロン", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo:foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });
        describe("アスタリスク", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo*foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo?foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo<foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo>foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var payload = void 0;
          var body = {
            current_password: _builder.authData.password,
            new_password: "foo|foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("user_idが", function () {
      describe("存在しないoidの場合", function () {
        var payload = void 0;
        var body = {
          current_password: _builder.authData.password,
          new_password: "foobar"
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "ユーザIDが不正のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + "/invalid_oid/password").send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });
  });

  // パスワード変更(管理者向け)
  describe("patch /:user_id/password_force", function () {

    // 変更したパスワードを元に戻す
    afterEach(function (done) {
      new Promise(function (resolve, reject) {
        request.patch(user_url + ("/" + user._id + "/password_force")).send({ password: _builder.authData.password }).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        done();
      });
    });

    describe("ログインユーザのuser_id、正しいパスワードを指定した場合", function () {
      var payload = void 0;
      var body = {
        password: "foobar"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
            return resolve(res);
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

      describe("変更したパスワードでログインした場合", function () {
        var payload = void 0;

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(login_url).send({
              account_name: _builder.authData.account_name,
              password: _builder.authData.password
            }).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            payload = res;
            done();
          });
        });

        it("変更したパスワードでログインすることが可能", function (done) {
          (0, _chai.expect)(payload.status).equal(200);
          done();
        });

        it("tokenが返却される", function (done) {
          (0, _chai.expect)(payload.body.body.token.length > 0).equal(true);
          done();
        });

        it("ユーザオブジェクトが返却される", function (done) {
          (0, _chai.expect)(payload.body.body.user._id.length > 0).equal(true);
          done();
        });
      });
    });

    describe("user_idが", function () {
      describe("存在しないoidの場合", function () {
        var payload = void 0;
        var body = {
          password: "foobar"
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "ユーザIDが不正のためパスワードの変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + "/invalid_oid/password_force").send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("passwordが", function () {
      describe("undefinedの場合", function () {
        var payload = void 0;
        var body = {};

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var payload = void 0;
        var body = {
          password: null
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var payload = void 0;
        var body = {
          password: ""
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      // パスワードは文字数制限の対象外
      describe.skip("255文字以上の場合", function () {
        var payload = void 0;
        var body = {
          password: (0, _lodash.range)(256).join("")
        };

        var expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが長すぎます"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
              return resolve(res);
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      // パスワードは禁止文字制限の対象外
      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", function () {
        describe("バックスラッシュ", function () {
          var payload = void 0;
          var body = {
            password: "foo\\foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", function () {
          var payload = void 0;
          var body = {
            password: "foo/foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("コロン", function () {
          var payload = void 0;
          var body = {
            password: "foo:foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", function () {
          var payload = void 0;
          var body = {
            password: "foo*foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", function () {
          var payload = void 0;
          var body = {
            password: "foo?foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", function () {
          var payload = void 0;
          var body = {
            password: "foo<foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", function () {
          var payload = void 0;
          var body = {
            password: "foo>foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", function () {
          var payload = void 0;
          var body = {
            password: "foo|foo"
          };

          var expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before(function (done) {
            new Promise(function (resolve, reject) {
              request.patch(user_url + ("/" + user._id + "/password_force")).send(body).end(function (err, res) {
                return resolve(res);
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
            (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });
      });
    });
  });
});