"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.view = exports.getDescendants = exports.moveDir = exports.move = exports.create = exports.tree = exports.index = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _elasticsearchclient = require("../elasticsearchclient");

var _elasticsearchclient2 = _interopRequireDefault(_elasticsearchclient);

var _server = require("../configs/server");

var _Dir = require("../models/Dir");

var _Dir2 = _interopRequireDefault(_Dir);

var _File = require("../models/File");

var _File2 = _interopRequireDefault(_File);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

var _RoleFile = require("../models/RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

var _AuthorityFile = require("../models/AuthorityFile");

var _AuthorityFile2 = _interopRequireDefault(_AuthorityFile);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

var _files = require("./files");

var _lodash = require("lodash");

var _AppError = require("../errors/AppError");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;
var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var dir_id, dirs, files, sorted, withSep, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            dir_id = req.query.dir_id;

            // デフォルトはテナントのホーム

            if (dir_id === undefined || dir_id === null || dir_id === "") {
              dir_id = res.user.tenant.home_dir_id;
            }

            if (ObjectId.isValid(dir_id)) {
              _context.next = 5;
              break;
            }

            throw "dir_id is invalid";

          case 5:
            _context.next = 7;
            return _Dir2.default.find({ descendant: dir_id }).sort({ depth: -1 });

          case 7:
            dirs = _context.sent;
            _context.next = 10;
            return _File2.default.find({ _id: dirs.map(function (dir) {
                return dir.ancestor;
              }) }).select({ name: 1 });

          case 10:
            files = _context.sent;
            sorted = dirs.map(function (dir) {
              return files.filter(function (file) {
                return file._id.toString() === dir.ancestor.toString();
              });
            }).reduce(function (a, b) {
              return a.concat(b);
            });
            withSep = [].concat.apply([], sorted.map(function (dir, idx) {
              return idx === 0 ? dir : ["sep", dir];
            }));


            res.json({
              status: { success: true },
              body: withSep
            });
            _context.next = 29;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = _context.t1 === "dir_id is invalid" ? 22 : _context.t1 === "dir_id is empty" ? 24 : 26;
            break;

          case 22:
            errors.dir_id = "指定されたフォルダが存在しないためフォルダ階層の取得に失敗しました";
            return _context.abrupt("break", 28);

          case 24:
            errors.dir_id = "フォルダIDが不正のためフォルダ階層の取得に失敗しました";
            return _context.abrupt("break", 28);

          case 26:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 28);

          case 28:

            res.status(400).json({
              status: {
                success: false,
                status: false,
                message: "フォルダ階層の取得に失敗しました",
                errors: errors }
            });

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 16]]);
  }));
};

