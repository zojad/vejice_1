"use strict";
(self["webpackChunkoffice_addin_taskpane_js"] = self["webpackChunkoffice_addin_taskpane_js"] || []).push([["commands"],{

/***/ "./src/commands/commands.js":
/*!**********************************!*\
  !*** ./src/commands/commands.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logic/preveriVejice.js */ "./src/logic/preveriVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
/* harmony import */ var _utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/notifications.js */ "./src/utils/notifications.js");
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
  (0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.publishTaskpaneNotifications)([message], {
    source: (0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)() ? "online-command" : "desktop-command",
    level: "info"
  });
  if (!(0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.shouldUseToastFallback)()) return;
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
var isCommandBusy = false;
var CHECK_CLICK_DEBOUNCE_MS = 800;
var lastCheckClickAt = 0;
var ribbonUpdatesSupported = true;
var ribbonSupportProbeDone = false;
var ribbonUnavailableLogged = false;
var isRibbonApiUnavailableError = function isRibbonApiUnavailableError(err) {
  var code = String((err === null || err === void 0 ? void 0 : err.code) || "").toLowerCase();
  var msg = String((err === null || err === void 0 ? void 0 : err.message) || "").toLowerCase();
  return code.includes("apinotfound") || code.includes("notsupported") || msg.includes("api you are trying to use is not available") || msg.includes("different scenario");
};
var syncRibbonButtonState = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var _Office;
    var _Office2, _Office2$isSetSupport, supportsRibbonApi, checkRunning, disableApplyButtons, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          if (ribbonUpdatesSupported) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          if (!(typeof Office === "undefined" || !((_Office = Office) !== null && _Office !== void 0 && (_Office = _Office.ribbon) !== null && _Office !== void 0 && _Office.requestUpdate))) {
            _context.n = 2;
            break;
          }
          return _context.a(2);
        case 2:
          if (ribbonSupportProbeDone) {
            _context.n = 6;
            break;
          }
          ribbonSupportProbeDone = true;
          _context.p = 3;
          supportsRibbonApi = Boolean((_Office2 = Office) === null || _Office2 === void 0 || (_Office2 = _Office2.context) === null || _Office2 === void 0 || (_Office2 = _Office2.requirements) === null || _Office2 === void 0 || (_Office2$isSetSupport = _Office2.isSetSupported) === null || _Office2$isSetSupport === void 0 ? void 0 : _Office2$isSetSupport.call(_Office2, "RibbonApi", "1.1"));
          if (supportsRibbonApi) {
            _context.n = 4;
            break;
          }
          ribbonUpdatesSupported = false;
          if (!ribbonUnavailableLogged) {
            ribbonUnavailableLogged = true;
            log("Ribbon state updates disabled: RibbonApi not supported in this host/scenario");
          }
          return _context.a(2);
        case 4:
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
        case 6:
          checkRunning = Boolean(isCheckRunning || (_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress === null || _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress === void 0 ? void 0 : (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()));
          disableApplyButtons = Boolean(checkRunning || isCommandBusy);
          _context.p = 7;
          _context.n = 8;
          return Office.ribbon.requestUpdate({
            tabs: [{
              id: "TabHome",
              groups: [{
                id: "VejiceGroup",
                controls: [{
                  id: "CheckVejice",
                  enabled: true
                }, {
                  id: "AcceptAll",
                  enabled: !disableApplyButtons
                }, {
                  id: "RejectAll",
                  enabled: !disableApplyButtons
                }]
              }]
            }]
          });
        case 8:
          _context.n = 11;
          break;
        case 9:
          _context.p = 9;
          _t2 = _context.v;
          if (!isRibbonApiUnavailableError(_t2)) {
            _context.n = 10;
            break;
          }
          ribbonUpdatesSupported = false;
          if (!ribbonUnavailableLogged) {
            ribbonUnavailableLogged = true;
            log("Ribbon state updates disabled:", (_t2 === null || _t2 === void 0 ? void 0 : _t2.message) || _t2);
          }
          return _context.a(2);
        case 10:
          log("Ribbon state update skipped:", (_t2 === null || _t2 === void 0 ? void 0 : _t2.message) || _t2);
        case 11:
          return _context.a(2);
      }
    }, _callee, null, [[7, 9], [3, 5]]);
  }));
  return function syncRibbonButtonState() {
    return _ref.apply(this, arguments);
  };
}();
var tryAutoOpenTaskpane = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var _Office3;
    var storage, _t3;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          if (!(typeof Office === "undefined")) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2);
        case 1:
          if ((_Office3 = Office) !== null && _Office3 !== void 0 && (_Office3 = _Office3.addin) !== null && _Office3 !== void 0 && _Office3.showAsTaskpane) {
            _context2.n = 2;
            break;
          }
          log("Auto-open taskpane skipped: Office.addin.showAsTaskpane not supported");
          return _context2.a(2);
        case 2:
          if (!(typeof window === "undefined")) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2);
        case 3:
          _context2.p = 3;
          storage = window.sessionStorage;
          if (!(storage && storage.getItem(TASKPANE_AUTOOPEN_SESSION_KEY) === "1")) {
            _context2.n = 4;
            break;
          }
          return _context2.a(2);
        case 4:
          _context2.n = 5;
          return Office.addin.showAsTaskpane();
        case 5:
          if (storage) {
            storage.setItem(TASKPANE_AUTOOPEN_SESSION_KEY, "1");
          }
          log("Auto-opened taskpane");
          _context2.n = 7;
          break;
        case 6:
          _context2.p = 6;
          _t3 = _context2.v;
          errL("Auto-open taskpane failed:", _t3);
        case 7:
          return _context2.a(2);
      }
    }, _callee2, null, [[3, 6]]);
  }));
  return function tryAutoOpenTaskpane() {
    return _ref2.apply(this, arguments);
  };
}();
var revisionsApiSupported = function revisionsApiSupported() {
  try {
    var _Office4, _Office4$isSetSupport;
    return Boolean((_Office4 = Office) === null || _Office4 === void 0 || (_Office4 = _Office4.context) === null || _Office4 === void 0 || (_Office4 = _Office4.requirements) === null || _Office4 === void 0 || (_Office4$isSetSupport = _Office4.isSetSupported) === null || _Office4$isSetSupport === void 0 ? void 0 : _Office4$isSetSupport.call(_Office4, "WordApi", "1.3"));
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
  var _Office5, _Office6;
  log("Office ready | Host:", (_Office5 = Office) === null || _Office5 === void 0 || (_Office5 = _Office5.context) === null || _Office5 === void 0 ? void 0 : _Office5.host, "| Platform:", (_Office6 = Office) === null || _Office6 === void 0 ? void 0 : _Office6.platform);
});

