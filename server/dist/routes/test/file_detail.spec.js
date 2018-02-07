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

  describe('get /:file_id', function () {
    var file_id = void 0;
    before(function (done) {
      new Promise(function (resolve, reject) {
        // テスト用のファイルをアップロード
        request.post('/api/v1/files').send(requestPayload).end(function (err, res) {
          // ファイルアップロードの成功をチェック
          (0, _chai.expect)(res.status).equal(200);
          (0, _chai.expect)(res.body.status.success).equal(true);
          file_id = (0, _lodash.first)(res.body.body)._id;
          resolve(res);
        });
      }).then(function (res) {
        // タグ一覧を取得
        return new Promise(function (resolve, reject) {
          request.get("/api/v1/tags").end(function (err, res) {
            resolve(res);
          });
        });
      }).then(function (res) {
        var tags = (0, _lodash.first)(res.body.body);
        return new Promise(function (resolve, reject) {
          // ファイルに先頭のタグ追加
          request.post(base_url + "/" + file_id + "/tags").send(tags).end(function (err, res) {
            resolve(res);
          });
        });
      }).then(function (res) {
        // メタ情報一覧を取得
        return new Promise(function (resolve, reject) {
          request.get('/api/v1/meta_infos').end(function (err, res) {
            resolve(res);
          });
        });
      }).then(function (res) {
        // ファイルに先頭のメタ情報を追加
        var meta = {
          meta: (0, _lodash.first)(res.body.body),
          value: "meta_value"
        };
        return new Promise(function (resolve, reject) {
          request.post(base_url + "/" + file_id + "/meta").send(meta).end(function (err, res) {
            resolve(res);
          });
        });
      }).then(function (res) {
        done();
      });
    });

    describe('異常系', function () {
      describe('存在しないfile_idを指定', function () {
        var expected = {
          message: "ファイルの取得に失敗しました",
          detail: "指定されたファイルが見つかりません"
        };
        var response = void 0;
        before(function (done) {
          var id = new _mongoose2.default.Types.ObjectId();
          var url = base_url + "/" + id;
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
          (0, _chai.expect)(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('file_idにでたらめな文字列を指定', function () {
        var expected = {
          message: "ファイルの取得に失敗しました",
          detail: "ファイルIDが不正なためファイルの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var id = "jofoaefiawofjeowfjeijfeofijejifoaw";
          var url = base_url + "/" + id;
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
          (0, _chai.expect)(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('指定しているfile_idがフォルダ', function () {
        var expected = {
          message: "ファイルの取得に失敗しました",
          detail: "フォルダを指定しているためファイルの取得に失敗しました"
        };
        var response = void 0;
        before(function (done) {
          var create_dir_body = { dir_name: "ディレクトリ" };
          // フォルダを作成
          new Promise(function (resolve, reject) {
            request.post('/api/v1/dirs').send(create_dir_body).end(function (err, res) {
              resolve(res);
            });
          }).then(function (res) {
            // 作成したフォルダのIDを取得
            return new Promise(function (resolve, reject) {
              request.get("/api/v1/files").end(function (err, res) {
                var create_dir = res.body.body.filter(function (file) {
                  return file.name === create_dir_body.dir_name;
                });
                resolve(create_dir);
              });
            });
          }).then(function (res) {
            request.get(base_url + "/" + res[0]._id).end(function (err, res) {
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
          (0, _chai.expect)(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('削除済みのfile_idを指定', function () {
        var expected = {
          message: "ファイルの取得に失敗しました",
          detail: "ファイルは既に削除されているためファイルの取得に失敗しました"
        };
        var delete_file = void 0;
        var response = void 0;
        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post('/api/v1/files').send(requestPayload).end(function (err, res) {
              resolve(res);
            });
          }).then(function (res) {
            // ファイルをゴミ箱に移動
            return new Promise(function (resolve, reject) {
              request.delete("/api/v1/files/" + res.body.body[0]._id).end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            delete_file = res.body.body;
            // ファイルをゴミ箱から削除
            return new Promise(function (resolve, reject) {
              request.delete(base_url + "/" + delete_file._id + "/delete").end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            // ゴミ箱から削除したファイルの詳細を取得
            return new Promise(function (resolve, reject) {
              request.get(base_url + "/" + delete_file._id).end(function (err, res) {
                response = res;
                resolve(res);
              });
            });
          }).then(function (res) {
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
          (0, _chai.expect)(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('閲覧権限がないfile_id', function () {
        var expected = {
          message: "ファイルの取得に失敗しました",
          detail: "指定されたファイルが見つかりません"
        };
        var response = void 0;
        before(function (done) {
          var url = base_url + "/" + file_id;

          var new_auth_data = {
            account_name: "hanako",
            name: "hanako",
            email: "hanako",
            password: "test"
          };

          new Promise(function (resolve, reject) {
            request.post(login_url).send(new_auth_data).end(function (err, res) {
              request.set('x-auth-cloud-storage', res.body.body.token);
              resolve(res);
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(url).end(function (err, res) {
                response = res;
                resolve(res);
              });
            });
          }).then(function (res) {
            done();
          });;
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
          (0, _chai.expect)(response.body.status.errors.message).equal(expected.detail);
          done();
        });

        after(function (done) {
          request.post(login_url).send(_builder.authData).end(function (err, res) {
            request.set('x-auth-cloud-storage', res.body.body.token);
            done();
          });
        });
      });
    });
    describe('正常系', function () {

      var response = void 0;
      before(function (done) {
        var url = base_url + "/" + file_id;
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

      it('mime_typeが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'mime_type')).equal(true);
        done();
      });

      it('mime_typeはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.mime_type)).equal('string');
        done();
      });

      it('sizeが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'size')).equal(true);
        done();
      });

      it('sizeはnumberである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.size)).equal('number');
        done();
      });

      it('is_dirが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'is_dir')).equal(true);
        done();
      });

      it('is_dirはbooleanである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.is_dir)).equal('boolean');
        done();
      });

      it('dir_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'dir_id')).equal(true);
        done();
      });

      it('dir_idはObjectIdである', function (done) {
        (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(response.body.body.dir_id)).equal(true);
        done();
      });

      it('is_displayが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'is_display')).equal(true);
        done();
      });

      it('is_displayはbooleanである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.is_display)).equal('boolean');
        done();
      });

      it('is_starが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'is_star')).equal(true);
        done();
      });

      it('is_starはbooleanである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.is_star)).equal('boolean');
        done();
      });

      it('is_cryptedが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'is_crypted')).equal(true);
        done();
      });

      it('is_cryptedはbooleanである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.is_crypted)).equal('boolean');
        done();
      });

      it('historiesが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'histories')).equal(true);
        done();
      });

      it('historiesはArrayである', function (done) {
        (0, _chai.expect)(response.body.body.histories instanceof Array).equal(true);
        done();
      });

      it('historiesはbodyを持つ', function (done) {
        (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body.histories), 'body')).equal(true);
        done();
      });
      it('historiesはactionを持つ', function (done) {
        (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body.histories), 'action')).equal(true);
        done();
      });
      it('histories.actionはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body.histories).action)).equal('string');
        done();
      });
      it('historiesはuserを持つ', function (done) {
        (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body.histories), 'user')).equal(true);
        done();
      });
      it('historiesのuserはobjectである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body.histories).user)).equal('object');
        done();
      });

      it("historiesのuserには_id,account_name,name,email,password,enabled,tenant_id,groups,typeが含まれている", function (done) {
        var needle = ["_id", "account_name", "name", "email", "password", "enabled", "tenant_id", "groups", "type"];
        (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body.histories).user).pick(needle).keys().value().length === needle.length).equal(true);

        done();
      });

      it('historiesはmodifiedを持つ', function (done) {
        (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body.histories), 'modified')).equal(true);
        done();
      });
      it('histories.modifiedはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)((0, _lodash.first)(response.body.body.histories).modified)).equal('string');
        done();
      });

      it('tagsが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'tags')).equal(true);
        done();
      });

      it('tagsはArrayである', function (done) {
        (0, _chai.expect)(response.body.body.tags instanceof Array).equal(true);
        done();
      });

      it('tagsには_id,color,label,tenant_idが含まれている', function (done) {
        var needle = ["_id", "color", "label", "tenant_id"];
        (0, _chai.expect)((0, _lodash.chain)(response.body.body.tags).first().pick(needle).keys().value().length === needle.length).equal(true);
        done();
      });

      it('is_deletedが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'is_deleted')).equal(true);
        done();
      });

      it('is_deletedはbooleanである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.is_deleted)).equal('boolean');
        done();
      });

      it('modifiedが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'modified')).equal(true);
        done();
      });

      it('modifiedはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body.modified)).equal('string');
        done();
      });

      it('preview_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'preview_id')).equal(true);
        done();
      });

      it('preview_idはnullまたはObjectIdである', function (done) {
        if (response.body.body.preview_id === null) {
          (0, _chai.expect)(response.body.body.preview_id).equal(null);
        } else {
          (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(response.body.body.preview_id)).equal(true);
        }
        done();
      });

      it('authoritiesが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'authorities')).equal(true);
        done();
      });

      it('authoritiesはArrayである', function (done) {
        (0, _chai.expect)(response.body.body.authorities instanceof Array).equal(true);
        done();
      });

      it('authorities[0]にはrole_files, users, actionsが含まれている', function (done) {
        var needle = ["role_files", "users", "actions"];
        (0, _chai.expect)((0, _lodash.chain)(response.body.body.authorities).first().pick(needle).keys().value().length === needle.length).equal(true);
        done();
      });

      it('authorities[0].actionsには_id,name,labelが含まれている', function (done) {
        var needle = ["_id", "name", "label"];
        (0, _chai.expect)((0, _lodash.chain)((0, _lodash.first)(response.body.body.authorities).actions).first().pick(needle).keys().value().length === needle.length).equal(true);
        done();
      });

      it('dirsが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'dirs')).equal(true);
        done();
      });

      it('dirsはArrayである', function (done) {
        (0, _chai.expect)(response.body.body.dirs instanceof Array).equal(true);
        done();
      });

      it('dirsには_id,ancestor,descendant,depthが含まれている', function (done) {
        var needle = ["_id", "ancestor", "descendant", "depth"];
        (0, _chai.expect)((0, _lodash.chain)(response.body.body.dirs).first().pick(needle).keys().value().length === needle.length).equal(true);
        done();
      });

      it('meta_infosが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body, 'meta_infos')).equal(true);
        done();
      });

      it('meta_infosはArrayである', function (done) {
        (0, _chai.expect)(response.body.body.meta_infos instanceof Array).equal(true);
        done();
      });

      it('meta_infosには_id,label,value_type,valueが含まれている', function (done) {
        var needle = ["_id", "label", "value_type", "value"];
        (0, _chai.expect)((0, _lodash.chain)(response.body.body.meta_infos).first().pick(needle).keys().value().length === needle.length).equal(true);
        done();
      });
    });
  });
});