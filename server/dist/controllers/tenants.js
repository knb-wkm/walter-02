"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.view = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Tenant = require("../models/Tenant");

var _Tenant2 = _interopRequireDefault(_Tenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var tenant_id, tenant, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            tenant_id = req.params.tenant_id;

            if (!(tenant_id === null || tenant_id === undefined || tenant_id === "")) {
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

            res.json({
              status: { success: true },
              body: tenant
            });
            _context.next = 25;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            errors = {};
            _context.t1 = _context.t0;
            _context.next = _context.t1 === "tenant_id is empty" ? 18 : _context.t1 === "tenant is empty" ? 20 : 22;
            break;

          case 18:
            errors.tenant_id = _context.t0;
            return _context.abrupt("break", 24);

          case 20:
            errors.tenant = _context.t0;
            return _context.abrupt("break", 24);

          case 22:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 24);

          case 24:

            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 12]]);
  }));
};