"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _elasticsearch = require("elasticsearch");

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _server = require("../configs/server");

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _constants = require("../configs/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mode = process.env.NODE_ENV;

var erasticsearchUrl = void 0;
var erasticsearchErrorLevel = void 0;

switch (mode) {

  case "integration":
    erasticsearchUrl = _server.ELASTICSEARCH_CONF.integration.host + ":" + _server.ELASTICSEARCH_CONF.integration.port;
    erasticsearchErrorLevel = _server.ELASTICSEARCH_CONF.integration.logLevel;
    break;

  case "production":
    if (!process.env.ELASTIC_HOST_NAME) throw new Error("env.ELASTIC_HOST_NAME is not set");

    erasticsearchUrl = _server.ELASTICSEARCH_CONF.production.host + ":" + _server.ELASTICSEARCH_CONF.production.port;
    erasticsearchErrorLevel = _server.ELASTICSEARCH_CONF.production.logLevel;
    break;

  default:
    erasticsearchUrl = _server.ELASTICSEARCH_CONF.development.host + ":" + _server.ELASTICSEARCH_CONF.development.port;
    erasticsearchErrorLevel = _server.ELASTICSEARCH_CONF.development.logLevel;
    break;
}

var esClient = new _elasticsearch2.default.Client({
  host: erasticsearchUrl,
  log: erasticsearchErrorLevel,
  timeout: _constants.ELASTIC_INDEXING_TIMEOUT
});

esClient.createIndex = _co2.default.wrap( /*#__PURE__*/_regenerator2.default.mark(function _callee(tenant_id, files) {
  var bulkBody, result;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          bulkBody = [];

          files.forEach(function (file) {
            bulkBody.push({
              index: {
                _index: tenant_id,
                _type: "files",
                _id: file._id
              }
            });
            var esFile = {
              _id: file._id,
              name: file.name,
              mime_type: file.mime_type,
              size: file.size,
              is_dir: file.is_dir,
              dir_id: file.dir_id,
              is_display: file.is_display,
              is_star: file.is_star,
              is_trash: file.is_trash,
              is_crypted: file.is_crypted,
              is_deleted: file.is_deleted,
              // modified: file.modified,
              preview_id: file.preview_id,
              sort_target: file.sort_target,
              unvisible: file.unvisible
            };

            file.meta_infos.forEach(function (meta) {
              esFile[meta._id.toString()] = meta.value;
            });

            // タグ検索(2018-01-05:マスタ更新に対応できないのでコメントアウト)
            // file.tags.forEach(tag => {
            //   esFile[tag._id.toString()] = tag.label;
            // });

            esFile.actions = {};

            // 簡易検索でユーザ名で検索するためユーザ名を文字列として保持する(2018-01-05:マスタ更新に対応できないのでコメントアウト)
            // esFile.users = "";

            // 詳細検索ではuser._idで引き当てたい
            file.authorities.forEach(function (authority, index) {
              authority.actions.forEach(function (action, idx) {
                if (esFile.actions[action._id] === undefined) esFile.actions[action._id] = [];
                esFile.actions[action._id].push(authority.users._id);
              });
              // esFile.users += (esFile.users==="" ? "": " ") + authority.users.name;
            });
            bulkBody.push({
              file: esFile
            });
          });

          _context.next = 5;
          return esClient.bulk({ refresh: "true", body: bulkBody });

        case 5:
          result = _context.sent;

          if (!result.errors) {
            _context.next = 8;
            break;
          }

          throw result.items[0].index;

        case 8:
          return _context.abrupt("return", Promise.resolve(result));

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", Promise.reject(_context.t0));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this, [[0, 11]]);
}));

exports.default = esClient;