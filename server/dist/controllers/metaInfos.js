"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.valueType = exports.updateName = exports.updateLabel = exports.view = exports.add = exports.index = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _MetaInfo = require("../models/MetaInfo");

var _MetaInfo2 = _interopRequireDefault(_MetaInfo);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var KEY_TYPE_META = "meta";
var VALUE_TYPES = [{ name: "String" }, { name: "Number" }, { name: "Date" }];

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var tenant_id, tenant, conditions, meta_infos, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            tenant_id = res.user.tenant_id;

            if (!(tenant_id === undefined || tenant_id === null || tenant_id === "")) {
              _context.next = 4;
              break;
            }

            throw "tenant_id is empty";

          case 4:
            _context.next = 6;
            return _Tenant2.default.findById(tenant_id);

          case 6:
            tenant = _context.sent;

            if (!(tenant === null)) {
              _context.next = 9;
              break;
            }

            throw "tenant is empty";

          case 9:
            conditions = {
              tenant_id: tenant._id
            };
            _context.next = 12;
            return _MetaInfo2.default.find(conditions);

          case 12:
            meta_infos = _context.sent;


            res.json({
              status: { success: true },
              body: meta_infos
            });
            _context.next = 27;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = _context.t1 === "tenant_id is empty" ? 22 : 24;
            break;

          case 22:
            errors.tenant_id = _context.t0;
            return _context.abrupt("break", 26);

          case 24:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 26);

          case 26:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 16]]);
  }));
};

