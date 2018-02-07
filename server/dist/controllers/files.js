"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractFileActions = exports.checkFilePermission = exports.getAllowedFileIds = exports.toggleUnvisible = exports.exists = exports.previewExists = exports.deleteFilePhysical = exports.deleteFileLogical = exports.restore = exports.moveTrash = exports.removeAuthority = exports.addAuthority = exports.toggleStar = exports.removeMeta = exports.addMeta = exports.removeTag = exports.addTag = exports.upload = exports.move = exports.rename = exports.searchDetail = exports.searchItems = exports.search = exports.download = exports.view = exports.index = undefined;

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _child_process = require("child_process");

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _elasticsearchclient = require("../elasticsearchclient");

var _elasticsearchclient2 = _interopRequireDefault(_elasticsearchclient);

var _lodash = require("lodash");

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _commons = require("./commons");

var commons = _interopRequireWildcard(_commons);

var _AppError = require("../errors/AppError");

var _server = require("../configs/server");

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

var _Dir = require("../models/Dir");

var _Dir2 = _interopRequireDefault(_Dir);

var _File = require("../models/File");

var _File2 = _interopRequireDefault(_File);

var _Preview = require("../models/Preview");

var _Preview2 = _interopRequireDefault(_Preview);

var _Tag = require("../models/Tag");

var _Tag2 = _interopRequireDefault(_Tag);

var _MetaInfo = require("../models/MetaInfo");

var _MetaInfo2 = _interopRequireDefault(_MetaInfo);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

var _Group = require("../models/Group");

var _Group2 = _interopRequireDefault(_Group);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

var _RoleFile = require("../models/RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

var _AuthorityFile = require("../models/AuthorityFile");

var _AuthorityFile2 = _interopRequireDefault(_AuthorityFile);

var _Action = require("../models/Action");

var _Action2 = _interopRequireDefault(_Action);

var _FileMetaInfo = require("../models/FileMetaInfo");

var _FileMetaInfo2 = _interopRequireDefault(_FileMetaInfo);

var _DisplayItem = require("../models/DisplayItem");

var _DisplayItem2 = _interopRequireDefault(_DisplayItem);

var _Swift = require("../storages/Swift");

var _dirs = require("./dirs");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// etc
var index = exports.index = function index(req, res, next) {
  var export_excel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var no_limit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var _req$query, dir_id, page, sort, order, is_display_unvisible, tenant_id, _dir, file_ids, sortOption, action_id, isDisplayUnvisible, isDisplayUnvisibleCondition, esQuery, offset, esResult, total, esResultIds, conditions, limit, files, errors;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _req$query = req.query, dir_id = _req$query.dir_id, page = _req$query.page, sort = _req$query.sort, order = _req$query.order, is_display_unvisible = _req$query.is_display_unvisible;
            tenant_id = res.user.tenant_id;

            // デフォルトはテナントのホーム

            if (dir_id === null || dir_id === undefined || dir_id === "") {
              dir_id = res.user.tenant.home_dir_id;
            }

            if (_mongoose2.default.Types.ObjectId.isValid(dir_id)) {
              _context.next = 6;
              break;
            }

            throw new _AppError.ValidationError("dir_id is not valid");

          case 6:
            _context.next = 8;
            return _File2.default.findById(dir_id);

          case 8:
            _dir = _context.sent;

            if (!(_dir === null)) {
              _context.next = 11;
              break;
            }

            throw new _AppError.RecordNotFoundException("dir is not found");

          case 11:
            _context.t0 = [];
            _context.t1 = _toConsumableArray3.default;
            _context.next = 15;
            return getAllowedFileIds(res.user._id, constants.PERMISSION_VIEW_LIST);

          case 15:
            _context.t2 = _context.sent;
            _context.t3 = (0, _context.t1)(_context.t2);
            _context.t4 = [res.user.tenant.home_dir_id, res.user.tenant.trash_dir_id];
            file_ids = _context.t0.concat.call(_context.t0, _context.t3, _context.t4);

            if (!((0, _lodash.findIndex)(file_ids, _mongoose2.default.Types.ObjectId(dir_id)) === -1)) {
              _context.next = 21;
              break;
            }

            throw new _AppError.PermisstionDeniedException("permission denied");

          case 21:
            if (!(typeof sort === "string" && !_mongoose2.default.Types.ObjectId.isValid(sort))) {
              _context.next = 23;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 23:
            if (!(typeof order === "string" && order !== "asc" && order !== "desc")) {
              _context.next = 25;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 25:
            _context.next = 27;
            return createSortOption(sort, order);

          case 27:
            sortOption = _context.sent;


            // pagination
            if (page === undefined || page === null) page = 0;

            if (!(page === "" || (0, _lodash.isNaN)(parseInt(page)))) {
              _context.next = 31;
              break;
            }

            throw new _AppError.ValidationError("page is not number");

          case 31:
            _context.next = 33;
            return _Action2.default.findOne({ name: constants.PERMISSION_VIEW_LIST });

          case 33:
            action_id = _context.sent._id;
            // 一覧表示のアクションID

            // デフォルト表示させたくないファイル
            isDisplayUnvisible = is_display_unvisible === "true";
            isDisplayUnvisibleCondition = isDisplayUnvisible ? {} : { "match": { "file.unvisible": false } };
            esQuery = {
              index: tenant_id.toString(),
              type: "files",
              sort: ["file.is_dir:desc", sort === undefined ? "_score" : "file." + sort + ".raw:" + order],
              body: {
                "query": {
                  "bool": {
                    "must": [{
                      "match": { "file.dir_id": { "query": dir_id, "operator": "and" }
                      } }, {
                      "match": (0, _defineProperty3.default)({}, "file.actions." + action_id, {
                        "query": res.user._id, // 一覧の表示権限のあるユーザを対象
                        "operator": "and" // operator の default は or なので and のする
                      }) }, {
                      "match": {
                        "file.is_display": true
                      } }, {
                      "match": {
                        "file.is_deleted": false
                      } }, isDisplayUnvisibleCondition]
                  }
                }
              }
            };
            offset = page * constants.FILE_LIMITS_PER_PAGE;

            if (!export_excel) {
              esQuery["from"] = offset;
              esQuery["size"] = parseInt(offset) + 30;
            } else {
              esQuery["from"] = 0;
              esQuery["size"] = 0;
            }

            _context.next = 41;
            return _elasticsearchclient2.default.search(esQuery);

          case 41:
            esResult = _context.sent;
            total = esResult.hits.total;

            if (!export_excel) {
              _context.next = 48;
              break;
            }

            // elasticsearchが無制限にレコードを取得できないので一度totalを取得してから再検索する
            esQuery["size"] = total;
            _context.next = 47;
            return _elasticsearchclient2.default.search(esQuery);

          case 47:
            esResult = _context.sent;

          case 48:
            esResultIds = esResult.hits.hits.map(function (hit) {
              return _mongoose2.default.Types.ObjectId(hit._id);
            });
            conditions = {
              is_display: true,
              is_deleted: false,
              $and: [{ _id: { $in: esResultIds } }]
            };
            limit = export_excel && total !== 0 ? total : constants.FILE_LIMITS_PER_PAGE;
            _context.next = 53;
            return _File2.default.searchFiles(conditions, 0, limit, sortOption, _mongoose2.default.Types.ObjectId(sort));

          case 53:
            files = _context.sent;


            files = files.map(function (file) {
              file.actions = extractFileActions(file.authorities, res.user);
              return file;
            });

            if (!export_excel) {
              _context.next = 60;
              break;
            }

            files = files.map(function (file) {
              var route = file.dirs.filter(function (dir) {
                return dir.ancestor.is_display;
              }).map(function (dir) {
                return dir.ancestor.name;
              });

              file.dir_route = route.length > 0 ? route.reverse().join("/") : "";

              return file;
            });

            return _context.abrupt("return", files);

          case 60:
            res.json({
              status: { success: true, total: total },
              body: files
            });

          case 61:
            _context.next = 82;
            break;

          case 63:
            _context.prev = 63;
            _context.t5 = _context["catch"](0);
            errors = {};
            _context.t6 = _context.t5.message;
            _context.next = _context.t6 === "dir_id is not valid" ? 69 : _context.t6 === "dir is not found" ? 69 : _context.t6 === "dir_id is empty" ? 71 : _context.t6 === "permission denied" ? 73 : _context.t6 === "page is not number" ? 75 : _context.t6 === "sort is empty" ? 77 : 79;
            break;

          case 69:
            errors.dir_id = "指定されたフォルダが存在しないためファイル一覧の取得に失敗しました";
            return _context.abrupt("break", 80);

          case 71:
            errors.dir_id = "dir_id is empty";
            return _context.abrupt("break", 80);

          case 73:
            errors.dir_id = "閲覧権限が無いためファイル一覧の取得に失敗しました";
            return _context.abrupt("break", 80);

          case 75:
            errors.page = "pageが数字では無いためファイル一覧の取得に失敗しました";
            return _context.abrupt("break", 80);

          case 77:
            errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
            return _context.abrupt("break", 80);

          case 79:
            errors.unknown = _context.t5;

          case 80:
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, message: "ファイル一覧の取得に失敗しました", errors: errors }
            });

          case 82:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 63]]);
  }));
};

// models


// constants
var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var file_id, file_ids, conditions, file, tags, actions, route;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            file_id = req.params.file_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context2.next = 4;
              break;
            }

            throw new _AppError.ValidationError("file_idが空です");

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context2.next = 6;
              break;
            }

            throw new _AppError.ValidationError("ファイルIDが不正なためファイルの取得に失敗しました");

          case 6:
            _context2.next = 8;
            return getAllowedFileIds(res.user._id, constants.PERMISSION_VIEW_DETAIL);

          case 8:
            file_ids = _context2.sent;

            if (file_ids.map(function (f) {
              return f.toString();
            }).includes(file_id)) {
              _context2.next = 11;
              break;
            }

            throw new _AppError.PermisstionDeniedException("指定されたファイルが見つかりません");

          case 11:
            conditions = {
              $and: [{ _id: _mongoose2.default.Types.ObjectId(file_id) }, { _id: { $in: file_ids } }]
            };
            _context2.next = 14;
            return _File2.default.searchFileOne(conditions);

          case 14:
            file = _context2.sent;

            if (!(file === null || file === "" || file === undefined)) {
              _context2.next = 17;
              break;
            }

            throw new _AppError.RecordNotFoundException("指定されたファイルが見つかりません");

          case 17:
            if (!file.is_deleted) {
              _context2.next = 19;
              break;
            }

            throw new _AppError.RecordNotFoundException("ファイルは既に削除されているためファイルの取得に失敗しました");

          case 19:
            _context2.next = 21;
            return _Tag2.default.find({ _id: { $in: file.tags } });

          case 21:
            tags = _context2.sent;
            actions = extractFileActions(file.authorities, res.user);
            route = file.dirs.filter(function (dir) {
              return dir.ancestor.is_display;
            }).map(function (dir) {
              return dir.ancestor.name;
            });


            file.dir_route = route.length > 0 ? route.reverse().join("/") : "";

            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, file, { tags: tags, actions: actions })
            });

            _context2.next = 32;
            break;

          case 28:
            _context2.prev = 28;
            _context2.t0 = _context2["catch"](0);

            _logger2.default.error(_context2.t0);

            res.status(400).json({
              status: { success: false, message: "ファイルの取得に失敗しました", errors: _context2.t0 }
            });

          case 32:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 28]]);
  }));
};

var download = exports.download = function download(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var file_id, fileRecord, tenant_name, swift, readStream, errors;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            file_id = req.query.file_id;

            if (!(file_id === null || file_id === undefined || file_id === "")) {
              _context3.next = 4;
              break;
            }

            throw new _AppError.ValidationError("file_id is empty");

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context3.next = 6;
              break;
            }

            throw new _AppError.ValidationError("file_id is invalid");

          case 6:
            _context3.next = 8;
            return _File2.default.findById(file_id);

          case 8:
            fileRecord = _context3.sent;

            if (!(fileRecord === null)) {
              _context3.next = 11;
              break;
            }

            throw new _AppError.ValidationError("file is empty");

          case 11:
            if (!fileRecord.is_deleted) {
              _context3.next = 13;
              break;
            }

            throw new _AppError.ValidationError("file is deleted");

          case 13:
            tenant_name = res.user.tenant.name;
            swift = new _Swift.Swift();
            _context3.next = 17;
            return swift.downloadFile(tenant_name, fileRecord);

          case 17:
            readStream = _context3.sent;

            readStream.on("data", function (data) {
              return res.write(data);
            });
            readStream.on("end", function () {
              return res.end();
            });
            _context3.next = 37;
            break;

          case 22:
            _context3.prev = 22;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0.message;
            _context3.next = _context3.t1 === "file_id is empty" ? 28 : _context3.t1 === "file_id is invalid" ? 30 : _context3.t1 === "file is empty" ? 32 : 34;
            break;

          case 28:
            errors.file_id = "ファイルIDが空のためファイルのダウンロードに失敗しました";
            return _context3.abrupt("break", 35);

          case 30:
            errors.file_id = "ファイルIDが不正のためファイルのダウンロードに失敗しました";
            return _context3.abrupt("break", 35);

          case 32:
            errors.file_id = "指定されたファイルが存在しないためファイルのダウンロードに失敗しました";
            return _context3.abrupt("break", 35);

          case 34:
            errors.unknown = _context3.t0;

          case 35:

            _logger2.default.error(_context3.t0);

            res.status(400).json({
              status: {
                success: false,
                message: "ファイルのダウンロードに失敗しました",
                errors: _context3.t0
              }
            });

          case 37:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 22]]);
  }));
};

