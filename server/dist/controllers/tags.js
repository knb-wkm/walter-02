"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeColor = exports.changeLabel = exports.remove = exports.create = exports.view = exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _Tag = require("../models/Tag");

var _Tag2 = _interopRequireDefault(_Tag);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

var _AppError = require("../errors/AppError");

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// etc
var ObjectId = _mongoose2.default.Types.ObjectId;

// constants
var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var q, conditions, tags, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            q = req.query.q;
            conditions = void 0;

            if (q) {
              conditions = {
                $and: [{ label: new RegExp(q, "i") }],
                $or: [{ tenant_id: res.user.tenant_id }, { user_id: res.user._id }]
              };
            } else {
              conditions = {
                $or: [{ tenant_id: res.user.tenant_id }, { user_id: res.user._id }]
              };
            }

            _context.next = 6;
            return _Tag2.default.find(conditions);

          case 6:
            tags = _context.sent;

            res.json({
              status: { success: true },
              body: tags
            });
            _context.next = 15;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](0);
            errors = {};

            errors.unknown = _context.t0;

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 10]]);
  }));
};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var tag_id, tag, errors;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            tag_id = req.params.tag_id;

            if (!(tag_id === undefined || tag_id === null || tag_id === "")) {
              _context2.next = 4;
              break;
            }

            throw new _AppError.ValidationError("tag_id is empty");

          case 4:
            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context2.next = 6;
              break;
            }

            throw new _AppError.ValidationError("tag_id is not valid");

          case 6:
            _context2.next = 8;
            return _Tag2.default.findById(req.params.tag_id);

          case 8:
            tag = _context2.sent;

            if (!(tag === null)) {
              _context2.next = 11;
              break;
            }

            throw new _AppError.RecordNotFoundException("tag is empty");

          case 11:

            res.json({
              status: { success: true },
              body: tag
            });
            _context2.next = 30;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](0);
            errors = {};
            _context2.t1 = _context2.t0.message;
            _context2.next = _context2.t1 === "tag_id is not valid" ? 20 : _context2.t1 === "tag_id is empty" ? 22 : _context2.t1 === "tag is empty" ? 24 : 26;
            break;

          case 20:
            errors.tag_id = "タグIDが不正なためタグの取得に失敗しました";
            return _context2.abrupt("break", 28);

          case 22:
            errors.tag_id = "タグIDが空のためタグの取得に失敗しました";
            return _context2.abrupt("break", 28);

          case 24:
            errors.tag = "指定されたタグが存在しないためタグの取得に失敗しました";
            return _context2.abrupt("break", 28);

          case 26:
            errors.unknown = _context2.t0;
            return _context2.abrupt("break", 28);

          case 28:
            _logger2.default.error(errors);
            res.status(400).json({
              status: {
                success: false,
                message: "タグの取得に失敗しました",
                errors: errors
              }
            });

          case 30:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 14]]);
  }));
};

