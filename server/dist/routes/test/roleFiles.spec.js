"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

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
_builder.app.use('/', _2.default);

var base_url = "/api/v1/role_files";
var login_url = "/api/login";
var tenant_id = void 0;
var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));

describe(base_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        tenant_id = res.body.body.user.tenant_id;
        request.set('x-auth-cloud-storage', res.body.body.token);
        done();
      });
    });
  });

  describe('get /', function () {
    describe('正常系', function () {
      var url = "" + base_url;
      var response = void 0;
      before(function (done) {
        request.get(url).end(function (err, res) {
          response = res;
          done();
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });
      it('nameが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'name')).equal(true);
        done();
      });
      it('nameはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].name)).equal('string');
        done();
      });
      it('descriptionが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'description')).equal(true);
        done();
      });
      it('descriptionはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].description)).equal('string');
        done();
      });
      it('actionsが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'actions')).equal(true);
        done();
      });
      it('actionsはobjectである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].actions)).equal('object');
        done();
      });
      it('actionsにはlabelが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0].actions[0], 'label')).equal(true);
        done();
      });
      it('labelはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].actions[0].label)).equal('string');
        done();
      });
      it('actionsにはnameが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0].actions[0], 'name')).equal(true);
        done();
      });
      it('nameはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].actions[0].name)).equal('string');
        done();
      });
      it('tenant_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'tenant_id')).equal(true);
        done();
      });
      it('tenant_idはObjectIdである', function (done) {
        (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(response.body.body[0].tenant_id)).equal(true);
        done();
      });
    });
  });

  describe('post /', function () {
    describe('異常系', function () {
      describe('nameが未定義', function () {
        var expected = {
          message: "ロールの作成に失敗しました",
          detail: "ロール名が空です"
        };
        describe('nameがundefined', function () {
          var sendData = {
            role: {
              description: "test data"
            }
          };
          var response = void 0;
          before(function (done) {
            request.post(base_url).send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe('nameがnull', function () {
          var sendData = {
            role: {
              name: null,
              description: "test data"
            }
          };
          var response = void 0;
          before(function (done) {
            request.post(base_url).send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe('nameが""', function () {
          var sendData = {
            role: {
              name: "",
              description: "test data"
            }
          };
          var response = void 0;
          before(function (done) {
            request.post(base_url).send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
      describe('nameが重複', function () {
        var expected = {
          message: "ロールの作成に失敗しました",
          detail: "そのロール名は既に使用されています"
        };
        var sendData = {
          role: {
            name: "重複"
          }
        };
        var response = void 0;
        before(function (done) {
          request.post(base_url).send(sendData).end(function (err, res) {
            request.post(base_url).send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
          done();
        });
      });
      describe('nameが256文字以上', function () {
        var expected = {
          message: "ロールの作成に失敗しました",
          detail: "ロール名が長すぎます"
        };
        var sendData = {
          role: {
            name: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
          }
        };
        var response = void 0;
        before(function (done) {
          request.post(base_url).send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('送信したnameは256文字以上である', function (done) {
          (0, _chai.expect)(sendData.role.name.length >= 256).equal(true);
          done();
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe('descriptionが256文字以上', function () {
        var expected = {
          message: "ロールの作成に失敗しました",
          detail: "備考が長すぎます"
        };
        var sendData = {
          role: {
            name: "備考が長過ぎる",
            description: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
          }
        };
        var response = void 0;
        before(function (done) {
          request.post(base_url).send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('送信したdescriptionは256文字以上である', function (done) {
          (0, _chai.expect)(sendData.role.description.length >= 256).equal(true);
          done();
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.description).equal(expected.detail);
          done();
        });
      });
    });
    describe('正常系', function () {
      var sendData = {
        role: {
          name: "新規",
          description: "これはテスト用データです"
        }
      };
      var response = void 0;
      var dataBeforePost = void 0;
      before(function (done) {
        request.get(base_url).end(function (err, res) {
          dataBeforePost = res.body.body;

          request.post(base_url).send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
      });

      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });
      it('レコードが一件削除されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length).equal(dataBeforePost.length + 1);
          done();
        });
      });
      it('送信した内容でロールが削除されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.findIndex)(res.body.body, sendData.role)).not.equal(-1);
          done();
        });
      });
    });
  });

  describe('get /:role_id', function () {
    describe('異常系', function () {
      describe('存在しないrole_idを指定', function () {
        var expected = {
          message: "ロールの取得に失敗しました",
          detail: "指定されたロールが存在しないためロールの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var role_id = new _mongoose2.default.Types.ObjectId();
          var url = base_url + "/" + role_id;
          request.get(url).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });
      describe('role_idにでたらめな文字列を指定', function () {
        var expected = {
          message: "ロールの取得に失敗しました",
          detail: "ロールIDが不正なためロールの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var role_id = "hogehogefugafuga";
          var url = base_url + "/" + role_id;
          request.get(url).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });
    });
    describe('正常系', function () {
      var response = void 0;
      before(function (done) {
        request.get(base_url).end(function (err, res) {
          var id = res.body.body[0]._id;
          request.get(base_url + "/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });
      it('_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, '_id')).equal(true);
        done();
      });
      it('_idはObjectIdである', function (done) {
        (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(response.body.body._id)).equal(true);
        done();
      });
      it('nameが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'name')).equal(true);
        done();
      });
      it('nameはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.name)).equal('string');
        done();
      });
    });
  });

  describe('delete /:role_id', function () {
    // 削除対象を登録
    var sendData = {
      role: {
        name: "削除対象",
        description: "このデータはテスト用です。"
      }
    };

    var targetData = void 0;
    var dataBeforeDelete = void 0;
    before(function (done) {
      request.get(base_url).end(function (err, res) {
        dataBeforeDelete = res.body.body;
      });
      request.post(base_url).send(sendData).end(function (err, res) {
        targetData = res.body.body;
        done();
      });
    });
    describe('異常系', function () {
      describe('存在しないrole_id', function () {
        var expected = {
          message: "ロールの削除に失敗しました",
          detail: "指定されたロールが見つからないため削除に失敗しました"
        };

        var response = void 0;
        before(function (done) {
          var id = new _mongoose2.default.Types.ObjectId();
          request.delete(base_url + "/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });

        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });
      describe('role_idにでたらめな文字列', function () {
        var expected = {
          message: "ロールの削除に失敗しました",
          detail: "ロールIDが不正なため削除に失敗しました"
        };

        var response = void 0;
        before(function (done) {
          var id = "hoawjfheioahfoiwefhfaf";
          request.delete(base_url + "/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });

        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });
    });
    describe('正常系', function () {
      var response = void 0;
      before(function (done) {
        var id = targetData._id;
        request.delete(base_url + "/" + id).end(function (err, res) {
          response = res;
          done();
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('送信したidのロールが削除されている', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.findIndex)(res.body.body, targetData)).equal(-1);
          done();
        });
      });
      it('ロールが1件のみ削除されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length).equal(dataBeforeDelete.length);
          done();
        });
      });
    });
  });

  describe('patch /:role_id/name', function () {
    var sendData = {
      role: {
        name: "name更新対象",
        description: "これはテスト用のデータです"
      }
    };
    var targetData = void 0;
    var otherDataBeforePatch = void 0;
    before(function (done) {
      request.get(base_url).end(function (err, res) {
        otherDataBeforePatch = res.body.body;
      });
      request.post(base_url).send(sendData).end(function (err, res) {
        targetData = res.body.body;
        done();
      });
    });

    describe('異常系', function () {
      describe('存在しないrole_idを更新する', function () {
        var expected = {
          message: "ロール名の変更に失敗しました",
          detail: "指定されたロールが見つからないため変更に失敗しました"
        };
        var sendData = {
          name: "更新した"
        };
        var response = void 0;
        before(function (done) {
          var id = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + id + "/name").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });

      describe('role_idにでたらめな文字列を指定して更新する', function () {
        var expected = {
          message: "ロール名の変更に失敗しました",
          detail: "ロールIDが不正なためロール名の変更に失敗しました"
        };
        var sendData = {
          name: "更新した"
        };
        var response = void 0;
        before(function (done) {
          var id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(base_url + "/" + id + "/name").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe('nameが未定義', function () {
        var expected = {
          message: "ロール名の変更に失敗しました",
          detail: "ロール名が空です"
        };

        describe('nameがundefined', function () {
          var sendData = {};
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe('nameがnull', function () {
          var sendData = {
            name: null
          };
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe('nameが""', function () {
          var sendData = {
            name: ""
          };
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', function (done) {
            (0, _chai.expect)(response.status).equal(400);
            done();
          });
          it('statusはfalse', function (done) {
            (0, _chai.expect)(response.body.status.success).equal(false);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.message).equal(expected.message);
            done();
          });
          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });

      describe('nameが重複', function () {
        var expected = {
          message: "ロール名の変更に失敗しました",
          detail: "そのロール名は既に使用されています"
        };

        var sendData = {
          name: "読み取りのみ"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe('nameが256文字以上', function () {
        var expected = {
          message: "ロール名の変更に失敗しました",
          detail: "ロール名が長すぎます"
        };

        var sendData = {
          name: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('送信したnameが256文字以上である', function (done) {
          (0, _chai.expect)(sendData.name.length >= 256).equal(true);
          done();
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.name).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      var sendData = {
        name: "更新した"
      };
      var response = void 0;
      before(function (done) {
        request.patch(base_url + "/" + targetData._id + "/name").send(sendData).end(function (err, res) {
          response = res;
          done();
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });
      it('nameが送信した値に更新されていること', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.name).equal(sendData.name);
          done();
        });
      });
      it('descriptionが更新されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.description).equal(targetData.description);
          done();
        });
      });
      it('対象以外が更新されていないこと', function (done) {
        request.get(base_url).end(function (err, res) {
          var otherDataAfterPatch = res.body.body.filter(function (role) {
            return role._id !== targetData._id;
          });
          (0, _chai.expect)(otherDataAfterPatch.length === otherDataBeforePatch.length).equal(true);
          (0, _chai.expect)((0, _lodash.isMatch)(otherDataAfterPatch, otherDataBeforePatch)).equal(true);
          done();
        });
      });
    });
  });

  describe('patch /:role_id/description', function () {
    var sendData = {
      role: {
        name: "description更新対象",
        description: "これはテスト用のデータです"
      }
    };
    var targetData = void 0;
    var otherDataBeforePatch = void 0;
    before(function (done) {
      request.get(base_url).end(function (err, res) {
        otherDataBeforePatch = res.body.body;
      });
      request.post(base_url).send(sendData).end(function (err, res) {
        targetData = res.body.body;
        done();
      });
    });

    describe('異常系', function () {
      describe('存在しないrole_idを更新する', function () {
        var expected = {
          message: "備考の変更に失敗しました",
          detail: "指定されたロールが見つからないため備考の変更に失敗しました"
        };
        var sendData = {
          description: "これはテスト用のデータです。更新されました。"
        };
        var response = void 0;
        before(function (done) {
          var id = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + id + "/description").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });

      describe('role_idにでたらめな文字列指定して更新する', function () {
        var expected = {
          message: "備考の変更に失敗しました",
          detail: "ロールIDが不正なため備考の変更に失敗しました"
        };
        var sendData = {
          description: "これはテスト用のデータです。更新されました。"
        };
        var response = void 0;
        before(function (done) {
          var id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(base_url + "/" + id + "/description").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {

      describe('descriptionのみ送信', function () {
        var sendData = {
          description: "これはテストデータです。更新されました。"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + targetData._id + "/description").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(200);
          done();
        });

        it('statusはtrue', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(true);
          done();
        });
        it('descriptionが送信した値に更新されていること', function (done) {
          request.get(base_url + "/" + targetData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.description).equal(sendData.description);
            done();
          });
        });
        it('nameが更新されていないこと', function (done) {
          request.get(base_url + "/" + targetData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.name).equal(targetData.name);
            done();
          });
        });
        it('対象以外が更新されていないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            var otherDataAfterPatch = res.body.body.filter(function (role) {
              return role._id !== targetData._id;
            });
            (0, _chai.expect)(otherDataAfterPatch.length === otherDataBeforePatch.length).equal(true);
            (0, _chai.expect)((0, _lodash.isMatch)(otherDataAfterPatch, otherDataBeforePatch)).equal(true);
            done();
          });
        });
      });

      describe('備考が256文字以上', function () {
        var sendData = {
          description: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + targetData._id + "/description").send(sendData).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(200);
          done();
        });

        it('statusはtrue', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(true);
          done();
        });
      });
    });
  });

  describe('patch /:role_id/actions/:action_id', function () {

    var actions_url = "/api/v1/actions";
    var sendData = {
      role: {
        name: "actions更新対象",
        description: "これはテスト用のデータです"
      }
    };
    var targetData = void 0;
    var otherDataBeforePatch = void 0;
    var actions = void 0;
    before(function (done) {
      // 実行前のデータを取得
      request.get(base_url).end(function (err, res) {
        otherDataBeforePatch = res.body.body;

        // actionsを取得
        request.get(actions_url).end(function (err, res) {
          actions = res.body.body;

          // テスト用データ登録
          request.post(base_url).send(sendData).end(function (err, res) {
            targetData = res.body.body;
            done();
          });
        });
      });
    });

    describe('異常系', function () {

      describe('存在しないrole_idを更新する', function () {
        var expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたロールが見つからないためアクションの追加に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var id = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + id + "/actions/" + action._id).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });

      describe('role_idにでたらめな文字列を指定して更新する', function () {
        var expected = {
          message: "アクションの追加に失敗しました",
          detail: "ロールIDが不正なためアクションの追加に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(base_url + "/" + id + "/actions/" + action._id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe('存在しないactionを登録する', function () {
        var expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたアクションが見つからないため追加に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var id = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + targetData._id + "/actions/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });

      describe('action_idにでたらめな文字列を指定する', function () {
        var expected = {
          message: "アクションの追加に失敗しました",
          detail: "アクションIDが不正なためアクションの追加に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var id = "jfoaddfjaoieghaowhefofhjaowejwadj";
          request.patch(base_url + "/" + targetData._id + "/actions/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action_id).equal(expected.detail);
          done();
        });
      });

      describe('既に登録されているactionを登録する', function () {
        var expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたアクションが既に登録されているため追加に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var url = base_url + "/" + targetData._id + "/actions/" + action._id;
          request.patch(url).end(function (err, res) {
            request.patch(url).end(function (err, res) {
              response = res;
              done();
            });
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      var response = void 0;
      var dataBeforePatch = void 0;
      var targetAction = void 0;
      before(function (done) {
        targetAction = actions[1];
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          dataBeforePatch = res.body.body;
        });
        request.patch(base_url + "/" + targetData._id + "/actions/" + targetAction._id).end(function (err, res) {
          response = res;
          done();
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });

      it('対象のアクションが追加されていること', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          var actions = res.body.body.actions;
          (0, _chai.expect)((0, _lodash.findIndex)(actions, targetAction) >= 0).equal(true);
          done();
        });
      });

      it('対象以外のactionが追加されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          var patchedMenus = res.body.body.actions.filter(function (action) {
            return action._id !== targetAction._id;
          });
          (0, _chai.expect)((0, _lodash.isMatch)(patchedMenus, dataBeforePatch.actions)).equal(true);
          done();
        });
      });

      it('nameが更新されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.name).equal(targetData.name);
          done();
        });
      });

      it('descriptionが更新されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.description).equal(targetData.description);
          done();
        });
      });

      it('対象以外のroleFileが更新されていないこと', function (done) {
        request.get(base_url).end(function (err, res) {
          var otherDataAfterPatch = res.body.body.filter(function (role) {
            return role._id !== targetData._id;
          });
          (0, _chai.expect)(otherDataAfterPatch.length === otherDataBeforePatch.length).equal(true);
          (0, _chai.expect)((0, _lodash.isMatch)(otherDataAfterPatch, otherDataBeforePatch)).equal(true);
          done();
        });
      });
    });
  });

  describe('delete /:role_id/actions/:action_id', function () {

    var actions_url = "/api/v1/actions";
    var sendData = {
      role: {
        name: "actions削除対象",
        description: "これはテスト用のデータです"
      }
    };
    var targetData = void 0;
    var targetAction = void 0;
    var otherDataBeforePatch = void 0;
    var actions = void 0;
    var action_id = void 0;
    before(function (done) {
      // 実行前のデータを取得
      request.get(base_url).end(function (err, res) {
        otherDataBeforePatch = res.body.body;

        // actionsを取得
        request.get(actions_url).end(function (err, res) {
          actions = res.body.body;

          // テスト用データ登録
          request.post(base_url).send(sendData).end(function (err, res) {
            targetData = res.body.body;
            // actionsを登録
            targetAction = (0, _lodash.first)(actions);
            action_id = (0, _lodash.first)(actions)._id;
            request.patch(base_url + "/" + targetData._id + "/actions/" + action_id).end(function (err, res) {
              done();
            });
          });
        });
      });
    });
    describe('異常系', function () {

      describe('存在しないrole_idを更新する', function () {
        var expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたロールが存在しないため削除に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var id = new _mongoose2.default.Types.ObjectId();
          request.delete(base_url + "/" + id + "/actions/" + action_id).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });

      describe('role_idにでたらめな文字列を指定して更新する', function () {
        var expected = {
          message: "アクションの削除に失敗しました",
          detail: "ロールIDが不正なためアクションの削除に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(base_url + "/" + id + "/actions/" + action._id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe('存在しないactionを登録する', function () {
        var expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたアクションが存在しないため削除に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var action = (0, _lodash.first)(actions);
          var id = new _mongoose2.default.Types.ObjectId();
          request.delete(base_url + "/" + targetData._id + "/actions/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });

      describe('action_idにでたらめな文字列を指定する', function () {
        var expected = {
          message: "アクションの削除に失敗しました",
          detail: "アクションIDが不正なためアクションの削除に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var id = "jfoaddfjaoieghaowhefofhjaowejwadj";
          request.delete(base_url + "/" + targetData._id + "/actions/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action_id).equal(expected.detail);
          done();
        });
      });

      describe('登録されていないactionを削除する', function () {
        var expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたアクションは登録されていないため削除に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var id = actions[1]._id;
          (0, _chai.expect)(id !== action_id).equal(true); // 登録したアクションと異なることを担保
          request.delete(base_url + "/" + targetData._id + "/actions/" + id).end(function (err, res) {
            response = res;
            done();
          });
        });
        it('http(400)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(400);
          done();
        });
        it('statusはfalse', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(false);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.message).equal(expected.message);
          done();
        });
        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          (0, _chai.expect)(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      var response = void 0;
      var dataBeforePatch = void 0;
      before(function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          dataBeforePatch = res.body.body;

          request.delete(base_url + "/" + targetData._id + "/actions/" + action_id).end(function (err, res) {
            response = res;
            done();
          });
        });
      });
      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });
      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });

      it('対象のアクションが削除されていること', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          var actions = res.body.body.actions;
          (0, _chai.expect)((0, _lodash.isMatch)(actions, targetAction)).equal(false);
          done();
        });
      });

      it('nameが更新されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.name).equal(targetData.name);
          done();
        });
      });

      it('descriptionが更新されていないこと', function (done) {
        request.get(base_url + "/" + targetData._id).end(function (err, res) {
          (0, _chai.expect)(res.body.body.description).equal(targetData.description);
          done();
        });
      });

      it('対象以外のroleFileが更新されていないこと', function (done) {
        request.get(base_url).end(function (err, res) {
          var otherDataAfterPatch = res.body.body.filter(function (role) {
            return role._id !== targetData._id;
          });
          (0, _chai.expect)(otherDataAfterPatch.length === otherDataBeforePatch.length).equal(true);
          (0, _chai.expect)((0, _lodash.isMatch)(otherDataAfterPatch, otherDataBeforePatch)).equal(true);
          done();
        });
      });
    });
  });
});