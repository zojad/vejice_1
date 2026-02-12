"use strict";
self["webpackHotUpdateoffice_addin_taskpane_js"]("commands",{

/***/ "./src/logic/preveriVejice.js":
/*!************************************!*\
  !*** ./src/logic/preveriVejice.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyAllSuggestionsOnline: function() { return /* binding */ applyAllSuggestionsOnline; },
/* harmony export */   checkDocumentText: function() { return /* binding */ checkDocumentText; },
/* harmony export */   getPendingSuggestionsOnline: function() { return /* binding */ getPendingSuggestionsOnline; },
/* harmony export */   rejectAllSuggestionsOnline: function() { return /* binding */ rejectAllSuggestionsOnline; }
/* harmony export */ });
/* harmony import */ var _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api/apiVejice.js */ "./src/api/apiVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
/* harmony import */ var _engine_CommaSuggestionEngine_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./engine/CommaSuggestionEngine.js */ "./src/logic/engine/CommaSuggestionEngine.js");
/* harmony import */ var _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./anchoring/SyntheticAnchorProvider.js */ "./src/logic/anchoring/SyntheticAnchorProvider.js");
/* harmony import */ var _anchoring_LemmatizerAnchorProvider_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./anchoring/LemmatizerAnchorProvider.js */ "./src/logic/anchoring/LemmatizerAnchorProvider.js");
/* harmony import */ var _adapters_wordOnlineAdapter_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./adapters/wordOnlineAdapter.js */ "./src/logic/adapters/wordOnlineAdapter.js");
/* harmony import */ var _adapters_wordDesktopAdapter_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./adapters/wordDesktopAdapter.js */ "./src/logic/adapters/wordDesktopAdapter.js");
/* harmony import */ var _bridges_onlineTextBridge_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./bridges/onlineTextBridge.js */ "./src/logic/bridges/onlineTextBridge.js");
/* harmony import */ var _bridges_desktopTextBridge_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./bridges/desktopTextBridge.js */ "./src/logic/bridges/desktopTextBridge.js");
/* harmony import */ var _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./engine/textUtils.js */ "./src/logic/engine/textUtils.js");
var _Office;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* global Word, window, process, performance, console, Office, URL */











/** ─────────────────────────────────────────────────────────
 *  DEBUG helpers (flip DEBUG=false to silence logs)
 *  ───────────────────────────────────────────────────────── */