var search = exports.search = function search(req, res, next) {
  var export_excel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var _req$query2, q, page, sort, order, is_display_unvisible, tenant_id, _ref, trash_dir_id, _page, action_id, isDisplayUnvisible, isDisplayUnvisibleCondition, esQueryDir, esResultDir, authorizedDirIds, searchFields, esQuery, offset, esResult, total, esResultIds, conditions, limit, _sort, files, errors;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _req$query2 = req.query, q = _req$query2.q, page = _req$query2.page, sort = _req$query2.sort, order = _req$query2.order, is_display_unvisible = _req$query2.is_display_unvisible;
            tenant_id = res.user.tenant_id;

            if (!(q === undefined || q === null || q === "")) {
              _context4.next = 5;
              break;
            }

            throw new _AppError.ValidationError("q is empty");

          case 5:
            _context4.next = 7;
            return _Tenant2.default.findOne(tenant_id);

          case 7:
            _ref = _context4.sent;
            trash_dir_id = _ref.trash_dir_id;
            _page = page === undefined || page === null ? 0 : page;

            if (!(_page === "" || (0, _lodash.isNaN)(parseInt(_page)))) {
              _context4.next = 12;
              break;
            }

            throw new _AppError.ValidationError("page is not number");

          case 12:
            _context4.next = 14;
            return _Action2.default.findOne({ name: constants.PERMISSION_VIEW_LIST });

          case 14:
            action_id = _context4.sent._id;
            // 一覧表示のアクションID

            isDisplayUnvisible = is_display_unvisible === "true";
            isDisplayUnvisibleCondition = isDisplayUnvisible ? {} : { "match": { "file.unvisible": false } };

            // 閲覧できるフォルダの一覧を取得する

            esQueryDir = {
              index: tenant_id.toString(),
              type: "files",
              body: {
                "query": {
                  "bool": {
                    "must_not": [{
                      "match": { "file.dir_id": { "query": trash_dir_id.toString(), "operator": "and" } // ゴミ箱内のファイルは対象外
                      } }],
                    "must": [{
                      "match": (0, _defineProperty3.default)({}, "file.actions." + action_id, {
                        "query": res.user._id, // 一覧の表示権限のあるユーザを対象
                        "operator": "and" // operator の default は or なので and のする
                      }) }, {
                      "match": {
                        "file.is_dir": true
                      }
                    }, isDisplayUnvisibleCondition]
                  }
                }
              }
            };
            _context4.next = 20;
            return _elasticsearchclient2.default.search(esQueryDir);

          case 20:
            esResultDir = _context4.sent;


            // 取得した一覧とTopが閲覧可能なフォルダとなる
            authorizedDirIds = [].concat((0, _toConsumableArray3.default)(esResultDir.hits.hits.map(function (file) {
              return file._id;
            })), [res.user.tenant.home_dir_id.toString()]);

            // 検索対象のフィールドを取得する

            _context4.next = 24;
            return _DisplayItem2.default.aggregate([{ $match: {
                is_search: true
              } }, { $lookup: {
                from: "meta_infos",
                localField: "meta_info_id",
                foreignField: "_id",
                as: "meta_info"
              } }, {
              $unwind: {
                path: "$meta_info",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $match: {
                $or: [{ "search_value_type": 'String' }, { "meta_info.value_type": "String" }]
              }
            }]);

          case 24:
            _context4.t0 = function (item) {
              return item.meta_info_id !== null ? "file." + item.meta_info_id.toString() : "file." + item.name;
            };

            searchFields = _context4.sent.map(_context4.t0);
            esQuery = {
              index: tenant_id.toString(),
              type: "files",
              sort: ["file.is_dir:desc", sort === undefined ? "_score" : "file." + sort + ".raw:" + order, "file.name:" + order],
              body: {
                "query": {
                  "bool": {
                    "must_not": [{
                      "match": { "file.dir_id": { "query": trash_dir_id.toString(), "operator": "and" } // ゴミ箱内のファイルは対象外
                      } }],
                    "must": [{
                      "query_string": {
                        "query": escapeRegExp(q.toString().replace(/[　]/g, ' ')).split(" ").map(function (s) {
                          return "\"" + s + "\"";
                        }).join(" "),
                        "default_operator": "AND",
                        "fields": searchFields
                      }
                    }, {
                      "match": (0, _defineProperty3.default)({}, "file.actions." + action_id, {
                        "query": res.user._id, // 一覧の表示権限のあるユーザを対象
                        "operator": "and" // operator の default は or なので and のする
                      }) }, {
                      "match": {
                        "file.is_display": true
                      } }, {
                      "match": {
                        "file.is_deleted": false
                      } }, {
                      "match": {
                        "file.is_trash": false
                      } }, isDisplayUnvisibleCondition, {
                      "terms": {
                        "file.dir_id": authorizedDirIds
                      } }]
                  }
                }
              }
            };
            offset = _page * constants.FILE_LIMITS_PER_PAGE;

            if (!export_excel) {
              esQuery["from"] = offset;
              esQuery["size"] = parseInt(offset) + 30;
            } else {
              esQuery["from"] = 0;
              esQuery["size"] = 0;
            }

            _context4.next = 31;
            return _elasticsearchclient2.default.search(esQuery);

          case 31:
            esResult = _context4.sent;
            total = esResult.hits.total;

            if (!export_excel) {
              _context4.next = 38;
              break;
            }

            // elasticsearchが無制限にレコードを取得できないので一度totalを取得してから再検索する
            esQuery["size"] = total;
            _context4.next = 37;
            return _elasticsearchclient2.default.search(esQuery);

          case 37:
            esResult = _context4.sent;

          case 38:
            esResultIds = esResult.hits.hits.map(function (hit) {
              return _mongoose2.default.Types.ObjectId(hit._id);
            });
            conditions = {
              dir_id: { $ne: trash_dir_id },
              is_display: true,
              is_deleted: false,
              $and: [{ _id: { $in: esResultIds } }]
            };
            limit = export_excel && total !== 0 ? total : constants.FILE_LIMITS_PER_PAGE;

            if (!(typeof sort === "string" && !_mongoose2.default.Types.ObjectId.isValid(sort))) {
              _context4.next = 43;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 43:
            if (!(typeof order === "string" && order !== "asc" && order !== "desc")) {
              _context4.next = 45;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 45:
            _context4.next = 47;
            return createSortOption(sort, order);

          case 47:
            _sort = _context4.sent;
            _context4.next = 50;
            return _File2.default.searchFiles(conditions, 0, limit, _sort, _mongoose2.default.Types.ObjectId(sort));

          case 50:
            files = _context4.sent;

            files = files.map(function (file) {
              var route = file.dirs.filter(function (dir) {
                return dir.ancestor.is_display;
              }).map(function (dir) {
                return dir.ancestor.name;
              });

              file.dir_route = route.length > 0 ? route.reverse().join("/") : "";

              files = files.map(function (file) {

                file.actions = (0, _lodash.chain)(file.authorities).filter(function (auth) {
                  return auth.users._id.toString() === res.user._id.toString();
                }).map(function (auth) {
                  return auth.actions;
                }).flattenDeep().uniq();

                return file;
              });

              return file;
            });

            if (!export_excel) {
              _context4.next = 56;
              break;
            }

            return _context4.abrupt("return", files);

          case 56:
            res.json({
              status: { success: true, total: total },
              body: files
            });

          case 57:
            _context4.next = 74;
            break;

          case 59:
            _context4.prev = 59;
            _context4.t1 = _context4["catch"](0);
            errors = {};
            _context4.t2 = _context4.t1.message;
            _context4.next = _context4.t2 === "q is empty" ? 65 : _context4.t2 === "page is not number" ? 67 : _context4.t2 === "sort is empty" ? 69 : 71;
            break;

          case 65:
            errors.q = "検索文字列が空のためファイル一覧の取得に失敗しました";
            return _context4.abrupt("break", 72);

          case 67:
            errors.page = "pageが数字ではないためファイル一覧の取得に失敗しました";
            return _context4.abrupt("break", 72);

          case 69:
            errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
            return _context4.abrupt("break", 72);

          case 71:
            errors.unknown = _context4.t1;

          case 72:
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, message: "ファイル一覧の取得に失敗しました", errors: errors },
              body: []
            });

          case 74:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 59]]);
  }));
};

var searchItems = exports.searchItems = function searchItems(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var tenant_id, meta_only, conditions, items, metaInfos, displayItems, errors;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            tenant_id = res.user.tenant_id;

            if (!(tenant_id === undefined || tenant_id === null || tenant_id === "")) {
              _context5.next = 4;
              break;
            }

            throw new _AppError.ValidationError("tenant_id is empty");

          case 4:
            meta_only = req.query.meta_only;


            if (meta_only === undefined || meta_only === null || meta_only === "") {
              meta_only = false;
            }

            if (meta_only === "true" || meta_only === "false" || meta_only === true || meta_only === false) {
              _context5.next = 8;
              break;
            }

            throw new _AppError.ValidationError("meta_only is not boolean");

          case 8:
            conditions = {
              tenant_id: _mongoose2.default.Types.ObjectId(tenant_id)
            };
            items = void 0;

            if (!(meta_only === "true")) {
              _context5.next = 16;
              break;
            }

            _context5.next = 13;
            return _MetaInfo2.default.find(conditions);

          case 13:
            items = _context5.sent;
            _context5.next = 24;
            break;

          case 16:
            _context5.next = 18;
            return _MetaInfo2.default.find(conditions);

          case 18:
            _context5.t0 = function (meta) {
              meta = meta.toObject();
              meta.meta_info_id = meta._id;
              return meta;
            };

            metaInfos = _context5.sent.map(_context5.t0);
            _context5.next = 22;
            return _DisplayItem2.default.find((0, _extends3.default)({}, conditions, {
              // meta_info_id: null,
              name: { $nin: ["file_checkbox", "action"] }
            }));

          case 22:
            displayItems = _context5.sent;


            items = displayItems.map(function (displayItem) {
              var idx = (0, _lodash.findIndex)(metaInfos, { _id: displayItem.meta_info_id });
              if (idx >= 0) {
                var _ref2;

                var displayItemObject = displayItem.toObject();
                return _ref2 = {
                  _id: metaInfos[idx]._id,
                  tenant_id: metaInfos[idx].tenant_id,
                  meta_info_id: metaInfos[idx].meta_info_id,
                  label: metaInfos[idx].label,
                  name: metaInfos[idx].name,
                  value_type: metaInfos[idx].value_type
                }, (0, _defineProperty3.default)(_ref2, "meta_info_id", metaInfos[idx].meta_info_id), (0, _defineProperty3.default)(_ref2, "is_display", displayItemObject.is_display), (0, _defineProperty3.default)(_ref2, "is_excel", displayItemObject.is_excel), (0, _defineProperty3.default)(_ref2, "is_search", displayItemObject.is_search), (0, _defineProperty3.default)(_ref2, "width", displayItemObject.width), (0, _defineProperty3.default)(_ref2, "order", displayItemObject.order), (0, _defineProperty3.default)(_ref2, "between", displayItemObject.between), _ref2;
              } else {
                return displayItem;
              }
            });

          case 24:

            res.json({
              status: { success: true, message: "正常に取得が完了" },
              body: items
            });
            _context5.next = 38;
            break;

          case 27:
            _context5.prev = 27;
            _context5.t1 = _context5["catch"](0);
            errors = {};
            _context5.t2 = _context5.t1.message;
            _context5.next = _context5.t2 === "meta_only is not boolean" ? 33 : 35;
            break;

          case 33:
            errors.meta_only = "指定したオプションが真偽値以外のため検索項目の取得に失敗しました";
            return _context5.abrupt("break", 37);

          case 35:
            errors.unknown = commons.errorParser(_context5.t1);
            return _context5.abrupt("break", 37);

          case 37:

            res.status(400).json({
              status: { success: false, message: "検索項目の取得に失敗しました", errors: errors }
            });

          case 38:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 27]]);
  }));
};