var tree = exports.tree = function tree(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var root_id, permittionIds, root, dirs, children, errors;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            root_id = req.query.root_id;

            if (!(root_id === undefined || root_id === null || root_id === "")) {
              _context2.next = 4;
              break;
            }

            throw "root_id is empty";

          case 4:
            if (ObjectId.isValid(root_id)) {
              _context2.next = 6;
              break;
            }

            throw "root_id is invalid";

          case 6:
            _context2.next = 8;
            return (0, _files.getAllowedFileIds)(res.user._id, _constants.PERMISSION_VIEW_LIST);

          case 8:
            permittionIds = _context2.sent;
            _context2.next = 11;
            return _File2.default.findById(root_id);

          case 11:
            root = _context2.sent;

            if (!(root === null)) {
              _context2.next = 14;
              break;
            }

            throw "root is empty";

          case 14:
            _context2.next = 16;
            return _Dir2.default.aggregate([{
              $match: {
                ancestor: root._id, depth: 1,
                descendant: { $in: permittionIds }
              }
            }, { $lookup: {
                from: "files",
                localField: "descendant",
                foreignField: "_id",
                as: "descendant"
              }
            }, { $unwind: "$descendant" }, {
              $match: {
                // inゴミ箱、削除のフォルダは対象外
                $nor: [{ "descendant.dir_id": res.user.tenant.trash_dir_id }, { "descendant.is_deleted": true }]
              }
            }]);

          case 16:
            dirs = _context2.sent;


            if (dirs.length === 0) {
              res.json({
                status: { success: true },
                body: {
                  _id: root._id,
                  name: root.name,
                  children: []
                }
              });
            } else {
              children = dirs.map(function (dir) {
                if (dir.descendant.is_display) {
                  return {
                    _id: dir.descendant._id,
                    name: dir.descendant.name
                  };
                } else {
                  return null;
                }
              }).filter(function (child) {
                return child !== null;
              });


              res.json({
                status: { success: true },
                body: {
                  _id: root._id,
                  name: root.name,
                  children: children
                }
              });
            }
            _context2.next = 35;
            break;

          case 20:
            _context2.prev = 20;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0;
            _context2.next = _context2.t1 === "root_id is empty" ? 26 : _context2.t1 === "root is empty" ? 28 : _context2.t1 === "root_id is invalid" ? 30 : 32;
            break;

          case 26:
            errors.root_id = "フォルダIDが空のためフォルダツリーの取得に失敗しました";
            return _context2.abrupt("break", 34);

          case 28:
            errors.root_id = "指定されたフォルダが存在しないためフォルダツリーの取得に失敗しました";
            return _context2.abrupt("break", 34);

          case 30:
            errors.root_id = "フォルダIDが不正のためフォルダツリーの取得に失敗しました";
            return _context2.abrupt("break", 34);

          case 32:
            errors.unknown = _context2.t0;
            return _context2.abrupt("break", 34);

          case 34:

            res.status(400).json({
              status: {
                success: false,
                message: "フォルダツリーの取得に失敗しました",
                errors: errors
              }
            });

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 20]]);
  }));
};

