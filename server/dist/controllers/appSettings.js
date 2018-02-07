"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _AppSetting = require("../models/AppSetting");

var _AppSetting2 = _interopRequireDefault(_AppSetting);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var tenant_id, tenant, settings;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            tenant_id = res.user.tenant_id;
            _context.next = 4;
            return _Tenant2.default.findById(tenant_id);

          case 4:
            tenant = _context.sent;

            if (!(tenant === null)) {
              _context.next = 7;
              break;
            }

            throw new Error("指定されたテナントが存在しないため設定の取得に失敗しました");

          case 7:
            _context.next = 9;
            return _AppSetting2.default.find({ tenant_id: tenant._id });

          case 9:
            settings = _context.sent;


            res.json({
              status: { success: true },
              body: settings
            });
            _context.next = 16;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](0);

            res.status(400).json({
              status: { success: false }
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 13]]);
  }));
};