var searchDetail = exports.searchDetail = function searchDetail(req, res, next) {
  var export_excel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
    var _req$body, queries, page, sort, order, is_display_unvisible, _page, tenant_id, _ref3, trash_dir_id, action, isDisplayUnvisible, isDisplayUnvisibleCondition, esQueryDir, esResultDir, authorizedDirIds, esQueryMustsBase, _queries, must, esQuery, offset, esResult, total, esResultIds, conditions, limit, _sort, files, errors;

    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _req$body = req.body, queries = _req$body.queries, page = _req$body.page, sort = _req$body.sort, order = _req$body.order, is_display_unvisible = _req$body.is_display_unvisible;
            _page = page === undefined || page === null ? 0 : page;

            if (!(_page === "" || (0, _lodash.isNaN)(parseInt(_page)))) {
              _context6.next = 5;
              break;
            }

            throw new _AppError.ValidationError("page is not number");

          case 5:
            tenant_id = res.user.tenant_id;
            _context6.next = 8;
            return _Tenant2.default.findById(tenant_id);

          case 8:
            _ref3 = _context6.sent;
            trash_dir_id = _ref3.trash_dir_id;
            _context6.next = 12;
            return _Action2.default.findOne({ name: constants.PERMISSION_VIEW_LIST });

          case 12:
            action = _context6.sent;
            isDisplayUnvisible = is_display_unvisible === "true";
            isDisplayUnvisibleCondition = isDisplayUnvisible ? {} : { "match": { "file.unvisible": false } };
            esQueryDir = {
              index: tenant_id.toString(),
              type: "files",
              body: {
                query: {
                  bool: {
                    must_not: [{
                      match: { "file.dir_id": { query: trash_dir_id.toString(), operator: "and" } }
                    }],
                    must: [{
                      match: (0, _defineProperty3.default)({}, "file.actions." + action._id, {
                        query: res.user._id,
                        operator: "and"
                      })
                    }, {
                      match: {
                        "file.is_dir": true
                      }
                    }, isDisplayUnvisibleCondition]
                  }
                }
              }
            };
            _context6.next = 18;
            return _elasticsearchclient2.default.search(esQueryDir);

          case 18:
            esResultDir = _context6.sent;


            // 取得した一覧とTopが閲覧可能なフォルダとなる
            authorizedDirIds = [].concat((0, _toConsumableArray3.default)(esResultDir.hits.hits.map(function (file) {
              return file._id;
            })), [res.user.tenant.home_dir_id.toString()]);
            esQueryMustsBase = [{
              match: (0, _defineProperty3.default)({}, "file.actions." + action._id, {
                query: res.user._id,
                operator: "and"
              })
            }, {
              match: {
                "file.is_display": true
              }
            }, {
              match: {
                "file.is_deleted": false
              }
            }, {
              match: {
                "file.is_trash": false
              }
            }, isDisplayUnvisibleCondition, {
              terms: {
                "file.dir_id": authorizedDirIds
              }
            }];
            _context6.next = 23;
            return queries.map(function (q) {
              // メタ情報、文字列
              if (q.meta_info_id && q.value_type === "String") {
                return {
                  query_string: {
                    query: escapeRegExp(q.value.toString().replace(/[　]/g, ' ')).split(" ").map(function (s) {
                      return "\"" + s + "\"";
                    }).join(" "),
                    default_operator: "AND",
                    fields: ["file." + q.meta_info_id]
                  }
                };
              }
              // メタ情報、日付、between
              else if (q.meta_info_id && q.value_type === "Date" && q.between) {
                  var between = {};

                  if (q.value.gt !== undefined && q.value.gt !== null && q.value.gt !== "") {
                    between.gte = (0, _moment2.default)(q.value.gt).utc();
                  } else {
                    between.gte = null;
                  }

                  if (q.value.lt !== undefined && q.value.gt !== null && q.value.gt !== "") {
                    between.lte = (0, _moment2.default)(q.value.lt).add(1, "days").utc();
                  } else {
                    between.lte = null;
                  }

                  return {
                    range: (0, _defineProperty3.default)({}, "file." + q.meta_info_id, between)
                  };
                }

              // フォルダパス(場所)
              if (q.name === "dir_route") {
                var dirQuery = {
                  name: {
                    $regex: escapeRegExp(q.value)
                  },
                  is_dir: true
                };

                return _File2.default.findOne(dirQuery).then(function (dir) {
                  return dir ? {
                    match: {
                      "file.dir_id": dir._id
                    }
                  } : {
                    match: {
                      "file.dir_id": ""
                    }
                  };
                });
              }

              // 更新日時などメタ情報以外の日付範囲
              // @todo elasticsearchでindex化されていない
              if (q.value_type === "Date" && q.between) {
                var _between = {};

                if (q.value.gt !== undefined && q.value.gt !== null && q.value.gt !== "") {
                  _between.gte = (0, _moment2.default)(q.value.gt).utc();
                } else {
                  _between.gte = null;
                }

                if (q.value.lt !== undefined && q.value.gt !== null && q.value.gt !== "") {
                  _between.lte = (0, _moment2.default)(q.value.lt).add(1, "days").utc();
                } else {
                  _between.lte = null;
                }

                return {
                  range: (0, _defineProperty3.default)({}, "file." + q.name, _between)
                };
              }

              // タグ @todo elasticsearchにindex化されていない

              // メタ情報以外の文字列
              return {
                query_string: {
                  query: escapeRegExp(q.value.toString().replace(/[　]/g, ' ')).split(" ").map(function (s) {
                    return "\"" + s + "\"";
                  }).join(" "),
                  default_operator: "AND",
                  fields: ["file." + q.name]
                }
              };
            });

          case 23:
            _queries = _context6.sent;
            must = [].concat(esQueryMustsBase, [_queries]);
            esQuery = {
              index: tenant_id.toString(),
              type: "files",
              sort: ["file.is_dir:desc", sort === undefined || sort === null ? "_score" : "file." + sort + ".raw:" + order, "file.name:" + order],
              body: {
                query: {
                  bool: {
                    must_not: [{
                      match: {
                        "file.dir_id": {
                          query: trash_dir_id.toString(),
                          operator: "AND"
                        }
                      }
                    }],
                    must: must
                  }
                }
              }
            };
            offset = _page * constants.FILE_LIMITS_PER_PAGE;


            if (!export_excel) {
              esQuery["from"] = offset;
              esQuery["size"] = parseInt(offset) + 30;
            } else {
              esQuery["from"] = 0;
              esQuery["size"] = 0;
            }

            _context6.next = 30;
            return _elasticsearchclient2.default.search(esQuery);

          case 30:
            esResult = _context6.sent;
            total = esResult.hits.total;

            if (!export_excel) {
              _context6.next = 37;
              break;
            }

            esQuery["size"] = total;
            _context6.next = 36;
            return _elasticsearchclient2.default.search(esQuery);

          case 36:
            esResult = _context6.sent;

          case 37:
            esResultIds = esResult.hits.hits.map(function (hit) {
              return _mongoose2.default.Types.ObjectId(hit._id);
            });
            conditions = {
              dir_id: { $ne: trash_dir_id },
              is_display: true,
              is_deleted: false,
              $and: [{ _id: { $in: esResultIds } }]
            };
            limit = export_excel && total !== 0 ? total : constants.FILE_LIMITS_PER_PAGE;

            if (!(typeof sort === "string" && !_mongoose2.default.Types.ObjectId.isValid(sort))) {
              _context6.next = 42;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 42:
            if (!(typeof order === "string" && order !== "asc" && order !== "desc")) {
              _context6.next = 44;
              break;
            }

            throw new _AppError.ValidationError("sort is empty");

          case 44:
            _context6.next = 46;
            return createSortOption(sort, order);

          case 46:
            _sort = _context6.sent;
            _context6.next = 49;
            return _File2.default.searchFiles(conditions, 0, limit, _sort, _mongoose2.default.Types.ObjectId(sort));

          case 49:
            files = _context6.sent;

            files = files.map(function (file) {
              var route = file.dirs.filter(function (dir) {
                return dir.ancestor.is_display;
              }).map(function (dir) {
                return dir.ancestor.name;
              });

              file.dir_route = route.length > 0 ? route.reverse().join("/") : "";

              files = files.map(function (file) {

                file.actions = (0, _lodash.chain)(file.authorities).filter(function (auth) {
                  return auth.users._id.toString() === res.user._id.toString();
                }).map(function (auth) {
                  return auth.actions;
                }).flattenDeep().uniq();

                return file;
              });

              return file;
            });

            if (!export_excel) {
              _context6.next = 55;
              break;
            }

            return _context6.abrupt("return", files);

          case 55:
            res.json({
              status: { success: true, total: total },
              body: files
            });

          case 56:
            _context6.next = 71;
            break;

          case 58:
            _context6.prev = 58;
            _context6.t0 = _context6["catch"](0);
            errors = {};
            _context6.t1 = _context6.t0.message;
            _context6.next = _context6.t1 === "page is not number" ? 64 : _context6.t1 === "sort is empty" ? 66 : 68;
            break;

          case 64:
            errors.page = "pageが数字ではないためファイル一覧の取得に失敗しました";
            return _context6.abrupt("break", 69);

          case 66:
            errors.sort = "ソート条件が不正なためファイル一覧の取得に失敗しました";
            return _context6.abrupt("break", 69);

          case 68:
            errors.unknown = _context6.t0;

          case 69:

            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, message: "ファイル一覧の取得に失敗しました", errors: errors }
            });

          case 71:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 58]]);
  }));
};

var rename = exports.rename = function rename(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
    var file_id, changedFileName, file, changedFile, tenant_id, updatedFile, errors;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            file_id = req.params.file_id;
            changedFileName = req.body.name;

            if (!(file_id === null || file_id === undefined || file_id === "")) {
              _context7.next = 5;
              break;
            }

            throw "file_id is empty";

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context7.next = 7;
              break;
            }

            throw "file_id is invalid";

          case 7:
            if (!(changedFileName === null || changedFileName === undefined || changedFileName === "")) {
              _context7.next = 9;
              break;
            }

            throw "name is empty";

          case 9:
            if (!changedFileName.match(new RegExp(constants.ILLIGAL_CHARACTERS.join("|")))) {
              _context7.next = 11;
              break;
            }

            throw "name is invalid";

          case 11:
            _context7.next = 13;
            return _File2.default.findById(file_id);

          case 13:
            file = _context7.sent;

            if (!(file === null)) {
              _context7.next = 16;
              break;
            }

            throw "file is empty";

          case 16:
            file.name = changedFileName;
            _context7.next = 19;
            return file.save();

          case 19:
            changedFile = _context7.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context7.next = 23;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 23:
            updatedFile = _context7.sent;
            _context7.next = 26;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 26:

            res.json({
              status: { success: true },
              body: changedFile
            });

            _context7.next = 49;
            break;

          case 29:
            _context7.prev = 29;
            _context7.t0 = _context7["catch"](0);
            errors = {};
            _context7.t1 = _context7.t0;
            _context7.next = _context7.t1 === "file_id is empty" ? 35 : _context7.t1 === "file_id is invalid" ? 37 : _context7.t1 === "file is empty" ? 39 : _context7.t1 === "name is empty" ? 41 : _context7.t1 === "name is invalid" ? 43 : 45;
            break;

          case 35:
            errors.file_id = "file_id is empty";
            return _context7.abrupt("break", 47);

          case 37:
            errors.file_id = "ファイルIDが不正のためファイル名の変更に失敗しました";
            return _context7.abrupt("break", 47);

          case 39:
            errors.file_id = "指定されたファイルが存在しないためファイル名の変更に失敗しました";
            return _context7.abrupt("break", 47);

          case 41:
            errors.file_name = "ファイル名が空のためファイル名の変更に失敗しました";
            return _context7.abrupt("break", 47);

          case 43:
            errors.file_name = "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイル名の変更に失敗しました";
            return _context7.abrupt("break", 47);

          case 45:
            errors.unknown = _context7.t0;
            return _context7.abrupt("break", 47);

          case 47:
            _logger2.default.error(_context7.t0);
            res.status(400).json({
              status: {
                success: false,
                message: "ファイル名の変更に失敗しました",
                errors: errors
              }
            });

          case 49:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[0, 29]]);
  }));
};

var move = exports.move = function move(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
    var file_id, tenant_id, _ref4, trash_dir_id, dir_id, user, isPermittedFile, isPermittedDir, _ref5, _ref6, file, dir, changedFile, movedDirs, movedFiles, i, _updatedFile, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            file_id = req.params.file_id;
            tenant_id = res.user.tenant_id;
            _context8.next = 5;
            return _Tenant2.default.findOne(tenant_id);

          case 5:
            _ref4 = _context8.sent;
            trash_dir_id = _ref4.trash_dir_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context8.next = 9;
              break;
            }

            throw "file_id is empty";

          case 9:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context8.next = 11;
              break;
            }

            throw "file_id is invalid";

          case 11:
            dir_id = req.body.dir_id;

            if (!(dir_id === undefined || dir_id === null || dir_id === "")) {
              _context8.next = 14;
              break;
            }

            throw "dir_id is empty";

          case 14:
            if (_mongoose2.default.Types.ObjectId.isValid(dir_id)) {
              _context8.next = 16;
              break;
            }

            throw "dir_id is invalid";

          case 16:
            _context8.next = 18;
            return _User2.default.findById(res.user._id);

          case 18:
            user = _context8.sent;

            if (!(user === null)) {
              _context8.next = 21;
              break;
            }

            throw "user is empty";

          case 21:
            _context8.next = 23;
            return checkFilePermission(file_id, user._id, constants.PERMISSION_MOVE);

          case 23:
            isPermittedFile = _context8.sent;
            _context8.next = 26;
            return checkFilePermission(dir_id, user._id, constants.PERMISSION_UPLOAD);

          case 26:
            isPermittedDir = _context8.sent;

            if (isPermittedFile && isPermittedDir) {
              _context8.next = 29;
              break;
            }

            throw "permission denied";

          case 29:
            _context8.next = 31;
            return [_File2.default.findById(file_id), _File2.default.findById(dir_id)];

          case 31:
            _ref5 = _context8.sent;
            _ref6 = (0, _slicedToArray3.default)(_ref5, 2);
            file = _ref6[0];
            dir = _ref6[1];

            if (!(file === null)) {
              _context8.next = 37;
              break;
            }

            throw "file is empty";

          case 37:
            if (!(dir === null)) {
              _context8.next = 39;
              break;
            }

            throw "dir is empty";

          case 39:
            changedFile = void 0;

            if (!file.is_dir) {
              _context8.next = 65;
              break;
            }

            if (!(file._id.toString() === dir._id.toString())) {
              _context8.next = 43;
              break;
            }

            throw "target is the same as folder";

          case 43:
            _context8.next = 45;
            return (0, _dirs.moveDir)(file._id, dir._id, user, "移動");

          case 45:
            _context8.t0 = function (dir) {
              return dir._id;
            };

            movedDirs = _context8.sent.map(_context8.t0);
            _context8.next = 49;
            return _File2.default.find({
              $or: [{ _id: { $in: movedDirs } }, { dir_id: { $in: movedDirs } }]
            });

          case 49:
            movedFiles = _context8.sent;
            _context8.t1 = _regenerator2.default.keys(movedFiles);

          case 51:
            if ((_context8.t2 = _context8.t1()).done) {
              _context8.next = 63;
              break;
            }

            i = _context8.t2.value;

            movedFiles[i].is_trash = dir._id.toString() === trash_dir_id;
            _context8.next = 56;
            return movedFiles[i].save();

          case 56:
            _context8.next = 58;
            return _File2.default.searchFileOne({ _id: movedFiles[i]._id });

          case 58:
            _updatedFile = _context8.sent;
            _context8.next = 61;
            return _elasticsearchclient2.default.createIndex(tenant_id, [_updatedFile]);

          case 61:
            _context8.next = 51;
            break;

          case 63:
            _context8.next = 69;
            break;

          case 65:
            file.is_trash = dir._id.toString() === trash_dir_id;
            _context8.next = 68;
            return moveFile(file, dir._id, user, "移動");

          case 68:
            changedFile = _context8.sent;

          case 69:
            _context8.next = 71;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 71:
            updatedFile = _context8.sent;
            _context8.next = 74;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 74:

            res.json({
              status: { success: true },
              body: changedFile
            });
            _context8.next = 102;
            break;

          case 77:
            _context8.prev = 77;
            _context8.t3 = _context8["catch"](0);
            errors = {};
            _context8.t4 = _context8.t3;
            _context8.next = _context8.t4 === "file_id is empty" ? 83 : _context8.t4 === "file_id is invalid" ? 85 : _context8.t4 === "file is empty" ? 87 : _context8.t4 === "dir_id is empty" ? 89 : _context8.t4 === "dir_id is invalid" ? 91 : _context8.t4 === "dir is empty" ? 93 : _context8.t4 === "target is the same as folder" ? 95 : _context8.t4 === "permission denied" ? 97 : 99;
            break;

          case 83:
            errors.file_id = "";
            return _context8.abrupt("break", 101);

          case 85:
            errors.file_id = "ファイルIDが不正のためファイルの移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 87:
            errors.file_id = "指定されたファイルが存在しないためファイルの移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 89:
            errors.dir_id = "フォルダIDが空のためファイルの移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 91:
            errors.dir_id = "フォルダIDが不正のためファイルの移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 93:
            errors.dir_id = "指定されたフォルダが存在しないためファイルの移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 95:
            errors.dir_id = "移動対象のフォルダと指定されたフォルダが同じため移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 97:
            errors.file_id = "指定されたファイルを移動する権限がないため移動に失敗しました";
            return _context8.abrupt("break", 101);

          case 99:
            errors.unknown = _context8.t3;
            return _context8.abrupt("break", 101);

          case 101:

            res.status(400).json({
              status: {
                success: false,
                message: "ファイルの移動に失敗しました",
                errors: errors
              }
            });

          case 102:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this, [[0, 77]]);
  }));
};