var create = exports.create = function create(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var dir_name, dir_id, user, isPermitted, dir, role, authority, history, validationConditions, _dir, _ref, newDir, newAuthority, tenant_id, updatedFile, descendantDirs, conditions, fields, files, sorted, findedDirs, dirTree, savedDirs, errors;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            dir_name = req.body.dir_name;
            dir_id = req.body.dir_id;

            if (!(dir_id === null || dir_id === undefined || dir_id === "")) {
              _context3.next = 5;
              break;
            }

            throw "dir_id is empty";

          case 5:
            if (ObjectId.isValid(dir_id)) {
              _context3.next = 7;
              break;
            }

            throw "dir_id is invalid";

          case 7:
            if (dir_name) {
              _context3.next = 9;
              break;
            }

            throw "dir_name is empty";

          case 9:
            if (!dir_name.match(new RegExp(_constants.ILLIGAL_CHARACTERS.join("|")))) {
              _context3.next = 11;
              break;
            }

            throw "dir_name is invalid";

          case 11:
            _context3.next = 13;
            return _User2.default.findById(res.user._id);

          case 13:
            user = _context3.sent;
            _context3.next = 16;
            return (0, _files.checkFilePermission)(dir_id, user._id, constants.PERMISSION_MAKE_DIR);

          case 16:
            isPermitted = _context3.sent;

            if (!(isPermitted === false)) {
              _context3.next = 19;
              break;
            }

            throw "permission denied";

          case 19:

            // フォルダ情報を構築
            dir = new _File2.default();

            dir.name = dir_name;
            dir.modified = (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss");
            dir.is_dir = true;
            dir.dir_id = dir_id;
            dir.is_display = true;
            dir.is_star = false;
            dir.tags = [];
            dir.histories = [];
            dir.authorities = [];

            _context3.next = 31;
            return _RoleFile2.default.findOne({
              tenant_id: _mongoose2.default.Types.ObjectId(res.user.tenant_id),
              name: "フルコントロール" // @fixme
            });

          case 31:
            role = _context3.sent;


            // 作成したユーザが所有者となる
            authority = new _AuthorityFile2.default();

            authority.users = user;
            authority.files = dir;
            authority.role_files = role;
            dir.authority_files = [authority];

            history = {
              modified: (0, _moment2.default)().format("YYYY-MM-DD hh:mm:ss"),
              user: user,
              action: "新規作成",
              body: ""
            };


            dir.histories = dir.histories.concat(history);

            // authoritiesを構築するためセッションからユーザ情報を抽出
            validationConditions = {
              name: dir_name,
              is_dir: true,
              dir_id: _mongoose2.default.Types.ObjectId(dir_id)
            };
            _context3.next = 42;
            return _File2.default.find(validationConditions);

          case 42:
            _dir = _context3.sent;

            if (!(_dir.length > 0)) {
              _context3.next = 45;
              break;
            }

            throw "name is duplication";

          case 45:
            _context3.next = 47;
            return { newDir: dir.save(), newAuthority: authority.save() };

          case 47:
            _ref = _context3.sent;
            newDir = _ref.newDir;
            newAuthority = _ref.newAuthority;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context3.next = 53;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(newDir._id) });

          case 53:
            updatedFile = _context3.sent;
            _context3.next = 56;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 56:
            _context3.next = 58;
            return _Dir2.default.find({ descendant: dir.dir_id }).sort({ depth: 1 });

          case 58:
            descendantDirs = _context3.sent;
            conditions = { _id: descendantDirs.map(function (dir) {
                return dir.ancestor;
              }) };
            fields = { name: 1 };
            _context3.next = 63;
            return _File2.default.find(conditions).select(fields);

          case 63:
            files = _context3.sent;
            sorted = descendantDirs.map(function (dir) {
              return files.filter(function (file) {
                return file.id == dir.ancestor;
              });
            }).reduce(function (a, b) {
              return a.concat(b);
            });
            findedDirs = [{ _id: dir._id, name: dir.name }].concat(sorted);
            dirTree = findedDirs.map(function (dir, idx, all) {
              if (idx === 0) {
                return {
                  ancestor: dir._id,
                  descendant: dir._id,
                  depth: idx
                };
              } else {
                return {
                  ancestor: dir._id,
                  descendant: all[0]._id,
                  depth: idx
                };
              }
            });
            _context3.next = 69;
            return _Dir2.default.collection.insert(dirTree);

          case 69:
            savedDirs = _context3.sent;


            res.json({
              status: { success: true },
              body: dir
            });

            _context3.next = 95;
            break;

          case 73:
            _context3.prev = 73;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0;
            _context3.next = _context3.t1 === "dir_id is empty" ? 79 : _context3.t1 === "dir_id is invalid" ? 81 : _context3.t1 === "dir_name is empty" ? 83 : _context3.t1 === "dir_name is invalid" ? 85 : _context3.t1 === "name is duplication" ? 87 : _context3.t1 === "permission denied" ? 89 : 91;
            break;

          case 79:
            errors.dir_id = "フォルダIDが空のためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 81:
            errors.dir_id = "フォルダIDが不正のためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 83:
            errors.dir_name = "フォルダ名が空のためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 85:
            errors.dir_name = "フォルダ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 87:
            errors.dir_name = "同名のフォルダが存在するためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 89:
            errors.dir_id = "フォルダ作成権限がないためフォルダの作成に失敗しました";
            return _context3.abrupt("break", 93);

          case 91:
            errors.unknown = _context3.t0;
            return _context3.abrupt("break", 93);

          case 93:
            _logger2.default.error(errors);
            res.status(400).json({
              status: {
                success: false,
                message: "フォルダの作成に失敗しました",
                errors: errors
              }
            });

          case 95:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 73]]);
  }));
};

