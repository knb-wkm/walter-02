"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Swift = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _pkgcloud = require("pkgcloud");

var _pkgcloud2 = _interopRequireDefault(_pkgcloud);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

var _server = require("../configs/server");

var _constants = require("../configs/constants");

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Swift = function () {
  function Swift(params) {
    (0, _classCallCheck3.default)(this, Swift);

    var mode = process.env.NODE_ENV;
    var config = void 0;

    switch (mode) {
      case "integration":
        config = _server.STORAGE_CONF.integration;
        break;
      case "production":
        if (!process.env.SWIFT_HOST_NAME) throw new Error("env.SWIFT_HOST_NAME is not set");
        config = _server.STORAGE_CONF.production;
        break;
      default:
        config = _server.STORAGE_CONF.development;
        break;
    }

    this.client = _pkgcloud2.default.storage.createClient(config);
  }

  (0, _createClass3.default)(Swift, [{
    key: "getContainers",
    value: function getContainers() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.client.getContainers(function (err, containers) {
          if (err) return reject(err);
          return resolve(containers);
        });
      });
    }
  }, {
    key: "getFiles",
    value: function getFiles(container_name) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.client.getFiles(container_name, function (err, files) {
          if (err) reject(err);
          resolve(files);
        });
      });
    }
  }, {
    key: "getFile",
    value: function getFile(container_name, file_name) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.client.getFile(container_name, file_name, function (err, file) {
          if (err) reject(err);
          resolve(file);
        });
      });
    }
  }, {
    key: "downloadFile",
    value: function downloadFile(container_name, file) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var stream = _fs2.default.createWriteStream("/tmp/stream.tmp");

        if (file.is_crypted) {
          var decipher = _crypto2.default.createDecipher("aes-256-cbc", constants.CRYPTO_PASSWORD);
          _this4.client.download({
            container: container_name,
            remote: file._id.toString()
          }, function (err, result) {
            if (err) reject(err);
          }).pipe(decipher).pipe(stream).on("finish", function () {
            return resolve(stream);
          });
        } else {
          _this4.client.download({
            container: container_name,
            remote: file._id.toString()
          }, function (err, result) {
            if (err) reject(err);
          }).pipe(stream).on("finish", function () {
            return resolve(stream);
          });
        }
      }).then(function (writeStream) {
        return new Promise(function (resolve, reject) {
          resolve(_fs2.default.createReadStream(writeStream.path));
        });
      });
    }
  }, {
    key: "upload",
    value: function upload(container_name, srcFilePath, dstFileName) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {

        var readStream = new _stream2.default.PassThrough();
        readStream.end(srcFilePath);

        var writeStream = _this5.client.upload({
          container: container_name,
          remote: dstFileName
        });

        writeStream.on("error", function (err) {
          return reject(err);
        });
        writeStream.on("success", function (file) {
          return resolve(file);
        });
        if (constants.USE_CRYPTO) {
          var cipher = _crypto2.default.createCipher("aes-256-cbc", constants.CRYPTO_PASSWORD);
          readStream.pipe(cipher).pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      });
    }
  }, {
    key: "remove",
    value: function remove(container_name, file) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.client.removeFile(container_name, file._id.toString(), function (err, result) {
          if (err) reject(err);
          resolve(result);
        });
      });
    }
  }, {
    key: "exportFile",
    value: function exportFile(container_name, file, exportDir) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        var stream = _fs2.default.createWriteStream(exportDir);
        var downloadFile = {};

        if (file.is_crypted) {
          var decipher = _crypto2.default.createDecipher("aes-256-cbc", constants.CRYPTO_PASSWORD);

          _this7.client.download({
            container: container_name,
            remote: file._id.toString()
          }, function (err, result) {
            if (err) reject(err);
            downloadFile = result;
          }).pipe(decipher).pipe(stream).on("finish", function () {
            return resolve(downloadFile);
          });
        } else {
          _this7.client.download({
            container: container_name,
            remote: file._id.toString()
          }, function (err, result) {
            if (err) reject(err);
            downloadFile = result;
          }).pipe(stream).on("finish", function () {
            return resolve(downloadFile);
          });
        }
      });
    }
  }]);
  return Swift;
}();

exports.Swift = Swift;