var create = exports.create = function create(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var tag, _tag, newTag, createdTag, errors;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            tag = req.body.tag;

            if (!(tag.label === undefined || tag.label === null || tag.label === "")) {
              _context3.next = 4;
              break;
            }

            throw new _AppError.ValidationError("label is empty");

          case 4:
            if (!(tag.label.length > constants.MAX_STRING_LENGTH)) {
              _context3.next = 6;
              break;
            }

            throw new _AppError.ValidationError("label is too long");

          case 6:
            if (!(tag.color === undefined || tag.color === null || tag.color === "")) {
              _context3.next = 8;
              break;
            }

            throw new _AppError.ValidationError("color is empty");

          case 8:
            if (!(tag.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) === null)) {
              _context3.next = 10;
              break;
            }

            throw new _AppError.ValidationError("color is not valid");

          case 10:
            _context3.next = 12;
            return _Tag2.default.find({ label: tag.label }, { tenant_id: res.user.tenant_id }).count();

          case 12:
            _tag = _context3.sent;

            if (!(_tag > 0)) {
              _context3.next = 15;
              break;
            }

            throw new _AppError.ValidationError("label is a duplicate");

          case 15:
            newTag = new _Tag2.default();

            newTag.label = tag.label;
            newTag.color = tag.color;
            newTag.tenant_id = ObjectId(res.user.tenant_id);

            _context3.next = 21;
            return newTag.save();

          case 21:
            createdTag = _context3.sent;


            res.json({
              status: { success: true },
              body: createdTag
            });
            _context3.next = 45;
            break;

          case 25:
            _context3.prev = 25;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0.message;
            _context3.next = _context3.t1 === "label is empty" ? 31 : _context3.t1 === "color is empty" ? 33 : _context3.t1 === "label is too long" ? 35 : _context3.t1 === "label is a duplicate" ? 37 : _context3.t1 === "color is not valid" ? 39 : 41;
            break;

          case 31:
            errors.label = "タグ名が空です";
            return _context3.abrupt("break", 43);

          case 33:
            errors.color = "色が空です";
            return _context3.abrupt("break", 43);

          case 35:
            errors.label = 'タグ名が長すぎます';
            return _context3.abrupt("break", 43);

          case 37:
            errors.label = "そのタグ名は既に使用されています";
            return _context3.abrupt("break", 43);

          case 39:
            errors.color = "色は16進数で指定してください";
            return _context3.abrupt("break", 43);

          case 41:
            errors.unknown = _context3.t0;
            return _context3.abrupt("break", 43);

          case 43:
            _logger2.default.error(_context3.t0);
            res.status(400).json({
              status: {
                success: false,
                message: "タグの登録に失敗しました",
                errors: errors
              }
            });

          case 45:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 25]]);
  }));
};

var remove = exports.remove = function remove(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var tag_id, tag, deletedTag, errors;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            tag_id = req.params.tag_id;

            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context4.next = 4;
              break;
            }

            throw new _AppError.ValidationError("tag_id is not valid");

          case 4:
            _context4.next = 6;
            return _Tag2.default.findById(tag_id);

          case 6:
            tag = _context4.sent;

            if (!(tag === null)) {
              _context4.next = 9;
              break;
            }

            throw new _AppError.RecordNotFoundException("tag is empty");

          case 9:
            _context4.next = 11;
            return tag.remove();

          case 11:
            deletedTag = _context4.sent;

            res.json({
              status: { success: true },
              body: deletedTag
            });
            _context4.next = 28;
            break;

          case 15:
            _context4.prev = 15;
            _context4.t0 = _context4["catch"](0);
            errors = {};
            _context4.t1 = _context4.t0.message;
            _context4.next = _context4.t1 === "tag_id is not valid" ? 21 : _context4.t1 === "tag is empty" ? 23 : 25;
            break;

          case 21:
            errors.tag_id = "タグIDが不正なためタグの取得に失敗しました";
            return _context4.abrupt("break", 27);

          case 23:
            errors.tag = "指定されたタグが存在しないためタグの取得に失敗しました";
            return _context4.abrupt("break", 27);

          case 25:
            errors.unknown = _context4.t0;
            return _context4.abrupt("break", 27);

          case 27:

            res.status(400).json({
              status: { success: false,
                message: "タグの削除に失敗しました",
                errors: errors }
            });

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 15]]);
  }));
};

