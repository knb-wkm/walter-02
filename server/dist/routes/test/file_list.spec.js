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
var user;
var meta_infos;

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
    try {
      _builder.initdbPromise.then(function () {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          user = res.body.body.user;
          request.set('x-auth-cloud-storage', res.body.body.token);
          done();
        });
      });
    } catch (e) {
      console.log(e);
      done();
    }
  });

  describe('get /', function () {
    var file_id = void 0;
    before(function (done) {
      try {
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
          meta_infos = (0, _lodash.find)(res.body.body, { name: 'display_file_name' });
          var meta = {
            meta: meta_infos,
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
      } catch (e) {
        console.log(e);
        done();
      }
    });

    describe('異常系', function () {
      describe('dir_idが不正', function () {
        var expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "指定されたフォルダが存在しないためファイル一覧の取得に失敗しました"
        };
        describe('dir_idが存在しないObjectId', function () {
          var response = void 0;
          before(function (done) {
            var id = new _mongoose2.default.Types.ObjectId().toString();
            request.get("" + base_url).query({ dir_id: id }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
        describe('dir_idが意図しない文字列', function () {
          var response = void 0;
          before(function (done) {
            var id = 'jlasjfafewlajfklejflawfkealf';
            request.get("" + base_url).query({ dir_id: id }).end(function (err, res) {
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
            (0, _chai.expect)(response.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
      });
      describe('閲覧権限のないdir_id', function () {
        var expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "閲覧権限が無いためファイル一覧の取得に失敗しました"
        };
        var response = void 0;
        var dir_id = void 0;
        before(function (done) {
          // フォルダを新規作成
          var create_dir_body = { dir_id: user.tenant.home_dir_id, dir_name: "新しいフォルダ" };
          // フォルダを作成
          new Promise(function (resolve, reject) {
            request.post('/api/v1/dirs').send(create_dir_body).end(function (err, res) {
              setTimeout(function () {
                resolve(res);
              }, 2000);
            });
          }).then(function (res) {
            // 作成したフォルダのIDを取得
            return new Promise(function (resolve, reject) {
              request.get("/api/v1/files").end(function (err, res) {
                var create_dir = res.body.body.filter(function (file) {
                  return file.name === create_dir_body.dir_name;
                });
                dir_id = (0, _lodash.first)(create_dir)._id;
                resolve(create_dir);
              });
            });
          }).then(function (res) {
            // 別ユーザでログイン
            var new_auth_data = {
              account_name: "hanako",
              name: "hanako",
              email: "hanako",
              password: "test"
            };
            return new Promise(function (resolve, reject) {
              request.post(login_url).send(new_auth_data).end(function (err, res) {
                request.set('x-auth-cloud-storage', res.body.body.token);
                resolve(res);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              // 作成したフォルダに対してリストを取得する
              request.get("" + base_url).query({ dir_id: dir_id }).end(function (err, res) {
                response = res;
                resolve(res);
              });
            });
          }).then(function (res) {
            done();
          });
        });

        after(function (done) {
          request.post(login_url).send(_builder.authData).end(function (err, res) {
            request.set('x-auth-cloud-storage', res.body.body.token);
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
          (0, _chai.expect)(response.body.status.errors.dir_id).equal(expected.detail);
          done();
        });
      });

      describe('pageが不正', function () {
        var expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "pageが数字では無いためファイル一覧の取得に失敗しました"
        };
        describe('pageが""', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url).query({ page: "" }).end(function (err, res) {
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
            request.get(base_url).query({ page: '\/:*?<>|' }).end(function (err, res) {
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
            request.get(base_url).query({ page: 'ichi' }).end(function (err, res) {
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
            request.get(base_url).query({ sort: '' }).end(function (err, res) {
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
            request.get(base_url).query({ sort: '\/:*?<>|' }).end(function (err, res) {
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
            request.get(base_url).query({ sort: 'ichi' }).end(function (err, res) {
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
            request.get(base_url).query({ order: "" }).end(function (err, res) {
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
            request.get(base_url).query({ order: '\/:*?<>|' }).end(function (err, res) {
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
            request.get(base_url).query({ order: 'koujun' }).end(function (err, res) {
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
      describe('ファイルが0件の場合', function () {
        var response = void 0;
        before(function (done) {
          new Promise(function (resolve, reject) {
            request.get(base_url).end(function (err, res) {
              resolve(res);
            });
          }).then(function (res) {
            if (res.body.body.length > 0) {
              return new Promise(function (resolve, reject) {
                res.body.body.map(function (file) {
                  return request.delete(base_url + "/" + file._id).end(function (err, res) {
                    return res;
                  });
                });
                setTimeout(function () {
                  resolve();
                }, 2000);
              });
            }
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(base_url).end(function (err, res) {
                response = res;
                resolve(res);
              });
            });
          }).then(function (res) {
            done();
          });
        });

        after(function (done) {
          new Promise(function (resolve, reject) {
            // テスト用のファイルをアップロード
            request.post('/api/v1/files').send(requestPayload).end(function (err, res) {
              // ファイルアップロードの成功をチェック
              (0, _chai.expect)(res.status).equal(200);
              (0, _chai.expect)(res.body.status.success).equal(true);
              file_id = (0, _lodash.first)(res.body.body)._id;
              setTimeout(function () {
                resolve(res);
              }, 2000);
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

        it('http(200)が返却される', function (done) {
          (0, _chai.expect)(response.status).equal(200);
          done();
        });
        it('statusはtrue', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(true);
          done();
        });

        it('返却値は配列', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });

        it('返却値のlengthは0', function (done) {
          (0, _chai.expect)(response.body.body.length).equal(0);
          done();
        });
      });
      describe('ファイルが1件以上登録されている', function () {
        var response = void 0;
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
      });
      describe('表示件数以上に登録されている場合', function () {
        var response = void 0;
        before(function (done) {
          var sendData = { dir_id: '', files: [] };

          new Promise(function (resolve, reject) {
            for (var i = 0; i < 31; i++) {
              var files = Object.assign({}, requestPayload.files[0]);
              var _i = ("0" + i).slice(-2);
              files.name = "text" + _i + ".txt";
              files.meta_infos = [{
                _id: meta_infos._id,
                value: "meta_value_" + _i
              }];
              sendData.files.push(files);
            }
            request.post(base_url).send(sendData).end(function (err, res) {
              setTimeout(function () {
                resolve(res);
              }, 2000);
            });
          }).then(function (res) {
            done();
          });
        });

        describe('1ページ目を取得', function () {
          var response = void 0;
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
            request.get(base_url).query({ page: 1 }) // 0始まりなので
            .end(function (err, res) {
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
          it("\u8FD4\u5374\u5024\u306Elength\u306F2\u3067\u3042\u308B", function (done) {
            (0, _chai.expect)(response.body.body.length).equal(2);
            done();
          });
        });
        describe('3ページ目を取得', function () {
          var response = void 0;
          before(function (done) {
            request.get(base_url).query({ page: 2 }) // 0始まりなので
            .end(function (err, res) {
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
          var response = void 0;
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
                request.get(base_url).query({ sort: display_item[0]._id, order: 'desc' }).end(function (err, res) {
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
                (0, _chai.expect)(response.body.body[0].name).equal('text30.txt');
                (0, _chai.expect)(response.body.body[1].name).equal('text29.txt');
                (0, _chai.expect)(response.body.body[2].name).equal('text28.txt');
                (0, _chai.expect)(response.body.body[3].name).equal('text27.txt');
                (0, _chai.expect)(response.body.body[4].name).equal('text26.txt');
                (0, _chai.expect)(response.body.body[5].name).equal('text25.txt');
                (0, _chai.expect)(response.body.body[6].name).equal('text24.txt');
                (0, _chai.expect)(response.body.body[7].name).equal('text23.txt');
                (0, _chai.expect)(response.body.body[8].name).equal('text22.txt');
                (0, _chai.expect)(response.body.body[9].name).equal('text21.txt');
                (0, _chai.expect)(response.body.body[10].name).equal('text20.txt');
                (0, _chai.expect)(response.body.body[11].name).equal('text19.txt');
                (0, _chai.expect)(response.body.body[12].name).equal('text18.txt');
                (0, _chai.expect)(response.body.body[13].name).equal('text17.txt');
                (0, _chai.expect)(response.body.body[14].name).equal('text16.txt');
                (0, _chai.expect)(response.body.body[15].name).equal('text15.txt');
                (0, _chai.expect)(response.body.body[16].name).equal('text14.txt');
                (0, _chai.expect)(response.body.body[17].name).equal('text13.txt');
                (0, _chai.expect)(response.body.body[18].name).equal('text12.txt');
                (0, _chai.expect)(response.body.body[19].name).equal('text11.txt');
                (0, _chai.expect)(response.body.body[20].name).equal('text10.txt');
                (0, _chai.expect)(response.body.body[21].name).equal('text09.txt');
                (0, _chai.expect)(response.body.body[22].name).equal('text08.txt');
                (0, _chai.expect)(response.body.body[23].name).equal('text07.txt');
                (0, _chai.expect)(response.body.body[24].name).equal('text06.txt');
                (0, _chai.expect)(response.body.body[25].name).equal('text05.txt');
                (0, _chai.expect)(response.body.body[26].name).equal('text04.txt');
                (0, _chai.expect)(response.body.body[27].name).equal('text03.txt');
                (0, _chai.expect)(response.body.body[28].name).equal('text02.txt');
                (0, _chai.expect)(response.body.body[29].name).equal('text01.txt');
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
                request.get(base_url).query({ sort: display_item[0]._id, order: 'asc' }).end(function (err, res) {
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
                (0, _chai.expect)(response.body.body[0].name).equal('text.txt');
                (0, _chai.expect)(response.body.body[1].name).equal('text00.txt');
                (0, _chai.expect)(response.body.body[2].name).equal('text01.txt');
                (0, _chai.expect)(response.body.body[3].name).equal('text02.txt');
                (0, _chai.expect)(response.body.body[4].name).equal('text03.txt');
                (0, _chai.expect)(response.body.body[5].name).equal('text04.txt');
                (0, _chai.expect)(response.body.body[6].name).equal('text05.txt');
                (0, _chai.expect)(response.body.body[7].name).equal('text06.txt');
                (0, _chai.expect)(response.body.body[8].name).equal('text07.txt');
                (0, _chai.expect)(response.body.body[9].name).equal('text08.txt');
                (0, _chai.expect)(response.body.body[10].name).equal('text09.txt');
                (0, _chai.expect)(response.body.body[11].name).equal('text10.txt');
                (0, _chai.expect)(response.body.body[12].name).equal('text11.txt');
                (0, _chai.expect)(response.body.body[13].name).equal('text12.txt');
                (0, _chai.expect)(response.body.body[14].name).equal('text13.txt');
                (0, _chai.expect)(response.body.body[15].name).equal('text14.txt');
                (0, _chai.expect)(response.body.body[16].name).equal('text15.txt');
                (0, _chai.expect)(response.body.body[17].name).equal('text16.txt');
                (0, _chai.expect)(response.body.body[18].name).equal('text17.txt');
                (0, _chai.expect)(response.body.body[19].name).equal('text18.txt');
                (0, _chai.expect)(response.body.body[20].name).equal('text19.txt');
                (0, _chai.expect)(response.body.body[21].name).equal('text20.txt');
                (0, _chai.expect)(response.body.body[22].name).equal('text21.txt');
                (0, _chai.expect)(response.body.body[23].name).equal('text22.txt');
                (0, _chai.expect)(response.body.body[24].name).equal('text23.txt');
                (0, _chai.expect)(response.body.body[25].name).equal('text24.txt');
                (0, _chai.expect)(response.body.body[26].name).equal('text25.txt');
                (0, _chai.expect)(response.body.body[27].name).equal('text26.txt');
                (0, _chai.expect)(response.body.body[28].name).equal('text27.txt');
                (0, _chai.expect)(response.body.body[29].name).equal('text28.txt');
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
                try {
                  new Promise(function (resolve, reject) {
                    var display_item = (0, _lodash.find)(display_items, { name: "receive_file_name" });
                    resolve(display_item);
                  }).then(function (res) {
                    var display_item = res;

                    request.get(base_url).query({ sort: display_item.meta_info_id, order: 'desc' }).end(function (err, res) {
                      response = res;
                      file_metainfo_values = res.body.body.filter(function (file) {
                        return file.meta_infos.length > 0;
                      }).map(function (file) {
                        return file.meta_infos[0].value;
                      });
                      done();
                    });
                  });
                } catch (e) {
                  console.log(e);
                  done();
                }
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
                (0, _chai.expect)(file_metainfo_values[0]).equal('meta_value_30');
                (0, _chai.expect)(file_metainfo_values[1]).equal('meta_value_29');
                (0, _chai.expect)(file_metainfo_values[2]).equal('meta_value_28');
                (0, _chai.expect)(file_metainfo_values[3]).equal('meta_value_27');
                (0, _chai.expect)(file_metainfo_values[4]).equal('meta_value_26');
                (0, _chai.expect)(file_metainfo_values[5]).equal('meta_value_25');
                (0, _chai.expect)(file_metainfo_values[6]).equal('meta_value_24');
                (0, _chai.expect)(file_metainfo_values[7]).equal('meta_value_23');
                (0, _chai.expect)(file_metainfo_values[8]).equal('meta_value_22');
                (0, _chai.expect)(file_metainfo_values[9]).equal('meta_value_21');
                (0, _chai.expect)(file_metainfo_values[10]).equal('meta_value_20');
                (0, _chai.expect)(file_metainfo_values[11]).equal('meta_value_19');
                (0, _chai.expect)(file_metainfo_values[12]).equal('meta_value_18');
                (0, _chai.expect)(file_metainfo_values[13]).equal('meta_value_17');
                (0, _chai.expect)(file_metainfo_values[14]).equal('meta_value_16');
                (0, _chai.expect)(file_metainfo_values[15]).equal('meta_value_15');
                (0, _chai.expect)(file_metainfo_values[16]).equal('meta_value_14');
                (0, _chai.expect)(file_metainfo_values[17]).equal('meta_value_13');
                (0, _chai.expect)(file_metainfo_values[18]).equal('meta_value_12');
                (0, _chai.expect)(file_metainfo_values[19]).equal('meta_value_11');
                (0, _chai.expect)(file_metainfo_values[20]).equal('meta_value_10');
                (0, _chai.expect)(file_metainfo_values[21]).equal('meta_value_09');
                (0, _chai.expect)(file_metainfo_values[22]).equal('meta_value_08');
                (0, _chai.expect)(file_metainfo_values[23]).equal('meta_value_07');
                (0, _chai.expect)(file_metainfo_values[24]).equal('meta_value_06');
                (0, _chai.expect)(file_metainfo_values[25]).equal('meta_value_05');
                (0, _chai.expect)(file_metainfo_values[26]).equal('meta_value_04');
                (0, _chai.expect)(file_metainfo_values[27]).equal('meta_value_03');
                (0, _chai.expect)(file_metainfo_values[28]).equal('meta_value_02');
                (0, _chai.expect)(file_metainfo_values[29]).equal('meta_value_01');
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

                  request.get(base_url).query({ sort: display_item.meta_info_id, order: 'asc' }).end(function (err, res) {
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
                done();
              });
              it("メタ情報の昇順である", function (done) {
                (0, _chai.expect)(file_metainfo_values[0]).equal('meta_value_00');
                (0, _chai.expect)(file_metainfo_values[1]).equal('meta_value_01');
                (0, _chai.expect)(file_metainfo_values[2]).equal('meta_value_02');
                (0, _chai.expect)(file_metainfo_values[3]).equal('meta_value_03');
                (0, _chai.expect)(file_metainfo_values[4]).equal('meta_value_04');
                (0, _chai.expect)(file_metainfo_values[5]).equal('meta_value_05');
                (0, _chai.expect)(file_metainfo_values[6]).equal('meta_value_06');
                (0, _chai.expect)(file_metainfo_values[7]).equal('meta_value_07');
                (0, _chai.expect)(file_metainfo_values[8]).equal('meta_value_08');
                (0, _chai.expect)(file_metainfo_values[9]).equal('meta_value_09');
                (0, _chai.expect)(file_metainfo_values[10]).equal('meta_value_10');
                (0, _chai.expect)(file_metainfo_values[11]).equal('meta_value_11');
                (0, _chai.expect)(file_metainfo_values[12]).equal('meta_value_12');
                (0, _chai.expect)(file_metainfo_values[13]).equal('meta_value_13');
                (0, _chai.expect)(file_metainfo_values[14]).equal('meta_value_14');
                (0, _chai.expect)(file_metainfo_values[15]).equal('meta_value_15');
                (0, _chai.expect)(file_metainfo_values[16]).equal('meta_value_16');
                (0, _chai.expect)(file_metainfo_values[17]).equal('meta_value_17');
                (0, _chai.expect)(file_metainfo_values[18]).equal('meta_value_18');
                (0, _chai.expect)(file_metainfo_values[19]).equal('meta_value_19');
                (0, _chai.expect)(file_metainfo_values[20]).equal('meta_value_20');
                (0, _chai.expect)(file_metainfo_values[21]).equal('meta_value_21');
                (0, _chai.expect)(file_metainfo_values[22]).equal('meta_value_22');
                (0, _chai.expect)(file_metainfo_values[23]).equal('meta_value_23');
                (0, _chai.expect)(file_metainfo_values[24]).equal('meta_value_24');
                (0, _chai.expect)(file_metainfo_values[25]).equal('meta_value_25');
                (0, _chai.expect)(file_metainfo_values[26]).equal('meta_value_26');
                (0, _chai.expect)(file_metainfo_values[27]).equal('meta_value_27');
                (0, _chai.expect)(file_metainfo_values[28]).equal('meta_value_28');
                (0, _chai.expect)(file_metainfo_values[29]).equal('meta_value_29');
                done();
              });
            });
          });
        });
      });

      describe('dir_idを指定する', function () {

        var response = void 0;
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
        it('statusはtrue', function (done) {
          (0, _chai.expect)(response.body.status.success).equal(true);
          done();
        });
        it('Arrayである', function (done) {
          (0, _chai.expect)(response.body.body instanceof Array).equal(true);
          done();
        });
      });
    });
  });
});