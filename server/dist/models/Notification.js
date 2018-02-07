"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var NotificationSchema = (0, _mongoose.Schema)({
  users: { type: _mongoose.Schema.Types.ObjectId, ref: 'users' },
  read: Boolean,
  title: String,
  body: String,
  create: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now }

});

var Notification = _mongoose2.default.model("notifications", NotificationSchema, "notifications");

exports.default = Notification;