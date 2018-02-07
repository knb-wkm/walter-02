"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _supertest = require("supertest");

var _supertest2 = _interopRequireDefault(_supertest);

var _superagentDefaults = require("superagent-defaults");

var _superagentDefaults2 = _interopRequireDefault(_superagentDefaults);

var _chai = require("chai");

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _lodash = require("lodash");

var _builder = require("./builder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect(_builder.mongoUrl, { useMongoClient: true });
_builder.app.use('/', _2.default);

var base_url = "/api/v1/authority_menus";
var login_url = "/api/login";

var request = (0, _superagentDefaults2.default)((0, _supertest2.default)(_builder.app));
var tenant_id = "";

describe(base_url, function () {
  before(function (done) {
    _builder.initdbPromise.then(function () {
      request.post(login_url).send(_builder.authData).end(function (err, res) {
        tenant_id = res.body.body.user.tenant_id;
        request.set('x-auth-cloud-storage', res.body.body.token);
        done();
      });
    });
  });

  describe('get /', function () {
    describe('正常系', function () {

      var response = void 0;
      before(function (done) {
        request.get(base_url).end(function (err, res) {
          response = res;
          done();
        });
      });

      it('http(200)が返却される', function (done) {
        (0, _chai.expect)(response.status).equal(200);
        done();
      });

      it('statusはtrue', function (done) {
        (0, _chai.expect)(response.body.status.success).equal(true);
        done();
      });

      it('返却値はArrayである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body)).equal('object');
        done();
      });

      it('_idが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], '_id')).equal(true);
        done();
      });

      it('_idはObjectIdである', function (done) {
        (0, _chai.expect)(_mongoose2.default.Types.ObjectId.isValid(response.body.body[0]._id)).equal(true);
        done();
      });

      it('nameが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'name')).equal(true);
        done();
      });

      it('nameはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].name)).equal('string');
        done();
      });

      it('labelが含まれる', function (done) {
        (0, _chai.expect)((0, _lodash.has)(response.body.body[0], 'label')).equal(true);
        done();
      });

      it('labelはstringである', function (done) {
        (0, _chai.expect)((0, _typeof3.default)(response.body.body[0].label)).equal('string');
        done();
      });
    });
  });
});