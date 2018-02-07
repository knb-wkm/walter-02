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

var _helper = require("./helper");

var helper = _interopRequireWildcard(_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _3.default);

var ObjectId = _mongoose2.default.Types.ObjectId;


var files_url = "/api/v1/files";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));

describe("patch " + files_url + "/:file_id/move", function () {
  var user = void 0;
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
    _builder.initdbPromise.then(function () {
      new Promise(function (resolve, reject) {
        request.post(login_url).send(_builder.authData).end(function (err, res) {
          request.set("x-auth-cloud-storage", res.body.body.token);
          resolve(res);
        });
      }).then(function (res) {
        user = res.body.body.user;
        done();
      });
    });
  });

  describe("正しいfile_id, dir_idを指定した場合", function () {
    var payload = void 0;
    var createdFile = void 0;

    before(function (done) {
      new Promise(function (resolve, reject) {
        request.post(files_url).send(body).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        createdFile = _.get(res, ["body", "body", "0"]);

        return new Promise(function (resolve, reject) {
          request.patch(files_url + ("/" + createdFile._id + "/move")).send({ dir_id: user.tenant.trash_dir_id }).end(function (err, res) {
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

    it("返却された値は移動後のdir_idとなっている", function (done) {
      (0, _chai.expect)(payload.body.body.dir_id).equal(user.tenant.trash_dir_id);
      done();
    });
  });

  describe("file_idが", function () {
    describe("oid形式ではない場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "ファイルIDが不正のためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + "/invalid_oid/move").send({ dir_id: user.tenant.trash_dir_id }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("存在しないidの場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "指定されたファイルが存在しないためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + user._id + "/move")).send({ dir_id: user.tenant.trash_dir_id }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });
  });

  describe("dir_idが", function () {
    describe("undefinedの場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + createdFile._id + "/move")).send().end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("nullの場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + createdFile._id + "/move")).send({ dir_id: null }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("空文字の場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + createdFile._id + "/move")).send({ dir_id: "" }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("oid形式ではない場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが不正のためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + createdFile._id + "/move")).send({ dir_id: "invalid_oid" }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("存在しないidの場合", function () {
      var payload = void 0;
      var createdFile = void 0;
      var expected = {
        message: "ファイルの移動に失敗しました",
        detail: "指定されたフォルダが存在しないためファイルの移動に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.patch(files_url + ("/" + createdFile._id + "/move")).send({ dir_id: user._id }).end(function (err, res) {
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

      it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.message).equal(expected.message);
        done();
      });

      it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
        (0, _chai.expect)(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });
  });
});