var upload = exports.upload = function upload(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
    var myFiles, dir_id, tenant_id, dir, user, isPermitted, files, metainfos, tags, role_files, users, groups, fileModels, swift, zipFiles, i, _zipFiles$i, file, model, regex, matches, data, tenant_name, role, authorityFiles, fileMetaInfos, changedFiles, _i, saveFileModel, j, saveFileMetaInfo, _j, saveAuthorityFile, returnfiles, changedFileIds, sortOption, indexingFile, _errors, errors;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            myFiles = req.body.files;
            dir_id = req.body.dir_id;
            tenant_id = res.user.tenant_id.toString();

            if (!(myFiles === null || myFiles === undefined || myFiles === "" || myFiles.length === 0)) {
              _context9.next = 6;
              break;
            }

            throw "files is empty";

          case 6:

            if (dir_id === null || dir_id === undefined || dir_id === "" || dir_id === "undefined") {

              dir_id = res.user.tenant.home_dir_id; // デフォルトはテナントのホーム
            }

            _context9.next = 9;
            return _File2.default.findById(dir_id);

          case 9:
            dir = _context9.sent;

            if (!(dir === null)) {
              _context9.next = 12;
              break;
            }

            throw "dir is not found";

          case 12:
            _context9.next = 14;
            return _User2.default.findById(res.user._id);

          case 14:
            user = _context9.sent;

            if (!(user === null)) {
              _context9.next = 17;
              break;
            }

            throw "user is not found";

          case 17:
            _context9.next = 19;
            return checkFilePermission(dir_id, user._id, constants.PERMISSION_UPLOAD);

          case 19:
            isPermitted = _context9.sent;

            if (!(isPermitted === false)) {
              _context9.next = 22;
              break;
            }

            throw "permission denied";

          case 22:

            // ファイルの基本情報
            // Modelで定義されていないプロパティを使いたいので
            // オブジェクトで作成し、後でModelObjectに一括変換する
            files = myFiles.map(function (_file) {
              var file = {
                hasError: false, // エラーフラグ
                errors: {} // エラー情報
              };

              if (_file.name === null || _file.name === undefined || _file.name === "" || _file.name === "undefined") {
                file.hasError = true;
                file.errors = { name: "ファイル名が空のためファイルのアップロードに失敗しました" };
                return file;
              }

              if (_file.name.match(new RegExp(constants.ILLIGAL_CHARACTERS.join("|")))) {
                file.hasError = true;
                file.errors = { name: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました" };
                return file;
              }

              if (_file.mime_type === null || _file.mime_type === undefined || _file.mime_type === "" || _file.mime_type === "undefined") {
                file.hasError = true;
                file.errors = { mime_type: "mime_typeが空のためファイルのアップロードに失敗しました" };
                return file;
              }

              if (_file.size === null || _file.size === undefined || _file.size === "" || _file.size === "undefined") {
                file.hasError = true;
                file.errors = { size: "size is empty" };
                return file;
              }

              if (_file.base64 === null || _file.base64 === undefined || _file.base64 === "" || _file.base64 === "undefined") {
                file.hasError = true;
                file.errors = { base64: "base64が空のためファイルのアップロードに失敗しました" };
                return file;
              }

              if (_file.base64.match(/;base64,(.*)$/) === null) {
                file.hasError = true;
                file.errors = { base64: "base64が不正のためファイルのアップロードに失敗しました" };
                return file;
              }

              if (_file.checksum === null || _file.checksum === undefined || _file.checksum === "") {
                file.hasError = true;
                file.errors = { checksum: "checksumが空のためファイルのアップロードに失敗しました" };
                return file;
              }

              file.name = _file.name;
              file.mime_type = _file.mime_type;
              file.size = _file.size;
              file.modified = (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss");
              file.is_dir = false;
              file.dir_id = dir_id;
              file.is_display = true;
              file.is_star = false;
              file.tags = _file.tags;
              file.is_crypted = constants.USE_CRYPTO;
              file.meta_infos = _file.meta_infos;
              file.base64 = _file.base64;
              file.checksum = _file.checksum;
              file.authorities = _file.authorities;

              return file;
            });

            // checksumを比較

            files = files.map(function (file) {
              if (file.hasError) return file;

              var hexdigest = _crypto2.default.createHash("md5").update(new Buffer(file.base64)).digest("hex");

              if (file.checksum === hexdigest) {
                return file;
              } else {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    checksum: "checksumが不正のためファイルのアップロードに失敗しました"
                  }
                });
              }
            });

            // postされたメタ情報の_idがマスタに存在するかのチェック用
            _context9.next = 26;
            return _MetaInfo2.default.find({ tenant_id: res.user.tenant_id });

          case 26:
            metainfos = _context9.sent;


            // メタ情報のチェック
            files = files.map(function (file) {
              if (file.hasError) return file;

              if (file.meta_infos === undefined || file.meta_infos.length === 0) return file;

              // 値の空チェック
              var valueCheck = file.meta_infos.filter(function (meta) {
                return meta.value === undefined || meta.value === null || meta.value === "" || meta.value === "undefined";
              });

              if (valueCheck.length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    meta_info_value: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
                  }
                });
              }

              // idのnullチェック
              var idIsEmpty = file.meta_infos.filter(function (meta) {
                return meta._id === undefined || meta._id === null || meta._id === "" || meta._id === "undefined";
              });

              if (idIsEmpty.length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    meta_info_id: "メタ情報IDが空のためファイルのアップロードに失敗しました"
                  }
                });
              }

              var idIsInvalid = file.meta_infos.filter(function (meta) {
                return !_mongoose2.default.Types.ObjectId.isValid(meta._id);
              });

              if (idIsInvalid.length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    meta_info_id: "メタ情報IDが不正のためファイルのアップロードに失敗しました"
                  }
                });
              }

              // メタ情報idが存在するかのチェック
              var intersec = (0, _lodash.intersection)(file.meta_infos.map(function (meta) {
                return meta._id;
              }), metainfos.map(function (meta) {
                return meta._id.toString();
              }));

              if (file.meta_infos.length !== intersec.length) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    meta_info_id: "指定されたメタ情報が存在しないためファイルのアップロードに失敗しました"
                  }
                });
              }

              // 日付型チェック
              var date_is_invalid = file.meta_infos.filter(function (meta) {
                var _meta = metainfos.filter(function (m) {
                  return m._id.toString() === meta._id;
                })[0];

                if (_meta.value_type === "Date") {
                  return !(0, _moment2.default)(meta.value).isValid();
                } else {
                  return false;
                }
              });

              if (date_is_invalid.length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    meta_info_value: "指定されたメタ情報の値が日付型ではないためファイルのアップロードに失敗しました"
                  }
                });
              }

              return file;
            });

            // タグがマスタに存在するかのチェック
            _context9.next = 30;
            return _Tag2.default.find({ tenant_id: res.user.tenant_id });

          case 30:
            _context9.t0 = function (tag) {
              return tag._id.toString();
            };

            tags = _context9.sent.map(_context9.t0);


            files = files.map(function (file) {
              if (file.hasError) return file;
              if (file.tags === undefined || file.tags === null || file.tags === "" || file.tags.length === 0) {
                return file;
              }

              var tagIsEmpty = file.tags.filter(function (tag) {
                return tag === undefined || tag === null || tag === "";
              });

              if (tagIsEmpty.length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    tag_id: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
                  }
                });
              }

              if ((0, _lodash.uniq)(file.tags).length === (0, _lodash.intersection)(file.tags, tags).length) {
                // stringからBSONに変換
                file.tags = file.tags.map(function (tag) {
                  return _mongoose2.default.Types.ObjectId(tag);
                });
                return file;
              } else {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    tag_id: "タグIDが不正のためファイルのアップロードに失敗しました"
                  }
                });
              }
            });

            // ロール、ユーザ、グループがマスタに存在するかのチェック
            _context9.next = 35;
            return _RoleFile2.default.find({ tenant_id: res.user.tenant_id });

          case 35:
            _context9.t1 = function (role) {
              return role._id.toString();
            };

            role_files = _context9.sent.map(_context9.t1);
            _context9.next = 39;
            return _User2.default.find({ tenant_id: res.user.tenant_id });

          case 39:
            _context9.t2 = function (user) {
              return user._id.toString();
            };

            users = _context9.sent.map(_context9.t2);
            _context9.next = 43;
            return _Group2.default.find({ tenant_id: res.user.tenant_id });

          case 43:
            _context9.t3 = function (group) {
              return group._id.toString();
            };

            groups = _context9.sent.map(_context9.t3);


            files = files.map(function (file) {
              if (file.hasError) return file;

              if (file.authorities === undefined || file.authorities === null || file.authorities === "" || file.authorities.length === 0) {

                file.authorities = [];
                return file;
              }

              var roleIds = file.authorities.map(function (auth) {
                return auth.role_files;
              });

              if (roleIds.filter(function (id) {
                return id === undefined || id === null || id === "";
              }).length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_file_id: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
                  }
                });
              }

              if (roleIds.filter(function (id) {
                return !_mongoose2.default.Types.ObjectId.isValid(id);
              }).length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_file_id: "指定されたロールIDが不正のためファイルのアップロードに失敗しました"
                  }
                });
              }

              if ((0, _lodash.uniq)(roleIds).length !== (0, _lodash.intersection)(roleIds, role_files).length) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_file_id: "指定されたロールが存在しないためファイルのアップロードに失敗しました"
                  }
                });
              }

              var userIds = file.authorities.map(function (auth) {
                return auth.users;
              });

              if (userIds.filter(function (id) {
                return id === undefined || id === null || id === "";
              }).length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_user_id: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
                  }
                });
              }

              if (userIds.filter(function (id) {
                return !_mongoose2.default.Types.ObjectId.isValid(id);
              }).length > 0) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_user_id: "指定されたユーザIDが不正のためファイルのアップロードに失敗しました"
                  }
                });
              }

              if (userIds.length !== (0, _lodash.intersection)(userIds, users).length) {
                return (0, _extends3.default)({}, file, {
                  hasError: true,
                  errors: {
                    role_user_id: "指定されたユーザが存在しないためファイルのアップロードに失敗しました"
                  }
                });
              }

              return file;
            });

            // 履歴
            files = files.map(function (file) {
              if (file.hasError) return file;

              var histories = [{
                modified: (0, _moment2.default)().format("YYYY-MM-DD hh:mm:ss"),
                user: user,
                action: "新規作成",
                body: ""
              }];

              file.histories = histories;
              return file;
            });

            // ファイルオブジェクト作成
            fileModels = files.map(function (file) {
              return file.hasError ? false : new _File2.default(file);
            });

            // swift

            swift = new _Swift.Swift();
            zipFiles = (0, _lodash.zipWith)(files, fileModels, function (file, model) {
              return { file: file, model: model };
            });
            i = 0;

          case 51:
            if (!(i < zipFiles.length)) {
              _context9.next = 72;
              break;
            }

            _zipFiles$i = zipFiles[i], file = _zipFiles$i.file, model = _zipFiles$i.model;

            if (!file.hasError) {
              _context9.next = 55;
              break;
            }

            return _context9.abrupt("continue", 69);

          case 55:
            regex = /;base64,(.*)$/;
            matches = file.base64.match(regex);
            data = matches[1];
            tenant_name = res.user.tenant.name;
            _context9.prev = 59;
            _context9.next = 62;
            return swift.upload(tenant_name, new Buffer(data, 'base64'), model._id.toString());

          case 62:
            _context9.next = 69;
            break;

          case 64:
            _context9.prev = 64;
            _context9.t4 = _context9["catch"](59);

            _logger2.default.info(_context9.t4);
            fileModels[i] = false;
            files[i] = (0, _extends3.default)({}, files[i], {
              hasError: true,
              errors: {
                data: "ファイル本体の保存に失敗しました"
              }
            });

          case 69:
            i++;
            _context9.next = 51;
            break;

          case 72:
            _context9.next = 74;
            return _RoleFile2.default.findOne({
              tenant_id: _mongoose2.default.Types.ObjectId(res.user.tenant_id),
              name: "フルコントロール" // @fixme
            });

          case 74:
            role = _context9.sent;
            authorityFiles = (0, _lodash.zipWith)(files, fileModels, function (file, model) {
              if (file.hasError) return false;

              var authorityFile = new _AuthorityFile2.default();
              authorityFile.users = user._id;
              authorityFile.files = model;
              authorityFile.role_files = role._id;

              if (file.authorities.length === 0) return [authorityFile];

              var authorityFiles = file.authorities.map(function (auth) {
                var authorityFile = new _AuthorityFile2.default();
                authorityFile.users = _mongoose2.default.Types.ObjectId(auth.users);
                authorityFile.files = model;
                authorityFile.role_files = _mongoose2.default.Types.ObjectId(auth.role_files);
                return authorityFile;
              });

              return authorityFiles.concat(authorityFile);
            });

            // メタ情報

            fileMetaInfos = (0, _lodash.zipWith)(files, fileModels, function (file, model) {
              if (file.hasError) return false;
              if (file.meta_infos === undefined || file.meta_infos === null || file.meta_infos.length === 0) return false;

              return file.meta_infos.map(function (meta) {
                return new _FileMetaInfo2.default({
                  file_id: model._id,
                  meta_info_id: meta._id,
                  value: meta.value
                });
              });
            });

            // mongoへの保存開始

            changedFiles = [];
            _i = 0;

          case 79:
            if (!(_i < fileModels.length)) {
              _context9.next = 113;
              break;
            }

            if (fileModels[_i]) {
              _context9.next = 82;
              break;
            }

            return _context9.abrupt("continue", 110);

          case 82:
            _context9.next = 84;
            return fileModels[_i].save();

          case 84:
            saveFileModel = _context9.sent;

            changedFiles.push(saveFileModel);

            if (saveFileModel) {
              _context9.next = 89;
              break;
            }

            files[_i] = (0, _extends3.default)({}, files[_i], {
              hasError: true,
              errors: {
                body: "基本情報の書き込みに失敗しました"
              }
            });
            return _context9.abrupt("continue", 110);

          case 89:
            if (!(fileMetaInfos[_i].length > 0)) {
              _context9.next = 100;
              break;
            }

            j = 0;

          case 91:
            if (!(j < fileMetaInfos[_i].length)) {
              _context9.next = 100;
              break;
            }

            if (!fileMetaInfos[_i][j]) {
              _context9.next = 97;
              break;
            }

            _context9.next = 95;
            return fileMetaInfos[_i][j].save();

          case 95:
            saveFileMetaInfo = _context9.sent;

            if (!saveFileMetaInfo) {

              files[_i] = (0, _extends3.default)({}, files[_i], {
                hasError: true,
                errors: {
                  meta_infos: "メタ情報の書き込みに失敗しました"
                }
              });
            }

          case 97:
            j++;
            _context9.next = 91;
            break;

          case 100:
            if (!(authorityFiles[_i].length > 0)) {
              _context9.next = 110;
              break;
            }

            _j = 0;

          case 102:
            if (!(_j < authorityFiles[_i].length)) {
              _context9.next = 110;
              break;
            }

            _context9.next = 105;
            return authorityFiles[_i][_j].save();

          case 105:
            saveAuthorityFile = _context9.sent;

            if (!saveAuthorityFile) {
              files[_i] = (0, _extends3.default)({}, files[_i], {
                hasError: true,
                errors: {
                  authority_files: "権限の書き込みに失敗しました"
                }
              });
            }

          case 107:
            _j++;
            _context9.next = 102;
            break;

          case 110:
            _i++;
            _context9.next = 79;
            break;

          case 113:

            // elasticsearchへ登録
            returnfiles = void 0;

            if (!(changedFiles.length > 0)) {
              _context9.next = 125;
              break;
            }

            changedFileIds = changedFiles.map(function (file) {
              return file._id;
            });
            _context9.next = 118;
            return createSortOption();

          case 118:
            sortOption = _context9.sent;
            _context9.next = 121;
            return _File2.default.searchFiles({ _id: { $in: changedFileIds } }, 0, changedFileIds.length, sortOption);

          case 121:
            indexingFile = _context9.sent;
            _context9.next = 124;
            return _elasticsearchclient2.default.createIndex(tenant_id, indexingFile);

          case 124:

            returnfiles = indexingFile.map(function (file) {
              file.actions = extractFileActions(file.authorities, res.user);
              return file;
            });

          case 125:

            // validationErrors
            if (files.filter(function (f) {
              return f.hasError;
            }).length > 0) {
              _errors = files.map(function (f) {
                if (f.hasError === false) return {};
                return f.errors;
              });


              _logger2.default.error(_errors);
              res.status(400).json({
                status: {
                  success: false,
                  message: "ファイルのアップロードに失敗しました",
                  errors: _errors
                }
              });
            } else {
              res.json({
                status: { success: true },
                body: returnfiles
              });
            }
            _context9.next = 144;
            break;

          case 128:
            _context9.prev = 128;
            _context9.t5 = _context9["catch"](0);
            errors = {};

            _logger2.default.error(_context9.t5);

            _context9.t6 = _context9.t5;
            _context9.next = _context9.t6 === "files is empty" ? 135 : _context9.t6 === "dir_id is empty" ? 137 : _context9.t6 === "permission denied" ? 139 : 141;
            break;

          case 135:
            errors.files = "アップロード対象のファイルが空のためファイルのアップロードに失敗しました";
            return _context9.abrupt("break", 143);

          case 137:
            errors.dir_id = "フォルダIDが空のためファイルのアップロードに失敗しました";
            return _context9.abrupt("break", 143);

          case 139:
            errors.dir_id = "フォルダにアップロード権限が無いためファイルのアップロードに失敗しました";
            return _context9.abrupt("break", 143);

          case 141:
            errors.unknown = _context9.t5;
            return _context9.abrupt("break", 143);

          case 143:
            res.status(400).json({
              status: {
                success: false,
                message: "ファイルのアップロードに失敗しました",
                errors: errors
              }
            });

          case 144:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this, [[0, 128], [59, 64]]);
  }));
};

