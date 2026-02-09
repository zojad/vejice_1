"use strict";
self["webpackHotUpdateoffice_addin_taskpane_js"]("commands",{

/***/ "./src/commands/commands.js":
/*!**********************************!*\
  !*** ./src/commands/commands.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logic/preveriVejice.js */ "./src/logic/preveriVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
var _process$env$VEJICE_U, _process$env2;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global Office, Word, window, process, performance, console, URLSearchParams */

// Wire your checker and expose globals the manifest calls.


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
  return DEBUG && (_console = console).log.apply(_console, ["[Vejice CMD]"].concat(a));
};
var errL = function errL() {
  var _console2;
  for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    a[_key2] = arguments[_key2];
  }
  return (_console2 = console).error.apply(_console2, ["[Vejice CMD]"].concat(a));
};
var tnow = function tnow() {
  var _performance$now, _performance, _performance$now2;
  return (_performance$now = (_performance = performance) === null || _performance === void 0 || (_performance$now2 = _performance.now) === null || _performance$now2 === void 0 ? void 0 : _performance$now2.call(_performance)) !== null && _performance$now !== void 0 ? _performance$now : Date.now();
};
var TASKPANE_AUTOOPEN_SESSION_KEY = "vejice:autoopen-taskpane:v1";
var done = function done(event, tag) {
  try {
    event && event.completed && event.completed();
  } catch (e) {
    errL("".concat(tag, ": event.completed() threw"), e);
  }
};
var cmdToastDialog = null;
var showCommandToast = function showCommandToast(message) {
  var _Office$context;
  if (!message) return;
  if (typeof Office === "undefined" || !((_Office$context = Office.context) !== null && _Office$context !== void 0 && (_Office$context = _Office$context.ui) !== null && _Office$context !== void 0 && _Office$context.displayDialogAsync)) return;
  var origin = typeof window !== "undefined" && window.location && window.location.origin || null;
  if (!origin) return;
  var toastUrl = new URL("toast.html", origin);
  toastUrl.searchParams.set("message", message);
  Office.context.ui.displayDialogAsync(toastUrl.toString(), {
    height: 20,
    width: 30,
    displayInIframe: true
  }, function (asyncResult) {
    if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) return;
    if (cmdToastDialog) {
      try {
        cmdToastDialog.close();
      } catch (_err) {
        // ignore
      }
    }
    cmdToastDialog = asyncResult.value;
    var closeDialog = function closeDialog() {
      if (!cmdToastDialog) return;
      try {
        cmdToastDialog.close();
      } catch (_err) {
        // ignore
      } finally {
        cmdToastDialog = null;
      }
    };
    cmdToastDialog.addEventHandler(Office.EventType.DialogMessageReceived, closeDialog);
    cmdToastDialog.addEventHandler(Office.EventType.DialogEventReceived, closeDialog);
  });
};
var isCheckRunning = false;
var tryAutoOpenTaskpane = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var _Office;
    var storage, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (!(typeof Office === "undefined")) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          if ((_Office = Office) !== null && _Office !== void 0 && (_Office = _Office.addin) !== null && _Office !== void 0 && _Office.showAsTaskpane) {
            _context.n = 2;
            break;
          }
          log("Auto-open taskpane skipped: Office.addin.showAsTaskpane not supported");
          return _context.a(2);
        case 2:
          if (!(typeof window === "undefined")) {
            _context.n = 3;
            break;
          }
          return _context.a(2);
        case 3:
          _context.p = 3;
          storage = window.sessionStorage;
          if (!(storage && storage.getItem(TASKPANE_AUTOOPEN_SESSION_KEY) === "1")) {
            _context.n = 4;
            break;
          }
          return _context.a(2);
        case 4:
          _context.n = 5;
          return Office.addin.showAsTaskpane();
        case 5:
          if (storage) {
            storage.setItem(TASKPANE_AUTOOPEN_SESSION_KEY, "1");
          }
          log("Auto-opened taskpane");
          _context.n = 7;
          break;
        case 6:
          _context.p = 6;
          _t = _context.v;
          errL("Auto-open taskpane failed:", _t);
        case 7:
          return _context.a(2);
      }
    }, _callee, null, [[3, 6]]);
  }));
  return function tryAutoOpenTaskpane() {
    return _ref.apply(this, arguments);
  };
}();
var revisionsApiSupported = function revisionsApiSupported() {
  try {
    var _Office2, _Office2$isSetSupport;
    return Boolean((_Office2 = Office) === null || _Office2 === void 0 || (_Office2 = _Office2.context) === null || _Office2 === void 0 || (_Office2 = _Office2.requirements) === null || _Office2 === void 0 || (_Office2$isSetSupport = _Office2.isSetSupported) === null || _Office2$isSetSupport === void 0 ? void 0 : _Office2$isSetSupport.call(_Office2, "WordApi", "1.3"));
  } catch (err) {
    errL("Failed to check requirement set support", err);
    return false;
  }
};
var boolFromString = function boolFromString(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    var trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};
var queryMockFlag;
if (typeof window !== "undefined" && typeof URLSearchParams !== "undefined") {
  try {
    var params = new URLSearchParams(window.location.search || "");
    var q = params.get("mock");
    if (q !== null) queryMockFlag = boolFromString(q);
  } catch (err) {
    errL("Failed to parse ?mock query param", err);
  }
}
var envMockFlag = typeof process !== "undefined" ? boolFromString((_process$env$VEJICE_U = (_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "false") !== null && _process$env$VEJICE_U !== void 0 ? _process$env$VEJICE_U : "") : undefined;
var resolvedMock;
if (typeof queryMockFlag === "boolean") {
  resolvedMock = queryMockFlag;
} else if (typeof envMockFlag === "boolean") {
  resolvedMock = envMockFlag;
}
if (typeof window !== "undefined" && typeof resolvedMock === "boolean") {
  window.__VEJICE_USE_MOCK__ = resolvedMock;
  if (resolvedMock) log("Mock API mode is ENABLED");
}
Office.onReady(function () {
  var _Office3, _Office4;
  log("Office ready | Host:", (_Office3 = Office) === null || _Office3 === void 0 || (_Office3 = _Office3.context) === null || _Office3 === void 0 ? void 0 : _Office3.host, "| Platform:", (_Office4 = Office) === null || _Office4 === void 0 ? void 0 : _Office4.platform);
  tryAutoOpenTaskpane();
});

// —————————————————————————————————————————————
// Ribbon commands (must be globals)
// —————————————————————————————————————————————
window.checkDocumentText = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(event) {
    var t0, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Preveri vejice (checkDocumentText)");
          if (!isCheckRunning) {
            _context2.n = 1;
            break;
          }
          log("checkDocumentText ignored: already running");
          showCommandToast("Preverjanje ze poteka.");
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context2.a(2);
        case 1:
          isCheckRunning = true;
          _context2.p = 2;
          _context2.n = 3;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.checkDocumentText)();
        case 3:
          log("DONE: checkDocumentText |", Math.round(tnow() - t0), "ms");
          _context2.n = 5;
          break;
        case 4:
          _context2.p = 4;
          _t2 = _context2.v;
          errL("checkDocumentText failed:", _t2);
        case 5:
          _context2.p = 5;
          isCheckRunning = false;
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context2.f(5);
        case 6:
          return _context2.a(2);
      }
    }, _callee2, null, [[2, 4, 5, 6]]);
  }));
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
window.acceptAllChanges = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(event) {
    var t0, _getPendingSuggestion, _getPendingSuggestion2, _getPendingSuggestion3, _getPendingSuggestion4, pendingBefore, pendingAfter, _err$message, _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Sprejmi spremembe (acceptAllChanges)");
          _context4.p = 1;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context4.n = 3;
            break;
          }
          pendingBefore = (_getPendingSuggestion = (_getPendingSuggestion2 = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)(true)) === null || _getPendingSuggestion2 === void 0 ? void 0 : _getPendingSuggestion2.length) !== null && _getPendingSuggestion !== void 0 ? _getPendingSuggestion : 0;
          log("Pending online suggestions before apply:", pendingBefore);
          _context4.n = 2;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.applyAllSuggestionsOnline)();
        case 2:
          pendingAfter = (_getPendingSuggestion3 = (_getPendingSuggestion4 = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)(true)) === null || _getPendingSuggestion4 === void 0 ? void 0 : _getPendingSuggestion4.length) !== null && _getPendingSuggestion3 !== void 0 ? _getPendingSuggestion3 : 0;
          log("Pending online suggestions after apply:", pendingAfter);
          log("Applied online suggestions |", Math.round(tnow() - t0), "ms");
          _context4.n = 5;
          break;
        case 3:
          if (revisionsApiSupported()) {
            _context4.n = 4;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 4:
          _context4.n = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(context) {
              var revisions, count;
              return _regenerator().w(function (_context3) {
                while (1) switch (_context3.n) {
                  case 0:
                    revisions = context.document.revisions;
                    revisions.load("items");
                    _context3.n = 1;
                    return context.sync();
                  case 1:
                    count = revisions.items.length;
                    log("Revisions to accept:", count);
                    revisions.items.forEach(function (rev) {
                      return rev.accept();
                    });
                    _context3.n = 2;
                    return context.sync();
                  case 2:
                    log("Accepted revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 3:
                    return _context3.a(2);
                }
              }, _callee3);
            }));
            return function (_x3) {
              return _ref4.apply(this, arguments);
            };
          }());
        case 5:
          _context4.n = 7;
          break;
        case 6:
          _context4.p = 6;
          _t3 = _context4.v;
          if (_t3 !== null && _t3 !== void 0 && (_err$message = _t3.message) !== null && _err$message !== void 0 && _err$message.includes("Revisions API is not available")) {
            errL("acceptAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("acceptAllChanges failed:", _t3);
          }
        case 7:
          _context4.p = 7;
          done(event, "acceptAllChanges");
          log("event.completed(): acceptAllChanges");
          return _context4.f(7);
        case 8:
          return _context4.a(2);
      }
    }, _callee4, null, [[1, 6, 7, 8]]);
  }));
  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}();
