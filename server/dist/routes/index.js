"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _before = require("./before");

var _before2 = _interopRequireDefault(_before);

var _login = require("./login");

var _login2 = _interopRequireDefault(_login);

var _users = require("./users");

var _users2 = _interopRequireDefault(_users);

var _files = require("./files");

var _files2 = _interopRequireDefault(_files);

var _dirs = require("./dirs");

var _dirs2 = _interopRequireDefault(_dirs);

var _tags = require("./tags");

var _tags2 = _interopRequireDefault(_tags);

var _metaInfos = require("./metaInfos");

var _metaInfos2 = _interopRequireDefault(_metaInfos);

var _groups = require("./groups");

var _groups2 = _interopRequireDefault(_groups);

var _roleFiles = require("./roleFiles");

var _roleFiles2 = _interopRequireDefault(_roleFiles);

var _roleMenus = require("./roleMenus");

var _roleMenus2 = _interopRequireDefault(_roleMenus);

var _actions = require("./actions");

var _actions2 = _interopRequireDefault(_actions);

var _analysis = require("./analysis");

var _analysis2 = _interopRequireDefault(_analysis);

var _clients = require("./clients");

var _clients2 = _interopRequireDefault(_clients);

var _previews = require("./previews");

var _previews2 = _interopRequireDefault(_previews);

var _authorityFiles = require("./authorityFiles");

var _authorityFiles2 = _interopRequireDefault(_authorityFiles);

var _authorityMenus = require("./authorityMenus");

var _authorityMenus2 = _interopRequireDefault(_authorityMenus);

var _menus = require("./menus");

var _menus2 = _interopRequireDefault(_menus);

var _notifications = require("./notifications");

var _notifications2 = _interopRequireDefault(_notifications);

var _displayItems = require("./displayItems");

var _displayItems2 = _interopRequireDefault(_displayItems);

var _excels = require("./excels");

var _excels2 = _interopRequireDefault(_excels);

var _elasticsearches = require("./elasticsearches");

var _elasticsearches2 = _interopRequireDefault(_elasticsearches);

var _downloadInfos = require("./downloadInfos");

var _downloadInfos2 = _interopRequireDefault(_downloadInfos);

var _appSettings = require("./appSettings");

var _appSettings2 = _interopRequireDefault(_appSettings);

var _test = require("./test");

var _test2 = _interopRequireDefault(_test);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();

// debug


router.use("/api/v1/*", _before2.default);
router.use("/api/login", _login2.default);
router.use("/api/v1/users", _users2.default);
router.use("/api/v1/files", _files2.default);
router.use("/api/v1/elasticsearch", _elasticsearches2.default);
router.use("/api/v1/dirs", _dirs2.default);
router.use("/api/v1/tags", _tags2.default);
router.use("/api/v1/meta_infos", _metaInfos2.default);
router.use("/api/v1/groups", _groups2.default);
router.use("/api/v1/role_files", _roleFiles2.default);
router.use("/api/v1/role_menus", _roleMenus2.default);
router.use("/api/v1/actions", _actions2.default);
router.use("/api/v1/analysis", _analysis2.default);
router.use("/api/v1/previews", _previews2.default);
router.use("/api/v1/authority_files", _authorityFiles2.default);
router.use("/api/v1/authority_menus", _authorityMenus2.default);
router.use("/api/v1/menus", _menus2.default);
router.use("/api/v1/notifications", _notifications2.default);
router.use("/api/v1/display_items", _displayItems2.default);
router.use("/api/v1/excels", _excels2.default);
router.use("/api/v1/download_info", _downloadInfos2.default);
router.use("/api/v1/app_settings", _appSettings2.default);

router.use("/*", _clients2.default);

// debug
router.use("/test", _test2.default);

exports.default = router;