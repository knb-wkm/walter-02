"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.image = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _logger = require("../logger");

var _Preview = require("../models/Preview");

var _Preview2 = _interopRequireDefault(_Preview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var image = exports.image = function image(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var preview_id, preview;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            preview_id = req.params.preview_id;
            _context.next = 4;
            return _Preview2.default.findById(preview_id);

          case 4:
            preview = _context.sent;


            res.json({
              status: { success: true },
              body: preview.image.buffer.toString("base64")
            });

            _context.next = 12;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);

            _logger.logger.error(_context.t0);
            res.status(404).send('Not Found');

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
};

// models