window.rejectAllChanges = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(event) {
    var t0, _err$message2, _t4;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Zavrni spremembe (rejectAllChanges)");
          _context6.p = 1;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context6.n = 3;
            break;
          }
          _context6.n = 2;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.rejectAllSuggestionsOnline)();
        case 2:
          log("Cleared online suggestions |", Math.round(tnow() - t0), "ms");
          _context6.n = 5;
          break;
        case 3:
          if (revisionsApiSupported()) {
            _context6.n = 4;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 4:
          _context6.n = 5;
          return Word.run(/*#__PURE__*/function () {
            var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(context) {
              var revisions, count;
              return _regenerator().w(function (_context5) {
                while (1) switch (_context5.n) {
                  case 0:
                    revisions = context.document.revisions;
                    revisions.load("items");
                    _context5.n = 1;
                    return context.sync();
                  case 1:
                    count = revisions.items.length;
                    log("Revisions to reject:", count);
                    revisions.items.forEach(function (rev) {
                      return rev.reject();
                    });
                    _context5.n = 2;
                    return context.sync();
                  case 2:
                    log("Rejected revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 3:
                    return _context5.a(2);
                }
              }, _callee5);
            }));
            return function (_x5) {
              return _ref6.apply(this, arguments);
            };
          }());
        case 5:
          _context6.n = 7;
          break;
        case 6:
          _context6.p = 6;
          _t4 = _context6.v;
          if (_t4 !== null && _t4 !== void 0 && (_err$message2 = _t4.message) !== null && _err$message2 !== void 0 && _err$message2.includes("Revisions API is not available")) {
            errL("rejectAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("rejectAllChanges failed:", _t4);
          }
        case 7:
          _context6.p = 7;
          done(event, "rejectAllChanges");
          log("event.completed(): rejectAllChanges");
          return _context6.f(7);
        case 8:
          return _context6.a(2);
      }
    }, _callee6, null, [[1, 6, 7, 8]]);
  }));
  return function (_x4) {
    return _ref5.apply(this, arguments);
  };
}();

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "7af934c51ba33ad4ee30"; }
/******/ }();
/******/ 
/******/ }
);
//# sourceMappingURL=commands.b3f5c46eaf4640daa1dc.hot-update.js.map