var addTag = exports.addTag = function addTag(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
    var file_id, tag_id, _ref7, _ref8, file, tag, changedFile, tags, tenant_id, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            file_id = req.params.file_id;
            tag_id = req.body._id;

            if (!(file_id === null || file_id === undefined || file_id === "")) {
              _context10.next = 5;
              break;
            }

            throw "file_id is empty";

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context10.next = 7;
              break;
            }

            throw "file_id is invalid";

          case 7:
            if (!(tag_id === null || tag_id === undefined || tag_id === "")) {
              _context10.next = 9;
              break;
            }

            throw "tag_id is empty";

          case 9:
            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context10.next = 11;
              break;
            }

            throw "tag_id is invalid";

          case 11:
            _context10.next = 13;
            return [_File2.default.findById(file_id), _Tag2.default.findById(tag_id)];

          case 13:
            _ref7 = _context10.sent;
            _ref8 = (0, _slicedToArray3.default)(_ref7, 2);
            file = _ref8[0];
            tag = _ref8[1];

            if (!(file === null)) {
              _context10.next = 19;
              break;
            }

            throw "file is empty";

          case 19:
            if (!(tag === null)) {
              _context10.next = 21;
              break;
            }

            throw "tag is empty";

          case 21:

            file.tags = [].concat((0, _toConsumableArray3.default)(file.tags), [tag._id]);
            _context10.next = 24;
            return file.save();

          case 24:
            changedFile = _context10.sent;
            _context10.next = 27;
            return _Tag2.default.find({ _id: { $in: file.tags } });

          case 27:
            tags = _context10.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context10.next = 31;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 31:
            updatedFile = _context10.sent;
            _context10.next = 34;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 34:

            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, file.toObject(), { tags: tags })
            });
            _context10.next = 58;
            break;

          case 37:
            _context10.prev = 37;
            _context10.t0 = _context10["catch"](0);
            errors = {};
            _context10.t1 = _context10.t0;
            _context10.next = _context10.t1 === "file_id is empty" ? 43 : _context10.t1 === "file_id is invalid" ? 45 : _context10.t1 === "tag_id is empty" ? 47 : _context10.t1 === "tag_id is invalid" ? 49 : _context10.t1 === "file is empty" ? 51 : _context10.t1 === "tag is empty" ? 53 : 55;
            break;

          case 43:
            errors.file_id = _context10.t0;
            return _context10.abrupt("break", 57);

          case 45:
            errors.file_id = "ファイルIDが不正のためタグの追加に失敗しました";
            return _context10.abrupt("break", 57);

          case 47:
            errors.tag_id = _context10.t0;
            return _context10.abrupt("break", 57);

          case 49:
            errors.tag_id = "タグIDが不正のためタグの追加に失敗しました";
            return _context10.abrupt("break", 57);

          case 51:
            errors.file_id = "指定されたファイルが存在しないためタグの追加に失敗しました";
            return _context10.abrupt("break", 57);

          case 53:
            errors.tag_id = "指定されたタグが存在しないためタグの追加に失敗しました";
            return _context10.abrupt("break", 57);

          case 55:
            errors.unknown = _context10.t0;
            return _context10.abrupt("break", 57);

          case 57:

            res.status(400).json({
              status: {
                success: false,
                message: "タグの追加に失敗しました",
                errors: errors
              }
            });

          case 58:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this, [[0, 37]]);
  }));
};

var removeTag = exports.removeTag = function removeTag(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
    var _req$params, file_id, tag_id, _ref9, _ref10, file, tag, changedFile, tags, tenant_id, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _req$params = req.params, file_id = _req$params.file_id, tag_id = _req$params.tag_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context11.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context11.next = 6;
              break;
            }

            throw "file_id is invalid";

          case 6:
            if (!(tag_id === undefined || tag_id === null || tag_id === "")) {
              _context11.next = 8;
              break;
            }

            throw "tag_id is empty";

          case 8:
            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context11.next = 10;
              break;
            }

            throw "tag_id is invalid";

          case 10:
            _context11.next = 12;
            return [_File2.default.findById(file_id), _Tag2.default.findById(tag_id)];

          case 12:
            _ref9 = _context11.sent;
            _ref10 = (0, _slicedToArray3.default)(_ref9, 2);
            file = _ref10[0];
            tag = _ref10[1];

            if (!(file === null)) {
              _context11.next = 18;
              break;
            }

            throw "file is empty";

          case 18:
            if (!(tag === null)) {
              _context11.next = 20;
              break;
            }

            throw "tag is empty";

          case 20:

            file.tags = file.tags.filter(function (file_tag) {
              return file_tag.toString() !== tag.id;
            });
            _context11.next = 23;
            return file.save();

          case 23:
            changedFile = _context11.sent;
            _context11.next = 26;
            return _Tag2.default.find({ _id: { $in: file.tags } });

          case 26:
            tags = _context11.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context11.next = 30;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 30:
            updatedFile = _context11.sent;
            _context11.next = 33;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 33:

            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, file.toObject(), { tags: tags })
            });
            _context11.next = 57;
            break;

          case 36:
            _context11.prev = 36;
            _context11.t0 = _context11["catch"](0);
            errors = {};
            _context11.t1 = _context11.t0;
            _context11.next = _context11.t1 === "file_id is empty" ? 42 : _context11.t1 === "file_id is invalid" ? 44 : _context11.t1 === "tag_id is empty" ? 46 : _context11.t1 === "file is empty" ? 48 : _context11.t1 === "tag is empty" ? 50 : _context11.t1 === "tag_id is invalid" ? 52 : 54;
            break;

          case 42:
            errors.file_id = _context11.t0;
            return _context11.abrupt("break", 56);

          case 44:
            errors.file_id = "ファイルIDが不正のためタグの削除に失敗しました";
            return _context11.abrupt("break", 56);

          case 46:
            errors.tag_id = _context11.t0;
            return _context11.abrupt("break", 56);

          case 48:
            errors.file_id = "指定されたファイルが存在しないためタグの削除に失敗しました";
            return _context11.abrupt("break", 56);

          case 50:
            errors.tag_id = "指定されたタグが存在しないためタグの削除に失敗しました";
            return _context11.abrupt("break", 56);

          case 52:
            errors.tag_id = "タグIDが不正のためタグの削除に失敗しました";
            return _context11.abrupt("break", 56);

          case 54:
            errors.unknown = _context11.t0;
            return _context11.abrupt("break", 56);

          case 56:

            res.status(400).json({
              status: {
                success: false,
                message: "タグの削除に失敗しました",
                errors: errors
              }
            });

          case 57:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this, [[0, 36]]);
  }));
};

var addMeta = exports.addMeta = function addMeta(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
    var file_id, tenant_id, _req$body2, meta, value, _ref11, _ref12, file, metaInfo, registMetaInfo, changedMeta, _addMeta, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            file_id = req.params.file_id;
            tenant_id = res.user.tenant_id;

            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context12.next = 5;
              break;
            }

            throw "file_id is invalid";

          case 5:
            _req$body2 = req.body, meta = _req$body2.meta, value = _req$body2.value;

            if (!(meta._id === undefined || meta._id === null || meta._id === "")) {
              _context12.next = 8;
              break;
            }

            throw "metainfo_id is empty";

          case 8:
            if (_mongoose2.default.Types.ObjectId.isValid(meta._id)) {
              _context12.next = 10;
              break;
            }

            throw "metainfo_id is invalid";

          case 10:
            if (!(value === undefined || value === null || value === "")) {
              _context12.next = 12;
              break;
            }

            throw "metainfo value is empty";

          case 12:
            _context12.next = 14;
            return [_File2.default.findById(file_id), _MetaInfo2.default.findById(meta._id)];

          case 14:
            _ref11 = _context12.sent;
            _ref12 = (0, _slicedToArray3.default)(_ref11, 2);
            file = _ref12[0];
            metaInfo = _ref12[1];

            if (!(file === null)) {
              _context12.next = 20;
              break;
            }

            throw "file is empty";

          case 20:
            if (!(metaInfo === null)) {
              _context12.next = 22;
              break;
            }

            throw "metainfo is empty";

          case 22:
            _context12.next = 24;
            return _FileMetaInfo2.default.findOne({
              file_id: file_id,
              meta_info_id: meta._id
            });

          case 24:
            registMetaInfo = _context12.sent;
            changedMeta = void 0;

            // 既に登録されている場合

            if (!registMetaInfo) {
              _context12.next = 33;
              break;
            }

            registMetaInfo.value = value;
            _context12.next = 30;
            return registMetaInfo.save();

          case 30:
            changedMeta = _context12.sent;
            _context12.next = 37;
            break;

          case 33:
            _addMeta = new _FileMetaInfo2.default({
              file_id: file_id, meta_info_id: metaInfo._id, value: value
            });
            _context12.next = 36;
            return _addMeta.save();

          case 36:
            changedMeta = _context12.sent;

          case 37:
            _context12.next = 39;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 39:
            updatedFile = _context12.sent;
            _context12.next = 42;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 42:

            res.json({
              status: { success: true },
              body: changedMeta
            });

            _context12.next = 66;
            break;

          case 45:
            _context12.prev = 45;
            _context12.t0 = _context12["catch"](0);
            errors = {};
            _context12.t1 = _context12.t0;
            _context12.next = _context12.t1 === "file_id is invalid" ? 51 : _context12.t1 === "file is empty" ? 53 : _context12.t1 === "metainfo_id is empty" ? 55 : _context12.t1 === "metainfo_id is invalid" ? 57 : _context12.t1 === "metainfo is empty" ? 59 : _context12.t1 === "metainfo value is empty" ? 61 : 63;
            break;

          case 51:
            errors.file_id = "ファイルIDが不正のためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 53:
            errors.file_id = "指定されたファイルが存在しないためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 55:
            errors.metainfo_id = "メタ情報IDが空のためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 57:
            errors.metainfo_id = "メタ情報IDが不正のためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 59:
            errors.metainfo_id = "指定されたメタ情報が存在しないためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 61:
            errors.metainfo_value = "メタ情報の値が空のためメタ情報の追加に失敗しました";
            return _context12.abrupt("break", 65);

          case 63:
            errors.unknown = _context12.t0;
            return _context12.abrupt("break", 65);

          case 65:

            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の追加に失敗しました",
                errors: errors
              }
            });

          case 66:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this, [[0, 45]]);
  }));
};

