"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use('/', _2.default);

var base_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;
var search_items;
var meta_infos;
var meta;
var meta_recieve_date = [];
var tags;
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

  describe("post /search_detail", function () {

    before(function (done) {
      var sendData = { dir_id: user.tenant.home_dir_id, files: [] };
      var keyWords = [1, "日本語", "alpha", "@###", "alpha123", "[1]", '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

      new Promise(function (resolve, reject) {
        // タグ一覧を取得
        request.get("/api/v1/tags").end(function (err, res) {
          tags = (0, _lodash.first)(res.body.body);
          resolve(res);
        });
      }).then(function (res) {
        return new Promise(function (resolve, reject) {
          request.get('/api/v1/files/search_items').end(function (err, res) {
            search_items = res.body.body;
            resolve(res);
          });
        });
      }).then(function (res) {
        // メタ情報一覧を取得
        return new Promise(function (resolve, reject) {
          request.get('/api/v1/meta_infos').end(function (err, res) {
            meta_infos = res.body.body;
            meta = {
              _id: (0, _lodash.find)(res.body.body, { name: "display_file_name" })._id,
              value: "meta_value"
            };

            for (var i = 0; i < keyWords.length; i++) {
              var meta_date = (0, _moment2.default)().add(i, "days").format("YYYY-MM-DD h:mm:ss");
              meta_recieve_date.push({
                _id: (0, _lodash.find)(res.body.body, { name: "receive_date_time" })._id,
                value: new Date(meta_date)
              });
            }
            resolve(res);
          });
        });
      }).then(function (res) {
        return new Promise(function (resolve, reject) {
          var _file = {};
          for (var i = 0; i < keyWords.length; i++) {
            var files = Object.assign({}, requestPayload.files[0]);
            files.name = "text_" + keyWords[i] + ".txt";
            files.tags = [tags._id];
            files.meta_infos = [{ _id: meta._id, value: "meta_value" + keyWords[i] }, meta_recieve_date[i]];
            _file = [].concat((0, _toConsumableArray3.default)(_file), [files]);
          }
          sendData["files"] = _file;
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
            var _request$post$send;

            request.post(base_url + "/search_detail").send((_request$post$send = {}, (0, _defineProperty3.default)(_request$post$send, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send, "page", ""), _request$post$send)).end(function (err, res) {
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
            var _request$post$send2;

            request.post(base_url + "/search_detail").send((_request$post$send2 = {}, (0, _defineProperty3.default)(_request$post$send2, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send2, "page", '\/:*?<>|'), _request$post$send2)).end(function (err, res) {
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
            var _request$post$send3;

            request.post(base_url + "/search_detail").send((_request$post$send3 = {}, (0, _defineProperty3.default)(_request$post$send3, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send3, "page", 'ichi'), _request$post$send3)).end(function (err, res) {
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
            var _request$get$query;

            request.get("" + base_url).query((_request$get$query = {}, (0, _defineProperty3.default)(_request$get$query, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$get$query, "sort", ''), _request$get$query)).end(function (err, res) {
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
            var _request$post$send4;

            request.post(base_url + "/search_detail").send((_request$post$send4 = {}, (0, _defineProperty3.default)(_request$post$send4, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send4, "page", 0), (0, _defineProperty3.default)(_request$post$send4, "sort", '\/:*?<>|'), _request$post$send4)).end(function (err, res) {
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
            var _request$post$send5;

            request.post(base_url + "/search_detail").send((_request$post$send5 = {}, (0, _defineProperty3.default)(_request$post$send5, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send5, "page", 0), (0, _defineProperty3.default)(_request$post$send5, "sort", 'ichi'), _request$post$send5)).end(function (err, res) {
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
            var _request$post$send6;

            request.post(base_url + "/search_detail").send((_request$post$send6 = {}, (0, _defineProperty3.default)(_request$post$send6, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send6, "page", 0), (0, _defineProperty3.default)(_request$post$send6, "order", ''), _request$post$send6)).end(function (err, res) {
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
            var _request$post$send7;

            request.post(base_url + "/search_detail").send((_request$post$send7 = {}, (0, _defineProperty3.default)(_request$post$send7, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send7, "page", 0), (0, _defineProperty3.default)(_request$post$send7, "order", '\/:*?<>|'), _request$post$send7)).end(function (err, res) {
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
            var _request$post$send8;

            request.post(base_url + "/search_detail").send((_request$post$send8 = {}, (0, _defineProperty3.default)(_request$post$send8, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_request$post$send8, "page", 0), (0, _defineProperty3.default)(_request$post$send8, "order", 'koujun'), _request$post$send8)).end(function (err, res) {
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
      var target_tag = void 0;
      var role_user = void 0;
      var role_file = void 0;
      var file_id = void 0;
      before(function (done) {
        try {
          var _sendQuery;

          var sendQuery = (_sendQuery = {}, (0, _defineProperty3.default)(_sendQuery, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_sendQuery, "page", 0), (0, _defineProperty3.default)(_sendQuery, "order", "asc"), _sendQuery);

          var newTag = {
            tag: {
              label: "新規タグ",
              color: "#FEDCBA"
            }
          };
          var meta_info_id = void 0;
          new Promise(function (resolve, reject) {
            request.post("/api/v1/tags").send(newTag).end(function (err, res) {
              target_tag = res.body.body;
              resolve(res);
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              meta_info_id = (0, _lodash.find)(meta_infos, { name: "receive_company_name" })._id;
              resolve(res);
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              var sendData = { dir_id: user.tenant.home_dir_id, files: [] };
              var files = Object.assign({}, requestPayload.files[0]);
              files.name = "\u30E1\u30BF\u8868\u793A\u540D.txt";
              files.meta_infos = [{
                _id: meta_info_id,
                value: "受信会社名"
              }];
              files.tags = [target_tag._id];
              sendData.files.push(files);
              request.post(base_url).send(sendData).end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get(base_url + "/search").query({ q: "メタ表示名" }).end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            file_id = (0, _lodash.find)(res.body.body, { name: 'メタ表示名.txt' })._id;
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get("/api/v1/users").end(function (err, res) {
                role_user = (0, _lodash.find)(res.body.body, { name: "hanako" });
                resolve(res);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.get("/api/v1/role_files").end(function (err, res) {
                role_file = (0, _lodash.find)(res.body.body, { name: "フルコントロール" });
                resolve(res);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              var url = base_url + "/" + file_id + "/authorities";
              request.post(url).send({ user: role_user, role: role_file }).end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            return new Promise(function (resolve, reject) {
              request.patch(base_url + "/" + file_id + "/toggle_star").end(function (err, res) {
                resolve(res);
              });
            });
          }).then(function (res) {
            done();
          });
        } catch (error) {
          console.log(error);
          done();
        }
      });

      describe('検索', function () {

        describe('検索条件: text', function () {
          var response = void 0;
          before(function (done) {
            try {
              var _sendQuery2;

              var sendQuery = (_sendQuery2 = {}, (0, _defineProperty3.default)(_sendQuery2, (0, _lodash.find)(search_items, { name: 'name' })._id, "text"), (0, _defineProperty3.default)(_sendQuery2, "page", 0), (0, _defineProperty3.default)(_sendQuery2, "order", "asc"), _sendQuery2);

              request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
                if (err) throw err;
                response = res;
                done();
              });
            } catch (error) {
              console.error(error);
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

          it('Arrayである', function (done) {
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

        describe.skip('検索条件 更新日時(より大きい): 前日', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery3;

            var sendQuery = (_sendQuery3 = {}, (0, _defineProperty3.default)(_sendQuery3, (0, _lodash.find)(search_items, { name: 'modified_greater' })._id, (0, _moment2.default)().add('days', -1).format("YYYY-MM-DD HH:mm:ss")), (0, _defineProperty3.default)(_sendQuery3, "page", 0), (0, _defineProperty3.default)(_sendQuery3, "order", "asc"), _sendQuery3);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは30である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe.skip('検索条件 更新日時(より大きい): 今', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery4;

            var sendQuery = (_sendQuery4 = {}, (0, _defineProperty3.default)(_sendQuery4, (0, _lodash.find)(search_items, { name: 'modified_greater' })._id, (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss")), (0, _defineProperty3.default)(_sendQuery4, "page", 0), (0, _defineProperty3.default)(_sendQuery4, "order", "asc"), _sendQuery4);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは0である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe.skip('検索条件 更新日時(より小さい): 前日', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery5;

            var sendQuery = (_sendQuery5 = {}, (0, _defineProperty3.default)(_sendQuery5, (0, _lodash.find)(search_items, { name: 'modified_less' })._id, (0, _moment2.default)().add('days', -1).format("YYYY-MM-DD HH:mm:ss")), (0, _defineProperty3.default)(_sendQuery5, "page", 0), (0, _defineProperty3.default)(_sendQuery5, "order", "asc"), _sendQuery5);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは0である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe.skip('検索条件 更新日時(より小さい): 今', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery6;

            var sendQuery = (_sendQuery6 = {}, (0, _defineProperty3.default)(_sendQuery6, (0, _lodash.find)(search_items, { name: 'modified_less' })._id, (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss")), (0, _defineProperty3.default)(_sendQuery6, "page", 0), (0, _defineProperty3.default)(_sendQuery6, "order", "asc"), _sendQuery6);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは30である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
        });

        describe('検索条件 受信企業名（メタ情報）: 受信会社名', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery7;

            var sendQuery = (_sendQuery7 = {}, (0, _defineProperty3.default)(_sendQuery7, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_sendQuery7, "page", 0), (0, _defineProperty3.default)(_sendQuery7, "order", "asc"), _sendQuery7);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('meta_infosが含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body), 'meta_infos')).equal(true);
            done();
          });

          it('meta_infosに指定したメタ情報が含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.findIndex)((0, _lodash.first)(response.body.body).meta_infos, { label: "受信企業名", value: "受信会社名" }) >= 0).equal(true);
            done();
          });
        });

        describe('検索条件 ファイル名:日本語', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery8;

            var sendQuery = (_sendQuery8 = {}, (0, _defineProperty3.default)(_sendQuery8, (0, _lodash.find)(search_items, { name: 'name' })._id, "日本語"), (0, _defineProperty3.default)(_sendQuery8, "page", 0), (0, _defineProperty3.default)(_sendQuery8, "order", "asc"), _sendQuery8);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('nameに「日本語」が含まれる', function (done) {
            (0, _chai.expect)(response.body.body[0].name.match(/日本語/) !== null).equal(true);
            done();
          });
        });

        describe('検索条件(複合) ファイル名:メタ表示名 ,受信企業名（メタ情報）: 受信会社名', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery9;

            var sendQuery = (_sendQuery9 = {}, (0, _defineProperty3.default)(_sendQuery9, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_sendQuery9, (0, _lodash.find)(search_items, { name: 'name' })._id, "メタ表示名"), (0, _defineProperty3.default)(_sendQuery9, "page", 0), (0, _defineProperty3.default)(_sendQuery9, "order", "asc"), _sendQuery9);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('nameに「メタ表示名」が含まれる', function (done) {
            (0, _chai.expect)(response.body.body[0].name.match(/メタ表示名/) !== null).equal(true);
            done();
          });

          it('meta_infosが含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body), 'meta_infos')).equal(true);
            done();
          });

          it('meta_infosに指定したメタ情報が含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.findIndex)((0, _lodash.first)(response.body.body).meta_infos, { label: "受信企業名", value: "受信会社名" }) >= 0).equal(true);
            done();
          });
        });

        describe('検索条件が正規表現: text[1-3]', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery10;

            var sendQuery = (_sendQuery10 = {}, (0, _defineProperty3.default)(_sendQuery10, (0, _lodash.find)(search_items, { name: 'name' })._id, "text[1-3]"), (0, _defineProperty3.default)(_sendQuery10, "page", 0), (0, _defineProperty3.default)(_sendQuery10, "order", "asc"), _sendQuery10);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは0である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe('タグで検索: 新規タグ', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery11;

            var sendQuery = (_sendQuery11 = {}, (0, _defineProperty3.default)(_sendQuery11, (0, _lodash.find)(search_items, { name: 'tag' })._id, target_tag._id), (0, _defineProperty3.default)(_sendQuery11, "page", 0), (0, _defineProperty3.default)(_sendQuery11, "order", "asc"), _sendQuery11);
            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });

          it('tagsが含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.has)((0, _lodash.first)(response.body.body), 'tags')).equal(true);
            done();
          });

          it('tagsに指定したメタ情報が含まれる', function (done) {
            (0, _chai.expect)((0, _lodash.findIndex)((0, _lodash.first)(response.body.body).tags, target_tag) >= 0).equal(true);
            done();
          });

          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe('メンバーで検索', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery12;

            var sendQuery = (_sendQuery12 = {}, (0, _defineProperty3.default)(_sendQuery12, (0, _lodash.find)(search_items, { name: 'authorities' })._id, role_user._id.toString()), (0, _defineProperty3.default)(_sendQuery12, "page", 0), (0, _defineProperty3.default)(_sendQuery12, "order", "asc"), _sendQuery12);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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
          it('返却値のlengthは3である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(3);
            done();
          });
          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe('お気に入りで検索: true', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery13;

            var sendQuery = (_sendQuery13 = {}, (0, _defineProperty3.default)(_sendQuery13, (0, _lodash.find)(search_items, { name: 'favorite' })._id, true), (0, _defineProperty3.default)(_sendQuery13, "page", 0), (0, _defineProperty3.default)(_sendQuery13, "order", "asc"), _sendQuery13);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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
          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });
          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
          it('is_starはtrueである', function (done) {
            (0, _chai.expect)((0, _lodash.first)(response.body.body).is_star).equal(true);
            done();
          });
        });

        describe('お気に入りで検索: false', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery14;

            var sendQuery = (_sendQuery14 = {}, (0, _defineProperty3.default)(_sendQuery14, (0, _lodash.find)(search_items, { name: 'favorite' })._id, false), (0, _defineProperty3.default)(_sendQuery14, "page", 0), (0, _defineProperty3.default)(_sendQuery14, "order", "asc"), _sendQuery14);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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
          it('返却値のlengthは30である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
          it('is_starはtrueである', function (done) {
            (0, _chai.expect)((0, _lodash.first)(response.body.body).is_star).equal(false);
            done();
          });
        });

        describe('検索条件(複合) ファイル名:メタ表示名 ,受信企業名（メタ情報）: 受信会社名, メンバー:hanako', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery15;

            var sendQuery = (_sendQuery15 = {}, (0, _defineProperty3.default)(_sendQuery15, (0, _lodash.find)(meta_infos, { name: 'receive_company_name' })._id, "受信会社名"), (0, _defineProperty3.default)(_sendQuery15, (0, _lodash.find)(search_items, { name: 'name' })._id, "メタ表示名"), (0, _defineProperty3.default)(_sendQuery15, (0, _lodash.find)(search_items, { name: 'authorities' })._id, role_user._id.toString()), (0, _defineProperty3.default)(_sendQuery15, "page", 0), (0, _defineProperty3.default)(_sendQuery15, "order", "asc"), _sendQuery15);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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
          it('返却値のlengthは1である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(1);
            done();
          });
          it('totalが30以下の場合,lengthと一致する', function (done) {
            if (response.body.status.total <= 30) {
              (0, _chai.expect)(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });
      });
      describe('ページャー', function () {

        describe('検索条件: なし, page:0 ,order: asc', function () {
          var response = void 0;
          before(function (done) {
            var sendQuery = {
              page: 0,
              order: "asc"
            };

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは30である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
        });

        describe('検索条件: なし, page:1 ,order: asc', function () {
          var response = void 0;
          before(function (done) {
            var sendQuery = {
              page: 1,
              order: "asc"
            };

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは9である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(9);
            done();
          });
        });

        describe('検索条件: ファイル名:text, page:1 ,sort: name ,order: asc', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery16;

            var sendQuery = (_sendQuery16 = {}, (0, _defineProperty3.default)(_sendQuery16, (0, _lodash.find)(search_items, { name: 'name' })._id, "text"), (0, _defineProperty3.default)(_sendQuery16, "page", 0), (0, _defineProperty3.default)(_sendQuery16, "sort", (0, _lodash.find)(search_items, { name: 'name' })._id), (0, _defineProperty3.default)(_sendQuery16, "order", "asc"), _sendQuery16);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it("ファイル名の昇順である", function (done) {
            (0, _chai.expect)(response.body.body[0].name).equal("text_01.txt");
            (0, _chai.expect)(response.body.body[1].name).equal("text_02.txt");
            (0, _chai.expect)(response.body.body[2].name).equal("text_03.txt");
            (0, _chai.expect)(response.body.body[3].name).equal("text_04.txt");
            (0, _chai.expect)(response.body.body[4].name).equal("text_05.txt");
            (0, _chai.expect)(response.body.body[5].name).equal("text_06.txt");
            (0, _chai.expect)(response.body.body[6].name).equal("text_07.txt");
            (0, _chai.expect)(response.body.body[7].name).equal("text_08.txt");
            (0, _chai.expect)(response.body.body[8].name).equal("text_09.txt");
            (0, _chai.expect)(response.body.body[9].name).equal("text_1.txt");
            (0, _chai.expect)(response.body.body[10].name).equal("text_10.txt");
            (0, _chai.expect)(response.body.body[11].name).equal("text_11.txt");
            (0, _chai.expect)(response.body.body[12].name).equal("text_12.txt");
            (0, _chai.expect)(response.body.body[13].name).equal("text_13.txt");
            (0, _chai.expect)(response.body.body[14].name).equal("text_14.txt");
            (0, _chai.expect)(response.body.body[15].name).equal("text_15.txt");
            (0, _chai.expect)(response.body.body[16].name).equal("text_16.txt");
            (0, _chai.expect)(response.body.body[17].name).equal("text_17.txt");
            (0, _chai.expect)(response.body.body[18].name).equal("text_18.txt");
            (0, _chai.expect)(response.body.body[19].name).equal("text_19.txt");
            (0, _chai.expect)(response.body.body[20].name).equal("text_20.txt");
            (0, _chai.expect)(response.body.body[21].name).equal("text_21.txt");
            (0, _chai.expect)(response.body.body[22].name).equal("text_22.txt");
            (0, _chai.expect)(response.body.body[23].name).equal("text_23.txt");
            (0, _chai.expect)(response.body.body[24].name).equal("text_24.txt");
            (0, _chai.expect)(response.body.body[25].name).equal("text_25.txt");
            (0, _chai.expect)(response.body.body[26].name).equal("text_26.txt");
            (0, _chai.expect)(response.body.body[27].name).equal("text_27.txt");
            (0, _chai.expect)(response.body.body[28].name).equal("text_28.txt");
            (0, _chai.expect)(response.body.body[29].name).equal("text_29.txt");
            done();
          });

          it('返却値のlengthは30である', function (done) {
            var files = response.body.body.map(function (file) {
              return file.name;
            });
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
        });

        describe('検索条件: ファイル名:text, page:1 ,sort: name ,order: desc', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery17;

            var sendQuery = (_sendQuery17 = {}, (0, _defineProperty3.default)(_sendQuery17, (0, _lodash.find)(search_items, { name: 'name' })._id, "text"), (0, _defineProperty3.default)(_sendQuery17, "page", 0), (0, _defineProperty3.default)(_sendQuery17, "sort", (0, _lodash.find)(search_items, { name: 'name' })._id), (0, _defineProperty3.default)(_sendQuery17, "order", "desc"), _sendQuery17);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it("ファイル名の降順である", function (done) {
            (0, _chai.expect)(response.body.body[0].name).equal("text_日本語.txt");
            (0, _chai.expect)(response.body.body[1].name).equal("text_alpha123.txt");
            (0, _chai.expect)(response.body.body[2].name).equal("text_alpha.txt");
            (0, _chai.expect)(response.body.body[3].name).equal("text_[1].txt");
            (0, _chai.expect)(response.body.body[4].name).equal("text_@###.txt");
            (0, _chai.expect)(response.body.body[5].name).equal("text_30.txt");
            (0, _chai.expect)(response.body.body[6].name).equal("text_29.txt");
            (0, _chai.expect)(response.body.body[7].name).equal("text_28.txt");
            (0, _chai.expect)(response.body.body[8].name).equal("text_27.txt");
            (0, _chai.expect)(response.body.body[9].name).equal("text_26.txt");
            (0, _chai.expect)(response.body.body[10].name).equal("text_25.txt");
            (0, _chai.expect)(response.body.body[11].name).equal("text_24.txt");
            (0, _chai.expect)(response.body.body[12].name).equal("text_23.txt");
            (0, _chai.expect)(response.body.body[13].name).equal("text_22.txt");
            (0, _chai.expect)(response.body.body[14].name).equal("text_21.txt");
            (0, _chai.expect)(response.body.body[15].name).equal("text_20.txt");
            (0, _chai.expect)(response.body.body[16].name).equal("text_19.txt");
            (0, _chai.expect)(response.body.body[17].name).equal("text_18.txt");
            (0, _chai.expect)(response.body.body[18].name).equal("text_17.txt");
            (0, _chai.expect)(response.body.body[19].name).equal("text_16.txt");
            (0, _chai.expect)(response.body.body[20].name).equal("text_15.txt");
            (0, _chai.expect)(response.body.body[21].name).equal("text_14.txt");
            (0, _chai.expect)(response.body.body[22].name).equal("text_13.txt");
            (0, _chai.expect)(response.body.body[23].name).equal("text_12.txt");
            (0, _chai.expect)(response.body.body[24].name).equal("text_11.txt");
            (0, _chai.expect)(response.body.body[25].name).equal("text_10.txt");
            (0, _chai.expect)(response.body.body[26].name).equal("text_1.txt");
            (0, _chai.expect)(response.body.body[27].name).equal("text_09.txt");
            (0, _chai.expect)(response.body.body[28].name).equal("text_08.txt");
            (0, _chai.expect)(response.body.body[29].name).equal("text_07.txt");
            done();
          });

          it('返却値のlengthは30である', function (done) {
            var files = response.body.body.map(function (file) {
              return file.name;
            });
            (0, _chai.expect)(response.body.body.length).equal(30);
            done();
          });
        });

        describe('検索条件: ファイル名:text, page:1 ,sort: display_file_name ,order: asc', function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery18;

            var sendQuery = (_sendQuery18 = {}, (0, _defineProperty3.default)(_sendQuery18, (0, _lodash.find)(search_items, { name: 'name' })._id, "txt"), (0, _defineProperty3.default)(_sendQuery18, "page", 1), (0, _defineProperty3.default)(_sendQuery18, "sort", (0, _lodash.find)(search_items, { name: 'display_file_name' })._id), (0, _defineProperty3.default)(_sendQuery18, "order", "asc"), _sendQuery18);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it("メタ情報「表示ファイル名」の昇順である", function (done) {
            (0, _chai.expect)((0, _lodash.find)(response.body.body[0].meta_infos, { label: '表示ファイル名' }).value).equal("meta_value29");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[1].meta_infos, { label: '表示ファイル名' }).value).equal("meta_value30");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[2].meta_infos, { label: '表示ファイル名' }).value).equal("meta_value@###");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[3].meta_infos, { label: '表示ファイル名' }).value).equal("meta_value[1]");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[4].meta_infos, { label: '表示ファイル名' }).value).equal("meta_valuealpha");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[5].meta_infos, { label: '表示ファイル名' }).value).equal("meta_valuealpha123");
            (0, _chai.expect)((0, _lodash.find)(response.body.body[6].meta_infos, { label: '表示ファイル名' }).value).equal("meta_value日本語");
            done();
          });

          it('返却値のlengthは30である', function (done) {
            var files = response.body.body.map(function (file) {
              return file.name;
            });
            (0, _chai.expect)(response.body.body.length).equal(7);
            done();
          });
        });

        describe("\u30E1\u30BF\u60C5\u5831\u300C\u53D7\u4FE1\u65E5\u6642\u300D\u691C\u7D22:" + (0, _moment2.default)().add(1, "days").format("YYYY-MM-DD") + " ~ " + (0, _moment2.default)().add(3, "days").format("YYYY-MM-DD"), function () {
          var response = void 0;
          before(function (done) {
            var _sendQuery19;

            var sendQuery = (_sendQuery19 = {}, (0, _defineProperty3.default)(_sendQuery19, (0, _lodash.find)(search_items, { name: 'receive_date_time' })._id, {
              "gt": (0, _moment2.default)().add(1, "days").format("YYYY-MM-DD"),
              "lt": (0, _moment2.default)().add(3, "days").format("YYYY-MM-DD")
            }), (0, _defineProperty3.default)(_sendQuery19, "page", 0), (0, _defineProperty3.default)(_sendQuery19, "sort", (0, _lodash.find)(search_items, { name: 'receive_date_time' })._id), (0, _defineProperty3.default)(_sendQuery19, "order", "asc"), _sendQuery19);

            request.post(base_url + "/search_detail").send(sendQuery).end(function (err, res) {
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

          it('返却値のlengthは3である', function (done) {
            (0, _chai.expect)(response.body.body.length).equal(3);
            done();
          });

          it('受信日時は明日から3日後までである', function (done) {
            (0, _chai.expect)((0, _moment2.default)((0, _lodash.find)(response.body.body[0].meta_infos, { label: '受信日時' }).value).format("YYYY-MM-DD")).equal((0, _moment2.default)().add(1, "days").format("YYYY-MM-DD"));
            (0, _chai.expect)((0, _moment2.default)((0, _lodash.find)(response.body.body[1].meta_infos, { label: '受信日時' }).value).format("YYYY-MM-DD")).equal((0, _moment2.default)().add(2, "days").format("YYYY-MM-DD"));
            (0, _chai.expect)((0, _moment2.default)((0, _lodash.find)(response.body.body[2].meta_infos, { label: '受信日時' }).value).format("YYYY-MM-DD")).equal((0, _moment2.default)().add(3, "days").format("YYYY-MM-DD"));
            done();
          });
        });
      });
    });
  });
});