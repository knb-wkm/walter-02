"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LIBRE_OFFICE_PATH = exports.CONVERT_DPI = exports.ELASTIC_INDEXING_TIMEOUT = exports.ELASTIC_CONNECTION_TIMEOUT = exports.ELASTIC_CONNECTION_RETRY = exports.ELASTIC_CONNECTION_INTERVAL = exports.SWIFT_CONNECTION_RETRY = exports.SWIFT_CONNECTION_INTERVAL = exports.MONGO_CONNECTION_RETRY = exports.MONGO_CONNECTION_INTERVAL = exports.PERMISSION_ANALYSIS = exports.PERMISSION_ROLE_MENUS = exports.PERMISSION_ROLE_FILES = exports.PERMISSION_TAGS = exports.PERMISSION_USERS = exports.PERMISSION_FILES = exports.PERMISSION_HOME = exports.PERMISSION_GROUPS = exports.PERMISSION_META_INFOS = exports.PERMISSION_AUTHORITY = exports.PERMISSION_REVERT = exports.PERMISSION_DELETE = exports.PERMISSION_RESTORE = exports.PERMISSION_COPY = exports.PERMISSION_MOVE = exports.PERMISSION_MAKE_DIR = exports.PERMISSION_UPLOAD = exports.PERMISSION_CHANGE_META_INFO = exports.PERMISSION_CHANGE_TAG = exports.PERMISSION_CHANGE_NAME = exports.PERMISSION_DOWNLOAD = exports.PERMISSION_VIEW_HISTORY = exports.PERMISSION_VIEW_DETAIL = exports.PERMISSION_VIEW_LIST = exports.ILLIGAL_CHARACTERS = exports.LOGGER_CONFIG = exports.MAX_CREATE_PREVIEW_FILE_SIZE = exports.MAX_EMAIL_LENGTH = exports.MAX_STRING_LENGTH = exports.INFOMATION_LIMITS_PER_PAGE = exports.USE_CRYPTO = exports.CRYPTO_PASSWORD = exports.FILE_LIMITS_PER_PAGE = undefined;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ファイル一覧 1pageあたりの件数
var FILE_LIMITS_PER_PAGE = exports.FILE_LIMITS_PER_PAGE = 30;

// ファイル暗号化設定
var CRYPTO_PASSWORD = exports.CRYPTO_PASSWORD = "mGjQB5F57C+W";
var USE_CRYPTO = exports.USE_CRYPTO = false;

// お知らせの取得件数
var INFOMATION_LIMITS_PER_PAGE = exports.INFOMATION_LIMITS_PER_PAGE = 5;

// label等の文字列最大長さ
var MAX_STRING_LENGTH = exports.MAX_STRING_LENGTH = 255;

// email addressの制限文字数
var MAX_EMAIL_LENGTH = exports.MAX_EMAIL_LENGTH = 64;

// preview 画像作成の最大ファイルサイズ
var MAX_CREATE_PREVIEW_FILE_SIZE = exports.MAX_CREATE_PREVIEW_FILE_SIZE = 32212254720;

// loggerの設定
var LOGGER_CONFIG = exports.LOGGER_CONFIG = {
  appenders: {
    default: {
      type: "dateFile",
      filename: "logs/app.log",
      pattern: "-yyyy-MM-dd",
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] %h - %m"
      }
    },
    production: {
      type: "dateFile",
      filename: "logs/app.log",
      pattern: "-yyyy-MM-dd",
      layout: {
        type: "pattern",
        pattern: "[%d] [%p] %h - %m"
      }
    }
  },
  categories: {
    default: {
      appenders: ['default'],
      level: 'ALL'
    },
    production: {
      appenders: ['production'],
      level: 'ALL'
    }
  }
};

// 禁止文字一覧
// 使い方: string.match( new RegExp(ILLIGAL_CHARACTERS.join("|")))
var ILLIGAL_CHARACTERS = exports.ILLIGAL_CHARACTERS = ["\\\\", "\\/", "\\:", "\\*", "\\?", "\\<", "\\>", "\\|"];