var move = exports.move = function move(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var moving_id, destination_id, user, isPermitted, moved_dir, tenant_id, updatedFile, errors;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            moving_id = _mongoose2.default.Types.ObjectId(req.params.moving_id); // 対象

            destination_id = _mongoose2.default.Types.ObjectId(req.body.destinationDir._id); // 行き先

            if (!(moving_id.toString() === destination_id.toString())) {
              _context4.next = 5;
              break;
            }

            throw "target is the same as folder";

          case 5:
            _context4.next = 7;
            return _User2.default.findById(res.user._id);

          case 7:
            user = _context4.sent;
            _context4.next = 10;
            return (0, _files.checkFilePermission)(moving_id, user._id, constants.PERMISSION_MOVE);

          case 10:
            isPermitted = _context4.sent;

            if (isPermitted) {
              _context4.next = 13;
              break;
            }

            throw "permission denied";

          case 13:
            _context4.next = 15;
            return moveDir(moving_id, destination_id, user, "移動");

          case 15:
            moved_dir = _context4.sent;


            // 移動したフォルダについて elasticsearch index更新
            tenant_id = res.user.tenant_id;
            _context4.next = 19;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(moving_id) });

          case 19:
            updatedFile = _context4.sent;
            _context4.next = 22;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 22:

            res.json({
              status: { success: true },
              body: moved_dir
            });

            _context4.next = 42;
            break;

          case 25:
            _context4.prev = 25;
            _context4.t0 = _context4["catch"](0);
            errors = {};
            _context4.t1 = _context4.t0;
            _context4.next = _context4.t1 === "dir_id is invalid" ? 31 : _context4.t1 === "dir_id is empty" ? 33 : _context4.t1 === "target is the same as folder" ? 35 : _context4.t1 === "permission denied" ? 37 : 39;
            break;

          case 31:
            errors.dir_id = "指定されたフォルダが存在しないため移動に失敗しました";
            return _context4.abrupt("break", 41);

          case 33:
            errors.dir_id = "フォルダIDが不正のため移動に失敗しました";
            return _context4.abrupt("break", 41);

          case 35:
            errors.dir_id = "移動対象のフォルダと指定されたフォルダが同じため移動に失敗しました。";
            return _context4.abrupt("break", 41);

          case 37:
            errors.dir_id = "指定されたフォルダを移動する権限がないため移動に失敗しました";
            return _context4.abrupt("break", 41);

          case 39:
            errors.unknown = _context4.t0;
            return _context4.abrupt("break", 41);

          case 41:

            res.status(400).json({
              status: {
                success: false,
                status: false,
                message: "フォルダの移動に失敗しました",
                errors: errors }
            });

          case 42:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 25]]);
  }));
};

var moveDir = exports.moveDir = function moveDir(moving, destination, user, action) {
  var _move = function _move(moving_id, destination_id, user, action) {
    return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
      var dirs, insert_dirs, _moving, history, moved_dir;

      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(destination_id === undefined)) {
                _context5.next = 2;
                break;
              }

              throw "dir_id is invalid";

            case 2:
              _context5.next = 4;
              return _Dir2.default.find({
                depth: { $gt: 0 },
                descendant: moving_id
              }).remove();

            case 4:
              _context5.next = 6;
              return _Dir2.default.find({ descendant: destination_id, depth: { $gt: 0 } });

            case 6:
              _context5.t0 = function (dir) {
                return {
                  ancestor: dir.ancestor,
                  descendant: moving_id,
                  depth: dir.depth + 1
                };
              };

              dirs = _context5.sent.map(_context5.t0);
              insert_dirs = dirs.concat({
                ancestor: destination_id,
                descendant: moving_id,
                depth: 1
              });
              _context5.next = 11;
              return _Dir2.default.collection.insert(insert_dirs);

            case 11:
              _context5.next = 13;
              return _File2.default.findById(moving_id);

            case 13:
              _moving = _context5.sent;


              _moving.dir_id = destination_id;

              history = {
                modified: (0, _moment2.default)().format("YYYY-MM-DD hh:mm:ss"),
                user: user,
                action: action,
                body: {
                  _id: _moving._id,
                  is_star: _moving.is_star,
                  is_display: _moving.is_display,
                  dir_id: _moving.dir_id,
                  is_dir: _moving.is_dir,
                  size: _moving.size,
                  mime_type: _moving.mime_type,
                  blob_path: _moving.blob_path,
                  name: _moving.name,
                  meta_infos: _moving.meta_infos,
                  tags: _moving.tags,
                  is_deleted: _moving.is_deleted,
                  modified: _moving.modified,
                  __v: _moving.__v
                }
              };


              _moving.histories = _moving.histories.concat(history);

              _context5.next = 19;
              return _moving.save();

            case 19:
              moved_dir = _context5.sent;
              return _context5.abrupt("return", moved_dir);

            case 21:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));
  };
  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
    var childrenIds, childrenDirs, moved_dir, moved_dirs, idx, child;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _Dir2.default.find({ ancestor: moving, depth: { $gt: 0 } }).sort({ "depth": 1 });

          case 2:
            _context6.t0 = function (dir) {
              return dir.descendant;
            };

            childrenIds = _context6.sent.map(_context6.t0);
            _context6.next = 6;
            return _File2.default.find({ _id: { $in: childrenIds } }).select({ _id: 1, dir_id: 1 });

          case 6:
            childrenDirs = _context6.sent;
            _context6.next = 9;
            return _move(moving, destination, user, action);

          case 9:
            moved_dir = _context6.sent;


            // 子を同じ位置に移動し直す
            moved_dirs = [];
            _context6.t1 = _regenerator2.default.keys(childrenIds);

          case 12:
            if ((_context6.t2 = _context6.t1()).done) {
              _context6.next = 22;
              break;
            }

            idx = _context6.t2.value;
            child = (0, _lodash.find)(childrenDirs, { _id: childrenIds[idx] });
            _context6.t3 = moved_dirs;
            _context6.next = 18;
            return _move(child._id, child.dir_id, user, action);

          case 18:
            _context6.t4 = _context6.sent;

            _context6.t3.push.call(_context6.t3, _context6.t4);

            _context6.next = 12;
            break;

          case 22:
            return _context6.abrupt("return", [moved_dir].concat(moved_dirs));

          case 23:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
};

