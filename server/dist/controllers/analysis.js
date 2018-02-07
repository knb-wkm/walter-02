"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.periods = exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _AnalysisUseRateTotal = require("../models/AnalysisUseRateTotal");

var _AnalysisUseRateTotal2 = _interopRequireDefault(_AnalysisUseRateTotal);

var _AnalysisFileCount = require("../models/AnalysisFileCount");

var _AnalysisFileCount2 = _interopRequireDefault(_AnalysisFileCount);

var _AnalysisFolderCount = require("../models/AnalysisFolderCount");

var _AnalysisFolderCount2 = _interopRequireDefault(_AnalysisFolderCount);

var _AnalysisUseRateFolder = require("../models/AnalysisUseRateFolder");

var _AnalysisUseRateFolder2 = _interopRequireDefault(_AnalysisUseRateFolder);

var _AnalysisUseRateTag = require("../models/AnalysisUseRateTag");

var _AnalysisUseRateTag2 = _interopRequireDefault(_AnalysisUseRateTag);

var _AnalysisUseRateMimeType = require("../models/AnalysisUseRateMimeType");

var _AnalysisUseRateMimeType2 = _interopRequireDefault(_AnalysisUseRateMimeType);

var _AnalysisUseRateUser = require("../models/AnalysisUseRateUser");

var _AnalysisUseRateUser2 = _interopRequireDefault(_AnalysisUseRateUser);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var reported_at, conditions, _ref, _ref2, useRateTotal, fileCount, folderCount, useRateFolder, useRateTag, useRateMimeType, useRateUser, errors;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            reported_at = req.query.reported_at;

            if (!(reported_at === undefined || reported_at === null || reported_at === "")) {
              _context.next = 4;
              break;
            }

            throw "reported_at is empty";

          case 4:
            if ((0, _moment2.default)(reported_at, "YYYYMMDD")) {
              _context.next = 6;
              break;
            }

            throw "reported_at is invalid";

          case 6:
            if (!((0, _moment2.default)(reported_at, "YYYYMMDD").format() > (0, _moment2.default)().format())) {
              _context.next = 8;
              break;
            }

            throw "reported_at is invalid";

          case 8:
            conditions = {
              tenant_id: res.user.tenant_id,
              reported_at: reported_at
            };
            _context.next = 11;
            return [_AnalysisUseRateTotal2.default.find(conditions), _AnalysisFileCount2.default.find(conditions), _AnalysisFolderCount2.default.find(conditions), _AnalysisUseRateFolder2.default.find(conditions), _AnalysisUseRateTag2.default.find(conditions), _AnalysisUseRateMimeType2.default.find(conditions), _AnalysisUseRateUser2.default.find(conditions)];

          case 11:
            _ref = _context.sent;
            _ref2 = (0, _slicedToArray3.default)(_ref, 7);
            useRateTotal = _ref2[0];
            fileCount = _ref2[1];
            folderCount = _ref2[2];
            useRateFolder = _ref2[3];
            useRateTag = _ref2[4];
            useRateMimeType = _ref2[5];
            useRateUser = _ref2[6];


            if (useRateTotal.length > 0) {
              useRateTotal = [{ name: "usage", label: "使用容量", value: useRateTotal[0].used }, { name: "free", label: "空き容量", value: useRateTotal[0].free }];
            }

            if (fileCount.length > 0) {
              fileCount = [{
                name: "fileCount", value: fileCount[0].count
              }];
            }

            if (folderCount.length > 0) {
              folderCount = [{
                name: "folderCount", value: folderCount[0].count
              }];
            }

            if (useRateFolder.length > 0) {
              useRateFolder = useRateFolder.map(function (f) {
                return {
                  name: f.dir_name, value: f.rate
                };
              });
            }

            if (useRateTag.length > 0) {
              useRateTag = useRateTag.map(function (t) {
                if (t.tag_label === null) {
                  t.tag_label = "タグなし";
                }
                return { name: t.tag_label, value: t.rate };
              });
            }

            if (useRateMimeType.length > 0) {
              useRateMimeType = useRateMimeType.map(function (m) {
                return {
                  name: m.mime_type, value: m.rate
                };
              });
            }

            if (useRateUser.length > 0) {
              useRateUser = useRateUser.map(function (user) {
                return {
                  name: user.user_name, value: user.rate
                };
              });
            }

            res.json({
              status: { success: true },
              body: {
                useRateTotal: useRateTotal,
                fileCount: fileCount,
                folderCount: folderCount,
                useRateFolder: useRateFolder,
                useRateTag: useRateTag,
                useRateMimeType: useRateMimeType,
                useRateUser: useRateUser
              }
            });
            _context.next = 43;
            break;

          case 30:
            _context.prev = 30;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = _context.t1 === "reported_at is empty" ? 36 : _context.t1 === "reported_at is invalid" ? 38 : 40;
            break;

          case 36:
            errors.reported_at = "日付が空のため容量の履歴の取得に失敗しました";
            return _context.abrupt("break", 42);

          case 38:
            errors.reported_at = "日付が不正のため容量の履歴の取得に失敗しました";
            return _context.abrupt("break", 42);

          case 40:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 42);

          case 42:
            res.status(400).json({
              status: { success: false, message: "容量の履歴の取得に失敗しました", errors: errors }
            });

          case 43:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 30]]);
  }));
};

var periods = exports.periods = function periods(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var _req$query, start_date, end_date, conditions, usages, errors;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _req$query = req.query, start_date = _req$query.start_date, end_date = _req$query.end_date;

            if (!(start_date === undefined || start_date === null || start_date === "")) {
              _context2.next = 4;
              break;
            }

            throw "start_date is empty";

          case 4:
            if (!(end_date === undefined || end_date === null || end_date === "")) {
              _context2.next = 6;
              break;
            }

            throw "end_date is empty";

          case 6:
            if (!((0, _moment2.default)(start_date, "YYYYMMDD").format() > (0, _moment2.default)(end_date, "YYYYMMDD").format())) {
              _context2.next = 8;
              break;
            }

            throw "date_range is invalid";

          case 8:
            conditions = {
              tenant_id: res.user.tenant_id,
              $and: [{ reported_at: { $gte: start_date } }, { reported_at: { $lte: end_date } }]
            };
            _context2.next = 11;
            return _AnalysisUseRateTotal2.default.find(conditions).sort({ reported_at: 1 });

          case 11:
            usages = _context2.sent;


            if (usages.length > 0) {
              usages = usages.map(function (total) {
                return {
                  name: (0, _moment2.default)(total.reported_at, "YYYYMMDD").format("YYYY-MM-DD"),
                  usage: total.used / 1024 / 1024 / 1024, // GB
                  free: total.free / 1024 / 1024 / 1024 // GB
                };
              });
            }

            res.json({
              status: { success: true },
              body: usages
            });
            _context2.next = 29;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0;
            _context2.next = _context2.t1 === "start_date is empty" ? 22 : _context2.t1 === "end_date is empty" ? 24 : 26;
            break;

          case 22:
            errors.start_date = "開始年月日が空のため容量の履歴の取得に失敗しました";
            return _context2.abrupt("break", 28);

          case 24:
            errors.end_date = "終了年月日が空のため容量の履歴の取得に失敗しました";
            return _context2.abrupt("break", 28);

          case 26:
            errors.unknown = _context2.t0;
            return _context2.abrupt("break", 28);

          case 28:

            res.status(400).json({
              status: { success: false, message: "容量の履歴の取得に失敗しました", errors: errors }
            });

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 16]]);
  }));
};