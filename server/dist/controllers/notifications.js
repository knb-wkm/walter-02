"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUnRead = exports.updateRead = exports.add = exports.view = exports.index = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

var _Notification = require("../models/Notification");

var _Notification2 = _interopRequireDefault(_Notification);

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

var _lodash = require("lodash");

var _logger = require("../logger");

var _logger2 = _interopRequireDefault(_logger);

var _AppError = require("../errors/AppError");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// constants


// models
var ObjectId = _mongoose2.default.Types.ObjectId;

// etc

var index = exports.index = function index(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var tenant_id, notifications, errors;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            tenant_id = res.user.tenant_id;
            _context.next = 4;
            return _User2.default.aggregate([{ $match: { tenant_id: tenant_id } }, { $lookup: {
                from: "notifications",
                localField: "_id",
                foreignField: "users",
                as: "notifications"
              } }, { $project: {
                notifications: 1
              } }]);

          case 4:
            notifications = _context.sent;


            res.json({
              status: { success: true },
              body: notifications
            });

            _context.next = 14;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            errors = {};

            switch (_context.t0) {
              default:
                errors.unknown = _context.t0;
            }
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 8]]);
  }));
};

var view = exports.view = function view(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var user_id, page, offset, allNotifications, readNotifications, notifications, errors;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            user_id = res.user._id;
            page = req.query.page;


            if (page === undefined || page === null || page === "") page = 0;
            offset = page * constants.INFOMATION_LIMITS_PER_PAGE;
            _context2.next = 7;
            return _User2.default.aggregate([{ $match: { _id: ObjectId(user_id) } }, { $lookup: {
                from: "notifications",
                localField: "_id",
                foreignField: "users",
                as: "notifications"
              } }, { $project: {
                notifications: 1,
                _id: 0
              } }, {
              $unwind: {
                path: "$notifications"
              }
            }]);

          case 7:
            allNotifications = _context2.sent;
            readNotifications = allNotifications.filter(function (notification) {
              return notification.notifications.read === undefined || notification.notifications.read === false;
            });
            _context2.next = 11;
            return _User2.default.aggregate([{ $match: { _id: ObjectId(user_id) } }, { $lookup: {
                from: "notifications",
                localField: "_id",
                foreignField: "users",
                as: "notifications"
              } }, { $project: {
                notifications: 1,
                _id: 0
              } }, {
              $unwind: {
                path: "$notifications"
              }
            }, { $sort: {
                "notifications._id": -1
              } }, { '$skip': offset }, { '$limit': constants.INFOMATION_LIMITS_PER_PAGE }]);

          case 11:
            notifications = _context2.sent;


            res.json({
              status: {
                success: true,
                unread: readNotifications.length,
                total: allNotifications.length,
                page: page
              },
              body: notifications
            });

            _context2.next = 21;
            break;

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](0);
            errors = {};

            switch (_context2.t0) {
              default:
                errors.unknown = _context2.t0;
            }
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 15]]);
  }));
};

