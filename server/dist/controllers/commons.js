"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var errorParser = exports.errorParser = function errorParser(error) {
  return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
};