// —————————————————————————————————————————————
// Ribbon commands (must be globals)
// —————————————————————————————————————————————
window.checkDocumentText = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(event) {
    var t0, now, summary, _t4;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          t0 = tnow();
          now = Date.now();
          log("CLICK: Preveri vejice (checkDocumentText)");
          if (!(now - lastCheckClickAt < CHECK_CLICK_DEBOUNCE_MS)) {
            _context3.n = 1;
            break;
          }
          log("checkDocumentText ignored: debounced");
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context3.a(2);
        case 1:
          lastCheckClickAt = now;
          if (!(isCheckRunning || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context3.n = 2;
            break;
          }
          log("checkDocumentText ignored: already running");
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context3.a(2);
        case 2:
          isCheckRunning = true;
          isCommandBusy = true;
          _context3.n = 3;
          return syncRibbonButtonState();
        case 3:
          _context3.p = 3;
          _context3.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.checkDocumentText)();
        case 4:
          summary = _context3.v;
          if ((summary === null || summary === void 0 ? void 0 : summary.status) === "deferred") {
            log("checkDocumentText deferred:", (summary === null || summary === void 0 ? void 0 : summary.reason) || "unknown");
          }
          log("DONE: checkDocumentText |", Math.round(tnow() - t0), "ms");
          _context3.n = 6;
          break;
        case 5:
          _context3.p = 5;
          _t4 = _context3.v;
          errL("checkDocumentText failed:", _t4);
        case 6:
          _context3.p = 6;
          isCheckRunning = false;
          isCommandBusy = false;
          _context3.n = 7;
          return syncRibbonButtonState();
        case 7:
          done(event, "checkDocumentText");
          log("event.completed(): checkDocumentText");
          return _context3.f(6);
        case 8:
          return _context3.a(2);
      }
    }, _callee3, null, [[3, 5, 6, 8]]);
  }));
  return function (_x) {
    return _ref3.apply(this, arguments);
  };
}();
window.acceptAllChanges = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(event) {
    var t0, _applySummary$duratio, applySummary, _err$message, _t5;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Sprejmi spremembe (acceptAllChanges)");
          if (!(0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()) {
            _context5.n = 1;
            break;
          }
          log("acceptAllChanges ignored: check in progress");
          showCommandToast("Počakajte, da se preverjanje konča.");
          done(event, "acceptAllChanges");
          log("event.completed(): acceptAllChanges");
          return _context5.a(2);
        case 1:
          if (!isCommandBusy) {
            _context5.n = 2;
            break;
          }
          log("acceptAllChanges ignored: another command is running");
          done(event, "acceptAllChanges");
          log("event.completed(): acceptAllChanges");
          return _context5.a(2);
        case 2:
          isCommandBusy = true;
          _context5.n = 3;
          return syncRibbonButtonState();
        case 3:
          _context5.p = 3;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context5.n = 5;
            break;
          }
          _context5.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.applyAllSuggestionsOnline)();
        case 4:
          applySummary = _context5.v;
          log("Apply online summary:", applySummary);
          log("Applied online suggestions |", (_applySummary$duratio = applySummary === null || applySummary === void 0 ? void 0 : applySummary.durationMs) !== null && _applySummary$duratio !== void 0 ? _applySummary$duratio : Math.round(tnow() - t0), "ms");
          _context5.n = 7;
          break;
        case 5:
          if (revisionsApiSupported()) {
            _context5.n = 6;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 6:
          _context5.n = 7;
          return Word.run(/*#__PURE__*/function () {
            var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(context) {
              var revisions, firstRevision, count;
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.n) {
                  case 0:
                    revisions = context.document.revisions;
                    if (!(typeof revisions.getFirstOrNullObject === "function")) {
                      _context4.n = 2;
                      break;
                    }
                    firstRevision = revisions.getFirstOrNullObject();
                    firstRevision.load("isNullObject");
                    _context4.n = 1;
                    return context.sync();
                  case 1:
                    if (!firstRevision.isNullObject) {
                      _context4.n = 2;
                      break;
                    }
                    log("Revisions to accept: 0");
                    return _context4.a(2);
                  case 2:
                    revisions.load("items");
                    _context4.n = 3;
                    return context.sync();
                  case 3:
                    count = revisions.items.length;
                    log("Revisions to accept:", count);
                    if (count) {
                      _context4.n = 4;
                      break;
                    }
                    return _context4.a(2);
                  case 4:
                    revisions.items.forEach(function (rev) {
                      return rev.accept();
                    });
                    _context4.n = 5;
                    return context.sync();
                  case 5:
                    log("Accepted revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 6:
                    return _context4.a(2);
                }
              }, _callee4);
            }));
            return function (_x3) {
              return _ref5.apply(this, arguments);
            };
          }());
        case 7:
          _context5.n = 9;
          break;
        case 8:
          _context5.p = 8;
          _t5 = _context5.v;
          if (_t5 !== null && _t5 !== void 0 && (_err$message = _t5.message) !== null && _err$message !== void 0 && _err$message.includes("Revisions API is not available")) {
            errL("acceptAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("acceptAllChanges failed:", _t5);
          }
        case 9:
          _context5.p = 9;
          isCommandBusy = false;
          _context5.n = 10;
          return syncRibbonButtonState();
        case 10:
          done(event, "acceptAllChanges");
          log("event.completed(): acceptAllChanges");
          return _context5.f(9);
        case 11:
          return _context5.a(2);
      }
    }, _callee5, null, [[3, 8, 9, 11]]);
  }));
  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();
