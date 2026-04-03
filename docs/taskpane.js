"use strict";
(self["webpackChunkoffice_addin_taskpane_js"] = self["webpackChunkoffice_addin_taskpane_js"] || []).push([["taskpane"],{

/***/ "./src/taskpane/taskpane.js":
/*!**********************************!*\
  !*** ./src/taskpane/taskpane.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logic/preveriVejice.js */ "./src/logic/preveriVejice.js");
/* harmony import */ var _utils_host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/host.js */ "./src/utils/host.js");
/* harmony import */ var _utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/notifications.js */ "./src/utils/notifications.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global document, Office, Word, console, window, URLSearchParams, navigator, process, __VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS__, __VEJICE_BUILD_QUIET_LOGS__, __VEJICE_BUILD_ONLINE_VERBOSE_LOGS__, __VEJICE_BUILD_ONLINE_DRIFT_LOGS__, __VEJICE_BUILD_DEBUG__ */




var parseBooleanFlag = function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  var normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};
var getBuildBooleanFlag = function getBuildBooleanFlag(flagName) {
  try {
    switch (flagName) {
      case "quiet":
        return  true ? false : 0;
      case "onlineVerbose":
        return  true ? true : 0;
      case "onlineDrift":
        return  true ? true : 0;
      case "debug":
        return  true ? true : 0;
      default:
        return undefined;
    }
  } catch (_err) {
    return undefined;
  }
};
var applyBuildDebugFlagsToWindow = function applyBuildDebugFlagsToWindow() {
  if (typeof window === "undefined") return;
  var quiet = getBuildBooleanFlag("quiet");
  var onlineVerbose = getBuildBooleanFlag("onlineVerbose");
  var onlineDrift = getBuildBooleanFlag("onlineDrift");
  var debug = getBuildBooleanFlag("debug");
  if (typeof quiet === "boolean" && typeof window.__VEJICE_QUIET_LOGS__ !== "boolean") {
    window.__VEJICE_QUIET_LOGS__ = quiet;
  }
  if (typeof onlineVerbose === "boolean" && typeof window.__VEJICE_ONLINE_VERBOSE_LOGS__ !== "boolean") {
    window.__VEJICE_ONLINE_VERBOSE_LOGS__ = onlineVerbose;
  }
  if (typeof onlineDrift === "boolean" && typeof window.__VEJICE_ONLINE_DRIFT_LOGS__ !== "boolean") {
    window.__VEJICE_ONLINE_DRIFT_LOGS__ = onlineDrift;
  }
  if (typeof debug === "boolean" && typeof window.__VEJICE_DEBUG__ !== "boolean") {
    window.__VEJICE_DEBUG__ = debug;
  }
};
applyBuildDebugFlagsToWindow();
var isTaskpaneDebugEnabled = function isTaskpaneDebugEnabled() {
  if (typeof window !== "undefined") {
    var onlineVerboseOverride = parseBooleanFlag(window.__VEJICE_ONLINE_VERBOSE_LOGS__);
    if (typeof onlineVerboseOverride === "boolean") return onlineVerboseOverride;
    var debugOverride = parseBooleanFlag(window.__VEJICE_DEBUG__);
    if (typeof debugOverride === "boolean") return debugOverride;
  }
  var buildOnlineVerbose = getBuildBooleanFlag("onlineVerbose");
  if (typeof buildOnlineVerbose === "boolean") return buildOnlineVerbose;
  var buildDebug = getBuildBooleanFlag("debug");
  if (typeof buildDebug === "boolean") return buildDebug;
  if (typeof process !== "undefined") {
    var _process$env, _process$env2;
    var envOnlineVerbose = parseBooleanFlag((_process$env = process.env) === null || _process$env === void 0 ? void 0 : "true");
    if (typeof envOnlineVerbose === "boolean") return envOnlineVerbose;
    var envDebug = parseBooleanFlag((_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : "true");
    if (typeof envDebug === "boolean") return envDebug;
  }
  return false;
};
var log = function log() {
  var _console;
  if (!isTaskpaneDebugEnabled()) return;
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  (_console = console).log.apply(_console, ["[Vejice Taskpane]"].concat(args));
};
var errL = function errL() {
  var _console2;
  if (!isTaskpaneDebugEnabled()) return;
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  (_console2 = console).error.apply(_console2, ["[Vejice Taskpane]"].concat(args));
};
var ENABLE_ONLINE_REVIEW_ACTIONS =  true ? false : 0;
var isLikelyAddinRuntimeError = function isLikelyAddinRuntimeError(eventOrReason) {
  try {
    var _eventOrReason$reason;
    var filename = String((eventOrReason === null || eventOrReason === void 0 ? void 0 : eventOrReason.filename) || "").toLowerCase();
    var stack = String((eventOrReason === null || eventOrReason === void 0 ? void 0 : eventOrReason.stack) || (eventOrReason === null || eventOrReason === void 0 || (_eventOrReason$reason = eventOrReason.reason) === null || _eventOrReason$reason === void 0 ? void 0 : _eventOrReason$reason.stack) || "").toLowerCase();
    if (filename.includes("localhost:4001")) return true;
    if (stack.includes("localhost:4001")) return true;
    if (stack.includes("taskpane.js") || stack.includes("preverivejice.js")) return true;
  } catch (_err) {
    // ignore inspection failures
  }
  return false;
};
var reportStartupError = function reportStartupError(label, payload) {
  errL(label, payload);
  try {
    var _payload$reason, _payload$error;
    var rawMessage = (payload === null || payload === void 0 ? void 0 : payload.message) || (payload === null || payload === void 0 || (_payload$reason = payload.reason) === null || _payload$reason === void 0 ? void 0 : _payload$reason.message) || (payload === null || payload === void 0 ? void 0 : payload.reason) || (payload === null || payload === void 0 || (_payload$error = payload.error) === null || _payload$error === void 0 ? void 0 : _payload$error.message) || (payload === null || payload === void 0 ? void 0 : payload.error) || payload;
    var message = String(rawMessage || "Neznana napaka");
    var statusLine = document.getElementById("status-line");
    if (statusLine) {
      statusLine.textContent = "Napaka ob zagonu: ".concat(message);
    }
  } catch (_err) {
    // ignore UI reporting failures
  }
};
if (typeof window !== "undefined") {
  window.addEventListener("error", function (event) {
    if (!isLikelyAddinRuntimeError(event)) return;
    reportStartupError("window.error", (event === null || event === void 0 ? void 0 : event.error) || (event === null || event === void 0 ? void 0 : event.message) || event);
  });
  window.addEventListener("unhandledrejection", function (event) {
    var _event$reason;
    var reason = (_event$reason = event === null || event === void 0 ? void 0 : event.reason) !== null && _event$reason !== void 0 ? _event$reason : event;
    if (!isLikelyAddinRuntimeError(reason)) return;
    reportStartupError("window.unhandledrejection", reason);
  });
}
var busy = false;
var online = false;
var checkRunInFlight = false;
var currentSuggestionIndex = 0;
var lastCheckClickAt = 0;
var CHECK_CLICK_DEBOUNCE_MS = 800;
var MAX_VISIBLE_NOTIFICATIONS = 30;
var lastNotificationSignature = "";
var CHECK_RUN_WATCHDOG_MS = 120000;
var CHECK_GENERIC_ERROR_MESSAGE = "Napaka. Poskusite \u0161e enkrat.";
var CHECK_OFFLINE_HINT_MESSAGE = "Preverite internetno povezavo.";
var UI_REFRESH_DEBOUNCE_MS = 120;
var uiRefreshTimerId = null;
var pendingUiRefresh = {
  forceNotifications: false,
  includePendingStatus: false
};
var isOffline = function isOffline() {
  try {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  } catch (_err) {
    return false;
  }
};
var withCheckWatchdog = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(promiseFactory) {
    var timeoutMs,
      timeoutId,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          timeoutMs = _args.length > 1 && _args[1] !== undefined ? _args[1] : CHECK_RUN_WATCHDOG_MS;
          timeoutId = null;
          _context.p = 1;
          _context.n = 2;
          return Promise.race([Promise.resolve().then(function () {
            return promiseFactory();
          }), new Promise(function (_, reject) {
            timeoutId = setTimeout(function () {
              var watchdogError = new Error("check-watchdog-timeout");
              watchdogError.code = "CHECK_WATCHDOG_TIMEOUT";
              reject(watchdogError);
            }, timeoutMs);
          })]);
        case 2:
          return _context.a(2, _context.v);
        case 3:
          _context.p = 3;
          if (timeoutId) clearTimeout(timeoutId);
          return _context.f(3);
        case 4:
          return _context.a(2);
      }
    }, _callee, null, [[1,, 3, 4]]);
  }));
  return function withCheckWatchdog(_x) {
    return _ref.apply(this, arguments);
  };
}();
var canUseOnlineReviewActions = function canUseOnlineReviewActions() {
  return online && ENABLE_ONLINE_REVIEW_ACTIONS;
};
var resolveManifestMode = function resolveManifestMode() {
  if (typeof window === "undefined" || typeof URLSearchParams === "undefined") return null;
  try {
    var params = new URLSearchParams(window.location.search || "");
    var mode = (params.get("mode") || "").trim().toLowerCase();
    if (mode === "web") return "web";
    if (mode === "desktop") return "desktop";
  } catch (err) {
    errL("Failed to resolve taskpane mode from query", err);
  }
  return null;
};
var setStatus = function setStatus(message) {
  var statusLine = document.getElementById("status-line");
  if (statusLine) statusLine.textContent = message;
};
var syncStatusLoadingIndicator = function syncStatusLoadingIndicator() {
  var statusRoot = document.querySelector(".taskpane-status");
  if (!statusRoot) return;
  var loading = busy || checkRunInFlight || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)();
  statusRoot.classList.toggle("taskpane-status-loading", loading);
};
var buildNotificationSignature = function buildNotificationSignature(items) {
  if (!Array.isArray(items) || !items.length) return "empty";
  return items.map(function (item) {
    return "".concat(item.id, ":").concat(item.timestamp);
  }).join("|");
};
var renderNotifications = function renderNotifications() {
  var _ref3, _document$documentEle, _document$documentEle2, _document$body;
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref2$force = _ref2.force,
    force = _ref2$force === void 0 ? false : _ref2$force;
  var listEl = document.getElementById("notification-list");
  var emptyEl = document.getElementById("notification-empty");
  var clearBtn = document.getElementById("btn-clear-notifications");
  if (!listEl || !emptyEl) return;
  var previousListScrollTop = listEl.scrollTop;
  var previousDocScrollTop = (_ref3 = (_document$documentEle = (_document$documentEle2 = document.documentElement) === null || _document$documentEle2 === void 0 ? void 0 : _document$documentEle2.scrollTop) !== null && _document$documentEle !== void 0 ? _document$documentEle : (_document$body = document.body) === null || _document$body === void 0 ? void 0 : _document$body.scrollTop) !== null && _ref3 !== void 0 ? _ref3 : 0;
  var allItems = (0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.readTaskpaneNotifications)();
  var visibleItems = allItems.slice(-MAX_VISIBLE_NOTIFICATIONS).reverse();
  var signature = buildNotificationSignature(visibleItems);
  if (!force && signature === lastNotificationSignature) return;
  lastNotificationSignature = signature;
  listEl.innerHTML = "";
  if (!visibleItems.length) {
    emptyEl.hidden = false;
    if (clearBtn) clearBtn.disabled = true;
    return;
  }
  emptyEl.hidden = true;
  if (clearBtn) clearBtn.disabled = false;
  var _iterator = _createForOfIteratorHelper(visibleItems),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      var li = document.createElement("li");
      var level = typeof (item === null || item === void 0 ? void 0 : item.level) === "string" ? item.level.toLowerCase() : "info";
      var normalizedLevel = level === "error" || level === "warn" ? level : "info";
      li.className = "notification-item notification-item-".concat(normalizedLevel);
      var when = Number.isFinite(item === null || item === void 0 ? void 0 : item.timestamp) ? new Date(item.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }) : "";
      var source = typeof (item === null || item === void 0 ? void 0 : item.source) === "string" ? item.source : "system";
      li.textContent = "".concat((item === null || item === void 0 ? void 0 : item.message) || "");
      li.title = [when, source].filter(Boolean).join(" | ");
      listEl.appendChild(li);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  listEl.scrollTop = previousListScrollTop;
  if (document.documentElement) {
    document.documentElement.scrollTop = previousDocScrollTop;
  }
  if (document.body) {
    document.body.scrollTop = previousDocScrollTop;
  }
};
var syncActionButtons = function syncActionButtons() {
  var checkBtn = document.getElementById("btn-check");
  var clearHighlightsBtn = document.getElementById("btn-clear-highlights");
  var acceptOneBtn = document.getElementById("btn-accept-one");
  var rejectOneBtn = document.getElementById("btn-reject-one");
  var acceptBtn = document.getElementById("btn-accept");
  var rejectBtn = document.getElementById("btn-reject");
  var checkInProgress = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)();
  var reviewActionsEnabled = canUseOnlineReviewActions();
  var pendingCount = online ? (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)().length : 0;
  var hasPending = pendingCount > 0;
  syncStatusLoadingIndicator();
  if (checkBtn) checkBtn.disabled = busy || checkInProgress;
  if (clearHighlightsBtn) clearHighlightsBtn.disabled = busy || !online || checkInProgress || !hasPending;
  if (acceptOneBtn) acceptOneBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (rejectOneBtn) rejectOneBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (acceptBtn) acceptBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (rejectBtn) rejectBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
};
var setBusy = function setBusy(nextBusy) {
  busy = Boolean(nextBusy);
  scheduleUiRefresh({
    immediate: true
  });
};
var clampCurrentSuggestionIndex = function clampCurrentSuggestionIndex(total) {
  if (!Number.isFinite(total) || total <= 0) {
    currentSuggestionIndex = 0;
    return;
  }
  if (currentSuggestionIndex < 0) {
    currentSuggestionIndex = 0;
    return;
  }
  if (currentSuggestionIndex >= total) {
    currentSuggestionIndex = total - 1;
  }
};
var refreshPendingStatus = function refreshPendingStatus() {
  if (!online) return;
  var pending = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)();
  clampCurrentSuggestionIndex(pending.length);
  if (!pending.length) {
    setStatus("Končano. Predlogi: 0.");
    return;
  }
  setStatus("Kon\u010Dano. Predlogi: ".concat(pending.length, "."));
};
var flushUiRefresh = function flushUiRefresh() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref4$forceNotificati = _ref4.forceNotifications,
    forceNotifications = _ref4$forceNotificati === void 0 ? false : _ref4$forceNotificati,
    _ref4$includePendingS = _ref4.includePendingStatus,
    includePendingStatus = _ref4$includePendingS === void 0 ? false : _ref4$includePendingS;
  syncActionButtons();
  renderNotifications({
    force: forceNotifications
  });
  if (includePendingStatus && !busy && !checkRunInFlight && !(0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()) {
    refreshPendingStatus();
  }
};
var scheduleUiRefresh = function scheduleUiRefresh() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref5$forceNotificati = _ref5.forceNotifications,
    forceNotifications = _ref5$forceNotificati === void 0 ? false : _ref5$forceNotificati,
    _ref5$includePendingS = _ref5.includePendingStatus,
    includePendingStatus = _ref5$includePendingS === void 0 ? false : _ref5$includePendingS,
    _ref5$immediate = _ref5.immediate,
    immediate = _ref5$immediate === void 0 ? false : _ref5$immediate;
  if (immediate) {
    if (uiRefreshTimerId) {
      clearTimeout(uiRefreshTimerId);
      uiRefreshTimerId = null;
    }
    pendingUiRefresh = {
      forceNotifications: false,
      includePendingStatus: false
    };
    flushUiRefresh({
      forceNotifications: forceNotifications,
      includePendingStatus: includePendingStatus
    });
    return;
  }
  pendingUiRefresh.forceNotifications = pendingUiRefresh.forceNotifications || forceNotifications;
  pendingUiRefresh.includePendingStatus = pendingUiRefresh.includePendingStatus || includePendingStatus;
  if (uiRefreshTimerId) return;
  uiRefreshTimerId = setTimeout(function () {
    var refreshPayload = pendingUiRefresh;
    pendingUiRefresh = {
      forceNotifications: false,
      includePendingStatus: false
    };
    uiRefreshTimerId = null;
    flushUiRefresh(refreshPayload);
  }, UI_REFRESH_DEBOUNCE_MS);
};
var runCheck = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var now, summary, _summary$inserted, _summary$deleted, _summary$detected, _summary$apiErrors, _summary$nonCommaSkip, inserted, deleted, detected, apiErrors, nonCommaSkips, totalFixed, timedOut, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          now = Date.now();
          if (!(now - lastCheckClickAt < CHECK_CLICK_DEBOUNCE_MS)) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2);
        case 1:
          if (!(checkRunInFlight || busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context2.n = 2;
            break;
          }
          setStatus("Preverjanje \u017Ee poteka.");
          return _context2.a(2);
        case 2:
          lastCheckClickAt = now;
          checkRunInFlight = true;
          setBusy(true);
          (0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.clearTaskpaneNotifications)();
          scheduleUiRefresh({
            forceNotifications: true,
            immediate: true
          });
          if (!isOffline()) {
            _context2.n = 3;
            break;
          }
          setStatus("".concat(CHECK_GENERIC_ERROR_MESSAGE, " ").concat(CHECK_OFFLINE_HINT_MESSAGE));
          checkRunInFlight = false;
          setBusy(false);
          return _context2.a(2);
        case 3:
          setStatus("Preverjam dokument ...");
          log("runCheck:start", {
            online: online,
            busy: busy,
            checkRunInFlight: checkRunInFlight,
            checkInProgress: (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()
          });
          _context2.p = 4;
          _context2.n = 5;
          return withCheckWatchdog(function () {
            return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.checkDocumentText)();
          });
        case 5:
          summary = _context2.v;
          log("runCheck:summary", summary);
          if ((summary === null || summary === void 0 ? void 0 : summary.status) === "deferred") {
            setStatus("Po\u010Dakajte, da se trenutno opravilo zaklju\u010Di.");
          } else if (online) {
            refreshPendingStatus();
          } else if ((summary === null || summary === void 0 ? void 0 : summary.status) === "blocked") {
            setStatus("Preverjanje ustavljeno. Poglejte obvestila.");
          } else if ((summary === null || summary === void 0 ? void 0 : summary.status) === "error") {
            setStatus("Napaka pri preverjanju.");
          } else {
            inserted = Number((_summary$inserted = summary === null || summary === void 0 ? void 0 : summary.inserted) !== null && _summary$inserted !== void 0 ? _summary$inserted : 0);
            deleted = Number((_summary$deleted = summary === null || summary === void 0 ? void 0 : summary.deleted) !== null && _summary$deleted !== void 0 ? _summary$deleted : 0);
            detected = Number((_summary$detected = summary === null || summary === void 0 ? void 0 : summary.detected) !== null && _summary$detected !== void 0 ? _summary$detected : 0);
            apiErrors = Number((_summary$apiErrors = summary === null || summary === void 0 ? void 0 : summary.apiErrors) !== null && _summary$apiErrors !== void 0 ? _summary$apiErrors : 0);
            nonCommaSkips = Number((_summary$nonCommaSkip = summary === null || summary === void 0 ? void 0 : summary.nonCommaSkips) !== null && _summary$nonCommaSkip !== void 0 ? _summary$nonCommaSkip : 0);
            totalFixed = inserted + deleted;
            if (totalFixed === 0 && detected === 0 && apiErrors === 0 && nonCommaSkips === 0) {
              setStatus("Kon\u010Dano. Ni bilo najdenih manjkajo\u010Dih ali napa\u010Dnih vejic.");
            } else if (totalFixed > 0) {
              setStatus("Kon\u010Dano. Popravki: ".concat(totalFixed, " (dodane: ").concat(inserted, ", odstranjene: ").concat(deleted, ")."));
            } else {
              setStatus("Kon\u010Dano.");
            }
          }
          _context2.n = 7;
          break;
        case 6:
          _context2.p = 6;
          _t = _context2.v;
          errL("check failed", _t);
          timedOut = String((_t === null || _t === void 0 ? void 0 : _t.code) || (_t === null || _t === void 0 ? void 0 : _t.message) || "").includes("CHECK_WATCHDOG_TIMEOUT");
          if (timedOut) {
            try {
              (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.cancelDocumentCheck)("ui-watchdog-timeout");
            } catch (_cancelErr) {
              // ignore cancellation failures
            }
            try {
              (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.forceResetDocumentCheckState)("ui-watchdog-timeout");
            } catch (_resetErr) {
              // ignore forced reset failures
            }
          }
          if (isOffline()) {
            setStatus("".concat(CHECK_GENERIC_ERROR_MESSAGE, " ").concat(CHECK_OFFLINE_HINT_MESSAGE));
          } else {
            setStatus(CHECK_GENERIC_ERROR_MESSAGE);
          }
        case 7:
          _context2.p = 7;
          log("runCheck:finally", {
            online: online,
            busy: busy,
            checkRunInFlight: checkRunInFlight,
            checkInProgress: (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)()
          });
          checkRunInFlight = false;
          setBusy(false);
          return _context2.f(7);
        case 8:
          return _context2.a(2);
      }
    }, _callee2, null, [[4, 6, 7, 8]]);
  }));
  return function runCheck() {
    return _ref6.apply(this, arguments);
  };
}();
var runClearHighlights = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var _summary$clearedMarke, _summary$pendingAfter, summary, cleared, pending, _t2;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          if (online) {
            _context3.n = 1;
            break;
          }
          return _context3.a(2);
        case 1:
          if (!(busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context3.n = 2;
            break;
          }
          setStatus("Po\u010Dakajte, da se preverjanje kon\u010Da.");
          return _context3.a(2);
        case 2:
          setBusy(true);
          setStatus("Bri\u0161em ozna\u010Dbe ...");
          _context3.p = 3;
          _context3.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.clearPendingSuggestionHighlightsOnline)();
        case 4:
          summary = _context3.v;
          cleared = Number((_summary$clearedMarke = summary === null || summary === void 0 ? void 0 : summary.clearedMarkers) !== null && _summary$clearedMarke !== void 0 ? _summary$clearedMarke : 0);
          pending = Number((_summary$pendingAfter = summary === null || summary === void 0 ? void 0 : summary.pendingAfter) !== null && _summary$pendingAfter !== void 0 ? _summary$pendingAfter : 0);
          if ((summary === null || summary === void 0 ? void 0 : summary.status) === "deferred") {
            setStatus("Po\u010Dakajte, da se trenutno opravilo zaklju\u010Di.");
          } else if (cleared > 0) {
            setStatus("Ozna\u010Dbe pobrisane: ".concat(cleared, ". Predlogi: ").concat(pending, "."));
          } else {
            setStatus("Ni ozna\u010Db za pobrisati.");
          }
          log("clear highlights summary", summary);
          _context3.n = 6;
          break;
        case 5:
          _context3.p = 5;
          _t2 = _context3.v;
          errL("clear highlights failed", _t2);
          setStatus("Napaka pri brisanju ozna\u010Db.");
        case 6:
          _context3.p = 6;
          setBusy(false);
          return _context3.f(6);
        case 7:
          return _context3.a(2);
      }
    }, _callee3, null, [[3, 5, 6, 7]]);
  }));
  return function runClearHighlights() {
    return _ref7.apply(this, arguments);
  };
}();
var runAccept = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var _summary$appliedSugge, _summary$pendingAfter2, summary, applied, pending, _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          if (canUseOnlineReviewActions()) {
            _context4.n = 1;
            break;
          }
          return _context4.a(2);
        case 1:
          if (!(busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context4.n = 2;
            break;
          }
          setStatus("Po\u010Dakajte, da se preverjanje kon\u010Da.");
          return _context4.a(2);
        case 2:
          setBusy(true);
          setStatus("Sprejemam vse predloge ...");
          _context4.p = 3;
          _context4.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.applyAllSuggestionsOnline)();
        case 4:
          summary = _context4.v;
          applied = Number((_summary$appliedSugge = summary === null || summary === void 0 ? void 0 : summary.appliedSuggestions) !== null && _summary$appliedSugge !== void 0 ? _summary$appliedSugge : 0);
          pending = Number((_summary$pendingAfter2 = summary === null || summary === void 0 ? void 0 : summary.pendingAfter) !== null && _summary$pendingAfter2 !== void 0 ? _summary$pendingAfter2 : 0);
          setStatus("Sprejeto: ".concat(applied, ". Preostalo: ").concat(pending, "."));
          log("accept summary", summary);
          _context4.n = 6;
          break;
        case 5:
          _context4.p = 5;
          _t3 = _context4.v;
          errL("accept failed", _t3);
          setStatus("Napaka pri sprejemanju.");
        case 6:
          _context4.p = 6;
          setBusy(false);
          return _context4.f(6);
        case 7:
          return _context4.a(2);
      }
    }, _callee4, null, [[3, 5, 6, 7]]);
  }));
  return function runAccept() {
    return _ref8.apply(this, arguments);
  };
}();
var runReject = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var _summary$clearedMarke2, _summary$revertedAppl, _summary$pendingAfter3, summary, rejected, reverted, pending, _t4;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          if (canUseOnlineReviewActions()) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2);
        case 1:
          if (!(busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context5.n = 2;
            break;
          }
          setStatus("Po\u010Dakajte, da se preverjanje kon\u010Da.");
          return _context5.a(2);
        case 2:
          setBusy(true);
          setStatus("Zavra\u010Dam vse predloge ...");
          _context5.p = 3;
          _context5.n = 4;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.rejectAllSuggestionsOnline)();
        case 4:
          summary = _context5.v;
          rejected = Number((_summary$clearedMarke2 = summary === null || summary === void 0 ? void 0 : summary.clearedMarkers) !== null && _summary$clearedMarke2 !== void 0 ? _summary$clearedMarke2 : 0);
          reverted = Number((_summary$revertedAppl = summary === null || summary === void 0 ? void 0 : summary.revertedAppliedSuggestions) !== null && _summary$revertedAppl !== void 0 ? _summary$revertedAppl : 0);
          pending = Number((_summary$pendingAfter3 = summary === null || summary === void 0 ? void 0 : summary.pendingAfter) !== null && _summary$pendingAfter3 !== void 0 ? _summary$pendingAfter3 : 0);
          if (reverted > 0) {
            setStatus("Zavrnjeno: ".concat(rejected, ". Razveljavljeno: ").concat(reverted, ". Preostalo: ").concat(pending, "."));
          } else {
            setStatus("Zavrnjeno: ".concat(rejected, ". Preostalo: ").concat(pending, "."));
          }
          log("reject summary", summary);
          _context5.n = 6;
          break;
        case 5:
          _context5.p = 5;
          _t4 = _context5.v;
          errL("reject failed", _t4);
          setStatus("Napaka pri zavračanju.");
        case 6:
          _context5.p = 6;
          setBusy(false);
          return _context5.f(6);
        case 7:
          return _context5.a(2);
      }
    }, _callee5, null, [[3, 5, 6, 7]]);
  }));
  return function runReject() {
    return _ref9.apply(this, arguments);
  };
}();
var runAcceptOne = /*#__PURE__*/function () {
  var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var pendingList, current, _summary$pendingAfter4, _summary$appliedSugge2, summary, pendingAfter, accepted, _t5;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          if (canUseOnlineReviewActions()) {
            _context6.n = 1;
            break;
          }
          return _context6.a(2);
        case 1:
          if (!(busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context6.n = 2;
            break;
          }
          setStatus("Počakajte, da se preverjanje konča.");
          return _context6.a(2);
        case 2:
          pendingList = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)();
          if (pendingList.length) {
            _context6.n = 3;
            break;
          }
          setStatus("Ni predlogov za sprejem.");
          return _context6.a(2);
        case 3:
          clampCurrentSuggestionIndex(pendingList.length);
          current = pendingList[currentSuggestionIndex];
          if (current) {
            _context6.n = 4;
            break;
          }
          setStatus("Predlog ni več na voljo.");
          return _context6.a(2);
        case 4:
          setBusy(true);
          setStatus("Sprejemam trenutni predlog ...");
          _context6.p = 5;
          _context6.n = 6;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.applySuggestionOnlineById)(current.id);
        case 6:
          summary = _context6.v;
          pendingAfter = Number((_summary$pendingAfter4 = summary === null || summary === void 0 ? void 0 : summary.pendingAfter) !== null && _summary$pendingAfter4 !== void 0 ? _summary$pendingAfter4 : 0);
          accepted = Number((_summary$appliedSugge2 = summary === null || summary === void 0 ? void 0 : summary.appliedSuggestions) !== null && _summary$appliedSugge2 !== void 0 ? _summary$appliedSugge2 : 0);
          clampCurrentSuggestionIndex(pendingAfter);
          if ((summary === null || summary === void 0 ? void 0 : summary.status) === "applied" || (summary === null || summary === void 0 ? void 0 : summary.status) === "partial") {
            if ((summary === null || summary === void 0 ? void 0 : summary.reason) === "suggestion-skipped-unresolvable") {
              setStatus("Predloga ni bilo mogo\u010De sprejeti, zato je bil presko\u010Den. Preostalo: ".concat(pendingAfter, "."));
            } else {
              setStatus("Sprejeto: ".concat(accepted > 0 ? accepted : 1, ". Preostalo: ").concat(pendingAfter, "."));
            }
          } else if ((summary === null || summary === void 0 ? void 0 : summary.reason) === "already-applied") {
            setStatus("Predlog je bil \u017Ee upo\u0161tevan. Preostalo: ".concat(pendingAfter, "."));
          } else if ((summary === null || summary === void 0 ? void 0 : summary.reason) === "suggestion-skipped-unresolvable") {
            setStatus("Predloga ni bilo mogo\u010De sprejeti, zato je bil presko\u010Den. Preostalo: ".concat(pendingAfter, "."));
          } else {
            setStatus("Predloga ni bilo mogoče sprejeti.");
          }
          log("accept one summary", summary);
          _context6.n = 8;
          break;
        case 7:
          _context6.p = 7;
          _t5 = _context6.v;
          errL("accept one failed", _t5);
          setStatus("Napaka pri sprejemanju predloga.");
        case 8:
          _context6.p = 8;
          setBusy(false);
          return _context6.f(8);
        case 9:
          return _context6.a(2);
      }
    }, _callee6, null, [[5, 7, 8, 9]]);
  }));
  return function runAcceptOne() {
    return _ref0.apply(this, arguments);
  };
}();
var runRejectOne = /*#__PURE__*/function () {
  var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var pendingList, current, _summary$pendingAfter5, _summary$rejectedSugg, _summary$revertedAppl2, summary, pendingAfter, rejected, reverted, _t6;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          if (canUseOnlineReviewActions()) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2);
        case 1:
          if (!(busy || (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.isDocumentCheckInProgress)())) {
            _context7.n = 2;
            break;
          }
          setStatus("Počakajte, da se preverjanje konča.");
          return _context7.a(2);
        case 2:
          pendingList = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.getPendingSuggestionsOnline)();
          if (pendingList.length) {
            _context7.n = 3;
            break;
          }
          setStatus("Ni predlogov za zavrnitev.");
          return _context7.a(2);
        case 3:
          clampCurrentSuggestionIndex(pendingList.length);
          current = pendingList[currentSuggestionIndex];
          if (current) {
            _context7.n = 4;
            break;
          }
          setStatus("Predlog ni več na voljo.");
          return _context7.a(2);
        case 4:
          setBusy(true);
          setStatus("Zavračam trenutni predlog ...");
          _context7.p = 5;
          _context7.n = 6;
          return (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.rejectSuggestionOnlineById)(current.id);
        case 6:
          summary = _context7.v;
          pendingAfter = Number((_summary$pendingAfter5 = summary === null || summary === void 0 ? void 0 : summary.pendingAfter) !== null && _summary$pendingAfter5 !== void 0 ? _summary$pendingAfter5 : 0);
          rejected = Number((_summary$rejectedSugg = summary === null || summary === void 0 ? void 0 : summary.rejectedSuggestions) !== null && _summary$rejectedSugg !== void 0 ? _summary$rejectedSugg : 0);
          reverted = Number((_summary$revertedAppl2 = summary === null || summary === void 0 ? void 0 : summary.revertedAppliedSuggestions) !== null && _summary$revertedAppl2 !== void 0 ? _summary$revertedAppl2 : 0);
          clampCurrentSuggestionIndex(pendingAfter);
          if ((summary === null || summary === void 0 ? void 0 : summary.status) === "rejected" || (summary === null || summary === void 0 ? void 0 : summary.status) === "partial") {
            if (reverted > 0) {
              setStatus("Zavrnjeno: ".concat(rejected > 0 ? rejected : 1, ". Razveljavljeno: ").concat(reverted, ". Preostalo: ").concat(pendingAfter, "."));
            } else {
              setStatus("Zavrnjeno: ".concat(rejected > 0 ? rejected : 1, ". Preostalo: ").concat(pendingAfter, "."));
            }
          } else {
            setStatus("Predloga ni bilo mogoče zavrniti.");
          }
          log("reject one summary", summary);
          _context7.n = 8;
          break;
        case 7:
          _context7.p = 7;
          _t6 = _context7.v;
          errL("reject one failed", _t6);
          setStatus("Napaka pri zavračanju predloga.");
        case 8:
          _context7.p = 8;
          setBusy(false);
          return _context7.f(8);
        case 9:
          return _context7.a(2);
      }
    }, _callee7, null, [[5, 7, 8, 9]]);
  }));
  return function runRejectOne() {
    return _ref1.apply(this, arguments);
  };
}();
Office.onReady(function (info) {
  var _Office;
  if (info.host !== Office.HostType.Word) return;
  var sideload = document.getElementById("sideload-msg");
  var appBody = document.getElementById("app-body");
  if (sideload) sideload.style.display = "none";
  if (appBody) appBody.style.display = "flex";
  var mode = resolveManifestMode();
  online = mode ? mode === "web" : (0,_utils_host_js__WEBPACK_IMPORTED_MODULE_1__.isWordOnline)();
  log("taskpane:ready", {
    host: info.host,
    platform: (_Office = Office) === null || _Office === void 0 || (_Office = _Office.context) === null || _Office === void 0 ? void 0 : _Office.platform,
    mode: mode,
    online: online,
    href: typeof window !== "undefined" ? window.location.href : ""
  });
  // Notifications are persisted in localStorage and can leak across documents.
  // Start each taskpane session clean to avoid showing stale messages in new docs.
  (0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.clearTaskpaneNotifications)();
  lastNotificationSignature = "";
  if (online) {
    var restored = (0,_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.restorePendingSuggestionsOnlineIfNeeded)();
    if (restored > 0) {
      log("Restored pending suggestions after taskpane load:", restored);
    }
  }
  var acceptBtn = document.getElementById("btn-accept");
  var rejectBtn = document.getElementById("btn-reject");
  var clearHighlightsBtn = document.getElementById("btn-clear-highlights");
  var acceptOneBtn = document.getElementById("btn-accept-one");
  var rejectOneBtn = document.getElementById("btn-reject-one");
  var secondaryActions = document.getElementById("secondary-actions");
  var desktopNote = document.getElementById("desktop-note");
  var showOnlineReviewActions = canUseOnlineReviewActions();
  if (!showOnlineReviewActions) {
    if (secondaryActions) secondaryActions.hidden = true;
    if (acceptOneBtn) acceptOneBtn.hidden = true;
    if (rejectOneBtn) rejectOneBtn.hidden = true;
    if (acceptBtn) acceptBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
  }
  if (!online) {
    if (clearHighlightsBtn) clearHighlightsBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }
  var checkBtn = document.getElementById("btn-check");
  var clearHighlightsActionBtn = document.getElementById("btn-clear-highlights");
  var clearNotificationsBtn = document.getElementById("btn-clear-notifications");
  if (checkBtn) checkBtn.addEventListener("click", function () {
    return void runCheck();
  });
  if (clearHighlightsActionBtn) clearHighlightsActionBtn.addEventListener("click", function () {
    return void runClearHighlights();
  });
  if (showOnlineReviewActions && acceptOneBtn) acceptOneBtn.addEventListener("click", function () {
    return void runAcceptOne();
  });
  if (showOnlineReviewActions && rejectOneBtn) rejectOneBtn.addEventListener("click", function () {
    return void runRejectOne();
  });
  if (showOnlineReviewActions && acceptBtn) acceptBtn.addEventListener("click", function () {
    return void runAccept();
  });
  if (showOnlineReviewActions && rejectBtn) rejectBtn.addEventListener("click", function () {
    return void runReject();
  });
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener("click", function () {
      (0,_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.clearTaskpaneNotifications)();
      scheduleUiRefresh({
        forceNotifications: true,
        immediate: true
      });
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("storage", function (evt) {
      if (!evt) return;
      if (evt.key === _utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.TASKPANE_NOTIFICATION_STORAGE_KEY) {
        scheduleUiRefresh({
          forceNotifications: true
        });
        return;
      }
      if (evt.key === _logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.RUNTIME_STATE_STORAGE_KEY) {
        scheduleUiRefresh({
          includePendingStatus: true
        });
      }
    });
    window.addEventListener(_utils_notifications_js__WEBPACK_IMPORTED_MODULE_2__.TASKPANE_NOTIFICATION_EVENT_NAME, function () {
      scheduleUiRefresh({
        forceNotifications: true
      });
    });
    window.addEventListener(_logic_preveriVejice_js__WEBPACK_IMPORTED_MODULE_0__.RUNTIME_STATE_EVENT_NAME, function () {
      scheduleUiRefresh();
    });
    window.addEventListener("focus", function () {
      scheduleUiRefresh({
        includePendingStatus: true
      });
    });
    window.addEventListener("online", function () {
      scheduleUiRefresh({
        includePendingStatus: true
      });
    });
    window.addEventListener("offline", function () {
      scheduleUiRefresh();
    });
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") return;
      scheduleUiRefresh({
        includePendingStatus: true
      });
    });
  }
  busy = false;
  scheduleUiRefresh({
    forceNotifications: true,
    includePendingStatus: true,
    immediate: true
  });
});

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["common"], function() { return __webpack_exec__("./node_modules/webpack-dev-server/client/index.js?protocol=wss%3A&hostname=localhost&port=4001&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=true&live-reload=true"), __webpack_exec__("./node_modules/webpack/hot/dev-server.js"), __webpack_exec__("./src/taskpane/taskpane.js"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=taskpane.js.map