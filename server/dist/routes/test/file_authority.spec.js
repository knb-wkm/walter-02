"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

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

describe(files_url, function () {
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

  describe("post /:file_id/authorities (権限追加)", function () {
    var role_file = void 0;
    var role_user = void 0;

    before(function (done) {
      new Promise(function (resolve, reject) {

        request.get("/api/v1/role_files").end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        role_file = _.get(res, ["body", "body", "0"]);

        return new Promise(function (resolve, reject) {
          request.get("/api/v1/users").end(function (err, res) {
            return resolve(res);
          });
        });
      }).then(function (res) {

        role_user = _.get(res, ["body", "body", "0"]);
        done();
      });
    });

    describe("正しいfile_id、role_file, role_userを指定した場合", function () {
      var file = void 0;
      var payload = void 0;
      var nextPayload = void 0;

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.get(files_url + ("/" + file._id)).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          nextPayload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("指定したrole_file, userが登録されている", function (done) {
        var _authorities = nextPayload.body.body.authorities.filter(function (auth) {
          return auth.role_files._id === role_file._id;
        });

        var _authority = _.head(_authorities);
        (0, _chai.expect)(_authority.role_files._id === role_file._id).equal(true);
        (0, _chai.expect)(_authority.users._id === role_user._id).equal(true);
        done();
      });
    });

    describe("file_idがoid形式ではない場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "ファイルIDが不正のためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + "/invalid_oid/authorities").send({ user: role_user, role: role_file }).end(function (err, res) {
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

    describe("file_idが存在しないidの場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたファイルが存在しないためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + ObjectId() + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
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

    describe("role_file_idがoid形式ではない場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定された権限が存在しないためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: "invalid_oid" }).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_file_id).equal(expected.detail);
        done();
      });
    });

    describe("role_file_idがマスタに存在しないidの場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定された権限が存在しないためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: new ObjectId().toString() }).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.role_file_id).equal(expected.detail);
        done();
      });
    });

    describe("user_idがoid形式ではない場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "ユーザIDが不正のためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: "invalid_oid", role: role_file }).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
        done();
      });
    });

    describe("user_idがマスタに存在しないidの場合", function () {
      var file = void 0;
      var payload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたユーザが存在しないためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);
          var _role_user = (0, _extends3.default)({}, role_user, { _id: new ObjectId().toString() });

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: _role_user, role: role_file }).end(function (err, res) {
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
        (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
        done();
      });
    });

    describe("role_file_id, role_user_idが既に登録されている場合", function () {
      var file = void 0;
      var payload = void 0;
      var nextPayload = void 0;
      var expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたユーザ、権限は既に登録されているためファイルへの権限の追加に失敗しました"
      };

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send(body).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.get(files_url + ("/" + file._id)).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          nextPayload = res;
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
        (0, _chai.expect)(payload.body.status.errors.role_set).equal(expected.detail);
        done();
      });

      it("2重登録されていない", function (done) {
        var _authorities = nextPayload.body.body.authorities.filter(function (auth) {
          return auth.role_files._id = role_file._id && auth.users._id === role_user._id;
        });

        (0, _chai.expect)(_authorities.length).equal(1);
        done();
      });
    });
  });

  describe("delete /:file_id/authorities (権限削除)", function () {
    var role_file = void 0;
    var role_user = void 0;

    before(function (done) {
      new Promise(function (resolve, reject) {

        request.get("/api/v1/role_files").end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {
        role_file = _.get(res, ["body", "body", "0"]);

        return new Promise(function (resolve, reject) {
          request.get("/api/v1/users").end(function (err, res) {
            return resolve(res);
          });
        });
      }).then(function (res) {

        role_user = _.get(res, ["body", "body", "0"]);
        done();
      });
    });

    describe("正しいfile_id, role_file_id, role_user_idを指定した場合", function () {
      var file = void 0;
      var payload = void 0;
      var nextPayload = void 0;

      before(function (done) {
        new Promise(function (resolve, reject) {
          request.post(files_url).send((0, _extends3.default)({}, body, { name: "delete_authority_ok_test" })).end(function (err, res) {
            return resolve(res);
          });
        }).then(function (res) {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise(function (resolve, reject) {
            request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {

          return new Promise(function (resolve, reject) {
            request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role_id: role_file._id }).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          payload = res;

          return new Promise(function (resolve, reject) {
            request.get(files_url + ("/" + file._id)).end(function (err, res) {
              return resolve(res);
            });
          });
        }).then(function (res) {
          nextPayload = res;
          done();
        });
      });

      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      describe("権限を削除したファイルを再度取得した場合", function () {
        it("権限は1つ(ファイル作成者のみ)", function (done) {
          var authority = nextPayload.body.body.authorities;
          (0, _chai.expect)(authority.length).equal(1);
          done();
        });

        it("削除したユーザが含まれていない", function (done) {
          var _roles = nextPayload.body.body.authorities.map(function (auth) {
            return { role_file_id: auth.role_files._id, user_id: auth.users._id };
          }).filter(function (role) {
            return role.role_file_id === role_file && role.role_user_id === role_user;
          });

          (0, _chai.expect)(_roles.length).equal(0);
          done();
        });
      });
    });

    describe("file_idが", function () {
      describe("oid形式ではない場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイルIDが不正のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "file_id is not oid" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + "/invalid_oid/authorities").query({ user_id: role_user._id, role_id: role_file._id }).end(function (err, res) {
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
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたファイルが存在しないためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "file_id is not found" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + new ObjectId().toString() + "/authorities")).query({ user_id: role_user._id, role_id: role_file._id }).end(function (err, res) {
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

    describe("role_file_idが", function () {
      describe("undefinedの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_file_id is undefined" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role: undefined }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_file_id is null" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role: null }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_file_id is undefined" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role: "" }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("oid形式ではない場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが不正のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_file_id is invalid oid" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role_id: "invalid_oid" }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないidの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたファイル権限が存在しないためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_file_id is not found" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: role_user._id, role_id: new ObjectId().toString() }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("role_user_idが", function () {
      describe("undefinedの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_user_id is undefined" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: undefined, role_id: role_file._id }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_user_id is null" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: null, role_id: role_file._id }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_user_id is undefined" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: "", role_id: role_file._id }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("oid形式ではない場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが不正のためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_user_id is invalid" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: "invalid_oid", role_id: role_file._id }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないidの場合", function () {
        var file = void 0;
        var payload = void 0;
        var nextPayload = void 0;
        var expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたユーザが存在しないためファイルへの権限の削除に失敗しました"
        };

        before(function (done) {
          new Promise(function (resolve, reject) {
            request.post(files_url).send((0, _extends3.default)({}, body, { name: "role_user_id is not found" })).end(function (err, res) {
              return resolve(res);
            });
          }).then(function (res) {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise(function (resolve, reject) {
              request.post(files_url + ("/" + file._id + "/authorities")).send({ user: role_user, role: role_file }).end(function (err, res) {
                return resolve(res);
              });
            });
          }).then(function (res) {

            return new Promise(function (resolve, reject) {
              request.delete(files_url + ("/" + file._id + "/authorities")).query({ user_id: new ObjectId().toString(), role_id: role_file._id }).end(function (err, res) {
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
          (0, _chai.expect)(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });
  });
});