var envIsProd = function envIsProd() {
  var _process$env;
  return typeof process !== "undefined" && ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "development") === "production" || typeof window !== "undefined" && window.__VEJICE_ENV__ === "production";
};
var DEBUG_OVERRIDE = typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean" ? window.__VEJICE_DEBUG__ : undefined;
var DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
var log = function log() {
  var _console;
  for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
    a[_key] = arguments[_key];
  }
  return DEBUG && (_console = console).log.apply(_console, ["[Vejice CHECK]"].concat(a));
};
var warn = function warn() {
  var _console2;
  for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    a[_key2] = arguments[_key2];
  }
  return DEBUG && (_console2 = console).warn.apply(_console2, ["[Vejice CHECK]"].concat(a));
};
var errL = function errL() {
  var _console3;
  for (var _len3 = arguments.length, a = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    a[_key3] = arguments[_key3];
  }
  return (_console3 = console).error.apply(_console3, ["[Vejice CHECK]"].concat(a));
};
var tnow = function tnow() {
  var _performance$now, _performance, _performance$now2;
  return (_performance$now = (_performance = performance) === null || _performance === void 0 || (_performance$now2 = _performance.now) === null || _performance$now2 === void 0 ? void 0 : _performance$now2.call(_performance)) !== null && _performance$now !== void 0 ? _performance$now : Date.now();
};
var SNIP = function SNIP(s) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 80;
  return typeof s === "string" ? s.slice(0, n) : s;
};
var MAX_AUTOFIX_PASSES = typeof Office !== "undefined" && ((_Office = Office) === null || _Office === void 0 || (_Office = _Office.context) === null || _Office === void 0 ? void 0 : _Office.platform) === "PC" ? 3 : 2;
var HIGHLIGHT_INSERT = "#FFF9C4"; // light yellow
var HIGHLIGHT_DELETE = "#FFCDD2"; // light red
var TRAILING_COMMA_REGEX = /[,\s]+$/;
var WORD_CHAR_REGEX = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])/;
var MAX_NORMALIZATION_PROBES = 20;
var pendingSuggestionsOnline = [];
var PENDING_SUGGESTIONS_STORAGE_KEY = "vejice.pendingSuggestionsOnline.v1";
var MAX_PARAGRAPH_CHARS = 3000; //???
var LONG_PARAGRAPH_MESSAGE = "Odstavek je predolg za preverjanje. Razdelite ga na krajše povedi in poskusite znova.";
var LONG_SENTENCE_MESSAGE = "Poved je predolga za preverjanje. Razdelite jo na krajše povedi in poskusite znova.";
var CHUNK_API_ERROR_MESSAGE = "Nekatere povedi niso bile pregledane.";
var PARAGRAPH_NON_COMMA_MESSAGE = "API je spremenil več kot vejice. Preglejte odstavek.";
var TRACKED_CHANGES_PRESENT_MESSAGE = "Najprej sprejmite ali zavrnite obstoječe spremembe (Track Changes) in nato ponovno zaženite preverjanje.";
var TRACK_CHANGES_REQUIRED_MESSAGE = "Vključite Sledenje spremembam (Track Changes) in poskusite znova.";
var API_UNAVAILABLE_MESSAGE = "Storitev CJVT Vejice trenutno ni na voljo. Znova poskusite kasneje.";
var NO_ISSUES_FOUND_MESSAGE = "Ni bilo najdenih manjkajočih ali napačnih vejic.";
var longSentenceNotified = false;
var chunkApiFailureNotified = false;
var pendingScanNotifications = [];
var BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
var BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);
function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  var normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
}
function shouldUseLemmatizerAnchors() {
  if (typeof window !== "undefined") {
    if (typeof window.__VEJICE_LEMMAS_URL === "string" && window.__VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via window:", window.__VEJICE_LEMMAS_URL);
    }
    if (typeof window.__VEJICE_LEMMAS_TIMEOUT_MS !== "undefined" && window.__VEJICE_LEMMAS_TIMEOUT_MS !== null) {
      log("Lemmas timeout override via window:", window.__VEJICE_LEMMAS_TIMEOUT_MS);
    }
    var override = parseBooleanFlag(window.__VEJICE_USE_LEMMATIZER__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    var _parseBooleanFlag, _process$env2, _process$env3, _process$env4, _process$env5;
    var envValue = (_parseBooleanFlag = parseBooleanFlag((_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "true")) !== null && _parseBooleanFlag !== void 0 ? _parseBooleanFlag : parseBooleanFlag((_process$env3 = process.env) === null || _process$env3 === void 0 ? void 0 : "true");
    if (typeof envValue === "boolean") return envValue;
    if ((_process$env4 = process.env) !== null && _process$env4 !== void 0 && "https://127.0.0.1:4001/lemmas") {
      log("Lemmas endpoint override via env:", "https://127.0.0.1:4001/lemmas");
    }
    if ((_process$env5 = process.env) !== null && _process$env5 !== void 0 && "8000") {
      log("Lemmas timeout override via env:", "8000");
    }
  }
  return true;
}
function createAnchorProvider() {
  if (shouldUseLemmatizerAnchors()) {
    try {
      log("Lemmatizer anchor provider enabled");
      return new _anchoring_LemmatizerAnchorProvider_js__WEBPACK_IMPORTED_MODULE_4__.LemmatizerAnchorProvider();
    } catch (error) {
      errL("Failed to initialize LemmatizerAnchorProvider, falling back to synthetic", error);
    }
  }
  return new _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_3__.SyntheticAnchorProvider();
}
function resetPendingSuggestionsOnline() {
  pendingSuggestionsOnline.length = 0;
  persistPendingSuggestionsOnline();
}
function addPendingSuggestionOnline(suggestion) {
  pendingSuggestionsOnline.push(suggestion);
  persistPendingSuggestionsOnline();
}
function getPendingSuggestionsOnline() {
  var debugSnapshot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (!debugSnapshot) return pendingSuggestionsOnline;
  return pendingSuggestionsOnline.map(function (sug) {
    return {
      id: sug === null || sug === void 0 ? void 0 : sug.id,
      kind: sug === null || sug === void 0 ? void 0 : sug.kind,
      paragraphIndex: sug === null || sug === void 0 ? void 0 : sug.paragraphIndex,
      meta: sug === null || sug === void 0 ? void 0 : sug.meta,
      originalPos: sug === null || sug === void 0 ? void 0 : sug.originalPos,
      snippets: sug === null || sug === void 0 ? void 0 : sug.snippets
    };
  });
}
function toSerializableSuggestion(suggestion) {
  if (!suggestion || _typeof(suggestion) !== "object") return null;
  var serializable = {
    id: suggestion.id,
    kind: suggestion.kind,
    paragraphIndex: suggestion.paragraphIndex,
    charHint: suggestion.charHint,
    snippets: suggestion.snippets,
    meta: suggestion.meta,
    originalPos: suggestion.originalPos
  };
  return serializable;
}
function persistPendingSuggestionsOnline() {
  if (typeof window === "undefined") return;
  try {
    var storage = window.localStorage;
    if (!storage) return;
    if (!pendingSuggestionsOnline.length) {
      storage.removeItem(PENDING_SUGGESTIONS_STORAGE_KEY);
      return;
    }
    var payload = pendingSuggestionsOnline.map(function (sug) {
      return toSerializableSuggestion(sug);
    }).filter(Boolean);
    storage.setItem(PENDING_SUGGESTIONS_STORAGE_KEY, JSON.stringify(payload));
  } catch (storageErr) {
    warn("persistPendingSuggestionsOnline failed", storageErr);
  }
}
function restorePendingSuggestionsOnline() {
  if (pendingSuggestionsOnline.length) return pendingSuggestionsOnline.length;
  if (typeof window === "undefined") return 0;
  try {
    var storage = window.localStorage;
    if (!storage) return 0;
    var raw = storage.getItem(PENDING_SUGGESTIONS_STORAGE_KEY);
    if (!raw) return 0;
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    var _iterator = _createForOfIteratorHelper(parsed),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;
        if (!item || _typeof(item) !== "object") continue;
        pendingSuggestionsOnline.push(item);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return pendingSuggestionsOnline.length;
  } catch (storageErr) {
    warn("restorePendingSuggestionsOnline failed", storageErr);
    return 0;
  }
}
if (typeof window !== "undefined") {
  if (!Array.isArray(window.__VEJICE_DEBUG_DUMPS__)) {
    window.__VEJICE_DEBUG_DUMPS__ = [];
  }
  if (!("__VEJICE_LAST_DEBUG_DUMP__" in window)) {
    window.__VEJICE_LAST_DEBUG_DUMP__ = null;
  }
  window.__VEJICE_DEBUG_DUMP_READY__ = true;
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.__VEJICE_DEBUG_STATE__.getParagraphAnchorsOnline = function () {
    return anchorProvider.paragraphAnchors;
  };
  window.getVejiceDebugDump = function () {
    return window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  };
  window.getVejiceDebugDumps = function () {
    return Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? _toConsumableArray(window.__VEJICE_DEBUG_DUMPS__) : [];
  };
  window.getVejiceDebugStatus = function () {
    return {
      ready: Boolean(window.__VEJICE_DEBUG_DUMP_READY__),
      debug: window.__VEJICE_DEBUG__,
      dump: window.__VEJICE_DEBUG_DUMP__,
      state: _typeof(window.__VEJICE_DEBUG_STATE__),
      dumps: Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? window.__VEJICE_DEBUG_DUMPS__.length : 0,
      hasLastDump: Boolean(window.__VEJICE_LAST_DEBUG_DUMP__)
    };
  };
  window.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.getPendingSuggestionsSnapshot = function () {
    return getPendingSuggestionsOnline(true);
  };
}
var toastDialog = null;
function showToastNotification(message) {
  var _Office$context;
  if (!message) return;
  if (typeof Office === "undefined" || !((_Office$context = Office.context) !== null && _Office$context !== void 0 && (_Office$context = _Office$context.ui) !== null && _Office$context !== void 0 && _Office$context.displayDialogAsync)) {
    warn("Toast notification unavailable", message);
    return;
  }
  var origin = typeof window !== "undefined" && window.location && window.location.origin || null;
  if (!origin) {
    warn("Toast notification: origin unavailable");
    return;
  }
  var toastUrl = new URL("toast.html", origin);
  toastUrl.searchParams.set("message", message);
  Office.context.ui.displayDialogAsync(toastUrl.toString(), {
    height: 20,
    width: 30,
    displayInIframe: true
  }, function (asyncResult) {
    if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      warn("Toast notification failed", asyncResult.error);
      return;
    }
    if (toastDialog) {
      try {
        toastDialog.close();
      } catch (err) {
        warn("Toast notification: failed to close previous dialog", err);
      }
    }
    toastDialog = asyncResult.value;
    var closeDialog = function closeDialog() {
      if (!toastDialog) return;
      try {
        toastDialog.close();
      } catch (err) {
        warn("Toast notification: failed to close dialog", err);
      } finally {
        toastDialog = null;
      }
    };
    toastDialog.addEventHandler(Office.EventType.DialogMessageReceived, closeDialog);
    toastDialog.addEventHandler(Office.EventType.DialogEventReceived, closeDialog);
  });
}
function queueScanNotification(message) {
  if (!message) return;
  pendingScanNotifications.push(message);
}
function flushScanNotifications() {
  if (!pendingScanNotifications.length) return;
  var seen = new Set();
  var uniqueMessages = [];
  var _iterator2 = _createForOfIteratorHelper(pendingScanNotifications),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var message = _step2.value;
      if (!message || seen.has(message)) continue;
      seen.add(message);
      uniqueMessages.push(message);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  pendingScanNotifications.length = 0;
  if (!uniqueMessages.length) return;
  showToastNotification(uniqueMessages.join("\n"));
}
function notifyParagraphTooLong(paragraphIndex, length) {
  var label = paragraphIndex + 1;
  var msg = "Odstavek ".concat(label, ": ").concat(LONG_PARAGRAPH_MESSAGE, " (").concat(length, " znakov).");
  warn("Paragraph too long – skipped", {
    paragraphIndex: paragraphIndex,
    length: length
  });
  queueScanNotification(msg);
}
function notifySentenceTooLong(paragraphIndex, length) {
  var label = paragraphIndex + 1;
  var msg = "Odstavek ".concat(label, ": ").concat(LONG_SENTENCE_MESSAGE, " (").concat(length, " znakov).");
  warn("Sentence too long – skipped", {
    paragraphIndex: paragraphIndex,
    length: length
  });
  if (longSentenceNotified) return;
  longSentenceNotified = true;
  queueScanNotification(msg);
}
function notifyChunkApiFailure(paragraphIndex, chunkIndex) {
  warn("Sentence skipped due to API error", {
    paragraphIndex: paragraphIndex,
    chunkIndex: chunkIndex
  });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  queueScanNotification(CHUNK_API_ERROR_MESSAGE);
}
function notifyChunkNonCommaChanges(paragraphIndex, chunkIndex, original, corrected) {
  warn("Sentence skipped due to non-comma changes", {
    paragraphIndex: paragraphIndex,
    chunkIndex: chunkIndex,
    original: original,
    corrected: corrected
  });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  queueScanNotification(CHUNK_API_ERROR_MESSAGE);
}
var anchorProvider = createAnchorProvider();
var anchorProviderSupportsCharHints = typeof anchorProvider.supportsCharHints === "function" ? anchorProvider.supportsCharHints() : false;
if (anchorProviderSupportsCharHints) {
  log("Anchor provider supports char hints; snippet fallback cleanup disabled");
}
var commaEngine = new _engine_CommaSuggestionEngine_js__WEBPACK_IMPORTED_MODULE_2__.CommaSuggestionEngine({
  anchorProvider: anchorProvider,
  apiClient: {
    popraviPoved: _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__.popraviPoved,
    popraviPovedDetailed: _api_apiVejice_js__WEBPACK_IMPORTED_MODULE_0__.popraviPovedDetailed
  },
  notifiers: {
    onParagraphTooLong: notifyParagraphTooLong,
    onSentenceTooLong: notifySentenceTooLong,
    onChunkApiFailure: notifyChunkApiFailure,
    onChunkNonCommaChanges: notifyChunkNonCommaChanges
  }
});
if (typeof window !== "undefined") {
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDump = function () {
    return commaEngine.lastDebugDump || null;
  };
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDumps = function () {
    return Array.isArray(commaEngine.debugDumps) ? _toConsumableArray(commaEngine.debugDumps) : [];
  };
  window.getVejiceDebugDump = function () {
    return commaEngine.lastDebugDump || window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  };
  window.getVejiceDebugDumps = function () {
    if (Array.isArray(commaEngine.debugDumps) && commaEngine.debugDumps.length) {
      return _toConsumableArray(commaEngine.debugDumps);
    }
    return Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? _toConsumableArray(window.__VEJICE_DEBUG_DUMPS__) : [];
  };
}
var onlineTextBridge = new _bridges_onlineTextBridge_js__WEBPACK_IMPORTED_MODULE_7__.OnlineTextBridge({
  applyInsertSuggestion: applyInsertSuggestion,
  applyDeleteSuggestion: applyDeleteSuggestion
});
var desktopTextBridge = new _bridges_desktopTextBridge_js__WEBPACK_IMPORTED_MODULE_8__.DesktopTextBridge({
  applyInsertSuggestion: applyInsertSuggestion,
  applyDeleteSuggestion: applyDeleteSuggestion
});
var normalizationProbeCount = 0;
function getActiveTextBridge() {
  return (0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)() ? onlineTextBridge : desktopTextBridge;
}
function getNormalizationProfile() {
  return getActiveTextBridge().getNormalizationProfile();
}
var wordOnlineAdapter = new _adapters_wordOnlineAdapter_js__WEBPACK_IMPORTED_MODULE_5__.WordOnlineAdapter({
  highlightSuggestion: highlightSuggestionOnline,
  textBridge: onlineTextBridge,
  clearSuggestionMarkers: clearOnlineSuggestionMarkers
});
var wordDesktopAdapter = new _adapters_wordDesktopAdapter_js__WEBPACK_IMPORTED_MODULE_6__.WordDesktopAdapter({
  textBridge: desktopTextBridge,
  trace: function trace() {
    return log.apply(void 0, arguments);
  }
});
function notifyParagraphNonCommaChanges(paragraphIndex, original, corrected) {
  var label = paragraphIndex + 1;
  warn("Paragraph skipped due to non-comma changes", {
    paragraphIndex: paragraphIndex,
    original: original,
    corrected: corrected
  });
  queueScanNotification("Odstavek ".concat(label, ": ").concat(PARAGRAPH_NON_COMMA_MESSAGE));
}
function notifyTrackedChangesPresent() {
  warn("Tracked changes present – aborting check");
  queueScanNotification(TRACKED_CHANGES_PRESENT_MESSAGE);
}
function notifyTrackChangesRequired() {
  warn("Track changes disabled – aborting check");
  queueScanNotification(TRACK_CHANGES_REQUIRED_MESSAGE);
}
var apiFailureNotified = false;
function notifyApiUnavailable() {
  if (apiFailureNotified) return;
  apiFailureNotified = true;
  warn("API unavailable – notifying toast");
  queueScanNotification(API_UNAVAILABLE_MESSAGE);
}
function notifyNoIssuesFound() {
  log("No comma issues found – notifying toast");
  queueScanNotification(NO_ISSUES_FOUND_MESSAGE);
}
function resetNotificationFlags() {
  apiFailureNotified = false;
  longSentenceNotified = false;
  chunkApiFailureNotified = false;
  pendingScanNotifications.length = 0;
}
function documentHasTrackedChanges(_x) {
  return _documentHasTrackedChanges.apply(this, arguments);
}
function _documentHasTrackedChanges() {
  _documentHasTrackedChanges = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(context) {
    var revisions, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (context !== null && context !== void 0 && context.document) {
            _context.n = 1;
            break;
          }
          return _context.a(2, false);
        case 1:
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context.n = 2;
            break;
          }
          return _context.a(2, false);
        case 2:
          revisions = context.document.revisions;
          if (!(!revisions || typeof revisions.load !== "function")) {
            _context.n = 3;
            break;
          }
          return _context.a(2, false);
        case 3:
          _context.p = 3;
          log("Desktop phase: revisions.load(items) -> sync:start");
          revisions.load("items");
          _context.n = 4;
          return context.sync();
        case 4:
          log("Desktop phase: revisions.load(items) -> sync:done", revisions.items.length);
          return _context.a(2, revisions.items.length > 0);
        case 5:
          _context.p = 5;
          _t = _context.v;
          if (!((_t === null || _t === void 0 ? void 0 : _t.code) === "ApiNotFound")) {
            _context.n = 6;
            break;
          }
          warn("Revisions API unavailable on this host – skipping tracked changes guard");
          return _context.a(2, false);
        case 6:
          throw _t;
        case 7:
          return _context.a(2);
      }
    }, _callee, null, [[3, 5]]);
  }));
  return _documentHasTrackedChanges.apply(this, arguments);
}
function countSnippetOccurrencesBefore(text, snippet, limit) {
  if (!snippet) return 0;
  var safeText = typeof text === "string" ? text : "";
  var hop = Math.max(1, snippet.length);
  var count = 0;
  var idx = safeText.indexOf(snippet);
  while (idx !== -1 && idx < limit) {
    count++;
    idx = safeText.indexOf(snippet, idx + hop);
  }
  return count;
}
function canonicalizeWithBoundaryMap(text) {
  var profile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getNormalizationProfile();
  var source = typeof text === "string" ? text : "";
  var canonical = "";
  var boundary = new Array(source.length + 1).fill(0);
  var prevWasSpace = false;
  var normalizeChar = function normalizeChar(ch) {
    if (profile !== null && profile !== void 0 && profile.normalizeQuotes) {
      if ("\"“”„«»".includes(ch)) return "\"";
      if ("'`´‘’".includes(ch)) return "'";
    }
    if (profile !== null && profile !== void 0 && profile.normalizeDashes && "–—‑−".includes(ch)) {
      return "-";
    }
    if (profile !== null && profile !== void 0 && profile.normalizeEllipsis && ch === "…") {
      return "...";
    }
    return ch;
  };
  for (var i = 0; i < source.length; i++) {
    var ch = source[i];
    var isSpace = /[\s\u00A0\u202F\u2007]/.test(ch);
    if (isSpace) {
      if ((profile === null || profile === void 0 ? void 0 : profile.collapseWhitespace) !== false) {
        if (!prevWasSpace) {
          canonical += " ";
          prevWasSpace = true;
        }
      } else {
        canonical += ch;
        prevWasSpace = false;
      }
    } else {
      canonical += normalizeChar(ch);
      prevWasSpace = false;
    }
    boundary[i + 1] = canonical.length;
  }
  return {
    canonical: canonical,
    boundary: boundary
  };
}
function logNormalizationProbe(sourceText, targetText, sourceIndex, profile) {
  if (!DEBUG || normalizationProbeCount >= MAX_NORMALIZATION_PROBES) return;
  normalizationProbeCount++;
  var idx = Math.max(0, Math.floor(sourceIndex || 0));
  var left = Math.max(0, idx - 18);
  var right = Math.min((sourceText || "").length, idx + 18);
  var targetLeft = Math.max(0, idx - 18);
  var targetRight = Math.min((targetText || "").length, idx + 18);
  warn("normalization probe: prefix mismatch", {
    profile: profile,
    sourceIndex: idx,
    sourceSnippet: (sourceText || "").slice(left, right),
    targetSnippet: (targetText || "").slice(targetLeft, targetRight)
  });
}
function mapIndexAcrossCanonical(sourceText, targetText, sourceIndex) {
  var _src$boundary$safeSrc;
  var profile = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : getNormalizationProfile();
  if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return 0;
  var src = canonicalizeWithBoundaryMap(sourceText, profile);
  var dst = canonicalizeWithBoundaryMap(targetText, profile);
  if (!src.canonical.length || !dst.canonical.length) return 0;
  var safeSrcIndex = Math.max(0, Math.min(Math.floor(sourceIndex), sourceText.length));
  var srcCanonicalPos = (_src$boundary$safeSrc = src.boundary[safeSrcIndex]) !== null && _src$boundary$safeSrc !== void 0 ? _src$boundary$safeSrc : 0;
  var srcPrefix = src.canonical.slice(0, srcCanonicalPos);
  var directPos = dst.canonical.startsWith(srcPrefix) ? srcCanonicalPos : -1;
  if (directPos < 0) {
    logNormalizationProbe(sourceText, targetText, sourceIndex, profile);
  }
  var estimatePos = src.canonical.length > 0 ? Math.round(srcCanonicalPos / src.canonical.length * dst.canonical.length) : srcCanonicalPos;
  var findBestFallbackPos = function findBestFallbackPos() {
    var leftCtx = src.canonical.slice(Math.max(0, srcCanonicalPos - 20), srcCanonicalPos);
    var rightCtx = src.canonical.slice(srcCanonicalPos, Math.min(src.canonical.length, srcCanonicalPos + 20));
    if (!leftCtx && !rightCtx) return Math.min(Math.max(0, estimatePos), dst.canonical.length);
    var candidates = [];
    if (leftCtx) {
      var idx = dst.canonical.indexOf(leftCtx);
      while (idx !== -1) {
        candidates.push(idx + leftCtx.length);
        idx = dst.canonical.indexOf(leftCtx, idx + 1);
      }
    } else if (rightCtx) {
      var _idx = dst.canonical.indexOf(rightCtx);
      while (_idx !== -1) {
        candidates.push(_idx);
        _idx = dst.canonical.indexOf(rightCtx, _idx + 1);
      }
    }
    if (!candidates.length) return Math.min(Math.max(0, estimatePos), dst.canonical.length);
    var bestPos = candidates[0];
    var bestScore = Number.POSITIVE_INFINITY;
    for (var _i = 0, _candidates = candidates; _i < _candidates.length; _i++) {
      var pos = _candidates[_i];
      var dstRight = dst.canonical.slice(pos, Math.min(dst.canonical.length, pos + rightCtx.length));
      var mismatch = 0;
      var overlap = Math.min(dstRight.length, rightCtx.length);
      for (var i = 0; i < overlap; i++) {
        if (dstRight[i] !== rightCtx[i]) mismatch++;
      }
      mismatch += Math.abs(rightCtx.length - dstRight.length);
      var distance = Math.abs(pos - estimatePos);
      var score = mismatch * 3 + distance;
      if (score < bestScore) {
        bestScore = score;
        bestPos = pos;
      }
    }
    return Math.min(Math.max(0, bestPos), dst.canonical.length);
  };
  var targetCanonicalPos = directPos >= 0 ? Math.min(directPos, dst.canonical.length) : findBestFallbackPos();
  if (targetCanonicalPos <= 0) return 0;
  var low = 0;
  var high = targetText.length;
  while (low < high) {
    var _dst$boundary$mid;
    var mid = Math.floor((low + high) / 2);
    if (((_dst$boundary$mid = dst.boundary[mid]) !== null && _dst$boundary$mid !== void 0 ? _dst$boundary$mid : 0) < targetCanonicalPos) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return Math.max(0, Math.min(low, targetText.length));
}
function getRangeForCharacterSpan(_x2, _x3, _x4, _x5, _x6) {
  return _getRangeForCharacterSpan.apply(this, arguments);
}
function _getRangeForCharacterSpan() {
  _getRangeForCharacterSpan = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(context, paragraph, paragraphText, charStart, charEnd) {
    var reason,
      fallbackSnippet,
      text,
      safeStart,
      computedEnd,
      safeEnd,
      snippet,
      _matches,
      _matches2,
      liveText,
      searchSnippet,
      matches,
      mappedStart,
      occurrence,
      idx,
      _args2 = arguments,
      _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          reason = _args2.length > 5 && _args2[5] !== undefined ? _args2[5] : "span";
          fallbackSnippet = _args2.length > 6 ? _args2[6] : undefined;
          if (!(!paragraph || typeof paragraph.getRange !== "function")) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, null);
        case 1:
          if (!(!Number.isFinite(charStart) || charStart < 0)) {
            _context2.n = 2;
            break;
          }
          return _context2.a(2, null);
        case 2:
          text = typeof paragraphText === "string" ? paragraphText : paragraph.text || "";
          if (text) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, null);
        case 3:
          safeStart = Math.max(0, Math.min(Math.floor(charStart), text.length ? text.length - 1 : 0));
          computedEnd = Math.max(safeStart + 1, Math.floor(charEnd !== null && charEnd !== void 0 ? charEnd : safeStart + 1));
          safeEnd = Math.min(computedEnd, text.length);
          snippet = text.slice(safeStart, safeEnd);
          if (!snippet && typeof fallbackSnippet === "string" && fallbackSnippet.length) {
            snippet = fallbackSnippet;
          }
          if (snippet) {
            _context2.n = 4;
            break;
          }
          return _context2.a(2, null);
        case 4:
          _context2.p = 4;
          if (!(typeof paragraph.text !== "string")) {
            _context2.n = 5;
            break;
          }
          paragraph.load("text");
          _context2.n = 5;
          return context.sync();
        case 5:
          liveText = typeof paragraph.text === "string" ? paragraph.text : text;
          searchSnippet = snippet;
          _context2.n = 6;
          return searchParagraphForSnippet(context, paragraph, searchSnippet);
        case 6:
          matches = _context2.v;
          if (!(!((_matches = matches) !== null && _matches !== void 0 && (_matches = _matches.items) !== null && _matches !== void 0 && _matches.length) && snippet.trim() && snippet.trim() !== snippet)) {
            _context2.n = 8;
            break;
          }
          searchSnippet = snippet.trim();
          _context2.n = 7;
          return searchParagraphForSnippet(context, paragraph, searchSnippet);
        case 7:
          matches = _context2.v;
        case 8:
          if ((_matches2 = matches) !== null && _matches2 !== void 0 && (_matches2 = _matches2.items) !== null && _matches2 !== void 0 && _matches2.length) {
            _context2.n = 9;
            break;
          }
          warn("getRangeForCharacterSpan(".concat(reason, "): snippet not found"), {
            snippet: snippet,
            safeStart: safeStart
          });
          return _context2.a(2, null);
        case 9:
          mappedStart = mapIndexAcrossCanonical(text, liveText, safeStart);
          occurrence = countSnippetOccurrencesBefore(liveText, searchSnippet, mappedStart);
          idx = Math.min(occurrence, matches.items.length - 1);
          return _context2.a(2, matches.items[idx]);
        case 10:
          _context2.p = 10;
          _t2 = _context2.v;
          warn("getRangeForCharacterSpan(".concat(reason, ") failed"), _t2);
          return _context2.a(2, null);
      }
    }, _callee2, null, [[4, 10]]);
  }));
  return _getRangeForCharacterSpan.apply(this, arguments);
}
function getRangeForAnchorSpan(_x7, _x8, _x9, _x0, _x1) {
  return _getRangeForAnchorSpan.apply(this, arguments);
}
function _getRangeForAnchorSpan() {
  _getRangeForAnchorSpan = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(context, paragraph, anchorsEntry, charStart, charEnd) {
    var reason,
      fallbackSnippet,
      candidates,
      liveText,
      _i2,
      _candidates2,
      candidate,
      range,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          reason = _args3.length > 5 && _args3[5] !== undefined ? _args3[5] : "span";
          fallbackSnippet = _args3.length > 6 ? _args3[6] : undefined;
          candidates = [];
          if (anchorsEntry !== null && anchorsEntry !== void 0 && anchorsEntry.originalText) {
            candidates.push({
              text: anchorsEntry.originalText,
              label: "orig"
            });
          }
          liveText = paragraph === null || paragraph === void 0 ? void 0 : paragraph.text;
          if (liveText && (!candidates.length || liveText !== candidates[0].text)) {
            candidates.push({
              text: liveText,
              label: "live"
            });
          }
          if (!candidates.length) {
            candidates.push({
              text: "",
              label: "empty"
            });
          }
          _i2 = 0, _candidates2 = candidates;
        case 1:
          if (!(_i2 < _candidates2.length)) {
            _context3.n = 5;
            break;
          }
          candidate = _candidates2[_i2];
          if (candidate.text) {
            _context3.n = 2;
            break;
          }
          return _context3.a(3, 4);
        case 2:
          _context3.n = 3;
          return getRangeForCharacterSpan(context, paragraph, candidate.text, charStart, charEnd, "".concat(reason, "-").concat(candidate.label), fallbackSnippet);
        case 3:
          range = _context3.v;
          if (!range) {
            _context3.n = 4;
            break;
          }
          return _context3.a(2, range);
        case 4:
          _i2++;
          _context3.n = 1;
          break;
        case 5:
          return _context3.a(2, null);
      }
    }, _callee3);
  }));
  return _getRangeForAnchorSpan.apply(this, arguments);
}
function searchParagraphForSnippet(_x10, _x11, _x12) {
  return _searchParagraphForSnippet.apply(this, arguments);
}
function _searchParagraphForSnippet() {
  _searchParagraphForSnippet = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(context, paragraph, snippet) {
    var range, matches;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          range = paragraph.getRange();
          matches = range.search(snippet, {
            matchCase: true,
            matchWholeWord: false,
            ignoreSpace: false,
            ignorePunct: false
          });
          matches.load("items");
          _context4.n = 1;
          return context.sync();
        case 1:
          return _context4.a(2, matches);
      }
    }, _callee4);
  }));
  return _searchParagraphForSnippet.apply(this, arguments);
}
function getRangesForPlannedOperations(_x13, _x14, _x15, _x16) {
  return _getRangesForPlannedOperations.apply(this, arguments);
}
function _getRangesForPlannedOperations() {
  _getRangesForPlannedOperations = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(context, paragraph, snapshotText, plan) {
    var reason,
      text,
      liveText,
      searchOptions,
      requests,
      searchCache,
      perOpVariants,
      _args5 = arguments;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          reason = _args5.length > 4 && _args5[4] !== undefined ? _args5[4] : "apply-planned";
          if (!(!Array.isArray(plan) || !plan.length)) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2, []);
        case 1:
          if (!(!paragraph || typeof paragraph.getRange !== "function")) {
            _context5.n = 2;
            break;
          }
          return _context5.a(2, plan.map(function () {
            return null;
          }));
        case 2:
          if (!(typeof paragraph.text !== "string")) {
            _context5.n = 3;
            break;
          }
          paragraph.load("text");
          _context5.n = 3;
          return context.sync();
        case 3:
          text = typeof snapshotText === "string" ? snapshotText : paragraph.text || "";
          liveText = typeof paragraph.text === "string" ? paragraph.text : text;
          searchOptions = {
            matchCase: true,
            matchWholeWord: false,
            ignoreSpace: false,
            ignorePunct: false
          };
          requests = [];
          searchCache = new Map();
          perOpVariants = plan.map(function (op, opIndex) {
            var _op$start, _op$end;
            var safeStart = Math.max(0, Math.min(Math.floor((_op$start = op.start) !== null && _op$start !== void 0 ? _op$start : 0), Math.max(0, text.length - 1)));
            var computedEnd = Math.max(safeStart + 1, Math.floor((_op$end = op.end) !== null && _op$end !== void 0 ? _op$end : safeStart + 1));
            var safeEnd = Math.min(computedEnd, text.length);
            var snippet = text.slice(safeStart, safeEnd);
            if (!snippet && typeof (op === null || op === void 0 ? void 0 : op.snippet) === "string" && op.snippet.length) {
              snippet = op.snippet;
            }
            if (!snippet) return [];
            var variants = [];
            variants.push({
              text: snippet,
              safeStart: safeStart
            });
            var trimmed = snippet.trim();
            if (trimmed && trimmed !== snippet) {
              variants.push({
                text: trimmed,
                safeStart: safeStart
              });
            }
            var unique = [];
            var seen = new Set();
            for (var _i3 = 0, _variants = variants; _i3 < _variants.length; _i3++) {
              var variant = _variants[_i3];
              if (seen.has(variant.text)) continue;
              seen.add(variant.text);
              var matches = searchCache.get(variant.text);
              if (!matches) {
                matches = paragraph.getRange().search(variant.text, searchOptions);
                matches.load("items");
                searchCache.set(variant.text, matches);
                requests.push({
                  matches: matches,
                  text: variant.text,
                  safeStart: safeStart,
                  opIndex: opIndex
                });
              }
              unique.push({
                text: variant.text,
                safeStart: safeStart,
                matches: matches
              });
            }
            return unique;
          });
          if (!requests.length) {
            _context5.n = 4;
            break;
          }
          _context5.n = 4;
          return context.sync();
        case 4:
          return _context5.a(2, plan.map(function (op, opIndex) {
            var variants = perOpVariants[opIndex] || [];
            if (!variants.length) return null;
            var _iterator5 = _createForOfIteratorHelper(variants),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var _variant$matches;
                var variant = _step5.value;
                var items = ((_variant$matches = variant.matches) === null || _variant$matches === void 0 ? void 0 : _variant$matches.items) || [];
                if (!items.length) continue;
                var mappedStart = mapIndexAcrossCanonical(text, liveText, variant.safeStart);
                var occurrence = countSnippetOccurrencesBefore(liveText, variant.text, mappedStart);
                var idx = Math.min(occurrence, items.length - 1);
                return items[idx];
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
            var fallback = variants[0];
            warn("getRangesForPlannedOperations(".concat(reason, "): snippet not found"), {
              snippet: fallback === null || fallback === void 0 ? void 0 : fallback.text,
              safeStart: fallback === null || fallback === void 0 ? void 0 : fallback.safeStart
            });
            return null;
          }));
      }
    }, _callee5);
  }));
  return _getRangesForPlannedOperations.apply(this, arguments);
}
function buildDeleteSuggestionMetadata(entry, charIndex) {
  var _entry$documentOffset, _entry$originalText, _entry$paragraphIndex;
  var sourceAround = findAnchorsNearChar(entry, "source", charIndex);
  var documentOffset = (_entry$documentOffset = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset !== void 0 ? _entry$documentOffset : 0;
  var charStart = Math.max(0, charIndex);
  var charEnd = charStart + 1;
  var paragraphText = (_entry$originalText = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText !== void 0 ? _entry$originalText : "";
  var highlightText = paragraphText.slice(charStart, charEnd) || ",";
  return {
    kind: "delete",
    paragraphIndex: (_entry$paragraphIndex = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex !== void 0 ? _entry$paragraphIndex : -1,
    charStart: charStart,
    charEnd: charEnd,
    documentCharStart: documentOffset + charStart,
    documentCharEnd: documentOffset + charEnd,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    highlightText: highlightText
  };
}
function buildInsertSuggestionMetadata(entry, _ref) {
  var _entry$documentOffset2, _ref2, _ref3, _ref4, _ref5, _sourceAround$at, _highlightAnchor$char, _highlightAnchor$char2, _entry$originalText2, _entry$paragraphIndex2;
  var originalCharIndex = _ref.originalCharIndex,
    targetCharIndex = _ref.targetCharIndex;
  var srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  var targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  var sourceAround = findAnchorsNearChar(entry, "source", srcIndex);
  var targetAround = findAnchorsNearChar(entry, "target", targetIndex);
  var documentOffset = (_entry$documentOffset2 = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset2 !== void 0 ? _entry$documentOffset2 : 0;
  var highlightAnchor = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_sourceAround$at = sourceAround.at) !== null && _sourceAround$at !== void 0 ? _sourceAround$at : sourceAround.before) !== null && _ref5 !== void 0 ? _ref5 : sourceAround.after) !== null && _ref4 !== void 0 ? _ref4 : targetAround.at) !== null && _ref3 !== void 0 ? _ref3 : targetAround.before) !== null && _ref2 !== void 0 ? _ref2 : targetAround.after;
  var highlightCharStart = (_highlightAnchor$char = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charStart) !== null && _highlightAnchor$char !== void 0 ? _highlightAnchor$char : srcIndex;
  var highlightCharEnd = (_highlightAnchor$char2 = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charEnd) !== null && _highlightAnchor$char2 !== void 0 ? _highlightAnchor$char2 : srcIndex;
  var paragraphText = (_entry$originalText2 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText2 !== void 0 ? _entry$originalText2 : "";
  var highlightText = "";
  if (highlightCharStart >= 0 && highlightCharEnd > highlightCharStart) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharEnd);
  }
  if (!highlightText && highlightCharStart >= 0) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharStart + 1);
  }
  return {
    kind: "insert",
    paragraphIndex: (_entry$paragraphIndex2 = entry === null || entry === void 0 ? void 0 : entry.paragraphIndex) !== null && _entry$paragraphIndex2 !== void 0 ? _entry$paragraphIndex2 : -1,
    targetCharStart: targetIndex,
    targetCharEnd: targetIndex >= 0 ? targetIndex + 1 : targetIndex,
    targetDocumentCharStart: targetIndex >= 0 ? documentOffset + targetIndex : targetIndex,
    targetDocumentCharEnd: targetIndex >= 0 ? documentOffset + targetIndex + 1 : targetIndex,
    highlightCharStart: highlightCharStart,
    highlightCharEnd: highlightCharEnd,
    highlightText: highlightText,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    targetTokenBefore: snapshotAnchor(targetAround.before),
    targetTokenAt: snapshotAnchor(targetAround.at),
    targetTokenAfter: snapshotAnchor(targetAround.after),
    highlightAnchorTarget: snapshotAnchor(highlightAnchor)
  };
}
function buildDeleteRangeCandidates(suggestion) {
  var _suggestion$meta;
  var ranges = [];
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta = suggestion.meta) === null || _suggestion$meta === void 0 ? void 0 : _suggestion$meta.anchor;
  if (!meta) return ranges;
  var addRange = function addRange(start, end, snippet) {
    if (!Number.isFinite(start) || start < 0) return;
    var safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({
      start: start,
      end: safeEnd,
      snippet: snippet
    });
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  if (meta.highlightAnchorTarget) {
    addRange(meta.highlightAnchorTarget.charStart, meta.highlightAnchorTarget.charEnd, meta.highlightAnchorTarget.tokenText);
  }
  var charHint = suggestion === null || suggestion === void 0 ? void 0 : suggestion.charHint;
  addRange(charHint === null || charHint === void 0 ? void 0 : charHint.start, charHint === null || charHint === void 0 ? void 0 : charHint.end, meta.highlightText);
  return ranges;
}
function buildInsertRangeCandidates(suggestion) {
  var _suggestion$meta2;
  var ranges = [];
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta2 = suggestion.meta) === null || _suggestion$meta2 === void 0 ? void 0 : _suggestion$meta2.anchor;
  if (!meta) return ranges;
  var addRange = function addRange(start, end, snippet) {
    if (!Number.isFinite(start) || start < 0) return;
    var safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({
      start: start,
      end: safeEnd,
      snippet: snippet
    });
  };
  var addAnchor = function addAnchor(anchor) {
    if (!anchor) return;
    addRange(anchor.charStart, anchor.charEnd, anchor.tokenText);
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.targetCharStart, meta.targetCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  var charHint = suggestion === null || suggestion === void 0 ? void 0 : suggestion.charHint;
  addRange(charHint === null || charHint === void 0 ? void 0 : charHint.start, charHint === null || charHint === void 0 ? void 0 : charHint.end, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.targetTokenBefore);
  return ranges;
}

