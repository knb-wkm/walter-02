"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// mongoの接続先情報
var SERVER_CONF = exports.SERVER_CONF = {
  development: {
    url: "mongodb://172.16.55.74", // 社内docker
    // url: "mongodb://192.168.56.10",  // virtualbox
    db_host: "172.16.55.74",
    db_name: "walter",
    port: 3333
  },
  integration: {
    url: "mongodb://172.16.55.74", // 社内docker
    db_host: "172.16.55.74",
    db_name: "walter",
    port: 3333
  },
  production: {
    url: "mongodb://" + process.env.MONGO_HOST_NAME,
    db_host: process.env.MONGO_HOST_NAME,
    db_name: "walter",
    port: 3333
  }
};

var STORAGE_CONF = exports.STORAGE_CONF = {
  // virtualbox
  development: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    // authUrl: "http://192.168.56.10:8080/auth/v1.0", // virtualbox
    authUrl: "http://172.16.55.75:8080/auth/v1.0", // 社内docker
    version: 1
  },

  // 社内docker
  integration: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    authUrl: "http://172.16.55.75:8080/auth/v1.0",
    version: 1
  },

  production: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    authUrl: "http://" + process.env.SWIFT_HOST_NAME + ":8080/auth/v1.0",
    version: 1
  }
};

// パスワードhash用の秘密鍵
// @todo テナント毎に分ける？
var SECURITY_CONF = exports.SECURITY_CONF = {
  development: {
    secretKey: "secretKey"
  },
  migration: {
    secretKey: "secretKey"
  }
};

// elasticsearchの設定
var ELASTICSEARCH_CONF = exports.ELASTICSEARCH_CONF = {
  development: {
    host: "192.168.99.100",
    port: "9200",
    logLevel: "error"
  },
  integration: {
    host: "192.168.99.100",
    port: "9200",
    logLevel: "error"
  },
  production: {
    host: process.env.ELASTIC_HOST_NAME,
    port: "9200",
    logLevel: "error"
  }
};