var removeMeta = exports.removeMeta = function removeMeta(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
    var _req$params2, file_id, meta_id, _ref13, _ref14, file, metaInfo, _removeMeta, tenant_id, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.prev = 0;
            _req$params2 = req.params, file_id = _req$params2.file_id, meta_id = _req$params2.meta_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context13.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context13.next = 6;
              break;
            }

            throw "file_id is invalid";

          case 6:
            if (!(meta_id === undefined || meta_id === null || meta_id === "")) {
              _context13.next = 8;
              break;
            }

            throw "meta_id is empty";

          case 8:
            if (_mongoose2.default.Types.ObjectId.isValid(meta_id)) {
              _context13.next = 10;
              break;
            }

            throw "meta_id is invalid";

          case 10:
            _context13.next = 12;
            return [_File2.default.findById(file_id), _MetaInfo2.default.findById(meta_id)];

          case 12:
            _ref13 = _context13.sent;
            _ref14 = (0, _slicedToArray3.default)(_ref13, 2);
            file = _ref14[0];
            metaInfo = _ref14[1];

            if (!(file === null)) {
              _context13.next = 18;
              break;
            }

            throw "file is empty";

          case 18:
            if (!(metaInfo === null)) {
              _context13.next = 20;
              break;
            }

            throw "metaInfo is empty";

          case 20:
            _context13.next = 22;
            return _FileMetaInfo2.default.findOne({
              file_id: _mongoose2.default.Types.ObjectId(file_id),
              meta_info_id: _mongoose2.default.Types.ObjectId(meta_id)
            });

          case 22:
            _removeMeta = _context13.sent;

            if (!_removeMeta) {
              _context13.next = 27;
              break;
            }

            _removeMeta.remove();
            _context13.next = 28;
            break;

          case 27:
            throw "meta_id is not registered";

          case 28:

            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context13.next = 31;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 31:
            updatedFile = _context13.sent;
            _context13.next = 34;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 34:

            res.json({
              status: { success: true },
              body: _removeMeta
            });
            _context13.next = 60;
            break;

          case 37:
            _context13.prev = 37;
            _context13.t0 = _context13["catch"](0);
            errors = {};
            _context13.t1 = _context13.t0;
            _context13.next = _context13.t1 === "file_id is empty" ? 43 : _context13.t1 === "file_id is invalid" ? 45 : _context13.t1 === "file is empty" ? 47 : _context13.t1 === "meta_id is empty" ? 49 : _context13.t1 === "meta_id is invalid" ? 51 : _context13.t1 === "metaInfo is empty" ? 53 : _context13.t1 === "meta_id is not registered" ? 55 : 57;
            break;

          case 43:
            errors.file_id = "ファイルIDが空のためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 45:
            errors.file_id = "ファイルIDが不正のためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 47:
            errors.file_id = "指定されたファイルが存在しないためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 49:
            errors.meta_id = _context13.t0;
            return _context13.abrupt("break", 59);

          case 51:
            errors.meta_id = "メタ情報IDが不正のためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 53:
            errors.meta_id = "指定されたメタ情報が存在しないためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 55:
            errors.meta_id = "指定されたメタ情報IDがファイルに存在しないためメタ情報の削除に失敗しました";
            return _context13.abrupt("break", 59);

          case 57:
            errors.unknown = _context13.t0;
            return _context13.abrupt("break", 59);

          case 59:

            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の削除に失敗しました",
                errors: errors
              }
            });

          case 60:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this, [[0, 37]]);
  }));
};

var toggleStar = exports.toggleStar = function toggleStar(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
    var file_id, file, changedFile, tenant_id, updatedFile, errors;
    return _regenerator2.default.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.prev = 0;
            file_id = req.params.file_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context14.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context14.next = 6;
              break;
            }

            throw "file_id is invalid";

          case 6:
            _context14.next = 8;
            return _File2.default.findById(file_id);

          case 8:
            file = _context14.sent;

            if (!(file === null)) {
              _context14.next = 11;
              break;
            }

            throw "file is empty";

          case 11:

            file.is_star = !file.is_star;
            _context14.next = 14;
            return file.save();

          case 14:
            changedFile = _context14.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context14.next = 18;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 18:
            updatedFile = _context14.sent;
            _context14.next = 21;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 21:

            res.json({
              status: { success: true },
              body: changedFile
            });

            _context14.next = 39;
            break;

          case 24:
            _context14.prev = 24;
            _context14.t0 = _context14["catch"](0);
            errors = {};
            _context14.t1 = _context14.t0;
            _context14.next = _context14.t1 === "file_id is empty" ? 30 : _context14.t1 === "file_id is invalid" ? 32 : _context14.t1 === "file is empty" ? 34 : 36;
            break;

          case 30:
            errors.file_id = "ファイルIDが空のためファイルのお気に入りの設定に失敗しました";
            return _context14.abrupt("break", 38);

          case 32:
            errors.file_id = "ファイルIDが不正のためファイルのお気に入りの設定に失敗しました";
            return _context14.abrupt("break", 38);

          case 34:
            errors.file_id = "指定されたファイルが存在しないためファイルのお気に入りの設定に失敗しました";
            return _context14.abrupt("break", 38);

          case 36:
            errors.unknown = _context14.t0;
            return _context14.abrupt("break", 38);

          case 38:

            res.status(400).json({
              status: {
                success: false,
                message: "ファイルのお気に入りの設定に失敗しました",
                errors: errors
              }
            });

          case 39:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this, [[0, 24]]);
  }));
};

var addAuthority = exports.addAuthority = function addAuthority(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
    var file_id, _req$body3, user, role, tenant_id, file, _role, authority, _user, _group, duplicated, createdAuthority, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.prev = 0;
            file_id = req.params.file_id;
            _req$body3 = req.body, user = _req$body3.user, role = _req$body3.role;
            tenant_id = res.user.tenant_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context15.next = 6;
              break;
            }

            throw "file_id is empty";

          case 6:
            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context15.next = 8;
              break;
            }

            throw "file_id is invalid";

          case 8:
            _context15.next = 10;
            return _File2.default.findById(file_id);

          case 10:
            file = _context15.sent;

            if (!(file === null)) {
              _context15.next = 13;
              break;
            }

            throw "file is empty";

          case 13:
            _context15.next = 15;
            return _RoleFile2.default.findById(role._id);

          case 15:
            _role = _context15.sent;

            if (!(_role === null)) {
              _context15.next = 18;
              break;
            }

            throw "role is empty";

          case 18:
            if (_mongoose2.default.Types.ObjectId.isValid(user._id)) {
              _context15.next = 20;
              break;
            }

            throw "user_id is invalid";

          case 20:
            if (!(user.type === undefined || user.type === null || user.type === "")) {
              _context15.next = 22;
              break;
            }

            throw new _AppError.ValidationError("user.type is empty");

          case 22:
            authority = new _AuthorityFile2.default();

            if (!(user.type === 'user')) {
              _context15.next = 34;
              break;
            }

            _context15.next = 26;
            return _User2.default.findById(user._id);

          case 26:
            _user = _context15.sent;

            if (!(_user === null)) {
              _context15.next = 29;
              break;
            }

            throw "user is empty";

          case 29:

            authority.files = file;
            authority.users = _user;
            authority.role_files = _role;
            _context15.next = 42;
            break;

          case 34:
            _context15.next = 36;
            return _Group2.default.findById(user._id);

          case 36:
            _group = _context15.sent;

            if (!(_group === null)) {
              _context15.next = 39;
              break;
            }

            throw new _AppError.RecordNotFoundException("group is empty");

          case 39:

            authority.files = file;
            authority.groups = _group;
            authority.role_files = _role;

          case 42:
            _context15.next = 44;
            return _AuthorityFile2.default.findOne({
              files: authority.files,
              users: authority.users,
              role_files: authority.role_files
            });

          case 44:
            duplicated = _context15.sent;

            if (!(duplicated !== null)) {
              _context15.next = 47;
              break;
            }

            throw "role set is duplicate";

          case 47:
            _context15.next = 49;
            return authority.save();

          case 49:
            createdAuthority = _context15.sent;
            _context15.next = 52;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 52:
            updatedFile = _context15.sent;
            _context15.next = 55;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 55:

            res.json({
              status: { success: true },
              body: createdAuthority
            });

            _context15.next = 86;
            break;

          case 58:
            _context15.prev = 58;
            _context15.t0 = _context15["catch"](0);
            errors = {};
            _context15.t1 = _context15.t0;
            _context15.next = _context15.t1 === "file_id is empty" ? 64 : _context15.t1 === "file_id is invalid" ? 66 : _context15.t1 === "file is empty" ? 68 : _context15.t1 === "user is empty" ? 70 : _context15.t1 === "user_id is invalid" ? 72 : _context15.t1 === "role is empty" ? 74 : _context15.t1 === "user.type is empty" ? 76 : _context15.t1 === "group is empty" ? 78 : _context15.t1 === "role set is duplicate" ? 80 : 82;
            break;

          case 64:
            errors.file_id = "ファイルIDが空のためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 66:
            errors.file_id = "ファイルIDが不正のためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 68:
            errors.file_id = "指定されたファイルが存在しないためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 70:
            errors.user_id = "指定されたユーザが存在しないためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 72:
            errors.user_id = "ユーザIDが不正のためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 74:
            errors.role_file_id = "指定された権限が存在しないためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 76:
            errors.user = "ユーザの種類が不明です";
            return _context15.abrupt("break", 84);

          case 78:
            errors.group = "追加対象のユーザが見つかりません";
            return _context15.abrupt("break", 84);

          case 80:
            errors.role_set = "指定されたユーザ、権限は既に登録されているためファイルへの権限の追加に失敗しました";
            return _context15.abrupt("break", 84);

          case 82:
            errors.unknown = _context15.t0;
            return _context15.abrupt("break", 84);

          case 84:
            _logger2.default.error(_context15.t0);
            res.status(400).json({
              status: { success: false, message: "ファイルへの権限の追加に失敗しました", errors: errors }
            });

          case 86:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this, [[0, 58]]);
  }));
};

var removeAuthority = exports.removeAuthority = function removeAuthority(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
    var file_id, _req$query3, user_id, role_id, file, role_user, role_file, authority, removeResult, tenant_id, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.prev = 0;
            file_id = req.params.file_id;
            _req$query3 = req.query, user_id = _req$query3.user_id, role_id = _req$query3.role_id;

            if (_mongoose2.default.Types.ObjectId.isValid(file_id)) {
              _context16.next = 5;
              break;
            }

            throw "file_id is invalid";

          case 5:
            if (!(user_id === undefined || user_id === null || user_id === "")) {
              _context16.next = 7;
              break;
            }

            throw "user_id is empty";

          case 7:
            if (!(role_id === undefined || role_id === null || role_id === "")) {
              _context16.next = 9;
              break;
            }

            throw "role_id is empty";

          case 9:
            if (_mongoose2.default.Types.ObjectId.isValid(user_id)) {
              _context16.next = 11;
              break;
            }

            throw "user_id is invalid";

          case 11:
            if (_mongoose2.default.Types.ObjectId.isValid(role_id)) {
              _context16.next = 13;
              break;
            }

            throw "role_id is invalid";

          case 13:
            _context16.next = 15;
            return _File2.default.findById(file_id);

          case 15:
            file = _context16.sent;

            if (!(file === null)) {
              _context16.next = 18;
              break;
            }

            throw "file is empty";

          case 18:
            _context16.next = 20;
            return _User2.default.findById(user_id);

          case 20:
            role_user = _context16.sent;

            if (!(role_user === null)) {
              _context16.next = 23;
              break;
            }

            throw "user is empty";

          case 23:
            _context16.next = 25;
            return _RoleFile2.default.findById(role_id);

          case 25:
            role_file = _context16.sent;

            if (!(role_file === null)) {
              _context16.next = 28;
              break;
            }

            throw "role is empty";

          case 28:
            if (!(role_user.type === undefined || role_user.type === null || role_user.type === "")) {
              _context16.next = 30;
              break;
            }

            throw "user.type is empty";

          case 30:
            authority = _AuthorityFile2.default.findOne({
              role_files: role_file._id,
              users: role_user._id,
              files: file._id
            });

            if (!(authority === null)) {
              _context16.next = 33;
              break;
            }

            throw "authority is empty";

          case 33:
            _context16.next = 35;
            return authority.remove();

          case 35:
            removeResult = _context16.sent;

            if (!(removeResult.result.ok !== 1)) {
              _context16.next = 38;
              break;
            }

            throw "remove authority is failed";

          case 38:

            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context16.next = 41;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 41:
            updatedFile = _context16.sent;
            _context16.next = 44;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 44:

            res.json({
              status: { success: true },
              body: { role_files: role_file, users: role_user, files: file }
            });
            _context16.next = 79;
            break;

          case 47:
            _context16.prev = 47;
            _context16.t0 = _context16["catch"](0);
            errors = {};
            _context16.t1 = _context16.t0;
            _context16.next = _context16.t1 === "file_id is invalid" ? 53 : _context16.t1 === "user_id is empty" ? 55 : _context16.t1 === "role_id is empty" ? 57 : _context16.t1 === "user_id is invalid" ? 59 : _context16.t1 === "role_id is invalid" ? 61 : _context16.t1 === "file is empty" ? 63 : _context16.t1 === "user is empty" ? 65 : _context16.t1 === "role is empty" ? 67 : _context16.t1 === "user.type is empty" ? 69 : _context16.t1 === "authority is empty" ? 71 : _context16.t1 === "remove authority is failed" ? 73 : 76;
            break;

          case 53:
            errors.file_id = "ファイルIDが不正のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 55:
            errors.user_id = "ユーザIDが空のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 57:
            errors.role_id = "ファイル権限IDが空のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 59:
            errors.user_id = "ユーザIDが不正のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 61:
            errors.role_id = "ファイル権限IDが不正のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 63:
            errors.file_id = "指定されたファイルが存在しないためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 65:
            errors.user_id = "指定されたユーザが存在しないためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 67:
            errors.role_id = "指定されたファイル権限が存在しないためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 69:
            errors.user_type = "ユーザ種別が空のためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 71:
            errors.role = "指定された権限セットが存在しないためファイルへの権限の削除に失敗しました";
            return _context16.abrupt("break", 78);

          case 73:
            errors.remove = "原因不明のエラーで権限の削除に失敗しました";
            errors.unknown = _context16.t0;
            return _context16.abrupt("break", 78);

          case 76:
            errors.unknown = _context16.t0;
            return _context16.abrupt("break", 78);

          case 78:

            res.status(400).json({
              status: { success: false, message: "ファイルへの権限の削除に失敗しました", errors: errors }
            });

          case 79:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this, [[0, 47]]);
  }));
};

