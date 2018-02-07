"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchDetail = exports.search = exports.index = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _express = require("express");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _exceljs = require("exceljs");

var _exceljs2 = _interopRequireDefault(_exceljs);

var _lodash = require("lodash");

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _files = require("./files");

var filesController = _interopRequireWildcard(_files);

var _displayItems = require("./displayItems");

var displayItemsController = _interopRequireWildcard(_displayItems);

var _Tag = require("../models/Tag");

var _Tag2 = _interopRequireDefault(_Tag);

var _RoleFile = require("../models/RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// models


// controllers
var router = (0, _express.Router)();

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var files, displayItems, tags, roles, readStream, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return filesController.index(req, res, next, true, true);

          case 3:
            files = _context.sent;
            _context.next = 6;
            return displayItemsController.excel(req, res, next, true);

          case 6:
            displayItems = _context.sent;
            _context.next = 9;
            return _Tag2.default.find({
              $or: [{ tenant_id: res.user.tenant_id }, { user_id: res.user._id }]
            });

          case 9:
            tags = _context.sent;
            _context.next = 12;
            return _RoleFile2.default.find({ tenant_id: res.user.tenant_id });

          case 12:
            roles = _context.sent;
            _context.next = 15;
            return exportExcelBook(displayItems, tags, roles, files);

          case 15:
            readStream = _context.sent;


            _fs2.default.createReadStream(readStream.path).on("data", function (data) {
              return res.write(data);
            }).on("end", function () {
              return res.end();
            });
            _context.next = 29;
            break;

          case 19:
            _context.prev = 19;
            _context.t0 = _context["catch"](0);

            // TODO: エラー処理を追加する
            errors = {};
            _context.t1 = _context.t0;
            _context.next = 25;
            break;

          case 25:
            errors.unknown = _context.t0;
            return _context.abrupt("break", 27);

          case 27:
            _logger2.default.info(_context.t0);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 19]]);
  }));
};

var search = exports.search = function search(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var files, displayItems, tags, roles, readStream, errors;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return filesController.search(req, res, next, true);

          case 3:
            files = _context2.sent;
            _context2.next = 6;
            return displayItemsController.excel(req, res, next, true);

          case 6:
            displayItems = _context2.sent;
            _context2.next = 9;
            return _Tag2.default.find({
              $or: [{ tenant_id: res.user.tenant_id }, { user_id: res.user._id }]
            });

          case 9:
            tags = _context2.sent;
            _context2.next = 12;
            return _RoleFile2.default.find({ tenant_id: res.user.tenant_id });

          case 12:
            roles = _context2.sent;
            _context2.next = 15;
            return exportExcelBook(displayItems, tags, roles, files);

          case 15:
            readStream = _context2.sent;

            _fs2.default.createReadStream(readStream.path).on("data", function (data) {
              return res.write(data);
            }).on("end", function () {
              return res.end();
            });
            _context2.next = 29;
            break;

          case 19:
            _context2.prev = 19;
            _context2.t0 = _context2["catch"](0);

            // TODO: エラー処理を追加する
            errors = {};
            _context2.t1 = _context2.t0;
            _context2.next = 25;
            break;

          case 25:
            errors.unknown = _context2.t0;
            return _context2.abrupt("break", 27);

          case 27:
            _logger2.default.info(_context2.t0);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 19]]);
  }));
};