// Vstavi vejico na podlagi sidra
function insertCommaAt(_x17, _x18, _x19, _x20, _x21) {
  return _insertCommaAt.apply(this, arguments);
} // Po potrebi dodaj presledek po vejici (razen pred narekovaji ali števkami)
function _insertCommaAt() {
  _insertCommaAt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(context, paragraph, original, corrected, atCorrectedPos) {
    var _makeAnchor, left, right, pr, m, after, _m, before;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          _makeAnchor = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.makeAnchor)(corrected, atCorrectedPos), left = _makeAnchor.left, right = _makeAnchor.right;
          pr = paragraph.getRange();
          if (!(left.length > 0)) {
            _context6.n = 3;
            break;
          }
          m = pr.search(left, {
            matchCase: false,
            matchWholeWord: false
          });
          m.load("items");
          _context6.n = 1;
          return context.sync();
        case 1:
          if (m.items.length) {
            _context6.n = 2;
            break;
          }
          warn("insert: left anchor not found");
          return _context6.a(2);
        case 2:
          after = m.items[0].getRange("After");
          after.insertText(",", Word.InsertLocation.before);
          _context6.n = 7;
          break;
        case 3:
          if (right) {
            _context6.n = 4;
            break;
          }
          warn("insert: no right anchor at paragraph start");
          return _context6.a(2);
        case 4:
          _m = pr.search(right, {
            matchCase: false,
            matchWholeWord: false
          });
          _m.load("items");
          _context6.n = 5;
          return context.sync();
        case 5:
          if (_m.items.length) {
            _context6.n = 6;
            break;
          }
          warn("insert: right anchor not found");
          return _context6.a(2);
        case 6:
          before = _m.items[0].getRange("Before");
          before.insertText(",", Word.InsertLocation.before);
        case 7:
          return _context6.a(2);
      }
    }, _callee6);
  }));
  return _insertCommaAt.apply(this, arguments);
}
function ensureSpaceAfterComma(_x22, _x23, _x24, _x25) {
  return _ensureSpaceAfterComma.apply(this, arguments);
} // Briši samo znak vejice
function _ensureSpaceAfterComma() {
  _ensureSpaceAfterComma = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(context, paragraph, corrected, atCorrectedPos) {
    var next, _makeAnchor2, left, right, pr, m, beforeRight, _m2, before;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          next = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.charAtSafe)(corrected, atCorrectedPos + 1);
          if (!(!next || /\s/.test(next) || _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(next) || (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(next))) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2);
        case 1:
          _makeAnchor2 = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.makeAnchor)(corrected, atCorrectedPos + 1), left = _makeAnchor2.left, right = _makeAnchor2.right;
          pr = paragraph.getRange();
          if (!(left.length > 0)) {
            _context7.n = 4;
            break;
          }
          m = pr.search(left, {
            matchCase: false,
            matchWholeWord: false
          });
          m.load("items");
          _context7.n = 2;
          return context.sync();
        case 2:
          if (m.items.length) {
            _context7.n = 3;
            break;
          }
          warn("space-after: left anchor not found");
          return _context7.a(2);
        case 3:
          beforeRight = m.items[0].getRange("Before");
          beforeRight.insertText(" ", Word.InsertLocation.before);
          _context7.n = 7;
          break;
        case 4:
          if (!(right.length > 0)) {
            _context7.n = 7;
            break;
          }
          _m2 = pr.search(right, {
            matchCase: false,
            matchWholeWord: false
          });
          _m2.load("items");
          _context7.n = 5;
          return context.sync();
        case 5:
          if (_m2.items.length) {
            _context7.n = 6;
            break;
          }
          warn("space-after: right anchor not found");
          return _context7.a(2);
        case 6:
          before = _m2.items[0].getRange("Before");
          before.insertText(" ", Word.InsertLocation.before);
        case 7:
          return _context7.a(2);
      }
    }, _callee7);
  }));
  return _ensureSpaceAfterComma.apply(this, arguments);
}
function deleteCommaAt(_x26, _x27, _x28, _x29) {
  return _deleteCommaAt.apply(this, arguments);
}
function _deleteCommaAt() {
  _deleteCommaAt = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(context, paragraph, original, atOriginalPos) {
    var pr, ordinal, i, matches, idx;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          pr = paragraph.getRange();
          ordinal = 0;
          for (i = 0; i <= atOriginalPos && i < original.length; i++) {
            if (original[i] === ",") ordinal++;
          }
          if (!(ordinal === 0)) {
            _context8.n = 1;
            break;
          }
          warn("delete: no comma found in original at pos", atOriginalPos);
          return _context8.a(2);
        case 1:
          matches = pr.search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          matches.load("items");
          _context8.n = 2;
          return context.sync();
        case 2:
          idx = ordinal - 1;
          if (!(idx >= matches.items.length)) {
            _context8.n = 3;
            break;
          }
          warn("delete: comma ordinal out of range", ordinal, "/", matches.items.length);
          return _context8.a(2);
        case 3:
          matches.items[idx].insertText("", Word.InsertLocation.replace);
        case 4:
          return _context8.a(2);
      }
    }, _callee8);
  }));
  return _deleteCommaAt.apply(this, arguments);
}
function highlightSuggestionOnline(_x30, _x31, _x32) {
  return _highlightSuggestionOnline.apply(this, arguments);
}
function _highlightSuggestionOnline() {
  _highlightSuggestionOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(context, paragraph, suggestion) {
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          if (suggestion) {
            _context9.n = 1;
            break;
          }
          return _context9.a(2, false);
        case 1:
          if (!(suggestion.kind === "delete")) {
            _context9.n = 2;
            break;
          }
          return _context9.a(2, highlightDeleteSuggestion(context, paragraph, suggestion));
        case 2:
          return _context9.a(2, highlightInsertSuggestion(context, paragraph, suggestion));
      }
    }, _callee9);
  }));
  return _highlightSuggestionOnline.apply(this, arguments);
}
function countCommasUpTo(text, pos) {
  var count = 0;
  for (var i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}
function highlightDeleteSuggestion(_x33, _x34, _x35) {
  return _highlightDeleteSuggestion.apply(this, arguments);
}
function _highlightDeleteSuggestion() {
  _highlightDeleteSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(context, paragraph, suggestion) {
    var _ref13, _suggestion$meta$orig, _suggestion$meta9, _suggestion$meta0, _ref14, _ref15, _suggestion$charHint$2, _suggestion$charHint3, _suggestion$meta1, _ref16, _suggestion$charHint$3, _suggestion$charHint4, _ref17, _meta$highlightText, _suggestion$meta10;
    var paragraphText, meta, entry, charStart, charEnd, highlightText, targetRange, _suggestion$meta11;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          paragraphText = (_ref13 = (_suggestion$meta$orig = (_suggestion$meta9 = suggestion.meta) === null || _suggestion$meta9 === void 0 ? void 0 : _suggestion$meta9.originalText) !== null && _suggestion$meta$orig !== void 0 ? _suggestion$meta$orig : paragraph.text) !== null && _ref13 !== void 0 ? _ref13 : "";
          meta = ((_suggestion$meta0 = suggestion.meta) === null || _suggestion$meta0 === void 0 ? void 0 : _suggestion$meta0.anchor) || {};
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          charStart = (_ref14 = (_ref15 = (_suggestion$charHint$2 = (_suggestion$charHint3 = suggestion.charHint) === null || _suggestion$charHint3 === void 0 ? void 0 : _suggestion$charHint3.start) !== null && _suggestion$charHint$2 !== void 0 ? _suggestion$charHint$2 : meta.charStart) !== null && _ref15 !== void 0 ? _ref15 : (_suggestion$meta1 = suggestion.meta) === null || _suggestion$meta1 === void 0 || (_suggestion$meta1 = _suggestion$meta1.op) === null || _suggestion$meta1 === void 0 ? void 0 : _suggestion$meta1.originalPos) !== null && _ref14 !== void 0 ? _ref14 : -1;
          charEnd = (_ref16 = (_suggestion$charHint$3 = (_suggestion$charHint4 = suggestion.charHint) === null || _suggestion$charHint4 === void 0 ? void 0 : _suggestion$charHint4.end) !== null && _suggestion$charHint$3 !== void 0 ? _suggestion$charHint$3 : meta.charEnd) !== null && _ref16 !== void 0 ? _ref16 : typeof charStart === "number" && charStart >= 0 ? charStart + 1 : charStart;
          highlightText = (_ref17 = (_meta$highlightText = meta.highlightText) !== null && _meta$highlightText !== void 0 ? _meta$highlightText : (_suggestion$meta10 = suggestion.meta) === null || _suggestion$meta10 === void 0 ? void 0 : _suggestion$meta10.highlightText) !== null && _ref17 !== void 0 ? _ref17 : ",";
          targetRange = null;
          if (!(Number.isFinite(charStart) && charStart >= 0)) {
            _context0.n = 2;
            break;
          }
          _context0.n = 1;
          return getRangeForAnchorSpan(context, paragraph, entry, charStart, charEnd, "highlight-delete", highlightText);
        case 1:
          targetRange = _context0.v;
        case 2:
          if (targetRange) {
            _context0.n = 4;
            break;
          }
          _context0.n = 3;
          return findCommaRangeByOrdinal(context, paragraph, paragraphText, (_suggestion$meta11 = suggestion.meta) === null || _suggestion$meta11 === void 0 ? void 0 : _suggestion$meta11.op);
        case 3:
          targetRange = _context0.v;
          if (targetRange) {
            _context0.n = 4;
            break;
          }
          return _context0.a(2, false);
        case 4:
          targetRange.font.highlightColor = HIGHLIGHT_DELETE;
          context.trackedObjects.add(targetRange);
          suggestion.highlightRange = targetRange;
          addPendingSuggestionOnline(suggestion);
          return _context0.a(2, true);
      }
    }, _callee0);
  }));
  return _highlightDeleteSuggestion.apply(this, arguments);
}
function highlightInsertSuggestion(_x36, _x37, _x38) {
  return _highlightInsertSuggestion.apply(this, arguments);
}
function _highlightInsertSuggestion() {
  _highlightInsertSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(context, paragraph, suggestion) {
    var _ref18, _suggestion$meta$corr, _suggestion$meta12, _suggestion$meta13, _suggestion$snippets$, _suggestion$snippets, _suggestion$meta$op$p, _suggestion$meta14, _suggestion$snippets$2, _suggestion$snippets2, _suggestion$meta$op$p2, _suggestion$meta15;
    var corrected, anchor, entry, rawLeft, rawRight, lastWord, leftContext, searchOpts, range, resolveAnchorEnd, highlightAnchorCandidate, anchorEnd, _anchor$highlightAnch, _anchor$sourceTokenAt, _anchor$targetTokenAt, metaEndCandidate, metaEnd, wordSearch, leftSearch, rightSnippet, rightSearch;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          corrected = (_ref18 = (_suggestion$meta$corr = (_suggestion$meta12 = suggestion.meta) === null || _suggestion$meta12 === void 0 ? void 0 : _suggestion$meta12.correctedText) !== null && _suggestion$meta$corr !== void 0 ? _suggestion$meta$corr : paragraph.text) !== null && _ref18 !== void 0 ? _ref18 : "";
          anchor = ((_suggestion$meta13 = suggestion.meta) === null || _suggestion$meta13 === void 0 ? void 0 : _suggestion$meta13.anchor) || {};
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          rawLeft = (_suggestion$snippets$ = (_suggestion$snippets = suggestion.snippets) === null || _suggestion$snippets === void 0 ? void 0 : _suggestion$snippets.leftSnippet) !== null && _suggestion$snippets$ !== void 0 ? _suggestion$snippets$ : corrected.slice(0, (_suggestion$meta$op$p = (_suggestion$meta14 = suggestion.meta) === null || _suggestion$meta14 === void 0 || (_suggestion$meta14 = _suggestion$meta14.op) === null || _suggestion$meta14 === void 0 ? void 0 : _suggestion$meta14.pos) !== null && _suggestion$meta$op$p !== void 0 ? _suggestion$meta$op$p : 0);
          rawRight = (_suggestion$snippets$2 = (_suggestion$snippets2 = suggestion.snippets) === null || _suggestion$snippets2 === void 0 ? void 0 : _suggestion$snippets2.rightSnippet) !== null && _suggestion$snippets$2 !== void 0 ? _suggestion$snippets$2 : corrected.slice((_suggestion$meta$op$p2 = (_suggestion$meta15 = suggestion.meta) === null || _suggestion$meta15 === void 0 || (_suggestion$meta15 = _suggestion$meta15.op) === null || _suggestion$meta15 === void 0 ? void 0 : _suggestion$meta15.pos) !== null && _suggestion$meta$op$p2 !== void 0 ? _suggestion$meta$op$p2 : 0);
          lastWord = extractLastWord(rawLeft || "");
          leftContext = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");
          searchOpts = {
            matchCase: false,
            matchWholeWord: false
          };
          range = null;
          resolveAnchorEnd = function resolveAnchorEnd(candidate) {
            if (!Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charStart) || candidate.charStart < 0) return null;
            if (Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charEnd) && candidate.charEnd > candidate.charStart) {
              return candidate.charEnd;
            }
            if (typeof (candidate === null || candidate === void 0 ? void 0 : candidate.tokenText) === "string" && candidate.tokenText.length > 0) {
              return candidate.charStart + candidate.tokenText.length;
            }
            return candidate.charStart + 1;
          };
          highlightAnchorCandidate = [anchor.highlightAnchorTarget, anchor.sourceTokenAt, anchor.targetTokenAt, anchor.sourceTokenBefore, anchor.targetTokenBefore].find(function (candidate) {
            return Number.isFinite(candidate === null || candidate === void 0 ? void 0 : candidate.charStart) && candidate.charStart >= 0;
          });
          if (!highlightAnchorCandidate) {
            _context1.n = 2;
            break;
          }
          anchorEnd = resolveAnchorEnd(highlightAnchorCandidate);
          _context1.n = 1;
          return getRangeForAnchorSpan(context, paragraph, entry, highlightAnchorCandidate.charStart, anchorEnd, "highlight-insert-anchor", highlightAnchorCandidate.tokenText || anchor.highlightText);
        case 1:
          range = _context1.v;
        case 2:
          if (!(!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0)) {
            _context1.n = 4;
            break;
          }
          metaEndCandidate = {
            charStart: anchor.highlightCharStart,
            charEnd: anchor.highlightCharEnd,
            tokenText: ((_anchor$highlightAnch = anchor.highlightAnchorTarget) === null || _anchor$highlightAnch === void 0 ? void 0 : _anchor$highlightAnch.tokenText) || ((_anchor$sourceTokenAt = anchor.sourceTokenAt) === null || _anchor$sourceTokenAt === void 0 ? void 0 : _anchor$sourceTokenAt.tokenText) || ((_anchor$targetTokenAt = anchor.targetTokenAt) === null || _anchor$targetTokenAt === void 0 ? void 0 : _anchor$targetTokenAt.tokenText) || anchor.highlightText
          };
          metaEnd = resolveAnchorEnd(metaEndCandidate);
          _context1.n = 3;
          return getRangeForAnchorSpan(context, paragraph, entry, anchor.highlightCharStart, metaEnd, "highlight-insert-meta", anchor.highlightText);
        case 3:
          range = _context1.v;
        case 4:
          if (!(!range && lastWord)) {
            _context1.n = 6;
            break;
          }
          wordSearch = paragraph.getRange().search(lastWord, {
            matchCase: false,
            matchWholeWord: true
          });
          wordSearch.load("items");
          _context1.n = 5;
          return context.sync();
        case 5:
          if (wordSearch.items.length) {
            range = wordSearch.items[wordSearch.items.length - 1];
          }
        case 6:
          if (!(!range && leftContext && leftContext.trim())) {
            _context1.n = 8;
            break;
          }
          leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
          leftSearch.load("items");
          _context1.n = 7;
          return context.sync();
        case 7:
          if (leftSearch.items.length) {
            range = leftSearch.items[leftSearch.items.length - 1];
          }
        case 8:
          if (range) {
            _context1.n = 10;
            break;
          }
          rightSnippet = (rawRight || "").replace(/,/g, "").trim();
          rightSnippet = rightSnippet.slice(0, 8);
          if (!rightSnippet) {
            _context1.n = 10;
            break;
          }
          rightSearch = paragraph.getRange().search(rightSnippet, searchOpts);
          rightSearch.load("items");
          _context1.n = 9;
          return context.sync();
        case 9:
          if (rightSearch.items.length) {
            range = rightSearch.items[0];
          }
        case 10:
          if (range) {
            _context1.n = 11;
            break;
          }
          return _context1.a(2, false);
        case 11:
          try {
            range = range.getRange("Content");
          } catch (err) {
            warn("highlight insert: failed to focus range", err);
          }
          range.font.highlightColor = HIGHLIGHT_INSERT;
          context.trackedObjects.add(range);
          suggestion.highlightRange = range;
          addPendingSuggestionOnline(suggestion);
          return _context1.a(2, true);
      }
    }, _callee1);
  }));
  return _highlightInsertSuggestion.apply(this, arguments);
}
function findCommaRangeByOrdinal(_x39, _x40, _x41, _x42) {
  return _findCommaRangeByOrdinal.apply(this, arguments);
}
function _findCommaRangeByOrdinal() {
  _findCommaRangeByOrdinal = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(context, paragraph, original, op) {
    var ordinal, commaSearch;
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          ordinal = countCommasUpTo(original, op.pos);
          if (!(ordinal <= 0)) {
            _context10.n = 1;
            break;
          }
          warn("highlight delete: no comma ordinal", op);
          return _context10.a(2, null);
        case 1:
          commaSearch = paragraph.getRange().search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          commaSearch.load("items");
          _context10.n = 2;
          return context.sync();
        case 2:
          if (!(!commaSearch.items.length || ordinal > commaSearch.items.length)) {
            _context10.n = 3;
            break;
          }
          warn("highlight delete: comma search out of range");
          return _context10.a(2, null);
        case 3:
          return _context10.a(2, commaSearch.items[ordinal - 1]);
      }
    }, _callee10);
  }));
  return _findCommaRangeByOrdinal.apply(this, arguments);
}
function extractLastWord(text) {
  var match = text.match(/((?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])+)(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*$/);
  return match ? match[1] : "";
}
function tryApplyDeleteUsingMetadata(_x43, _x44, _x45) {
  return _tryApplyDeleteUsingMetadata.apply(this, arguments);
}
function _tryApplyDeleteUsingMetadata() {
  _tryApplyDeleteUsingMetadata = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(context, paragraph, suggestion) {
    var _suggestion$meta16, _ref19, _ref20, _meta$sourceTokenAt2, _ref21, _ref22, _ref23, _suggestion$charHint$4, _suggestion$charHint5, _suggestion$meta17, _ref24, _suggestion$charHint$5, _suggestion$charHint6;
    var meta, entry, sourceAnchor, charStart, fallbackEndFromToken, charEnd, _entry$originalText3, liveText, sourceText, mappedStart, commaIndex, delta, left, right, commaRange;
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.n) {
        case 0:
          meta = suggestion === null || suggestion === void 0 || (_suggestion$meta16 = suggestion.meta) === null || _suggestion$meta16 === void 0 ? void 0 : _suggestion$meta16.anchor;
          if (meta) {
            _context11.n = 1;
            break;
          }
          return _context11.a(2, false);
        case 1:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          sourceAnchor = (_ref19 = (_ref20 = (_meta$sourceTokenAt2 = meta.sourceTokenAt) !== null && _meta$sourceTokenAt2 !== void 0 ? _meta$sourceTokenAt2 : meta.sourceTokenBefore) !== null && _ref20 !== void 0 ? _ref20 : meta.sourceTokenAfter) !== null && _ref19 !== void 0 ? _ref19 : meta.highlightAnchorTarget;
          charStart = (_ref21 = (_ref22 = (_ref23 = (_suggestion$charHint$4 = (_suggestion$charHint5 = suggestion.charHint) === null || _suggestion$charHint5 === void 0 ? void 0 : _suggestion$charHint5.start) !== null && _suggestion$charHint$4 !== void 0 ? _suggestion$charHint$4 : meta.charStart) !== null && _ref23 !== void 0 ? _ref23 : sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.charStart) !== null && _ref22 !== void 0 ? _ref22 : (_suggestion$meta17 = suggestion.meta) === null || _suggestion$meta17 === void 0 || (_suggestion$meta17 = _suggestion$meta17.op) === null || _suggestion$meta17 === void 0 ? void 0 : _suggestion$meta17.originalPos) !== null && _ref21 !== void 0 ? _ref21 : -1;
          fallbackEndFromToken = typeof (sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.tokenText) === "string" && sourceAnchor.tokenText.length > 0 ? charStart + sourceAnchor.tokenText.length : charStart + 1;
          charEnd = (_ref24 = (_suggestion$charHint$5 = (_suggestion$charHint6 = suggestion.charHint) === null || _suggestion$charHint6 === void 0 ? void 0 : _suggestion$charHint6.end) !== null && _suggestion$charHint$5 !== void 0 ? _suggestion$charHint$5 : meta.charEnd) !== null && _ref24 !== void 0 ? _ref24 : fallbackEndFromToken;
          if (!(Number.isFinite(charStart) && charStart >= 0)) {
            _context11.n = 8;
            break;
          }
          paragraph.load("text");
          _context11.n = 2;
          return context.sync();
        case 2:
          liveText = paragraph.text || "";
          sourceText = (_entry$originalText3 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText3 !== void 0 ? _entry$originalText3 : liveText;
          mappedStart = mapIndexAcrossCanonical(sourceText, liveText, charStart);
          commaIndex = -1;
          delta = 0;
        case 3:
          if (!(delta <= 3)) {
            _context11.n = 6;
            break;
          }
          left = mappedStart - delta;
          right = mappedStart + delta;
          if (!(left >= 0 && liveText[left] === ",")) {
            _context11.n = 4;
            break;
          }
          commaIndex = left;
          return _context11.a(3, 6);
        case 4:
          if (!(right < liveText.length && liveText[right] === ",")) {
            _context11.n = 5;
            break;
          }
          commaIndex = right;
          return _context11.a(3, 6);
        case 5:
          delta++;
          _context11.n = 3;
          break;
        case 6:
          if (!(commaIndex >= 0)) {
            _context11.n = 8;
            break;
          }
          _context11.n = 7;
          return getRangeForAnchorSpan(context, paragraph, entry, commaIndex, commaIndex + 1, "apply-delete-comma", ",");
        case 7:
          commaRange = _context11.v;
          if (!commaRange) {
            _context11.n = 8;
            break;
          }
          commaRange.insertText("", Word.InsertLocation.replace);
          return _context11.a(2, true);
        case 8:
          return _context11.a(2, false);
      }
    }, _callee11);
  }));
  return _tryApplyDeleteUsingMetadata.apply(this, arguments);
}
function tryApplyDeleteUsingHighlight(_x46, _x47, _x48) {
  return _tryApplyDeleteUsingHighlight.apply(this, arguments);
}
function _tryApplyDeleteUsingHighlight() {
  _tryApplyDeleteUsingHighlight = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(context, paragraph, suggestion) {
    var entry, tryByRange, candidates, i, candidate, safeEnd, span, _t4;
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.p = _context13.n) {
        case 0:
          entry = anchorProvider.getAnchorsForParagraph(suggestion === null || suggestion === void 0 ? void 0 : suggestion.paragraphIndex);
          tryByRange = /*#__PURE__*/function () {
            var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(range) {
              var _t3;
              return _regenerator().w(function (_context12) {
                while (1) switch (_context12.p = _context12.n) {
                  case 0:
                    if (range) {
                      _context12.n = 1;
                      break;
                    }
                    return _context12.a(2, false);
                  case 1:
                    _context12.p = 1;
                    range.insertText("", Word.InsertLocation.replace);
                    return _context12.a(2, true);
                  case 2:
                    _context12.p = 2;
                    _t3 = _context12.v;
                    warn("apply delete: highlight span removal failed", _t3);
                    return _context12.a(2, false);
                }
              }, _callee12, null, [[1, 2]]);
            }));
            return function tryByRange(_x80) {
              return _ref25.apply(this, arguments);
            };
          }();
          candidates = buildDeleteRangeCandidates(suggestion);
          i = 0;
        case 1:
          if (!(i < candidates.length)) {
            _context13.n = 9;
            break;
          }
          candidate = candidates[i];
          if (!(!Number.isFinite(candidate.start) || candidate.start < 0)) {
            _context13.n = 2;
            break;
          }
          return _context13.a(3, 8);
        case 2:
          safeEnd = Number.isFinite(candidate.end) && candidate.end > candidate.start ? candidate.end : candidate.start + 1;
          span = null;
          _context13.p = 3;
          _context13.n = 4;
          return getRangeForAnchorSpan(context, paragraph, entry, candidate.start, safeEnd, "apply-delete-highlight-".concat(i), candidate.snippet);
        case 4:
          span = _context13.v;
          _context13.n = 6;
          break;
        case 5:
          _context13.p = 5;
          _t4 = _context13.v;
          warn("apply delete: candidate span lookup failed", _t4);
          return _context13.a(3, 8);
        case 6:
          _context13.n = 7;
          return tryByRange(span);
        case 7:
          if (!_context13.v) {
            _context13.n = 8;
            break;
          }
          return _context13.a(2, true);
        case 8:
          i++;
          _context13.n = 1;
          break;
        case 9:
          return _context13.a(2, false);
      }
    }, _callee13, null, [[3, 5]]);
  }));
  return _tryApplyDeleteUsingHighlight.apply(this, arguments);
}
function applyDeleteSuggestionLegacy(_x49, _x50, _x51) {
  return _applyDeleteSuggestionLegacy.apply(this, arguments);
}
function _applyDeleteSuggestionLegacy() {
  _applyDeleteSuggestionLegacy = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(context, paragraph, suggestion) {
    var _ref26, _ref27, _suggestion$meta$op$o2, _suggestion$meta18, _suggestion$meta19, _suggestion$charHint7;
    var pos, ordinal, commaSearch, idx;
    return _regenerator().w(function (_context14) {
      while (1) switch (_context14.n) {
        case 0:
          pos = (_ref26 = (_ref27 = (_suggestion$meta$op$o2 = (_suggestion$meta18 = suggestion.meta) === null || _suggestion$meta18 === void 0 || (_suggestion$meta18 = _suggestion$meta18.op) === null || _suggestion$meta18 === void 0 ? void 0 : _suggestion$meta18.originalPos) !== null && _suggestion$meta$op$o2 !== void 0 ? _suggestion$meta$op$o2 : (_suggestion$meta19 = suggestion.meta) === null || _suggestion$meta19 === void 0 || (_suggestion$meta19 = _suggestion$meta19.op) === null || _suggestion$meta19 === void 0 ? void 0 : _suggestion$meta19.pos) !== null && _ref27 !== void 0 ? _ref27 : (_suggestion$charHint7 = suggestion.charHint) === null || _suggestion$charHint7 === void 0 ? void 0 : _suggestion$charHint7.start) !== null && _ref26 !== void 0 ? _ref26 : 0;
          ordinal = countCommasUpTo(paragraph.text || "", pos);
          if (!(ordinal <= 0)) {
            _context14.n = 1;
            break;
          }
          warn("apply delete: no ordinal");
          return _context14.a(2, false);
        case 1:
          commaSearch = paragraph.getRange().search(",", {
            matchCase: false,
            matchWholeWord: false
          });
          commaSearch.load("items");
          _context14.n = 2;
          return context.sync();
        case 2:
          idx = ordinal - 1;
          if (!(!commaSearch.items.length || idx >= commaSearch.items.length)) {
            _context14.n = 3;
            break;
          }
          warn("apply delete: ordinal out of range");
          return _context14.a(2, false);
        case 3:
          commaSearch.items[idx].insertText("", Word.InsertLocation.replace);
          return _context14.a(2, true);
      }
    }, _callee14);
  }));
  return _applyDeleteSuggestionLegacy.apply(this, arguments);
}
function applyDeleteSuggestion(_x52, _x53, _x54) {
  return _applyDeleteSuggestion.apply(this, arguments);
}
function _applyDeleteSuggestion() {
  _applyDeleteSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(context, paragraph, suggestion) {
    return _regenerator().w(function (_context15) {
      while (1) switch (_context15.n) {
        case 0:
          _context15.n = 1;
          return tryApplyDeleteUsingMetadata(context, paragraph, suggestion);
        case 1:
          return _context15.a(2, _context15.v);
      }
    }, _callee15);
  }));
  return _applyDeleteSuggestion.apply(this, arguments);
}
function findTokenRangeForAnchor(_x55, _x56, _x57) {
  return _findTokenRangeForAnchor.apply(this, arguments);
}
function _findTokenRangeForAnchor() {
  _findTokenRangeForAnchor = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(context, paragraph, anchorSnapshot) {
    var fallbackOrdinal, tryFind, range, trimmed;
    return _regenerator().w(function (_context17) {
      while (1) switch (_context17.n) {
        case 0:
          if (anchorSnapshot !== null && anchorSnapshot !== void 0 && anchorSnapshot.tokenText) {
            _context17.n = 1;
            break;
          }
          return _context17.a(2, null);
        case 1:
          fallbackOrdinal = typeof anchorSnapshot.textOccurrence === "number" ? anchorSnapshot.textOccurrence : typeof anchorSnapshot.tokenIndex === "number" ? anchorSnapshot.tokenIndex : 0;
          tryFind = /*#__PURE__*/function () {
            var _ref28 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(text, ordinalHint) {
              var wholeWord, matches, ordinal, targetIndex;
              return _regenerator().w(function (_context16) {
                while (1) switch (_context16.n) {
                  case 0:
                    if (text) {
                      _context16.n = 1;
                      break;
                    }
                    return _context16.a(2, null);
                  case 1:
                    wholeWord = WORD_CHAR_REGEX.test(text) && !/(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(text);
                    matches = paragraph.getRange().search(text, {
                      matchCase: false,
                      matchWholeWord: wholeWord
                    });
                    matches.load("items");
                    _context16.n = 2;
                    return context.sync();
                  case 2:
                    if (matches.items.length) {
                      _context16.n = 3;
                      break;
                    }
                    return _context16.a(2, null);
                  case 3:
                    ordinal = typeof ordinalHint === "number" ? ordinalHint : typeof anchorSnapshot.tokenIndex === "number" ? anchorSnapshot.tokenIndex : fallbackOrdinal;
                    targetIndex = Math.max(0, Math.min(ordinal, matches.items.length - 1));
                    return _context16.a(2, matches.items[targetIndex]);
                }
              }, _callee16);
            }));
            return function tryFind(_x81, _x82) {
              return _ref28.apply(this, arguments);
            };
          }();
          _context17.n = 2;
          return tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence);
        case 2:
          range = _context17.v;
          if (!range) {
            _context17.n = 3;
            break;
          }
          return _context17.a(2, range);
        case 3:
          trimmed = anchorSnapshot.tokenText.trim();
          if (!(trimmed && trimmed !== anchorSnapshot.tokenText)) {
            _context17.n = 5;
            break;
          }
          _context17.n = 4;
          return tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence);
        case 4:
          range = _context17.v;
          if (!range) {
            _context17.n = 5;
            break;
          }
          return _context17.a(2, range);
        case 5:
          return _context17.a(2, null);
      }
    }, _callee17);
  }));
  return _findTokenRangeForAnchor.apply(this, arguments);
}
function selectInsertAnchor(meta) {
  if (!meta) return null;
  var candidates = [meta.sourceTokenAfter ? {
    anchor: meta.sourceTokenAfter,
    location: Word.InsertLocation.before
  } : null, meta.sourceTokenAt ? {
    anchor: meta.sourceTokenAt,
    location: Word.InsertLocation.after
  } : null, meta.sourceTokenBefore ? {
    anchor: meta.sourceTokenBefore,
    location: Word.InsertLocation.after
  } : null, meta.targetTokenBefore ? {
    anchor: meta.targetTokenBefore,
    location: Word.InsertLocation.before
  } : null, meta.targetTokenAt ? {
    anchor: meta.targetTokenAt,
    location: Word.InsertLocation.after
  } : null].filter(Boolean);
  var _iterator3 = _createForOfIteratorHelper(candidates),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var _candidate$anchor;
      var candidate = _step3.value;
      if (candidate !== null && candidate !== void 0 && (_candidate$anchor = candidate.anchor) !== null && _candidate$anchor !== void 0 && _candidate$anchor.matched && Number.isFinite(candidate.anchor.charStart) && candidate.anchor.charStart >= 0) {
        return candidate;
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  return null;
}
function tryApplyInsertUsingMetadata(_x58, _x59, _x60) {
  return _tryApplyInsertUsingMetadata.apply(this, arguments);
}
function _tryApplyInsertUsingMetadata() {
  _tryApplyInsertUsingMetadata = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(context, paragraph, suggestion) {
    var _suggestion$meta20, _ref33, _ref34, _ref35, _meta$highlightAnchor, _suggestion$charHint$6, _suggestion$charHint8;
    var meta, entry, insertCommaAtChar, findTokenStartByHint, cleanWordToken, replaceGapBetweenAnchors, insertCommaAfterToken, insertCommaBeforeToken, anchor, anchorStart, anchorEnd, range, _meta$sourceTokenAfte2, _meta$sourceTokenBefo2, afterAnchor, beforeAnchor, _hasTokenAnchors, insertionCharStart, hasTokenAnchors, _t5, _t6;
    return _regenerator().w(function (_context22) {
      while (1) switch (_context22.p = _context22.n) {
        case 0:
          meta = suggestion === null || suggestion === void 0 || (_suggestion$meta20 = suggestion.meta) === null || _suggestion$meta20 === void 0 ? void 0 : _suggestion$meta20.anchor;
          if (meta) {
            _context22.n = 1;
            break;
          }
          return _context22.a(2, false);
        case 1:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          insertCommaAtChar = /*#__PURE__*/function () {
            var _ref29 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(charIndex, traceLabel) {
              var text, insertionPos, trimStart, nextChar, prevChar, withFollowingSpace, commaText, replaceWhitespaceRange, insertRange;
              return _regenerator().w(function (_context18) {
                while (1) switch (_context18.n) {
                  case 0:
                    paragraph.load("text");
                    _context18.n = 1;
                    return context.sync();
                  case 1:
                    text = paragraph.text || "";
                    if (!(!Number.isFinite(charIndex) || charIndex < 0 || charIndex > text.length)) {
                      _context18.n = 2;
                      break;
                    }
                    return _context18.a(2, false);
                  case 2:
                    // Move insertion point to first non-space char to avoid creating "word ,next".
                    insertionPos = charIndex;
                    while (insertionPos < text.length && /\s/.test(text[insertionPos])) {
                      insertionPos++;
                    }
                    // Expand backwards over spaces so we can replace "   " with ", ".
                    trimStart = insertionPos;
                    while (trimStart > 0 && /\s/.test(text[trimStart - 1])) {
                      trimStart--;
                    }
                    nextChar = insertionPos < text.length ? text[insertionPos] : "";
                    prevChar = insertionPos > 0 ? text[insertionPos - 1] : "";
                    if (!(insertionPos > 0 && insertionPos < text.length && WORD_CHAR_REGEX.test(prevChar) && WORD_CHAR_REGEX.test(nextChar))) {
                      _context18.n = 3;
                      break;
                    }
                    warn("".concat(traceLabel, ": refusing in-word comma insertion"), {
                      insertionPos: insertionPos,
                      prevChar: prevChar,
                      nextChar: nextChar
                    });
                    return _context18.a(2, false);
                  case 3:
                    withFollowingSpace = nextChar && !/\s/.test(nextChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(nextChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(nextChar);
                    commaText = withFollowingSpace ? ", " : ",";
                    if (!(trimStart < insertionPos)) {
                      _context18.n = 6;
                      break;
                    }
                    _context18.n = 4;
                    return getRangeForAnchorSpan(context, paragraph, entry, trimStart, insertionPos, "".concat(traceLabel, "-replace-whitespace"), text.slice(trimStart, insertionPos));
                  case 4:
                    replaceWhitespaceRange = _context18.v;
                    if (replaceWhitespaceRange) {
                      _context18.n = 5;
                      break;
                    }
                    return _context18.a(2, false);
                  case 5:
                    replaceWhitespaceRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context18.a(2, true);
                  case 6:
                    _context18.n = 7;
                    return getRangeForAnchorSpan(context, paragraph, entry, insertionPos, Math.min(insertionPos + 1, text.length), "".concat(traceLabel, "-insert"), meta.highlightText);
                  case 7:
                    insertRange = _context18.v;
                    if (insertRange) {
                      _context18.n = 8;
                      break;
                    }
                    return _context18.a(2, false);
                  case 8:
                    insertRange.insertText(commaText, Word.InsertLocation.before);
                    return _context18.a(2, true);
                }
              }, _callee18);
            }));
            return function insertCommaAtChar(_x83, _x84) {
              return _ref29.apply(this, arguments);
            };
          }();
          findTokenStartByHint = function findTokenStartByHint(text, rawToken, hintIndex, occurrence) {
            var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
            if (!tokenRaw || !text) return -1;
            var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
            // Only use token-based placement for clean whole words; otherwise fallback to char mapping.
            if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return -1;
            var safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
            var safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
            var tokenRegex = new RegExp("(^|[^\\p{L}\\d])(".concat(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ")(?=$|[^\\p{L}\\d])"), "gu");
            var positions = [];
            var match;
            while ((match = tokenRegex.exec(text)) !== null) {
              positions.push(match.index + match[1].length);
            }
            if (!positions.length) return -1;
            if (safeHint !== null) {
              var best = positions[0];
              var bestDist = Math.abs(positions[0] - safeHint);
              for (var i = 1; i < positions.length; i++) {
                var dist = Math.abs(positions[i] - safeHint);
                if (dist < bestDist) {
                  bestDist = dist;
                  best = positions[i];
                }
              }
              return best;
            }
            return positions[Math.min(safeOccurrence, positions.length - 1)];
          };
          cleanWordToken = function cleanWordToken(rawToken) {
            var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
            var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
            if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return null;
            return token;
          };
          replaceGapBetweenAnchors = /*#__PURE__*/function () {
            var _ref30 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(beforeAnchor, afterAnchor, traceLabel) {
              var _entry$originalText4;
              var liveText, originalText, beforeToken, afterToken, beforeHint, afterHint, beforeStart, afterStart, beforeEnd, gapText, insertRange, gapRange;
              return _regenerator().w(function (_context19) {
                while (1) switch (_context19.n) {
                  case 0:
                    if (!(!beforeAnchor || !afterAnchor)) {
                      _context19.n = 1;
                      break;
                    }
                    return _context19.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context19.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    originalText = (_entry$originalText4 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText4 !== void 0 ? _entry$originalText4 : "";
                    beforeToken = cleanWordToken(beforeAnchor.tokenText);
                    afterToken = cleanWordToken(afterAnchor.tokenText);
                    if (!(!beforeToken || !afterToken)) {
                      _context19.n = 3;
                      break;
                    }
                    return _context19.a(2, false);
                  case 3:
                    beforeHint = Number.isFinite(beforeAnchor.charEnd) ? mapIndexAcrossCanonical(originalText, liveText, beforeAnchor.charEnd) : null;
                    afterHint = Number.isFinite(afterAnchor.charStart) ? mapIndexAcrossCanonical(originalText, liveText, afterAnchor.charStart) : null;
                    beforeStart = findTokenStartByHint(liveText, beforeToken, beforeHint, beforeAnchor.textOccurrence);
                    afterStart = findTokenStartByHint(liveText, afterToken, afterHint, afterAnchor.textOccurrence);
                    if (!(beforeStart < 0 || afterStart < 0)) {
                      _context19.n = 4;
                      break;
                    }
                    return _context19.a(2, false);
                  case 4:
                    beforeEnd = beforeStart + beforeToken.length;
                    if (!(beforeEnd > afterStart)) {
                      _context19.n = 5;
                      break;
                    }
                    return _context19.a(2, false);
                  case 5:
                    gapText = liveText.slice(beforeEnd, afterStart);
                    if (!gapText.includes(",")) {
                      _context19.n = 6;
                      break;
                    }
                    return _context19.a(2, true);
                  case 6:
                    if (!/[^\s]/.test(gapText)) {
                      _context19.n = 7;
                      break;
                    }
                    return _context19.a(2, false);
                  case 7:
                    if (!(beforeEnd === afterStart)) {
                      _context19.n = 10;
                      break;
                    }
                    _context19.n = 8;
                    return getRangeForAnchorSpan(context, paragraph, entry, afterStart, Math.min(afterStart + 1, liveText.length), "".concat(traceLabel, "-insert-at-gap"), afterToken);
                  case 8:
                    insertRange = _context19.v;
                    if (insertRange) {
                      _context19.n = 9;
                      break;
                    }
                    return _context19.a(2, false);
                  case 9:
                    insertRange.insertText(", ", Word.InsertLocation.before);
                    return _context19.a(2, true);
                  case 10:
                    _context19.n = 11;
                    return getRangeForAnchorSpan(context, paragraph, entry, beforeEnd, afterStart, "".concat(traceLabel, "-replace-gap"), gapText || " ");
                  case 11:
                    gapRange = _context19.v;
                    if (gapRange) {
                      _context19.n = 12;
                      break;
                    }
                    return _context19.a(2, false);
                  case 12:
                    gapRange.insertText(", ", Word.InsertLocation.replace);
                    return _context19.a(2, true);
                }
              }, _callee19);
            }));
            return function replaceGapBetweenAnchors(_x85, _x86, _x87) {
              return _ref30.apply(this, arguments);
            };
          }();
          insertCommaAfterToken = /*#__PURE__*/function () {
            var _ref31 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(tokenAnchor, traceLabel) {
              var _entry$originalText5, _liveText$liveIndex;
              var liveText, tokenTextRaw, tokenText, tokenOrdinal, originalText, anchorEnd, hintIndex, tokenStart, _liveText$tokenStart, wsStart, firstTokenChar, commaText, beforeTokenWsRange, liveIndex, insertedViaChar, nextChar, _liveText$wsEnd, wsEnd, afterWsChar, withSpace, _commaText, replaceRange;
              return _regenerator().w(function (_context20) {
                while (1) switch (_context20.n) {
                  case 0:
                    if (tokenAnchor) {
                      _context20.n = 1;
                      break;
                    }
                    return _context20.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context20.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
                    tokenText = tokenTextRaw.trim() || tokenTextRaw;
                    tokenOrdinal = typeof tokenAnchor.textOccurrence === "number" ? tokenAnchor.textOccurrence : typeof tokenAnchor.tokenIndex === "number" ? tokenAnchor.tokenIndex : 0;
                    originalText = (_entry$originalText5 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText5 !== void 0 ? _entry$originalText5 : "";
                    anchorEnd = Number.isFinite(tokenAnchor.charEnd) ? tokenAnchor.charEnd : typeof tokenAnchor.tokenText === "string" ? tokenAnchor.charStart + tokenAnchor.tokenText.length : tokenAnchor.charStart;
                    hintIndex = mapIndexAcrossCanonical(originalText, liveText, anchorEnd);
                    if (!tokenText) {
                      _context20.n = 4;
                      break;
                    }
                    tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
                    if (!(tokenStart > 0 && /\s/.test(liveText[tokenStart - 1]))) {
                      _context20.n = 4;
                      break;
                    }
                    wsStart = tokenStart - 1;
                    while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
                      wsStart--;
                    }
                    firstTokenChar = (_liveText$tokenStart = liveText[tokenStart]) !== null && _liveText$tokenStart !== void 0 ? _liveText$tokenStart : "";
                    commaText = firstTokenChar && !/\s/.test(firstTokenChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(firstTokenChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(firstTokenChar) ? ", " : ",";
                    _context20.n = 3;
                    return getRangeForAnchorSpan(context, paragraph, entry, wsStart, tokenStart, "".concat(traceLabel, "-normalize-before-token"), liveText.slice(wsStart, tokenStart));
                  case 3:
                    beforeTokenWsRange = _context20.v;
                    if (!beforeTokenWsRange) {
                      _context20.n = 4;
                      break;
                    }
                    beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context20.a(2, true);
                  case 4:
                    liveIndex = hintIndex;
                    if (!(Number.isFinite(liveIndex) && liveIndex >= 0)) {
                      _context20.n = 6;
                      break;
                    }
                    _context20.n = 5;
                    return insertCommaAtChar(liveIndex, "".concat(traceLabel, "-mapped-char"));
                  case 5:
                    insertedViaChar = _context20.v;
                    if (!insertedViaChar) {
                      _context20.n = 6;
                      break;
                    }
                    return _context20.a(2, true);
                  case 6:
                    nextChar = (_liveText$liveIndex = liveText[liveIndex]) !== null && _liveText$liveIndex !== void 0 ? _liveText$liveIndex : "";
                    if (!(nextChar && /\s/.test(nextChar))) {
                      _context20.n = 8;
                      break;
                    }
                    wsEnd = liveIndex;
                    while (wsEnd < liveText.length && /\s/.test(liveText[wsEnd])) {
                      wsEnd++;
                    }
                    afterWsChar = (_liveText$wsEnd = liveText[wsEnd]) !== null && _liveText$wsEnd !== void 0 ? _liveText$wsEnd : "";
                    withSpace = afterWsChar && !/\s/.test(afterWsChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(afterWsChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(afterWsChar);
                    _commaText = withSpace ? ", " : ",";
                    _context20.n = 7;
                    return getRangeForAnchorSpan(context, paragraph, entry, liveIndex, wsEnd, "".concat(traceLabel, "-replace-ws"), liveText.slice(liveIndex, wsEnd));
                  case 7:
                    replaceRange = _context20.v;
                    if (!replaceRange) {
                      _context20.n = 8;
                      break;
                    }
                    replaceRange.insertText(_commaText, Word.InsertLocation.replace);
                    return _context20.a(2, true);
                  case 8:
                    return _context20.a(2, false);
                }
              }, _callee20);
            }));
            return function insertCommaAfterToken(_x88, _x89) {
              return _ref31.apply(this, arguments);
            };
          }();
          insertCommaBeforeToken = /*#__PURE__*/function () {
            var _ref32 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21(tokenAnchor, traceLabel) {
              var _entry$originalText6;
              var liveText, tokenTextRaw, tokenText, tokenOrdinal, originalText, anchorStart, hintIndex, tokenStart, wsStart, _liveText$tokenStart2, firstTokenChar, commaText, beforeTokenWsRange, liveIndex, insertedViaChar;
              return _regenerator().w(function (_context21) {
                while (1) switch (_context21.n) {
                  case 0:
                    if (tokenAnchor) {
                      _context21.n = 1;
                      break;
                    }
                    return _context21.a(2, false);
                  case 1:
                    paragraph.load("text");
                    _context21.n = 2;
                    return context.sync();
                  case 2:
                    liveText = paragraph.text || "";
                    tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
                    tokenText = tokenTextRaw.trim() || tokenTextRaw;
                    tokenOrdinal = typeof tokenAnchor.textOccurrence === "number" ? tokenAnchor.textOccurrence : typeof tokenAnchor.tokenIndex === "number" ? tokenAnchor.tokenIndex : 0;
                    originalText = (_entry$originalText6 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText6 !== void 0 ? _entry$originalText6 : "";
                    anchorStart = Number.isFinite(tokenAnchor.charStart) ? tokenAnchor.charStart : -1;
                    hintIndex = anchorStart >= 0 ? mapIndexAcrossCanonical(originalText, liveText, anchorStart) : null;
                    if (!tokenText) {
                      _context21.n = 4;
                      break;
                    }
                    tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
                    if (!(tokenStart > 0)) {
                      _context21.n = 4;
                      break;
                    }
                    wsStart = tokenStart;
                    while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
                      wsStart--;
                    }
                    if (!(wsStart < tokenStart)) {
                      _context21.n = 4;
                      break;
                    }
                    firstTokenChar = (_liveText$tokenStart2 = liveText[tokenStart]) !== null && _liveText$tokenStart2 !== void 0 ? _liveText$tokenStart2 : "";
                    commaText = firstTokenChar && !/\s/.test(firstTokenChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(firstTokenChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(firstTokenChar) ? ", " : ",";
                    _context21.n = 3;
                    return getRangeForAnchorSpan(context, paragraph, entry, wsStart, tokenStart, "".concat(traceLabel, "-normalize-before-token"), liveText.slice(wsStart, tokenStart));
                  case 3:
                    beforeTokenWsRange = _context21.v;
                    if (!beforeTokenWsRange) {
                      _context21.n = 4;
                      break;
                    }
                    beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
                    return _context21.a(2, true);
                  case 4:
                    if (!(anchorStart >= 0)) {
                      _context21.n = 6;
                      break;
                    }
                    liveIndex = hintIndex;
                    _context21.n = 5;
                    return insertCommaAtChar(liveIndex, "".concat(traceLabel, "-mapped-char"));
                  case 5:
                    insertedViaChar = _context21.v;
                    if (!insertedViaChar) {
                      _context21.n = 6;
                      break;
                    }
                    return _context21.a(2, true);
                  case 6:
                    return _context21.a(2, false);
                }
              }, _callee21);
            }));
            return function insertCommaBeforeToken(_x90, _x91) {
              return _ref32.apply(this, arguments);
            };
          }();
          anchor = (_ref33 = (_ref34 = (_ref35 = (_meta$highlightAnchor = meta.highlightAnchorTarget) !== null && _meta$highlightAnchor !== void 0 ? _meta$highlightAnchor : meta.sourceTokenAt) !== null && _ref35 !== void 0 ? _ref35 : meta.targetTokenAt) !== null && _ref34 !== void 0 ? _ref34 : meta.sourceTokenBefore) !== null && _ref33 !== void 0 ? _ref33 : meta.targetTokenBefore;
          anchorStart = anchor === null || anchor === void 0 ? void 0 : anchor.charStart;
          anchorEnd = Number.isFinite(anchor === null || anchor === void 0 ? void 0 : anchor.charEnd) && anchor.charEnd > anchor.charStart ? anchor.charEnd : typeof (anchor === null || anchor === void 0 ? void 0 : anchor.tokenText) === "string" && anchor.tokenText.length > 0 ? anchor.charStart + anchor.tokenText.length : undefined;
          if (!(Number.isFinite(anchorStart) && anchorStart >= 0)) {
            _context22.n = 13;
            break;
          }
          _context22.n = 2;
          return getRangeForAnchorSpan(context, paragraph, entry, anchorStart, anchorEnd, "apply-insert-lemma-anchor", (anchor === null || anchor === void 0 ? void 0 : anchor.tokenText) || meta.highlightText);
        case 2:
          range = _context22.v;
          if (!range) {
            _context22.n = 13;
            break;
          }
          _context22.p = 3;
          afterAnchor = (_meta$sourceTokenAfte2 = meta.sourceTokenAfter) !== null && _meta$sourceTokenAfte2 !== void 0 ? _meta$sourceTokenAfte2 : meta.targetTokenAfter;
          beforeAnchor = (_meta$sourceTokenBefo2 = meta.sourceTokenBefore) !== null && _meta$sourceTokenBefo2 !== void 0 ? _meta$sourceTokenBefo2 : meta.targetTokenBefore;
          _context22.n = 4;
          return replaceGapBetweenAnchors(beforeAnchor, afterAnchor, "apply-insert-token-gap");
        case 4:
          if (!_context22.v) {
            _context22.n = 5;
            break;
          }
          return _context22.a(2, true);
        case 5:
          _context22.n = 6;
          return insertCommaBeforeToken(afterAnchor, "apply-insert-lemma-after-token");
        case 6:
          if (!_context22.v) {
            _context22.n = 7;
            break;
          }
          return _context22.a(2, true);
        case 7:
          _context22.n = 8;
          return insertCommaAfterToken(beforeAnchor !== null && beforeAnchor !== void 0 ? beforeAnchor : anchor, "apply-insert-lemma-anchor");
        case 8:
          if (!_context22.v) {
            _context22.n = 9;
            break;
          }
          return _context22.a(2, true);
        case 9:
          _hasTokenAnchors = Boolean(beforeAnchor || afterAnchor || meta.sourceTokenAt || meta.targetTokenAt);
          if (!(!_hasTokenAnchors && Number.isFinite(anchorEnd) && anchorEnd >= 0)) {
            _context22.n = 11;
            break;
          }
          _context22.n = 10;
          return insertCommaAtChar(anchorEnd, "apply-insert-lemma-anchor");
        case 10:
          if (!_context22.v) {
            _context22.n = 11;
            break;
          }
          return _context22.a(2, true);
        case 11:
          _context22.n = 13;
          break;
        case 12:
          _context22.p = 12;
          _t5 = _context22.v;
          warn("apply insert metadata: failed to insert via lemma anchor", _t5);
        case 13:
          insertionCharStart = (_suggestion$charHint$6 = suggestion === null || suggestion === void 0 || (_suggestion$charHint8 = suggestion.charHint) === null || _suggestion$charHint8 === void 0 ? void 0 : _suggestion$charHint8.start) !== null && _suggestion$charHint$6 !== void 0 ? _suggestion$charHint$6 : Number.isFinite(meta.targetCharStart) ? meta.targetCharStart : -1;
          hasTokenAnchors = Boolean(meta.sourceTokenBefore || meta.sourceTokenAfter || meta.targetTokenBefore || meta.targetTokenAfter);
          if (!hasTokenAnchors) {
            _context22.n = 14;
            break;
          }
          return _context22.a(2, false);
        case 14:
          if (!(!Number.isFinite(insertionCharStart) || insertionCharStart < 0)) {
            _context22.n = 15;
            break;
          }
          return _context22.a(2, false);
        case 15:
          _context22.p = 15;
          _context22.n = 16;
          return insertCommaAtChar(insertionCharStart, "apply-insert-target-char");
        case 16:
          return _context22.a(2, _context22.v);
        case 17:
          _context22.p = 17;
          _t6 = _context22.v;
          warn("apply insert metadata: failed to insert via target char", _t6);
          return _context22.a(2, false);
      }
    }, _callee22, null, [[15, 17], [3, 12]]);
  }));
  return _tryApplyInsertUsingMetadata.apply(this, arguments);
}
function applyInsertSuggestion(_x61, _x62, _x63) {
  return _applyInsertSuggestion.apply(this, arguments);
}
function _applyInsertSuggestion() {
  _applyInsertSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23(context, paragraph, suggestion) {
    return _regenerator().w(function (_context23) {
      while (1) switch (_context23.n) {
        case 0:
          _context23.n = 1;
          return tryApplyInsertUsingMetadata(context, paragraph, suggestion);
        case 1:
          return _context23.a(2, _context23.v);
      }
    }, _callee23);
  }));
  return _applyInsertSuggestion.apply(this, arguments);
}
function normalizeCommaSpacingInParagraph(_x64, _x65) {
  return _normalizeCommaSpacingInParagraph.apply(this, arguments);
}
function _normalizeCommaSpacingInParagraph() {
  _normalizeCommaSpacingInParagraph = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(context, paragraph) {
    var text, idx, _text, toTrim, nextChar, afterRange;
    return _regenerator().w(function (_context24) {
      while (1) switch (_context24.n) {
        case 0:
          paragraph.load("text");
          _context24.n = 1;
          return context.sync();
        case 1:
          text = paragraph.text || "";
          if (text.includes(",")) {
            _context24.n = 2;
            break;
          }
          return _context24.a(2);
        case 2:
          idx = text.length - 1;
        case 3:
          if (!(idx >= 0)) {
            _context24.n = 10;
            break;
          }
          if (!(text[idx] !== ",")) {
            _context24.n = 4;
            break;
          }
          return _context24.a(3, 9);
        case 4:
          if (!(idx > 0 && /\s/.test(text[idx - 1]))) {
            _context24.n = 6;
            break;
          }
          _context24.n = 5;
          return getRangeForCharacterSpan(context, paragraph, text, idx - 1, idx, "trim-space-before-comma", " ");
        case 5:
          toTrim = _context24.v;
          if (toTrim) {
            toTrim.insertText("", Word.InsertLocation.replace);
          }
        case 6:
          nextChar = (_text = text[idx + 1]) !== null && _text !== void 0 ? _text : "";
          if (nextChar) {
            _context24.n = 7;
            break;
          }
          return _context24.a(3, 9);
        case 7:
          if (!(!/\s/.test(nextChar) && !_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(nextChar) && !(0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(nextChar))) {
            _context24.n = 9;
            break;
          }
          _context24.n = 8;
          return getRangeForCharacterSpan(context, paragraph, text, idx + 1, idx + 2, "space-after-comma", nextChar);
        case 8:
          afterRange = _context24.v;
          if (afterRange) {
            afterRange.insertText(" ", Word.InsertLocation.before);
          }
        case 9:
          idx--;
          _context24.n = 3;
          break;
        case 10:
          return _context24.a(2);
      }
    }, _callee24);
  }));
  return _normalizeCommaSpacingInParagraph.apply(this, arguments);
}
function ensureCommaSpaceAfterInParagraph(_x66, _x67) {
  return _ensureCommaSpaceAfterInParagraph.apply(this, arguments);
}
function _ensureCommaSpaceAfterInParagraph() {
  _ensureCommaSpaceAfterInParagraph = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(context, paragraph) {
    var text, spacingPlan, idx, _text2, nextChar, ranges, i, afterRange;
    return _regenerator().w(function (_context25) {
      while (1) switch (_context25.n) {
        case 0:
          paragraph.load("text");
          _context25.n = 1;
          return context.sync();
        case 1:
          text = paragraph.text || "";
          if (text.includes(",")) {
            _context25.n = 2;
            break;
          }
          return _context25.a(2);
        case 2:
          spacingPlan = [];
          idx = text.length - 1;
        case 3:
          if (!(idx >= 0)) {
            _context25.n = 8;
            break;
          }
          if (!(text[idx] !== ",")) {
            _context25.n = 4;
            break;
          }
          return _context25.a(3, 7);
        case 4:
          nextChar = (_text2 = text[idx + 1]) !== null && _text2 !== void 0 ? _text2 : "";
          if (nextChar) {
            _context25.n = 5;
            break;
          }
          return _context25.a(3, 7);
        case 5:
          if (!(/\s/.test(nextChar) || _engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.QUOTES.has(nextChar) || (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.isDigit)(nextChar))) {
            _context25.n = 6;
            break;
          }
          return _context25.a(3, 7);
        case 6:
          spacingPlan.push({
            kind: "insert",
            start: idx + 1,
            end: idx + 2,
            replacement: " ",
            snippet: nextChar,
            suggestions: [],
            sortPos: idx + 1
          });
        case 7:
          idx--;
          _context25.n = 3;
          break;
        case 8:
          if (spacingPlan.length) {
            _context25.n = 9;
            break;
          }
          return _context25.a(2);
        case 9:
          _context25.n = 10;
          return getRangesForPlannedOperations(context, paragraph, text, spacingPlan, "desktop-space-after-comma-only");
        case 10:
          ranges = _context25.v;
          for (i = 0; i < spacingPlan.length; i++) {
            afterRange = ranges[i];
            if (afterRange) {
              afterRange.insertText(" ", Word.InsertLocation.before);
            }
          }
        case 11:
          return _context25.a(2);
      }
    }, _callee25);
  }));
  return _ensureCommaSpaceAfterInParagraph.apply(this, arguments);
}
function cleanupCommaSpacingForParagraphs(_x68, _x69, _x70) {
  return _cleanupCommaSpacingForParagraphs.apply(this, arguments);
}
function _cleanupCommaSpacingForParagraphs() {
  _cleanupCommaSpacingForParagraphs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26(context, paragraphs, indexes) {
    var _ref36,
      _ref36$force,
      force,
      _iterator6,
      _step6,
      idx,
      paragraph,
      _args26 = arguments,
      _t7,
      _t8;
    return _regenerator().w(function (_context26) {
      while (1) switch (_context26.p = _context26.n) {
        case 0:
          _ref36 = _args26.length > 3 && _args26[3] !== undefined ? _args26[3] : {}, _ref36$force = _ref36.force, force = _ref36$force === void 0 ? false : _ref36$force;
          if (!(anchorProviderSupportsCharHints && !force)) {
            _context26.n = 1;
            break;
          }
          log("Skipping comma spacing cleanup – lemmatizer anchors already normalized.");
          return _context26.a(2);
        case 1:
          if (indexes !== null && indexes !== void 0 && indexes.size) {
            _context26.n = 2;
            break;
          }
          return _context26.a(2);
        case 2:
          _iterator6 = _createForOfIteratorHelper(indexes);
          _context26.p = 3;
          _iterator6.s();
        case 4:
          if ((_step6 = _iterator6.n()).done) {
            _context26.n = 9;
            break;
          }
          idx = _step6.value;
          paragraph = paragraphs.items[idx];
          if (paragraph) {
            _context26.n = 5;
            break;
          }
          return _context26.a(3, 8);
        case 5:
          _context26.p = 5;
          _context26.n = 6;
          return normalizeCommaSpacingInParagraph(context, paragraph);
        case 6:
          _context26.n = 8;
          break;
        case 7:
          _context26.p = 7;
          _t7 = _context26.v;
          warn("Failed to normalize comma spacing", _t7);
        case 8:
          _context26.n = 4;
          break;
        case 9:
          _context26.n = 11;
          break;
        case 10:
          _context26.p = 10;
          _t8 = _context26.v;
          _iterator6.e(_t8);
        case 11:
          _context26.p = 11;
          _iterator6.f();
          return _context26.f(11);
        case 12:
          return _context26.a(2);
      }
    }, _callee26, null, [[5, 7], [3, 10, 11, 12]]);
  }));
  return _cleanupCommaSpacingForParagraphs.apply(this, arguments);
}
function findRangeForInsert(_x71, _x72, _x73) {
  return _findRangeForInsert.apply(this, arguments);
}
function _findRangeForInsert() {
  _findRangeForInsert = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27(context, paragraph, suggestion) {
    var _suggestion$snippets3, _suggestion$snippets4;
    var searchOpts, range, focusWord, wordSearch, leftFrag, leftSearch, _suggestion$snippets5, rightFrag, rightSearch;
    return _regenerator().w(function (_context27) {
      while (1) switch (_context27.n) {
        case 0:
          searchOpts = {
            matchCase: false,
            matchWholeWord: false
          };
          range = null;
          focusWord = (_suggestion$snippets3 = suggestion.snippets) === null || _suggestion$snippets3 === void 0 ? void 0 : _suggestion$snippets3.focusWord;
          if (!focusWord) {
            _context27.n = 2;
            break;
          }
          wordSearch = paragraph.getRange().search(focusWord, {
            matchCase: false,
            matchWholeWord: true
          });
          wordSearch.load("items");
          _context27.n = 1;
          return context.sync();
        case 1:
          if (wordSearch.items.length) {
            range = wordSearch.items[wordSearch.items.length - 1];
          }
        case 2:
          leftFrag = (((_suggestion$snippets4 = suggestion.snippets) === null || _suggestion$snippets4 === void 0 ? void 0 : _suggestion$snippets4.leftSnippet) || "").slice(-20).replace(/[\r\n]+/g, " ");
          if (!(!range && leftFrag.trim())) {
            _context27.n = 4;
            break;
          }
          leftSearch = paragraph.getRange().search(leftFrag.trim(), searchOpts);
          leftSearch.load("items");
          _context27.n = 3;
          return context.sync();
        case 3:
          if (leftSearch.items.length) {
            range = leftSearch.items[leftSearch.items.length - 1];
          }
        case 4:
          if (range) {
            _context27.n = 6;
            break;
          }
          rightFrag = (((_suggestion$snippets5 = suggestion.snippets) === null || _suggestion$snippets5 === void 0 ? void 0 : _suggestion$snippets5.rightSnippet) || "").replace(/,/g, "").trim();
          rightFrag = rightFrag.slice(0, 8);
          if (!rightFrag) {
            _context27.n = 6;
            break;
          }
          rightSearch = paragraph.getRange().search(rightFrag, searchOpts);
          rightSearch.load("items");
          _context27.n = 5;
          return context.sync();
        case 5:
          if (rightSearch.items.length) {
            range = rightSearch.items[0];
          }
        case 6:
          return _context27.a(2, range);
      }
    }, _callee27);
  }));
  return _findRangeForInsert.apply(this, arguments);
}
function clearHighlightForSuggestion(_x74, _x75, _x76) {
  return _clearHighlightForSuggestion.apply(this, arguments);
}
function _clearHighlightForSuggestion() {
  _clearHighlightForSuggestion = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28(context, paragraph, suggestion) {
    var _suggestion$meta21, _suggestion$charHint$7, _suggestion$charHint9, _suggestion$charHint$8, _suggestion$charHint0, _metaAnchor$highlight;
    var entry, metaAnchor, charStart, charEnd, range;
    return _regenerator().w(function (_context28) {
      while (1) switch (_context28.n) {
        case 0:
          if (suggestion) {
            _context28.n = 1;
            break;
          }
          return _context28.a(2);
        case 1:
          if (!suggestion.highlightRange) {
            _context28.n = 2;
            break;
          }
          try {
            suggestion.highlightRange.font.highlightColor = null;
            context.trackedObjects.remove(suggestion.highlightRange);
          } catch (err) {
            warn("clearHighlightForSuggestion: failed via highlightRange", err);
          } finally {
            suggestion.highlightRange = null;
          }
          return _context28.a(2);
        case 2:
          entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
          metaAnchor = (_suggestion$meta21 = suggestion.meta) === null || _suggestion$meta21 === void 0 ? void 0 : _suggestion$meta21.anchor;
          if (metaAnchor) {
            _context28.n = 3;
            break;
          }
          return _context28.a(2);
        case 3:
          charStart = (_suggestion$charHint$7 = (_suggestion$charHint9 = suggestion.charHint) === null || _suggestion$charHint9 === void 0 ? void 0 : _suggestion$charHint9.start) !== null && _suggestion$charHint$7 !== void 0 ? _suggestion$charHint$7 : typeof metaAnchor.highlightCharStart === "number" ? metaAnchor.highlightCharStart : metaAnchor.charStart;
          charEnd = (_suggestion$charHint$8 = (_suggestion$charHint0 = suggestion.charHint) === null || _suggestion$charHint0 === void 0 ? void 0 : _suggestion$charHint0.end) !== null && _suggestion$charHint$8 !== void 0 ? _suggestion$charHint$8 : typeof metaAnchor.highlightCharEnd === "number" ? metaAnchor.highlightCharEnd : metaAnchor.charEnd;
          if (!(!paragraph || !Number.isFinite(charStart))) {
            _context28.n = 4;
            break;
          }
          return _context28.a(2);
        case 4:
          _context28.n = 5;
          return getRangeForAnchorSpan(context, paragraph, entry, charStart, charEnd, "clear-highlight", metaAnchor.highlightText || ((_metaAnchor$highlight = metaAnchor.highlightAnchorTarget) === null || _metaAnchor$highlight === void 0 ? void 0 : _metaAnchor$highlight.tokenText));
        case 5:
          range = _context28.v;
          if (range) {
            range.font.highlightColor = null;
          }
        case 6:
          return _context28.a(2);
      }
    }, _callee28);
  }));
  return _clearHighlightForSuggestion.apply(this, arguments);
}
function clearOnlineSuggestionMarkers(_x77, _x78, _x79) {
  return _clearOnlineSuggestionMarkers.apply(this, arguments);
}
function _clearOnlineSuggestionMarkers() {
  _clearOnlineSuggestionMarkers = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee29(context, suggestionsOverride, paragraphs) {
    var usingOverride, source, clearHighlight, _iterator7, _step7, _item$suggestion, _item$paragraph, _paragraphs$items, item, suggestion, paragraph, _t9;
    return _regenerator().w(function (_context29) {
      while (1) switch (_context29.p = _context29.n) {
        case 0:
          usingOverride = Array.isArray(suggestionsOverride);
          source = usingOverride ? suggestionsOverride : pendingSuggestionsOnline;
          clearHighlight = function clearHighlight(sug) {
            if (!(sug !== null && sug !== void 0 && sug.highlightRange)) return;
            try {
              sug.highlightRange.font.highlightColor = null;
              context.trackedObjects.remove(sug.highlightRange);
            } catch (err) {
              warn("Failed to clear highlight", err);
            } finally {
              sug.highlightRange = null;
            }
          };
          if (source.length) {
            _context29.n = 2;
            break;
          }
          if (usingOverride) {
            _context29.n = 1;
            break;
          }
          context.document.body.font.highlightColor = null;
          _context29.n = 1;
          return context.sync();
        case 1:
          return _context29.a(2);
        case 2:
          _iterator7 = _createForOfIteratorHelper(source);
          _context29.p = 3;
          _iterator7.s();
        case 4:
          if ((_step7 = _iterator7.n()).done) {
            _context29.n = 9;
            break;
          }
          item = _step7.value;
          suggestion = (_item$suggestion = item === null || item === void 0 ? void 0 : item.suggestion) !== null && _item$suggestion !== void 0 ? _item$suggestion : item;
          if (suggestion) {
            _context29.n = 5;
            break;
          }
          return _context29.a(3, 8);
        case 5:
          paragraph = (_item$paragraph = item === null || item === void 0 ? void 0 : item.paragraph) !== null && _item$paragraph !== void 0 ? _item$paragraph : paragraphs === null || paragraphs === void 0 || (_paragraphs$items = paragraphs.items) === null || _paragraphs$items === void 0 ? void 0 : _paragraphs$items[suggestion.paragraphIndex];
          if (!paragraph) {
            _context29.n = 7;
            break;
          }
          _context29.n = 6;
          return clearHighlightForSuggestion(context, paragraph, suggestion);
        case 6:
          _context29.n = 8;
          break;
        case 7:
          clearHighlight(suggestion);
        case 8:
          _context29.n = 4;
          break;
        case 9:
          _context29.n = 11;
          break;
        case 10:
          _context29.p = 10;
          _t9 = _context29.v;
          _iterator7.e(_t9);
        case 11:
          _context29.p = 11;
          _iterator7.f();
          return _context29.f(11);
        case 12:
          _context29.n = 13;
          return context.sync();
        case 13:
          if (!suggestionsOverride) {
            resetPendingSuggestionsOnline();
          }
        case 14:
          return _context29.a(2);
      }
    }, _callee29, null, [[3, 10, 11, 12]]);
  }));
  return _clearOnlineSuggestionMarkers.apply(this, arguments);
}
function getSuggestionSortPos(suggestion) {
  var _ref6, _ref7, _ref8, _suggestion$meta$op$o, _suggestion$meta3, _suggestion$meta4, _suggestion$meta5, _suggestion$charHint;
  return (_ref6 = (_ref7 = (_ref8 = (_suggestion$meta$op$o = suggestion === null || suggestion === void 0 || (_suggestion$meta3 = suggestion.meta) === null || _suggestion$meta3 === void 0 || (_suggestion$meta3 = _suggestion$meta3.op) === null || _suggestion$meta3 === void 0 ? void 0 : _suggestion$meta3.originalPos) !== null && _suggestion$meta$op$o !== void 0 ? _suggestion$meta$op$o : suggestion === null || suggestion === void 0 || (_suggestion$meta4 = suggestion.meta) === null || _suggestion$meta4 === void 0 || (_suggestion$meta4 = _suggestion$meta4.op) === null || _suggestion$meta4 === void 0 ? void 0 : _suggestion$meta4.correctedPos) !== null && _ref8 !== void 0 ? _ref8 : suggestion === null || suggestion === void 0 || (_suggestion$meta5 = suggestion.meta) === null || _suggestion$meta5 === void 0 || (_suggestion$meta5 = _suggestion$meta5.op) === null || _suggestion$meta5 === void 0 ? void 0 : _suggestion$meta5.pos) !== null && _ref7 !== void 0 ? _ref7 : suggestion === null || suggestion === void 0 || (_suggestion$charHint = suggestion.charHint) === null || _suggestion$charHint === void 0 ? void 0 : _suggestion$charHint.start) !== null && _ref6 !== void 0 ? _ref6 : -1;
}
function findWordTokenStartByHintInText(text, rawToken, hintIndex, occurrence) {
  var tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!tokenRaw || !text) return -1;
  var token = tokenRaw.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
  if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return -1;
  var safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
  var safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
  var tokenRegex = new RegExp("(^|[^\\p{L}\\d])(".concat(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ")(?=$|[^\\p{L}\\d])"), "gu");
  var positions = [];
  var match;
  while ((match = tokenRegex.exec(text)) !== null) {
    positions.push(match.index + match[1].length);
  }
  if (!positions.length) return -1;
  if (safeHint === null) {
    return positions[Math.min(safeOccurrence, positions.length - 1)];
  }
  var best = positions[0];
  var bestDist = Math.abs(positions[0] - safeHint);
  for (var i = 1; i < positions.length; i++) {
    var dist = Math.abs(positions[i] - safeHint);
    if (dist < bestDist) {
      best = positions[i];
      bestDist = dist;
    }
  }
  // Reject far matches; these are the main source of in-word corruption.
  if (bestDist > 24) return -1;
  return best;
}
function resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  var _suggestion$meta6, _meta$sourceTokenBefo, _meta$sourceTokenAfte;
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta6 = suggestion.meta) === null || _suggestion$meta6 === void 0 ? void 0 : _suggestion$meta6.anchor;
  if (!meta) return null;
  var beforeAnchor = (_meta$sourceTokenBefo = meta.sourceTokenBefore) !== null && _meta$sourceTokenBefo !== void 0 ? _meta$sourceTokenBefo : meta.targetTokenBefore;
  var afterAnchor = (_meta$sourceTokenAfte = meta.sourceTokenAfter) !== null && _meta$sourceTokenAfte !== void 0 ? _meta$sourceTokenAfte : meta.targetTokenAfter;
  var findStartForAnchor = function findStartForAnchor(anchor) {
    var _ref9, _anchor$textOccurrenc;
    var preferEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!(anchor !== null && anchor !== void 0 && anchor.tokenText)) return {
      start: -1,
      token: null
    };
    var token = (anchor.tokenText || "").trim().replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
    if (!token || /(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(token)) return {
      start: -1,
      token: null
    };
    var sourceHint = preferEnd ? Number.isFinite(anchor.charEnd) ? anchor.charEnd : anchor.charStart + token.length : anchor.charStart;
    var mappedHint = Number.isFinite(sourceHint) ? mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint) : null;
    var start = findWordTokenStartByHintInText(snapshotText, token, mappedHint, (_ref9 = (_anchor$textOccurrenc = anchor.textOccurrence) !== null && _anchor$textOccurrenc !== void 0 ? _anchor$textOccurrenc : anchor.tokenIndex) !== null && _ref9 !== void 0 ? _ref9 : 0);
    return {
      start: start,
      token: token
    };
  };
  var isQuoteOrSpaceBoundary = function isQuoteOrSpaceBoundary(value) {
    return typeof value === "string" && /^[\s"'«»“”„’)\]]+$/.test(value);
  };
  // In Word content, angled quotes can surface in either direction around boundaries.
  // Treat both « and » as quote chars when normalizing insert positions.
  var isClosingQuoteOrCloser = function isClosingQuoteOrCloser(char) {
    return /["'«»”’)\]]/.test(char || "");
  };
  var isOpeningQuoteOrOpener = function isOpeningQuoteOrOpener(char) {
    return /["'«»“„(\[]/.test(char || "");
  };
  var normalizeInsertPosForQuoteBoundary = function normalizeInsertPosForQuoteBoundary(pos) {
    if (!Number.isFinite(pos) || pos < 0 || pos > snapshotText.length) return pos;
    var left = pos - 1;
    while (left >= 0 && /\s/.test(snapshotText[left])) left--;
    var right = pos;
    while (right < snapshotText.length && /\s/.test(snapshotText[right])) right++;
    if (left >= 0 && right < snapshotText.length && isClosingQuoteOrCloser(snapshotText[left]) && isOpeningQuoteOrOpener(snapshotText[right])) {
      return left + 1;
    }
    // Also catch insert positions that land at the start of the next word:
    // ...'<space>'Word  -> move comma after the closing quote.
    if (left >= 0 && isOpeningQuoteOrOpener(snapshotText[left])) {
      var prev = left - 1;
      while (prev >= 0 && /\s/.test(snapshotText[prev])) prev--;
      if (prev >= 0 && isClosingQuoteOrCloser(snapshotText[prev])) {
        return prev + 1;
      }
    }
    return pos;
  };

  // Best path: replace exact whitespace gap between before/after anchors.
  if (beforeAnchor && afterAnchor) {
    var before = findStartForAnchor(beforeAnchor, true);
    var after = findStartForAnchor(afterAnchor, false);
    if (before.start >= 0 && after.start >= 0) {
      var beforeEnd = before.start + before.token.length;
      if (beforeEnd <= after.start) {
        var gap = snapshotText.slice(beforeEnd, after.start);
        // Only treat as already satisfied when the direct token gap is just comma+spaces.
        if (/^\s*,\s*$/.test(gap)) {
          return {
            kind: "noop"
          };
        }
        // Normal adjacency gap: whitespace-only.
        if (!/[^\s]/.test(gap)) {
          return {
            kind: "insert",
            start: normalizeInsertPosForQuoteBoundary(beforeEnd),
            end: normalizeInsertPosForQuoteBoundary(beforeEnd),
            replacement: ",",
            snippet: gap || before.token
          };
        }
        // Quote boundary adjacency (e.g. "'foo' 'bar'"): insert after closing quote.
        if (isQuoteOrSpaceBoundary(gap)) {
          var insertPos = beforeEnd;
          while (insertPos < after.start && isClosingQuoteOrCloser(snapshotText[insertPos])) {
            insertPos++;
          }
          var boundarySegment = snapshotText.slice(insertPos, after.start);
          if (/,\s*$/.test(boundarySegment) || /^\s*,/.test(boundarySegment)) {
            return {
              kind: "noop"
            };
          }
          return {
            kind: "insert",
            start: normalizeInsertPosForQuoteBoundary(insertPos),
            end: normalizeInsertPosForQuoteBoundary(insertPos),
            replacement: ",",
            snippet: gap || before.token
          };
        }
      }
    }
  }

  // Secondary path: normalize whitespace right before "after" token.
  if (afterAnchor) {
    var _after = findStartForAnchor(afterAnchor, false);
    if (_after.start > 0) {
      var wsStart = _after.start;
      while (wsStart > 0 && /\s/.test(snapshotText[wsStart - 1])) wsStart--;
      if (wsStart < _after.start) {
        return {
          kind: "insert",
          start: normalizeInsertPosForQuoteBoundary(wsStart),
          end: normalizeInsertPosForQuoteBoundary(wsStart),
          replacement: ",",
          snippet: snapshotText.slice(wsStart, _after.start)
        };
      }
      var safePos = normalizeInsertPosForQuoteBoundary(_after.start);
      return {
        kind: "insert",
        start: safePos,
        end: safePos,
        replacement: ",",
        snippet: snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1))
      };
    }
  }

  // Secondary path: normalize whitespace right after "before" token.
  if (beforeAnchor) {
    var _before = findStartForAnchor(beforeAnchor, true);
    if (_before.start >= 0) {
      var _beforeEnd = _before.start + _before.token.length;
      var wsEnd = _beforeEnd;
      while (wsEnd < snapshotText.length && /\s/.test(snapshotText[wsEnd])) wsEnd++;
      if (wsEnd > _beforeEnd) {
        return {
          kind: "insert",
          start: normalizeInsertPosForQuoteBoundary(_beforeEnd),
          end: normalizeInsertPosForQuoteBoundary(_beforeEnd),
          replacement: ",",
          snippet: snapshotText.slice(_beforeEnd, wsEnd)
        };
      }
      var _safePos = normalizeInsertPosForQuoteBoundary(_beforeEnd);
      return {
        kind: "insert",
        start: _safePos,
        end: _safePos,
        replacement: ",",
        snippet: snapshotText.slice(Math.max(0, _safePos - 1), Math.min(snapshotText.length, _safePos + 1))
      };
    }
  }
  return null;
}
function resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  var _suggestion$meta7, _ref0, _ref1, _meta$sourceTokenAt, _ref10, _ref11, _ref12, _suggestion$charHint$, _suggestion$charHint2, _suggestion$meta8;
  var meta = suggestion === null || suggestion === void 0 || (_suggestion$meta7 = suggestion.meta) === null || _suggestion$meta7 === void 0 ? void 0 : _suggestion$meta7.anchor;
  if (!meta) return null;
  var sourceAnchor = (_ref0 = (_ref1 = (_meta$sourceTokenAt = meta.sourceTokenAt) !== null && _meta$sourceTokenAt !== void 0 ? _meta$sourceTokenAt : meta.sourceTokenBefore) !== null && _ref1 !== void 0 ? _ref1 : meta.sourceTokenAfter) !== null && _ref0 !== void 0 ? _ref0 : meta.highlightAnchorTarget;
  var charStart = (_ref10 = (_ref11 = (_ref12 = (_suggestion$charHint$ = suggestion === null || suggestion === void 0 || (_suggestion$charHint2 = suggestion.charHint) === null || _suggestion$charHint2 === void 0 ? void 0 : _suggestion$charHint2.start) !== null && _suggestion$charHint$ !== void 0 ? _suggestion$charHint$ : meta.charStart) !== null && _ref12 !== void 0 ? _ref12 : sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.charStart) !== null && _ref11 !== void 0 ? _ref11 : suggestion === null || suggestion === void 0 || (_suggestion$meta8 = suggestion.meta) === null || _suggestion$meta8 === void 0 || (_suggestion$meta8 = _suggestion$meta8.op) === null || _suggestion$meta8 === void 0 ? void 0 : _suggestion$meta8.originalPos) !== null && _ref10 !== void 0 ? _ref10 : -1;
  if (!Number.isFinite(charStart) || charStart < 0) return null;
  var mappedStart = mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
  var commaIndex = -1;
  for (var delta = 0; delta <= 3; delta++) {
    var left = mappedStart - delta;
    var right = mappedStart + delta;
    if (left >= 0 && snapshotText[left] === ",") {
      commaIndex = left;
      break;
    }
    if (right < snapshotText.length && snapshotText[right] === ",") {
      commaIndex = right;
      break;
    }
  }
  if (commaIndex < 0) return null;
  return {
    kind: "delete",
    start: commaIndex,
    end: commaIndex + 1,
    replacement: "",
    snippet: ","
  };
}
function buildParagraphOperationsPlan(snapshotText, sourceText, suggestions) {
  var rawPlan = [];
  var skipped = [];
  var noop = [];
  var _iterator4 = _createForOfIteratorHelper(suggestions),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var suggestion = _step4.value;
      var op = null;
      if ((suggestion === null || suggestion === void 0 ? void 0 : suggestion.kind) === "delete") {
        op = resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion);
      } else {
        op = resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion);
      }
      if (!op) {
        skipped.push(suggestion);
        continue;
      }
      if (op.kind === "noop") {
        noop.push(suggestion);
        continue;
      }
      rawPlan.push(_objectSpread(_objectSpread({}, op), {}, {
        suggestions: [suggestion],
        sortPos: getSuggestionSortPos(suggestion)
      }));
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  rawPlan.sort(function (a, b) {
    if (a.start !== b.start) return b.start - a.start;
    if (a.kind !== b.kind) return a.kind === "delete" ? -1 : 1;
    return b.sortPos - a.sortPos;
  });
  var consumed = new Set();
  var plan = [];
  for (var i = 0; i < rawPlan.length; i++) {
    if (consumed.has(i)) continue;
    var current = rawPlan[i];

    // Drop redundant inserts only when comma is already exactly at the insertion gap.
    if (current.kind === "insert") {
      var segment = snapshotText.slice(current.start, current.end);
      if (segment === current.replacement) {
        noop.push.apply(noop, _toConsumableArray(current.suggestions));
        continue;
      }
      if (current.replacement.startsWith(",")) {
        var segmentIsCommaGap = /^\s*,\s*$/.test(segment);
        var left = current.start - 1;
        while (left >= 0 && /\s/.test(snapshotText[left])) left--;
        var right = current.end;
        while (right < snapshotText.length && /\s/.test(snapshotText[right])) right++;
        var leftChar = left >= 0 ? snapshotText[left] : "";
        var rightChar = right < snapshotText.length ? snapshotText[right] : "";
        var segmentHasOnlyWhitespace = !/[^\s]/.test(segment);
        if (segmentIsCommaGap || segmentHasOnlyWhitespace && (leftChar === "," || rightChar === ",")) {
          noop.push.apply(noop, _toConsumableArray(current.suggestions));
          continue;
        }
      }
    }

    // Coalesce local delete+insert into a single replace to avoid visual "double comma then delete".
    if (current.kind === "delete") {
      var deletePos = current.start;
      var merged = false;
      for (var j = i + 1; j < rawPlan.length; j++) {
        if (consumed.has(j)) continue;
        var candidate = rawPlan[j];
        if (candidate.kind !== "insert") continue;
        if (Math.abs(candidate.start - deletePos) > 1) continue;
        if (!candidate.replacement.startsWith(",")) continue;
        var start = Math.min(current.start, candidate.start);
        var end = Math.max(current.end, candidate.end);
        var mergeSegment = snapshotText.slice(start, end);
        // Do not coalesce across whitespace; replacing mixed spans can drop spaces in tracked mode.
        if (/\s/.test(mergeSegment)) continue;
        plan.push({
          kind: "replace",
          start: start,
          end: end,
          replacement: ",",
          snippet: mergeSegment || ",",
          suggestions: [].concat(_toConsumableArray(current.suggestions), _toConsumableArray(candidate.suggestions)),
          sortPos: Math.max(current.sortPos, candidate.sortPos)
        });
        consumed.add(j);
        merged = true;
        break;
      }
      if (merged) continue;
    }
    plan.push(current);
  }
  return {
    plan: plan,
    skipped: skipped,
    noop: noop
  };
}
function applyAllSuggestionsOnline() {
  return _applyAllSuggestionsOnline.apply(this, arguments);
}
function _applyAllSuggestionsOnline() {
  _applyAllSuggestionsOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee31() {
    var restored, suggestionsByParagraph, _iterator8, _step8, sug, _t1;
    return _regenerator().w(function (_context31) {
      while (1) switch (_context31.p = _context31.n) {
        case 0:
          if (!pendingSuggestionsOnline.length) {
            restored = restorePendingSuggestionsOnline();
            if (restored > 0) {
              log("applyAllSuggestionsOnline: restored ".concat(restored, " pending suggestions from storage"));
            }
          }
          if (pendingSuggestionsOnline.length) {
            _context31.n = 1;
            break;
          }
          warn("applyAllSuggestionsOnline: no pending suggestions");
          return _context31.a(2);
        case 1:
          suggestionsByParagraph = new Map();
          _iterator8 = _createForOfIteratorHelper(pendingSuggestionsOnline);
          _context31.p = 2;
          _iterator8.s();
        case 3:
          if ((_step8 = _iterator8.n()).done) {
            _context31.n = 6;
            break;
          }
          sug = _step8.value;
          if (!(typeof (sug === null || sug === void 0 ? void 0 : sug.paragraphIndex) !== "number" || sug.paragraphIndex < 0)) {
            _context31.n = 4;
            break;
          }
          return _context31.a(3, 5);
        case 4:
          if (!suggestionsByParagraph.has(sug.paragraphIndex)) {
            suggestionsByParagraph.set(sug.paragraphIndex, []);
          }
          suggestionsByParagraph.get(sug.paragraphIndex).push(sug);
        case 5:
          _context31.n = 3;
          break;
        case 6:
          _context31.n = 8;
          break;
        case 7:
          _context31.p = 7;
          _t1 = _context31.v;
          _iterator8.e(_t1);
        case 8:
          _context31.p = 8;
          _iterator8.f();
          return _context31.f(8);
        case 9:
          if (suggestionsByParagraph.size) {
            _context31.n = 10;
            break;
          }
          return _context31.a(2);
        case 10:
          _context31.n = 11;
          return Word.run(/*#__PURE__*/function () {
            var _ref37 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee30(context) {
              var paras, touchedIndexes, processedSuggestions, failedSuggestions, _iterator9, _step9, _entry$originalText7, _step9$value, paragraphIndex, suggestions, paragraph, entry, snapshotText, sourceText, _buildParagraphOperat, plan, skipped, noop, _iterator1, _step1, _suggestion, anyApplied, appliedCount, applyFailedCount, plannedRanges, opIndex, op, range, insertLocation, _iterator10, _step10, suggestion, _iterator0, _step0, idx, _t0;
              return _regenerator().w(function (_context30) {
                while (1) switch (_context30.p = _context30.n) {
                  case 0:
                    _context30.n = 1;
                    return wordOnlineAdapter.getParagraphs(context);
                  case 1:
                    paras = _context30.v;
                    touchedIndexes = new Set();
                    processedSuggestions = [];
                    failedSuggestions = [];
                    _iterator9 = _createForOfIteratorHelper(suggestionsByParagraph.entries());
                    _context30.p = 2;
                    _iterator9.s();
                  case 3:
                    if ((_step9 = _iterator9.n()).done) {
                      _context30.n = 11;
                      break;
                    }
                    _step9$value = _slicedToArray(_step9.value, 2), paragraphIndex = _step9$value[0], suggestions = _step9$value[1];
                    paragraph = paras.items[paragraphIndex];
                    if (paragraph) {
                      _context30.n = 4;
                      break;
                    }
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(suggestions));
                    return _context30.a(3, 10);
                  case 4:
                    entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
                    snapshotText = paragraph.text || "";
                    sourceText = (_entry$originalText7 = entry === null || entry === void 0 ? void 0 : entry.originalText) !== null && _entry$originalText7 !== void 0 ? _entry$originalText7 : snapshotText;
                    _buildParagraphOperat = buildParagraphOperationsPlan(snapshotText, sourceText, suggestions), plan = _buildParagraphOperat.plan, skipped = _buildParagraphOperat.skipped, noop = _buildParagraphOperat.noop;
                    log("applyAll plan", {
                      paragraphIndex: paragraphIndex,
                      total: suggestions.length,
                      planned: plan.length,
                      skipped: skipped.length,
                      noop: noop.length
                    });
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(skipped));
                    _iterator1 = _createForOfIteratorHelper(noop);
                    try {
                      for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
                        _suggestion = _step1.value;
                        processedSuggestions.push({
                          suggestion: _suggestion,
                          paragraph: paragraph
                        });
                      }
                    } catch (err) {
                      _iterator1.e(err);
                    } finally {
                      _iterator1.f();
                    }
                    anyApplied = false;
                    appliedCount = 0;
                    applyFailedCount = 0;
                    _context30.n = 5;
                    return getRangesForPlannedOperations(context, paragraph, snapshotText, plan, "apply-all-batch");
                  case 5:
                    plannedRanges = _context30.v;
                    opIndex = 0;
                  case 6:
                    if (!(opIndex < plan.length)) {
                      _context30.n = 9;
                      break;
                    }
                    op = plan[opIndex];
                    range = plannedRanges[opIndex];
                    if (range) {
                      _context30.n = 7;
                      break;
                    }
                    failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(op.suggestions));
                    applyFailedCount++;
                    return _context30.a(3, 8);
                  case 7:
                    try {
                      insertLocation = op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace;
                      range.insertText(op.replacement, insertLocation);
                      anyApplied = true;
                      _iterator10 = _createForOfIteratorHelper(op.suggestions);
                      try {
                        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                          suggestion = _step10.value;
                          processedSuggestions.push({
                            suggestion: suggestion,
                            paragraph: paragraph
                          });
                        }
                      } catch (err) {
                        _iterator10.e(err);
                      } finally {
                        _iterator10.f();
                      }
                      appliedCount++;
                    } catch (applyErr) {
                      warn("applyAllSuggestionsOnline: failed planned op", applyErr);
                      failedSuggestions.push.apply(failedSuggestions, _toConsumableArray(op.suggestions));
                      applyFailedCount++;
                    }
                  case 8:
                    opIndex++;
                    _context30.n = 6;
                    break;
                  case 9:
                    log("applyAll result", {
                      paragraphIndex: paragraphIndex,
                      appliedCount: appliedCount,
                      applyFailedCount: applyFailedCount
                    });
                    if (anyApplied) {
                      touchedIndexes.add(paragraphIndex);
                    }
                  case 10:
                    _context30.n = 3;
                    break;
                  case 11:
                    _context30.n = 13;
                    break;
                  case 12:
                    _context30.p = 12;
                    _t0 = _context30.v;
                    _iterator9.e(_t0);
                  case 13:
                    _context30.p = 13;
                    _iterator9.f();
                    return _context30.f(13);
                  case 14:
                    if (!processedSuggestions.length) {
                      _context30.n = 15;
                      break;
                    }
                    _context30.n = 15;
                    return wordOnlineAdapter.clearHighlights(context, processedSuggestions);
                  case 15:
                    _context30.n = 16;
                    return cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
                      force: wordOnlineAdapter.shouldForceSpacingCleanup()
                    });
                  case 16:
                    _iterator0 = _createForOfIteratorHelper(touchedIndexes);
                    try {
                      for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
                        idx = _step0.value;
                        anchorProvider.deleteAnchors(idx);
                      }
                    } catch (err) {
                      _iterator0.e(err);
                    } finally {
                      _iterator0.f();
                    }
                    pendingSuggestionsOnline.length = 0;
                    if (failedSuggestions.length) {
                      pendingSuggestionsOnline.push.apply(pendingSuggestionsOnline, failedSuggestions);
                      persistPendingSuggestionsOnline();
                    } else {
                      context.document.body.font.highlightColor = null;
                      persistPendingSuggestionsOnline();
                    }
                    _context30.n = 17;
                    return context.sync();
                  case 17:
                    return _context30.a(2);
                }
              }, _callee30, null, [[2, 12, 13, 14]]);
            }));
            return function (_x92) {
              return _ref37.apply(this, arguments);
            };
          }());
        case 11:
          return _context31.a(2);
      }
    }, _callee31, null, [[2, 7, 8, 9]]);
  }));
  return _applyAllSuggestionsOnline.apply(this, arguments);
}
function rejectAllSuggestionsOnline() {
  return _rejectAllSuggestionsOnline.apply(this, arguments);
}
/** ─────────────────────────────────────────────────────────
 *  MAIN: Preveri vejice – celoten dokument, po odstavkih
 *  ───────────────────────────────────────────────────────── */