var add = exports.add = function add(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var metainfo, tenant_id, checkDuplicateName, _metainfo, __metainfo, createdMetainfo, errors;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            metainfo = req.body.metainfo;
            tenant_id = res.user.tenant_id;

            if (!(metainfo.name === undefined || metainfo.name === null || metainfo.name === "")) {
              _context2.next = 5;
              break;
            }

            throw "name is empty";

          case 5:
            if (!(metainfo.name.length >= constants.MAX_STRING_LENGTH)) {
              _context2.next = 7;
              break;
            }

            throw "name is too long";

          case 7:
            _context2.next = 9;
            return _MetaInfo2.default.findOne({ name: metainfo.name, tenant_id: tenant_id });

          case 9:
            checkDuplicateName = _context2.sent;

            if (!(checkDuplicateName !== null)) {
              _context2.next = 12;
              break;
            }

            throw "name is duplicate";

          case 12:
            if (!(metainfo.label === undefined || metainfo.label === null || metainfo.label === "")) {
              _context2.next = 14;
              break;
            }

            throw "label is empty";

          case 14:
            if (!(metainfo.label.length >= constants.MAX_STRING_LENGTH)) {
              _context2.next = 16;
              break;
            }

            throw "label is too long";

          case 16:
            if (!(metainfo.value_type === undefined || metainfo.value_type === null || metainfo.value_type === "")) {
              _context2.next = 18;
              break;
            }

            throw "value_type is empty";

          case 18:
            if (VALUE_TYPES.map(function (t) {
              return t.name;
            }).includes(metainfo.value_type)) {
              _context2.next = 20;
              break;
            }

            throw "value_type is invalid";

          case 20:

            metainfo.tenant_id = tenant_id;

            _context2.next = 23;
            return _MetaInfo2.default.findOne({ label: metainfo.label, tenant_id: tenant_id });

          case 23:
            _metainfo = _context2.sent;

            if (!(_metainfo !== null)) {
              _context2.next = 26;
              break;
            }

            throw "label is duplicate";

          case 26:
            __metainfo = new _MetaInfo2.default(metainfo);
            _context2.next = 29;
            return __metainfo.save();

          case 29:
            createdMetainfo = _context2.sent;


            res.json({
              status: { success: true },
              body: createdMetainfo
            });
            _context2.next = 58;
            break;

          case 33:
            _context2.prev = 33;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0;
            _context2.next = _context2.t1 === "name is empty" ? 39 : _context2.t1 === "name is too long" ? 41 : _context2.t1 === "name is duplicate" ? 43 : _context2.t1 === "label is empty" ? 45 : _context2.t1 === "label is too long" ? 47 : _context2.t1 === "label is duplicate" ? 49 : _context2.t1 === "value_type is invalid" ? 51 : _context2.t1 === "value_type is empty" ? 53 : 55;
            break;

          case 39:
            errors.name = "メタ情報名が空のためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 41:
            errors.name = "\u30E1\u30BF\u60C5\u5831\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E1\u30BF\u60C5\u5831\u306E\u767B\u9332\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context2.abrupt("break", 57);

          case 43:
            errors.name = "指定されたメタ情報名は既に登録されているためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 45:
            errors.label = "表示名が空のためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 47:
            errors.label = "\u8868\u793A\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u30E1\u30BF\u60C5\u5831\u306E\u767B\u9332\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context2.abrupt("break", 57);

          case 49:
            errors.label = "指定された表示名は既に登録されているためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 51:
            errors.value_type = "データ型が不正のためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 53:
            errors.value_type = "データ型が空のためメタ情報の登録に失敗しました";
            return _context2.abrupt("break", 57);

          case 55:
            errors = _context2.t0;
            return _context2.abrupt("break", 57);

          case 57:
            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の登録に失敗しました",
                errors: errors
              }
            });

          case 58:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 33]]);
  }));
};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var tenant_id, metainfo_id, metainfo, errors;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            tenant_id = res.user.tenant_id;
            metainfo_id = req.params.metainfo_id;

            if (!(metainfo_id === undefined || metainfo_id === null || metainfo_id === "")) {
              _context3.next = 5;
              break;
            }

            throw "metainfo_id is empty";

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(metainfo_id)) {
              _context3.next = 7;
              break;
            }

            throw "metainfo_id is invalid";

          case 7:
            _context3.next = 9;
            return _MetaInfo2.default.findById(metainfo_id);

          case 9:
            metainfo = _context3.sent;

            if (!(metainfo == null)) {
              _context3.next = 12;
              break;
            }

            throw "metainfo is empty";

          case 12:
            if (!(metainfo.tenant_id.toString() !== tenant_id.toString())) {
              _context3.next = 14;
              break;
            }

            throw "tenant_id is diffrent";

          case 14:

            res.json({
              status: { success: true },
              body: (0, _extends3.default)({}, metainfo.toObject())
            });

            _context3.next = 32;
            break;

          case 17:
            _context3.prev = 17;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0;
            _context3.next = _context3.t1 === "metainfo_id is invalid" ? 23 : _context3.t1 === "metainfo_id is empty" ? 25 : _context3.t1 === "metainfo is empty" ? 27 : 29;
            break;

          case 23:
            errors.metainfo_id = "メタ情報IDが不正のためメタ情報の取得に失敗しました";
            return _context3.abrupt("break", 31);

          case 25:
            errors.metainfo_id = _context3.t0;
            return _context3.abrupt("break", 31);

          case 27:
            errors.metainfo = _context3.t0;
            return _context3.abrupt("break", 31);

          case 29:
            errors.unknown = _context3.t0;
            return _context3.abrupt("break", 31);

          case 31:

            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の取得に失敗しました",
                errors: errors
              }
            });

          case 32:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 17]]);
  }));
};