var moveTrash = exports.moveTrash = function moveTrash(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
    var file_id, tenant_id, _ref15, trash_dir_id, user, file, changedFile, changedFiles, movedDirs, movedFiles, i, _updatedFile2, updatedFile, errors;

    return _regenerator2.default.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.prev = 0;
            file_id = req.params.file_id;
            tenant_id = res.user.tenant_id;
            _context17.next = 5;
            return _Tenant2.default.findOne(tenant_id);

          case 5:
            _ref15 = _context17.sent;
            trash_dir_id = _ref15.trash_dir_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context17.next = 9;
              break;
            }

            throw "file_id is empty";

          case 9:
            _context17.next = 11;
            return _User2.default.findById(res.user._id);

          case 11:
            user = _context17.sent;
            _context17.next = 14;
            return _File2.default.findById(file_id);

          case 14:
            file = _context17.sent;

            if (!(file === null)) {
              _context17.next = 17;
              break;
            }

            throw "file is empty";

          case 17:
            if (!(user === null)) {
              _context17.next = 19;
              break;
            }

            throw "user is empty";

          case 19:
            changedFile = void 0;

            if (!file.is_dir) {
              _context17.next = 44;
              break;
            }

            _context17.next = 23;
            return (0, _dirs.moveDir)(file._id, trash_dir_id, user, "削除");

          case 23:
            changedFiles = _context17.sent;

            changedFile = changedFiles[0]; // response用。指定されたフォルダを返す
            movedDirs = changedFiles.map(function (dir) {
              return dir._id;
            });
            _context17.next = 28;
            return _File2.default.find({
              $or: [{ _id: { $in: movedDirs } }, { dir_id: { $in: movedDirs } }]
            });

          case 28:
            movedFiles = _context17.sent;
            _context17.t0 = _regenerator2.default.keys(movedFiles);

          case 30:
            if ((_context17.t1 = _context17.t0()).done) {
              _context17.next = 42;
              break;
            }

            i = _context17.t1.value;

            movedFiles[i].is_trash = true;
            _context17.next = 35;
            return movedFiles[i].save();

          case 35:
            _context17.next = 37;
            return _File2.default.searchFileOne({ _id: movedFiles[i]._id });

          case 37:
            _updatedFile2 = _context17.sent;
            _context17.next = 40;
            return _elasticsearchclient2.default.createIndex(tenant_id, [_updatedFile2]);

          case 40:
            _context17.next = 30;
            break;

          case 42:
            _context17.next = 48;
            break;

          case 44:
            file.is_trash = true;
            _context17.next = 47;
            return moveFile(file, trash_dir_id, user, "削除");

          case 47:
            changedFile = _context17.sent;

          case 48:
            _context17.next = 50;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 50:
            updatedFile = _context17.sent;
            _context17.next = 53;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 53:

            res.json({
              status: { success: true },
              body: changedFile
            });
            _context17.next = 73;
            break;

          case 56:
            _context17.prev = 56;
            _context17.t2 = _context17["catch"](0);
            errors = {};
            _context17.t3 = _context17.t2;
            _context17.next = _context17.t3 === "file_id is empty" ? 62 : _context17.t3 === "file is empty" ? 64 : _context17.t3 === "user is empty" ? 66 : _context17.t3 === "file is dir" ? 68 : 70;
            break;

          case 62:
            errors.file_id = "削除対象のファイルが見つかりません";
            return _context17.abrupt("break", 72);

          case 64:
            errors.file = "削除対象のファイルが見つかりません";
            return _context17.abrupt("break", 72);

          case 66:
            errors.user = "実行ユーザーが見つかりません";
            return _context17.abrupt("break", 72);

          case 68:
            errors.file = "削除対象がフォルダです";
            return _context17.abrupt("break", 72);

          case 70:
            errors.unknown = _context17.t2;
            return _context17.abrupt("break", 72);

          case 72:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 73:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this, [[0, 56]]);
  }));
};

var restore = exports.restore = function restore(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
    var file_id, user, file, dir_id, changedFile, tenant_id, updatedFile, errors;
    return _regenerator2.default.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.prev = 0;
            file_id = req.params.file_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context18.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            _context18.next = 6;
            return _User2.default.findById(res.user._id);

          case 6:
            user = _context18.sent;
            _context18.next = 9;
            return _File2.default.findById(file_id);

          case 9:
            file = _context18.sent;
            dir_id = file.histories[file.histories.length - 1].body.dir_id;

            if (!(file === null)) {
              _context18.next = 13;
              break;
            }

            throw "file is empty";

          case 13:
            if (!(user === null)) {
              _context18.next = 15;
              break;
            }

            throw "user is empty";

          case 15:
            if (!(dir_id === null || dir_id === undefined || dir_id === "")) {
              _context18.next = 17;
              break;
            }

            throw "dir_id is empty";

          case 17:
            _context18.next = 19;
            return moveFile(file, dir_id, user, "復元");

          case 19:
            changedFile = _context18.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context18.next = 23;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 23:
            updatedFile = _context18.sent;
            _context18.next = 26;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 26:
            res.json({
              status: { success: true },
              body: changedFile
            });

            _context18.next = 44;
            break;

          case 29:
            _context18.prev = 29;
            _context18.t0 = _context18["catch"](0);
            errors = {};
            _context18.t1 = _context18.t0;
            _context18.next = _context18.t1 === "file_id is empty" ? 35 : _context18.t1 === "file is empty" ? 37 : _context18.t1 === "user is empty" ? 39 : 41;
            break;

          case 35:
            errors.file_id = "対象のファイルが見つかりません";
            return _context18.abrupt("break", 43);

          case 37:
            errors.file = "対象のファイルが見つかりません";
            return _context18.abrupt("break", 43);

          case 39:
            errors.user = "実行ユーザーが見つかりません";
            return _context18.abrupt("break", 43);

          case 41:
            errors.unknown = _context18.t0;
            return _context18.abrupt("break", 43);

          case 43:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 44:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, this, [[0, 29]]);
  }));
};

var deleteFileLogical = exports.deleteFileLogical = function deleteFileLogical(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
    var file_id, user, file, history, deletedFile, tenant_id, updatedFile, errors;
    return _regenerator2.default.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.prev = 0;
            file_id = req.params.file_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context19.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            _context19.next = 6;
            return _User2.default.findById(res.user._id);

          case 6:
            user = _context19.sent;
            _context19.next = 9;
            return _File2.default.findById(file_id);

          case 9:
            file = _context19.sent;
            history = {
              modified: (0, _moment2.default)().format("YYYY-MM-DD hh:mm:ss"),
              user: user,
              action: "完全削除",
              body: {
                _id: file._id,
                is_star: file.is_star,
                is_display: file.is_display,
                dir_id: file.dir_id,
                is_dir: file.is_dir,
                size: file.size,
                mime_type: file.mime_type,
                blob_path: file.blob_path,
                name: file.name,
                meta_infos: file.meta_infos,
                tags: file.tags,
                is_deleted: file.is_deleted,
                modified: file.modified,
                __v: file.__v
              }
            };

            file.histories = file.histories.concat(history);

            file.is_deleted = true;
            _context19.next = 15;
            return file.save();

          case 15:
            deletedFile = _context19.sent;


            // elasticsearch index作成
            tenant_id = res.user.tenant_id;
            _context19.next = 19;
            return _File2.default.searchFileOne({ _id: _mongoose2.default.Types.ObjectId(file_id) });

          case 19:
            updatedFile = _context19.sent;
            _context19.next = 22;
            return _elasticsearchclient2.default.createIndex(tenant_id, [updatedFile]);

          case 22:

            res.json({
              status: { success: true },
              body: deletedFile
            });

            _context19.next = 40;
            break;

          case 25:
            _context19.prev = 25;
            _context19.t0 = _context19["catch"](0);
            errors = {};
            _context19.t1 = _context19.t0;
            _context19.next = _context19.t1 === "file_id is empty" ? 31 : _context19.t1 === "file is empty" ? 33 : _context19.t1 === "user is empty" ? 35 : 37;
            break;

          case 31:
            errors.file_id = "対象のファイルが見つかりません";
            return _context19.abrupt("break", 39);

          case 33:
            errors.file = "対象のファイルが見つかりません";
            return _context19.abrupt("break", 39);

          case 35:
            errors.user = "実行ユーザーが見つかりません";
            return _context19.abrupt("break", 39);

          case 37:
            errors.unknown = _context19.t0;
            return _context19.abrupt("break", 39);

          case 39:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 40:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this, [[0, 25]]);
  }));
};

var deleteFilePhysical = exports.deleteFilePhysical = function deleteFilePhysical(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
    var swift, file_id, fileRecord, tenant_name, readStream, deletedFile, deletedAutholity, tenant_id, errors;
    return _regenerator2.default.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.prev = 0;

            // is_delete === true のみ対象ファイル
            // swiftコンテナから削除
            // mongoから削除
            swift = new _Swift.Swift();
            file_id = req.params.file_id;
            _context20.next = 5;
            return _File2.default.findById(file_id);

          case 5:
            fileRecord = _context20.sent;

            if (!(fileRecord === null)) {
              _context20.next = 8;
              break;
            }

            throw "file not found";

          case 8:
            if (!(fileRecord.is_deleted !== true)) {
              _context20.next = 10;
              break;
            }

            throw "file is not deleted";

          case 10:
            tenant_name = res.user.tenant.name;
            _context20.next = 13;
            return swift.remove(tenant_name, fileRecord);

          case 13:
            readStream = _context20.sent;
            _context20.next = 16;
            return fileRecord.remove();

          case 16:
            deletedFile = _context20.sent;
            _context20.next = 19;
            return _AuthorityFile2.default.remove({ files: fileRecord._id });

          case 19:
            deletedAutholity = _context20.sent;


            // elasticsearch index削除
            tenant_id = res.user.tenant_id;
            _context20.next = 23;
            return _elasticsearchclient2.default.delete({ index: tenant_id, type: "files", id: file_id });

          case 23:

            res.json({
              status: { success: true },
              body: deletedFile
            });

            _context20.next = 31;
            break;

          case 26:
            _context20.prev = 26;
            _context20.t0 = _context20["catch"](0);
            errors = {};

            errors.unknown = _context20.t0;
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 31:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, this, [[0, 26]]);
  }));
};

