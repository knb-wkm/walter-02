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

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _lodash = require("lodash");

var _builder = require("./builder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use("/", _2.default);

var dir_url = "/api/v1/dirs";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var user = void 0;

var ObjectId = _mongoose2.default.Types.ObjectId;


describe(dir_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        request.set("x-auth-cloud-storage", res.body.body.token);
        user = res.body.body.user;
        done();
      });
    });
  });

  describe("get /", function () {
    var expected = {
      message: "フォルダ階層の取得に失敗しました",
      detail: "指定されたフォルダが存在しないためフォルダ階層の取得に失敗しました"
    };

    var root_id = void 0;
    var child_id = void 0;

    // 親のid, 1階層子のidを取得する
    before(function (done) {
      new Promise(function (resolve, reject) {

        request.post(dir_url).send({ dir_id: user.tenant.home_dir_id, dir_name: "create dir ok" }).end(function (err, res) {
          return resolve(res);
        });
      }).then(function (res) {

        return new Promise(function (resolve, reject) {
          request.get(dir_url).query({ dir_id: user.tenant.home_dir_id }).end(function (err, res) {
            root_id = res.body.body[0]._id;
            request.get(dir_url + "/tree").query({ root_id: root_id }).end(function (err, res) {
              child_id = (0, _lodash.head)(res.body.body.children)._id;
              resolve(res);
            });
          });
        });
      }).then(function (res) {
        return done();
      });
    });

    describe("正常系", function () {
      var payload = void 0;

      before(function (done) {
        request.get(dir_url).query({ dir_id: user.tenant.home_dir_id }).end(function (err, res) {
          payload = res;
          done();
        });
      });
      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("返却されるデータは_id, nameカラムを含んでいる", function (done) {
        var needle = ["_id", "name"];
        var columns = payload.body.body.map(function (obj) {
          return (0, _lodash.intersection)(Object.keys(obj), needle).length === 2;
        });
        (0, _chai.expect)(columns.every(function (col) {
          return col === true;
        })).equal(true);
        done();
      });

      it("2階層目のdir_id指定した場合、3つオブジェクトが返却される", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length === 3).equal(true);
          done();
        });
      });

      it("配列間にはsepという文字列が挟まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)(res.body.body[1] === "sep").equal(true);
          done();
        });
      });

      it("最上位のフォルダidが配列先頭のオブジェクトに含まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.head)(res.body.body)._id === root_id).equal(true);
          done();
        });
      });

      it("最下位のフォルダidが配列末尾のオブジェクトに含まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.last)(res.body.body)._id === child_id).equal(true);
          done();
        });
      });
    });

    describe("正常系 queryが空の場合", function () {
      var payload = void 0;

      before(function (done) {
        request.get(dir_url).end(function (err, res) {
          payload = res;
          done();
        });
      });
      it("http(200)が返却される", function (done) {
        (0, _chai.expect)(payload.status).equal(200);
        done();
      });

      it("返却されるデータは_id, nameカラムを含んでいる", function (done) {
        var needle = ["_id", "name"];
        var columns = payload.body.body.map(function (obj) {
          return (0, _lodash.intersection)(Object.keys(obj), needle).length === 2;
        });
        (0, _chai.expect)(columns.every(function (col) {
          return col === true;
        })).equal(true);
        done();
      });

      it("2階層目のdir_id指定した場合、3つオブジェクトが返却される", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)(res.body.body.length === 3).equal(true);
          done();
        });
      });

      it("配列間にはsepという文字列が挟まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)(res.body.body[1] === "sep").equal(true);
          done();
        });
      });

      it("最上位のフォルダidが配列先頭のオブジェクトに含まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.head)(res.body.body)._id === root_id).equal(true);
          done();
        });
      });

      it("最下位のフォルダidが配列末尾のオブジェクトに含まれている", function (done) {
        request.get(dir_url).query({ dir_id: child_id }).end(function (err, res) {
          (0, _chai.expect)((0, _lodash.last)(res.body.body)._id === child_id).equal(true);
          done();
        });
      });
    });

    describe("異常系", function () {
      describe("queryが存在しないidである場合", function (done) {
        var expected = {
          message: "フォルダ階層の取得に失敗しました",
          detail: "指定されたフォルダが存在しないためフォルダ階層の取得に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.get(dir_url).query({ dir_id: ObjectId() }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("statusはfalse", function (done) {
          request.get(dir_url).query({ dir_id: ObjectId() }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.get(dir_url).query({ dir_id: ObjectId() }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.get(dir_url).query({ dir_id: ObjectId() }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
      });
    });
  });

  describe("get /tree", function () {
    var expected = {
      message: "フォルダツリーの取得に失敗しました",
      detail: "指定されたフォルダが存在しないためフォルダツリーの取得に失敗しました"
    };

    var tree_url = dir_url + "/tree";
    var root_id = void 0;
    var child_id = void 0;

    // 親のid, 1階層子のidを取得する
    before(function (done) {
      request.get(dir_url).query({ dir_id: user.tenant.home_dir_id }).end(function (err, res) {
        root_id = res.body.body[0]._id;
        request.get(dir_url + "/tree").query({ root_id: root_id }).end(function (err, res) {
          child_id = (0, _lodash.head)(res.body.body.children)._id;
          done();
        });
      });
    });

    describe("正常系", function () {
      it("http(200)が返却される", function (done) {
        request.get(tree_url).query({ root_id: root_id }).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(200);
          done();
        });
      });

      it("返却されるオブジェクトは_id, name, childrenを含んでいる", function (done) {
        request.get(tree_url).query({ root_id: root_id }).end(function (err, res) {
          var needle = ["_id", "name", "children"];
          var columns = (0, _lodash.intersection)(Object.keys(res.body.body), needle);
          (0, _chai.expect)(columns.length === 3).equal(true);
          done();
        });
      });

      it("親子のフォルダがネストされた状態で返却される", function (done) {
        request.get(tree_url).query({ root_id: root_id }).end(function (err, res) {
          (0, _chai.expect)(res.body.body._id).equal(root_id);
          (0, _chai.expect)((0, _lodash.head)(res.body.body.children)._id).equal(child_id);
          done();
        });
      });
    });

    describe("異常系", function () {
      describe("queryを省略した場合", function () {
        var expected = {
          message: "フォルダツリーの取得に失敗しました",
          detail: "フォルダIDが空のためフォルダツリーの取得に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.get(tree_url).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("successはfalse", function (done) {
          request.get(tree_url).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.get(tree_url).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.get(tree_url).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.root_id).equal(expected.detail);
            done();
          });
        });
      });

      describe("queryがnullの場合", function () {
        var expected = {
          message: "フォルダツリーの取得に失敗しました",
          detail: "フォルダIDが空のためフォルダツリーの取得に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.get(tree_url).query({ root_id: null }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("statusはfalse", function (done) {
          request.get(tree_url).query({ root_id: null }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.get(tree_url).query({ root_id: null }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.get(tree_url).query({ root_id: null }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.root_id).equal(expected.detail);
            done();
          });
        });
      });

      describe("queryが存在しないidの場合", function () {
        var expected = {
          message: "フォルダツリーの取得に失敗しました",
          detail: "フォルダIDが不正のためフォルダツリーの取得に失敗しました"
        };

        it("http(400)が返却される", function (done) {
          request.get(tree_url).query({ root_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("statusはfalse", function (done) {
          request.get(tree_url).query({ root_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.get(tree_url).query({ root_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.get(tree_url).query({ root_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.root_id).equal(expected.detail);
            done();
          });
        });
      });
    });
  });

  describe("post /", function () {
    var expected = {
      message: "フォルダは正常に作成されました"
    };

    var root_id = void 0;

    before(function (done) {
      request.get(dir_url).query({ dir_id: user.tenant.home_dir_id }).end(function (err, res) {
        root_id = (0, _lodash.head)(res.body.body)._id;
        done();
      });
    });

    describe("正常系", function () {

      it("http(200)が返却される", function (done) {
        request.post(dir_url).send({ dir_id: root_id, dir_name: "test_http_200" }).end(function (err, res) {
          (0, _chai.expect)(res.status).equal(200);
          done();
        });
      });

      it("指定されたdir_id上に指定されたnameのフォルダが作成される", function (done) {
        request.post(dir_url).send({ dir_id: root_id, dir_name: "test_name" }).end(function (err, res) {
          request.get(dir_url + "/tree").query({ root_id: root_id }).end(function (err, res) {
            var names = res.body.body.children.map(function (child) {
              return child.name;
            });
            (0, _chai.expect)(names.includes("test_name")).equal(true);
            done();
          });
        });
      });
    });

    describe("異常系", function () {
      describe('dir_idが未定義', function () {
        describe("dir_idを省略した場合", function () {
          var expected = {
            message: "フォルダの作成に失敗しました",
            detail: "フォルダIDが空のためフォルダの作成に失敗しました"
          };

          it("http(400)を返却する", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_undefined1" }).end(function (err, res) {
              (0, _chai.expect)(res.status).equal(400);
              done();
            });
          });

          it("statusはfalse", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_undefined1" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.success).equal(false);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_undefined2" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.message).equal(expected.message);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_undefined3" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.errors.dir_id).equal(expected.detail);
              done();
            });
          });
        });

        describe("dir_idがnullの場合", function () {
          var expected = {
            message: "フォルダの作成に失敗しました",
            detail: "フォルダIDが空のためフォルダの作成に失敗しました"
          };

          it("http(400)を返却する", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_null", dir_id: null }).end(function (err, res) {
              (0, _chai.expect)(res.status).equal(400);
              done();
            });
          });

          it("statusはfalse", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_null1" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.success).equal(false);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_null2", dir_id: null }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.message).equal(expected.message);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_null3", dir_id: null }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.errors.dir_id).equal(expected.detail);
              done();
            });
          });
        });

        describe("dir_idが空文字の場合", function () {
          var expected = {
            message: "フォルダの作成に失敗しました",
            detail: "フォルダIDが空のためフォルダの作成に失敗しました"
          };

          it("http(400)を返却する", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_empty", dir_id: "" }).end(function (err, res) {
              (0, _chai.expect)(res.status).equal(400);
              done();
            });
          });

          it("statusはfalse", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_empty1", dir_id: "" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.success).equal(false);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_empty2", dir_id: "" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.message).equal(expected.message);
              done();
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            request.post(dir_url).send({ dir_name: "dir_id_is_empty3", dir_id: "" }).end(function (err, res) {
              (0, _chai.expect)(res.body.status.errors.dir_id).equal(expected.detail);
              done();
            });
          });
        });
      });

      describe("dir_idが存在しない値の場合", function () {
        var expected = {
          message: "フォルダの作成に失敗しました",
          detail: "フォルダIDが不正のためフォルダの作成に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.post(dir_url).send({ dir_name: "dir_id_is_invalid", dir_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("successはfalse", function (done) {
          request.post(dir_url).send({ dir_name: "dir_id_is_invalid1", dir_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.post(dir_url).send({ dir_name: "dir_id_is_invalid2", dir_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.post(dir_url).send({ dir_name: "dir_id_is_invalid3", dir_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
      });

      describe("dir_nameを省略した場合", function () {
        var expected = {
          message: "フォルダの作成に失敗しました",
          detail: "フォルダ名が空のためフォルダの作成に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.post(dir_url).send({ dir_id: root_id }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("statusはfalse", function (done) {
          request.post(dir_url).send({ dir_id: "undefined" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.post(dir_url).send({ dir_id: root_id }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.post(dir_url).send({ dir_id: root_id }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
            done();
          });
        });
      });

      describe("dir_nameが空文字の場合", function () {
        var expected = {
          message: "フォルダの作成に失敗しました",
          detail: "フォルダ名が空のためフォルダの作成に失敗しました"
        };

        it("http(400)を返却する", function (done) {
          request.post(dir_url).send({ dir_id: root_id, dir_name: "" }).end(function (err, res) {
            (0, _chai.expect)(res.status).equal(400);
            done();
          });
        });

        it("statusはfalse", function (done) {
          request.post(dir_url).send({ dir_name: "", dir_id: root_id }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.success).equal(false);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
          request.post(dir_url).send({ dir_id: root_id, dir_name: "" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.message).equal(expected.message);
            done();
          });
        });

        it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
          request.post(dir_url).send({ dir_id: root_id, dir_name: "" }).end(function (err, res) {
            (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
            done();
          });
        });
      });

      describe("dir_nameが不正である場合", function () {
        describe("指定されたdir_id内に同名のフォルダが存在する場合", function () {
          var expected = {
            message: "フォルダの作成に失敗しました",
            detail: "同名のフォルダが存在するためフォルダの作成に失敗しました"
          };

          it("http(400)を返却する", function (done) {
            request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated" }).end(function (err, res) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated" }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });
          });

          it("statusはfalse", function (done) {
            request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated1" }).end(function (err, res) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
            request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated2" }).end(function (err, res) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });
          });

          it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
            request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated3" }).end(function (err, res) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: "duplicated3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });
        });

        describe("名前に「＼, / , :, *, ?, <, >, |」が含まれている場合", function () {
          var expected = {
            message: "フォルダの作成に失敗しました",
            detail: "フォルダ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためフォルダの作成に失敗しました"
          };

          describe("バックスラッシュが含まれている場合", function () {
            var dir_name = "invalid\\DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("スラッシュが含まれている場合", function () {
            var dir_name = "invalid/DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("コロンが含まれている場合", function () {
            var dir_name = "invalid:DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("アスタリスクが含まれている場合", function () {
            var dir_name = "invalid*DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("クエッションマークが含まれている場合", function () {
            var dir_name = "invalid?DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("山形括弧(開く)が含まれている場合", function () {
            var dir_name = "invalid<DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("山形括弧(閉じる)が含まれている場合", function () {
            var dir_name = "invalid>DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });

          describe("パイプが含まれている場合", function () {
            var dir_name = "invalid|DirName";

            it("http(400)を返却する", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name }).end(function (err, res) {
                (0, _chai.expect)(res.status).equal(400);
                done();
              });
            });

            it("statusはfalse", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "1" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.success).equal(false);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u6982\u8981\u306F\u300C" + expected.message + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "2" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.message).equal(expected.message);
                done();
              });
            });

            it("\u30A8\u30E9\u30FC\u306E\u8A73\u7D30\u306F\u300C" + expected.detail + "\u300D", function (done) {
              request.post(dir_url).send({ dir_id: root_id, dir_name: dir_name + "3" }).end(function (err, res) {
                (0, _chai.expect)(res.body.status.errors.dir_name).equal(expected.detail);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe.skip("patch /:moving_id/move");
});