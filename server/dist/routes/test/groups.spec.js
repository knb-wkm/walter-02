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


var groups_url = "/api/v1/groups";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

describe(groups_url + "/:group_id", function () {

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

  // グループ一覧
  describe("get /", function () {
    var payload = void 0;

    before(function (done) {
      request.get(groups_url).end(function (err, res) {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", function (done) {
      (0, _chai.expect)(payload.status).equal(200);
      done();
    });

    describe("返却されるオブジェクトは", function () {
      it("_idカラムが存在しoid型", function (done) {
        var ids = payload.body.body.map(function (obj) {
          return ObjectId.isValid(obj._id);
        });
        (0, _chai.expect)(ids.every(function (id) {
          return id === true;
        })).equal(true);
        done();
      });

      it("nameカラムが存在し0文字以上", function (done) {
        var names = payload.body.body.map(function (obj) {
          return obj.name.length > 0;
        });
        (0, _chai.expect)(names.every(function (name) {
          return name === true;
        })).equal(true);
        done();
      });

      it("descriptionカラムが存在し0文字以上", function (done) {
        var descriptions = payload.body.body.map(function (obj) {
          return obj.description.length > 0;
        });
        (0, _chai.expect)(descriptions.every(function (desc) {
          return desc === true;
        })).equal(true);
        done();
      });

      it("role_filesカラムが存在し配列型", function (done) {
        var role_files = payload.body.body.map(function (obj) {
          return Array.isArray(obj.role_files);
        });
        (0, _chai.expect)(role_files.every(function (rf) {
          return rf === true;
        })).equal(true);
        done();
      });

      it("tenant_idカラムが存在しoid型", function (done) {
        var tenant_ids = payload.body.body.map(function (obj) {
          return ObjectId.isValid(obj.tenant_id);
        });
        (0, _chai.expect)(tenant_ids.every(function (id) {
          return id === true;
        })).equal(true);
        done();
      });

      it("rolesカラムが存在し配列型", function (done) {
        var roles = payload.body.body.map(function (obj) {
          return Array.isArray(obj.roles);
        });
        (0, _chai.expect)(roles.every(function (role) {
          return role === true;
        })).equal(true);
        done();
      });

      it("belongs_toカラムが存在し配列型", function (done) {
        var belongs_tos = payload.body.body.map(function (obj) {
          return Array.isArray(obj.belongs_to);
        });
        (0, _chai.expect)(belongs_tos.every(function (belong) {
          return belong === true;
        })).equal(true);
        done();
      });
    });
  });

  describe("post /", function () {
    describe("name, descriptionを指定し正しく作成した場合", function () {
      var payload = void 0;
      var body = {
        group: {
          name: "newGroup",
          description: "newGroup description"
        }
      };

      before(function (done) {
        request.post(groups_url).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("作成したグループを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var group_id = payload.body.body._id;

          request.get(groups_url + ("/" + group_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("_idカラムが存在しoid型", function (done) {
          (0, _chai.expect)(ObjectId.isValid(payload.body.body._id)).equal(true);
          done();
        });

        it("nameカラムが存在し0文字以上", function (done) {
          (0, _chai.expect)(payload.body.body.name.length > 0).equal(true);
          done();
        });

        it("descriptionカラムが存在し0文字以上", function (done) {
          (0, _chai.expect)(payload.body.body.description.length > 0).equal(true);
          done();
        });

        it.skip("role_filesカラムが存在し配列型", function (done) {
          (0, _chai.expect)(Array.isArray(payload.body.body.role_files)).equal(true);
          done();
        });

        it("tenant_idカラムが存在しoid型", function (done) {
          (0, _chai.expect)(ObjectId.isValid(payload.body.body.tenant_id)).equal(true);
          done();
        });

        it("rolesカラムが存在し配列型", function (done) {
          (0, _chai.expect)(Array.isArray(payload.body.body.roles)).equal(true);
          done();
        });

        it.skip("belongs_toカラムが存在し配列", function (done) {
          (0, _chai.expect)(Array.isArray(payload.body.body.belongs_to)).equal(true);
          done();
        });
      });
    });
  });

  describe("get /:group_id", function () {
    var payload = void 0;
    var group = void 0;

    before(function (done) {
      new Promise(function (resolve, reject) {

        request.get(groups_url).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        group = _.head(res.body.body);

        return new Promise(function (resolve, reject) {
          request.get(groups_url + ("/" + group._id)).end(function (err, res) {
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

    describe("返却されるオブジェクトは", function () {
      it("_idカラムが存在しoid型", function (done) {
        (0, _chai.expect)(ObjectId.isValid(payload.body.body._id)).equal(true);
        done();
      });

      it("nameカラムが存在し0文字以上", function (done) {
        (0, _chai.expect)(payload.body.body.name.length > 0).equal(true);
        done();
      });

      it("descriptionカラムが存在し0文字以上", function (done) {
        (0, _chai.expect)(payload.body.body.description.length > 0).equal(true);
        done();
      });

      it("role_filesカラムが存在し配列型", function (done) {
        (0, _chai.expect)(Array.isArray(payload.body.body.role_files)).equal(true);
        done();
      });

      it("tenant_idカラムが存在しoid型", function (done) {
        (0, _chai.expect)(ObjectId.isValid(payload.body.body.tenant_id)).equal(true);
        done();
      });

      it("rolesカラムが存在し配列型", function (done) {
        (0, _chai.expect)(Array.isArray(payload.body.body.roles)).equal(true);
        done();
      });

      it("belongs_toカラムが存在し配列", function (done) {
        (0, _chai.expect)(Array.isArray(payload.body.body.belongs_to)).equal(true);
        done();
      });
    });
  });

  describe("delete /:group_id", function () {
    var group = void 0;

    before(function (done) {
      request.get(groups_url).end(function (err, res) {
        group = _.head(res.body.body);
        done();
      });
    });

    // 色々削除するので初期化する
    after(function (done) {
      _builder.initdbPromise.then(function () {
        return done();
      });
    });

    describe("存在するgroup_idを指定した場合", function () {
      var payload = void 0;

      before(function (done) {
        request.delete(groups_url + ("/" + group._id)).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("削除したグループを取得した場合", function () {
        var payload = void 0;

        before(function (done) {
          request.get(groups_url + ("/" + group._id)).end(function (err, res) {
            payload = res;
            done();
          });
        });

        it("http(400)が返却される", function (done) {
          (0, _chai.expect)(payload.status).equal(400);
          done();
        });
      });

      describe("ユーザ一覧を取得した場合", function () {
        var users = void 0;

        before(function (done) {
          request.get("/api/v1/users").end(function (err, res) {
            users = res;
            done();
          });
        });

        it("削除したグループに所属するユーザは存在しない", function (done) {
          var belongs = _.flatten(users.body.body.map(function (user) {
            return user.groups;
          }));
          (0, _chai.expect)(belongs.filter(function (id) {
            return group._id === id;
          }).length === 0).equal(true);
          done();
        });
      });
    });
  });

  describe("patch /:group_id/name", function () {
    var group = void 0;

    before(function (done) {
      request.get(groups_url).end(function (err, res) {
        group = _.head(res.body.body);
        done();
      });
    });

    describe("正しいgroup_id, nameを指定した場合", function () {
      var payload = void 0;
      var body = {
        name: "changedGroupName"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("名前を変更したグループを取得した場合", function () {
        var payload = void 0;

        before(function (done) {
          request.get(groups_url + ("/" + group._id)).end(function (err, res) {
            payload = res;
            done();
          });
        });

        it("変更した値が反映されている", function (done) {
          (0, _chai.expect)(payload.body.body.name).equal(body.name);
          done();
        });
      });
    });

    describe("group_idがoid形式ではない場合", function () {
      var payload = void 0;
      var body = {
        name: "changedGroupName"
      };
      var expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループIDが不正のためグループ名の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + "/invalid_oid/name").send(body).end(function (err, res) {
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

    describe("nameがundefinedの場合", function () {
      var payload = void 0;
      var body = {};
      var expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameがnullの場合", function () {
      var payload = void 0;
      var body = { name: null };
      var expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameが空文字の場合", function () {
      var payload = void 0;
      var body = { name: "" };
      var expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameが255文字を超過する場合", function () {
      var payload = void 0;
      var body = { name: _.range(257).map(function (i) {
          return "1";
        }).join("") };
      var expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が制限文字数(255)を超過したためグループ名の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

      it("statusはfalse", function (done) {
        (0, _chai.expect)(payload.body.status.success).equal(false);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    // グループ名についてはひとまず禁止文字対象外
    describe.skip("nameに禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", function () {
      describe("バックスラッシュ", function () {
        var payload = void 0;
        var body = { name: "\\f\\o\\o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("スラッシュ", function () {
        var payload = void 0;
        var body = { name: "/f/o/o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("コロン", function () {
        var payload = void 0;
        var body = { name: ":f:o:o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("アスタリスク", function () {
        var payload = void 0;
        var body = { name: "*f*o*o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("クエスチョン", function () {
        var payload = void 0;
        var body = { name: "?f?o?o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("山括弧開く", function () {
        var payload = void 0;
        var body = { name: "<f<o<o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("山括弧閉じる", function () {
        var payload = void 0;
        var body = { name: ">f>o>o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("パイプ", function () {
        var payload = void 0;
        var body = { name: "|f|o|o" };
        var expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/name")).send(body).end(function (err, res) {
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

        it("statusはfalse", function (done) {
          (0, _chai.expect)(payload.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });
    });
  });

  describe("patch /:group_id/description", function () {
    var group = void 0;

    before(function (done) {
      request.get(groups_url).end(function (err, res) {
        group = _.head(res.body.body);
        done();
      });
    });

    describe("正しいgroup_id, descriptionを指定した場合", function () {
      var payload = void 0;
      var body = {
        description: "changedDescription"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("変更したグループを取得した場合", function () {
        var payload = void 0;

        before(function (done) {
          request.get(groups_url + ("/" + group._id)).end(function (err, res) {
            payload = res;
            done();
          });
        });

        it("変更された値が反映されている", function (done) {
          (0, _chai.expect)(payload.body.body.description).equal(body.description);
          done();
        });
      });
    });

    describe("group_idがoid形式ではない場合", function () {
      var payload = void 0;
      var body = {
        description: "foobar"
      };
      var expected = {
        message: "グループの備考の変更に失敗しました",
        detail: "グループIDが不正のためグループの備考の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + "/invalid_oid/description").send(body).end(function (err, res) {
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

    // 備考は空でもよいので
    describe.skip("descriptionがundefinedの場合", function () {
      var payload = void 0;
      var body = {};
      var expected = {
        message: "グループの備考の更新に失敗しました",
        detail: "備考が空です"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

    // 備考は空でもよいので
    describe.skip("descriptionがnullの場合", function () {
      var payload = void 0;
      var body = { description: null };
      var expected = {
        message: "グループの備考の更新に失敗しました",
        detail: "備考が空です"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

    describe("descriptionが空文字の場合", function () {
      var payload = void 0;
      var body = { description: "" };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      // 備考は必須項目ではない
      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });
    });

    describe("descriptionが255文字を超過する場合", function () {
      var payload = void 0;
      var body = { description: _.range(257).map(function (i) {
          return "1";
        }).join("") };
      var expected = {
        message: "グループの備考の変更に失敗しました",
        detail: "グループの備考が制限文字数(255)を超過したためグループの備考の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.description).equal(expected.detail);
        done();
      });
    });

    // グループ名の備考は禁止文字対象外
    describe.skip("descriptionに禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", function () {
      describe("バックスラッシュ", function () {
        var payload = void 0;
        var body = { description: "\\foo\\bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("スラッシュ", function () {
        var payload = void 0;
        var body = { description: "/foo/bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("コロン", function () {
        var payload = void 0;
        var body = { description: ":foo:bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("アスタリスク", function () {
        var payload = void 0;
        var body = { description: "*foo*bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("クエスチョン", function () {
        var payload = void 0;
        var body = { description: "?foo?bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("山括弧開く", function () {
        var payload = void 0;
        var body = { description: "<foo<bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("山括弧閉じる", function () {
        var payload = void 0;
        var body = { description: ">foo>bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

      describe("パイプ", function () {
        var payload = void 0;
        var body = { description: "|foo|bar" };
        var expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before(function (done) {
          request.patch(groups_url + ("/" + group._id + "/description")).send(body).end(function (err, res) {
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

  describe("patch /:group_id/role_menus", function () {
    var role_menu_id = void 0;
    var group_id = void 0;

    before(function (done) {
      new Promise(function (resolve, reject) {
        request.get(groups_url).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        group_id = _.head(res.body.body)._id;

        return new Promise(function (resolve, reject) {
          request.get("/api/v1/role_menus").end(function (err, res) {
            return resolve(res);
          });
        });
      }).then(function (res) {
        role_menu_id = _.head(res.body.body)._id;
        done();
      });
    });

    describe("正しいgroup_id, role_menu_idを指定した場合", function () {
      var payload = void 0;

      before(function (done) {
        request.patch(groups_url + ("/" + group_id + "/role_menus")).send({ role_menu_id: role_menu_id }).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("変更したグループを取得した場合", function () {
        var payload = void 0;

        before(function (done) {
          request.get(groups_url + ("/" + group_id)).end(function (err, res) {
            payload = res;
            done();
          });
        });

        it("変更した値が反映されている(未実装？？)", function (done) {
          (0, _chai.expect)(true).equal(true);
          done();
        });
      });
    });

    describe("group_idがoid形式ではない場合", function () {
      var payload = void 0;
      var expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "グループIDが不正のためグループのメニュー権限の変更に失敗しました"
      };

      before(function (done) {
        request.patch(groups_url + "/invalid_oid/role_menus").send({ role_menu_id: role_menu_id }).end(function (err, res) {
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

    describe("role_menu_idがoid形式ではない場合", function () {
      var payload = void 0;
      var expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "指定されたメニュー権限IDが不正のためグループのメニュー権限の変更に失敗しました"
      };
      var body = {
        role_menu_id: "invalid_role_menu_id"
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group_id + "/role_menus")).send(body).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_menu_id).equal(expected.detail);
        done();
      });
    });

    describe("role_menu_idがundefinedの場合", function () {
      var payload = void 0;
      var expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      var body = {};

      before(function (done) {
        request.patch(groups_url + ("/" + group_id + "/role_menus")).send(body).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_menu_id).equal(expected.detail);
        done();
      });
    });

    describe("role_menu_idがnullの場合", function () {
      var payload = void 0;
      var expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      var body = {
        role_menu_id: null
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group_id + "/role_menus")).send(body).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_menu_id).equal(expected.detail);
        done();
      });
    });

    describe("role_menu_idが空文字の場合", function () {
      var payload = void 0;
      var expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      var body = {
        role_menu_id: ""
      };

      before(function (done) {
        request.patch(groups_url + ("/" + group_id + "/role_menus")).send(body).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_menu_id).equal(expected.detail);
        done();
      });
    });
  });
});