var previewExists = exports.previewExists = function previewExists(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
    var file_id, file, preview_id, preview, tmpDirPath, tmpFileName, tenant_name, swift, downloadFile, command, pdfFileName, changedFile, execResult, previewImage, errors;
    return _regenerator2.default.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.prev = 0;

            // プレビュー画像の存在チェック
            file_id = req.params.file_id;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context21.next = 4;
              break;
            }

            throw "file_id is empty";

          case 4:
            _context21.next = 6;
            return _File2.default.findById(file_id);

          case 6:
            file = _context21.sent;

            if (!(file.size > constants.MAX_CREATE_PREVIEW_FILE_SIZE)) {
              _context21.next = 9;
              break;
            }

            throw "file size is too large";

          case 9:
            preview_id = file.preview_id;
            preview = void 0;

            if (!(preview_id === null || preview_id === undefined || preview_id === "")) {
              _context21.next = 15;
              break;
            }

            preview = new _Preview2.default();
            _context21.next = 18;
            break;

          case 15:
            _context21.next = 17;
            return _Preview2.default.findById(preview_id);

          case 17:
            preview = _context21.sent;

          case 18:
            if (!(preview.image === undefined && preview.creating === false)) {
              _context21.next = 70;
              break;
            }

            tmpDirPath = _path2.default.join(__dirname, '../../tmp');
            tmpFileName = _path2.default.join(tmpDirPath, file.name);


            _fs2.default.mkdir(tmpDirPath, function (err) {
              if (err && err.code !== "EEXIST") _logger2.default.info(err);
            });

            tenant_name = res.user.tenant.name;
            swift = new _Swift.Swift();
            _context21.next = 26;
            return swift.exportFile(tenant_name, file, tmpFileName);

          case 26:
            downloadFile = _context21.sent;
            command = '';
            _context21.t0 = file.mime_type;
            _context21.next = _context21.t0 === "text/csv" ? 31 : _context21.t0 === "text/plain" ? 31 : _context21.t0 === "application/msword" ? 33 : _context21.t0 === "application/vnd.ms-excel" ? 33 : _context21.t0 === "application/vnd.ms-powerpoint" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.wordprocessingml.template" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.spreadsheetml.template" ? 33 : _context21.t0 === "application/vnd.openxmlformats-officedocument.presentationml.template" ? 33 : _context21.t0 === "application/pdf" ? 36 : _context21.t0 === "image/jpeg" ? 38 : _context21.t0 === "image/png" ? 38 : _context21.t0 === "image/gif" ? 38 : _context21.t0 === "image/tiff" ? 38 : 40;
            break;

          case 31:
            // csv,txtファイルはnkfでUTF8に変換後,PDFを経てpng形式に変換する
            command = "cd " + tmpDirPath + " && nkf -w \"" + file.name + "\" > buf.txt && " + constants.LIBRE_OFFICE_PATH() + " --headless --nologo --nofirststartwizard --convert-to pdf buf.txt && convert -background white -alpha remove -density " + constants.CONVERT_DPI + " -antialias -format png buf.pdf[0] \"" + file.name + ".png\" && rm \"" + file.name + "\" buf.*";
            return _context21.abrupt("break", 42);

          case 33:
            pdfFileName = _path2.default.extname(file.name) === "" ? file.name + ".pdf" : file.name.replace(_path2.default.extname(file.name), ".pdf");


            command = "cd " + tmpDirPath + " && " + constants.LIBRE_OFFICE_PATH() + " --headless --nologo --nofirststartwizard --convert-to pdf \"" + file.name + "\" && convert -background white -alpha remove -density " + constants.CONVERT_DPI + " -antialias -format png \"" + pdfFileName + "[0]\" \"" + file.name + ".png\" && rm \"" + file.name + "\" \"" + pdfFileName + "\"";
            return _context21.abrupt("break", 42);

          case 36:
            command = "cd " + tmpDirPath + " && convert -background white -alpha remove -density " + constants.CONVERT_DPI + " -antialias -format png \"" + file.name + "[0]\" \"" + file.name + ".png\" && rm \"" + file.name + "\"";
            return _context21.abrupt("break", 42);

          case 38:
            command = "cd " + tmpDirPath + " && convert -density " + constants.CONVERT_DPI + " -antialias -format png \"" + file.name + "\" -resize 1024x\\> \"" + file.name + ".png\" && rm \"" + file.name + "\"";
            return _context21.abrupt("break", 42);

          case 40:
            throw "this mime_type is not supported yet";

          case 42:
            if (!(command !== "")) {
              _context21.next = 68;
              break;
            }

            preview.creating = true;
            // 大きいファイルの場合、タイムアウトするので一度idだけ登録してコマンドの再実行を防止する
            _context21.next = 46;
            return preview.save();

          case 46:
            file.preview_id = preview._id;
            _context21.next = 49;
            return file.save();

          case 49:
            changedFile = _context21.sent;
            _context21.prev = 50;
            _context21.next = 53;
            return _exec(command);

          case 53:
            execResult = _context21.sent;

            preview.image = _fs2.default.readFileSync(tmpFileName + ".png");
            _context21.next = 60;
            break;

          case 57:
            _context21.prev = 57;
            _context21.t1 = _context21["catch"](50);
            throw _context21.t1;

          case 60:
            _context21.prev = 60;

            preview.creating = false;
            _context21.next = 64;
            return preview.save();

          case 64:
            previewImage = _context21.sent;
            return _context21.finish(60);

          case 66:
            preview_id = file.preview_id;
            _fs2.default.unlink(_path2.default.join(tmpFileName + ".png"));

          case 68:
            _context21.next = 71;
            break;

          case 70:
            if (preview.image === undefined) preview_id = null;

          case 71:

            res.json({
              status: { success: true },
              body: {
                preview_id: preview_id
              }
            });

            _context21.next = 88;
            break;

          case 74:
            _context21.prev = 74;
            _context21.t2 = _context21["catch"](0);

            _logger2.default.error(_context21.t2);
            errors = {};
            _context21.t3 = _context21.t2;
            _context21.next = _context21.t3 === "this mime_type is not supported yet" ? 81 : _context21.t3 === "file size is too large" ? 83 : 85;
            break;

          case 81:
            errors.mime_type = "このファイルはプレビュー画像を表示できません";
            return _context21.abrupt("break", 87);

          case 83:
            errors.file_size = "このファイルはプレビュー画像を表示できません";
            return _context21.abrupt("break", 87);

          case 85:
            errors.unknown = _context21.t2;
            return _context21.abrupt("break", 87);

          case 87:
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 88:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, this, [[0, 74], [50, 57, 60, 66]]);
  }));
};

var exists = exports.exists = function exists(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {
    var _req$body4, dir_id, files, fileNames, records, _exists, errors;

    return _regenerator2.default.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.prev = 0;
            _req$body4 = req.body, dir_id = _req$body4.dir_id, files = _req$body4.files;

            if (!(dir_id === null || dir_id === undefined || dir_id === "")) {
              _context22.next = 4;
              break;
            }

            throw new _AppError.ValidationError("dir_idが空です");

          case 4:

            if (files === null || files === undefined || files === "" || files.length === 0) {
              // validationErrorではなく空で返却するのが正解？
              res.json({ status: { success: true }, body: [] });
            }

            fileNames = (0, _lodash.reject)(files.map(function (f) {
              return f.name;
            }), function (name) {
              return name === undefined || name === null || name === "" || name === "undefined";
            });

            if (!(files.length !== fileNames.length)) {
              _context22.next = 8;
              break;
            }

            throw new _AppError.ValidationError("ファイル名に空のものが存在します");

          case 8:
            _context22.next = 10;
            return files.map(function (file) {
              return _File2.default.findOne({
                dir_id: _mongoose2.default.Types.ObjectId(dir_id),
                name: file.name
              });
            });

          case 10:
            records = _context22.sent;
            _exists = (0, _lodash.zipWith)(records, files, function (record, file) {
              if (record === null) {
                return {
                  name: file.name,
                  is_exists: false
                };
              } else {
                return {
                  name: record.name,
                  is_exists: true
                };
              }
            });


            res.json({
              status: { success: true },
              body: _exists
            });

            _context22.next = 20;
            break;

          case 15:
            _context22.prev = 15;
            _context22.t0 = _context22["catch"](0);
            errors = void 0;


            if (_context22.t0.name === "Error") {
              errors = commons.errorParser(_context22.t0);
            } else {
              errors = _context22.t0;
            }

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 20:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this, [[0, 15]]);
  }));
};

var toggleUnvisible = exports.toggleUnvisible = function toggleUnvisible(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23() {
    var file_id, tenant_id, tenant, file, result, esFile, errors;
    return _regenerator2.default.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            file_id = req.params.file_id;
            _context23.prev = 1;

            if (!(file_id === undefined || file_id === null || file_id === "")) {
              _context23.next = 4;
              break;
            }

            throw new Error("ファイルが存在しないため非表示状態の変更に失敗しました");

          case 4:
            tenant_id = res.user.tenant_id;
            _context23.next = 7;
            return _Tenant2.default.findById(tenant_id);

          case 7:
            tenant = _context23.sent;

            if (!(tenant === null)) {
              _context23.next = 10;
              break;
            }

            throw new Error("指定されたテナントが存在しないため非表示状態の変更に失敗しました");

          case 10:
            _context23.next = 12;
            return _File2.default.findById(file_id);

          case 12:
            file = _context23.sent;

            file.unvisible = !file.unvisible;

            _context23.next = 16;
            return file.save();

          case 16:
            result = _context23.sent;

            if (result) {
              _context23.next = 19;
              break;
            }

            throw new Error("ファイルの非表示状態の変更に失敗しました");

          case 19:
            _context23.next = 21;
            return _File2.default.searchFileOne({ _id: result._id });

          case 21:
            esFile = _context23.sent;
            _context23.next = 24;
            return _elasticsearchclient2.default.createIndex(tenant_id, [esFile]);

          case 24:
            res.json({
              status: { success: true },
              body: result
            });

            _context23.next = 31;
            break;

          case 27:
            _context23.prev = 27;
            _context23.t0 = _context23["catch"](1);
            errors = void 0;


            res.status(400).json({
              status: { success: false }
            });

          case 31:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this, [[1, 27]]);
  }));
};

// ここからプライベート的なメソッド
var _exec = function _exec(command) {
  return new Promise(function (resolve, reject) {
    (0, _child_process.exec)(command, function (err, stdout, stderr) {
      if (err) return reject({ err: err, stderr: stderr });
      return resolve(true);
    });
  });
};

var moveFile = function moveFile(file, dir_id, user, action) {
  if (file.is_dir) throw "file is dir";

  var history = {
    modified: (0, _moment2.default)().format("YYYY-MM-DD hh:mm:ss"),
    user: user,
    action: action,
    body: {
      _id: file._id,
      is_star: file.is_star,
      is_display: file.is_display,
      dir_id: file.dir_id,
      is_dir: file.is_dir,
      size: file.size,
      mime_type: file.mime_type,
      blob_path: file.blob_path,
      name: file.name,
      meta_infos: file.meta_infos,
      tags: file.tags,
      is_deleted: file.is_deleted,
      modified: file.modified,
      __v: file.__v
    }
  };

  file.histories = file.histories.concat(history);

  file.dir_id = dir_id;

  var changedFile = file.save();

  return changedFile;
};

var createSortOption = _co2.default.wrap( /*#__PURE__*/_regenerator2.default.mark(function _callee24() {
  var _sort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var _order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var sort, order, conditions, metaInfos, displayItems, item;
  return _regenerator2.default.wrap(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          sort = { "is_dir": "desc" };
          order = _order === "DESC" || _order === "desc" ? -1 : 1;

          if (!(_sort === undefined || _sort === null || _sort === "")) {
            _context24.next = 6;
            break;
          }

          sort["id"] = order;

          _context24.next = 17;
          break;

        case 6:
          conditions = { _id: _mongoose2.default.Types.ObjectId(_sort) };
          _context24.next = 9;
          return _MetaInfo2.default.find(conditions);

        case 9:
          _context24.t0 = function (meta) {
            meta = meta.toObject();
            meta.meta_info_id = meta._id;
            return meta;
          };

          metaInfos = _context24.sent.map(_context24.t0);
          _context24.next = 13;
          return _DisplayItem2.default.find((0, _extends3.default)({}, conditions, {
            name: { $nin: ["file_checkbox", "action"] }
          }));

        case 13:
          _context24.t1 = function (items) {
            return items.toObject();
          };

          displayItems = _context24.sent.map(_context24.t1);
          item = metaInfos.concat(displayItems)[0];

          if (item.meta_info_id === null) {
            // メタ情報以外でのソート
            sort[item.name] = order;
          } else if (item.meta_info_id !== null) {
            // メタ情報でのソート
            sort = {
              "is_dir": "desc",
              "sort_target": order
            };
          } else {
            // @fixme
            sort["id"] = order;
          }

        case 17:
          sort["name"] = order;
          return _context24.abrupt("return", Promise.resolve(sort));

        case 19:
        case "end":
          return _context24.stop();
      }
    }
  }, _callee24, this);
}));

var getAllowedFileIds = exports.getAllowedFileIds = function getAllowedFileIds(user_id, permission) {
  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee25() {
    var action, role, user, authorities, file_ids;
    return _regenerator2.default.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return _Action2.default.findOne({ name: permission });

          case 2:
            action = _context25.sent;
            _context25.next = 5;
            return _RoleFile2.default.find({ actions: { $all: [action._id] } }, { '_id': 1 });

          case 5:
            _context25.t0 = function (role) {
              return _mongoose2.default.Types.ObjectId(role._id);
            };

            role = _context25.sent.map(_context25.t0);
            _context25.next = 9;
            return _User2.default.findById(user_id);

          case 9:
            user = _context25.sent;
            _context25.next = 12;
            return _AuthorityFile2.default.find({
              $or: [{ users: _mongoose2.default.Types.ObjectId(user_id) }, { groups: { $in: user.groups } }],
              role_files: { $in: role }
            });

          case 12:
            authorities = _context25.sent;
            file_ids = authorities.filter(function (authority) {
              return authority.files !== undefined;
            }).map(function (authority) {
              return authority.files;
            });
            return _context25.abrupt("return", new Promise(function (resolve, reject) {
              return resolve(file_ids);
            }));

          case 15:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));
};

var checkFilePermission = exports.checkFilePermission = function checkFilePermission(file_id, user_id, permission) {
  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee26() {
    var action, role, user, authorities;
    return _regenerator2.default.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            _context26.next = 2;
            return _Action2.default.findOne({ name: permission });

          case 2:
            action = _context26.sent;
            _context26.next = 5;
            return _RoleFile2.default.find({ actions: { $all: [action._id] } }, { '_id': 1 });

          case 5:
            _context26.t0 = function (role) {
              return _mongoose2.default.Types.ObjectId(role._id);
            };

            role = _context26.sent.map(_context26.t0);
            _context26.next = 9;
            return _User2.default.findById(user_id);

          case 9:
            user = _context26.sent;
            _context26.next = 12;
            return _AuthorityFile2.default.find({
              $or: [{ users: _mongoose2.default.Types.ObjectId(user_id) }, { groups: { $in: user.groups } }],
              role_files: { $in: role },
              files: file_id
            });

          case 12:
            authorities = _context26.sent;
            return _context26.abrupt("return", new Promise(function (resolve, reject) {
              return resolve(authorities.length > 0);
            }));

          case 14:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));
};

var escapeRegExp = function escapeRegExp(input) {
  var replace_target = {
    '\\': '\\\\',
    '^': '\\^',
    '$': '\\$',
    '.': '\\.',
    '*': '\\*',
    '+': '\\+',
    '?': '\\?',
    '[': '\\[',
    ']': '\\]',
    '{': '\\{',
    '}': '\\}',
    '(': '\\(',
    ')': '\\)',
    '/': '\\/'
  };
  return input.replace(/[\^\$\.\*\+\?\[\]\{\}\(\)\/]/g, function (m) {
    return replace_target[m];
  });
};

var extractFileActions = exports.extractFileActions = function extractFileActions(authorities, user) {

  var user_id = user._id.toString();

  var user_actions = (0, _lodash.chain)(authorities).filter(function (auth) {
    return auth.users !== undefined && auth.users._id.toString() == user_id;
  }).map(function (auth) {
    return auth.actions;
  }).flattenDeep().uniq().value();

  var group_ids = user.groups.map(function (group) {
    return group.toString();
  });
  var group_actuions = (0, _lodash.chain)(authorities).filter(function (auth) {
    return auth.groups !== undefined && (0, _lodash.indexOf)(group_ids, auth.groups._id.toString()) >= 0;
  }).map(function (auth) {
    return auth.actions;
  }).flattenDeep().uniq().value();

  return user_actions.concat(group_actuions);
};