window.rejectAllChanges = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(event) {
    var t0, _rejectSummary$durati, rejectSummary, _err$message2, _t6;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          t0 = tnow();
          log("CLICK: Zavrni spremembe (rejectAllChanges)");
          if (!(0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()) {
            _context7.n = 1;
            break;
          }
          log("rejectAllChanges ignored: check in progress");
          showCommandToast("Počakajte, da se preverjanje konča.");
          done(event, "rejectAllChanges");
          log("event.completed(): rejectAllChanges");
          return _context7.a(2);
        case 1:
          if (!isCommandBusy) {
            _context7.n = 2;
            break;
          }
          log("rejectAllChanges ignored: another command is running");
          done(event, "rejectAllChanges");
          log("event.completed(): rejectAllChanges");
          return _context7.a(2);
        case 2:
          isCommandBusy = true;
          _context7.n = 3;
          return syncRibbonButtonState();
        case 3:
          _context7.p = 3;
          if (!(0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)()) {
            _context7.n = 5;
            break;
          }
          _context7.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.rejectAllSuggestionsOnline)();
        case 4:
          rejectSummary = _context7.v;
          log("Reject online summary:", rejectSummary);
          log("Cleared online suggestions |", (_rejectSummary$durati = rejectSummary === null || rejectSummary === void 0 ? void 0 : rejectSummary.durationMs) !== null && _rejectSummary$durati !== void 0 ? _rejectSummary$durati : Math.round(tnow() - t0), "ms");
          _context7.n = 7;
          break;
        case 5:
          if (revisionsApiSupported()) {
            _context7.n = 6;
            break;
          }
          throw new Error("Revisions API is not available on this host");
        case 6:
          _context7.n = 7;
          return Word.run(/*#__PURE__*/function () {
            var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(context) {
              var revisions, firstRevision, count;
              return _regenerator().w(function (_context6) {
                while (1) switch (_context6.n) {
                  case 0:
                    revisions = context.document.revisions;
                    if (!(typeof revisions.getFirstOrNullObject === "function")) {
                      _context6.n = 2;
                      break;
                    }
                    firstRevision = revisions.getFirstOrNullObject();
                    firstRevision.load("isNullObject");
                    _context6.n = 1;
                    return context.sync();
                  case 1:
                    if (!firstRevision.isNullObject) {
                      _context6.n = 2;
                      break;
                    }
                    log("Revisions to reject: 0");
                    return _context6.a(2);
                  case 2:
                    revisions.load("items");
                    _context6.n = 3;
                    return context.sync();
                  case 3:
                    count = revisions.items.length;
                    log("Revisions to reject:", count);
                    if (count) {
                      _context6.n = 4;
                      break;
                    }
                    return _context6.a(2);
                  case 4:
                    revisions.items.forEach(function (rev) {
                      return rev.reject();
                    });
                    _context6.n = 5;
                    return context.sync();
                  case 5:
                    log("Rejected revisions:", count, "|", Math.round(tnow() - t0), "ms");
                  case 6:
                    return _context6.a(2);
                }
              }, _callee6);
            }));
            return function (_x5) {
              return _ref7.apply(this, arguments);
            };
          }());
        case 7:
          _context7.n = 9;
          break;
        case 8:
          _context7.p = 8;
          _t6 = _context7.v;
          if (_t6 !== null && _t6 !== void 0 && (_err$message2 = _t6.message) !== null && _err$message2 !== void 0 && _err$message2.includes("Revisions API is not available")) {
            errL("rejectAllChanges skipped: revisions API is not available on this host");
          } else {
            errL("rejectAllChanges failed:", _t6);
          }
        case 9:
          _context7.p = 9;
          isCommandBusy = false;
          _context7.n = 10;
          return syncRibbonButtonState();
        case 10:
          done(event, "rejectAllChanges");
          log("event.completed(): rejectAllChanges");
          return _context7.f(9);
        case 11:
          return _context7.a(2);
      }
    }, _callee7, null, [[3, 8, 9, 11]]);
  }));
  return function (_x4) {
    return _ref6.apply(this, arguments);
  };
}();

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["common"], function() { return __webpack_exec__("./node_modules/webpack-dev-server/client/index.js?protocol=wss%3A&hostname=localhost&port=4001&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true"), __webpack_exec__("./node_modules/webpack/hot/dev-server.js"), __webpack_exec__("./src/commands/commands.js"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=commands.js.map