// 権限(file)
var PERMISSION_VIEW_LIST = exports.PERMISSION_VIEW_LIST = "list";
var PERMISSION_VIEW_DETAIL = exports.PERMISSION_VIEW_DETAIL = "detail";
var PERMISSION_VIEW_HISTORY = exports.PERMISSION_VIEW_HISTORY = "history";
var PERMISSION_DOWNLOAD = exports.PERMISSION_DOWNLOAD = "download";
var PERMISSION_CHANGE_NAME = exports.PERMISSION_CHANGE_NAME = "change-name";
var PERMISSION_CHANGE_TAG = exports.PERMISSION_CHANGE_TAG = "change-tag";
var PERMISSION_CHANGE_META_INFO = exports.PERMISSION_CHANGE_META_INFO = "change-meta-info";
var PERMISSION_UPLOAD = exports.PERMISSION_UPLOAD = "upload";
var PERMISSION_MAKE_DIR = exports.PERMISSION_MAKE_DIR = "makedir";
var PERMISSION_MOVE = exports.PERMISSION_MOVE = "move";
var PERMISSION_COPY = exports.PERMISSION_COPY = "copy";
var PERMISSION_RESTORE = exports.PERMISSION_RESTORE = "restore";
var PERMISSION_DELETE = exports.PERMISSION_DELETE = "delete";
var PERMISSION_REVERT = exports.PERMISSION_REVERT = "revert";
var PERMISSION_AUTHORITY = exports.PERMISSION_AUTHORITY = "authority";

// 権限(menu)
var PERMISSION_META_INFOS = exports.PERMISSION_META_INFOS = "meta_infos";
var PERMISSION_GROUPS = exports.PERMISSION_GROUPS = "groups";
var PERMISSION_HOME = exports.PERMISSION_HOME = "home";
var PERMISSION_FILES = exports.PERMISSION_FILES = "files";
var PERMISSION_USERS = exports.PERMISSION_USERS = "users";
var PERMISSION_TAGS = exports.PERMISSION_TAGS = "tags";
var PERMISSION_ROLE_FILES = exports.PERMISSION_ROLE_FILES = "role_files";
var PERMISSION_ROLE_MENUS = exports.PERMISSION_ROLE_MENUS = "role_menus";
var PERMISSION_ANALYSIS = exports.PERMISSION_ANALYSIS = "analysis";

// mongoの接続に失敗した場合、リトライに何m秒待つか
var MONGO_CONNECTION_INTERVAL = exports.MONGO_CONNECTION_INTERVAL = 5 * 1000;

// mongoの接続を何回試行するか
var MONGO_CONNECTION_RETRY = exports.MONGO_CONNECTION_RETRY = 20;

// swiftの接続に失敗した場合、リトライに何m秒待つか
var SWIFT_CONNECTION_INTERVAL = exports.SWIFT_CONNECTION_INTERVAL = 5 * 1000;

// swiftの接続を何回試行するか
var SWIFT_CONNECTION_RETRY = exports.SWIFT_CONNECTION_RETRY = 20;

// elasticsearchの接続に失敗した場合、リトライに何m秒待つか
var ELASTIC_CONNECTION_INTERVAL = exports.ELASTIC_CONNECTION_INTERVAL = 5 * 1000;

// elasticsearchの接続を何回試行するか
var ELASTIC_CONNECTION_RETRY = exports.ELASTIC_CONNECTION_RETRY = 20;

// elasticsearchのタイムアウトm秒
var ELASTIC_CONNECTION_TIMEOUT = exports.ELASTIC_CONNECTION_TIMEOUT = 10 * 1000;
var ELASTIC_INDEXING_TIMEOUT = exports.ELASTIC_INDEXING_TIMEOUT = 60 * 1000;

// pdf->pngファイル変換の解像度
var CONVERT_DPI = exports.CONVERT_DPI = 144;

// libreOfficeのパス
var LIBRE_OFFICE_PATH = exports.LIBRE_OFFICE_PATH = function LIBRE_OFFICE_PATH() {
  var librePath = void 0;

  switch (process.env.NODE_ENV) {
    case "integration":
      librePath = "/Applications/LibreOffice.app/Contents/MacOS/soffice";
      break;
    case "production":
      librePath = "/usr/bin/soffice";
      break;
    default:
      librePath = "/Applications/LibreOffice.app/Contents/MacOS/soffice";
      break;
  }

  _fs2.default.statSync(librePath); // 存在しなければ例外をスローする
  return librePath;
};