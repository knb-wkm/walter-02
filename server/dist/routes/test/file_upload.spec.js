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


var files_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

describe(files_url, function () {

  before(function (done) {
    _builder.initdbPromise.then(function () {
      new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          request.set("x-auth-cloud-storage", res.body.body.token);
          resolve(res);
        });
      }).then(function (res) {
        var user_id = res.body.body.user._id;

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

  describe("post /", function () {
    describe("基本的な情報のみをアップロード(単数)(正常系)", function () {
      var payload = void 0;
      var body = void 0;

      before(function (done) {
        body = {
          dir_id: user.tenant.home_dir_id,
          files: [{
            name: "test.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }]
        };

        request.post(files_url).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request.get(files_url + ("/" + file_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("nameが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.name).equal(_.head(body.files).name);
          done();
        });

        it("sizeが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.size).equal(_.head(body.files).size);
          done();
        });

        it("mime_typeが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.mime_type).equal(_.head(body.files).mime_type);
          done();
        });
      });
    });

    describe("基本的な情報のみをアップロード(複数)(正常系)", function () {
      var payload = void 0;
      var body = void 0;

      before(function (done) {
        body = {
          dir_id: user.tenant.home_dir_id,
          files: [{
            name: "multiple_files_01.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }, {
            name: "multiple_files_02.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }]
        };

        request.post(files_url).send(body).end(function (err, res) {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request.get(files_url + ("/" + file_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("nameが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.name).equal(_.head(body.files).name);
          done();
        });

        it("sizeが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.size).equal(_.head(body.files).size);
          done();
        });

        it("mime_typeが指定した値で保存されている", function (done) {
          (0, _chai.expect)(nextPayload.body.body.mime_type).equal(_.head(body.files).mime_type);
          done();
        });
      });
    });

    describe("基本的な情報のみアップード(異常系)", function () {
      describe("nameが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                // name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: null,
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
            done();
          });
        });

        describe("禁止文字(\\, / , :, *, ?, <, >, |)を含んでいる場合", function () {
          describe("バックスラッシュ", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };

            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "\\foo\\bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("スラッシュ", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };

            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "/foo/bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("コロン", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: ":foo:bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("アスタリスク", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "*foo*bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("クエスチョン", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "?foo?bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("山括弧開く", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "<foo<bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("山括弧閉じる", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: ">foo>bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });

          describe("パイプ", function () {
            var payload = void 0;
            var expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            var body = void 0;

            before(function (done) {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [{
                  name: "|foo|bar",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }]
              };

              request.post(files_url).send(body).end(function (err, res) {
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

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.message).equal(expected.message);
              done();
            });

            it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              (0, _chai.expect)(payload.body.status.errors[0].name).equal(expected.detail);
              done();
            });
          });
        });
      });

      describe("sizeが", function () {
        describe.skip("数値以外の場合", function () {});
      });

      describe("mime_typeが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "mime_type_is_undefined_01.txt",
                size: 4,
                // mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].mime_type).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "mime_type_is_null_01.txt",
                size: 4,
                // mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].mime_type).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "mime_type_is_empty_01.txt",
                size: 4,
                // mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].mime_type).equal(expected.detail);
            done();
          });
        });
      });

      describe("checksumが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg=="
                // checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].checksum).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: null
                // checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].checksum).equal(expected.detail);
            done();
          });
        });

        describe("一致しない場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが不正のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                // checksum: "8f3bee6fbae63be812de5af39714824e"
                checksum: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].checksum).equal(expected.detail);
            done();
          });
        });
      });

      describe("base64が", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                // base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].base64).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                // base64: "data:text/plain;base64,Zm9vCg==",
                base64: null,
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].base64).equal(expected.detail);
            done();
          });
        });

        describe("空の場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                // base64: "data:text/plain;base64,Zm9vCg==",
                base64: "",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].base64).equal(expected.detail);
            done();
          });
        });

        describe("DataURI形式ではない場合", function () {
          var payload = void 0;
          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が不正のためファイルのアップロードに失敗しました"
          };

          var body = void 0;

          before(function (done) {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [{
                name: "checksum_is_invalid_01.txt",
                size: 4,
                mime_type: "text/plain",
                // base64: "data:text/plain;base64,Zm9vCg==",
                base64: "Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }]
            };

            request.post(files_url).send(body).end(function (err, res) {
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

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.errors[0].base64).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("ファイル名が重複する場合", function () {
      it("dummy");
    });

    describe("メタ情報を指定した場合(正常系)", function () {
      var payload = void 0;
      var metainfo = void 0;
      var body = {
        files: [{
          name: "test.txt",
          size: 4,
          mime_type: "text/plain",
          base64: "data:text/plain;base64,Zm9vCg==",
          checksum: "8f3bee6fbae63be812de5af39714824e"
        }]
      };

      before(function (done) {
        request.get("/api/v1/meta_infos").end(function (err, res) {
          var _meta = _.find(res.body.body, { value_type: "String" });

          metainfo = {
            _id: _meta._id,
            value: "metainfo value"
          };

          body.files[0].meta_infos = [metainfo];
          body.dir_id = user.tenant.home_dir_id;

          request.post(files_url).send(body).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request.get(files_url + ("/" + file_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("meta_infosが指定した値で保存されている", function (done) {
          var payloadMetainfo = _.get(nextPayload, ["body", "body", "meta_infos", "0"]);
          var postMetainfo = _.get(body, ["files", "0", "meta_infos", "0"]);

          (0, _chai.expect)(payloadMetainfo._id).equal(postMetainfo._id);
          (0, _chai.expect)(payloadMetainfo.value).equal(postMetainfo.value);
          done();
        });
      });
    });

    describe("メタ情報を指定した場合(異常系)", function () {
      describe("metainfo_idが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [{
                // _id: ""
                value: "foobar"
              }]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [{
                _id: null,
                value: "foobar"
              }]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [{
                _id: "",
                value: "foobar"
              }]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [{
                _id: "invalid_oid",
                value: "foobar"
              }]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが不正のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("指定されたmetainfo_idがマスタに存在しない場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [{
                _id: new ObjectId().toString(),
                value: "foobar"
              }]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報が存在しないためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
      });

      describe("valueが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.get("/api/v1/meta_infos").end(function (err, res) {
              metainfo = {
                _id: _.get(res, ["body", "body", "0", ""])
              };
              body.files[0].meta_infos = [metainfo];

              request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.get("/api/v1/meta_infos").end(function (err, res) {
              metainfo = {
                _id: _.get(res, ["body", "body", "0", ""]),
                value: null
              };
              body.files[0].meta_infos = [metainfo];

              request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.get("/api/v1/meta_infos").end(function (err, res) {
              metainfo = {
                _id: _.get(res, ["body", "body", "0", ""]),
                value: ""
              };
              body.files[0].meta_infos = [metainfo];

              request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("日付型ではない場合", function () {
          var payload = void 0;
          var metainfo = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が日付型ではないためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.get("/api/v1/meta_infos").end(function (err, res) {
              var date_meta = _.find(res.body.body, { value_type: "Date" });

              metainfo = {
                _id: date_meta._id,
                value: "invalid_date"
              };

              body.files[0].meta_infos = [metainfo];

              request.post(files_url).send(body).end(function (err, res) {
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
            var _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("タグを指定した場合(正常系)", function () {
      var payload = void 0;
      var tag = void 0;
      var body = {
        files: [{
          name: "test.txt",
          size: 4,
          mime_type: "text/plain",
          base64: "data:text/plain;base64,Zm9vCg==",
          checksum: "8f3bee6fbae63be812de5af39714824e"
        }]
      };

      before(function (done) {
        body.dir_id = user.tenant.home_dir_id;
        request.get("/api/v1/tags").end(function (err, res) {
          tag = _.get(res, ["body", "body", "0", "_id"]);

          body.files[0].tags = [tag];

          request.post(files_url).send(body).end(function (err, res) {
            payload = res;
            done();
          });
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request.get(files_url + ("/" + file_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("tagsが指定した値で保存されている", function (done) {
          var payloadTag = _.get(nextPayload, ["body", "body", "tags", "0", "_id"]);
          var postTag = _.get(body, ["files", "0", "tags", "0"]);

          (0, _chai.expect)(payloadTag).equal(postTag);
          done();
        });
      });
    });

    describe("タグを指定した場合(異常系)", function () {
      describe("tag_idが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              tags: [undefined]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              tags: [null]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              tags: [""]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", function () {
          var payload = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              tags: ["invalid_oid"]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "タグIDが不正のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("tagがマスタに存在しない場合", function () {
          var payload = void 0;
          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              tags: [ObjectId()]
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "タグIDが不正のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            request.post(files_url).send(body).end(function (err, res) {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", function (done) {
            (0, _chai.expect)(payload.status).equal(400);
            done();
          });

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("ロールを指定した場合(正常系)", function () {
      var payload = void 0;
      var role_file_id = void 0;
      var user_id = void 0;

      var body = {
        files: [{
          name: "test.txt",
          size: 4,
          mime_type: "text/plain",
          base64: "data:text/plain;base64,Zm9vCg==",
          checksum: "8f3bee6fbae63be812de5af39714824e"
        }]
      };

      before(function (done) {
        body.dir_id = user.tenant.home_dir_id;

        new Promise(function (resolve, reject) {

          request.get("/api/v1/role_files").end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          role_file_id = _.get(res, ["body", "body", "0", "_id"]);

          return new Promise(function (resolve, reject) {
            request.get("/api/v1/users").end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          user_id = _.get(res, ["body", "body", "0", "_id"]);

          body.files[0].authorities = [{ role_files: role_file_id, users: user_id }];

          return new Promise(function (resolve, reject) {
            request.post(files_url).send(body).end(function (err, res) {
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

      describe("アップロードしたファイルを取得した場合", function () {
        var nextPayload = void 0;

        before(function (done) {
          var file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request.get(files_url + ("/" + file_id)).end(function (err, res) {
            nextPayload = res;
            done();
          });
        });

        it("http(200)が返却される", function (done) {
          (0, _chai.expect)(nextPayload.status).equal(200);
          done();
        });

        it("ロールが指定した値で保存されている", function (done) {
          (0, _chai.expect)(_.findIndex(nextPayload.body.body.authorities, {
            role_files: { _id: role_file_id },
            users: { _id: user_id }
          }) >= 0).equal(true);
          done();
        });
      });
    });

    describe("ロールを指定した場合(異常系)", function () {
      describe("role_file_idが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            new Promise(function (resolve, reject) {

              request.get("/api/v1/users").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: undefined, users: user_id }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
        describe("nullの場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            new Promise(function (resolve, reject) {

              request.get("/api/v1/users").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: null, users: user_id }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            new Promise(function (resolve, reject) {

              request.get("/api/v1/users").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: "", users: user_id }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが不正のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            new Promise(function (resolve, reject) {

              request.get("/api/v1/users").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: "invalid_oid", users: user_id }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("role_idがマスタに存在しない場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールが存在しないためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            new Promise(function (resolve, reject) {

              request.get("/api/v1/users").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: new ObjectId().toString(), users: user_id }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
      });

      describe("user_idが", function () {
        describe("undefinedの場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            new Promise(function (resolve, reject) {

              request.get("/api/v1/role_files").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: role_file_id, users: undefined }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            new Promise(function (resolve, reject) {

              request.get("/api/v1/role_files").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: role_file_id, users: null }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            new Promise(function (resolve, reject) {

              request.get("/api/v1/role_files").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: role_file_id, users: "" }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが不正のためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;
            new Promise(function (resolve, reject) {

              request.get("/api/v1/role_files").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: role_file_id, users: "invalid_oid" }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });

        describe("user_idがマスタに存在しない場合", function () {
          var payload = void 0;
          var role_file_id = void 0;
          var user_id = void 0;

          var body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          var expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザが存在しないためファイルのアップロードに失敗しました"
          };

          before(function (done) {
            body.dir_id = user.tenant.home_dir_id;

            new Promise(function (resolve, reject) {

              request.get("/api/v1/role_files").end(function (err, res) {
                return resolve(res);
              });
            }).then(function (res) {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [{ role_files: role_file_id, users: new ObjectId().toString() }];

              return new Promise(function (resolve, reject) {
                request.post(files_url).send(body).end(function (err, res) {
                  return resolve(res);
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

          it("successはfalse", function (done) {
            (0, _chai.expect)(payload.body.status.success).equal(false);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            (0, _chai.expect)(payload.body.status.message).equal(expected.message);
            done();
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            var _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            (0, _chai.expect)(_err).equal(expected.detail);
            done();
          });
        });
      });
    });
  });
});