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

var _tags = require("../../controllers/tags");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use('/', _2.default);

var base_url = "/api/v1/tags";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var tenant_id = "";

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
    var response = {};
    before(function (done) {
      request.get(base_url).end(function (err, res) {
        response = res;
        done();
      });
    });

    it('http(200)が返却される', function (done) {
      (0, _chai.expect)(response.status).equal(200);
      done();
    });
    it('bodyに配列が含まれる', function (done) {
      (0, _chai.expect)((0, _lodash.isArray)(response.body.body)).equal(true);
      done();
    });
    it('tagが1件以上登録されている', function (done) {
      (0, _chai.expect)(response.body.body.length >= 1).equal(true);
      done();
    });
    it('tagsには_idが含まれる', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)((0, _lodash.has)(tag, "_id")).equal(true);
      done();
    });
    it('_idはmongoose.Types.ObjectIdである', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(tag._id)).equal(true);
      done();
    });
    it('tagsにはcolorが含まれる', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)((0, _lodash.has)(tag, "color")).equal(true);
      done();
    });
    it('colorは16進数トリプレット表記である', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)(tag.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/)).not.equal(null);
      done();
    });
    it('tagsにはlabelが含まれる', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)((0, _lodash.has)(tag, "label")).equal(true);
      done();
    });
    it('labelは文字列である', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)((0, _lodash.isString)(tag.label)).equal(true);
      done();
    });
    it('tagsにはtenant_idが含まれる', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)((0, _lodash.has)(tag, "tenant_id")).equal(true);
      done();
    });
    it('tenant_idがログインしているtenantのidと一致する', function (done) {
      var tag = (0, _lodash.first)(response.body.body);
      (0, _chai.expect)(tag.tenant_id).equal(tenant_id);
      done();
    });
  });

  describe('post /', function () {

    describe("異常系", function () {

      describe("labelが未定義", function () {
        var expected = {
          message: "タグの登録に失敗しました",
          detail: "タグ名が空です"
        };

        describe("labelがundefined", function () {

          var body = { tag: {} };
          var response = {};

          before(function (done) {
            request.post(base_url).send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });

        describe('labelがnull', function () {

          var body = { tag: {
              label: null
            } };
          var response = {};

          before(function (done) {
            request.post(base_url).send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });

        describe('labelが""', function () {

          var body = { tag: {
              label: ""
            } };
          var response = {};

          before(function (done) {
            request.post(base_url).send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });
      });

      describe('labelが長過ぎる場合', function () {
        var expected = {
          message: "タグの登録に失敗しました",
          detail: "タグ名が長すぎます"
        };

        var body = { tag: {
            label: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
          } };
        var response = {};

        before(function (done) {
          request.post(base_url).send(body).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('送信するlabelのlengthが256である', function (done) {
          (0, _chai.expect)(body.tag.label.length).equal(256);
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
          (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
          done();
        });
      });

      describe('colorに16進トリプレット表記以外を指定', function () {
        var expected = {
          message: "タグの登録に失敗しました",
          detail: "色は16進数で指定してください"
        };

        var body = { tag: {
            label: "新規ラベル",
            color: "#GA00Z4"
          } };
        var response = {};

        before(function (done) {
          request.post(base_url).send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.color).equal(expected.detail);
          done();
        });
      });

      describe('labelが重複', function () {
        var expected = {
          message: "タグの登録に失敗しました",
          detail: "そのタグ名は既に使用されています"
        };
        var body = {
          tag: {
            label: "非表示",
            color: "#FFEEFF"
          }
        };
        var response = void 0;
        before(function (done) {
          request.post(base_url).send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
          done();
        });
      });
    });

    describe("正常系", function () {

      var sendData = {
        tag: {
          label: "新規",
          color: "#FEDCBA"
        }
      };

      var DatalengthBeforPost = 0;

      before(function (done) {
        request.get(base_url).end(function (err, res) {
          DatalengthBeforPost = res.body.body.length;
          done();
        });
      });

      it('http(200)が返却される', function (done) {
        var body = sendData;
        request.post(base_url).send(body).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(200);
          done();
        });
      });

      it('レコードが一件追加されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length).equal(DatalengthBeforPost + 1);
          done();
        });
      });

      it('送信した内容でタグが追加されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.findIndex)(res.body.body, sendData.tag)).not.equal(-1);
          done();
        });
      });
    });
  });

  describe('get /:tag_id', function () {
    describe('異常系', function () {
      describe('tag_idが未定義', function () {
        it('"get /" となるためpending', function (done) {
          done();
        });
      });
      describe('存在しないtag_idを指定', function (done) {

        var expected = {
          message: "タグの取得に失敗しました",
          detail: "指定されたタグが存在しないためタグの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var newId = new _mongoose2.default.Types.ObjectId();
          request.get(base_url + "/" + newId).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag).equal(expected.detail);
          done();
        });
      });
      describe('tag_idにでたらめな文字列を指定', function (done) {
        var expected = {
          message: "タグの取得に失敗しました",
          detail: "タグIDが不正なためタグの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.get(base_url + "/" + newId).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {

      var response = void 0;
      before(function (done) {
        request.get(base_url).end(function (err, res) {
          var id = (0, _lodash.first)(res.body.body)._id;
          // 先頭のtagを対象とする
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

      it('返却されたtagはobjectである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body)).equal("object");
        done();
      });

      it('tagsにはcolorが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, "color")).equal(true);
        done();
      });

      it('colorは16進数トリプレット表記である', function (done) {
        (0, _chai.expect)(response.body.body.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/)).not.equal(null);
        done();
      });

      it('tagsにはlabelが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'label')).equal(true);
        done();
      });

      it('labelはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.label)).equal('string');
        done();
      });

      it('tagsにはtenant_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'tenant_id')).equal(true);
        done();
      });

      it('tenant_idがログインしているtenantのidと一致する', function (done) {
        (0, _chai.expect)(response.body.body.tenant_id).equal(tenant_id);
        done();
      });
    });
  });

  describe('delete /:tag_id', function () {

    var url = base_url + "/";

    var sendData = {
      tag: {
        label: "削除タグ",
        color: "#FEDCBA"
      }
    };

    var createdTag = {};
    before(function (done) {
      // 削除対象データを登録
      request.post(base_url).send(sendData).end(function (err, res) {
        createdTag = res.body.body;
        url += createdTag._id;
        done();
      });
    });

    describe('異常系', function () {

      describe('tag_idが未定義', function () {
        it('http(404)が返却される', function (done) {
          request.delete(base_url + "/").end(function (err, res) {
            (0, _chai.expect)(res.status).equal(404);
            done();
          });
        });
      });

      describe('存在しないtag_idを指定', function () {
        var expected = {
          message: "タグの削除に失敗しました",
          detail: "指定されたタグが存在しないためタグの取得に失敗しました"
        };

        var response = {};

        before(function (done) {
          var newId = new _mongoose2.default.Types.ObjectId();
          request.delete(base_url + "/" + newId).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag).equal(expected.detail);
          done();
        });
      });

      describe('tag_idにでたらめな文字列を指定', function () {
        var expected = {
          message: "タグの削除に失敗しました",
          detail: "タグIDが不正なためタグの取得に失敗しました"
        };

        var response = {};

        before(function (done) {
          var newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(base_url + "/" + newId).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      var response = {};
      var DataLengthBeforDelete = void 0; // 削除前データ数
      before(function (done) {
        request.get(base_url).end(function (err, res) {
          DataLengthBeforDelete = res.body.body.length;
        });
        request.delete(url).end(function (err, res) {
          response = res;
          done();
        });
      });

      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });

      it('送信したidのタグが削除されている', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.findIndex)(res.body.body, createdTag)).equal(-1);
          done();
        });
      });

      it('タグが1件のみ削除されていること', function (done) {
        request.get(base_url).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length).equal(DataLengthBeforDelete - 1);
          done();
        });
      });
    });
  });

  describe('patch /:tag_id/label', function () {

    var sendData = {
      tag: {
        label: "新規タグ",
        color: "#FEDCBA"
      }
    };
    var createdData = void 0;
    before(function (done) {
      request.post(base_url).send(sendData).end(function (err, res) {
        createdData = res.body.body;
        done();
      });
    });

    describe('異常系', function () {

      describe('存在しないtag_idを指定', function () {
        var expected = {
          message: "タグ名の変更に失敗しました",
          detail: "指定されたタグが存在しないためタグ名の変更に失敗しました"
        };
        var body = {
          label: "更新"
        };
        var response = {};

        before(function (done) {
          var newId = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + newId + "/label").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag).equal(expected.detail);
          done();
        });
      });

      describe('tag_idにでたらめな文字列を指定', function () {
        var expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグIDが不正なためタグ名の変更に失敗しました"
        };
        var body = {
          label: "更新"
        };
        var response = {};

        before(function (done) {
          var newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(base_url + "/" + newId + "/label").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });
      });

      describe('labelが未定義', function () {
        var expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグ名が空です"
        };

        describe('labelがundefined', function () {
          var body = {
            tag: {}
          };
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });

        describe('labelがnull', function () {
          var body = {
            tag: {
              label: null
            }
          };
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });

        describe('labelが""', function () {
          var body = {
            tag: {
              label: ""
            }
          };
          var response = void 0;
          before(function (done) {
            request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
            done();
          });
        });
      });

      describe('labelが256文字', function () {
        var expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグ名が長すぎます"
        };
        var body = {
          label: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
            response = res;
            done();
          });
        });

        it('送信したlabel文字列が256文字以上である', function (done) {
          (0, _chai.expect)(body.label.length >= 256).equal(true);
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
          (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
          done();
        });
      });

      describe('labelが重複', function () {
        var expected = {
          message: "タグ名の変更に失敗しました",
          detail: "そのタグ名は既に使用されています"
        };
        var body = {
          label: "非表示"
        };
        var response = void 0;
        before(function (done) {
          request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.label).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      describe('labelのみを送信', function () {

        var body = {
          label: "更新"
        };
        var response = void 0;
        var dataLengthBeforPatch = void 0;
        var otherTags = void 0;
        before(function (done) {
          request.get(base_url).end(function (err, res) {
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
          });
          request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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

        it('送信したlabelに変更されること', function (done) {
          request.get(base_url + "/" + createdData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.label).equal(body.label);
            done();
          });
        });

        it('別のタグが変更されないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            var _otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
            (0, _chai.expect)(_otherTags.length === otherTags.length).equal(true);
            (0, _chai.expect)((0, _lodash.isMatch)(_otherTags, otherTags)).equal(true);
            done();
          });
        });
        it('新規タグがインサートされないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
      });
      describe('label,colorを同時に送信', function () {

        var body = {
          label: "更新 with Color",
          color: "#000000"
        };
        var response = void 0;
        var dataLengthBeforPatch = void 0;
        var otherTags = void 0;
        before(function (done) {
          request.get(base_url).end(function (err, res) {
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
          });
          request.patch(base_url + "/" + createdData._id + "/label").send(body).end(function (err, res) {
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

        it('送信したlabelに変更されること', function (done) {
          request.get(base_url + "/" + createdData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.label).equal(body.label);
            done();
          });
        });

        it('別のタグが変更されないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            var _otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
            (0, _chai.expect)(_otherTags.length === otherTags.length).equal(true);
            (0, _chai.expect)((0, _lodash.isMatch)(_otherTags, otherTags)).equal(true);
            done();
          });
        });
        it('新規タグがインサートされないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
        it('colorを送信してもcolorが変更されないこと', function (done) {
          request.get(base_url + "/" + createdData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.color).equal(sendData.tag.color);
            done();
          });
        });
      });
    });
  });

  describe('patch /:tag_id/color', function () {

    var sendData = {
      tag: {
        label: "色変更",
        color: "#FEDCBA"
      }
    };
    var createdData = void 0;
    before(function (done) {
      request.post(base_url).send(sendData).end(function (err, res) {
        createdData = res.body.body;
        done();
      });
    });

    describe('異常系', function () {

      describe('存在しないtag_idを指定', function () {
        var expected = {
          message: "色の登録に失敗しました",
          detail: "指定されたタグが存在しないため色の登録に失敗しました"
        };
        var body = {
          color: "#ABCDEF"
        };
        var response = {};

        before(function (done) {
          var newId = new _mongoose2.default.Types.ObjectId();
          request.patch(base_url + "/" + newId + "/color").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag).equal(expected.detail);
          done();
        });
      });

      describe('tag_idにでたらめな文字列を指定', function () {
        var expected = {
          message: "色の登録に失敗しました",
          detail: "タグIDが不正なため色の登録に失敗しました"
        };
        var body = {
          color: "#ABCDEF"
        };
        var response = {};

        before(function (done) {
          var newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(base_url + "/" + newId + "/color").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });
      });

      describe('colorに16進トリプレット表記以外を指定', function () {
        var expected = {
          message: "色の登録に失敗しました",
          detail: "色は16進数で指定してください"
        };

        var body = {
          color: "white"
        };
        var response = {};

        before(function (done) {
          request.patch(base_url + "/" + createdData._id + "/color").send(body).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.color).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系', function () {
      describe('colorのみ送信', function () {
        var body = {
          color: "#ABCDEF"
        };
        var response = {};
        var dataLengthBeforPatch = void 0;
        var otherTags = void 0;
        before(function (done) {
          request.get(base_url).end(function (err, res) {
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
          });
          request.patch(base_url + "/" + createdData._id + "/color").send(body).end(function (err, res) {
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

        it('送信したcolorに変更されること', function (done) {
          request.get(base_url + "/" + createdData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.color).equal(body.color);
            done();
          });
        });

        it('別のタグが変更されないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            var _otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
            (0, _chai.expect)(_otherTags.length === otherTags.length).equal(true);
            (0, _chai.expect)((0, _lodash.isMatch)(_otherTags, otherTags)).equal(true);
            done();
          });
        });

        it('新規タグがインサートされないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
      });

      describe('labelを送信してもlabelが変更されないこと', function () {
        var body = {
          label: "別名",
          color: "#ABCDEF"
        };
        var response = {};
        var dataLengthBeforPatch = void 0;
        var otherTags = void 0;
        before(function (done) {
          request.get(base_url).end(function (err, res) {
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
          });
          request.patch(base_url + "/" + createdData._id + "/color").send(body).end(function (err, res) {
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

        it('送信したcolorに変更されること', function (done) {
          request.get(base_url + "/" + createdData._id).end(function (err, res) {
            (0, _chai.expect)(res.body.body.color).equal(body.color);
            done();
          });
        });

        it('別のタグが変更されないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            var _otherTags = res.body.body.filter(function (tag) {
              return tag._id !== createdData._id;
            });
            (0, _chai.expect)(_otherTags.length === otherTags.length).equal(true);
            (0, _chai.expect)((0, _lodash.isMatch)(_otherTags, otherTags)).equal(true);
            done();
          });
        });

        it('新規タグがインサートされないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            (0, _chai.expect)(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });

        it('labelを送信してもlabelが変更されないこと', function (done) {
          request.get(base_url).end(function (err, res) {
            (0, _chai.expect)(res.body.body.label).equal(sendData.label);
            done();
          });
        });
      });
    });
  });
});