var searchDetail = exports.searchDetail = function searchDetail(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var files, displayItems, tags, roles, readStream, errors;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return filesController.searchDetail(req, res, next, true);

          case 3:
            files = _context3.sent;
            _context3.next = 6;
            return displayItemsController.excel(req, res, next, true);

          case 6:
            displayItems = _context3.sent;
            _context3.next = 9;
            return _Tag2.default.find({
              $or: [{ tenant_id: res.user.tenant_id }, { user_id: res.user._id }]
            });

          case 9:
            tags = _context3.sent;
            _context3.next = 12;
            return _RoleFile2.default.find({ tenant_id: res.user.tenant_id });

          case 12:
            roles = _context3.sent;
            _context3.next = 15;
            return exportExcelBook(displayItems, tags, roles, files);

          case 15:
            readStream = _context3.sent;

            _fs2.default.createReadStream(readStream.path).on("data", function (data) {
              return res.write(data);
            }).on("end", function () {
              return res.end();
            });
            _context3.next = 29;
            break;

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](0);

            // TODO: エラー処理を追加する
            errors = {};
            _context3.t1 = _context3.t0;
            _context3.next = 25;
            break;

          case 25:
            errors.unknown = _context3.t0;
            return _context3.abrupt("break", 27);

          case 27:
            _logger2.default.info(_context3.t0);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 29:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 19]]);
  }));
};
// private ---
var exportExcelBook = _co2.default.wrap( /*#__PURE__*/_regenerator2.default.mark(function _callee4(displayItems, tags, roles, files) {
  var workbook, worksheet, fill_styles_header, fill_color, fill_styles_body_odd, fill_styles_body_even, cel_width, headers, header_tags, header_authority, column, j, col, fill_style, i, line, _loop, _j, stream;

  return _regenerator2.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          workbook = new _exceljs2.default.Workbook();
          worksheet = workbook.addWorksheet('ファイル一覧');
          fill_styles_header = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'CCCCCC' }
          };
          fill_color = {
            default: 'CCCCCC',
            meta: 'CCCCCC',
            tag: 'CCCCCC',
            role: '8ee0ea'
          };
          fill_styles_body_odd = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffffff' }
          };
          fill_styles_body_even = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'EFEFEF' }
          };
          cel_width = 20;
          headers = displayItems.filter(function (item) {
            return item.name !== 'file_checkbox' && item.name !== 'action' && item.name !== "authorities" && item.name !== "tag";
          }).map(function (item) {
            if (item.meta_info_id === null) {
              return {
                name: item.name,
                label: item.label,
                type: "default"
              };
            } else {
              return {
                name: item.name,
                label: item.label,
                meta_info_id: item.meta_info_id,
                type: "meta"
              };
            }
          });
          header_tags = [];
          // tagが出力対象の場合

          if ((0, _lodash.findIndex)(displayItems, { name: "tag" }) >= 0) {

            header_tags = tags.map(function (tag) {

              var color = tag.color.replace('#', '');
              if (color.length === 3) {
                color = color.replace(/([0-9a-zA-Z])([0-9a-zA-Z])([0-9a-zA-Z])/g, "$1$1$2$2$3$3");
              }
              return {
                name: "tags",
                label: tag.label,
                type: "tag",
                tag_id: tag._id,
                color: color
              };
            });
          }
          // console.log(roles);
          header_authority = [];

          if ((0, _lodash.findIndex)(displayItems, { name: "authorities" }) >= 0) {
            header_authority = roles.map(function (role) {
              return {
                name: "roles",
                label: role.name,
                type: "role",
                role_id: role._id
              };
            });
          }

          column = [].concat((0, _toConsumableArray3.default)(headers), (0, _toConsumableArray3.default)(header_authority), (0, _toConsumableArray3.default)(header_tags));
          // console.log(column);
          // header

          for (j = 0; j < column.length; j++) {
            col = j + 1;

            worksheet.getCell(1, col).value = column[j].label;
            fill_style = {
              type: fill_styles_header.type,
              pattern: fill_styles_header.pattern,
              fgColor: column[j].type === "tag" ? { argb: column[j].color } : { argb: fill_color[column[j].type] }
            };

            worksheet.getCell(1, col).fill = fill_style;
            worksheet.getCell(1, col).border = { bottom: { style: "thin" } };
            worksheet.getColumn(col).width = cel_width;
            worksheet.getCell(1, col).alignment = { vertical: 'middle', horizontal: 'center' };
          }

          // body
          for (i = 0; i < files.length; i++) {
            line = i + 2;

            _loop = function _loop(_j) {
              var value = "";

              switch (column[_j].type) {
                case "meta":
                  var meta = (0, _lodash.find)(files[i].meta_infos, { _id: column[_j].meta_info_id });
                  value = meta === undefined ? "" : meta.value;
                  break;
                case "tag":
                  value = (0, _lodash.findIndex)(files[i].tags, { _id: column[_j].tag_id }) >= 0 ? "○" : "";
                  break;
                case "role":
                  var file_role = files[i].authorities.filter(function (authority) {
                    return authority.role_files._id.toString() === column[_j].role_id.toString();
                  }).map(function (authority) {
                    return authority.users.name;
                  }).join();
                  value = file_role;
                  break;
                default:
                  value = (0, _lodash.get)(files[i], column[_j].name);
                  break;
              }

              if (column[_j].name === "dir_route" && value === "") value = "Top";

              var col = _j + 1;
              worksheet.getCell(line, col).value = value;
              worksheet.getCell(line, col).fill = line % 2 === 0 ? fill_styles_body_even : fill_styles_body_odd;
            };

            for (_j = 0; _j < column.length; _j++) {
              _loop(_j);
            }
          }

          //出力
          stream = _fs2.default.createWriteStream("/tmp/stream.tmp");
          _context4.next = 18;
          return workbook.xlsx.write(stream);

        case 18:
          return _context4.abrupt("return", stream);

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, this);
}));