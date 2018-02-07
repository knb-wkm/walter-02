"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _express = require("express");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

var _morgan = require("morgan");

var _morgan2 = _interopRequireDefault(_morgan);

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _User = require("../models/User");

var _User2 = _interopRequireDefault(_User);

var _Group = require("../models/Group");

var _Group2 = _interopRequireDefault(_Group);

var _Test = require("../models/Test");

var _Test2 = _interopRequireDefault(_Test);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();

router.get("/", function (req, res, next) {
  var _marked = /*#__PURE__*/_regenerator2.default.mark(main);

  function main() {
    var users, groups;
    return _regenerator2.default.wrap(function main$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                return resolve();
              }, 1000);
            });

          case 3:
            _context.next = 5;
            return _User2.default.find();

          case 5:
            users = _context.sent;
            _context.next = 8;
            return _Group2.default.find();

          case 8:
            groups = _context.sent;

            res.json({ users: users, groups: groups });
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);

            res.json(_context.t0);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _marked, this, [[0, 12]]);
  }

  (0, _co2.default)(main);
});

router.get("/1", function (req, res, next) {
  var _marked2 = /*#__PURE__*/_regenerator2.default.mark(main);

  function main() {
    var payloads;
    return _regenerator2.default.wrap(function main$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return [_User2.default.find(), _Group2.default.find()];

          case 2:
            payloads = _context2.sent;


            res.json({
              users: payloads[0],
              groups: payloads[1]
            });

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _marked2, this);
  }

  (0, _co2.default)(main);
});

router.get("/2", function (req, res, next) {
  var _marked3 = /*#__PURE__*/_regenerator2.default.mark(main);

  function main() {
    return _regenerator2.default.wrap(function main$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            throw "runtime error";

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _marked3, this);
  }

  (0, _co2.default)(main).catch(function (err) {
    return res.json(err);
  });
});

router.get("/3", function (req, res, next) {
  var main = /*#__PURE__*/_regenerator2.default.mark(function main() {
    return _regenerator2.default.wrap(function main$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return new Promise(function (r) {
              return setTimeout(function () {
                return r();
              }, 1000);
            });

          case 3:
            res.json("success");
            _context4.next = 9;
            break;

          case 6:
            _context4.prev = 6;
            _context4.t0 = _context4["catch"](0);

            res.json(_context4.t0);

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, main, this, [[0, 6]]);
  });

  (0, _co2.default)(main);
});

router.get("/flow", function (req, res, next) {
  var add = function add(a, b) {
    return a + b;
  };

  var result = add(1, 2);

  res.json(result);
});

router.get("/flow1", function (req, res, next) {
  var foo = function foo(a) {
    return a + "!";
  };

  var result = foo(1);
  res.json(result);
});
// const upload = multer({ dest: "uploads/" });

// router.post("/", upload.fields([ { name: "myFile" } ]), (req, res, next) => {
//   const myFile = req.files.myFile[0];
//   const dir_id = req.body.dir_id;
//   console.log(myFile, dir_id);
//   res.json(myFile);
// });

exports.default = router;