var changeLabel = exports.changeLabel = function changeLabel(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var tag_id, label, _tag, tag, changedTag, errors;

    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            tag_id = req.params.tag_id;
            label = req.body.label;

            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context5.next = 5;
              break;
            }

            throw new _AppError.ValidationError("tag_id is not valid");

          case 5:
            if (!(label === undefined || label === null || label === "")) {
              _context5.next = 7;
              break;
            }

            throw new _AppError.ValidationError("label is empty");

          case 7:
            if (!(label.length > constants.MAX_STRING_LENGTH)) {
              _context5.next = 9;
              break;
            }

            throw new _AppError.ValidationError("lable is too long");

          case 9:
            _context5.next = 11;
            return _Tag2.default.find({ label: label }, { tenant_id: res.user.tenant_id }).count();

          case 11:
            _tag = _context5.sent;

            if (!(_tag > 0)) {
              _context5.next = 14;
              break;
            }

            throw new _AppError.ValidationError("label is a duplicate");

          case 14:
            _context5.next = 16;
            return _Tag2.default.findById(tag_id);

          case 16:
            tag = _context5.sent;

            if (!(tag === null)) {
              _context5.next = 19;
              break;
            }

            throw new _AppError.RecordNotFoundException("tag is empty");

          case 19:

            tag.label = label;
            _context5.next = 22;
            return tag.save();

          case 22:
            changedTag = _context5.sent;


            res.json({
              status: { success: true },
              body: changedTag
            });
            _context5.next = 46;
            break;

          case 26:
            _context5.prev = 26;
            _context5.t0 = _context5["catch"](0);
            errors = {};
            _context5.t1 = _context5.t0.message;
            _context5.next = _context5.t1 === "tag_id is not valid" ? 32 : _context5.t1 === "label is empty" ? 34 : _context5.t1 === "lable is too long" ? 36 : _context5.t1 === "label is a duplicate" ? 38 : _context5.t1 === "tag is empty" ? 40 : 42;
            break;

          case 32:
            errors.tag_id = "タグIDが不正なためタグ名の変更に失敗しました";
            return _context5.abrupt("break", 44);

          case 34:
            errors.label = "タグ名が空です";
            return _context5.abrupt("break", 44);

          case 36:
            errors.label = "\u30BF\u30B0\u540D\u304C\u9577\u3059\u304E\u307E\u3059";
            return _context5.abrupt("break", 44);

          case 38:
            errors.label = "そのタグ名は既に使用されています";
            return _context5.abrupt("break", 44);

          case 40:
            errors.tag = "指定されたタグが存在しないためタグ名の変更に失敗しました";
            return _context5.abrupt("break", 44);

          case 42:
            errors.unknown = _context5.t0;
            return _context5.abrupt("break", 44);

          case 44:
            _logger2.default.error(_context5.t0);
            res.status(400).json({
              status: {
                success: false,
                message: "タグ名の変更に失敗しました",
                errors: errors }
            });

          case 46:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 26]]);
  }));
};

var changeColor = exports.changeColor = function changeColor(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
    var tag_id, color, tag, changedTag, errors;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            tag_id = req.params.tag_id;
            color = req.body.color;

            if (!(color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) === null)) {
              _context6.next = 5;
              break;
            }

            throw new _AppError.ValidationError("color is not valid");

          case 5:
            if (_mongoose2.default.Types.ObjectId.isValid(tag_id)) {
              _context6.next = 7;
              break;
            }

            throw new _AppError.ValidationError("tag_id is not valid");

          case 7:
            _context6.next = 9;
            return _Tag2.default.findById(tag_id);

          case 9:
            tag = _context6.sent;

            if (!(tag === null)) {
              _context6.next = 12;
              break;
            }

            throw new _AppError.RecordNotFoundException("tag is empty");

          case 12:

            tag.color = color;
            _context6.next = 15;
            return tag.save();

          case 15:
            changedTag = _context6.sent;


            res.json({
              status: { success: true },
              body: changedTag
            });
            _context6.next = 33;
            break;

          case 19:
            _context6.prev = 19;
            _context6.t0 = _context6["catch"](0);
            errors = {};
            _context6.t1 = _context6.t0.message;
            _context6.next = _context6.t1 === "tag_id is not valid" ? 25 : _context6.t1 === "tag is empty" ? 27 : _context6.t1 === "color is not valid" ? 29 : 30;
            break;

          case 25:
            errors.tag_id = "タグIDが不正なため色の登録に失敗しました";
            return _context6.abrupt("break", 32);

          case 27:
            errors.tag = "指定されたタグが存在しないため色の登録に失敗しました";
            return _context6.abrupt("break", 32);

          case 29:
            errors.color = "色は16進数で指定してください";

          case 30:
            errors.unknown = _context6.t0;
            return _context6.abrupt("break", 32);

          case 32:

            res.status(400).json({
              status: {
                success: false,
                message: "色の登録に失敗しました",
                errors: errors }
            });

          case 33:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[0, 19]]);
  }));
};