var getDescendants = exports.getDescendants = function getDescendants(dir_id) {};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
    var dir_id, file_ids, conditions, file, actions;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;

            // TODO: 詳細の取得処理はfiles.viewとほぼ同じなので共通化する.返却値に差があるので注意
            dir_id = req.params.dir_id;

            // デフォルトはテナントのホーム

            if (dir_id === undefined || dir_id === null || dir_id === "" || dir_id === "null") {
              dir_id = res.user.tenant.home_dir_id;
            }

            if (_mongoose2.default.Types.ObjectId.isValid(dir_id)) {
              _context7.next = 5;
              break;
            }

            throw new _AppError.ValidationError("ファイルIDが不正なためファイルの取得に失敗しました");

          case 5:
            _context7.next = 7;
            return (0, _files.getAllowedFileIds)(res.user._id, constants.PERMISSION_VIEW_DETAIL);

          case 7:
            file_ids = _context7.sent;

            if (file_ids.map(function (f) {
              return f.toString();
            }).includes(dir_id.toString())) {
              _context7.next = 10;
              break;
            }

            throw new _AppError.PermisstionDeniedException("指定されたファイルが見つかりません");

          case 10:
            conditions = {
              $and: [{ _id: _mongoose2.default.Types.ObjectId(dir_id) }, { _id: { $in: file_ids } }]
            };
            _context7.next = 13;
            return _File2.default.searchFileOne(conditions);

          case 13:
            file = _context7.sent;

            if (!(file === null || file === "" || file === undefined)) {
              _context7.next = 16;
              break;
            }

            throw new _AppError.RecordNotFoundException("指定されたファイルが見つかりません");

          case 16:
            if (!file.is_deleted) {
              _context7.next = 18;
              break;
            }

            throw new _AppError.RecordNotFoundException("ファイルは既に削除されているためファイルの取得に失敗しました");

          case 18:
            actions = (0, _files.extractFileActions)(file.authorities, res.user);


            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, file, { actions: actions })
            });

            _context7.next = 26;
            break;

          case 22:
            _context7.prev = 22;
            _context7.t0 = _context7["catch"](0);

            _logger2.default.error(_context7.t0);

            res.status(400).json({
              status: { success: false, message: "ファイルの取得に失敗しました", errors: _context7.t0 }
            });

          case 26:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 22]]);
  }));
};