var add = exports.add = function add(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var _req$body$notificatio, title, body, users, modified, user_ids, user, notifications, errors;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (!(req.body.notifications === undefined)) {
              _context3.next = 3;
              break;
            }

            throw new _AppError.ValidationError("notifications is empty");

          case 3:
            _req$body$notificatio = req.body.notifications, title = _req$body$notificatio.title, body = _req$body$notificatio.body, users = _req$body$notificatio.users;

            if (!(title === undefined || title === null || title === "")) {
              _context3.next = 6;
              break;
            }

            throw new _AppError.ValidationError("title is empty");

          case 6:
            if (!(body === undefined || body === null || body === "")) {
              _context3.next = 8;
              break;
            }

            throw new _AppError.ValidationError("body is empty");

          case 8:
            if (!(users === undefined || users === null || (0, _lodash.isEmpty)(users))) {
              _context3.next = 10;
              break;
            }

            throw new _AppError.ValidationError("users is empty");

          case 10:
            modified = (0, _moment2.default)().format("YYYY-MM-DD HH:mm:ss");
            user_ids = users.map(function (user_id) {
              return ObjectId(user_id);
            });
            _context3.next = 14;
            return _User2.default.find({ _id: { $in: user_ids } });

          case 14:
            user = _context3.sent;

            if (!(0, _lodash.isEmpty)(user)) {
              _context3.next = 17;
              break;
            }

            throw new _AppError.RecordNotFoundException("user is not find");

          case 17:
            _context3.next = 19;
            return user.map(function (user) {
              var notification = new _Notification2.default();
              notification.title = title;
              notification.body = body;
              notification.modified = modified;
              notification.read = false;
              notification.users = user;
              return notification.save();
            });

          case 19:
            notifications = _context3.sent;


            res.json({
              status: { success: true },
              body: notifications
            });

            _context3.next = 42;
            break;

          case 23:
            _context3.prev = 23;
            _context3.t0 = _context3["catch"](0);
            errors = {};
            _context3.t1 = _context3.t0.message;
            _context3.next = _context3.t1 === "notifications is empty" ? 29 : _context3.t1 === "title is empty" ? 31 : _context3.t1 === "body is empty" ? 33 : _context3.t1 === "users is empty" ? 35 : _context3.t1 === "user is not find" ? 37 : 39;
            break;

          case 29:
            errors.notifications = "お知らせが空のためお知らせの登録に失敗しました";
            return _context3.abrupt("break", 40);

          case 31:
            errors.title = "タイトルが空です";
            return _context3.abrupt("break", 40);

          case 33:
            errors.body = "本文が空です";
            return _context3.abrupt("break", 40);

          case 35:
            errors.users = "ユーザーが空です";
            return _context3.abrupt("break", 40);

          case 37:
            errors.user = "指定されたユーザーが存在しないためお知らせの登録に失敗しました";
            return _context3.abrupt("break", 40);

          case 39:
            errors.unknown = _context3.t0;

          case 40:
            _logger2.default.error(errors);
            res.status(400).json({
              status: {
                success: false,
                message: "お知らせの登録に失敗しました",
                errors: errors
              }
            });

          case 42:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 23]]);
  }));
};

var updateRead = exports.updateRead = function updateRead(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var user_id, notifications, notificationIds, updateResult, allNotifications, readNotifications, errors;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            user_id = res.user._id;
            notifications = req.body.notifications;
            notificationIds = notifications.map(function (notificationId) {
              return ObjectId(notificationId);
            });
            _context4.next = 6;
            return _Notification2.default.update({
              _id: { $in: notificationIds }
            }, { $set: { read: true } }, { multi: true });

          case 6:
            updateResult = _context4.sent;
            _context4.next = 9;
            return _Notification2.default.find({ users: ObjectId(user_id) });

          case 9:
            allNotifications = _context4.sent;
            readNotifications = allNotifications.filter(function (notification) {
              return notification.read === undefined || notification.read === false;
            });


            res.json({
              status: {
                success: true,
                unread: readNotifications.length,
                total: allNotifications.length
              },
              body: updateResult
            });
            _context4.next = 20;
            break;

          case 14:
            _context4.prev = 14;
            _context4.t0 = _context4["catch"](0);
            errors = {};

            switch (_context4.t0.message) {
              default:
                errors.unknown = _context4.t0;
            }
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 20:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 14]]);
  }));
};

var updateUnRead = exports.updateUnRead = function updateUnRead(req, res, next) {
  (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var user_id, notifications, notificationIds, updateResult, allNotifications, readNotifications, errors;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            user_id = res.user._id;
            notifications = req.body.notifications;
            notificationIds = notifications.map(function (notificationId) {
              return ObjectId(notificationId);
            });
            _context5.next = 6;
            return _Notification2.default.update({
              _id: { $in: notificationIds }
            }, { $set: { read: false } }, { multi: true });

          case 6:
            updateResult = _context5.sent;
            _context5.next = 9;
            return _Notification2.default.find({ users: ObjectId(user_id) });

          case 9:
            allNotifications = _context5.sent;
            readNotifications = allNotifications.filter(function (notification) {
              return notification.read === undefined || notification.read === false;
            });


            res.json({
              status: {
                success: true,
                unread: readNotifications.length,
                total: allNotifications.length
              },
              body: updateResult
            });
            _context5.next = 20;
            break;

          case 14:
            _context5.prev = 14;
            _context5.t0 = _context5["catch"](0);
            errors = {};

            switch (_context5.t0.message) {
              default:
                errors.unknown = _context5.t0;
            }
            _logger2.default.error(errors);
            res.status(400).json({
              status: { success: false, errors: errors }
            });

          case 20:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 14]]);
  }));
};