var updateLabel = exports.updateLabel = function updateLabel(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var tenant_id, metainfo_id, label, metainfo, duplicateCheck, changedMetainfo, errors;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            tenant_id = res.user.tenant_id;
            metainfo_id = req.params.metainfo_id;
            label = req.body.label;

            if (!(label === null || label === undefined || label === "")) {
              _context4.next = 6;
              break;
            }

            throw "label is empty";

          case 6:
            if (!(label.length >= constants.MAX_STRING_LENGTH)) {
              _context4.next = 8;
              break;
            }

            throw "label is too long";

          case 8:
            _context4.next = 10;
            return _MetaInfo2.default.findById(metainfo_id);

          case 10:
            metainfo = _context4.sent;

            if (!(metainfo === null)) {
              _context4.next = 13;
              break;
            }

            throw "metainfo not found";

          case 13:
            if (!(metainfo.tenant_id.toString() !== tenant_id.toString())) {
              _context4.next = 15;
              break;
            }

            throw "tenant_id is diffrent";

          case 15:
            _context4.next = 17;
            return _MetaInfo2.default.findOne({ label: label, tenant_id: tenant_id });

          case 17:
            duplicateCheck = _context4.sent;

            if (!(duplicateCheck !== null)) {
              _context4.next = 20;
              break;
            }

            throw "label is duplicate";

          case 20:

            metainfo.label = label;
            _context4.next = 23;
            return metainfo.save();

          case 23:
            changedMetainfo = _context4.sent;


            res.json({
              status: { success: true },
              body: changedMetainfo
            });

            _context4.next = 42;
            break;

          case 27:
            _context4.prev = 27;
            _context4.t0 = _context4["catch"](0);
            errors = {};
            _context4.t1 = _context4.t0;
            _context4.next = _context4.t1 === "label is empty" ? 33 : _context4.t1 === "label is too long" ? 35 : _context4.t1 === "label is duplicate" ? 37 : 39;
            break;

          case 33:
            errors.label = "表示名が空です";
            return _context4.abrupt("break", 41);

          case 35:
            errors.label = "\u8868\u793A\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u8868\u793A\u540D\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context4.abrupt("break", 41);

          case 37:
            errors.label = "指定された表示名は既に登録されているため表示名の更新に失敗しました";
            return _context4.abrupt("break", 41);

          case 39:
            errors.unknown = _context4.t0;
            return _context4.abrupt("break", 41);

          case 41:

            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の表示名更新に失敗しました",
                errors: errors
              }
            });

          case 42:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 27]]);
  }));
};

var updateName = exports.updateName = function updateName(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var tenant_id, metainfo_id, name, metainfo, duplicateCheck, changedMetainfo, errors;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            tenant_id = res.user.tenant_id;
            metainfo_id = req.params.metainfo_id;
            name = req.body.name;

            if (!(name === null || name === undefined || name === "")) {
              _context5.next = 6;
              break;
            }

            throw "name is empty";

          case 6:
            if (!(name.length >= constants.MAX_STRING_LENGTH)) {
              _context5.next = 8;
              break;
            }

            throw "name is too long";

          case 8:
            _context5.next = 10;
            return _MetaInfo2.default.findById(metainfo_id);

          case 10:
            metainfo = _context5.sent;

            if (!(metainfo === null)) {
              _context5.next = 13;
              break;
            }

            throw "metainfo not found";

          case 13:
            if (!(metainfo.tenant_id.toString() !== tenant_id.toString())) {
              _context5.next = 15;
              break;
            }

            throw "tenant_id is diffrent";

          case 15:
            _context5.next = 17;
            return _MetaInfo2.default.findOne({ name: name, tenant_id: tenant_id });

          case 17:
            duplicateCheck = _context5.sent;

            if (!(duplicateCheck !== null)) {
              _context5.next = 20;
              break;
            }

            throw "name is duplicate";

          case 20:

            metainfo.name = name;
            _context5.next = 23;
            return metainfo.save();

          case 23:
            changedMetainfo = _context5.sent;


            res.json({
              status: { success: true },
              body: changedMetainfo
            });

            _context5.next = 42;
            break;

          case 27:
            _context5.prev = 27;
            _context5.t0 = _context5["catch"](0);
            errors = {};
            _context5.t1 = _context5.t0;
            _context5.next = _context5.t1 === "name is empty" ? 33 : _context5.t1 === "name is too long" ? 35 : _context5.t1 === "name is duplicate" ? 37 : 39;
            break;

          case 33:
            errors.name = "表示名が空です";
            return _context5.abrupt("break", 41);

          case 35:
            errors.name = "\u8868\u793A\u540D\u304C\u898F\u5B9A\u6587\u5B57\u6570(" + constants.MAX_STRING_LENGTH + ")\u3092\u8D85\u904E\u3057\u305F\u305F\u3081\u8868\u793A\u540D\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
            return _context5.abrupt("break", 41);

          case 37:
            errors.name = "指定された表示名は既に登録されているため表示名の更新に失敗しました";
            return _context5.abrupt("break", 41);

          case 39:
            errors.unknown = _context5.t0;
            return _context5.abrupt("break", 41);

          case 41:

            res.status(400).json({
              status: {
                success: false,
                message: "メタ情報の表示名更新に失敗しました",
                errors: errors
              }
            });

          case 42:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 27]]);
  }));
};

var valueType = exports.valueType = function valueType(req, res, next) {
  res.json({
    status: {
      seccusee: true,
      value_type: VALUE_TYPES
    }
  });
};