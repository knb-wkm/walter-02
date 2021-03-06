import fs from "fs";

// ファイル一覧 1pageあたりの件数
export const FILE_LIMITS_PER_PAGE = 30;

// ファイル暗号化設定
export const CRYPTO_PASSWORD = "mGjQB5F57C+W";
export const USE_CRYPTO = false;

// お知らせの取得件数
export const INFOMATION_LIMITS_PER_PAGE = 5;

// label等の文字列最大長さ
export const MAX_STRING_LENGTH = 255;

// email addressの制限文字数
export const MAX_EMAIL_LENGTH = 64;

// preview 画像作成の最大ファイルサイズ
export const MAX_CREATE_PREVIEW_FILE_SIZE = 32212254720;

// loggerの設定
export const LOGGER_CONFIG = {
  appenders: {
    file: {
      type:     "dateFile",
      filename: "logs/app.log",
      pattern:  "-yyyy-MM-dd",
      layout:{
        type: "pattern",
        pattern: "[%d] [%p] %h - %m"
      },
    },
    access: {
      type:     "dateFile",
      filename: "logs/access.log",
      pattern:  "-yyyy-MM-dd",
      layout: {
        type: 'json'
      }
    },
    info: {
      type: 'logLevelFilter',
      appender: 'access',
      level: 'info',
      maxLevel: 'info',
    },
    error: {
      type: 'logLevelFilter',
      appender: 'file',
      level: 'error',
    },
  },
  categories:{
    default: {
      appenders:['info', 'error'],
      level: 'ALL'
    },
    production: {
      appenders:['info', 'error'],
      level: 'ALL'
    }
  }
};

// 禁止文字一覧
// 使い方: string.match( new RegExp(ILLIGAL_CHARACTERS.join("|")))
export const ILLIGAL_CHARACTERS = ["\\\\", "\\/", "\\:", "\\*", "\\?", "\\<", "\\>", "\\|"];

// 権限(file)
export const PERMISSION_VIEW_LIST = "list";
export const PERMISSION_VIEW_DETAIL = "detail";
export const PERMISSION_VIEW_HISTORY = "history";
export const PERMISSION_DOWNLOAD = "download";
export const PERMISSION_CHANGE_NAME = "change-name";
export const PERMISSION_CHANGE_TAG = "change-tag";
export const PERMISSION_CHANGE_META_INFO = "change-meta-info";
export const PERMISSION_UPLOAD = "upload";
export const PERMISSION_MAKE_DIR = "makedir";
export const PERMISSION_MOVE = "move";
export const PERMISSION_COPY = "copy";
export const PERMISSION_RESTORE = "restore";
export const PERMISSION_DELETE = "delete";
//export const PERMISSION_REVERT = "revert";  未使用
export const PERMISSION_AUTHORITY = "authority";
export const PERMISSION_FILE_AUTHORITY = "file-authority";  //ファイル権限変更
export const PERMISSION_DIR_AUTHORITY = "dir-authority";    //フォルダ権限変更

// 権限(menu)
export const PERMISSION_META_INFOS = "meta_infos";
export const PERMISSION_GROUPS = "groups";
export const PERMISSION_HOME = "home";
export const PERMISSION_FILES = "files";
export const PERMISSION_USERS = "users";
export const PERMISSION_TAGS = "tags";
export const PERMISSION_ROLE_FILES = "role_files";
export const PERMISSION_ROLE_MENUS = "role_menus";
export const PERMISSION_ANALYSIS = "analysis";

// mongoの接続に失敗した場合、リトライに何m秒待つか
export const MONGO_CONNECTION_INTERVAL = 5 * 1000;

// mongoの接続を何回試行するか
export const MONGO_CONNECTION_RETRY = 20;

// swiftの接続に失敗した場合、リトライに何m秒待つか
export const SWIFT_CONNECTION_INTERVAL = 5 * 1000;

// swiftの接続を何回試行するか
export const SWIFT_CONNECTION_RETRY = 20;

// elasticsearchの接続に失敗した場合、リトライに何m秒待つか
export const ELASTIC_CONNECTION_INTERVAL = 5 * 1000;

// elasticsearchの接続を何回試行するか
export const ELASTIC_CONNECTION_RETRY = 20;

// elasticsearchのタイムアウトm秒
export const ELASTIC_CONNECTION_TIMEOUT = 10 * 1000;
export const ELASTIC_INDEXING_TIMEOUT = 60 * 1000;

// pdf->pngファイル変換の解像度
export const CONVERT_DPI = 144;

// libreOfficeのパス
export const LIBRE_OFFICE_PATH = () => {
  let librePath;

  switch (process.env.NODE_ENV) {
  case "integration":
    librePath = "/usr/bin/soffice";
    break;
  case "production":
    librePath = "/usr/bin/soffice";
    break;
  default:
    librePath = "/usr/bin/soffice";
    break;
  }

  fs.statSync(librePath); // 存在しなければ例外をスローする
  return librePath;
};
