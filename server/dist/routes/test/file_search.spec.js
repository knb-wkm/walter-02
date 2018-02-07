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

var _User = require("../../models/User");

var _User2 = _interopRequireDefault(_User);

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// model
_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use('/', _2.default);

var base_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

// テスト用のアップロードファイル(client側から送信しているPayload)
var requestPayload = {
  "dir_id": "",
  "files": [{
    "name": "text.txt",
    "size": 134,
    "mime_type": "text/plain",
    "modified": 1508212257000,
    "base64": "data:text/plain;base64,5pyd44Of44O844OG44Kj44Oz44Kw44Gr44Gk44GE44GmCiAgMS4gODo0NeOCiOOCiuODqeOCuOOCquS9k+aTjQogIDIuIOODqeOCuOOCquS9k+aTjee1guS6huW+jOOAgeWFqOS9k+OBuOOBrumAo+e1oQogIDMuIOalreWLmemWi+Wniwo=",
    "checksum": "028a17271a4abb1a6a82ed06f5f6cc60"
  }]
};

describe(base_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        user = res.body.body.user;
        request.set('x-auth-cloud-storage', res.body.body.token);
        done();
      });
    });
  });

  describe('get /search', function () {

    var response = void 0;
    before(function (done) {
      var sendData = { dir_id: '', files: [] };
      var keyWords = [1, "日本語", "alpha", "@###", "alpha123"];
      var tags = void 0;
      var meta = void 0;
      new Promise(function (resolve, reject) {
        // タグ一覧を取得
        request.get("/api/v1/tags").end(function (err, res) {
          tags = (0, _lodash.first)(res.body.body);
          resolve(res);
        });
      }).then(function (res) {
        // メタ情報一覧を取得
        return new Promise(function (resolve, reject) {
          request.get('/api/v1/meta_infos').end(function (err, res) {
            var _meta = (0, _lodash.find)(res.body.body, { name: "display_file_name" });

            meta = {
              _id: _meta._id,
              value: "meta_value"
            };
            resolve(res);
          });
        });
      }).then(function (res) {
        return new Promise(function (resolve, reject) {
          for (var i = 0; i < keyWords.length; i++) {
            var files = Object.assign({}, requestPayload.files[0]);
            files.name = "text_" + keyWords[i] + ".txt";
            files.tags = [tags._id];
            files.meta_infos = [{
              _id: meta._id,
              value: "meta_value_" + keyWords[i]
            }];
            sendData.files.push(files);
          }
          request.post(base_url).send(sendData).end(function (err, res) {
            resolve(res);
          });
        });
      }).then(function (res) {
        done();
      });
    });

    describe('異常系', function () {

      describe('pageが不正', function () {
        var expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "pageが数字ではないためファイル一覧の取得に失敗しました"
        };
        describe('pageが""', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              page: ""
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
        describe('pageが不正文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              page: '\/:*?<>|'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
        describe('pageが数字以外の文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              page: 'ichi'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
      });

      describe('ソート条件が不正', function () {
        var expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "ソート条件が不正なためファイル一覧の取得に失敗しました"
        };
        describe('sortが""', function () {
          var response = void 0;
          before(function (done) {
            request.get("" + base_url).query({
              q: "test",
              sort: ''
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('sortが不正な文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              sort: '\/:*?<>|'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('sortが意図しない文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              sort: 'ichi'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが""', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              order: ''
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが不正文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              order: '\/:*?<>|'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが意図しない文字列', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "test",
              order: 'koujun'
            }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.sort).equal(expected.detail);
            done();
          });;
        });
      });
    });

    describe('正常系', function () {

      describe('条件に該当するファイルがないパターンを指定', function () {
        var response = void 0;
        before(function (done) {
          request.get(base_url + "/search").query({
            q: 'file_not_found_pattern'
          }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
        it('検索結果は0件である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(0);
          done();
        });
      });

      describe('条件に半角英字を指定', function () {

        var url = base_url + "/search";
        var response = void 0;
        before(function (done) {

          console.log("wait....");
          new Promise(function (resolve, reject) {
            setTimeout(function () {
              console.log("go!");
              resolve();
            }, 2000);
          }).then(function () {
            request.get(url).query({ q: "alpha" }).end(function (err, res) {
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

        it('返却値はArrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });

        it('_idが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('_id').value()).equal(true);
          done();
        });

        it('_idはObjectIdである', function (done) {
          (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid((0, _lodash.first)(response.body.body)._id)).equal(true);
          done();
        });

        it('nameが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('name').value()).equal(true);
          done();
        });

        it('nameはstringである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).name)).equal('string');
          done();
        });

        it('mime_typeが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('mime_type').value()).equal(true);
          done();
        });

        it('mime_typeはstringである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).mime_type)).equal('string');
          done();
        });

        it('sizeが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('size').value()).equal(true);
          done();
        });

        it('sizeはnumberである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).size)).equal('number');
          done();
        });

        it('is_dirが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('is_dir').value()).equal(true);
          done();
        });

        it('is_dirはbooleanである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).is_dir)).equal('boolean');
          done();
        });

        it('dir_idが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('dir_id').value()).equal(true);
          done();
        });

        it('dir_idはObjectIdである', function (done) {
          (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid((0, _lodash.first)(response.body.body).dir_id)).equal(true);
          done();
        });

        it('is_displayが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('is_display').value()).equal(true);
          done();
        });

        it('is_displayはbooleanである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).is_display)).equal('boolean');
          done();
        });

        it('is_starが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('is_star').value()).equal(true);
          done();
        });

        it('is_starはbooleanである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).is_star)).equal('boolean');
          done();
        });

        it('is_cryptedが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('is_crypted').value()).equal(true);
          done();
        });

        it('is_cryptedはbooleanである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).is_crypted)).equal('boolean');
          done();
        });

        it('historiesが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('histories').value()).equal(true);
          done();
        });

        it('historiesはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).histories instanceof Array).equal(true);
          done();
        });

        it('historiesはbodyを持つ', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(histories), 'body')).equal(true);
          done();
        });
        it('historiesはactionを持つ', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(histories), 'action')).equal(true);
          done();
        });
        it('histories.actionはstringである', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(histories).action)).equal('string');
          done();
        });
        it('historiesはuserを持つ', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(histories), 'user')).equal(true);
          done();
        });
        it('historiesのuserはobjectである', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(histories).user)).equal('object');
          done();
        });

        it("historiesのuserには_id,account_name,name,email,password,enabled,tenant_id,groups,typeが含まれている", function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          var needle = ["_id", "account_name", "name", "email", "password", "enabled", "tenant_id", "groups", "type"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(histories).user).pick(needle).keys().value().length === needle.length).equal(true);

          done();
        });

        it('historiesはmodifiedを持つ', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(histories), 'modified')).equal(true);
          done();
        });
        it('histories.modifiedはstringである', function (done) {
          var histories = (0, _lodash.first)(response.body.body).histories;
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(histories).modified)).equal('string');
          done();
        });

        it('tagsが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('tags').value()).equal(true);
          done();
        });

        it('tagsはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).tags instanceof Array).equal(true);
          done();
        });

        it('tagsには_id,color,label,tenant_idが含まれている', function (done) {
          var needle = ["_id", "color", "label", "tenant_id"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body).tags).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('is_deletedが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('is_deleted').value()).equal(true);
          done();
        });

        it('is_deletedはbooleanである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).is_deleted)).equal('boolean');
          done();
        });

        it('modifiedが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('modified').value()).equal(true);
          done();
        });

        it('modifiedはstringである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).modified)).equal('string');
          done();
        });

        it('preview_idが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('preview_id').value()).equal(true);
          done();
        });

        it('preview_idはnullまたはObjectIdである', function (done) {
          if ((0, _lodash.first)(response.body.body).preview_id === null) {
            (0, _chai.expect)((0, _lodash.first)(response.body.body).preview_id).equal(null);
          } else {
            (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid((0, _lodash.first)(response.body.body).preview_id)).equal(true);
          }
          done();
        });

        it('authoritiesが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('authorities').value()).equal(true);
          done();
        });

        it('authoritiesはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).authorities instanceof Array).equal(true);
          done();
        });

        it('authorities[0]にはrole_files, users, actionsが含まれている', function (done) {
          var needle = ["role_files", "users", "actions"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body).authorities).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('authorities[0].actionsには_id,name,labelが含まれている', function (done) {
          var authorities = (0, _lodash.first)(response.body.body).authorities;
          var needle = ["_id", "name", "label"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(authorities).actions).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('dirsが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('dirs').value()).equal(true);
          done();
        });

        it('dirsはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).dirs instanceof Array).equal(true);
          done();
        });

        it('dirsには_id,ancestor,descendant,depthが含まれている', function (done) {
          var needle = ["_id", "ancestor", "descendant", "depth"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body).dirs).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('meta_infosが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('meta_infos').value()).equal(true);
          done();
        });

        it('meta_infosはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).meta_infos instanceof Array).equal(true);
          done();
        });

        it('meta_infosには_id,label,value_type,valueが含まれている', function (done) {
          var needle = ["_id", "label", "value_type", "value"];
          (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body).meta_infos).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('actionsが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('actions').value()).equal(true);
          done();
        });

        it('actionsはArrayである', function (done) {
          (0, _chai.expect)((0, _lodash.first)(response.body.body).actions instanceof Array).equal(true);
          done();
        });

        it('actionsには_id,name,labelが含まれている', function (done) {
          var needle = ["_id", "name", "label"];
          var actions = (0, _lodash.first)(response.body.body).actions;
          (0, _chai.expect)((0, _lodash.chain)(actions).first().pick(needle).keys().value().length === needle.length).equal(true);
          done();
        });

        it('dir_routeが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.chain)(response.body.body).first().has('dir_route').value()).equal(true);
          done();
        });

        it('dir_routeはstringである', function (done) {
          (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body).dir_route)).equal('string');
          done();
        });
      });

      describe('条件に数字を指定', function () {
        var url = base_url + "/search";
        var response = void 0;
        before(function (done) {
          request.get(url).query({ q: 1 }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
      });

      describe('条件に日本語を指定', function () {
        var url = base_url + "/search";
        var response = void 0;
        before(function (done) {
          request.get(url).query({ q: "日本語" }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
      });

      describe('条件に記号を指定', function () {
        var url = base_url + "/search";
        var response = void 0;
        before(function (done) {
          request.get(url).query({ q: "@###" }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
      });

      describe('条件に正規表現 text_[1-9].txt', function () {
        var response = void 0;
        before(function (done) {
          request.get(base_url + "/search").query({
            q: 'text_[1-9].txt'
          }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
        it('検索結果は0件である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(0);
          done();
        });
      });

      describe('条件に正規表現 .*', function () {
        var response = void 0;
        before(function (done) {
          request.get(base_url + "/search").query({
            q: '.*'
          }).end(function (err, res) {
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
        it('検索結果は0件である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(0);
          done();
        });
      });

      describe('閲覧権減が無いユーザで検索', function () {
        var response = void 0;
        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(login_url).send({
              account_name: "hanako",
              name: "hanako",
              email: "hanako",
              password: "test"
            }).end(function (err, res) {
              user = res.body.body.user;
              request.set('x-auth-cloud-storage', res.body.body.token);
              resolve();
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(base_url + "/search").query({
                q: 'text'
              }).end(function (err, res) {
                response = res;
                resolve();
              });
            });
          }).then(function (res) {
            done();
          });
        });

        after(function (done) {
          request.post(login_url).send(_builder.authData).end(function (err, res) {
            user = res.body.body.user;
            request.set('x-auth-cloud-storage', res.body.body.token);
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

        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });

        it('取得件数は0件である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(0);
          done();
        });
      });

      describe('閲覧権限が無いユーザに権限を付与して検索', function () {
        var target_user = void 0;
        var target_role = void 0;
        var target_file = void 0;
        var response = void 0;
        before(function (done) {
          new Promise(function (resolve, reject) {

            // 権限一覧を取得
            request.get('/api/v1/role_files').end(function (err, res) {
              target_role = (0, _lodash.find)(res.body.body, { name: "フルコントロール" });
              resolve(target_role);
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get('/api/v1/users').end(function (err, res) {
                target_user = (0, _lodash.find)(res.body.body, { name: "hanako" });
                resolve(target_user);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(base_url).end(function (err, res) {
                target_file = (0, _lodash.first)(res.body.body);
                resolve(target_file);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              // ファイル権限を追加
              request.post("/api/v1/files/" + target_file._id + "/authorities").send({
                user: target_user,
                role: target_role
              }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(200);
                resolve(res);
              });
            });
          }).then(function (res) {
            console.log("wait....");
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                console.log("go!");
                resolve();
              }, 2000);
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.post(login_url).send({
                account_name: "hanako",
                name: "hanako",
                email: "hanako",
                password: "test"
              }).end(function (err, res) {
                user = res.body.body.user;
                request.set('x-auth-cloud-storage', res.body.body.token);
                resolve();
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(base_url + "/search").query({ q: "text" }).end(function (err, res) {
                response = res;
                resolve(response);
              });
            });
          }).then(function (res) {
            done();
          });
        });

        after(function (done) {
          request.post(login_url).send(_builder.authData).end(function (err, res) {
            user = res.body.body.user;
            request.set('x-auth-cloud-storage', res.body.body.token);
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
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
        it('検索結果は1件である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(1);
          done();
        });
        it('閲覧権限を登録したファイルである', function (done) {
          (0, _chai.expect)((0, _lodash.findIndex)(response.body.body, target_file) >= 0).equal(true);
          done();
        });
      });

      describe('メタ情報のみ該当するキーワードで検索', function () {
        var url = base_url + "/search";
        var response = void 0;
        var search_word = "meta_value_alpha123";
        before(function (done) {
          request.get(url).query({ q: search_word }).end(function (err, res) {
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

        it('返却値はArrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });

        it('返却値のlengthは1である', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(1);
          done();
        });

        it('メタ情報のvalueに検索キーワードが含まれる', function (done) {
          (0, _chai.expect)((0, _lodash.findIndex)((0, _lodash.first)(response.body.body).meta_infos, { value: search_word }) >= 0).equal(true);
          done();
        });
      });

      describe('表示件数以上に登録されている', function () {
        before(function (done) {
          var sendData = { dir_id: '', files: [] };

          new Promise(function (resolve, reject) {
            for (var i = 0; i < 31; i++) {
              var files = Object.assign({}, requestPayload.files[0]);
              var _i = ("0" + i).slice(-2);
              files.name = "text" + _i + ".txt";
              sendData.files.push(files);
            }
            request.post(base_url).send(sendData).end(function (err, res) {
              resolve(res);
            });
          }).then(function (res) {
            console.log("wait....");
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                console.log("done!");
                resolve();
              }, 2000);
            });
          }).then(function (res) {
            done();
          });
        });

        describe('1ページ目を取得', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "text", // 全ファイルが該当する
              page: 0
            }).end(function (err, res) {
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
          it('Arrayである', function (done) {
            (0, _chai.expect)(response.body.body instanceof Array).equal(true);
            done();
          });
          it("\u8FD4\u5374\u5024\u306Elength\u306F30\u3067\u3042\u308B", function (done) {
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
        });

        describe('2ページ目を取得', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "text", // 全ファイルが該当する
              page: 1
            }).end(function (err, res) {
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
          it('Arrayである', function (done) {
            (0, _chai.expect)(response.body.body instanceof Array).equal(true);
            done();
          });
          it("\u8FD4\u5374\u5024\u306Elength\u306F6\u3067\u3042\u308B", function (done) {
            (0, _chai.expect)(response.body.body.length).equal(6);
            done();
          });
        });

        describe('3ページ目を取得', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url + "/search").query({
              q: "text", // 全ファイルが該当する
              page: 2
            }).end(function (err, res) {
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
          it('Arrayである', function (done) {
            (0, _chai.expect)(response.body.body instanceof Array).equal(true);
            done();
          });
          it("\u8FD4\u5374\u5024\u306Elength\u306F0\u3067\u3042\u308B", function (done) {
            (0, _chai.expect)(response.body.body.length).equal(0);
            done();
          });
        });

        describe('並び替え', function () {
          var display_items = void 0;
          before(function (done) {
            request.get("/api/v1/display_items").end(function (err, res) {
              display_items = res.body.body;
              done();
            });
          });

          describe.skip('name', function () {
            describe('nameの降順', function () {
              var response = void 0;
              var file_names = void 0;
              before(function (done) {
                var display_item = display_items.filter(function (item) {
                  return item.name === "name";
                });
                request.get(base_url + "/search").query({ sort: display_item[0]._id, order: 'desc' }).end(function (err, res) {
                  response = res;
                  file_names = res.body.body.map(function (file) {
                    return file.name;
                  });
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
              it('ファイルが名前の降順で取得できている', function (done) {
                (0, _chai.expect)(response.body.body[0].name).equal('text_日本語.txt');
                (0, _chai.expect)(response.body.body[1].name).equal('text_alpha123.txt');
                (0, _chai.expect)(response.body.body[2].name).equal('text_alpha.txt');
                (0, _chai.expect)(response.body.body[3].name).equal('text_@###.txt');
                (0, _chai.expect)(response.body.body[4].name).equal('text_1.txt');
                (0, _chai.expect)(response.body.body[5].name).equal('text30.txt');
                (0, _chai.expect)(response.body.body[6].name).equal('text29.txt');
                (0, _chai.expect)(response.body.body[7].name).equal('text28.txt');
                (0, _chai.expect)(response.body.body[8].name).equal('text27.txt');
                (0, _chai.expect)(response.body.body[9].name).equal('text26.txt');
                (0, _chai.expect)(response.body.body[10].name).equal('text25.txt');
                (0, _chai.expect)(response.body.body[11].name).equal('text24.txt');
                (0, _chai.expect)(response.body.body[12].name).equal('text23.txt');
                (0, _chai.expect)(response.body.body[13].name).equal('text22.txt');
                (0, _chai.expect)(response.body.body[14].name).equal('text21.txt');
                (0, _chai.expect)(response.body.body[15].name).equal('text20.txt');
                (0, _chai.expect)(response.body.body[16].name).equal('text19.txt');
                (0, _chai.expect)(response.body.body[17].name).equal('text18.txt');
                (0, _chai.expect)(response.body.body[18].name).equal('text17.txt');
                (0, _chai.expect)(response.body.body[19].name).equal('text16.txt');
                (0, _chai.expect)(response.body.body[20].name).equal('text15.txt');
                (0, _chai.expect)(response.body.body[21].name).equal('text14.txt');
                (0, _chai.expect)(response.body.body[22].name).equal('text13.txt');
                (0, _chai.expect)(response.body.body[23].name).equal('text12.txt');
                (0, _chai.expect)(response.body.body[24].name).equal('text11.txt');
                (0, _chai.expect)(response.body.body[25].name).equal('text10.txt');
                (0, _chai.expect)(response.body.body[26].name).equal('text09.txt');
                (0, _chai.expect)(response.body.body[27].name).equal('text08.txt');
                (0, _chai.expect)(response.body.body[28].name).equal('text07.txt');
                (0, _chai.expect)(response.body.body[29].name).equal('text06.txt');
                done();
              });
            });

            describe('nameの昇順', function () {
              var response = void 0;
              var file_names = void 0;
              before(function (done) {
                var display_item = display_items.filter(function (item) {
                  return item.name === "name";
                });
                request.get(base_url + "/search").query({ sort: display_item[0]._id, order: 'asc' }).end(function (err, res) {
                  response = res;
                  file_names = res.body.body.map(function (file) {
                    return file.name;
                  });
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
              it('ファイルが名前の降順で取得できている', function (done) {
                (0, _chai.expect)(response.body.body[0].name).equal('text00.txt');
                (0, _chai.expect)(response.body.body[1].name).equal('text01.txt');
                (0, _chai.expect)(response.body.body[2].name).equal('text02.txt');
                (0, _chai.expect)(response.body.body[3].name).equal('text03.txt');
                (0, _chai.expect)(response.body.body[4].name).equal('text04.txt');
                (0, _chai.expect)(response.body.body[5].name).equal('text05.txt');
                (0, _chai.expect)(response.body.body[6].name).equal('text06.txt');
                (0, _chai.expect)(response.body.body[7].name).equal('text07.txt');
                (0, _chai.expect)(response.body.body[8].name).equal('text08.txt');
                (0, _chai.expect)(response.body.body[9].name).equal('text09.txt');
                (0, _chai.expect)(response.body.body[10].name).equal('text10.txt');
                (0, _chai.expect)(response.body.body[11].name).equal('text11.txt');
                (0, _chai.expect)(response.body.body[12].name).equal('text12.txt');
                (0, _chai.expect)(response.body.body[13].name).equal('text13.txt');
                (0, _chai.expect)(response.body.body[14].name).equal('text14.txt');
                (0, _chai.expect)(response.body.body[15].name).equal('text15.txt');
                (0, _chai.expect)(response.body.body[16].name).equal('text16.txt');
                (0, _chai.expect)(response.body.body[17].name).equal('text17.txt');
                (0, _chai.expect)(response.body.body[18].name).equal('text18.txt');
                (0, _chai.expect)(response.body.body[19].name).equal('text19.txt');
                (0, _chai.expect)(response.body.body[20].name).equal('text20.txt');
                (0, _chai.expect)(response.body.body[21].name).equal('text21.txt');
                (0, _chai.expect)(response.body.body[22].name).equal('text22.txt');
                (0, _chai.expect)(response.body.body[23].name).equal('text23.txt');
                (0, _chai.expect)(response.body.body[24].name).equal('text24.txt');
                (0, _chai.expect)(response.body.body[25].name).equal('text25.txt');
                (0, _chai.expect)(response.body.body[26].name).equal('text26.txt');
                (0, _chai.expect)(response.body.body[27].name).equal('text27.txt');
                (0, _chai.expect)(response.body.body[28].name).equal('text28.txt');
                (0, _chai.expect)(response.body.body[29].name).equal('text29.txt');
                done();
              });
            });
          });

          describe('更新日時', function () {
            describe('更新日時の降順', function () {
              it.skip('更新日時の降順のテスト', function (done) {
                done();
              });
            });
            describe('更新日時の昇順', function () {
              it.skip('更新日時の昇順のテスト', function (done) {
                done();
              });
            });
          });

          describe('メンバー', function () {
            describe('メンバーの降順', function () {
              it.skip('メンバーの降順のテスト', function (done) {
                done();
              });
            });
            describe('メンバーの昇順', function () {
              it.skip('メンバーの昇順のテスト', function (done) {
                done();
              });
            });
          });

          describe('メタ情報', function () {
            describe('メタ情報「表示ファイル名」の降順', function () {
              var response = void 0;
              var file_metainfo_values = void 0;
              before(function (done) {

                new Promise(function (resolve, reject) {
                  var display_item = (0, _lodash.find)(display_items, { name: "receive_file_name" });
                  resolve(display_item);
                }).then(function (res) {
                  var display_item = res;

                  request.get(base_url + "/search").query({ q: "txt", sort: display_item.meta_info_id, order: 'desc' }).end(function (err, res) {
                    response = res;
                    file_metainfo_values = res.body.body.filter(function (file) {
                      return file.meta_infos.length > 0;
                    }).map(function (file) {
                      return file.meta_infos[0].value;
                    });
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
              it("メタ情報の降順である", function (done) {
                (0, _chai.expect)(file_metainfo_values[0]).equal('meta_value_日本語');
                (0, _chai.expect)(file_metainfo_values[1]).equal('meta_value_alpha123');
                (0, _chai.expect)(file_metainfo_values[2]).equal('meta_value_alpha');
                (0, _chai.expect)(file_metainfo_values[3]).equal('meta_value_@###');
                (0, _chai.expect)(file_metainfo_values[4]).equal('meta_value_1');
                done();
              });
            });

            describe('メタ情報「表示ファイル名」の昇順', function () {
              var response = void 0;
              var file_metainfo_values = void 0;
              before(function (done) {

                new Promise(function (resolve, reject) {
                  var display_item = (0, _lodash.find)(display_items, { name: "receive_file_name" });
                  resolve(display_item);
                }).then(function (res) {
                  var display_item = res;

                  request.get(base_url + "/search").query({ q: "meta_value", sort: display_item.meta_info_id, order: 'asc', page: 0 }) // 30件以上ページがあるはずなので
                  .end(function (err, res) {
                    response = res;
                    file_metainfo_values = res.body.body.filter(function (file) {
                      return file.meta_infos.length > 0;
                    }).map(function (file) {
                      return file.meta_infos[0].value;
                    });
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
              it("メタ情報の昇順である", function (done) {
                (0, _chai.expect)(file_metainfo_values[0]).equal('meta_value_1');
                (0, _chai.expect)(file_metainfo_values[1]).equal('meta_value_@###');
                (0, _chai.expect)(file_metainfo_values[2]).equal('meta_value_alpha');
                (0, _chai.expect)(file_metainfo_values[3]).equal('meta_value_alpha123');
                (0, _chai.expect)(file_metainfo_values[4]).equal('meta_value_日本語');
                done();
              });
            });
          });
        });
      });
    });
  });
});