function _rejectAllSuggestionsOnline() {
  _rejectAllSuggestionsOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee33() {
    return _regenerator().w(function (_context33) {
      while (1) switch (_context33.n) {
        case 0:
          _context33.n = 1;
          return Word.run(/*#__PURE__*/function () {
            var _ref38 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee32(context) {
              var paras;
              return _regenerator().w(function (_context32) {
                while (1) switch (_context32.n) {
                  case 0:
                    paras = context.document.body.paragraphs;
                    paras.load("items/text");
                    _context32.n = 1;
                    return context.sync();
                  case 1:
                    _context32.n = 2;
                    return wordOnlineAdapter.clearHighlights(context, null, paras);
                  case 2:
                    context.document.body.font.highlightColor = null;
                    _context32.n = 3;
                    return context.sync();
                  case 3:
                    return _context32.a(2);
                }
              }, _callee32);
            }));
            return function (_x93) {
              return _ref38.apply(this, arguments);
            };
          }());
        case 1:
          return _context33.a(2);
      }
    }, _callee33);
  }));
  return _rejectAllSuggestionsOnline.apply(this, arguments);
}
function checkDocumentText() {
  return _checkDocumentText.apply(this, arguments);
}
function _checkDocumentText() {
  _checkDocumentText = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee34() {
    return _regenerator().w(function (_context34) {
      while (1) switch (_context34.n) {
        case 0:
          resetNotificationFlags();
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context34.n = 1;
            break;
          }
          return _context34.a(2, checkDocumentTextOnline());
        case 1:
          return _context34.a(2, checkDocumentTextDesktop());
      }
    }, _callee34);
  }));
  return _checkDocumentText.apply(this, arguments);
}
function checkDocumentTextDesktop() {
  return _checkDocumentTextDesktop.apply(this, arguments);
}
function _checkDocumentTextDesktop() {
  _checkDocumentTextDesktop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee36() {
    var totalInserted, totalDeleted, paragraphsProcessed, apiErrors, nonCommaSkips, _t12;
    return _regenerator().w(function (_context36) {
      while (1) switch (_context36.p = _context36.n) {
        case 0:
          log("START checkDocumentText()");
          totalInserted = 0;
          totalDeleted = 0;
          paragraphsProcessed = 0;
          apiErrors = 0;
          nonCommaSkips = 0;
          _context36.p = 1;
          _context36.n = 2;
          return Word.run(/*#__PURE__*/function () {
            var _ref39 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee35(context) {
              var doc, paras, documentCharOffset, idx, _anchorsEntry$origina, paragraph, sourceText, normalizedSource, trimmed, paragraphDocOffset, pStart, result, suggestions, anchorsEntry, snapshotText, sourceForPlan, _buildParagraphOperat2, plan, skipped, noop, appliedInParagraph, plannedRanges, opIndex, op, range, _op$suggestions, insertLocation, _iterator11, _step11, suggestion, _t10, _t11;
              return _regenerator().w(function (_context35) {
                while (1) switch (_context35.p = _context35.n) {
                  case 0:
                    log("Desktop phase: tracked-change guard:start");
                    _context35.n = 1;
                    return documentHasTrackedChanges(context);
                  case 1:
                    if (!_context35.v) {
                      _context35.n = 2;
                      break;
                    }
                    notifyTrackedChangesPresent();
                    return _context35.a(2);
                  case 2:
                    log("Desktop phase: tracked-change guard:done");

                    // On desktop we require the user to enable Track Changes manually.
                    doc = context.document;
                    _context35.p = 3;
                    log("Desktop phase: doc.load(trackRevisions) -> sync:start");
                    doc.load("trackRevisions");
                    _context35.n = 4;
                    return context.sync();
                  case 4:
                    log("Desktop phase: doc.load(trackRevisions) -> sync:done");
                    if (doc.trackRevisions) {
                      _context35.n = 5;
                      break;
                    }
                    notifyTrackChangesRequired();
                    return _context35.a(2);
                  case 5:
                    _context35.n = 7;
                    break;
                  case 6:
                    _context35.p = 6;
                    _t10 = _context35.v;
                    warn("trackRevisions not available -> require manual enablement", _t10);
                    notifyTrackChangesRequired();
                    return _context35.a(2);
                  case 7:
                    log("Desktop phase: getParagraphs:start");
                    _context35.n = 8;
                    return wordDesktopAdapter.getParagraphs(context);
                  case 8:
                    paras = _context35.v;
                    log("Desktop phase: getParagraphs:done");
                    log("Paragraphs found:", paras.items.length);
                    anchorProvider.reset();
                    documentCharOffset = 0;
                    idx = 0;
                  case 9:
                    if (!(idx < paras.items.length)) {
                      _context35.n = 27;
                      break;
                    }
                    paragraph = paras.items[idx];
                    sourceText = paragraph.text || "";
                    normalizedSource = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.normalizeParagraphWhitespace)(sourceText);
                    trimmed = normalizedSource.trim();
                    paragraphDocOffset = documentCharOffset;
                    documentCharOffset += sourceText.length + 1;
                    if (trimmed) {
                      _context35.n = 11;
                      break;
                    }
                    _context35.n = 10;
                    return anchorProvider.getAnchors({
                      paragraphIndex: idx,
                      originalText: sourceText,
                      correctedText: sourceText,
                      sourceTokens: [],
                      targetTokens: [],
                      documentOffset: paragraphDocOffset
                    });
                  case 10:
                    return _context35.a(3, 26);
                  case 11:
                    if (!(trimmed.length > MAX_PARAGRAPH_CHARS)) {
                      _context35.n = 12;
                      break;
                    }
                    notifyParagraphTooLong(idx, trimmed.length);
                    return _context35.a(3, 26);
                  case 12:
                    pStart = tnow();
                    paragraphsProcessed++;
                    log("P".concat(idx, ": len=").concat(sourceText.length, " | \"").concat(SNIP(trimmed), "\""));
                    result = void 0;
                    _context35.p = 13;
                    _context35.n = 14;
                    return commaEngine.analyzeParagraph({
                      paragraphIndex: idx,
                      originalText: sourceText,
                      normalizedOriginalText: normalizedSource,
                      paragraphDocOffset: paragraphDocOffset
                    });
                  case 14:
                    result = _context35.v;
                    _context35.n = 16;
                    break;
                  case 15:
                    _context35.p = 15;
                    _t11 = _context35.v;
                    apiErrors++;
                    warn("P".concat(idx, ": engine failed"), _t11);
                    notifyApiUnavailable();
                    return _context35.a(3, 26);
                  case 16:
                    apiErrors += result.apiErrors;
                    nonCommaSkips += result.nonCommaSkips || 0;
                    suggestions = result.suggestions || [];
                    if (suggestions.length) {
                      _context35.n = 17;
                      break;
                    }
                    return _context35.a(3, 26);
                  case 17:
                    anchorsEntry = anchorProvider.getAnchorsForParagraph(idx);
                    snapshotText = sourceText;
                    sourceForPlan = (_anchorsEntry$origina = anchorsEntry === null || anchorsEntry === void 0 ? void 0 : anchorsEntry.originalText) !== null && _anchorsEntry$origina !== void 0 ? _anchorsEntry$origina : sourceText;
                    _buildParagraphOperat2 = buildParagraphOperationsPlan(snapshotText, sourceForPlan, suggestions), plan = _buildParagraphOperat2.plan, skipped = _buildParagraphOperat2.skipped, noop = _buildParagraphOperat2.noop;
                    log("Desktop apply plan", {
                      paragraphIndex: idx,
                      total: suggestions.length,
                      planned: plan.length,
                      skipped: skipped.length,
                      noop: noop.length
                    });
                    appliedInParagraph = 0;
                    _context35.n = 18;
                    return getRangesForPlannedOperations(context, paragraph, snapshotText, plan, "desktop-batch");
                  case 18:
                    plannedRanges = _context35.v;
                    opIndex = 0;
                  case 19:
                    if (!(opIndex < plan.length)) {
                      _context35.n = 22;
                      break;
                    }
                    op = plan[opIndex];
                    range = plannedRanges[opIndex];
                    if (range) {
                      _context35.n = 20;
                      break;
                    }
                    warn("Desktop batch op skipped: range not resolved", {
                      paragraphIndex: idx,
                      opIndex: opIndex,
                      kind: op === null || op === void 0 ? void 0 : op.kind
                    });
                    return _context35.a(3, 21);
                  case 20:
                    try {
                      insertLocation = op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace;
                      range.insertText(op.replacement, insertLocation);
                      appliedInParagraph += ((_op$suggestions = op.suggestions) === null || _op$suggestions === void 0 ? void 0 : _op$suggestions.length) || 1;
                      _iterator11 = _createForOfIteratorHelper(op.suggestions || []);
                      try {
                        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                          suggestion = _step11.value;
                          if (suggestion.kind === "insert") {
                            totalInserted++;
                          } else if (suggestion.kind === "delete") {
                            totalDeleted++;
                          }
                        }
                      } catch (err) {
                        _iterator11.e(err);
                      } finally {
                        _iterator11.f();
                      }
                    } catch (err) {
                      warn("Desktop batch op failed", err);
                    }
                  case 21:
                    opIndex++;
                    _context35.n = 19;
                    break;
                  case 22:
                    if (!appliedInParagraph) {
                      _context35.n = 26;
                      break;
                    }
                    if (!anchorProviderSupportsCharHints) {
                      _context35.n = 24;
                      break;
                    }
                    _context35.n = 23;
                    return ensureCommaSpaceAfterInParagraph(context, paragraph);
                  case 23:
                    log("Desktop post-pass: ensured missing spaces after commas.");
                    _context35.n = 25;
                    break;
                  case 24:
                    _context35.n = 25;
                    return normalizeCommaSpacingInParagraph(context, paragraph);
                  case 25:
                    log("P".concat(idx, ": applied (ins=").concat(totalInserted, ", del=").concat(totalDeleted, ") | ").concat(Math.round(tnow() - pStart), " ms"));
                  case 26:
                    idx++;
                    _context35.n = 9;
                    break;
                  case 27:
                    return _context35.a(2);
                }
              }, _callee35, null, [[13, 15], [3, 6]]);
            }));
            return function (_x94) {
              return _ref39.apply(this, arguments);
            };
          }());
        case 2:
          log("DONE checkDocumentText() | paragraphs:", paragraphsProcessed, "| inserted:", totalInserted, "| deleted:", totalDeleted, "| apiErrors:", apiErrors, "| nonCommaSkips:", nonCommaSkips);
          if (paragraphsProcessed > 0 && totalInserted === 0 && totalDeleted === 0 && apiErrors === 0 && nonCommaSkips === 0) {
            notifyNoIssuesFound();
          }
          _context36.n = 4;
          break;
        case 3:
          _context36.p = 3;
          _t12 = _context36.v;
          errL("ERROR in checkDocumentText:", _t12);
        case 4:
          _context36.p = 4;
          flushScanNotifications();
          return _context36.f(4);
        case 5:
          return _context36.a(2);
      }
    }, _callee36, null, [[1, 3, 4, 5]]);
  }));
  return _checkDocumentTextDesktop.apply(this, arguments);
}
function checkDocumentTextOnline() {
  return _checkDocumentTextOnline.apply(this, arguments);
}
function _checkDocumentTextOnline() {
  _checkDocumentTextOnline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee38() {
    var paragraphsProcessed, suggestions, apiErrors, nonCommaSkips, _t14;
    return _regenerator().w(function (_context38) {
      while (1) switch (_context38.p = _context38.n) {
        case 0:
          log("START checkDocumentTextOnline()");
          paragraphsProcessed = 0;
          suggestions = 0;
          apiErrors = 0;
          nonCommaSkips = 0;
          _context38.p = 1;
          _context38.n = 2;
          return Word.run(/*#__PURE__*/function () {
            var _ref40 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee37(context) {
              var paras, documentCharOffset, idx, _result$suggestions, p, original, normalizedOriginal, trimmed, paragraphDocOffset, result, _iterator12, _step12, suggestionObj, highlighted, _t13;
              return _regenerator().w(function (_context37) {
                while (1) switch (_context37.p = _context37.n) {
                  case 0:
                    _context37.n = 1;
                    return documentHasTrackedChanges(context);
                  case 1:
                    if (!_context37.v) {
                      _context37.n = 2;
                      break;
                    }
                    notifyTrackedChangesPresent();
                    return _context37.a(2);
                  case 2:
                    _context37.n = 3;
                    return wordOnlineAdapter.getParagraphs(context);
                  case 3:
                    paras = _context37.v;
                    _context37.n = 4;
                    return wordOnlineAdapter.clearHighlights(context, null, paras);
                  case 4:
                    resetPendingSuggestionsOnline();
                    anchorProvider.reset();
                    documentCharOffset = 0;
                    idx = 0;
                  case 5:
                    if (!(idx < paras.items.length)) {
                      _context37.n = 18;
                      break;
                    }
                    p = paras.items[idx];
                    original = p.text || "";
                    normalizedOriginal = (0,_engine_textUtils_js__WEBPACK_IMPORTED_MODULE_9__.normalizeParagraphWhitespace)(original);
                    trimmed = normalizedOriginal.trim();
                    paragraphDocOffset = documentCharOffset;
                    documentCharOffset += original.length + 1;
                    if (trimmed) {
                      _context37.n = 7;
                      break;
                    }
                    _context37.n = 6;
                    return anchorProvider.getAnchors({
                      paragraphIndex: idx,
                      originalText: original,
                      correctedText: original,
                      sourceTokens: [],
                      targetTokens: [],
                      documentOffset: paragraphDocOffset
                    });
                  case 6:
                    return _context37.a(3, 17);
                  case 7:
                    log("P".concat(idx, " ONLINE: len=").concat(original.length, " | \"").concat(SNIP(trimmed), "\""));
                    paragraphsProcessed++;
                    _context37.n = 8;
                    return commaEngine.analyzeParagraph({
                      paragraphIndex: idx,
                      originalText: original,
                      normalizedOriginalText: normalizedOriginal,
                      paragraphDocOffset: paragraphDocOffset,
                      conservativeSentenceFallback: true
                    });
                  case 8:
                    result = _context37.v;
                    apiErrors += result.apiErrors;
                    nonCommaSkips += result.nonCommaSkips || 0;
                    if ((_result$suggestions = result.suggestions) !== null && _result$suggestions !== void 0 && _result$suggestions.length) {
                      _context37.n = 9;
                      break;
                    }
                    return _context37.a(3, 17);
                  case 9:
                    _iterator12 = _createForOfIteratorHelper(result.suggestions);
                    _context37.p = 10;
                    _iterator12.s();
                  case 11:
                    if ((_step12 = _iterator12.n()).done) {
                      _context37.n = 14;
                      break;
                    }
                    suggestionObj = _step12.value;
                    _context37.n = 12;
                    return wordOnlineAdapter.highlightSuggestion(context, p, suggestionObj);
                  case 12:
                    highlighted = _context37.v;
                    if (highlighted) {
                      suggestions++;
                    }
                  case 13:
                    _context37.n = 11;
                    break;
                  case 14:
                    _context37.n = 16;
                    break;
                  case 15:
                    _context37.p = 15;
                    _t13 = _context37.v;
                    _iterator12.e(_t13);
                  case 16:
                    _context37.p = 16;
                    _iterator12.f();
                    return _context37.f(16);
                  case 17:
                    idx++;
                    _context37.n = 5;
                    break;
                  case 18:
                    _context37.n = 19;
                    return context.sync();
                  case 19:
                    return _context37.a(2);
                }
              }, _callee37, null, [[10, 15, 16, 17]]);
            }));
            return function (_x95) {
              return _ref40.apply(this, arguments);
            };
          }());
        case 2:
          log("DONE checkDocumentTextOnline() | paragraphs:", paragraphsProcessed, "| suggestions:", suggestions, "| apiErrors:", apiErrors, "| nonCommaSkips:", nonCommaSkips);
          if (paragraphsProcessed > 0 && suggestions === 0 && apiErrors === 0 && nonCommaSkips === 0) {
            notifyNoIssuesFound();
          }
          _context38.n = 4;
          break;
        case 3:
          _context38.p = 3;
          _t14 = _context38.v;
          errL("ERROR in checkDocumentTextOnline:", _t14);
        case 4:
          _context38.p = 4;
          flushScanNotifications();
          return _context38.f(4);
        case 5:
          return _context38.a(2);
      }
    }, _callee38, null, [[1, 3, 4, 5]]);
  }));
  return _checkDocumentTextOnline.apply(this, arguments);
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "596310be3f31dbf6c9e0"; }
/******/ }();
/******/ 
/******/ }
);
//# sourceMappingURL=commands.e06c18ef1fcea557be92.hot-update.js.map