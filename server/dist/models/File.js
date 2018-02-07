"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _logger = require("../logger");

var _User = require("./User");

var _User2 = _interopRequireDefault(_User);

var _Group = require("./Group");

var _Group2 = _interopRequireDefault(_Group);

var _RoleFile = require("./RoleFile");

var _RoleFile2 = _interopRequireDefault(_RoleFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = global.Promise;

var FileSchema = (0, _mongoose.Schema)({
  name: String,
  blob_path: String,
  mime_type: String,
  size: Number,
  modified: { type: Date, default: Date.now },
  is_dir: Boolean,
  dir_id: _mongoose.Schema.Types.ObjectId,
  is_display: Boolean, // ごみ箱、ルートフォルダなど見せたくないフラグ
  is_star: Boolean,
  is_trash: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false }, // 完全削除フラグ。ゴミ箱移動時はfalseのまま
  tags: Array,
  histories: Array,
  preview_id: _mongoose.Schema.Types.ObjectId,
  is_crypted: { type: Boolean, default: false },
  unvisible: { type: Boolean, default: false // デフォルト表示させたくないファイル
  } });

FileSchema.statics.searchFiles = function (conditions, offset, limit, sortOption) {
  var meta_info_id = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return File.aggregate([{ $match: conditions }, {
              $lookup: {
                from: "authority_files",
                localField: "_id",
                foreignField: "files",
                as: "authorities"
              }
            }, {
              $unwind: {
                path: "$authorities",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "role_files",
                localField: "authorities.role_files",
                foreignField: "_id",
                as: "authorities_role_files"
              }
            }, {
              $unwind: {
                path: "$authorities_role_files",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "users",
                localField: "authorities.users",
                foreignField: "_id",
                as: "authorities_users"
              }
            }, {
              $unwind: {
                path: "$authorities_users",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "groups",
                localField: "authorities.groups",
                foreignField: "_id",
                as: "authorities_groups"
              }
            }, {
              $unwind: {
                path: "$authorities_groups",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "actions",
                localField: "authorities_role_files.actions",
                foreignField: "_id",
                as: "actions"
              }
            }, {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                mime_type: { $first: "$mime_type" },
                size: { $first: "$size" },
                is_dir: { $first: "$is_dir" },
                dir_id: { $first: "$dir_id" },
                is_display: { $first: "$is_display" },
                is_star: { $first: "$is_star" },
                is_trash: { $first: "$is_trash" },
                is_crypted: { $first: "$is_crypted" },
                histories: { $first: "$histories" },
                is_deleted: { $first: "$is_deleted" },
                modified: { $first: "$modified" },
                preview_id: { $first: "$preview_id" },
                unvisible: { $first: "$unvisible" },
                authorities: {
                  $push: {
                    role_files: "$authorities_role_files",
                    users: "$authorities_users",
                    groups: "$authorities_groups",
                    actions: "$actions"
                  }
                },
                tags: { $first: "$tags" },
                meta_infos: { $first: "$meta_infos" }
              }
            }, {
              $lookup: {
                from: "tags",
                localField: "tags",
                foreignField: "_id",
                as: "tags"
              }
            }, {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                mime_type: { $first: "$mime_type" },
                size: { $first: "$size" },
                is_dir: { $first: "$is_dir" },
                dir_id: { $first: "$dir_id" },
                is_display: { $first: "$is_display" },
                is_star: { $first: "$is_star" },
                is_trash: { $first: "$is_trash" },
                is_crypted: { $first: "$is_crypted" },
                histories: { $first: "$histories" },
                tags: { $first: "$tags" },
                is_deleted: { $first: "$is_deleted" },
                modified: { $first: "$modified" },
                preview_id: { $first: "$preview_id" },
                unvisible: { $first: "$unvisible" },
                authorities: { $first: "$authorities" }
              }
            }, {
              $lookup: {
                from: "dirs",
                localField: "dir_id",
                foreignField: "descendant",
                as: "dirs"
              }
            }, { $unwind: {
                path: "$dirs",
                preserveNullAndEmptyArrays: true }
            }, {
              $lookup: {
                from: "files",
                localField: "dirs.ancestor",
                foreignField: "_id",
                as: "dirs.ancestor"
              }
            }, { $unwind: {
                path: "$dirs.ancestor",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                mime_type: { $first: "$mime_type" },
                size: { $first: "$size" },
                is_dir: { $first: "$is_dir" },
                dir_id: { $first: "$dir_id" },
                is_display: { $first: "$is_display" },
                is_star: { $first: "$is_star" },
                is_trash: { $first: "$is_trash" },
                is_crypted: { $first: "$is_crypted" },
                histories: { $first: "$histories" },
                tags: { $first: "$tags" },
                is_deleted: { $first: "$is_deleted" },
                modified: { $first: "$modified" },
                preview_id: { $first: "$preview_id" },
                unvisible: { $first: "$unvisible" },
                authorities: { $first: "$authorities" },
                dirs: {
                  $push: {
                    _id: "$dirs._id",
                    ancestor: "$dirs.ancestor",
                    descendant: "$dirs.descendant",
                    depth: "$dirs.depth"
                  }
                }
              }
            }, {
              $lookup: {
                from: "file_meta_infos",
                localField: "_id",
                foreignField: "file_id",
                as: "meta_infos"
              }
            }, {
              $unwind: {
                path: "$meta_infos",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "meta_infos",
                localField: "meta_infos.meta_info_id",
                foreignField: "_id",
                as: "meta_info"
              }
            }, {
              $unwind: {
                path: "$meta_info",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                mime_type: { $first: "$mime_type" },
                size: { $first: "$size" },
                is_dir: { $first: "$is_dir" },
                dir_id: { $first: "$dir_id" },
                is_display: { $first: "$is_display" },
                is_star: { $first: "$is_star" },
                is_trash: { $first: "$is_trash" },
                is_crypted: { $first: "$is_crypted" },
                histories: { $first: "$histories" },
                tags: { $first: "$tags" },
                is_deleted: { $first: "$is_deleted" },
                modified: { $first: "$modified" },
                preview_id: { $first: "$preview_id" },
                authorities: { $first: "$authorities" },
                unvisible: { $first: "$unvisible" },
                dirs: { $first: "$dirs" },
                meta_infos: {
                  $push: {
                    _id: "$meta_info._id",
                    label: "$meta_info.label",
                    value_type: "$meta_info.value_type",
                    value: "$meta_infos.value",
                    meta_info_id: "$meta_infos.meta_info_id",
                    sort_target: { $cond: {
                        if: { $eq: ["$meta_infos.meta_info_id", meta_info_id] }, then: "$meta_infos.value", else: null
                      } }
                  }
                }
              }
            }, {
              $addFields: {
                sort_target: {
                  $filter: {
                    input: "$meta_infos.sort_target",
                    as: "sort_target",
                    cond: { $ne: ["$$sort_target", null] }
                  }

                }
              }
            }, {
              $project: {
                _id: 1,
                name: 1,
                mime_type: 1,
                size: 1,
                is_dir: 1,
                dir_id: 1,
                is_display: 1,
                is_star: 1,
                is_trash: 1,
                is_crypted: 1,
                histories: 1,
                tags: 1,
                is_deleted: 1,
                modified: 1,
                dirs: 1,
                preview_id: 1,
                authorities: 1,
                unvisible: 1,
                meta_infos: {
                  $filter: {
                    input: "$meta_infos",
                    as: "meta_infos",
                    cond: { $gte: ["$$meta_infos._id", null] }
                  }
                },
                sort_target: 1
              }
            }]).sort(sortOption).skip(offset).limit(limit);

          case 3:
            return _context.abrupt("return", _context.sent);

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            throw _context.t0;

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 6]]);
  }));
};

FileSchema.statics.searchFileOne = function (conditions) {
  return (0, _co2.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var offset, limit, sortOption, files;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            offset = 0;
            limit = 1;
            sortOption = { _id: 1 };
            _context2.next = 6;
            return File.searchFiles(conditions, offset, limit, sortOption);

          case 6:
            files = _context2.sent;
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              return resolve(files[0]);
            }));

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](0);
            throw _context2.t0;

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 10]]);
  }));
};

var File = _mongoose2.default.model("files", FileSchema, "files");

exports.default = File;