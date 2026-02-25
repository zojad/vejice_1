"use strict";
self["webpackHotUpdateoffice_addin_taskpane_js"]("commands",{

/***/ "./src/logic/engine/CommaSuggestionEngine.js":
/*!***************************************************!*\
  !*** ./src/logic/engine/CommaSuggestionEngine.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CommaSuggestionEngine: function() { return /* binding */ CommaSuggestionEngine; }
/* harmony export */ });
/* harmony import */ var _Suggestion_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Suggestion.js */ "./src/logic/engine/Suggestion.js");
/* harmony import */ var _textUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./textUtils.js */ "./src/logic/engine/textUtils.js");
/* harmony import */ var _anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../anchoring/SyntheticAnchorProvider.js */ "./src/logic/anchoring/SyntheticAnchorProvider.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



var MAX_PARAGRAPH_CHARS = 3000;
var PARAGRAPH_FIRST_MAX_CHARS = 1200;
var MIN_CHUNK_MERGE_CHARS = 20;
var LEMMA_CHUNK_TARGET_CHARS = 650;
var LEMMA_CHUNK_SOFT_MAX_CHARS = 900;
var LEMMA_CHUNK_MAX_UNITS = 3;
var LEMMA_SPLIT_WINDOW_CHARS = 180;
var LEMMA_MIN_SEGMENT_CHARS = 120;
var LEMMA_SPLIT_CONFIDENCE_THRESHOLD = 0.9;
var LEMMA_HEURISTIC_MIN_LEN = 700;
var API_RECHUNK_MAX_DEPTH = 2;
var API_RECHUNK_MIN_CHARS = 260;
var SALVAGE_RECHUNK_MIN_DIFF_OPS = 12;
var API_FAILURE_COOLDOWN_MS = 90000;
var TRAILING_COMMA_REGEX = /[,\s]+$/;
var LOG_PREFIX = "[Vejice DEBUG DUMP]";
var DEBUG_DUMP_STORAGE_KEY = "vejice:debug:dumps";
var DEBUG_DUMP_LAST_STORAGE_KEY = "vejice:debug:lastDump";
function isAbortLikeError(err, signal) {
  if (signal !== null && signal !== void 0 && signal.aborted) return true;
  var code = typeof (err === null || err === void 0 ? void 0 : err.code) === "string" ? err.code.toUpperCase() : "";
  var name = typeof (err === null || err === void 0 ? void 0 : err.name) === "string" ? err.name : "";
  return code === "ERR_CANCELED" || name === "AbortError" || name === "CanceledError";
}
function throwIfAborted(signal) {
  if (!(signal !== null && signal !== void 0 && signal.aborted)) return;
  var reason = signal.reason;
  if (reason instanceof Error) {
    throw reason;
  }
  throw new Error(typeof reason === "string" ? reason : "Request aborted");
}
if (typeof window !== "undefined") {
  if (!Array.isArray(window.__VEJICE_DEBUG_DUMPS__)) {
    window.__VEJICE_DEBUG_DUMPS__ = [];
  }
  if (!("__VEJICE_LAST_DEBUG_DUMP__" in window)) {
    window.__VEJICE_LAST_DEBUG_DUMP__ = null;
  }
  window.__VEJICE_DEBUG_DUMP_READY__ = true;
}
function isDeepDebugEnabled() {
  if (typeof window === "undefined") return false;
  var isTruthyFlag = function isTruthyFlag(value) {
    return value === true || value === 1 || value === "1" || value === "true";
  };
  if (isTruthyFlag(window.__VEJICE_DEBUG_DUMP__)) return true;
  if (isTruthyFlag(window.__VEJICE_DEBUG__)) return true;
  try {
    var storage = window.localStorage;
    if (storage) {
      var stored = storage.getItem("vejice:debug:dump");
      if (isTruthyFlag(stored)) return true;
    }
  } catch (_err) {
    // Ignore storage access failures.
  }
  return false;
}
function pushDeepDebugDump(payload) {
  if (!isDeepDebugEnabled() || typeof window === "undefined") return;
  var safePayload = _objectSpread({
    ts: Date.now()
  }, payload);
  window.__VEJICE_LAST_DEBUG_DUMP__ = safePayload;
  window.__VEJICE_DEBUG_DUMPS__ = window.__VEJICE_DEBUG_DUMPS__ || [];
  window.__VEJICE_DEBUG_DUMPS__.push(safePayload);
  if (window.__VEJICE_DEBUG_DUMPS__.length > 20) {
    window.__VEJICE_DEBUG_DUMPS__.shift();
  }
  try {
    console.log(LOG_PREFIX, safePayload);
  } catch (_err) {
    // Ignore logging failures in host environments that limit console payloads.
  }
  try {
    var storage = window.localStorage;
    if (!storage) return;
    storage.setItem(DEBUG_DUMP_LAST_STORAGE_KEY, JSON.stringify(safePayload));
    var existingRaw = storage.getItem(DEBUG_DUMP_STORAGE_KEY);
    var existing = existingRaw ? JSON.parse(existingRaw) : [];
    var list = Array.isArray(existing) ? existing : [];
    list.push(safePayload);
    while (list.length > 20) {
      list.shift();
    }
    storage.setItem(DEBUG_DUMP_STORAGE_KEY, JSON.stringify(list));
  } catch (_err2) {
    // Ignore storage failures in restricted runtimes.
  }
}
var CommaSuggestionEngine = /*#__PURE__*/function () {
  function CommaSuggestionEngine(_ref) {
    var anchorProvider = _ref.anchorProvider,
      apiClient = _ref.apiClient,
      _ref$notifiers = _ref.notifiers,
      notifiers = _ref$notifiers === void 0 ? {} : _ref$notifiers;
    _classCallCheck(this, CommaSuggestionEngine);
    this.anchorProvider = anchorProvider;
    this.apiClient = apiClient;
    this.lastDebugDump = null;
    this.debugDumps = [];
    this.apiChunkFailureCooldownUntil = new Map();
    this.notifiers = {
      onParagraphTooLong: notifiers.onParagraphTooLong || function () {},
      onSentenceTooLong: notifiers.onSentenceTooLong || function () {},
      onChunkApiFailure: notifiers.onChunkApiFailure || function () {},
      onChunkNonCommaChanges: notifiers.onChunkNonCommaChanges || function () {}
    };
  }
  return _createClass(CommaSuggestionEngine, [{
    key: "analyzeParagraph",
    value: function () {
      var _analyzeParagraph = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_ref2) {
        var _this = this;
        var paragraphIndex, originalText, normalizedOriginalText, paragraphDocOffset, _ref2$forceSentenceCh, forceSentenceChunks, _ref2$conservativeSen, conservativeSentenceFallback, _ref2$abortSignal, abortSignal, paragraphText, forceSentenceByLength, useSentenceChunks, debugEnabled, debugDump, chunks, normalizedSource, processedMeta, chunkDetails, apiErrors, nonCommaChunkSkips, nonCommaChunkSalvaged, makeSnippet, logSkippedChunk, _processChunk, _iterator3, _step3, chunk, hasDetailedChunk, canFallbackToSentences, _anchorsEntry, correctedParagraph, sourceTokens, targetTokens, anchorsEntry, suggestions, suggestionDedupKeys, debugOpFlow, _i, _chunkDetails, _entry$metaRef, _entry$metaRef$remapp, entry, detailRef, apiOpsPresent, ops, fallbackOps, correctionOps, correctionTracking, correctionsPresent, _entry$metaRef2, usingFallbackOnly, allOps, opFlow, _iterator4, _step4, _entry$metaRef3, op, offset, baseOp, adjustedOp, suggestion, dedupKey, _t4, _t5, _t6, _t7;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              paragraphIndex = _ref2.paragraphIndex, originalText = _ref2.originalText, normalizedOriginalText = _ref2.normalizedOriginalText, paragraphDocOffset = _ref2.paragraphDocOffset, _ref2$forceSentenceCh = _ref2.forceSentenceChunks, forceSentenceChunks = _ref2$forceSentenceCh === void 0 ? false : _ref2$forceSentenceCh, _ref2$conservativeSen = _ref2.conservativeSentenceFallback, conservativeSentenceFallback = _ref2$conservativeSen === void 0 ? false : _ref2$conservativeSen, _ref2$abortSignal = _ref2.abortSignal, abortSignal = _ref2$abortSignal === void 0 ? null : _ref2$abortSignal;
              throwIfAborted(abortSignal);
              paragraphText = typeof originalText === "string" ? originalText : "";
              pruneExpiredChunkFailureCooldowns(this.apiChunkFailureCooldownUntil);
              forceSentenceByLength = paragraphText.length > PARAGRAPH_FIRST_MAX_CHARS;
              useSentenceChunks = forceSentenceChunks || forceSentenceByLength;
              debugEnabled = isDeepDebugEnabled();
              debugDump = debugEnabled ? {
                analysisMode: useSentenceChunks ? "sentence" : "paragraph",
                sentenceModeReason: forceSentenceChunks ? "forced" : forceSentenceByLength ? "paragraph-too-long" : "none",
                paragraphIndex: paragraphIndex,
                paragraphDocOffset: paragraphDocOffset,
                originalText: originalText,
                normalizedOriginalText: typeof normalizedOriginalText === "string" ? normalizedOriginalText : (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeParagraphWhitespace)(originalText),
                chunks: [],
                skippedChunks: [],
                final: {}
              } : null;
              chunks = null;
              if (!useSentenceChunks) {
                _context2.n = 2;
                break;
              }
              _context2.n = 1;
              return splitParagraphIntoChunksWithLemmas(originalText, MAX_PARAGRAPH_CHARS, this.anchorProvider);
            case 1:
              chunks = _context2.v;
            case 2:
              if (!Array.isArray(chunks) || !chunks.length) {
                chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS, {
                  preferWholeParagraph: !useSentenceChunks,
                  conservativePack: useSentenceChunks && conservativeSentenceFallback
                });
              }
              if (chunks.length) {
                _context2.n = 4;
                break;
              }
              _t4 = [];
              _context2.n = 3;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: originalText,
                sourceTokens: [],
                targetTokens: [],
                documentOffset: paragraphDocOffset
              });
            case 3:
              _t5 = _context2.v;
              return _context2.a(2, {
                suggestions: _t4,
                apiErrors: 0,
                nonCommaSkips: 0,
                nonCommaSalvaged: 0,
                processedAny: false,
                anchorsEntry: _t5
              });
            case 4:
              normalizedSource = typeof normalizedOriginalText === "string" ? normalizedOriginalText : (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeParagraphWhitespace)(originalText);
              chunks.forEach(function (chunk) {
                chunk.normalizedText = normalizedSource.slice(chunk.start, chunk.end);
              });
              processedMeta = [];
              chunkDetails = [];
              apiErrors = 0;
              nonCommaChunkSkips = 0;
              nonCommaChunkSalvaged = 0;
              makeSnippet = function makeSnippet(value) {
                var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 140;
                return typeof value === "string" ? value.slice(0, max).replace(/\s+/g, " ").trim() : "";
              };
              logSkippedChunk = function logSkippedChunk(reason, chunk) {
                var _extra$depth;
                var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                if (!debugEnabled) return;
                var payload = _objectSpread({
                  reason: reason,
                  paragraphIndex: paragraphIndex,
                  chunkIndex: chunk === null || chunk === void 0 ? void 0 : chunk.index,
                  depth: (_extra$depth = extra.depth) !== null && _extra$depth !== void 0 ? _extra$depth : 0,
                  start: chunk === null || chunk === void 0 ? void 0 : chunk.start,
                  end: chunk === null || chunk === void 0 ? void 0 : chunk.end,
                  length: typeof (chunk === null || chunk === void 0 ? void 0 : chunk.length) === "number" ? chunk.length : typeof (chunk === null || chunk === void 0 ? void 0 : chunk.start) === "number" && typeof (chunk === null || chunk === void 0 ? void 0 : chunk.end) === "number" ? Math.max(0, chunk.end - chunk.start) : undefined,
                  snippet: makeSnippet((chunk === null || chunk === void 0 ? void 0 : chunk.text) || (chunk === null || chunk === void 0 ? void 0 : chunk.normalizedText) || "")
                }, extra);
                if (debugDump) {
                  debugDump.skippedChunks.push(payload);
                }
                try {
                  console.warn("[Vejice Chunk Skip]", payload);
                } catch (_err) {
                  // Ignore logging failures in restricted runtimes.
                }
              };
              _processChunk = /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(chunk) {
                  var _detail;
                  var depth,
                    chunkInputText,
                    meta,
                    detail,
                    chunkRequestText,
                    chunkFailureKey,
                    cooldownUntil,
                    retryChunks,
                    _iterator,
                    _step,
                    retryChunk,
                    correctedChunk,
                    baseForDiff,
                    apiCommaOps,
                    hasApiCommaOps,
                    commaDiffOps,
                    hasCommaDiffOps,
                    onlyCommaTextChange,
                    hasNonCommaDrift,
                    _detail2,
                    _detail3,
                    _detail4,
                    _detail5,
                    _detail6,
                    _detail7,
                    salvageRetryChunks,
                    _iterator2,
                    _step2,
                    _retryChunk,
                    shouldForceSyntheticAnchoring,
                    commaOnlyOps,
                    useCommaOnlyCorrectedChunk,
                    diffOps,
                    _args = arguments,
                    _t,
                    _t2,
                    _t3;
                  return _regenerator().w(function (_context) {
                    while (1) switch (_context.p = _context.n) {
                      case 0:
                        depth = _args.length > 1 && _args[1] !== undefined ? _args[1] : 0;
                        throwIfAborted(abortSignal);
                        chunkInputText = chunk.normalizedText || chunk.text || "";
                        meta = {
                          chunk: chunk,
                          correctedText: chunkInputText,
                          detail: null,
                          syntheticTokens: null,
                          forceSyntheticAnchoring: false,
                          lowAnchorReliability: Boolean(chunk === null || chunk === void 0 ? void 0 : chunk.lowAnchorReliability)
                        };
                        processedMeta.push(meta);
                        if (!chunk.tooLong) {
                          _context.n = 1;
                          break;
                        }
                        logSkippedChunk("tooLong", chunk, {
                          depth: depth
                        });
                        _this.notifiers.onSentenceTooLong(paragraphIndex, chunk.length);
                        meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
                        return _context.a(2);
                      case 1:
                        detail = null;
                        chunkRequestText = chunkInputText;
                        chunkFailureKey = buildChunkFailureKey(paragraphIndex, chunkRequestText);
                        cooldownUntil = _this.apiChunkFailureCooldownUntil.get(chunkFailureKey) || 0;
                        if (!(cooldownUntil > Date.now())) {
                          _context.n = 2;
                          break;
                        }
                        logSkippedChunk("apiErrorCooldown", chunk, {
                          depth: depth,
                          cooldownMsRemaining: Math.max(0, cooldownUntil - Date.now())
                        });
                        apiErrors++;
                        _this.notifiers.onChunkApiFailure(paragraphIndex, chunk.index, new Error("Chunk skipped due to recent API failure cooldown"));
                        meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
                        return _context.a(2);
                      case 2:
                        _context.p = 2;
                        _context.n = 3;
                        return _this.apiClient.popraviPovedDetailed(chunkRequestText, {
                          signal: abortSignal
                        });
                      case 3:
                        detail = _context.v;
                        _this.apiChunkFailureCooldownUntil.delete(chunkFailureKey);
                        _context.n = 14;
                        break;
                      case 4:
                        _context.p = 4;
                        _t = _context.v;
                        if (!isAbortLikeError(_t, abortSignal)) {
                          _context.n = 5;
                          break;
                        }
                        throw _t;
                      case 5:
                        retryChunks = splitFailedChunkForRetry(chunk, depth);
                        if (!(Array.isArray(retryChunks) && retryChunks.length > 1)) {
                          _context.n = 13;
                          break;
                        }
                        processedMeta.pop();
                        _iterator = _createForOfIteratorHelper(retryChunks);
                        _context.p = 6;
                        _iterator.s();
                      case 7:
                        if ((_step = _iterator.n()).done) {
                          _context.n = 9;
                          break;
                        }
                        retryChunk = _step.value;
                        _context.n = 8;
                        return _processChunk(retryChunk, depth + 1);
                      case 8:
                        _context.n = 7;
                        break;
                      case 9:
                        _context.n = 11;
                        break;
                      case 10:
                        _context.p = 10;
                        _t2 = _context.v;
                        _iterator.e(_t2);
                      case 11:
                        _context.p = 11;
                        _iterator.f();
                        return _context.f(11);
                      case 12:
                        return _context.a(2);
                      case 13:
                        _this.apiChunkFailureCooldownUntil.set(chunkFailureKey, Date.now() + API_FAILURE_COOLDOWN_MS);
                        logSkippedChunk("apiError", chunk, {
                          depth: depth,
                          apiError: (_t === null || _t === void 0 ? void 0 : _t.message) || String(_t || "API error"),
                          cooldownMs: API_FAILURE_COOLDOWN_MS
                        });
                        apiErrors++;
                        _this.notifiers.onChunkApiFailure(paragraphIndex, chunk.index, _t);
                        meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
                        return _context.a(2);
                      case 14:
                        correctedChunk = detail.correctedText;
                        baseForDiff = chunk.text || chunkInputText || "";
                        apiCommaOps = normalizeApiCommaOps((_detail = detail) === null || _detail === void 0 ? void 0 : _detail.commaOps, baseForDiff, correctedChunk);
                        hasApiCommaOps = apiCommaOps.length > 0;
                        commaDiffOps = collapseDuplicateDiffOps(filterCommaOps(baseForDiff, correctedChunk, diffCommasOnly(baseForDiff, correctedChunk)));
                        hasCommaDiffOps = commaDiffOps.length > 0;
                        onlyCommaTextChange = (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.onlyCommasChanged)(chunkInputText, correctedChunk);
                        hasNonCommaDrift = !onlyCommaTextChange;
                        if (debugEnabled && debugDump) {
                          debugDump.chunks.push({
                            index: chunk.index,
                            start: chunk.start,
                            end: chunk.end,
                            normalizedInput: chunkInputText,
                            correctedChunk: correctedChunk,
                            hasNonCommaDrift: hasNonCommaDrift,
                            hasApiCommaOps: hasApiCommaOps,
                            apiCommaOpsCount: apiCommaOps.length,
                            fallbackCommaOpsCount: commaDiffOps.length,
                            lowAnchorReliability: meta.lowAnchorReliability,
                            rawSourceText: (_detail2 = detail) === null || _detail2 === void 0 || (_detail2 = _detail2.raw) === null || _detail2 === void 0 ? void 0 : _detail2.source_text,
                            rawTargetText: (_detail3 = detail) === null || _detail3 === void 0 || (_detail3 = _detail3.raw) === null || _detail3 === void 0 ? void 0 : _detail3.target_text,
                            rawCorrections: (_detail4 = detail) === null || _detail4 === void 0 ? void 0 : _detail4.corrections,
                            rawCommaOps: Array.isArray((_detail5 = detail) === null || _detail5 === void 0 ? void 0 : _detail5.commaOps) ? detail.commaOps : [],
                            rawSourceTokensCount: Array.isArray((_detail6 = detail) === null || _detail6 === void 0 ? void 0 : _detail6.sourceTokens) ? detail.sourceTokens.length : 0,
                            rawTargetTokensCount: Array.isArray((_detail7 = detail) === null || _detail7 === void 0 ? void 0 : _detail7.targetTokens) ? detail.targetTokens.length : 0
                          });
                        }
                        if (!(!hasApiCommaOps && hasNonCommaDrift && !hasCommaDiffOps)) {
                          _context.n = 15;
                          break;
                        }
                        logSkippedChunk("nonCommaChange", chunk, {
                          depth: depth,
                          correctedSnippet: makeSnippet(correctedChunk)
                        });
                        _this.notifiers.onChunkNonCommaChanges(paragraphIndex, chunk.index, chunk.text, correctedChunk);
                        nonCommaChunkSkips++;
                        meta.syntheticTokens = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(chunk.text, "p".concat(paragraphIndex, "_c").concat(chunk.index, "_syn_"));
                        return _context.a(2);
                      case 15:
                        if (!(!hasApiCommaOps && hasNonCommaDrift && hasCommaDiffOps)) {
                          _context.n = 24;
                          break;
                        }
                        salvageRetryChunks = splitFailedChunkForRetry(chunk, depth);
                        if (!(commaDiffOps.length >= SALVAGE_RECHUNK_MIN_DIFF_OPS && Array.isArray(salvageRetryChunks) && salvageRetryChunks.length > 1)) {
                          _context.n = 23;
                          break;
                        }
                        processedMeta.pop();
                        _iterator2 = _createForOfIteratorHelper(salvageRetryChunks);
                        _context.p = 16;
                        _iterator2.s();
                      case 17:
                        if ((_step2 = _iterator2.n()).done) {
                          _context.n = 19;
                          break;
                        }
                        _retryChunk = _step2.value;
                        _context.n = 18;
                        return _processChunk(_retryChunk, depth + 1);
                      case 18:
                        _context.n = 17;
                        break;
                      case 19:
                        _context.n = 21;
                        break;
                      case 20:
                        _context.p = 20;
                        _t3 = _context.v;
                        _iterator2.e(_t3);
                      case 21:
                        _context.p = 21;
                        _iterator2.f();
                        return _context.f(21);
                      case 22:
                        return _context.a(2);
                      case 23:
                        nonCommaChunkSalvaged++;
                        logSkippedChunk("nonCommaChangeSalvaged", chunk, {
                          depth: depth,
                          correctedSnippet: makeSnippet(correctedChunk),
                          fallbackCommaOps: commaDiffOps.length
                        });
                      case 24:
                        meta.detail = detail;
                        shouldForceSyntheticAnchoring = hasNonCommaDrift && !hasApiCommaOps;
                        meta.forceSyntheticAnchoring = shouldForceSyntheticAnchoring;
                        meta.lowAnchorReliability = meta.lowAnchorReliability || shouldForceSyntheticAnchoring;
                        commaOnlyOps = hasApiCommaOps ? apiCommaOps : commaDiffOps;
                        useCommaOnlyCorrectedChunk = hasNonCommaDrift && !hasApiCommaOps && commaOnlyOps.length > 0;
                        meta.correctedText = useCommaOnlyCorrectedChunk ? buildCommaOnlyCorrectedText(baseForDiff, commaOnlyOps) : correctedChunk;
                        diffOps = hasApiCommaOps ? [] : commaDiffOps;
                        if (!(!meta.detail && !diffOps.length && !apiCommaOps.length)) {
                          _context.n = 25;
                          break;
                        }
                        return _context.a(2);
                      case 25:
                        chunkDetails.push({
                          chunk: chunk,
                          metaRef: meta,
                          baseForDiff: baseForDiff,
                          correctedChunk: correctedChunk,
                          diffOps: diffOps,
                          apiCommaOps: apiCommaOps
                        });
                      case 26:
                        return _context.a(2);
                    }
                  }, _callee, null, [[16, 20, 21, 22], [6, 10, 11, 12], [2, 4]]);
                }));
                return function processChunk(_x2) {
                  return _ref3.apply(this, arguments);
                };
              }();
              _iterator3 = _createForOfIteratorHelper(chunks);
              _context2.p = 5;
              _iterator3.s();
            case 6:
              if ((_step3 = _iterator3.n()).done) {
                _context2.n = 8;
                break;
              }
              chunk = _step3.value;
              throwIfAborted(abortSignal);
              _context2.n = 7;
              return _processChunk(chunk, 0);
            case 7:
              _context2.n = 6;
              break;
            case 8:
              _context2.n = 10;
              break;
            case 9:
              _context2.p = 9;
              _t6 = _context2.v;
              _iterator3.e(_t6);
            case 10:
              _context2.p = 10;
              _iterator3.f();
              return _context2.f(10);
            case 11:
              hasDetailedChunk = processedMeta.some(function (meta) {
                return meta.detail;
              });
              canFallbackToSentences = !forceSentenceChunks && chunks.length === 1;
              if (!(!hasDetailedChunk && canFallbackToSentences && (apiErrors > 0 || nonCommaChunkSkips > 0))) {
                _context2.n = 12;
                break;
              }
              return _context2.a(2, this.analyzeParagraph({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                normalizedOriginalText: normalizedOriginalText,
                paragraphDocOffset: paragraphDocOffset,
                forceSentenceChunks: true,
                conservativeSentenceFallback: conservativeSentenceFallback,
                abortSignal: abortSignal
              }));
            case 12:
              if (hasDetailedChunk) {
                _context2.n = 14;
                break;
              }
              _context2.n = 13;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: originalText,
                sourceTokens: [],
                targetTokens: [],
                documentOffset: paragraphDocOffset
              });
            case 13:
              _anchorsEntry = _context2.v;
              return _context2.a(2, {
                suggestions: [],
                apiErrors: apiErrors,
                nonCommaSkips: nonCommaChunkSkips,
                nonCommaSalvaged: nonCommaChunkSalvaged,
                processedAny: false,
                anchorsEntry: _anchorsEntry
              });
            case 14:
              correctedParagraph = processedMeta.map(function (meta) {
                var _meta$chunk$trailing;
                return meta.correctedText + ((_meta$chunk$trailing = meta.chunk.trailing) !== null && _meta$chunk$trailing !== void 0 ? _meta$chunk$trailing : "");
              }).join("");
              sourceTokens = [];
              targetTokens = [];
              processedMeta.forEach(function (meta) {
                var basePrefix = "p".concat(paragraphIndex, "_c").concat(meta.chunk.index, "_");
                if (meta.detail && !meta.forceSyntheticAnchoring) {
                  var _rekeyTokensWithMap = rekeyTokensWithMap(meta.detail.sourceTokens, "".concat(basePrefix, "s")),
                    rekeyedSource = _rekeyTokensWithMap.tokens,
                    sourceMap = _rekeyTokensWithMap.map;
                  sourceTokens.push.apply(sourceTokens, _toConsumableArray(rekeyedSource));
                  var _rekeyTokensWithMap2 = rekeyTokensWithMap(meta.detail.targetTokens, "".concat(basePrefix, "t")),
                    rekeyedTarget = _rekeyTokensWithMap2.tokens;
                  targetTokens.push.apply(targetTokens, _toConsumableArray(rekeyedTarget));
                  meta.remappedCorrections = remapCorrections(meta.detail.corrections, sourceMap);
                } else if (meta.detail && meta.forceSyntheticAnchoring) {
                  // In salvage mode keep API source token ids (for correction ops),
                  // but anchor target side against comma-only corrected text.
                  var _rekeyTokensWithMap3 = rekeyTokensWithMap(meta.detail.sourceTokens, "".concat(basePrefix, "s")),
                    _rekeyedSource = _rekeyTokensWithMap3.tokens,
                    _sourceMap = _rekeyTokensWithMap3.map;
                  sourceTokens.push.apply(sourceTokens, _toConsumableArray(_rekeyedSource));
                  var sourceSeed = meta.chunk.normalizedText || meta.chunk.text || "";
                  var targetSeed = typeof meta.correctedText === "string" ? meta.correctedText : sourceSeed;
                  targetTokens.push.apply(targetTokens, _toConsumableArray((0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(targetSeed, "".concat(basePrefix, "synt_"))));
                  meta.remappedCorrections = remapCorrections(meta.detail.corrections, _sourceMap);
                } else {
                  var _sourceSeed = meta.chunk.normalizedText || meta.chunk.text || "";
                  var _targetSeed = typeof meta.correctedText === "string" ? meta.correctedText : _sourceSeed;
                  sourceTokens.push.apply(sourceTokens, _toConsumableArray((0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(_sourceSeed, "".concat(basePrefix, "syns_"))));
                  targetTokens.push.apply(targetTokens, _toConsumableArray((0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.tokenizeForAnchoring)(_targetSeed, "".concat(basePrefix, "synt_"))));
                }
              });
              _context2.n = 15;
              return this.anchorProvider.getAnchors({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                correctedText: correctedParagraph,
                sourceTokens: sourceTokens,
                targetTokens: targetTokens,
                documentOffset: paragraphDocOffset
              });
            case 15:
              anchorsEntry = _context2.v;
              suggestions = [];
              suggestionDedupKeys = new Set();
              debugOpFlow = debugEnabled ? [] : null;
              _i = 0, _chunkDetails = chunkDetails;
            case 16:
              if (!(_i < _chunkDetails.length)) {
                _context2.n = 29;
                break;
              }
              entry = _chunkDetails[_i];
              detailRef = (_entry$metaRef = entry.metaRef) !== null && _entry$metaRef !== void 0 && _entry$metaRef.detail ? _objectSpread(_objectSpread({}, entry.metaRef.detail), {}, {
                corrections: (_entry$metaRef$remapp = entry.metaRef.remappedCorrections) !== null && _entry$metaRef$remapp !== void 0 ? _entry$metaRef$remapp : entry.metaRef.detail.corrections
              }) : null;
              apiOpsPresent = Array.isArray(entry.apiCommaOps) && entry.apiCommaOps.length > 0;
              ops = apiOpsPresent ? entry.apiCommaOps.map(function (op) {
                return _objectSpread({}, op);
              }) : [];
              fallbackOps = [];
              correctionOps = [];
              if (!apiOpsPresent) {
                correctionTracking = detailRef !== null && detailRef !== void 0 && detailRef.corrections ? createCorrectionTracking() : null;
                correctionsPresent = correctionsHaveEntries(detailRef === null || detailRef === void 0 ? void 0 : detailRef.corrections);
                if (correctionsPresent) {
                  correctionOps = collectCommaOpsFromCorrections(detailRef, anchorsEntry, paragraphIndex, correctionTracking);
                  ops = correctionOps;
                }
                fallbackOps = entry.diffOps || [];
                if (fallbackOps.length) {
                  if (!correctionsPresent || ops.length) {
                    fallbackOps = filterDiffOpsAgainstCorrections(fallbackOps, correctionTracking);
                  }
                  if ((_entry$metaRef2 = entry.metaRef) !== null && _entry$metaRef2 !== void 0 && _entry$metaRef2.forceSyntheticAnchoring && correctionsPresent && ops.length) {
                    // In salvage mode prefer correction-derived comma ops when available;
                    // diff ops are often position-noisy after non-comma drift.
                    fallbackOps = [];
                  }
                  if (!correctionsPresent && detailRef && !ops.length) {
                    ops = fallbackOps.map(function (op) {
                      return _objectSpread(_objectSpread({}, op), {}, {
                        fromCorrections: true,
                        viaDiffFallback: true
                      });
                    });
                    fallbackOps = [];
                  } else if (correctionsPresent) {
                    fallbackOps = fallbackOps.map(function (op) {
                      return _objectSpread(_objectSpread({}, op), {}, {
                        fromCorrections: true,
                        viaDiffFallback: true
                      });
                    });
                  }
                }
              }
              usingFallbackOnly = !ops.length;
              allOps = mergePreferredCommaOps(ops, fallbackOps);
              if (allOps.length) {
                _context2.n = 17;
                break;
              }
              return _context2.a(3, 28);
            case 17:
              opFlow = debugEnabled ? {
                chunkIndex: entry.chunk.index,
                fromApiCommaOps: apiOpsPresent ? ops.map(function (op) {
                  return _objectSpread({}, op);
                }) : [],
                fromCorrections: correctionOps.map(function (op) {
                  return _objectSpread({}, op);
                }),
                fallbackOps: fallbackOps.map(function (op) {
                  return _objectSpread({}, op);
                }),
                usingApiCommaOps: apiOpsPresent,
                usingFallbackOnly: usingFallbackOnly,
                keptOps: [],
                droppedOps: []
              } : null;
              _iterator4 = _createForOfIteratorHelper(allOps);
              _context2.p = 18;
              _iterator4.s();
            case 19:
              if ((_step4 = _iterator4.n()).done) {
                _context2.n = 24;
                break;
              }
              op = _step4.value;
              offset = entry.chunk.start;
              baseOp = op;
              adjustedOp = _objectSpread(_objectSpread({}, baseOp), {}, {
                pos: baseOp.pos + offset,
                originalPos: (typeof baseOp.originalPos === "number" ? baseOp.originalPos : baseOp.pos) + offset,
                correctedPos: (typeof baseOp.correctedPos === "number" ? baseOp.correctedPos : baseOp.pos) + offset
              });
              if (isOpConsistentWithTexts(adjustedOp, originalText, correctedParagraph)) {
                _context2.n = 20;
                break;
              }
              if (opFlow) opFlow.droppedOps.push({
                reason: "inconsistent_with_texts",
                op: adjustedOp
              });
              return _context2.a(3, 23);
            case 20:
              if (!shouldSuppressDueToRepeatedToken(anchorsEntry, adjustedOp)) {
                _context2.n = 21;
                break;
              }
              if (opFlow) opFlow.droppedOps.push({
                reason: "repeated_token_suppression",
                op: adjustedOp
              });
              return _context2.a(3, 23);
            case 21:
              suggestion = buildSuggestionFromOp({
                op: adjustedOp,
                paragraphIndex: paragraphIndex,
                anchorsEntry: anchorsEntry,
                originalText: originalText,
                correctedParagraph: correctedParagraph,
                lowAnchorReliability: Boolean((_entry$metaRef3 = entry.metaRef) === null || _entry$metaRef3 === void 0 ? void 0 : _entry$metaRef3.lowAnchorReliability)
              });
              if (!suggestion) {
                _context2.n = 23;
                break;
              }
              dedupKey = buildSuggestionDedupKey(suggestion);
              if (!(dedupKey && suggestionDedupKeys.has(dedupKey))) {
                _context2.n = 22;
                break;
              }
              if (opFlow) {
                opFlow.droppedOps.push({
                  reason: "duplicate_suggestion",
                  op: adjustedOp,
                  suggestionId: suggestion.id,
                  dedupKey: dedupKey
                });
              }
              return _context2.a(3, 23);
            case 22:
              if (dedupKey) {
                suggestionDedupKeys.add(dedupKey);
              }
              suggestions.push(suggestion);
              if (opFlow) opFlow.keptOps.push({
                op: adjustedOp,
                suggestionId: suggestion.id,
                dedupKey: dedupKey
              });
            case 23:
              _context2.n = 19;
              break;
            case 24:
              _context2.n = 26;
              break;
            case 25:
              _context2.p = 25;
              _t7 = _context2.v;
              _iterator4.e(_t7);
            case 26:
              _context2.p = 26;
              _iterator4.f();
              return _context2.f(26);
            case 27:
              if (opFlow && debugOpFlow) {
                debugOpFlow.push(opFlow);
              }
            case 28:
              _i++;
              _context2.n = 16;
              break;
            case 29:
              if (debugEnabled && debugDump) {
                debugDump.final = {
                  correctedParagraph: correctedParagraph,
                  suggestionsCount: suggestions.length,
                  nonCommaSkips: nonCommaChunkSkips,
                  nonCommaSalvaged: nonCommaChunkSalvaged,
                  suggestions: suggestions.map(function (s) {
                    var _s$meta, _s$meta2, _s$meta3, _s$meta4, _s$meta5;
                    return {
                      id: s.id,
                      kind: s.kind,
                      paragraphIndex: s.paragraphIndex,
                      charHint: s.charHint,
                      op: s === null || s === void 0 || (_s$meta = s.meta) === null || _s$meta === void 0 ? void 0 : _s$meta.op,
                      sourceTokenBefore: s === null || s === void 0 || (_s$meta2 = s.meta) === null || _s$meta2 === void 0 || (_s$meta2 = _s$meta2.anchor) === null || _s$meta2 === void 0 || (_s$meta2 = _s$meta2.sourceTokenBefore) === null || _s$meta2 === void 0 ? void 0 : _s$meta2.tokenText,
                      sourceTokenAfter: s === null || s === void 0 || (_s$meta3 = s.meta) === null || _s$meta3 === void 0 || (_s$meta3 = _s$meta3.anchor) === null || _s$meta3 === void 0 || (_s$meta3 = _s$meta3.sourceTokenAfter) === null || _s$meta3 === void 0 ? void 0 : _s$meta3.tokenText,
                      targetTokenBefore: s === null || s === void 0 || (_s$meta4 = s.meta) === null || _s$meta4 === void 0 || (_s$meta4 = _s$meta4.anchor) === null || _s$meta4 === void 0 || (_s$meta4 = _s$meta4.targetTokenBefore) === null || _s$meta4 === void 0 ? void 0 : _s$meta4.tokenText,
                      targetTokenAfter: s === null || s === void 0 || (_s$meta5 = s.meta) === null || _s$meta5 === void 0 || (_s$meta5 = _s$meta5.anchor) === null || _s$meta5 === void 0 || (_s$meta5 = _s$meta5.targetTokenAfter) === null || _s$meta5 === void 0 ? void 0 : _s$meta5.tokenText
                    };
                  }),
                  opFlow: debugOpFlow || []
                };
                this.lastDebugDump = debugDump;
                this.debugDumps.push(debugDump);
                if (this.debugDumps.length > 20) {
                  this.debugDumps.shift();
                }
                pushDeepDebugDump(debugDump);
              }
              if (!(!suggestions.length && canFallbackToSentences && nonCommaChunkSkips > 0)) {
                _context2.n = 30;
                break;
              }
              return _context2.a(2, this.analyzeParagraph({
                paragraphIndex: paragraphIndex,
                originalText: originalText,
                normalizedOriginalText: normalizedOriginalText,
                paragraphDocOffset: paragraphDocOffset,
                forceSentenceChunks: true,
                conservativeSentenceFallback: conservativeSentenceFallback,
                abortSignal: abortSignal
              }));
            case 30:
              return _context2.a(2, {
                suggestions: suggestions,
                apiErrors: apiErrors,
                nonCommaSkips: nonCommaChunkSkips,
                nonCommaSalvaged: nonCommaChunkSalvaged,
                processedAny: Boolean(suggestions.length),
                anchorsEntry: anchorsEntry,
                correctedParagraph: correctedParagraph
              });
          }
        }, _callee2, this, [[18, 25, 26, 27], [5, 9, 10, 11]]);
      }));
      function analyzeParagraph(_x) {
        return _analyzeParagraph.apply(this, arguments);
      }
      return analyzeParagraph;
    }()
  }]);
}();
function buildSuggestionFromOp(_ref4) {
  var _op$originalPos2, _op$correctedPos;
  var op = _ref4.op,
    paragraphIndex = _ref4.paragraphIndex,
    anchorsEntry = _ref4.anchorsEntry,
    originalText = _ref4.originalText,
    correctedText = _ref4.correctedText,
    _ref4$lowAnchorReliab = _ref4.lowAnchorReliability,
    lowAnchorReliability = _ref4$lowAnchorReliab === void 0 ? false : _ref4$lowAnchorReliab;
  if (!op) return null;
  if (op.kind === "delete") {
    var _op$originalPos;
    var _metadata = buildDeleteSuggestionMetadata(anchorsEntry, (_op$originalPos = op.originalPos) !== null && _op$originalPos !== void 0 ? _op$originalPos : op.pos);
    if (!_metadata) return null;
    var _confidence = computeSuggestionConfidence({
      kind: "delete",
      op: op,
      metadata: _metadata
    });
    return (0,_Suggestion_js__WEBPACK_IMPORTED_MODULE_0__.createSuggestion)({
      id: "delete-".concat(paragraphIndex, "-").concat(op.pos),
      paragraphIndex: paragraphIndex,
      kind: "delete",
      charHint: {
        start: _metadata.charStart,
        end: _metadata.charEnd,
        documentStart: _metadata.documentCharStart,
        documentEnd: _metadata.documentCharEnd
      },
      tokenHint: buildTokenHint(_metadata),
      snippets: buildSnippetsFromMetadata(_metadata, originalText, correctedText),
      meta: {
        op: op,
        confidence: _confidence,
        lowAnchorReliability: Boolean(lowAnchorReliability),
        highlightText: _metadata.highlightText,
        anchor: _metadata,
        originalText: originalText,
        correctedText: correctedText
      }
    });
  }
  var metadata = buildInsertSuggestionMetadata(anchorsEntry, {
    originalCharIndex: (_op$originalPos2 = op.originalPos) !== null && _op$originalPos2 !== void 0 ? _op$originalPos2 : op.pos,
    targetCharIndex: (_op$correctedPos = op.correctedPos) !== null && _op$correctedPos !== void 0 ? _op$correctedPos : op.pos
  });
  if (!metadata) return null;
  var confidence = computeSuggestionConfidence({
    kind: "insert",
    op: op,
    metadata: metadata
  });
  return (0,_Suggestion_js__WEBPACK_IMPORTED_MODULE_0__.createSuggestion)({
    id: "insert-".concat(paragraphIndex, "-").concat(op.pos),
    paragraphIndex: paragraphIndex,
    kind: "insert",
    charHint: {
      start: metadata.targetCharStart,
      end: metadata.targetCharEnd,
      documentStart: metadata.targetDocumentCharStart,
      documentEnd: metadata.targetDocumentCharEnd
    },
    tokenHint: buildTokenHint(metadata),
    snippets: buildSnippetsFromMetadata(metadata, originalText, correctedText),
    meta: {
      op: op,
      confidence: confidence,
      lowAnchorReliability: Boolean(lowAnchorReliability),
      highlightText: metadata.highlightText,
      anchor: metadata,
      originalText: originalText,
      correctedText: correctedText
    }
  });
}
function buildSuggestionDedupKey(suggestion) {
  var _suggestion$meta, _suggestion$meta2, _ref5, _ref6, _ref7, _ref8, _anchor$sourceTokenAt, _anchor$sourceTokenAt2, _anchor$targetTokenAt, _anchor$sourceTokenBe, _anchor$targetTokenBe, _anchor$highlightAnch;
  if (!suggestion || _typeof(suggestion) !== "object") return null;
  var paragraphIndex = Number.isFinite(suggestion.paragraphIndex) ? suggestion.paragraphIndex : "p";
  var kind = typeof suggestion.kind === "string" ? suggestion.kind : "k";
  var op = (suggestion === null || suggestion === void 0 || (_suggestion$meta = suggestion.meta) === null || _suggestion$meta === void 0 ? void 0 : _suggestion$meta.op) || {};
  var opOriginalPos = Number.isFinite(op.originalPos) ? op.originalPos : Number.isFinite(op.pos) ? op.pos : null;
  var opCorrectedPos = Number.isFinite(op.correctedPos) ? op.correctedPos : Number.isFinite(op.pos) ? op.pos : null;
  if (Number.isFinite(opOriginalPos) || Number.isFinite(opCorrectedPos)) {
    return [paragraphIndex, kind, "op", Number.isFinite(opOriginalPos) ? opOriginalPos : "na", Number.isFinite(opCorrectedPos) ? opCorrectedPos : "na"].join("|");
  }
  var visualBounds = resolveSuggestionVisualBounds(suggestion);
  if (Number.isFinite(visualBounds.start) && visualBounds.start >= 0) {
    return [paragraphIndex, visualBounds.start, visualBounds.end].join("|");
  }
  var anchor = (suggestion === null || suggestion === void 0 || (_suggestion$meta2 = suggestion.meta) === null || _suggestion$meta2 === void 0 ? void 0 : _suggestion$meta2.anchor) || {};
  var tokenId = (_ref5 = (_ref6 = (_ref7 = (_ref8 = (_anchor$sourceTokenAt = anchor === null || anchor === void 0 || (_anchor$sourceTokenAt2 = anchor.sourceTokenAt) === null || _anchor$sourceTokenAt2 === void 0 ? void 0 : _anchor$sourceTokenAt2.tokenId) !== null && _anchor$sourceTokenAt !== void 0 ? _anchor$sourceTokenAt : anchor === null || anchor === void 0 || (_anchor$targetTokenAt = anchor.targetTokenAt) === null || _anchor$targetTokenAt === void 0 ? void 0 : _anchor$targetTokenAt.tokenId) !== null && _ref8 !== void 0 ? _ref8 : anchor === null || anchor === void 0 || (_anchor$sourceTokenBe = anchor.sourceTokenBefore) === null || _anchor$sourceTokenBe === void 0 ? void 0 : _anchor$sourceTokenBe.tokenId) !== null && _ref7 !== void 0 ? _ref7 : anchor === null || anchor === void 0 || (_anchor$targetTokenBe = anchor.targetTokenBefore) === null || _anchor$targetTokenBe === void 0 ? void 0 : _anchor$targetTokenBe.tokenId) !== null && _ref6 !== void 0 ? _ref6 : anchor === null || anchor === void 0 || (_anchor$highlightAnch = anchor.highlightAnchorTarget) === null || _anchor$highlightAnch === void 0 ? void 0 : _anchor$highlightAnch.tokenId) !== null && _ref5 !== void 0 ? _ref5 : "na";
  return [paragraphIndex, kind, "na", "t".concat(tokenId), Number.isFinite(opOriginalPos) ? opOriginalPos : "na", Number.isFinite(opCorrectedPos) ? opCorrectedPos : "na"].join("|");
}
function firstFiniteValue() {
  var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var _iterator5 = _createForOfIteratorHelper(values),
    _step5;
  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var value = _step5.value;
      if (Number.isFinite(value)) return value;
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  return null;
}
function resolveSuggestionVisualBounds(suggestion) {
  var _suggestion$meta3, _suggestion$charHint, _suggestion$meta4, _suggestion$meta5, _suggestion$meta6, _suggestion$charHint2;
  if (!suggestion || _typeof(suggestion) !== "object") {
    return {
      start: null,
      end: null
    };
  }
  var anchor = (suggestion === null || suggestion === void 0 || (_suggestion$meta3 = suggestion.meta) === null || _suggestion$meta3 === void 0 ? void 0 : _suggestion$meta3.anchor) || {};
  var startRaw = firstFiniteValue([anchor.highlightCharStart, anchor.charStart, suggestion === null || suggestion === void 0 || (_suggestion$charHint = suggestion.charHint) === null || _suggestion$charHint === void 0 ? void 0 : _suggestion$charHint.start, anchor.targetCharStart, suggestion === null || suggestion === void 0 || (_suggestion$meta4 = suggestion.meta) === null || _suggestion$meta4 === void 0 || (_suggestion$meta4 = _suggestion$meta4.op) === null || _suggestion$meta4 === void 0 ? void 0 : _suggestion$meta4.originalPos, suggestion === null || suggestion === void 0 || (_suggestion$meta5 = suggestion.meta) === null || _suggestion$meta5 === void 0 || (_suggestion$meta5 = _suggestion$meta5.op) === null || _suggestion$meta5 === void 0 ? void 0 : _suggestion$meta5.correctedPos, suggestion === null || suggestion === void 0 || (_suggestion$meta6 = suggestion.meta) === null || _suggestion$meta6 === void 0 || (_suggestion$meta6 = _suggestion$meta6.op) === null || _suggestion$meta6 === void 0 ? void 0 : _suggestion$meta6.pos]);
  if (!Number.isFinite(startRaw) || startRaw < 0) {
    return {
      start: null,
      end: null
    };
  }
  var start = Math.floor(startRaw);
  var endRaw = firstFiniteValue([anchor.highlightCharEnd, anchor.charEnd, suggestion === null || suggestion === void 0 || (_suggestion$charHint2 = suggestion.charHint) === null || _suggestion$charHint2 === void 0 ? void 0 : _suggestion$charHint2.end, anchor.targetCharEnd]);
  var end = Number.isFinite(endRaw) && endRaw > start ? Math.floor(endRaw) : start + 1;
  return {
    start: start,
    end: end
  };
}
function computeSuggestionConfidence(_ref9) {
  var _metadata$sourceToken, _metadata$sourceToken2, _metadata$targetToken, _metadata$targetToken2, _metadata$highlightAn;
  var kind = _ref9.kind,
    op = _ref9.op,
    metadata = _ref9.metadata;
  var score = 0.5;
  var reasons = [];
  if (op !== null && op !== void 0 && op.fromCorrections) {
    score += 0.12;
    reasons.push("from_corrections");
  } else {
    score -= 0.08;
    reasons.push("not_from_corrections");
  }
  if (op !== null && op !== void 0 && op.viaDiffFallback) {
    score -= 0.14;
    reasons.push("diff_fallback");
  } else {
    score += 0.08;
    reasons.push("direct_corrections_alignment");
  }
  var hasPrimaryCharHint = kind === "insert" ? Number.isFinite(metadata === null || metadata === void 0 ? void 0 : metadata.targetCharStart) && metadata.targetCharStart >= 0 : Number.isFinite(metadata === null || metadata === void 0 ? void 0 : metadata.charStart) && metadata.charStart >= 0;
  if (hasPrimaryCharHint) {
    score += 0.14;
    reasons.push("char_hint_present");
  } else {
    score -= 0.2;
    reasons.push("char_hint_missing");
  }
  var hasTokenBefore = Boolean((metadata === null || metadata === void 0 ? void 0 : metadata.sourceTokenBefore) || (metadata === null || metadata === void 0 ? void 0 : metadata.targetTokenBefore));
  var hasTokenAfter = Boolean((metadata === null || metadata === void 0 ? void 0 : metadata.sourceTokenAfter) || (metadata === null || metadata === void 0 ? void 0 : metadata.targetTokenAfter));
  if (hasTokenBefore && hasTokenAfter) {
    score += 0.16;
    reasons.push("token_context_both_sides");
  } else if (hasTokenBefore || hasTokenAfter) {
    score += 0.06;
    reasons.push("token_context_one_side");
  } else {
    score -= 0.1;
    reasons.push("token_context_missing");
  }
  if (metadata !== null && metadata !== void 0 && metadata.highlightAnchorTarget || metadata !== null && metadata !== void 0 && metadata.sourceTokenAt || metadata !== null && metadata !== void 0 && metadata.targetTokenAt) {
    score += 0.08;
    reasons.push("highlight_anchor_present");
  } else {
    score -= 0.04;
    reasons.push("highlight_anchor_missing");
  }
  var nearestGap = [metadata === null || metadata === void 0 || (_metadata$sourceToken = metadata.sourceTokenBefore) === null || _metadata$sourceToken === void 0 ? void 0 : _metadata$sourceToken.repeatKeyNearestGap, metadata === null || metadata === void 0 || (_metadata$sourceToken2 = metadata.sourceTokenAfter) === null || _metadata$sourceToken2 === void 0 ? void 0 : _metadata$sourceToken2.repeatKeyNearestGap, metadata === null || metadata === void 0 || (_metadata$targetToken = metadata.targetTokenBefore) === null || _metadata$targetToken === void 0 ? void 0 : _metadata$targetToken.repeatKeyNearestGap, metadata === null || metadata === void 0 || (_metadata$targetToken2 = metadata.targetTokenAfter) === null || _metadata$targetToken2 === void 0 ? void 0 : _metadata$targetToken2.repeatKeyNearestGap, metadata === null || metadata === void 0 || (_metadata$highlightAn = metadata.highlightAnchorTarget) === null || _metadata$highlightAn === void 0 ? void 0 : _metadata$highlightAn.repeatKeyNearestGap].filter(function (value) {
    return Number.isFinite(value) && value >= 0;
  });
  var minNearestGap = nearestGap.length ? Math.min.apply(Math, _toConsumableArray(nearestGap)) : null;
  if (Number.isFinite(minNearestGap)) {
    if (minNearestGap <= 6) {
      score -= 0.12;
      reasons.push("repeat_token_very_close");
    } else if (minNearestGap <= 15) {
      score -= 0.06;
      reasons.push("repeat_token_close");
    } else {
      score += 0.02;
      reasons.push("repeat_token_far");
    }
  }
  if (kind === "delete") {
    score -= 0.03;
    reasons.push("delete_op_extra_risk");
  }
  var clamped = Math.max(0, Math.min(1, score));
  var level = clamped >= 0.75 ? "high" : clamped >= 0.55 ? "medium" : "low";
  return {
    score: Number(clamped.toFixed(3)),
    level: level,
    reasons: reasons
  };
}
function buildSnippetsFromMetadata(metadata, originalText, correctedText) {
  var snippets = {};
  if (metadata.highlightText) {
    snippets.focusWord = metadata.highlightText;
  }
  if (originalText) {
    snippets.leftSnippet = originalText.slice(Math.max(0, metadata.charStart - 24), metadata.charStart).trim();
    snippets.rightSnippet = originalText.slice(metadata.charEnd, metadata.charEnd + 24).trim();
  } else if (correctedText) {
    var _ref0, _metadata$targetCharS, _ref1, _metadata$targetCharE;
    var start = (_ref0 = (_metadata$targetCharS = metadata.targetCharStart) !== null && _metadata$targetCharS !== void 0 ? _metadata$targetCharS : metadata.charStart) !== null && _ref0 !== void 0 ? _ref0 : 0;
    var end = (_ref1 = (_metadata$targetCharE = metadata.targetCharEnd) !== null && _metadata$targetCharE !== void 0 ? _metadata$targetCharE : metadata.charEnd) !== null && _ref1 !== void 0 ? _ref1 : start;
    snippets.leftSnippet = correctedText.slice(Math.max(0, start - 24), start).trim();
    snippets.rightSnippet = correctedText.slice(end, end + 24).trim();
  }
  return snippets;
}
function buildTokenHint(meta) {
  var _meta$sourceTokenBefo, _meta$targetTokenBefo, _meta$sourceTokenAfte, _meta$targetTokenAfte, _meta$sourceTokenAt, _meta$targetTokenAt;
  if (!meta) return null;
  return {
    leftToken: ((_meta$sourceTokenBefo = meta.sourceTokenBefore) === null || _meta$sourceTokenBefo === void 0 ? void 0 : _meta$sourceTokenBefo.tokenText) || ((_meta$targetTokenBefo = meta.targetTokenBefore) === null || _meta$targetTokenBefo === void 0 ? void 0 : _meta$targetTokenBefo.tokenText) || null,
    rightToken: ((_meta$sourceTokenAfte = meta.sourceTokenAfter) === null || _meta$sourceTokenAfte === void 0 ? void 0 : _meta$sourceTokenAfte.tokenText) || ((_meta$targetTokenAfte = meta.targetTokenAfter) === null || _meta$targetTokenAfte === void 0 ? void 0 : _meta$targetTokenAfte.tokenText) || null,
    tokenId: ((_meta$sourceTokenAt = meta.sourceTokenAt) === null || _meta$sourceTokenAt === void 0 ? void 0 : _meta$sourceTokenAt.tokenId) || ((_meta$targetTokenAt = meta.targetTokenAt) === null || _meta$targetTokenAt === void 0 ? void 0 : _meta$targetTokenAt.tokenId) || null
  };
}
function splitFailedChunkForRetry(chunk) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (!chunk || typeof chunk.text !== "string") return null;
  if (depth >= API_RECHUNK_MAX_DEPTH) return null;
  var chunkLen = chunk.length || chunk.text.length || 0;
  if (chunkLen < API_RECHUNK_MIN_CHARS) return null;

  // Retry by sentence units only so failures skip at sentence granularity.
  // We intentionally avoid word/length slicing because it loses context.
  var splitChunks = splitParagraphIntoChunks(chunk.text, MAX_PARAGRAPH_CHARS, {
    preferWholeParagraph: false,
    conservativePack: false
  });
  if (!Array.isArray(splitChunks) || splitChunks.length <= 1) return null;
  var parentNormalized = chunk.normalizedText || chunk.text;
  return splitChunks.map(function (subChunk, index) {
    var subTextWithTrailing = (subChunk.text || "") + (typeof subChunk.trailing === "string" ? subChunk.trailing : "");
    var relativeStart = subChunk.start || 0;
    var absoluteStart = chunk.start + relativeStart;
    var normalizedText = parentNormalized.substr(relativeStart, subTextWithTrailing.length);
    return {
      index: "".concat(chunk.index, ".").concat(index + 1),
      start: absoluteStart,
      end: absoluteStart + subTextWithTrailing.length,
      length: subTextWithTrailing.length,
      text: subTextWithTrailing,
      trailing: "",
      tooLong: subTextWithTrailing.length > MAX_PARAGRAPH_CHARS,
      normalizedText: normalizedText
    };
  });
}
function splitChunkByLength() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var maxLen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : API_RECHUNK_MIN_CHARS;
  var safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  var hardMax = Math.max(120, Number(maxLen) || API_RECHUNK_MIN_CHARS);
  var chunks = [];
  var cursor = 0;
  while (cursor < safeText.length) {
    var end = Math.min(cursor + hardMax, safeText.length);
    if (end < safeText.length) {
      var windowStart = Math.max(cursor + 80, cursor);
      var windowText = safeText.slice(windowStart, end);
      var breakMatch = /([!\.:;\?][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|,[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+)(?!(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*([!\.:;\?][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|,[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+))/.exec(windowText);
      if (breakMatch && typeof breakMatch.index === "number") {
        end = windowStart + breakMatch.index + breakMatch[0].length;
      }
    }
    if (end <= cursor) {
      end = Math.min(cursor + hardMax, safeText.length);
    }
    chunks.push({
      index: chunks.length,
      start: cursor,
      end: end,
      length: end - cursor,
      text: safeText.slice(cursor, end),
      trailing: "",
      tooLong: end - cursor > MAX_PARAGRAPH_CHARS
    });
    cursor = end;
  }
  return chunks;
}
function hashTextForCooldownKey() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var hash = 0;
  for (var i = 0; i < value.length; i++) {
    hash = hash * 31 + value.charCodeAt(i) >>> 0;
  }
  return hash.toString(36);
}
function buildChunkFailureKey(paragraphIndex) {
  var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var safeParagraph = Number.isFinite(paragraphIndex) ? paragraphIndex : -1;
  var safeText = typeof text === "string" ? text : "";
  return "".concat(safeParagraph, ":").concat(safeText.length, ":").concat(hashTextForCooldownKey(safeText));
}
function pruneExpiredChunkFailureCooldowns(cooldownMap) {
  if (!cooldownMap || typeof cooldownMap.forEach !== "function") return;
  var now = Date.now();
  var _iterator6 = _createForOfIteratorHelper(cooldownMap.entries()),
    _step6;
  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var _step6$value = _slicedToArray(_step6.value, 2),
        key = _step6$value[0],
        until = _step6$value[1];
      if (!Number.isFinite(until) || until <= now) {
        cooldownMap.delete(key);
      }
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
}
function splitParagraphIntoChunks() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var maxLen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_PARAGRAPH_CHARS;
  var _ref10 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
    _ref10$preferWholePar = _ref10.preferWholeParagraph,
    preferWholeParagraph = _ref10$preferWholePar === void 0 ? true : _ref10$preferWholePar,
    _ref10$conservativePa = _ref10.conservativePack,
    conservativePack = _ref10$conservativePa === void 0 ? false : _ref10$conservativePa;
  var safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  // For normal-sized paragraphs, keep full context in a single API call.
  // This avoids sentence splitter artifacts around abbreviations like "K. M.".
  if (preferWholeParagraph && safeText.length <= maxLen) {
    return [{
      index: 0,
      start: 0,
      end: safeText.length,
      length: safeText.length,
      text: safeText,
      trailing: "",
      tooLong: false
    }];
  }
  var placeholder = "\uE000";
  var protectDots = function protectDots(input, regex) {
    return input.replace(regex, function (match) {
      return match.replace(/\./g, placeholder);
    });
  };
  // Protect dots in common abbreviation/date forms so sentence splitting
  // doesn't break chunks like "K. M." or "25. 3. 2008".
  var protectedText = safeText;
  protectedText = protectDots(protectedText, /\b(?:(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*){2,}/g);
  protectedText = protectDots(protectedText, /\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g);
  protectedText = protectDots(protectedText, /\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|go[s\u017F]|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|[s\u017F]ep|o[k\u212A]t|nov|dec)\./gi);
  protectedText = protectDots(protectedText, /\b(?:d\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*o\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*o\.|d\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*d\.|[s\u017F]\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*p\.|d\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*n\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*o\.|[k\u212A]\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*d\.)/gi);
  var sentences = [];
  var start = 0;
  var sentenceLeadClosers = /[\])"'Â»â€â€™]/;
  var lowerLetter = /(?:[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0296-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1C8A\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5F\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C1\uA7C3\uA7C8\uA7CA\uA7CD\uA7CF\uA7D1\uA7D3\uA7D5\uA7D7\uA7D9\uA7DB\uA7F6\uA7FA\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC]|\uD803[\uDCC0-\uDCF2\uDD70-\uDD85]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F\uDEBB-\uDED3]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD837[\uDF00-\uDF09\uDF0B-\uDF1E\uDF25-\uDF2A]|\uD83A[\uDD22-\uDD43])/;
  var upperLetter = /(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C89\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2F\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C0\uA7C2\uA7C4-\uA7C7\uA7C9\uA7CB\uA7CC\uA7CE\uA7D0\uA7D2\uA7D4\uA7D6\uA7D8\uA7DA\uA7DC\uA7F5\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95]|\uD803[\uDC80-\uDCB2\uDD50-\uDD65]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F\uDEA0-\uDEB8]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21])/;
  var letterOrDigit = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])/;
  var pushSentence = function pushSentence(contentEnd) {
    var gapEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : contentEnd;
    if (typeof contentEnd !== "number" || contentEnd <= start) {
      var _ref11;
      start = Math.max(start, (_ref11 = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd) !== null && _ref11 !== void 0 ? _ref11 : start);
      return;
    }
    sentences.push({
      start: start,
      end: contentEnd,
      gapEnd: gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd
    });
    start = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd;
  };
  var readPrevToken = function readPrevToken(dotIndex) {
    var end = dotIndex;
    while (end > 0 && /\s/.test(protectedText[end - 1])) end--;
    var tokenStart = end;
    while (tokenStart > 0 && letterOrDigit.test(protectedText[tokenStart - 1])) tokenStart--;
    return protectedText.slice(tokenStart, end);
  };
  var nextNonSpaceIndex = function nextNonSpaceIndex(fromIndex) {
    var idx = fromIndex;
    while (idx < protectedText.length && /\s/.test(protectedText[idx])) idx++;
    return idx;
  };
  var shouldSplitOnDot = function shouldSplitOnDot(dotIndex) {
    var prevToken = readPrevToken(dotIndex);
    var isShortLowerAbbrev = prevToken.length > 0 && prevToken.length <= 3 && !upperLetter.test(prevToken) && lowerLetter.test(prevToken);
    if (isShortLowerAbbrev) return false;
    var idx = nextNonSpaceIndex(dotIndex + 1);
    while (idx < protectedText.length && sentenceLeadClosers.test(protectedText[idx])) idx++;
    if (idx >= protectedText.length) return true;
    return upperLetter.test(protectedText[idx]);
  };
  for (var i = 0; i < protectedText.length; i++) {
    var ch = protectedText[i];
    if (ch === "\n") {
      pushSentence(i + 1, i + 1);
      continue;
    }
    if (/[.!?]/.test(ch)) {
      if (ch === "." && !shouldSplitOnDot(i)) {
        continue;
      }
      var contentEnd = i + 1;
      while (contentEnd < protectedText.length && /[\])"'»”’]+/.test(protectedText[contentEnd])) {
        contentEnd++;
      }
      var gapEnd = contentEnd;
      while (gapEnd < protectedText.length && /\s/.test(protectedText[gapEnd])) {
        gapEnd++;
      }
      pushSentence(contentEnd, gapEnd);
      i = gapEnd - 1;
    }
  }
  if (start < protectedText.length) {
    sentences.push({
      start: start,
      end: protectedText.length,
      gapEnd: protectedText.length
    });
  }
  var mergedSentences = [];
  for (var _i2 = 0, _sentences = sentences; _i2 < _sentences.length; _i2++) {
    var _sentence$end, _sentence$start;
    var sentence = _sentences[_i2];
    var sentenceLen = Math.max(0, ((_sentence$end = sentence.end) !== null && _sentence$end !== void 0 ? _sentence$end : 0) - ((_sentence$start = sentence.start) !== null && _sentence$start !== void 0 ? _sentence$start : 0));
    var previous = mergedSentences[mergedSentences.length - 1];
    // Merge tiny fragments like "3." / "M." into previous chunk to avoid extra API calls.
    if (previous && sentenceLen > 0 && sentenceLen < MIN_CHUNK_MERGE_CHARS && sentence.end > previous.end && sentence.end - previous.start <= maxLen) {
      var _sentence$gapEnd;
      previous.end = sentence.end;
      previous.gapEnd = (_sentence$gapEnd = sentence.gapEnd) !== null && _sentence$gapEnd !== void 0 ? _sentence$gapEnd : sentence.end;
      continue;
    }
    mergedSentences.push(_objectSpread({}, sentence));
  }
  var sentenceUnits = conservativePack ? packLemmaSentenceUnits(mergedSentences, maxLen) : mergedSentences;
  return sentenceUnits.map(function (sentence, index) {
    var _sentence$gapEnd2;
    var gapEnd = (_sentence$gapEnd2 = sentence.gapEnd) !== null && _sentence$gapEnd2 !== void 0 ? _sentence$gapEnd2 : sentence.end;
    var length = sentence.end - sentence.start;
    return {
      index: index,
      start: sentence.start,
      end: sentence.end,
      length: length,
      text: safeText.slice(sentence.start, sentence.end).replace(new RegExp(placeholder, "g"), "."),
      trailing: safeText.slice(sentence.end, gapEnd),
      tooLong: length > maxLen
    };
  });
}
function splitParagraphIntoChunksWithLemmas() {
  return _splitParagraphIntoChunksWithLemmas.apply(this, arguments);
}
function _splitParagraphIntoChunksWithLemmas() {
  _splitParagraphIntoChunksWithLemmas = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var text,
      maxLen,
      anchorProvider,
      safeText,
      mode,
      lemmaTokens,
      splitTokens,
      reconstructedConfidence,
      usedReconstructedOffsets,
      nativeQuality,
      useNativeOffsetsAuthoritatively,
      reconstructed,
      chunks,
      lowAnchorReliability,
      _args3 = arguments,
      _t8;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          text = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : "";
          maxLen = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : MAX_PARAGRAPH_CHARS;
          anchorProvider = _args3.length > 2 ? _args3[2] : undefined;
          safeText = typeof text === "string" ? text : "";
          if (safeText) {
            _context3.n = 1;
            break;
          }
          return _context3.a(2, null);
        case 1:
          if (!(!anchorProvider || typeof anchorProvider.fetchLemmaTokens !== "function")) {
            _context3.n = 2;
            break;
          }
          return _context3.a(2, null);
        case 2:
          mode = resolveLemmaSplitMode();
          if (!(mode === "off")) {
            _context3.n = 3;
            break;
          }
          return _context3.a(2, null);
        case 3:
          if (!(mode !== "force" && !shouldUseLemmaSplitHeuristic(safeText, maxLen))) {
            _context3.n = 4;
            break;
          }
          if (isDeepDebugEnabled()) {
            console.log("[Vejice Split]", "lemma split skipped by heuristic", {
              mode: mode,
              length: safeText.length
            });
          }
          return _context3.a(2, null);
        case 4:
          _context3.p = 4;
          _context3.n = 5;
          return anchorProvider.fetchLemmaTokens(safeText);
        case 5:
          lemmaTokens = _context3.v;
          splitTokens = lemmaTokens;
          reconstructedConfidence = 1;
          usedReconstructedOffsets = false;
          nativeQuality = evaluateLemmaOffsetsQuality(safeText, lemmaTokens);
          useNativeOffsetsAuthoritatively = nativeQuality.coverage >= LEMMA_SPLIT_CONFIDENCE_THRESHOLD;
          if (useNativeOffsetsAuthoritatively) {
            _context3.n = 7;
            break;
          }
          reconstructed = reconstructLemmaOffsets(safeText, lemmaTokens);
          reconstructedConfidence = reconstructed.confidence;
          if (!(mode === "safe" && reconstructed.confidence < LEMMA_SPLIT_CONFIDENCE_THRESHOLD)) {
            _context3.n = 6;
            break;
          }
          if (isDeepDebugEnabled()) {
            console.log("[Vejice Split]", "lemma split fallback -> low reconstruction confidence", reconstructed);
          }
          return _context3.a(2, null);
        case 6:
          if (reconstructed.tokens.length) {
            splitTokens = reconstructed.tokens;
            usedReconstructedOffsets = true;
          }
          if (isDeepDebugEnabled()) {
            console.log("[Vejice Split]", "reconstructed lemma offsets", {
              mode: mode,
              nativeCoverage: nativeQuality.coverage,
              reconstructedConfidence: reconstructed.confidence,
              tokenCount: splitTokens.length
            });
          }
          _context3.n = 8;
          break;
        case 7:
          if (isDeepDebugEnabled()) {
            console.log("[Vejice Split]", "native lemma offsets authoritative", nativeQuality);
          }
        case 8:
          chunks = buildChunksFromLemmaTokens(safeText, splitTokens, maxLen);
          if (!(!Array.isArray(chunks) || !chunks.length)) {
            _context3.n = 9;
            break;
          }
          return _context3.a(2, null);
        case 9:
          lowAnchorReliability = !useNativeOffsetsAuthoritatively || usedReconstructedOffsets;
          return _context3.a(2, chunks.map(function (chunk) {
            return _objectSpread(_objectSpread({}, chunk), {}, {
              lowAnchorReliability: lowAnchorReliability,
              lemmaNativeCoverage: nativeQuality.coverage,
              lemmaReconstructedConfidence: reconstructedConfidence,
              lemmaNativeAuthoritative: useNativeOffsetsAuthoritatively
            });
          }));
        case 10:
          _context3.p = 10;
          _t8 = _context3.v;
          return _context3.a(2, null);
      }
    }, _callee3, null, [[4, 10]]);
  }));
  return _splitParagraphIntoChunksWithLemmas.apply(this, arguments);
}
function resolveLemmaSplitMode() {
  var _process$env;
  var windowMode = typeof window !== "undefined" && typeof window.__VEJICE_LEMMA_SPLIT_MODE === "string" ? window.__VEJICE_LEMMA_SPLIT_MODE.trim().toLowerCase() : "";
  if (windowMode === "off" || windowMode === "safe" || windowMode === "force") {
    return windowMode;
  }
  var envMode = typeof process !== "undefined" && typeof ((_process$env = process.env) === null || _process$env === void 0 ? void 0 : _process$env.VEJICE_LEMMA_SPLIT_MODE) === "string" ? process.env.VEJICE_LEMMA_SPLIT_MODE.trim().toLowerCase() : "";
  if (envMode === "off" || envMode === "safe" || envMode === "force") {
    return envMode;
  }
  return "safe";
}
function shouldUseLemmaSplitHeuristic() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var maxLen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_PARAGRAPH_CHARS;
  var safeText = typeof text === "string" ? text : "";
  if (!safeText) return false;
  if (safeText.length >= Math.min(maxLen, LEMMA_HEURISTIC_MIN_LEN)) return true;
  var initialAbbrevHits = countMatches(/\b(?:(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])\.[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*){2,}/g, safeText);
  if (initialAbbrevHits >= 1) return true;
  var dateHits = countMatches(/\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g, safeText);
  if (dateHits >= 1) return true;
  var commonAbbrevHits = countMatches(/\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|go[s\u017F]|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|[s\u017F]ep|o[k\u212A]t|nov|dec)\./gi, safeText);
  if (commonAbbrevHits >= 2) return true;
  return false;
}
function countMatches(regex, text) {
  if (!(regex instanceof RegExp) || typeof text !== "string" || !text) return 0;
  var flags = regex.flags.includes("g") ? regex.flags : "".concat(regex.flags, "g");
  var pattern = new RegExp(regex.source, flags);
  var count = 0;
  while (pattern.exec(text)) {
    count++;
    if (count > 1000) break;
  }
  return count;
}
function evaluateLemmaOffsetsQuality(text, tokens) {
  var safeText = typeof text === "string" ? text : "";
  var eligible = Array.isArray(tokens) ? tokens.filter(function (token) {
    return typeof (token === null || token === void 0 ? void 0 : token.text) === "string" && token.text.trim();
  }).length : 0;
  var valid = Array.isArray(tokens) ? tokens.filter(function (token) {
    return typeof (token === null || token === void 0 ? void 0 : token.start) === "number" && typeof (token === null || token === void 0 ? void 0 : token.end) === "number" && token.start >= 0 && token.end > token.start && token.end <= safeText.length;
  }).length : 0;
  return {
    eligible: eligible,
    valid: valid,
    coverage: eligible > 0 ? valid / eligible : 0
  };
}
function reconstructLemmaOffsets() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var tokens = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var safeText = typeof text === "string" ? text : "";
  if (!Array.isArray(tokens) || !tokens.length || !safeText) {
    return {
      tokens: [],
      confidence: 0,
      mapped: 0,
      eligible: 0
    };
  }
  var cursor = 0;
  var mapped = 0;
  var eligible = 0;
  var reconstructed = tokens.map(function (token) {
    if (!token || _typeof(token) !== "object") return token;
    var tokenText = typeof token.text === "string" ? token.text : "";
    if (!tokenText.trim()) return token;
    eligible++;
    var hasNativeOffsets = typeof token.start === "number" && typeof token.end === "number" && token.start >= 0 && token.end > token.start && token.end <= safeText.length;
    if (hasNativeOffsets && token.start >= cursor) {
      cursor = token.end;
      mapped++;
      return token;
    }
    var exactIndex = safeText.indexOf(tokenText, cursor);
    if (exactIndex >= 0) {
      mapped++;
      cursor = exactIndex + tokenText.length;
      return _objectSpread(_objectSpread({}, token), {}, {
        start: exactIndex,
        end: exactIndex + tokenText.length
      });
    }
    var normalized = tokenText.replace(/^(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+|(?:[\0-\/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u055F\u0589-\u05CF\u05EB-\u05EE\u05F3-\u061F\u064B-\u066D\u0670\u06D4\u06D6-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0711\u0730-\u074C\u07A6-\u07B0\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u083F\u0859-\u085F\u086B-\u086F\u0888\u0890-\u089F\u08CA-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0970\u0981-\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09BE-\u09CD\u09CF-\u09DB\u09DE\u09E2-\u09EF\u09F2-\u09FB\u09FD-\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A58\u0A5D\u0A5F-\u0A71\u0A75-\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0ABE-\u0ACF\u0AD1-\u0ADF\u0AE2-\u0AF8\u0AFA-\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B3E-\u0B5B\u0B5E\u0B62-\u0B70\u0B72-\u0B82\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BCF\u0BD1-\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C3E-\u0C57\u0C5B\u0C5E\u0C5F\u0C62-\u0C7F\u0C81-\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CBE-\u0CDB\u0CDF\u0CE2-\u0CF0\u0CF3-\u0D03\u0D0D\u0D11\u0D3B\u0D3C\u0D3E-\u0D4D\u0D4F-\u0D53\u0D57-\u0D5E\u0D62-\u0D79\u0D80-\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0E00\u0E31\u0E34-\u0E3F\u0E47-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EB1\u0EB4-\u0EBC\u0EBE\u0EBF\u0EC5\u0EC7-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F87\u0F8D-\u0FFF\u102B-\u103E\u1040-\u104F\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16F0\u16F9-\u16FF\u1712-\u171E\u1732-\u173F\u1752-\u175F\u176D\u1771-\u177F\u17B4-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1879-\u187F\u1885\u1886\u18A9\u18AB-\u18AF\u18F6-\u18FF\u191F-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A17-\u1A1F\u1A55-\u1AA6\u1AA8-\u1B04\u1B34-\u1B44\u1B4D-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BFF\u1C24-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C8B-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1CFB-\u1CFF\u1DC0-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u2182\u2185-\u2BFF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF-\u2E2E\u2E30-\u3004\u3007-\u3030\u3036-\u303A\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA67E\uA69E\uA69F\uA6E6-\uA716\uA720\uA721\uA789\uA78A\uA7DD-\uA7F0\uA802\uA806\uA80B\uA823-\uA83F\uA874-\uA881\uA8B4-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FF-\uA909\uA926-\uA92F\uA947-\uA95F\uA97D-\uA983\uA9B3-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA29-\uAA3F\uAA43\uAA4C-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAEB-\uAAF1\uAAF5-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABE3-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB1E\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEFF\uDF20-\uDF2C\uDF41\uDF4A-\uDF4F\uDF76-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0-\uDFFF]|\uD801[\uDC9E-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6F\uDD7B\uDD8B\uDD93\uDD96\uDDA2\uDDB2\uDDBA\uDDBD-\uDDBF\uDDF4-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDF7F\uDF86\uDFB1\uDFBB-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD3F\uDD5A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE01-\uDE0F\uDE14\uDE18\uDE36-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE5-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD24-\uDD49\uDD66-\uDD6E\uDD86-\uDE7F\uDEAA-\uDEAF\uDEB2-\uDEC1\uDEC8-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF46-\uDF6F\uDF82-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC00-\uDC02\uDC38-\uDC70\uDC73\uDC74\uDC76-\uDC82\uDCB0-\uDCCF\uDCE9-\uDD02\uDD27-\uDD43\uDD45\uDD46\uDD48-\uDD4F\uDD73-\uDD75\uDD77-\uDD82\uDDB3-\uDDC0\uDDC5-\uDDD9\uDDDB\uDDDD-\uDDFF\uDE12\uDE2C-\uDE3E\uDE41-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEDF-\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A-\uDF3C\uDF3E-\uDF4F\uDF51-\uDF5C\uDF62-\uDF7F\uDF8A\uDF8C\uDF8D\uDF8F\uDFB6\uDFB8-\uDFD0\uDFD2\uDFD4-\uDFFF]|\uD805[\uDC35-\uDC46\uDC4B-\uDC5E\uDC62-\uDC7F\uDCB0-\uDCC3\uDCC6\uDCC8-\uDD7F\uDDAF-\uDDD7\uDDDC-\uDDFF\uDE30-\uDE43\uDE45-\uDE7F\uDEAB-\uDEB7\uDEB9-\uDEFF\uDF1B-\uDF3F\uDF47-\uDFFF]|\uD806[\uDC2C-\uDC9F\uDCE0-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD30-\uDD3E\uDD40\uDD42-\uDD9F\uDDA8\uDDA9\uDDD1-\uDDE0\uDDE2\uDDE4-\uDDFF\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE4F\uDE51-\uDE5B\uDE8A-\uDE9C\uDE9E-\uDEAF\uDEF9-\uDFBF\uDFE1-\uDFFF]|\uD807[\uDC09\uDC2F-\uDC3F\uDC41-\uDC71\uDC90-\uDCFF\uDD07\uDD0A\uDD31-\uDD45\uDD47-\uDD5F\uDD66\uDD69\uDD8A-\uDD97\uDD99-\uDDAF\uDDDC-\uDEDF\uDEF3-\uDF01\uDF03\uDF11\uDF34-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC00-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD812-\uD817\uD819\uD824-\uD82A\uD82D\uD82E\uD830-\uD834\uD836\uD83C-\uD83F\uD87C\uD87D\uD87F\uD88E-\uDBFF][\uDC00-\uDFFF]|\uD80B[\uDC00-\uDF8F\uDFF1-\uDFFF]|\uD80D[\uDC30-\uDC40\uDC47-\uDC5F]|\uD810[\uDFFB-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD818[\uDC00-\uDCFF\uDD1E-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F-\uDE6F\uDEBF-\uDECF\uDEEE-\uDEFF\uDF30-\uDF3F\uDF44-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDD3F\uDD6D-\uDE3F\uDE80-\uDE9F\uDEB9\uDEBA\uDED4-\uDEFF\uDF4B-\uDF4F\uDF51-\uDF92\uDFA0-\uDFDF\uDFE2\uDFE4-\uDFF1\uDFF4-\uDFFF]|\uD823[\uDCD6-\uDCFE\uDD1F-\uDD7F\uDDF3-\uDFFF]|\uD82B[\uDC00-\uDFEF\uDFF4\uDFFC\uDFFF]|\uD82C[\uDD23-\uDD31\uDD33-\uDD4F\uDD53\uDD54\uDD56-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC-\uDFFF]|\uD837[\uDC00-\uDEFF\uDF1F-\uDF24\uDF2B-\uDFFF]|\uD838[\uDC00-\uDC2F\uDC6E-\uDCFF\uDD2D-\uDD36\uDD3E-\uDD4D\uDD4F-\uDE8F\uDEAE-\uDEBF\uDEEC-\uDFFF]|\uD839[\uDC00-\uDCCF\uDCEC-\uDDCF\uDDEE\uDDEF\uDDF1-\uDEBF\uDEDF\uDEE3\uDEE6\uDEEE\uDEEF\uDEF5-\uDEFD\uDF00-\uDFDF\uDFE7\uDFEC\uDFEF\uDFFF]|\uD83A[\uDCC5-\uDCFF\uDD44-\uDD4A\uDD4C-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD869[\uDEE0-\uDEFF]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEAE\uDEAF]|\uD87A[\uDFE1-\uDFEF]|\uD87B[\uDE5E-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDF4F]|\uD88D[\uDC7A-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+$/g, "");
    if (!normalized) return token;
    var escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var regex = new RegExp("(^|[^\\p{L}\\d])(".concat(escaped, ")(?=$|[^\\p{L}\\d])"), "giu");
    var slice = safeText.slice(cursor);
    var match = regex.exec(slice);
    if (!match) return token;
    var relIndex = match.index + (match[1] ? match[1].length : 0);
    var start = cursor + relIndex;
    var end = start + match[2].length;
    mapped++;
    cursor = end;
    return _objectSpread(_objectSpread({}, token), {}, {
      start: start,
      end: end
    });
  });
  var confidence = eligible > 0 ? mapped / eligible : 0;
  return {
    tokens: reconstructed,
    confidence: confidence,
    mapped: mapped,
    eligible: eligible
  };
}
function buildChunksFromLemmaTokens() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var lemmaTokens = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var maxLen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX_PARAGRAPH_CHARS;
  if (!Array.isArray(lemmaTokens) || !lemmaTokens.length) return null;
  var tokens = lemmaTokens.filter(function (token) {
    return token && typeof token.start === "number" && typeof token.end === "number" && token.start >= 0 && token.end > token.start && token.end <= text.length;
  }).sort(function (a, b) {
    return a.start - b.start;
  });
  if (!tokens.length) return null;
  var sentences = [];
  var sentenceStart = 0;
  var closerRegex = /[\])"'»”’]/;
  var pushSentence = function pushSentence(contentEnd) {
    var gapEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : contentEnd;
    if (typeof contentEnd !== "number" || contentEnd <= sentenceStart) {
      var _ref12;
      sentenceStart = Math.max(sentenceStart, (_ref12 = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd) !== null && _ref12 !== void 0 ? _ref12 : sentenceStart);
      return;
    }
    sentences.push({
      start: sentenceStart,
      end: contentEnd,
      gapEnd: gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd
    });
    sentenceStart = gapEnd !== null && gapEnd !== void 0 ? gapEnd : contentEnd;
  };
  for (var i = 0; i < tokens.length; i++) {
    var current = tokens[i];
    var next = tokens[i + 1] || null;
    if (!isSentenceBoundaryToken(current, next)) continue;
    var contentEnd = current.end;
    while (contentEnd < text.length && closerRegex.test(text[contentEnd])) contentEnd++;
    var gapEnd = contentEnd;
    while (gapEnd < text.length && /\s/.test(text[gapEnd])) gapEnd++;
    pushSentence(contentEnd, gapEnd);
  }
  if (sentenceStart < text.length) {
    sentences.push({
      start: sentenceStart,
      end: text.length,
      gapEnd: text.length
    });
  }
  var mergedSentences = [];
  for (var _i3 = 0, _sentences2 = sentences; _i3 < _sentences2.length; _i3++) {
    var _sentence$end2, _sentence$start2;
    var sentence = _sentences2[_i3];
    var sentenceLen = Math.max(0, ((_sentence$end2 = sentence.end) !== null && _sentence$end2 !== void 0 ? _sentence$end2 : 0) - ((_sentence$start2 = sentence.start) !== null && _sentence$start2 !== void 0 ? _sentence$start2 : 0));
    var previous = mergedSentences[mergedSentences.length - 1];
    if (previous && sentenceLen > 0 && sentenceLen < MIN_CHUNK_MERGE_CHARS && sentence.end > previous.end && sentence.end - previous.start <= maxLen) {
      var _sentence$gapEnd3;
      previous.end = sentence.end;
      previous.gapEnd = (_sentence$gapEnd3 = sentence.gapEnd) !== null && _sentence$gapEnd3 !== void 0 ? _sentence$gapEnd3 : sentence.end;
      continue;
    }
    mergedSentences.push(_objectSpread({}, sentence));
  }
  var expandedUnits = [];
  for (var _i4 = 0, _mergedSentences = mergedSentences; _i4 < _mergedSentences.length; _i4++) {
    var unit = _mergedSentences[_i4];
    var parts = splitLargeLemmaUnit(text, unit, maxLen);
    if (parts && parts.length) {
      expandedUnits.push.apply(expandedUnits, _toConsumableArray(parts));
    } else {
      expandedUnits.push(unit);
    }
  }
  var packedUnits = packLemmaSentenceUnits(expandedUnits, maxLen);
  return packedUnits.map(function (sentence, index) {
    var _sentence$gapEnd4;
    var gapEnd = (_sentence$gapEnd4 = sentence.gapEnd) !== null && _sentence$gapEnd4 !== void 0 ? _sentence$gapEnd4 : sentence.end;
    var length = sentence.end - sentence.start;
    return {
      index: index,
      start: sentence.start,
      end: sentence.end,
      length: length,
      text: text.slice(sentence.start, sentence.end),
      trailing: text.slice(sentence.end, gapEnd),
      tooLong: length > maxLen
    };
  });
}
function splitLargeLemmaUnit(text, unit, maxLen) {
  var _unit$end, _unit$start;
  if (!unit) return null;
  var hardCap = Math.max(LEMMA_CHUNK_TARGET_CHARS, Math.min(maxLen, LEMMA_CHUNK_SOFT_MAX_CHARS));
  var unitLength = Math.max(0, ((_unit$end = unit.end) !== null && _unit$end !== void 0 ? _unit$end : 0) - ((_unit$start = unit.start) !== null && _unit$start !== void 0 ? _unit$start : 0));
  if (unitLength <= hardCap) return [unit];
  var segments = [];
  var cursor = unit.start;
  var absoluteEnd = unit.end;
  while (absoluteEnd - cursor > hardCap) {
    var target = cursor + hardCap;
    var minSplit = Math.min(absoluteEnd - 1, cursor + LEMMA_MIN_SEGMENT_CHARS);
    var maxSplit = Math.min(absoluteEnd - 1, target + LEMMA_SPLIT_WINDOW_CHARS);
    var splitAt = -1;
    for (var i = target; i <= maxSplit; i++) {
      var ch = text[i];
      if (ch === "," || ch === ";" || ch === ":") {
        splitAt = i + 1;
        break;
      }
    }
    if (splitAt < 0) {
      for (var _i5 = Math.max(minSplit, target - LEMMA_SPLIT_WINDOW_CHARS); _i5 >= minSplit; _i5--) {
        var _ch = text[_i5];
        if (_ch === "," || _ch === ";" || _ch === ":") {
          splitAt = _i5 + 1;
          break;
        }
      }
    }
    if (splitAt < 0) {
      for (var _i6 = target; _i6 <= maxSplit; _i6++) {
        if (/\s/.test(text[_i6] || "")) {
          splitAt = _i6 + 1;
          break;
        }
      }
    }
    if (splitAt < 0) {
      splitAt = Math.min(absoluteEnd, target);
    }
    if (splitAt <= minSplit) {
      splitAt = Math.min(absoluteEnd, cursor + hardCap);
    }
    var gapEnd = splitAt;
    while (gapEnd < absoluteEnd && /\s/.test(text[gapEnd] || "")) gapEnd++;
    segments.push({
      start: cursor,
      end: splitAt,
      gapEnd: gapEnd
    });
    cursor = gapEnd;
    if (cursor >= absoluteEnd) break;
  }
  if (cursor < absoluteEnd) {
    var _unit$gapEnd;
    segments.push({
      start: cursor,
      end: absoluteEnd,
      gapEnd: (_unit$gapEnd = unit.gapEnd) !== null && _unit$gapEnd !== void 0 ? _unit$gapEnd : absoluteEnd
    });
  }
  return segments.filter(function (seg) {
    return seg.end > seg.start;
  });
}
function packLemmaSentenceUnits(units, maxLen) {
  if (!Array.isArray(units) || !units.length) return [];
  var hardCap = Math.max(LEMMA_CHUNK_TARGET_CHARS, Math.min(maxLen, LEMMA_CHUNK_SOFT_MAX_CHARS));
  var packed = [];
  var current = null;
  var unitCount = 0;
  var pushCurrent = function pushCurrent() {
    if (!current) return;
    packed.push(current);
    current = null;
    unitCount = 0;
  };
  var _iterator7 = _createForOfIteratorHelper(units),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var _unit$end2, _current$start, _current$end, _current$start2, _unit$end3, _unit$start2;
      var unit = _step7.value;
      if (!current) {
        current = _objectSpread({}, unit);
        unitCount = 1;
        continue;
      }
      var candidateLen = ((_unit$end2 = unit.end) !== null && _unit$end2 !== void 0 ? _unit$end2 : 0) - ((_current$start = current.start) !== null && _current$start !== void 0 ? _current$start : 0);
      var currentLen = ((_current$end = current.end) !== null && _current$end !== void 0 ? _current$end : 0) - ((_current$start2 = current.start) !== null && _current$start2 !== void 0 ? _current$start2 : 0);
      var unitLen = ((_unit$end3 = unit.end) !== null && _unit$end3 !== void 0 ? _unit$end3 : 0) - ((_unit$start2 = unit.start) !== null && _unit$start2 !== void 0 ? _unit$start2 : 0);
      var canMerge = unitCount < LEMMA_CHUNK_MAX_UNITS && candidateLen <= maxLen && candidateLen <= hardCap && (currentLen < LEMMA_CHUNK_TARGET_CHARS || unitLen < 180);
      if (canMerge) {
        var _unit$gapEnd2;
        current.end = unit.end;
        current.gapEnd = (_unit$gapEnd2 = unit.gapEnd) !== null && _unit$gapEnd2 !== void 0 ? _unit$gapEnd2 : unit.end;
        unitCount++;
        continue;
      }
      pushCurrent();
      current = _objectSpread({}, unit);
      unitCount = 1;
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
  pushCurrent();
  return packed;
}
function isSentenceBoundaryToken(currentToken, nextToken) {
  var raw = typeof (currentToken === null || currentToken === void 0 ? void 0 : currentToken.text) === "string" ? currentToken.text : "";
  var trimmed = raw.trim();
  if (!trimmed) return false;
  var pos = typeof (currentToken === null || currentToken === void 0 ? void 0 : currentToken.pos) === "string" ? currentToken.pos.toUpperCase() : "";

  // Prefer explicit punctuation tokens when the lemmatizer provides POS tags.
  if (pos === "PUNC" || pos === "PUNCT") {
    if (trimmed === "?" || trimmed === "!") return true;
    if (trimmed === ".") {
      if (!nextToken || typeof nextToken.text !== "string") return true;
      var _nextText = nextToken.text.trim();
      var _first = _nextText ? _nextText[0] : "";
      if (!_first) return true;
      return /(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C89\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2F\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C0\uA7C2\uA7C4-\uA7C7\uA7C9\uA7CB\uA7CC\uA7CE\uA7D0\uA7D2\uA7D4\uA7D6\uA7D8\uA7DA\uA7DC\uA7F5\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95]|\uD803[\uDC80-\uDCB2\uDD50-\uDD65]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F\uDEA0-\uDEB8]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21])/.test(_first);
    }
  }
  var withoutClosers = trimmed.replace(/[\])"'»”’]+$/g, "");
  var endChar = withoutClosers.slice(-1);
  if (!/[.!?]/.test(endChar)) return false;
  if (endChar === "?" || endChar === "!") return true;
  var base = withoutClosers.replace(/[.!?]+$/g, "").trim();
  var shortLowerAbbrev = base.length > 0 && base.length <= 3 && /(?:[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0296-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1C8A\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5F\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C1\uA7C3\uA7C8\uA7CA\uA7CD\uA7CF\uA7D1\uA7D3\uA7D5\uA7D7\uA7D9\uA7DB\uA7F6\uA7FA\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC]|\uD803[\uDCC0-\uDCF2\uDD70-\uDD85]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F\uDEBB-\uDED3]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD837[\uDF00-\uDF09\uDF0B-\uDF1E\uDF25-\uDF2A]|\uD83A[\uDD22-\uDD43])/.test(base) && !/(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C89\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2F\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C0\uA7C2\uA7C4-\uA7C7\uA7C9\uA7CB\uA7CC\uA7CE\uA7D0\uA7D2\uA7D4\uA7D6\uA7D8\uA7DA\uA7DC\uA7F5\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95]|\uD803[\uDC80-\uDCB2\uDD50-\uDD65]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F\uDEA0-\uDEB8]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21])/.test(base);
  if (shortLowerAbbrev) return false;
  if (!nextToken || typeof nextToken.text !== "string") return true;
  var nextText = nextToken.text.trim();
  var first = nextText ? nextText[0] : "";
  if (!first) return true;
  return /(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C89\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2F\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C0\uA7C2\uA7C4-\uA7C7\uA7C9\uA7CB\uA7CC\uA7CE\uA7D0\uA7D2\uA7D4\uA7D6\uA7D8\uA7DA\uA7DC\uA7F5\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95]|\uD803[\uDC80-\uDCB2\uDD50-\uDD65]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F\uDEA0-\uDEB8]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21])/.test(first);
}
function rekeyTokensInternal(tokens, prefix) {
  if (!Array.isArray(tokens)) {
    return {
      tokens: [],
      map: new Map()
    };
  }
  var idMap = new Map();
  var rekeyed = tokens.map(function (token, idx) {
    if (token && _typeof(token) === "object") {
      var newToken = _objectSpread(_objectSpread({}, token), {}, {
        token_id: "".concat(prefix).concat(idx + 1)
      });
      if (typeof token.token_id === "string") {
        idMap.set(token.token_id, newToken.token_id);
      }
      return newToken;
    }
    return {
      token_id: "".concat(prefix).concat(idx + 1),
      token: typeof token === "string" ? token : ""
    };
  });
  return {
    tokens: rekeyed,
    map: idMap
  };
}
function rekeyTokens(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix).tokens;
}
function rekeyTokensWithMap(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix);
}
function remapCorrections(corrections, idMap) {
  if (!corrections || !(idMap !== null && idMap !== void 0 && idMap.size)) return corrections;
  var remapGroup = function remapGroup(group) {
    var _idMap$get;
    if (!group) return group;
    var remapped = _objectSpread({}, group);
    var mappedStart = (_idMap$get = idMap.get(group.source_start)) !== null && _idMap$get !== void 0 ? _idMap$get : group.source_start;
    remapped.source_start = mappedStart;
    if (Array.isArray(group.corrections)) {
      remapped.corrections = group.corrections.map(function (corr) {
        var _idMap$get2;
        if (!corr) return corr;
        var mappedId = (_idMap$get2 = idMap.get(corr.source_id)) !== null && _idMap$get2 !== void 0 ? _idMap$get2 : corr.source_id;
        return _objectSpread(_objectSpread({}, corr), {}, {
          source_id: mappedId
        });
      });
    }
    return remapped;
  };
  if (Array.isArray(corrections)) {
    return corrections.map(remapGroup);
  }
  if (_typeof(corrections) === "object") {
    var remapped = {};
    for (var _i7 = 0, _Object$entries = Object.entries(corrections); _i7 < _Object$entries.length; _i7++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i7], 2),
        key = _Object$entries$_i[0],
        group = _Object$entries$_i[1];
      remapped[key] = remapGroup(group);
    }
    return remapped;
  }
  return corrections;
}
function correctionsHaveEntries(corrections) {
  if (!corrections) return false;
  if (Array.isArray(corrections)) {
    return corrections.some(function (group) {
      return Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) && group.corrections.length;
    });
  }
  if (_typeof(corrections) === "object") {
    return Object.values(corrections).some(function (group) {
      return Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) && group.corrections.length;
    });
  }
  return false;
}
function collapseDuplicateDiffOps(ops) {
  if (!Array.isArray(ops) || ops.length < 2) return ops;
  var deletePositions = ops.filter(function (op) {
    return (op === null || op === void 0 ? void 0 : op.kind) === "delete";
  }).map(function (op) {
    return typeof op.originalPos === "number" ? op.originalPos : op.pos;
  }).filter(function (pos) {
    return typeof pos === "number";
  });
  if (!deletePositions.length) return ops;
  var shouldDropInsert = function shouldDropInsert(pos) {
    return deletePositions.some(function (delPos) {
      return typeof delPos === "number" && Math.abs(delPos - pos) <= 0;
    });
  };
  return ops.filter(function (op) {
    if ((op === null || op === void 0 ? void 0 : op.kind) !== "insert") return true;
    var pos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    if (typeof pos !== "number") return true;
    return !shouldDropInsert(pos);
  });
}
function isOpConsistentWithTexts(op, originalText, correctedText) {
  if (!op || _typeof(op) !== "object") return false;
  var boundaryTolerance = op !== null && op !== void 0 && op.fromCorrections ? 3 : 0;
  if (op.kind === "delete") {
    var originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid delete must have comma in original and no comma in corrected at this boundary.
    return hasCommaAtOrNearBoundary(originalText, originalPos, boundaryTolerance) && !hasCommaAtOrNearBoundary(correctedText, correctedPos, boundaryTolerance);
  }
  if (op.kind === "insert") {
    var _originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var _correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid insert must have comma in corrected and no comma in original at this boundary.
    return !hasCommaAtOrNearBoundary(originalText, _originalPos, boundaryTolerance) && hasCommaAtOrNearBoundary(correctedText, _correctedPos, boundaryTolerance);
  }
  return true;
}
function hasCommaAtOrNearBoundary(text, pos) {
  var tolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var safeTolerance = Math.max(0, Number.isFinite(tolerance) ? Math.floor(tolerance) : 0);
  for (var delta = -safeTolerance; delta <= safeTolerance; delta++) {
    if (hasCommaAtBoundary(text, pos + delta)) {
      return true;
    }
  }
  return false;
}
function hasCommaAtBoundary(text, pos) {
  if (typeof text !== "string" || !text.length) return false;
  var safePos = Number.isFinite(pos) ? Math.max(0, Math.min(Math.floor(pos), text.length)) : 0;
  var direct = [safePos - 1, safePos, safePos + 1];
  for (var _i8 = 0, _direct = direct; _i8 < _direct.length; _i8++) {
    var idx = _direct[_i8];
    if (idx >= 0 && idx < text.length && text[idx] === ",") {
      return true;
    }
  }
  var left = safePos - 1;
  while (left >= 0 && /\s/.test(text[left])) left--;
  if (left >= 0 && text[left] === ",") return true;
  var right = safePos;
  while (right < text.length && /\s/.test(text[right])) right++;
  if (right < text.length && text[right] === ",") return true;
  return false;
}
function filterCommaOps(original, corrected, ops) {
  return ops.filter(function (op) {
    if ((0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNumericComma)(original, corrected, op.kind, op.pos)) return false;
    if (op.kind === "insert") {
      var next = (0,_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.charAtSafe)(corrected, op.pos + 1);
      var noSpaceAfter = next && !/\s/.test(next);
      if (noSpaceAfter && !_textUtils_js__WEBPACK_IMPORTED_MODULE_1__.QUOTES.has(next)) {
        return true;
      }
    }
    return true;
  });
}
function toBoundedIndex(value, maxLen) {
  if (!Number.isFinite(value)) return undefined;
  var max = Math.max(0, Number.isFinite(maxLen) ? Math.floor(maxLen) : 0);
  var floored = Math.floor(value);
  return Math.max(0, Math.min(floored, max));
}
function normalizeApiCommaOps(rawOps) {
  var originalText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var correctedText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  if (!Array.isArray(rawOps) || !rawOps.length) return [];
  var sourceLen = typeof originalText === "string" ? originalText.length : 0;
  var targetLen = typeof correctedText === "string" ? correctedText.length : 0;
  var normalized = [];
  var seen = new Set();
  var _iterator8 = _createForOfIteratorHelper(rawOps),
    _step8;
  try {
    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
      var raw = _step8.value;
      if (!raw || _typeof(raw) !== "object") continue;
      var kind = raw.kind === "delete" || raw.kind === "insert" ? raw.kind : null;
      if (!kind) continue;
      var originalPos = toBoundedIndex(Number.isFinite(raw.originalPos) ? raw.originalPos : kind === "delete" ? raw.pos : undefined, sourceLen);
      var correctedPos = toBoundedIndex(Number.isFinite(raw.correctedPos) ? raw.correctedPos : kind === "insert" ? raw.pos : undefined, targetLen);
      if (!Number.isFinite(originalPos) && !Number.isFinite(correctedPos)) continue;
      if (!Number.isFinite(originalPos)) originalPos = correctedPos;
      if (!Number.isFinite(correctedPos)) correctedPos = originalPos;
      var pos = kind === "delete" ? originalPos : correctedPos;
      var identity = "".concat(kind, ":").concat(originalPos, ":").concat(correctedPos);
      if (seen.has(identity)) continue;
      seen.add(identity);
      normalized.push(_objectSpread(_objectSpread({}, raw), {}, {
        kind: kind,
        pos: pos,
        originalPos: originalPos,
        correctedPos: correctedPos,
        fromApiCommaOps: true,
        fromCorrections: true,
        viaDiffFallback: false
      }));
    }
  } catch (err) {
    _iterator8.e(err);
  } finally {
    _iterator8.f();
  }
  return collapseDuplicateDiffOps(filterCommaOps(originalText, correctedText, normalized));
}
function findCommaIndexAtBoundary(text, pos) {
  if (typeof text !== "string" || !text.length) return -1;
  var safePos = Number.isFinite(pos) ? Math.max(0, Math.min(Math.floor(pos), text.length)) : 0;
  var direct = [safePos - 1, safePos, safePos + 1];
  for (var _i9 = 0, _direct2 = direct; _i9 < _direct2.length; _i9++) {
    var idx = _direct2[_i9];
    if (idx >= 0 && idx < text.length && text[idx] === ",") {
      return idx;
    }
  }
  var left = safePos - 1;
  while (left >= 0 && /\s/.test(text[left])) left--;
  if (left >= 0 && text[left] === ",") return left;
  var right = safePos;
  while (right < text.length && /\s/.test(text[right])) right++;
  if (right < text.length && text[right] === ",") return right;
  return -1;
}
function buildCommaOnlyCorrectedText() {
  var originalText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var ops = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var base = typeof originalText === "string" ? originalText : "";
  if (!Array.isArray(ops) || !ops.length) return base;
  var normalized = ops.map(function (op) {
    if (!op || _typeof(op) !== "object") return null;
    var kind = op.kind === "insert" || op.kind === "delete" ? op.kind : null;
    if (!kind) return null;
    var originalPos = toBoundedIndex(Number.isFinite(op.originalPos) ? op.originalPos : op.pos, base.length);
    if (!Number.isFinite(originalPos)) return null;
    return {
      kind: kind,
      originalPos: originalPos
    };
  }).filter(Boolean).sort(function (a, b) {
    if (a.originalPos !== b.originalPos) return a.originalPos - b.originalPos;
    // Prefer deletions first so comma moves can be represented as delete+insert at same boundary.
    if (a.kind === b.kind) return 0;
    return a.kind === "delete" ? -1 : 1;
  });
  if (!normalized.length) return base;
  var working = base;
  var delta = 0;
  var _iterator9 = _createForOfIteratorHelper(normalized),
    _step9;
  try {
    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
      var op = _step9.value;
      var targetPos = Math.max(0, Math.min(op.originalPos + delta, working.length));
      if (op.kind === "delete") {
        var commaIndex = findCommaIndexAtBoundary(working, targetPos);
        if (commaIndex < 0) continue;
        working = "".concat(working.slice(0, commaIndex)).concat(working.slice(commaIndex + 1));
        delta -= 1;
        continue;
      }
      if (!hasCommaAtBoundary(working, targetPos)) {
        working = "".concat(working.slice(0, targetPos), ",").concat(working.slice(targetPos));
        delta += 1;
      }
    }
  } catch (err) {
    _iterator9.e(err);
  } finally {
    _iterator9.f();
  }
  return working;
}
function diffCommasOnly(original, corrected) {
  var ops = [];
  var i = 0;
  var j = 0;
  while (i < original.length || j < corrected.length) {
    var _original$i, _corrected$j;
    var o = (_original$i = original[i]) !== null && _original$i !== void 0 ? _original$i : "";
    var c = (_corrected$j = corrected[j]) !== null && _corrected$j !== void 0 ? _corrected$j : "";
    if (o === c) {
      i++;
      j++;
      continue;
    }
    if (c === "," && o !== ",") {
      if (/\s/.test(o)) {
        var relocateIdx = findCommaAfterWhitespace(original, i);
        if (relocateIdx >= 0) {
          i = relocateIdx;
          continue;
        }
      }
      ops.push({
        kind: "insert",
        pos: j,
        originalPos: i,
        correctedPos: j
      });
      j++;
      continue;
    }
    if (o === "," && c !== ",") {
      if (/\s/.test(c)) {
        var _relocateIdx = findCommaAfterWhitespace(corrected, j);
        if (_relocateIdx >= 0) {
          j = _relocateIdx;
          continue;
        }
      }
      ops.push({
        kind: "delete",
        pos: i,
        originalPos: i,
        correctedPos: j
      });
      i++;
      continue;
    }
    if (o) i++;
    if (c) j++;
  }
  return ops;
}
function findCommaAfterWhitespace(text, startIndex) {
  if (typeof text !== "string" || startIndex < 0 || startIndex >= text.length) {
    return -1;
  }
  var idx = startIndex;
  var sawWhitespace = false;
  while (idx < text.length && /\s/.test(text[idx])) {
    sawWhitespace = true;
    idx++;
  }
  if (!sawWhitespace || idx >= text.length) {
    return -1;
  }
  return text[idx] === "," ? idx : -1;
}
function createCorrectionTracking() {
  return {
    tokenIds: new Set(),
    unmatchedTokenIds: new Set(),
    intents: []
  };
}
function stripTrailingCommaAndSpace(text) {
  var safe = typeof text === "string" ? text : "";
  var match = safe.match(TRAILING_COMMA_REGEX);
  var trailing = match ? match[0] : "";
  var base = trailing ? safe.slice(0, -trailing.length) : safe;
  return {
    base: base,
    trailing: trailing,
    hasComma: trailing.includes(",")
  };
}
function analyzeCommaChangeFromCorrections() {
  var originalSegment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var correctedSegment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var orig = stripTrailingCommaAndSpace(originalSegment);
  var corr = stripTrailingCommaAndSpace(correctedSegment);
  if (orig.hasComma === corr.hasComma) return null;
  return {
    removeComma: orig.hasComma && !corr.hasComma,
    addComma: !orig.hasComma && corr.hasComma,
    originalSegment: originalSegment,
    correctedSegment: correctedSegment,
    baseText: orig.base || corr.base
  };
}
function normalizeTokenForComparison(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[.,!?;:“”„'"«»]/g, "").replace(/\s+/g, " ").trim();
}
function collectCommaOpsFromCorrections(detail, anchorsEntry, paragraphIndex, tracking) {
  var _tracking$intents;
  if (!(detail !== null && detail !== void 0 && detail.corrections) || !anchorsEntry) return [];
  var groups = Array.isArray(detail.corrections) ? detail.corrections : _typeof(detail.corrections) === "object" ? Object.values(detail.corrections) : [];
  if (!groups.length) return [];
  var ops = [];
  var seen = new Set();
  var _iterator0 = _createForOfIteratorHelper(groups),
    _step0;
  try {
    for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
      var group = _step0.value;
      var entries = Array.isArray(group === null || group === void 0 ? void 0 : group.corrections) ? group.corrections : [];
      var _iterator10 = _createForOfIteratorHelper(entries),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var _entry$source_id, _anchorsEntry$sourceA, _anchor$tokenText, _anchorsEntry$sourceA3;
          var entry = _step10.value;
          var analysis = analyzeCommaChangeFromCorrections(entry === null || entry === void 0 ? void 0 : entry.source_text, entry === null || entry === void 0 ? void 0 : entry.text);
          if (!analysis) continue;
          var tokenId = (_entry$source_id = entry === null || entry === void 0 ? void 0 : entry.source_id) !== null && _entry$source_id !== void 0 ? _entry$source_id : group === null || group === void 0 ? void 0 : group.source_start;
          if (!tokenId) continue;
          if (tracking !== null && tracking !== void 0 && tracking.tokenIds) {
            tracking.tokenIds.add(tokenId);
          }
          var _anchor = anchorsEntry === null || anchorsEntry === void 0 || (_anchorsEntry$sourceA = anchorsEntry.sourceAnchors) === null || _anchorsEntry$sourceA === void 0 || (_anchorsEntry$sourceA = _anchorsEntry$sourceA.byId) === null || _anchorsEntry$sourceA === void 0 ? void 0 : _anchorsEntry$sourceA[tokenId];
          if (!_anchor || !_anchor.matched || _anchor.charStart < 0) {
            if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
              tracking.unmatchedTokenIds.add(tokenId);
            }
            continue;
          }
          var tokenText = (_anchor$tokenText = _anchor.tokenText) !== null && _anchor$tokenText !== void 0 ? _anchor$tokenText : "";
          var entrySource = typeof (entry === null || entry === void 0 ? void 0 : entry.source_text) === "string" ? entry.source_text : "";
          var placementAnchor = _anchor;
          if (entrySource && tokenText) {
            var normEntry = normalizeTokenForComparison(entrySource);
            var normToken = normalizeTokenForComparison(tokenText);
            if (normEntry !== normToken) {
              var _anchorsEntry$sourceA2;
              var merged = mergeAnchorsToMatchSourceText(entrySource, _anchor, anchorsEntry === null || anchorsEntry === void 0 || (_anchorsEntry$sourceA2 = anchorsEntry.sourceAnchors) === null || _anchorsEntry$sourceA2 === void 0 ? void 0 : _anchorsEntry$sourceA2.ordered);
              if (merged) {
                placementAnchor = merged;
              } else {
                continue;
              }
            }
          }
          var _baseText = (entrySource && entrySource.length ? entrySource : tokenText) || "";
          if (analysis.addComma && (!_baseText || !_baseText.trim()) && anchorsEntry !== null && anchorsEntry !== void 0 && (_anchorsEntry$sourceA3 = anchorsEntry.sourceAnchors) !== null && _anchorsEntry$sourceA3 !== void 0 && (_anchorsEntry$sourceA3 = _anchorsEntry$sourceA3.ordered) !== null && _anchorsEntry$sourceA3 !== void 0 && _anchorsEntry$sourceA3.length) {
            var coerced = findPreviousNonWhitespaceAnchor(anchorsEntry.sourceAnchors.ordered, _anchor.tokenId);
            if (coerced) {
              var _coerced$tokenText;
              placementAnchor = coerced;
              _baseText = (_coerced$tokenText = coerced.tokenText) !== null && _coerced$tokenText !== void 0 ? _coerced$tokenText : _baseText;
            }
          }
          if (!_baseText) {
            if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
              tracking.unmatchedTokenIds.add(tokenId);
            }
            continue;
          }
          if (tracking !== null && tracking !== void 0 && tracking.intents) {
            tracking.intents.push({
              tokenId: tokenId,
              anchor: placementAnchor,
              analysis: analysis,
              baseText: _baseText
            });
          }
          if (analysis.removeComma) {
            var localIndex = _baseText.lastIndexOf(",");
            if (localIndex < 0) {
              if (tracking !== null && tracking !== void 0 && tracking.unmatchedTokenIds) {
                tracking.unmatchedTokenIds.add(tokenId);
              }
              continue;
            }
            var absolutePos = placementAnchor.charStart + localIndex;
            var key = "del-".concat(absolutePos);
            if (seen.has(key)) continue;
            seen.add(key);
            ops.push({
              kind: "delete",
              pos: absolutePos,
              originalPos: absolutePos,
              correctedPos: absolutePos,
              paragraphIndex: paragraphIndex,
              fromCorrections: true
            });
          } else if (analysis.addComma) {
            var analysisBase = typeof analysis.baseText === "string" && normalizeTokenForComparison(analysis.baseText) ? analysis.baseText : null;
            var effectiveBase = analysisBase !== null && analysisBase !== void 0 ? analysisBase : _baseText;
            var insertBase = effectiveBase.replace(TRAILING_COMMA_REGEX, "");
            var relative = insertBase.length;
            var _absolutePos = placementAnchor.charStart + relative;
            var _key = "ins-".concat(_absolutePos);
            if (seen.has(_key)) continue;
            seen.add(_key);
            ops.push({
              kind: "insert",
              pos: _absolutePos,
              originalPos: _absolutePos,
              correctedPos: _absolutePos,
              paragraphIndex: paragraphIndex,
              fromCorrections: true
            });
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  } catch (err) {
    _iterator0.e(err);
  } finally {
    _iterator0.f();
  }
  if (tracking && (_tracking$intents = tracking.intents) !== null && _tracking$intents !== void 0 && _tracking$intents.length) {
    tracking.blockedOriginalPositions = new Set(tracking.blockedOriginalPositions || []);
    tracking.blockedCorrectedPositions = new Set(tracking.blockedCorrectedPositions || []);
    var _iterator1 = _createForOfIteratorHelper(tracking.intents),
      _step1;
    try {
      for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
        var _ref13, _ref14, _intent$baseText, _intent$analysis, _intent$analysis2, _intent$analysis3;
        var intent = _step1.value;
        var anchor = intent === null || intent === void 0 ? void 0 : intent.anchor;
        if (!anchor) continue;
        var baseText = (_ref13 = (_ref14 = (_intent$baseText = intent.baseText) !== null && _intent$baseText !== void 0 ? _intent$baseText : (_intent$analysis = intent.analysis) === null || _intent$analysis === void 0 ? void 0 : _intent$analysis.baseText) !== null && _ref14 !== void 0 ? _ref14 : anchor.tokenText) !== null && _ref13 !== void 0 ? _ref13 : "";
        var charStart = anchor.charStart;
        if (typeof charStart !== "number" || charStart < 0 || !baseText) continue;
        if ((_intent$analysis2 = intent.analysis) !== null && _intent$analysis2 !== void 0 && _intent$analysis2.removeComma) {
          var deleteIndex = baseText.lastIndexOf(",");
          if (deleteIndex >= 0) {
            tracking.blockedOriginalPositions.add(charStart + deleteIndex);
          }
        }
        if ((_intent$analysis3 = intent.analysis) !== null && _intent$analysis3 !== void 0 && _intent$analysis3.addComma) {
          var insertBaseLen = baseText.replace(TRAILING_COMMA_REGEX, "").length;
          tracking.blockedCorrectedPositions.add(charStart + insertBaseLen);
        }
      }
    } catch (err) {
      _iterator1.e(err);
    } finally {
      _iterator1.f();
    }
  }
  return ops;
}
function findPreviousNonWhitespaceAnchor(list, tokenId) {
  if (!Array.isArray(list) || !tokenId) return null;
  var startIndex = list.findIndex(function (anchor) {
    return (anchor === null || anchor === void 0 ? void 0 : anchor.tokenId) === tokenId;
  });
  if (startIndex <= 0) return null;
  for (var i = startIndex - 1; i >= 0; i--) {
    var anchor = list[i];
    if (anchor !== null && anchor !== void 0 && anchor.tokenText && anchor.tokenText.trim()) {
      return anchor;
    }
  }
  return null;
}
function mergeAnchorsToMatchSourceText(entrySource, baseAnchor, orderedAnchors) {
  var _baseAnchor$tokenText, _leftAnchor;
  if (!entrySource || !baseAnchor || !(orderedAnchors !== null && orderedAnchors !== void 0 && orderedAnchors.length)) return null;
  var targetNormalized = normalizeTokenForComparison(entrySource);
  if (!targetNormalized) return null;
  var combinedText = (_baseAnchor$tokenText = baseAnchor.tokenText) !== null && _baseAnchor$tokenText !== void 0 ? _baseAnchor$tokenText : "";
  var normalizedCombined = normalizeTokenForComparison(combinedText);
  if (normalizedCombined === targetNormalized) return baseAnchor;
  var leftIndex = baseAnchor.tokenIndex - 1;
  var rightIndex = baseAnchor.tokenIndex + 1;
  var leftAnchor = baseAnchor;
  var rightAnchor = baseAnchor;
  var maxLength = entrySource.length + 20;
  while (combinedText.length <= maxLength) {
    var expanded = false;
    if (leftIndex >= 0) {
      var candidate = orderedAnchors[leftIndex];
      leftIndex--;
      if ((candidate === null || candidate === void 0 ? void 0 : candidate.tokenText) != null) {
        var _candidate$tokenText;
        combinedText = ((_candidate$tokenText = candidate.tokenText) !== null && _candidate$tokenText !== void 0 ? _candidate$tokenText : "") + combinedText;
        leftAnchor = candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (normalizedCombined === targetNormalized) break;
    if (rightIndex < orderedAnchors.length) {
      var _candidate = orderedAnchors[rightIndex];
      rightIndex++;
      if ((_candidate === null || _candidate === void 0 ? void 0 : _candidate.tokenText) != null) {
        var _candidate$tokenText2;
        combinedText += (_candidate$tokenText2 = _candidate.tokenText) !== null && _candidate$tokenText2 !== void 0 ? _candidate$tokenText2 : "";
        rightAnchor = _candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (!expanded) break;
  }
  if (normalizedCombined !== targetNormalized) return null;
  if (typeof ((_leftAnchor = leftAnchor) === null || _leftAnchor === void 0 ? void 0 : _leftAnchor.charStart) !== "number" || leftAnchor.charStart < 0) return null;
  return _objectSpread(_objectSpread({}, baseAnchor), {}, {
    charStart: leftAnchor.charStart,
    tokenIndex: leftAnchor.tokenIndex,
    tokenText: combinedText
  });
}
function filterDiffOpsAgainstCorrections(ops, tracking) {
  if (!tracking || !Array.isArray(ops) || !ops.length) return ops;
  var blockedOriginal = tracking.blockedOriginalPositions;
  var blockedCorrected = tracking.blockedCorrectedPositions;
  if (!(blockedOriginal !== null && blockedOriginal !== void 0 && blockedOriginal.size) && !(blockedCorrected !== null && blockedCorrected !== void 0 && blockedCorrected.size)) return ops;
  return ops.filter(function (op) {
    var originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    var correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    if (op.kind === "delete" && blockedOriginal !== null && blockedOriginal !== void 0 && blockedOriginal.has(originalPos)) return false;
    if (op.kind === "insert" && blockedCorrected !== null && blockedCorrected !== void 0 && blockedCorrected.has(correctedPos)) return false;
    return true;
  });
}
function getCommaOpIdentity(op) {
  var originalPos = typeof (op === null || op === void 0 ? void 0 : op.originalPos) === "number" ? op.originalPos : op === null || op === void 0 ? void 0 : op.pos;
  var correctedPos = typeof (op === null || op === void 0 ? void 0 : op.correctedPos) === "number" ? op.correctedPos : op === null || op === void 0 ? void 0 : op.pos;
  return "".concat((op === null || op === void 0 ? void 0 : op.kind) || "unknown", ":").concat(originalPos, ":").concat(correctedPos);
}
function mergePreferredCommaOps(primaryOps, secondaryOps) {
  var merged = [];
  var seen = new Set();
  var pushUnique = function pushUnique(op) {
    if (!op) return;
    var key = getCommaOpIdentity(op);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(op);
  };
  (Array.isArray(primaryOps) ? primaryOps : []).forEach(pushUnique);
  (Array.isArray(secondaryOps) ? secondaryOps : []).forEach(pushUnique);
  return merged;
}
function shouldSuppressDueToRepeatedToken(anchorsEntry, op) {
  var _anchor$repeatKeyTota, _anchor$repeatKeyNear;
  if (op !== null && op !== void 0 && op.fromCorrections || op !== null && op !== void 0 && op.fromApiCommaOps) return false;
  var anchor = findAnchorForDiffOp(anchorsEntry, op);
  if (!anchor) return false;
  var repeatKey = anchor.repeatKey;
  var repeatTotal = (_anchor$repeatKeyTota = anchor.repeatKeyTotal) !== null && _anchor$repeatKeyTota !== void 0 ? _anchor$repeatKeyTota : 0;
  if (!repeatKey || repeatTotal <= 1) return false;
  if (!/(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD40-\uDD59\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC7\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDB0-\uDDDB\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD822\uD840-\uD868\uD86A-\uD86D\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD88C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDEA0-\uDEB8\uDEBB-\uDED3\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF2\uDFF3]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD1E\uDD80-\uDDF2]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDEC0-\uDEDE\uDEE0-\uDEE2\uDEE4\uDEE5\uDEE7-\uDEED\uDEF0-\uDEF4\uDEFE\uDEFF\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEAD\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD88D[\uDC00-\uDC79])+/.test(repeatKey)) return false;
  var gap = (_anchor$repeatKeyNear = anchor.repeatKeyNearestGap) !== null && _anchor$repeatKeyNear !== void 0 ? _anchor$repeatKeyNear : Infinity;
  return gap <= 80;
}
function findAnchorForDiffOp(anchorsEntry, op) {
  var _op$originalPos3, _op$correctedPos2, _around$at;
  if (!anchorsEntry || !op) return null;
  var isDelete = op.kind === "delete";
  var charIndex = isDelete ? (_op$originalPos3 = op.originalPos) !== null && _op$originalPos3 !== void 0 ? _op$originalPos3 : op.pos : (_op$correctedPos2 = op.correctedPos) !== null && _op$correctedPos2 !== void 0 ? _op$correctedPos2 : op.pos;
  if (typeof charIndex !== "number" || charIndex < 0) return null;
  var around = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(anchorsEntry, isDelete ? "source" : "target", charIndex);
  return (_around$at = around === null || around === void 0 ? void 0 : around.at) !== null && _around$at !== void 0 ? _around$at : null;
}
function buildDeleteSuggestionMetadata(entry, charIndex) {
  var _entry$documentOffset, _entry$originalText, _entry$paragraphIndex;
  if (!entry) return null;
  var sourceAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "source", charIndex);
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
function buildInsertSuggestionMetadata(entry, _ref15) {
  var _entry$documentOffset2, _ref16, _ref17, _ref18, _ref19, _sourceAround$at, _highlightAnchor$char, _entry$originalText2, _entry$paragraphIndex2;
  var originalCharIndex = _ref15.originalCharIndex,
    targetCharIndex = _ref15.targetCharIndex;
  if (!entry) return null;
  var srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  var targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  var sourceAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "source", srcIndex);
  var targetAround = (0,_anchoring_SyntheticAnchorProvider_js__WEBPACK_IMPORTED_MODULE_2__.findAnchorsNearChar)(entry, "target", targetIndex);
  var documentOffset = (_entry$documentOffset2 = entry === null || entry === void 0 ? void 0 : entry.documentOffset) !== null && _entry$documentOffset2 !== void 0 ? _entry$documentOffset2 : 0;
  var highlightAnchor = (_ref16 = (_ref17 = (_ref18 = (_ref19 = (_sourceAround$at = sourceAround.at) !== null && _sourceAround$at !== void 0 ? _sourceAround$at : sourceAround.before) !== null && _ref19 !== void 0 ? _ref19 : sourceAround.after) !== null && _ref18 !== void 0 ? _ref18 : targetAround.at) !== null && _ref17 !== void 0 ? _ref17 : targetAround.before) !== null && _ref16 !== void 0 ? _ref16 : targetAround.after;
  var highlightCharStart = (_highlightAnchor$char = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charStart) !== null && _highlightAnchor$char !== void 0 ? _highlightAnchor$char : srcIndex;
  var highlightCharEnd = highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.charEnd;
  if (!(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart) && typeof highlightCharStart === "number" && highlightCharStart >= 0 && typeof (highlightAnchor === null || highlightAnchor === void 0 ? void 0 : highlightAnchor.tokenText) === "string" && highlightAnchor.tokenText.length > 0) {
    highlightCharEnd = highlightCharStart + highlightAnchor.tokenText.length;
  }
  if (!(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart)) {
    highlightCharEnd = highlightCharStart;
  }
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
function snapshotAnchor(anchor) {
  if (!anchor) return undefined;
  return {
    tokenId: anchor.tokenId,
    tokenIndex: anchor.tokenIndex,
    tokenText: anchor.tokenText,
    textOccurrence: anchor.textOccurrence,
    trimmedTextOccurrence: anchor.trimmedTextOccurrence,
    charStart: anchor.charStart,
    charEnd: anchor.charEnd,
    documentCharStart: anchor.documentCharStart,
    documentCharEnd: anchor.documentCharEnd,
    length: anchor.length,
    matched: anchor.matched,
    repeatKey: anchor.repeatKey,
    repeatKeyTotal: anchor.repeatKeyTotal,
    repeatKeyNearestGap: anchor.repeatKeyNearestGap
  };
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ !function() {
/******/ 	__webpack_require__.h = function() { return "5f9dc59538033a664fda"; }
/******/ }();
/******/ 
/******/ }
);
//# sourceMappingURL=commands.02f8fe8c16a125edd958.hot-update.js.map