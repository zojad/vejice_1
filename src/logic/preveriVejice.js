/* global Word, window, process, performance, console, Office, URL */
import { popraviPoved, popraviPovedDetailed } from "../api/apiVejice.js";
import { isWordOnline } from "../utils/host.js";
import { CommaSuggestionEngine } from "./engine/CommaSuggestionEngine.js";
import { SyntheticAnchorProvider } from "./anchoring/SyntheticAnchorProvider.js";
import { LemmatizerAnchorProvider } from "./anchoring/LemmatizerAnchorProvider.js";
import { WordOnlineAdapter } from "./adapters/wordOnlineAdapter.js";
import { WordDesktopAdapter } from "./adapters/wordDesktopAdapter.js";
import { OnlineTextBridge } from "./bridges/onlineTextBridge.js";
import { DesktopTextBridge } from "./bridges/desktopTextBridge.js";
import {
  publishTaskpaneNotifications,
  shouldUseToastFallback,
  clearTaskpaneNotifications,
} from "../utils/notifications.js";
import {
  normalizeParagraphWhitespace,
  normalizeParagraphForEquality,
  QUOTES,
  charAtSafe,
  isDigit,
  makeAnchor,
  normalizeTokenRepeatKey,
} from "./engine/textUtils.js";

/**
 *  DEBUG helpers (flip DEBUG=false to silence logs)
 */
const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const parseQuietBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};
const QUIET_LOGS_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_QUIET_LOGS__ === "boolean"
    ? window.__VEJICE_QUIET_LOGS__
    : typeof process !== "undefined"
      ? parseQuietBoolean(process.env?.VEJICE_QUIET_LOGS)
      : undefined;
const QUIET_LOGS = typeof QUIET_LOGS_OVERRIDE === "boolean" ? QUIET_LOGS_OVERRIDE : true;
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const isFinalCheckSummaryLog = (args = []) => {
  const first = args[0];
  if (typeof first !== "string") return false;
  return (
    first.startsWith("DONE checkDocumentText()") ||
    first.startsWith("DONE checkDocumentTextOnline()")
  );
};
const log = (...a) => {
  if (isFinalCheckSummaryLog(a)) {
    console.log("[Vejice CHECK]", ...a);
    return;
  }
  if (!QUIET_LOGS && DEBUG) {
    console.log("[Vejice CHECK]", ...a);
  }
};
const warn = (...a) => {
  if (!QUIET_LOGS && DEBUG) {
    console.warn("[Vejice CHECK]", ...a);
  }
};
const errL = (...a) => {
  if (!QUIET_LOGS) {
    console.error("[Vejice CHECK]", ...a);
  }
};

const tnow = () => performance?.now?.() ?? Date.now();
const roundMs = (ms) => (Number.isFinite(ms) ? Math.round(ms * 10) / 10 : 0);
const SNIP = (s, n = 80) => (typeof s === "string" ? s.slice(0, n) : s);
const MAX_AUTOFIX_PASSES =
  typeof Office !== "undefined" && Office?.context?.platform === "PC" ? 3 : 2;

const HIGHLIGHT_INSERT = "#FFF9C4"; // light yellow
const HIGHLIGHT_DELETE = "#FFCDD2"; // light red
const VEJICE_MARKER_INSERT_UNDERLINE = "Wavy";
const VEJICE_MARKER_DELETE_UNDERLINE = "Wavy";
const VEJICE_MARKER_INSERT_UNDERLINE_COLOR = "#E67E22";
const VEJICE_MARKER_DELETE_UNDERLINE_COLOR = "#D32F2F";
const VEJICE_MARKER_TAG_PREFIX = "vejice.marker.";
const VEJICE_MARKER_TITLE = "Vejice Marker";
const TRAILING_COMMA_REGEX = /[,\s]+$/;
const WORD_CHAR_REGEX = /[\p{L}\d]/u;
const MAX_NORMALIZATION_PROBES = 20;

const pendingSuggestionsOnline = [];
const pendingSuggestionRenderKeys = new Set();
let pendingSuggestionsRequireStaleValidation = false;
let pendingSuggestionsStorageDisabled = false;
const desktopParagraphAnalysisCache = [];
const onlineParagraphAnalysisCache = [];
const onlineParagraphRenderState = new Map();
const unstableOnlineParagraphBackoff = new Map();
const onlineMarkerBaselineByKey = new Map();
const PENDING_SUGGESTIONS_STORAGE_BASE_KEY = "vejice.pendingSuggestionsOnline.v2";
const PENDING_SUGGESTIONS_SESSION_KEY = "vejice.pendingSuggestionsSessionId.v1";
const DESKTOP_PARAGRAPH_CACHE_VERSION = 3;
const ONLINE_PARAGRAPH_CACHE_VERSION = 3;
const MAX_PARAGRAPH_CHARS = 3000; //???
const LONG_PARAGRAPH_MESSAGE = "Odstavek je predolg za preverjanje. Razdelite ga na kraj\u0161e povedi in poskusite znova.";
const LONG_SENTENCE_MESSAGE = "Poved je predolga za preverjanje. Razdelite jo na kraj\u0161e povedi in poskusite znova.";
const CHUNK_API_ERROR_MESSAGE =
  "Nekatere povedi niso bile pregledane.";
const PARAGRAPH_NON_COMMA_MESSAGE = "API je spremenil ve\u010d kot vejice. Preglejte odstavek.";
const TRACKED_CHANGES_PRESENT_MESSAGE = "Najprej sprejmite ali zavrnite obstoje\u010de spremembe (Track Changes) in nato ponovno za\u017eenite preverjanje.";
const TRACK_CHANGES_REQUIRED_MESSAGE = "Vklju\u010dite Sledenje spremembam (Track Changes) in poskusite znova.";
const API_UNAVAILABLE_MESSAGE =
  "Storitev CJVT Vejice trenutno ni na voljo. Znova poskusite kasneje.";
const NO_ISSUES_FOUND_MESSAGE = "Ni bilo najdenih manjkajo\u010dih ali napa\u010dnih vejic.";
const MARKER_RENDER_FAILED_MESSAGE = "Napake so bile najdene, vendar jih v Word Online ni bilo mogo\u010de ozna\u010diti.";
const PARAGRAPH_TIMEOUT_MESSAGE = "Nekateri odstavki niso bili pregledani zaradi casovne omejitve.";
const ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS_DEFAULT = 5;
const ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS_DEFAULT = 24;
const LOCAL_ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS_DEFAULT = 1;
const LOCAL_ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS_DEFAULT = 10;
const ONLINE_ACCEPT_MIN_CONFIDENCE_LEVEL = "medium";
const ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD_DEFAULT = 2;
const ONLINE_RENDER_STATE_MAX_PARAGRAPHS = 1200;
const DISABLE_CHAR_SPAN_RANGES_ON_WORD_ONLINE = true;
let longSentenceNotified = false;
let chunkApiFailureNotified = false;
let chunkNonCommaNotified = false;
let paragraphTimeoutNotified = false;
const pendingScanNotifications = [];
const emittedScanNotificationKeys = new Set();
const BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);
let charSpanRangeResolutionDisabled = isWordOnline() && DISABLE_CHAR_SPAN_RANGES_ON_WORD_ONLINE;
let charSpanRangeDisableLogged = false;

function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
}

const QUOTE_TRACE_REGEX = /["'`\u00AB\u00BB\u2039\u203A\u2018\u2019\u201A\u201C\u201D\u201E]/u;

function isQuoteTraceEnabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanFlag(window.__VEJICE_QUOTE_TRACE__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_QUOTE_TRACE);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return false;
}

function isQuoteIntentInferenceEnabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanFlag(window.__VEJICE_QUOTE_INTENT_INFERENCE__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_QUOTE_INTENT_INFERENCE);
    if (typeof envOverride === "boolean") return envOverride;
  }
  // Default OFF: keep quote placement/highlight tied to explicit API intent.
  return false;
}

function isQuoteTraceVerboseEnabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanFlag(window.__VEJICE_QUOTE_TRACE_VERBOSE__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_QUOTE_TRACE_VERBOSE);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return false;
}

function hasQuoteTraceChar(value) {
  return typeof value === "string" && QUOTE_TRACE_REGEX.test(value);
}

function normalizeQuoteBoundaryIntent(value) {
  if (typeof value !== "string") return null;
  const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!compact) return null;
  if (compact === "none") return "none";
  if (compact === "unknown") return "unknown";
  if (compact === "before") return "before_closing_quote";
  if (compact === "after") return "after_closing_quote";
  if (compact === "whitespaceonly") return "whitespace_only";
  if (compact === "insidequoteboundary") return "inside_quote_boundary";
  if (compact === "insidequotegap") return "inside_quote_gap";
  if (compact === "beforeclosingquote" || compact === "beforequote") return "before_closing_quote";
  if (compact === "afterclosingquote" || compact === "afterquote") return "after_closing_quote";
  if (compact === "beforeopeningquote") return "before_opening_quote";
  if (compact === "afteropeningquote") return "after_opening_quote";
  return null;
}

function isExplicitQuoteBoundaryIntent(intent) {
  return (
    intent === "before_closing_quote" ||
    intent === "after_closing_quote" ||
    intent === "before_opening_quote" ||
    intent === "after_opening_quote"
  );
}

function isAfterQuoteBoundaryIntent(intent) {
  return intent === "after_closing_quote" || intent === "after_opening_quote";
}

function isTrustedQuoteBoundaryIntentSource(source) {
  if (typeof source !== "string") return false;
  const normalized = source.trim().toLowerCase();
  if (!normalized) return false;
  return [
    "payload_explicit",
    "payload_flags",
    "corrections_payload",
    "corrections_flags",
    "corrections_segment",
    "corrections_enriched_identity",
    "op_explicit",
  ].includes(normalized);
}

function shouldForceQuoteBoundaryHighlight(intent, source = null) {
  if (!isTrustedQuoteBoundaryIntentSource(source)) return false;
  return (
    intent === "after_closing_quote" ||
    intent === "after_opening_quote"
  );
}

function resolveSuggestionQuoteBoundaryIntentSource(suggestion, op = null) {
  const suggestionBoundary = suggestion?.meta?.anchor?.boundaryMeta ?? {};
  const opMeta = suggestion?.meta?.op ?? {};
  const opBoundary = op?.boundary ?? opMeta?.boundary ?? {};
  const candidates = [
    op?.explicitQuoteIntentSource,
    opMeta?.explicitQuoteIntentSource,
    opBoundary?.explicitQuoteIntentSource,
    suggestionBoundary?.explicitQuoteIntentSource,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

function resolveSuggestionQuoteBoundaryIntent(suggestion, op = null) {
  const suggestionBoundary = suggestion?.meta?.anchor?.boundaryMeta ?? {};
  const opMeta = suggestion?.meta?.op ?? {};
  const opBoundary = op?.boundary ?? opMeta?.boundary ?? {};
  const candidates = [
    op?.explicitQuoteIntent,
    opMeta?.explicitQuoteIntent,
    opBoundary?.explicitQuoteIntent,
    opMeta?.quoteIntent,
    opMeta?.quotePolicy,
    opBoundary?.quotePolicy,
    suggestionBoundary?.explicitQuoteIntent,
  ];
  let fallbackIntent = null;
  for (const candidate of candidates) {
    const normalized = normalizeQuoteBoundaryIntent(candidate);
    if (!normalized) continue;
    if (isExplicitQuoteBoundaryIntent(normalized)) {
      return normalized;
    }
    if (!fallbackIntent) {
      fallbackIntent = normalized;
    }
  }
  return fallbackIntent;
}

function suggestionTouchesQuoteBoundary(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return false;
  const meta = suggestion?.meta?.anchor || {};
  const explicitQuoteIntent = resolveSuggestionQuoteBoundaryIntent(suggestion, suggestion?.meta?.op);
  if (isExplicitQuoteBoundaryIntent(explicitQuoteIntent)) return true;
  const hasQuoteNearBoundary = (text, pos) => {
    if (typeof text !== "string" || !text.length) return false;
    if (!Number.isFinite(pos) || pos < 0 || pos > text.length) return false;
    const boundaryPos = Math.max(0, Math.min(text.length, Math.floor(pos)));
    let left = boundaryPos - 1;
    while (left >= 0 && /\s/u.test(text[left] || "")) left--;
    if (left >= 0 && hasQuoteTraceChar(text[left])) return true;
    if (boundaryPos < text.length && hasQuoteTraceChar(text[boundaryPos])) return true;
    let right = boundaryPos;
    while (right < text.length && /\s/u.test(text[right] || "")) right++;
    if (right < text.length && hasQuoteTraceChar(text[right])) return true;
    return false;
  };
  const opMeta = suggestion?.meta?.op || {};
  const sourceText =
    typeof suggestion?.meta?.originalText === "string"
      ? suggestion.meta.originalText
      : typeof suggestion?.meta?.sourceText === "string"
        ? suggestion.meta.sourceText
        : "";
  const correctedText =
    typeof suggestion?.meta?.correctedText === "string"
      ? suggestion.meta.correctedText
      : sourceText;
  const boundaryHintCandidates = [
    opMeta?.originalPos,
    opMeta?.correctedPos,
    opMeta?.pos,
    suggestion?.charHint?.start,
    meta?.targetCharStart,
    meta?.charStart,
  ];
  for (const candidate of boundaryHintCandidates) {
    if (
      hasQuoteNearBoundary(sourceText, candidate) ||
      hasQuoteNearBoundary(correctedText, candidate)
    ) {
      return true;
    }
  }
  const snippetLeft = suggestion?.snippets?.leftSnippet;
  const snippetRight = suggestion?.snippets?.rightSnippet;
  const candidates = [
    snippetLeft,
    snippetRight,
    meta?.highlightText,
    meta?.sourceTokenBefore?.tokenText,
    meta?.sourceTokenAt?.tokenText,
    meta?.sourceTokenAfter?.tokenText,
    meta?.targetTokenBefore?.tokenText,
    meta?.targetTokenAt?.tokenText,
    meta?.targetTokenAfter?.tokenText,
    meta?.boundaryMeta?.leftContext,
    meta?.boundaryMeta?.rightContext,
    meta?.boundaryMeta?.beforeToken?.tokenText,
    meta?.boundaryMeta?.afterToken?.tokenText,
  ];
  return candidates.some((value) => hasQuoteTraceChar(value));
}

function buildQuoteTraceSuggestionSnapshot(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const op = suggestion?.meta?.op || {};
  const anchor = suggestion?.meta?.anchor || {};
  const traceId =
    typeof op?.traceId === "string" && op.traceId.trim()
      ? op.traceId.trim()
      : `pv:${Number.isFinite(suggestion?.paragraphIndex) ? suggestion.paragraphIndex : "na"}:${suggestion?.kind || "op"}:${Number.isFinite(op?.originalPos) ? op.originalPos : Number.isFinite(op?.pos) ? op.pos : "na"}:${Number.isFinite(op?.correctedPos) ? op.correctedPos : Number.isFinite(op?.pos) ? op.pos : "na"}`;
  const explicitQuoteIntent = resolveSuggestionQuoteBoundaryIntent(suggestion, op);
  const highlightText =
    typeof anchor?.highlightText === "string" ? anchor.highlightText : typeof suggestion?.meta?.highlightText === "string" ? suggestion.meta.highlightText : null;
  const highlightTarget = hasQuoteTraceChar(highlightText || "") && (highlightText || "").length === 1 ? "quote" : "word";
  return {
    traceId,
    id: suggestion?.id ?? null,
    paragraphIndex: Number.isFinite(suggestion?.paragraphIndex) ? suggestion.paragraphIndex : null,
    kind: suggestion?.kind ?? null,
    explicitQuoteIntent: explicitQuoteIntent || null,
    explicitQuoteIntentSource: op?.explicitQuoteIntentSource || null,
    opOriginalPos: Number.isFinite(op?.originalPos) ? op.originalPos : null,
    opCorrectedPos: Number.isFinite(op?.correctedPos) ? op.correctedPos : null,
    opPos: Number.isFinite(op?.pos) ? op.pos : null,
    charHintStart: Number.isFinite(suggestion?.charHint?.start) ? suggestion.charHint.start : null,
    charHintEnd: Number.isFinite(suggestion?.charHint?.end) ? suggestion.charHint.end : null,
    sourceTokenBefore: anchor?.sourceTokenBefore?.tokenText || null,
    sourceTokenAfter: anchor?.sourceTokenAfter?.tokenText || null,
    targetTokenBefore: anchor?.targetTokenBefore?.tokenText || null,
    targetTokenAfter: anchor?.targetTokenAfter?.tokenText || null,
    highlightText,
    highlightTarget,
    highlightCharStart: Number.isFinite(anchor?.highlightCharStart) ? anchor.highlightCharStart : null,
    highlightCharEnd: Number.isFinite(anchor?.highlightCharEnd) ? anchor.highlightCharEnd : null,
    boundaryTargetPos: Number.isFinite(anchor?.boundaryMeta?.targetBoundaryPos)
      ? anchor.boundaryMeta.targetBoundaryPos
      : null,
    boundarySourcePos: Number.isFinite(anchor?.boundaryMeta?.sourceBoundaryPos)
      ? anchor.boundaryMeta.sourceBoundaryPos
      : null,
    leftSnippet:
      typeof suggestion?.snippets?.leftSnippet === "string"
        ? suggestion.snippets.leftSnippet.slice(-28)
        : null,
    rightSnippet:
      typeof suggestion?.snippets?.rightSnippet === "string"
        ? suggestion.snippets.rightSnippet.slice(0, 28)
        : null,
  };
}

function traceQuoteSuggestion(stage, suggestion, extra = {}) {
  if (!isQuoteTraceEnabled()) return;
  if (!suggestionTouchesQuoteBoundary(suggestion) && !extra?.force) return;
  const snapshot = buildQuoteTraceSuggestionSnapshot(suggestion);
  const traceId = snapshot?.traceId || "na";
  const intent = snapshot?.explicitQuoteIntent || "none";
  const target = snapshot?.highlightTarget || "na";
  const boundaryPos =
    Number.isFinite(snapshot?.boundaryTargetPos) ? snapshot.boundaryTargetPos : snapshot?.opCorrectedPos;
  try {
    console.log(
      `[Vejice QUOTE TRACE][preveri] ${stage} | traceId=${traceId} | intent=${intent} | target=${target} | boundary=${boundaryPos}`
    );
    if (isQuoteTraceVerboseEnabled()) {
      console.log("[Vejice QUOTE TRACE][preveri][detail]", {
        suggestion: snapshot,
        ...extra,
      });
    }
  } catch (_err) {
    // Ignore console failures in restricted host consoles.
  }
}

function isLocalhostRuntime() {
  if (typeof window === "undefined") return false;
  const host =
    typeof window.location?.hostname === "string"
      ? window.location.hostname.trim().toLowerCase()
      : "";
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isLocalSpeedProfileEnabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanFlag(window.__VEJICE_LOCAL_SPEED_PROFILE__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_LOCAL_SPEED_PROFILE);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return isLocalhostRuntime();
}

function isDeterministicMappingV2Enabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanFlag(window.__VEJICE_DETERMINISTIC_MAPPING_V2);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_DETERMINISTIC_MAPPING_V2);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return false;
}

function isDesktopVerboseLoggingEnabled() {
  if (typeof window !== "undefined") {
    const override =
      parseBooleanFlag(window.__VEJICE_DESKTOP_VERBOSE_LOGS) ??
      parseBooleanFlag(window.__VEJICE_VERBOSE_LOGS);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride =
      parseBooleanFlag(process.env?.VEJICE_DESKTOP_VERBOSE_LOGS) ??
      parseBooleanFlag(process.env?.VEJICE_VERBOSE_LOGS);
    if (typeof envOverride === "boolean") return envOverride;
  }
  // Debug default: keep desktop flow logs enabled unless explicitly turned off.
  return true;
}

const DESKTOP_VERBOSE_LOGS = isDesktopVerboseLoggingEnabled();
const logDesktopVerbose = (...a) => {
  if (!DESKTOP_VERBOSE_LOGS) return;
  try {
    console.log("[Vejice CHECK][Desktop]", ...a);
  } catch (_err) {
    // ignore console failures
  }
};
const warnDesktopVerbose = (...a) => {
  if (!DESKTOP_VERBOSE_LOGS) return;
  try {
    console.warn("[Vejice CHECK][Desktop]", ...a);
  } catch (_err) {
    // ignore console failures
  }
};

function isParagraphCacheDisabled() {
  if (typeof window !== "undefined") {
    const disableOverride =
      parseBooleanFlag(window.__VEJICE_DISABLE_PARAGRAPH_CACHE__) ??
      parseBooleanFlag(window.__VEJICE_PARAGRAPH_CACHE_DISABLED__);
    if (typeof disableOverride === "boolean") return disableOverride;
    const enableOverride = parseBooleanFlag(window.__VEJICE_ENABLE_PARAGRAPH_CACHE__);
    if (typeof enableOverride === "boolean") return !enableOverride;
  }
  if (typeof process !== "undefined") {
    const disableEnv =
      parseBooleanFlag(process.env?.VEJICE_DISABLE_PARAGRAPH_CACHE) ??
      parseBooleanFlag(process.env?.VEJICE_PARAGRAPH_CACHE_DISABLED);
    if (typeof disableEnv === "boolean") return disableEnv;
    const enableEnv = parseBooleanFlag(process.env?.VEJICE_ENABLE_PARAGRAPH_CACHE);
    if (typeof enableEnv === "boolean") return !enableEnv;
  }
  return false;
}

function shouldUseLemmatizerAnchors() {
  if (typeof window !== "undefined") {
    if (typeof window.__VEJICE_LEMMAS_URL === "string" && window.__VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via window:", window.__VEJICE_LEMMAS_URL);
    }
    if (
      typeof window.__VEJICE_LEMMAS_TIMEOUT_MS !== "undefined" &&
      window.__VEJICE_LEMMAS_TIMEOUT_MS !== null
    ) {
      log("Lemmas timeout override via window:", window.__VEJICE_LEMMAS_TIMEOUT_MS);
    }
    const override = parseBooleanFlag(window.__VEJICE_USE_LEMMATIZER__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envValue =
      parseBooleanFlag(process.env?.VEJICE_USE_LEMMATIZER) ??
      parseBooleanFlag(process.env?.VEJICE_LEMMATIZER_ANCHORS);
    if (typeof envValue === "boolean") return envValue;
    if (process.env?.VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via env:", process.env.VEJICE_LEMMAS_URL);
    }
    if (process.env?.VEJICE_LEMMAS_TIMEOUT_MS) {
      log("Lemmas timeout override via env:", process.env.VEJICE_LEMMAS_TIMEOUT_MS);
    }
  }
  return true;
}

function createAnchorProvider() {
  if (shouldUseLemmatizerAnchors()) {
    try {
      log("Lemmatizer anchor provider enabled");
      return new LemmatizerAnchorProvider();
    } catch (error) {
      errL("Failed to initialize LemmatizerAnchorProvider, falling back to synthetic", error);
    }
  }
  return new SyntheticAnchorProvider();
}
function resetPendingSuggestionsOnline() {
  pendingSuggestionsOnline.length = 0;
  pendingSuggestionRenderKeys.clear();
  onlineMarkerBaselineByKey.clear();
  pendingSuggestionsRequireStaleValidation = false;
  persistPendingSuggestionsOnline();
}

function normalizeSuggestionPositionForOrdering(suggestion) {
  const primaryPos = getSuggestionSortPos(suggestion);
  if (Number.isFinite(primaryPos)) return primaryPos;
  return Number.MAX_SAFE_INTEGER;
}

function comparePendingSuggestionsByDocumentOrder(left, right) {
  const leftParagraph = Number.isFinite(left?.paragraphIndex)
    ? left.paragraphIndex
    : Number.MAX_SAFE_INTEGER;
  const rightParagraph = Number.isFinite(right?.paragraphIndex)
    ? right.paragraphIndex
    : Number.MAX_SAFE_INTEGER;
  if (leftParagraph !== rightParagraph) {
    return leftParagraph - rightParagraph;
  }

  const leftPos = normalizeSuggestionPositionForOrdering(left);
  const rightPos = normalizeSuggestionPositionForOrdering(right);
  if (leftPos !== rightPos) {
    return leftPos - rightPos;
  }

  const leftKind = typeof left?.kind === "string" ? left.kind : "";
  const rightKind = typeof right?.kind === "string" ? right.kind : "";
  if (leftKind !== rightKind) {
    if (leftKind === "delete") return -1;
    if (rightKind === "delete") return 1;
    return leftKind.localeCompare(rightKind);
  }

  const leftId = String(left?.id ?? "");
  const rightId = String(right?.id ?? "");
  if (leftId !== rightId) {
    return leftId.localeCompare(rightId);
  }
  return 0;
}

function sortPendingSuggestionsOnlineInPlace() {
  if (!Array.isArray(pendingSuggestionsOnline) || pendingSuggestionsOnline.length < 2) return;
  pendingSuggestionsOnline.sort(comparePendingSuggestionsByDocumentOrder);
}

function compareSuggestionsByRenderVisualOrder(left, right) {
  const leftParagraph = Number.isFinite(left?.paragraphIndex) ? left.paragraphIndex : Number.MAX_SAFE_INTEGER;
  const rightParagraph = Number.isFinite(right?.paragraphIndex) ? right.paragraphIndex : Number.MAX_SAFE_INTEGER;
  if (leftParagraph !== rightParagraph) {
    return leftParagraph - rightParagraph;
  }

  const leftBounds = resolveSuggestionVisualBounds(left);
  const rightBounds = resolveSuggestionVisualBounds(right);
  const leftHasValidBounds = Number.isFinite(leftBounds?.start) && leftBounds.start >= 0;
  const rightHasValidBounds = Number.isFinite(rightBounds?.start) && rightBounds.start >= 0;
  const leftStart = leftHasValidBounds ? leftBounds.start : normalizeSuggestionPositionForOrdering(left);
  const rightStart = rightHasValidBounds ? rightBounds.start : normalizeSuggestionPositionForOrdering(right);
  if (leftStart !== rightStart) {
    return leftStart - rightStart;
  }

  // Only use bounds end if we also used bounds start (consistency)
  const leftEnd = leftHasValidBounds && Number.isFinite(leftBounds?.end) && leftBounds.end > leftStart
    ? leftBounds.end
    : leftStart + 1;
  const rightEnd = rightHasValidBounds && Number.isFinite(rightBounds?.end) && rightBounds.end > rightStart
    ? rightBounds.end
    : rightStart + 1;
  if (leftEnd !== rightEnd) {
    return leftEnd - rightEnd;
  }

  const leftKind = typeof left?.kind === "string" ? left.kind : "";
  const rightKind = typeof right?.kind === "string" ? right.kind : "";
  if (leftKind !== rightKind) {
    if (leftKind === "delete") return -1;
    if (rightKind === "delete") return 1;
    return leftKind.localeCompare(rightKind);
  }

  const leftId = String(left?.id ?? "");
  const rightId = String(right?.id ?? "");
  if (leftId !== rightId) {
    return leftId.localeCompare(rightId);
  }
  return 0;
}

function sortSuggestionsForRenderByVisualOrder(suggestions) {
  const source = Array.isArray(suggestions) ? suggestions.filter(Boolean) : [];
  if (source.length < 2) return source;
  return [...source].sort(compareSuggestionsByRenderVisualOrder);
}

function addPendingSuggestionOnline(suggestion, { persist = true } = {}) {
  const renderKey = buildSuggestionRenderDedupKey(suggestion);
  if (renderKey && pendingSuggestionRenderKeys.has(renderKey)) {
    return false;
  }
  pendingSuggestionsOnline.push(suggestion);
  sortPendingSuggestionsOnlineInPlace();
  if (renderKey) {
    pendingSuggestionRenderKeys.add(renderKey);
  }
  if (persist) {
    persistPendingSuggestionsOnline();
  }
  return true;
}

function findPendingSuggestionIndexById(suggestionId) {
  if (suggestionId === null || typeof suggestionId === "undefined") return -1;
  const normalizedId = String(suggestionId).trim();
  if (!normalizedId) return -1;
  for (let i = 0; i < pendingSuggestionsOnline.length; i++) {
    if (String(pendingSuggestionsOnline[i]?.id ?? "").trim() === normalizedId) {
      return i;
    }
  }
  return -1;
}

function removePendingSuggestionAt(index, { persist = true } = {}) {
  if (!Number.isFinite(index)) return null;
  const safeIndex = Math.floor(index);
  if (safeIndex < 0 || safeIndex >= pendingSuggestionsOnline.length) return null;
  const [removed] = pendingSuggestionsOnline.splice(safeIndex, 1);
  if (!removed) return null;
  const renderKey = buildSuggestionRenderDedupKey(removed);
  if (renderKey) {
    pendingSuggestionRenderKeys.delete(renderKey);
  }
  resetSuggestionMarkerState(removed);
  if (persist) {
    persistPendingSuggestionsOnline();
  }
  return removed;
}

function removePendingSuggestionsByReference(suggestions, { persist = true } = {}) {
  const targets = new Set((suggestions || []).filter(Boolean));
  if (!targets.size) return [];
  const removed = [];
  for (let i = pendingSuggestionsOnline.length - 1; i >= 0; i--) {
    const suggestion = pendingSuggestionsOnline[i];
    if (!targets.has(suggestion)) continue;
    const dropped = removePendingSuggestionAt(i, { persist: false });
    if (dropped) {
      removed.push(dropped);
    }
  }
  if (persist && removed.length) {
    persistPendingSuggestionsOnline();
  }
  return removed;
}

export function getPendingSuggestionsOnline(debugSnapshot = false) {
  sortPendingSuggestionsOnlineInPlace();
  if (!debugSnapshot) return pendingSuggestionsOnline;
  return pendingSuggestionsOnline.map((sug) => ({
    id: sug?.id,
    kind: sug?.kind,
    paragraphIndex: sug?.paragraphIndex,
    meta: sug?.meta,
    originalPos: sug?.originalPos,
    snippets: sug?.snippets,
  }));
}

function toSerializableSuggestion(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const safeMeta =
    suggestion.meta && typeof suggestion.meta === "object"
      ? (() => {
          const cloned = cloneSerializable(suggestion.meta) || {};
          delete cloned.originalText;
          delete cloned.correctedText;
          return cloned;
        })()
      : suggestion.meta;
  const serializable = {
    id: suggestion.id,
    kind: suggestion.kind,
    paragraphIndex: suggestion.paragraphIndex,
    charHint: suggestion.charHint,
    snippets: suggestion.snippets,
    meta: safeMeta,
    originalPos: suggestion.originalPos,
    sourceParagraphHash: suggestion.sourceParagraphHash,
  };
  return serializable;
}

function hashForStorageKey(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function cloneSerializable(value) {
  if (value === null || typeof value === "undefined") return value;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (_err) {
      // Fall through to JSON clone.
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_err) {
    return value;
  }
}

function buildDesktopParagraphHash(text = "") {
  const rawText = typeof text === "string" ? text : "";
  return `${rawText.length}:${hashForStorageKey(rawText)}`;
}

function buildParagraphCacheHash(text = "") {
  const normalizedText = normalizeParagraphWhitespace(typeof text === "string" ? text : "");
  return `${normalizedText.length}:${hashForStorageKey(normalizedText)}`;
}

function remapParagraphIndex(sourceText, targetText, index, { allowEnd = false } = {}) {
  if (!Number.isFinite(index)) return index;
  const safeSource = typeof sourceText === "string" ? sourceText : "";
  const safeTarget = typeof targetText === "string" ? targetText : "";
  if (!safeTarget.length) {
    return 0;
  }
  const raw = mapIndexAcrossCanonical(safeSource, safeTarget, Math.max(0, Math.floor(index)));
  const upperBound = allowEnd ? safeTarget.length : Math.max(0, safeTarget.length - 1);
  return Math.max(0, Math.min(Math.floor(raw), upperBound));
}

function remapAnchorCharFields(anchor, sourceText, targetText, documentOffset = 0) {
  if (!anchor || typeof anchor !== "object") return;
  if (Number.isFinite(anchor.charStart)) {
    anchor.charStart = remapParagraphIndex(sourceText, targetText, anchor.charStart);
    anchor.documentCharStart = documentOffset + anchor.charStart;
  }
  if (Number.isFinite(anchor.charEnd)) {
    anchor.charEnd = remapParagraphIndex(sourceText, targetText, anchor.charEnd, { allowEnd: true });
    if (Number.isFinite(anchor.charStart) && anchor.charEnd <= anchor.charStart) {
      anchor.charEnd = Math.min(targetText.length, anchor.charStart + 1);
    }
    anchor.documentCharEnd = documentOffset + anchor.charEnd;
  }
}

function remapPendingSuggestionToParagraphBaseline(
  suggestion,
  sourceText,
  targetText,
  documentOffset = 0
) {
  if (!suggestion || typeof suggestion !== "object") return false;
  const safeSource = typeof sourceText === "string" ? sourceText : "";
  const safeTarget = typeof targetText === "string" ? targetText : "";
  if (!safeTarget) return false;

  if (suggestion.charHint && typeof suggestion.charHint === "object") {
    if (Number.isFinite(suggestion.charHint.start)) {
      suggestion.charHint.start = remapParagraphIndex(safeSource, safeTarget, suggestion.charHint.start);
      suggestion.charHint.documentStart = documentOffset + suggestion.charHint.start;
    }
    if (Number.isFinite(suggestion.charHint.end)) {
      suggestion.charHint.end = remapParagraphIndex(safeSource, safeTarget, suggestion.charHint.end, {
        allowEnd: true,
      });
      if (
        Number.isFinite(suggestion.charHint.start) &&
        suggestion.charHint.end <= suggestion.charHint.start
      ) {
        suggestion.charHint.end = Math.min(safeTarget.length, suggestion.charHint.start + 1);
      }
      suggestion.charHint.documentEnd = documentOffset + suggestion.charHint.end;
    }
  }

  if (suggestion.meta && typeof suggestion.meta === "object") {
    const op = suggestion.meta.op;
    if (op && typeof op === "object") {
      if (Number.isFinite(op.originalPos)) {
        op.originalPos = remapParagraphIndex(safeSource, safeTarget, op.originalPos);
      }
      if (Number.isFinite(op.correctedPos)) {
        op.correctedPos = remapParagraphIndex(safeSource, safeTarget, op.correctedPos);
      }
      if (Number.isFinite(op.pos)) {
        op.pos = remapParagraphIndex(safeSource, safeTarget, op.pos);
      }
    }

    const anchor = suggestion.meta.anchor;
    if (anchor && typeof anchor === "object") {
      remapAnchorCharFields(anchor, safeSource, safeTarget, documentOffset);
      const relatedAnchors = [
        anchor.highlightAnchorTarget,
        anchor.sourceTokenBefore,
        anchor.sourceTokenAt,
        anchor.sourceTokenAfter,
        anchor.targetTokenBefore,
        anchor.targetTokenAt,
        anchor.targetTokenAfter,
      ];
      for (const related of relatedAnchors) {
        remapAnchorCharFields(related, safeSource, safeTarget, documentOffset);
      }

      if (Number.isFinite(anchor.targetCharStart)) {
        anchor.targetCharStart = remapParagraphIndex(safeSource, safeTarget, anchor.targetCharStart);
        anchor.targetDocumentCharStart = documentOffset + anchor.targetCharStart;
      }
      if (Number.isFinite(anchor.targetCharEnd)) {
        anchor.targetCharEnd = remapParagraphIndex(safeSource, safeTarget, anchor.targetCharEnd, {
          allowEnd: true,
        });
        if (Number.isFinite(anchor.targetCharStart) && anchor.targetCharEnd <= anchor.targetCharStart) {
          anchor.targetCharEnd = Math.min(safeTarget.length, anchor.targetCharStart + 1);
        }
        anchor.targetDocumentCharEnd = documentOffset + anchor.targetCharEnd;
      }

      if (Number.isFinite(anchor.highlightCharStart)) {
        anchor.highlightCharStart = remapParagraphIndex(
          safeSource,
          safeTarget,
          anchor.highlightCharStart
        );
      }
      if (Number.isFinite(anchor.highlightCharEnd)) {
        anchor.highlightCharEnd = remapParagraphIndex(safeSource, safeTarget, anchor.highlightCharEnd, {
          allowEnd: true,
        });
      }
      if (
        Number.isFinite(anchor.highlightCharStart) &&
        Number.isFinite(anchor.highlightCharEnd) &&
        anchor.highlightCharEnd <= anchor.highlightCharStart
      ) {
        anchor.highlightCharEnd = Math.min(safeTarget.length, anchor.highlightCharStart + 1);
      }
      if (typeof anchor.highlightText === "string") {
        const hs = Number.isFinite(anchor.highlightCharStart) ? anchor.highlightCharStart : -1;
        const he = Number.isFinite(anchor.highlightCharEnd) ? anchor.highlightCharEnd : -1;
        if (hs >= 0 && he > hs) {
          anchor.highlightText = safeTarget.slice(hs, he) || anchor.highlightText;
        } else if (hs >= 0) {
          anchor.highlightText = safeTarget.slice(hs, Math.min(safeTarget.length, hs + 1)) || anchor.highlightText;
        }
      }
    }
    suggestion.meta.originalText = safeTarget;
  }

  suggestion.sourceParagraphHash = buildDesktopParagraphHash(safeTarget);
  return true;
}

function refreshPendingSuggestionsForEditedParagraphBaseline({
  paragraphIndex,
  sourceText,
  targetText,
  documentOffset = 0,
}) {
  if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) {
    return { paragraphIndex: -1, updatedSuggestions: 0, changedBaseline: false };
  }
  const safeTarget = typeof targetText === "string" ? targetText : "";
  if (!safeTarget) {
    return { paragraphIndex, updatedSuggestions: 0, changedBaseline: false };
  }
  const safeSource = typeof sourceText === "string" ? sourceText : safeTarget;
  let updatedSuggestions = 0;
  for (const suggestion of pendingSuggestionsOnline) {
    if (!suggestion || suggestion.paragraphIndex !== paragraphIndex) continue;
    if (
      remapPendingSuggestionToParagraphBaseline(
        suggestion,
        safeSource,
        safeTarget,
        Number.isFinite(documentOffset) ? documentOffset : 0
      )
    ) {
      updatedSuggestions++;
    }
  }

  const entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
  let changedBaseline = false;
  if (entry && typeof entry === "object") {
    entry.originalText = safeTarget;
    if (Number.isFinite(documentOffset)) {
      entry.documentOffset = documentOffset;
    }
    changedBaseline = true;
  }

  if (updatedSuggestions > 1) {
    sortPendingSuggestionsOnlineInPlace();
  }

  return { paragraphIndex, updatedSuggestions, changedBaseline };
}

function resolveOnlineUnstableBackoffThreshold() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD);
  }
  return override ?? ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD_DEFAULT;
}

function pruneOnlineRuntimeState(paragraphCount) {
  const limit = Number.isFinite(paragraphCount) ? Math.max(0, Math.floor(paragraphCount)) : 0;
  for (const paragraphIndex of onlineParagraphRenderState.keys()) {
    if (paragraphIndex >= limit) {
      onlineParagraphRenderState.delete(paragraphIndex);
    }
  }
  for (const paragraphIndex of unstableOnlineParagraphBackoff.keys()) {
    if (paragraphIndex >= limit) {
      unstableOnlineParagraphBackoff.delete(paragraphIndex);
    }
  }
  while (onlineParagraphRenderState.size > ONLINE_RENDER_STATE_MAX_PARAGRAPHS) {
    const oldestKey = onlineParagraphRenderState.keys().next().value;
    if (!Number.isFinite(oldestKey)) break;
    onlineParagraphRenderState.delete(oldestKey);
  }
  while (unstableOnlineParagraphBackoff.size > ONLINE_RENDER_STATE_MAX_PARAGRAPHS) {
    const oldestKey = unstableOnlineParagraphBackoff.keys().next().value;
    if (!Number.isFinite(oldestKey)) break;
    unstableOnlineParagraphBackoff.delete(oldestKey);
  }
}

function buildSuggestionFingerprintPart(suggestion, indexHint = 0) {
  const kind = typeof suggestion?.kind === "string" ? suggestion.kind : "unknown";
  const dedupKey = buildSuggestionRenderDedupKey(suggestion) || `fallback-${indexHint}`;
  const anchor = suggestion?.meta?.anchor || {};
  const op = suggestion?.meta?.op || {};
  const pos =
    Number.isFinite(op.originalPos) ? op.originalPos : Number.isFinite(op.pos) ? op.pos : -1;
  const correctedPos =
    Number.isFinite(op.correctedPos) ? op.correctedPos : Number.isFinite(op.pos) ? op.pos : -1;
  const charStart =
    Number.isFinite(anchor.highlightCharStart)
      ? anchor.highlightCharStart
      : Number.isFinite(anchor.charStart)
        ? anchor.charStart
        : Number.isFinite(suggestion?.charHint?.start)
          ? suggestion.charHint.start
          : -1;
  const charEnd =
    Number.isFinite(anchor.highlightCharEnd)
      ? anchor.highlightCharEnd
      : Number.isFinite(anchor.charEnd)
        ? anchor.charEnd
        : Number.isFinite(suggestion?.charHint?.end)
          ? suggestion.charHint.end
          : -1;
  return `${kind}:${dedupKey}:p${pos}:c${correctedPos}:r${charStart}-${charEnd}`;
}

function buildParagraphSuggestionSetHash(sourceText, suggestions) {
  const sourceHash = buildDesktopParagraphHash(sourceText);
  const list = Array.isArray(suggestions) ? suggestions.filter(Boolean) : [];
  if (!list.length) {
    return `${sourceHash}:none`;
  }
  const parts = list.map((suggestion, index) => buildSuggestionFingerprintPart(suggestion, index)).sort();
  return `${sourceHash}:${list.length}:${hashForStorageKey(parts.join("|"))}`;
}

function collectMarkerTagsFromSuggestions(suggestions) {
  const tags = [];
  const seen = new Set();
  for (const suggestion of suggestions || []) {
    const markerTag = getSuggestionMarkerTag(suggestion, { create: true });
    if (!markerTag || seen.has(markerTag)) continue;
    seen.add(markerTag);
    tags.push(markerTag);
  }
  return tags;
}

function shouldBackoffUnstableOnlineParagraph(paragraphIndex, sourceText) {
  const sourceHash = buildDesktopParagraphHash(sourceText);
  const entry = unstableOnlineParagraphBackoff.get(paragraphIndex);
  if (!entry) return false;
  if (entry.sourceHash !== sourceHash) {
    unstableOnlineParagraphBackoff.delete(paragraphIndex);
    return false;
  }
  const threshold = resolveOnlineUnstableBackoffThreshold();
  return entry.nonCommaStreak >= threshold;
}

function recordUnstableOnlineParagraphOutcome(paragraphIndex, sourceText, { nonCommaSkips = 0 } = {}) {
  const sourceHash = buildDesktopParagraphHash(sourceText);
  if (nonCommaSkips > 0) {
    const existing = unstableOnlineParagraphBackoff.get(paragraphIndex);
    const streak = existing?.sourceHash === sourceHash ? (existing.nonCommaStreak || 0) + 1 : 1;
    unstableOnlineParagraphBackoff.set(paragraphIndex, {
      sourceHash,
      nonCommaStreak: streak,
      lastNonCommaSkips: nonCommaSkips,
      lastSeenAt: Date.now(),
    });
    return;
  }
  const existing = unstableOnlineParagraphBackoff.get(paragraphIndex);
  if (existing?.sourceHash === sourceHash) {
    unstableOnlineParagraphBackoff.delete(paragraphIndex);
  }
}

function clearOnlineParagraphRenderState(paragraphIndex) {
  if (!Number.isFinite(paragraphIndex)) return;
  onlineParagraphRenderState.delete(paragraphIndex);
}

function rebaseAnchorCollectionOffsets(collection, paragraphIndex, documentOffset) {
  if (!collection || typeof collection !== "object") return;
  const applyAnchor = (anchor) => {
    if (!anchor || typeof anchor !== "object") return;
    anchor.paragraphIndex = paragraphIndex;
    if (Number.isFinite(anchor.charStart)) {
      anchor.documentCharStart = documentOffset + anchor.charStart;
    }
    if (Number.isFinite(anchor.charEnd)) {
      anchor.documentCharEnd = documentOffset + anchor.charEnd;
    }
  };
  if (Array.isArray(collection.ordered)) {
    for (const anchor of collection.ordered) applyAnchor(anchor);
  }
  if (collection.byId && typeof collection.byId === "object") {
    for (const key of Object.keys(collection.byId)) {
      applyAnchor(collection.byId[key]);
    }
  }
}

function rebaseAnchorsEntry(entry, paragraphIndex, originalText, documentOffset) {
  const cloned = cloneSerializable(entry);
  if (!cloned || typeof cloned !== "object") return null;
  cloned.paragraphIndex = paragraphIndex;
  cloned.documentOffset = documentOffset;
  cloned.originalText = typeof originalText === "string" ? originalText : cloned.originalText || "";
  rebaseAnchorCollectionOffsets(cloned.sourceAnchors, paragraphIndex, documentOffset);
  rebaseAnchorCollectionOffsets(cloned.targetAnchors, paragraphIndex, documentOffset);
  return cloned;
}

function rebaseSuggestionForDocumentOffset(suggestion, documentOffset, paragraphIndex = null) {
  const cloned = cloneSerializable(suggestion);
  if (!cloned || typeof cloned !== "object") return cloned;
  if (Number.isFinite(paragraphIndex)) {
    cloned.paragraphIndex = paragraphIndex;
  }
  if (cloned?.meta && typeof cloned.meta === "object" && Number.isFinite(cloned.paragraphIndex)) {
    cloned.meta.paragraphIndex = cloned.paragraphIndex;
  }
  if (cloned.charHint && typeof cloned.charHint === "object") {
    if (Number.isFinite(cloned.charHint.start)) {
      cloned.charHint.documentStart = documentOffset + cloned.charHint.start;
    }
    if (Number.isFinite(cloned.charHint.end)) {
      cloned.charHint.documentEnd = documentOffset + cloned.charHint.end;
    }
  }
  const anchor = cloned?.meta?.anchor;
  if (anchor && typeof anchor === "object") {
    if (Number.isFinite(anchor.charStart)) {
      anchor.documentCharStart = documentOffset + anchor.charStart;
    }
    if (Number.isFinite(anchor.charEnd)) {
      anchor.documentCharEnd = documentOffset + anchor.charEnd;
    }
    if (Number.isFinite(anchor.targetCharStart)) {
      anchor.targetDocumentCharStart = documentOffset + anchor.targetCharStart;
    }
    if (Number.isFinite(anchor.targetCharEnd)) {
      anchor.targetDocumentCharEnd = documentOffset + anchor.targetCharEnd;
    }
  }
  return cloned;
}

function makeParagraphCacheEntry(cacheVersion, paragraphHash, analysisResult) {
  const anchorsEntry = cloneSerializable(analysisResult?.anchorsEntry);
  if (!anchorsEntry) return null;
  return {
    version: cacheVersion,
    hash: paragraphHash,
    anchorsEntry,
    suggestions: cloneSerializable(analysisResult?.suggestions || []),
  };
}

function makeDesktopParagraphCacheEntry(paragraphHash, analysisResult) {
  return makeParagraphCacheEntry(DESKTOP_PARAGRAPH_CACHE_VERSION, paragraphHash, analysisResult);
}

function makeOnlineParagraphCacheEntry(paragraphHash, analysisResult) {
  return makeParagraphCacheEntry(ONLINE_PARAGRAPH_CACHE_VERSION, paragraphHash, analysisResult);
}

function tryGetParagraphCacheResult(cacheStore, cacheVersion, snapshot) {
  if (!snapshot) return null;
  const cacheEntry = cacheStore[snapshot.paragraphIndex];
  if (!cacheEntry || cacheEntry.version !== cacheVersion) return null;
  const paragraphHash = buildParagraphCacheHash(snapshot.sourceText);
  if (cacheEntry.hash !== paragraphHash) return null;

  const anchorsEntry = rebaseAnchorsEntry(
    cacheEntry.anchorsEntry,
    snapshot.paragraphIndex,
    snapshot.sourceText,
    snapshot.paragraphDocOffset
  );
  if (!anchorsEntry) return null;

  if (typeof anchorProvider.setAnchors === "function") {
    anchorProvider.setAnchors(snapshot.paragraphIndex, anchorsEntry);
  } else if (Array.isArray(anchorProvider.paragraphAnchors)) {
    anchorProvider.paragraphAnchors[snapshot.paragraphIndex] = anchorsEntry;
  }

  const suggestions = Array.isArray(cacheEntry.suggestions)
    ? cacheEntry.suggestions.map((sug) => {
        return rebaseSuggestionForDocumentOffset(
          sug,
          snapshot.paragraphDocOffset,
          snapshot.paragraphIndex
        );
      })
    : [];
  return {
    paragraphIndex: snapshot.paragraphIndex,
    sourceText: snapshot.sourceText,
    suggestions,
    fromCache: true,
    durationMs: 0,
  };
}

function tryGetDesktopParagraphCacheResult(snapshot) {
  return tryGetParagraphCacheResult(
    desktopParagraphAnalysisCache,
    DESKTOP_PARAGRAPH_CACHE_VERSION,
    snapshot
  );
}

function tryGetOnlineParagraphCacheResult(snapshot) {
  return tryGetParagraphCacheResult(
    onlineParagraphAnalysisCache,
    ONLINE_PARAGRAPH_CACHE_VERSION,
    snapshot
  );
}

function isParagraphUnchangedAndSuggestionFree(cacheStore, cacheVersion, snapshot) {
  if (!snapshot) return false;
  const cacheEntry = cacheStore[snapshot.paragraphIndex];
  if (!cacheEntry || cacheEntry.version !== cacheVersion) return false;
  const paragraphHash = buildParagraphCacheHash(snapshot.sourceText);
  if (cacheEntry.hash !== paragraphHash) return false;
  return Array.isArray(cacheEntry.suggestions) && cacheEntry.suggestions.length === 0;
}

function isDesktopParagraphUnchangedAndSuggestionFree(snapshot) {
  return isParagraphUnchangedAndSuggestionFree(
    desktopParagraphAnalysisCache,
    DESKTOP_PARAGRAPH_CACHE_VERSION,
    snapshot
  );
}

function isOnlineParagraphUnchangedAndSuggestionFree(snapshot) {
  return isParagraphUnchangedAndSuggestionFree(
    onlineParagraphAnalysisCache,
    ONLINE_PARAGRAPH_CACHE_VERSION,
    snapshot
  );
}

function resolvePendingSuggestionsStorageScope() {
  const docUrl =
    typeof Office !== "undefined" && typeof Office?.context?.document?.url === "string"
      ? Office.context.document.url.trim()
      : "";
  if (docUrl) {
    return `doc.${hashForStorageKey(docUrl.toLowerCase())}`;
  }
  if (typeof window !== "undefined") {
    try {
      const storage = window.sessionStorage;
      if (storage) {
        let sessionId = storage.getItem(PENDING_SUGGESTIONS_SESSION_KEY);
        if (!sessionId) {
          sessionId = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
          storage.setItem(PENDING_SUGGESTIONS_SESSION_KEY, sessionId);
        }
        return `session.${sessionId}`;
      }
    } catch (_err) {
      // Ignore sessionStorage access failures.
    }
  }
  return "session.default";
}

function getPendingSuggestionsStorageKey() {
  return `${PENDING_SUGGESTIONS_STORAGE_BASE_KEY}.${resolvePendingSuggestionsStorageScope()}`;
}

function getSuggestionConfidenceLevel(suggestion) {
  const level = suggestion?.meta?.confidence?.level;
  if (level === "high" || level === "medium" || level === "low") return level;
  return "medium";
}

function confidenceLevelRank(level) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function isSuggestionAutoApplyEligibleOnline(suggestion) {
  const level = getSuggestionConfidenceLevel(suggestion);
  return confidenceLevelRank(level) >= confidenceLevelRank(ONLINE_ACCEPT_MIN_CONFIDENCE_LEVEL);
}

function getSuggestionOpPositions(suggestion) {
  const op = suggestion?.meta?.op || {};
  const anchor = suggestion?.meta?.anchor || {};
  const sourceAnchor =
    anchor.sourceTokenAt ??
    anchor.sourceTokenBefore ??
    anchor.sourceTokenAfter ??
    anchor.highlightAnchorTarget ??
    null;
  const targetAnchor =
    anchor.targetTokenAt ??
    anchor.targetTokenBefore ??
    anchor.targetTokenAfter ??
    null;
  const originalPos = Number.isFinite(op.originalPos)
    ? op.originalPos
    : Number.isFinite(op.pos) && suggestion?.kind === "delete"
      ? op.pos
      : Number.isFinite(anchor.charStart)
        ? anchor.charStart
        : Number.isFinite(sourceAnchor?.charStart)
          ? sourceAnchor.charStart
          : null;
  const correctedPos = Number.isFinite(op.correctedPos)
    ? op.correctedPos
    : Number.isFinite(op.pos) && suggestion?.kind === "insert"
      ? op.pos
      : Number.isFinite(anchor.targetCharStart)
        ? anchor.targetCharStart
        : Number.isFinite(targetAnchor?.charStart)
          ? targetAnchor.charStart
          : Number.isFinite(suggestion?.charHint?.start)
            ? suggestion.charHint.start
            : null;
  return { originalPos, correctedPos };
}

const RELOCATION_PAIR_POSITION_TOLERANCE = 12;

function normalizeRelocationSignaturePart(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function pickRelocationAnchorId(anchor) {
  if (!anchor || typeof anchor !== "object") return "";
  const candidates = [
    anchor.tokenId,
    anchor.tokenText,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeRelocationSignaturePart(candidate);
    if (normalized) return normalized;
  }
  return "";
}

function buildRelocationAnchorSignature(suggestion) {
  const anchor = suggestion?.meta?.anchor;
  if (!anchor || typeof anchor !== "object") return "";
  const before =
    pickRelocationAnchorId(anchor.sourceTokenBefore) || pickRelocationAnchorId(anchor.targetTokenBefore);
  const at = pickRelocationAnchorId(anchor.sourceTokenAt) || pickRelocationAnchorId(anchor.targetTokenAt);
  const after =
    pickRelocationAnchorId(anchor.sourceTokenAfter) || pickRelocationAnchorId(anchor.targetTokenAfter);
  const highlight = pickRelocationAnchorId(anchor.highlightAnchorTarget);
  const parts = [before, at, after, highlight].filter(Boolean);
  if (!parts.length) return "";
  return parts.join("|");
}

function isSameCommaRelocationPair(first, second) {
  if (!first || !second) return false;
  if (first === second) return false;
  if (first?.kind === second?.kind) return false;
  if (first?.paragraphIndex !== second?.paragraphIndex) return false;

  const firstPos = getSuggestionOpPositions(first);
  const secondPos = getSuggestionOpPositions(second);
  if (!Number.isFinite(firstPos.originalPos) || !Number.isFinite(firstPos.correctedPos)) return false;
  if (!Number.isFinite(secondPos.originalPos) || !Number.isFinite(secondPos.correctedPos)) return false;
  const firstDelta = firstPos.correctedPos - firstPos.originalPos;
  const secondDelta = secondPos.correctedPos - secondPos.originalPos;
  if (firstDelta === 0 || secondDelta === 0) return false;
  if (Math.sign(firstDelta) !== Math.sign(secondDelta)) return false;
  const firstSignature = buildRelocationAnchorSignature(first);
  const secondSignature = buildRelocationAnchorSignature(second);
  if (firstSignature && secondSignature && firstSignature === secondSignature) {
    return true;
  }
  return (
    Math.abs(firstPos.originalPos - secondPos.originalPos) <= RELOCATION_PAIR_POSITION_TOLERANCE &&
    Math.abs(firstPos.correctedPos - secondPos.correctedPos) <= RELOCATION_PAIR_POSITION_TOLERANCE
  );
}

function collectRelocationPairSuggestions(targetSuggestion, candidates = []) {
  if (!targetSuggestion) return [];
  const related = [targetSuggestion];
  for (const candidate of candidates || []) {
    if (!candidate || candidate === targetSuggestion) continue;
    if (isSameCommaRelocationPair(targetSuggestion, candidate)) {
      related.push(candidate);
    }
  }
  traceQuoteSuggestion("pair.collect", targetSuggestion, {
    relatedCount: related.length,
    related: related.map((sug) => ({
      id: sug?.id ?? null,
      kind: sug?.kind ?? null,
      paragraphIndex: Number.isFinite(sug?.paragraphIndex) ? sug.paragraphIndex : null,
    })),
  });
  return related;
}

function toConfidenceLogEntry(suggestion) {
  return {
    id: suggestion?.id,
    paragraphIndex: suggestion?.paragraphIndex,
    kind: suggestion?.kind,
    level: getSuggestionConfidenceLevel(suggestion),
    score: suggestion?.meta?.confidence?.score ?? null,
    reasons: Array.isArray(suggestion?.meta?.confidence?.reasons)
      ? suggestion.meta.confidence.reasons
      : [],
  };
}

function buildReasonIdSummary(suggestions, maxIdsPerReason = 20) {
  const summary = {};
  for (const suggestion of suggestions || []) {
    const reasons = Array.isArray(suggestion?.meta?.confidence?.reasons)
      ? suggestion.meta.confidence.reasons
      : ["no_confidence_reason"];
    const uniqueReasons = reasons.length ? [...new Set(reasons)] : ["no_confidence_reason"];
    for (const reason of uniqueReasons) {
      if (!summary[reason]) {
        summary[reason] = {
          count: 0,
          ids: [],
        };
      }
      summary[reason].count += 1;
      if (summary[reason].ids.length < maxIdsPerReason && suggestion?.id) {
        summary[reason].ids.push(suggestion.id);
      }
    }
  }
  return summary;
}

function persistPendingSuggestionsOnline() {
  if (typeof window === "undefined") return;
  if (pendingSuggestionsStorageDisabled) return;
  try {
    const storage = window.localStorage;
    if (!storage) return;
    const storageKey = getPendingSuggestionsStorageKey();
    if (!pendingSuggestionsOnline.length) {
      storage.removeItem(storageKey);
      return;
    }
    const payload = pendingSuggestionsOnline
      .map((sug) => toSerializableSuggestion(sug))
      .filter(Boolean);
    storage.setItem(storageKey, JSON.stringify(payload));
  } catch (storageErr) {
    const errorName = typeof storageErr?.name === "string" ? storageErr.name : "";
    if (errorName === "QuotaExceededError" || errorName === "SecurityError") {
      pendingSuggestionsStorageDisabled = true;
    }
    warn("persistPendingSuggestionsOnline failed", storageErr);
  }
}

function restorePendingSuggestionsOnline() {
  if (pendingSuggestionsOnline.length) return pendingSuggestionsOnline.length;
  if (pendingSuggestionsStorageDisabled) return 0;
  if (typeof window === "undefined") return 0;
  try {
    const storage = window.localStorage;
    if (!storage) return 0;
    const raw = storage.getItem(getPendingSuggestionsStorageKey());
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    let restoredCount = 0;
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      if (addPendingSuggestionOnline(item, { persist: false })) {
        restoredCount++;
      }
    }
    if (restoredCount > 0) {
      pendingSuggestionsRequireStaleValidation = true;
    }
    return restoredCount;
  } catch (storageErr) {
    const errorName = typeof storageErr?.name === "string" ? storageErr.name : "";
    if (errorName === "SecurityError") {
      pendingSuggestionsStorageDisabled = true;
    }
    warn("restorePendingSuggestionsOnline failed", storageErr);
    return 0;
  }
}

export function restorePendingSuggestionsOnlineIfNeeded() {
  if (pendingSuggestionsOnline.length) return 0;
  return restorePendingSuggestionsOnline();
}

function getStoredSuggestionParagraphHash(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return "";
  if (typeof suggestion.sourceParagraphHash !== "string") return "";
  return suggestion.sourceParagraphHash.trim();
}

async function pruneStalePendingSuggestionsAgainstLiveDocument(options = {}) {
  const clearMarkers = options?.clearMarkers !== false;
  const forceValidation = Boolean(options?.force);
  const summary = {
    checked: 0,
    removed: 0,
    clearedMarkers: 0,
    failedClear: 0,
  };
  if (!isWordOnline() || !pendingSuggestionsOnline.length) {
    return summary;
  }
  if (!forceValidation && !pendingSuggestionsRequireStaleValidation) {
    return summary;
  }
  if (getActiveActionType() === ACTION_TYPE_CHECK) {
    return summary;
  }
  try {
    await Word.run(async (context) => {
      const paras = await wordOnlineAdapter.getParagraphs(context);
      const staleEntries = [];
      const staleSuggestions = [];
      for (const suggestion of pendingSuggestionsOnline) {
        const paragraphIndex = suggestion?.paragraphIndex;
        if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) continue;
        const expectedHash = getStoredSuggestionParagraphHash(suggestion);
        if (!expectedHash) continue;
        const paragraph = paras.items[paragraphIndex] || null;
        const liveHash = buildDesktopParagraphHash(paragraph?.text || "");
        summary.checked += 1;
        if (liveHash === expectedHash) continue;
        staleEntries.push({ suggestion, paragraph });
        staleSuggestions.push(suggestion);
      }
      if (!staleSuggestions.length) return;
      if (clearMarkers) {
        const clearResult = await clearOnlineSuggestionMarkers(context, staleEntries, paras);
        summary.clearedMarkers =
          (clearResult?.clearedByTagCount || 0) + (clearResult?.clearedFallbackCount || 0);
        summary.failedClear = clearResult?.failedCount || 0;
      }
      const removed = removePendingSuggestionsByReference(staleSuggestions, { persist: false });
      summary.removed = removed.length;
      for (const removedSuggestion of removed) {
        const paragraphIndex = removedSuggestion?.paragraphIndex;
        if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) continue;
        clearOnlineParagraphRenderState(paragraphIndex);
        unstableOnlineParagraphBackoff.delete(paragraphIndex);
      }
      persistPendingSuggestionsOnline();
      await context.sync();
    });
  } catch (err) {
    warn("pruneStalePendingSuggestionsAgainstLiveDocument failed", err);
  } finally {
    pendingSuggestionsRequireStaleValidation = false;
  }
  return summary;
}

function recoverPendingSuggestionsAfterInterruptedOnlineScan(
  previousSuggestions = [],
  reconciledParagraphIndexes = new Set()
) {
  if (!Array.isArray(previousSuggestions) || !previousSuggestions.length) return 0;
  let restored = 0;
  for (const suggestion of previousSuggestions) {
    const paragraphIndex = suggestion?.paragraphIndex;
    if (
      Number.isFinite(paragraphIndex) &&
      paragraphIndex >= 0 &&
      reconciledParagraphIndexes instanceof Set &&
      reconciledParagraphIndexes.has(paragraphIndex)
    ) {
      continue;
    }
    if (addPendingSuggestionOnline(suggestion, { persist: false })) {
      restored += 1;
    }
  }
  return restored;
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
  window.__VEJICE_DEBUG_STATE__.getParagraphAnchorsOnline = () => anchorProvider.paragraphAnchors;
  window.getVejiceDebugDump = () => window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  window.getVejiceDebugDumps = () =>
    Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? [...window.__VEJICE_DEBUG_DUMPS__] : [];
  window.getVejiceDebugStatus = () => ({
    ready: Boolean(window.__VEJICE_DEBUG_DUMP_READY__),
    debug: window.__VEJICE_DEBUG__,
    dump: window.__VEJICE_DEBUG_DUMP__,
    state: typeof window.__VEJICE_DEBUG_STATE__,
    dumps: Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? window.__VEJICE_DEBUG_DUMPS__.length : 0,
    hasLastDump: Boolean(window.__VEJICE_LAST_DEBUG_DUMP__),
  });
  window.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.getPendingSuggestionsSnapshot = () => getPendingSuggestionsOnline(true);
}

let toastDialog = null;
let documentCheckInProgress = false;
const ACTION_TYPE_IDLE = "idle";
const ACTION_TYPE_CHECK = "check";
const ACTION_TYPE_APPLY = "apply";
const ACTION_TYPE_CLEAR = "clear";
const ACTION_TYPE_REJECT = "reject";
const ONLINE_CHECK_TIMEOUT_MS_DEFAULT = 120000;
const ONLINE_PARAGRAPH_TIMEOUT_MS_DEFAULT = 20000;
const ONLINE_ANALYZE_CONCURRENCY_DEFAULT = 1;
const LOCAL_ONLINE_ANALYZE_CONCURRENCY_DEFAULT = 1;
const DESKTOP_ANALYZE_CONCURRENCY_DEFAULT = 1;
const POST_APPLY_CHECK_COOLDOWN_MS_DEFAULT = 1200;
const CHECK_ABORT_REASON_TIMEOUT = "check-timeout";
const CHECK_ABORT_REASON_CANCELLED = "check-cancelled";
const CHECK_ABORT_REASON_SUPERSEDED = "check-superseded";
const CHECK_ABORT_REASON_PARAGRAPH_TIMEOUT = "paragraph-timeout";
const CHECK_TIMEOUT_MESSAGE = "Pregled je bil prekinjen zaradi casovne omejitve. Poskusite znova.";
const CHECK_CANCELLED_MESSAGE = "Pregled je bil prekinjen.";
const POST_APPLY_COOLDOWN_MESSAGE =
  "Dokument se se usklajuje po samodejnih popravkih. Poskusite znova cez trenutek.";
let actionSequence = 0;
const checkAbortControllersByTokenId = new Map();
let activeActionState = {
  type: ACTION_TYPE_IDLE,
  token: null,
  startedAt: 0,
};
let postApplyCheckCooldownUntil = 0;
let onlineMarkerCleanupApiNotFoundLogged = false;

class CheckAbortError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "CheckAbortError";
    this.reason = reason || CHECK_ABORT_REASON_CANCELLED;
  }
}

function parsePositiveInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= 0) return null;
  return Math.floor(parsed);
}

function resolveOnlineCheckTimeoutMs() {
  let timeoutOverride = null;
  if (typeof window !== "undefined") {
    timeoutOverride = parsePositiveInteger(window.__VEJICE_ONLINE_CHECK_TIMEOUT_MS);
  }
  if (timeoutOverride == null && typeof process !== "undefined") {
    timeoutOverride = parsePositiveInteger(process.env?.VEJICE_ONLINE_CHECK_TIMEOUT_MS);
  }
  return timeoutOverride ?? ONLINE_CHECK_TIMEOUT_MS_DEFAULT;
}

function resolveOnlineParagraphTimeoutMs() {
  let timeoutOverride = null;
  if (typeof window !== "undefined") {
    timeoutOverride = parsePositiveInteger(window.__VEJICE_ONLINE_PARAGRAPH_TIMEOUT_MS);
  }
  if (timeoutOverride == null && typeof process !== "undefined") {
    timeoutOverride = parsePositiveInteger(process.env?.VEJICE_ONLINE_PARAGRAPH_TIMEOUT_MS);
  }
  return timeoutOverride ?? ONLINE_PARAGRAPH_TIMEOUT_MS_DEFAULT;
}

function resolveOnlineHighlightFlushParagraphs() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS);
  }
  const defaultValue = isLocalSpeedProfileEnabled()
    ? LOCAL_ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS_DEFAULT
    : ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS_DEFAULT;
  const value = override ?? defaultValue;
  return Math.max(1, Math.min(value, 50));
}

function resolveOnlineHighlightFlushSuggestions() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS);
  }
  const defaultValue = isLocalSpeedProfileEnabled()
    ? LOCAL_ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS_DEFAULT
    : ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS_DEFAULT;
  const value = override ?? defaultValue;
  return Math.max(1, Math.min(value, 200));
}

function resolveDesktopAnalyzeConcurrency() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_DESKTOP_ANALYZE_CONCURRENCY);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_DESKTOP_ANALYZE_CONCURRENCY);
  }
  const value = override ?? DESKTOP_ANALYZE_CONCURRENCY_DEFAULT;
  return Math.max(1, Math.min(value, 8));
}

function resolveOnlineAnalyzeConcurrency() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_ONLINE_ANALYZE_CONCURRENCY);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_ONLINE_ANALYZE_CONCURRENCY);
  }
  const defaultValue = isLocalSpeedProfileEnabled()
    ? LOCAL_ONLINE_ANALYZE_CONCURRENCY_DEFAULT
    : ONLINE_ANALYZE_CONCURRENCY_DEFAULT;
  const value = override ?? defaultValue;
  return Math.max(1, Math.min(value, 8));
}

function resolvePostApplyCheckCooldownMs() {
  let override = null;
  if (typeof window !== "undefined") {
    override = parsePositiveInteger(window.__VEJICE_POST_APPLY_CHECK_COOLDOWN_MS);
  }
  if (override == null && typeof process !== "undefined") {
    override = parsePositiveInteger(process.env?.VEJICE_POST_APPLY_CHECK_COOLDOWN_MS);
  }
  return override ?? POST_APPLY_CHECK_COOLDOWN_MS_DEFAULT;
}

function startPostApplyCheckCooldown(ms = resolvePostApplyCheckCooldownMs()) {
  const durationMs = Math.max(0, parsePositiveInteger(ms) ?? 0);
  if (durationMs <= 0) {
    postApplyCheckCooldownUntil = 0;
    return;
  }
  postApplyCheckCooldownUntil = Date.now() + durationMs;
  log("post-apply check cooldown armed", { durationMs });
}

function getPostApplyCheckCooldownRemainingMs() {
  if (!Number.isFinite(postApplyCheckCooldownUntil) || postApplyCheckCooldownUntil <= 0) return 0;
  return Math.max(0, postApplyCheckCooldownUntil - Date.now());
}

async function runWithConcurrency(items, concurrency, worker) {
  if (!Array.isArray(items) || !items.length) return [];
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: safeConcurrency }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function getActiveActionType() {
  return activeActionState?.type || ACTION_TYPE_IDLE;
}

function getCheckAbortController(token, { create = false } = {}) {
  if (!token || token.type !== ACTION_TYPE_CHECK || !Number.isFinite(token.id)) return null;
  const existing = checkAbortControllersByTokenId.get(token.id);
  if (existing || !create) return existing || null;
  if (typeof AbortController !== "function") return null;
  const created = new AbortController();
  checkAbortControllersByTokenId.set(token.id, created);
  return created;
}

function releaseCheckAbortController(token) {
  if (!token || !Number.isFinite(token.id)) return;
  checkAbortControllersByTokenId.delete(token.id);
}

function abortCheckRequestsForToken(token, reason = CHECK_ABORT_REASON_CANCELLED) {
  const controller = getCheckAbortController(token, { create: false });
  if (!controller || controller.signal?.aborted) return false;
  try {
    controller.abort(reason);
  } catch (_err) {
    // Ignore abort failures; cancellation fallback still relies on action token checks.
  }
  return true;
}

function isAbortLikeError(error) {
  const code = typeof error?.code === "string" ? error.code.toUpperCase() : "";
  const name = typeof error?.name === "string" ? error.name : "";
  return code === "ERR_CANCELED" || name === "AbortError" || name === "CanceledError";
}

function beginAction(type) {
  if (getActiveActionType() !== ACTION_TYPE_IDLE) return null;
  const token = {
    id: ++actionSequence,
    type,
    cancelled: false,
    cancelReason: null,
    deadlineAt: 0,
  };
  activeActionState = {
    type,
    token,
    startedAt: Date.now(),
  };
  return token;
}

function finishAction(token) {
  releaseCheckAbortController(token);
  if (!token || activeActionState?.token !== token) return;
  activeActionState = {
    type: ACTION_TYPE_IDLE,
    token: null,
    startedAt: 0,
  };
}

function cancelActionToken(token, reason = CHECK_ABORT_REASON_CANCELLED) {
  if (!token) return;
  token.cancelled = true;
  token.cancelReason = reason;
  if (token.type === ACTION_TYPE_CHECK) {
    abortCheckRequestsForToken(token, reason);
  }
}

function ensureCheckActionActive(token) {
  if (!token) {
    throw new CheckAbortError("Missing check token", CHECK_ABORT_REASON_CANCELLED);
  }
  if (activeActionState?.token !== token || getActiveActionType() !== ACTION_TYPE_CHECK) {
    throw new CheckAbortError("Check token is no longer active", CHECK_ABORT_REASON_SUPERSEDED);
  }
  if (token.cancelled) {
    throw new CheckAbortError("Check was cancelled", token.cancelReason || CHECK_ABORT_REASON_CANCELLED);
  }
  if (token.deadlineAt > 0 && Date.now() > token.deadlineAt) {
    cancelActionToken(token, CHECK_ABORT_REASON_TIMEOUT);
    throw new CheckAbortError("Check timed out", CHECK_ABORT_REASON_TIMEOUT);
  }
}

async function runWithTimeout(promiseFactory, timeoutMs, timeoutReason, timeoutMessage) {
  let timeoutId = null;
  try {
    return await Promise.race([
      Promise.resolve().then(() => promiseFactory()),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new CheckAbortError(timeoutMessage || "Timed out", timeoutReason));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isApiNotFoundLikeError(err) {
  const code = typeof err?.code === "string" ? err.code : "";
  const message = typeof err?.message === "string" ? err.message.toLowerCase() : "";
  return code === "ApiNotFound" || message.includes("apinotfound");
}

async function waitForOnlineScanCompletion({ timeoutMs = 120000, pollMs = 80, silent = false } = {}) {
  if (getActiveActionType() !== ACTION_TYPE_CHECK) return true;
  const startedAt = Date.now();
  if (!silent) {
    warn("Waiting for active online scan to complete before apply/reject.");
  }
  while (getActiveActionType() === ACTION_TYPE_CHECK && Date.now() - startedAt < timeoutMs) {
    await sleep(pollMs);
  }
  if (getActiveActionType() === ACTION_TYPE_CHECK) {
    if (!silent) {
      warn("Timed out while waiting for online scan completion.");
    }
    return false;
  }
  return true;
}

export function isDocumentCheckInProgress() {
  return Boolean(documentCheckInProgress || getActiveActionType() === ACTION_TYPE_CHECK);
}

export function cancelDocumentCheck(reason = CHECK_ABORT_REASON_CANCELLED) {
  if (getActiveActionType() !== ACTION_TYPE_CHECK) return false;
  cancelActionToken(activeActionState?.token, reason);
  return true;
}

function showToastNotification(message) {
  if (!message) return;
  if (typeof Office === "undefined" || !Office.context?.ui?.displayDialogAsync) {
    warn("Toast notification unavailable", message);
    return;
  }
  const origin =
    (typeof window !== "undefined" && window.location && window.location.origin) || null;
  if (!origin) {
    warn("Toast notification: origin unavailable");
    return;
  }
  const toastUrl = new URL("toast.html", origin);
  toastUrl.searchParams.set("message", message);
  Office.context.ui.displayDialogAsync(
    toastUrl.toString(),
    { height: 20, width: 30, displayInIframe: true },
    (asyncResult) => {
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
      const closeDialog = () => {
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
    }
  );
}

function normalizeNotificationLevel(level, fallback = "info") {
  const normalized = typeof level === "string" ? level.trim().toLowerCase() : "";
  if (normalized === "error" || normalized === "warn" || normalized === "info") return normalized;
  return fallback;
}

function queueScanNotification(message, level = "info") {
  if (!message) return;
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  if (!normalizedMessage) return;
  pendingScanNotifications.push({
    message: normalizedMessage,
    level: normalizeNotificationLevel(level, "info"),
  });
}

function flushScanNotifications() {
  if (!pendingScanNotifications.length) return;
  const seen = new Set();
  const uniqueEntries = [];
  for (const entry of pendingScanNotifications) {
    const message = typeof entry?.message === "string" ? entry.message.trim() : "";
    if (!message) continue;
    const level = normalizeNotificationLevel(entry?.level, "info");
    const key = `${level}:${message}`;
    if (seen.has(key) || emittedScanNotificationKeys.has(key)) continue;
    seen.add(key);
    emittedScanNotificationKeys.add(key);
    uniqueEntries.push({ message, level });
  }
  pendingScanNotifications.length = 0;
  if (!uniqueEntries.length) return;
  publishTaskpaneNotifications(
    uniqueEntries.map((entry) => ({
      message: entry.message,
      level: entry.level,
      source: isWordOnline() ? "online-check" : "desktop-check",
    }))
  );
  if (shouldUseToastFallback()) {
    showToastNotification(uniqueEntries.map((entry) => entry.message).join("\n"));
  }
}

function notifyParagraphTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_PARAGRAPH_MESSAGE} (${length} znakov).`;
  warn("Paragraph too long - skipped", { paragraphIndex, length });
  queueScanNotification(msg, "warn");
}

function notifySentenceTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_SENTENCE_MESSAGE} (${length} znakov).`;
  warn("Sentence too long - skipped", { paragraphIndex, length });
  if (longSentenceNotified) return;
  longSentenceNotified = true;
  queueScanNotification(msg, "warn");
}

function extractApiFailureMeta(error) {
  const meta = error?.meta || {};
  const info = meta?.info || {};
  const status =
    Number.isFinite(info?.status) && info.status > 0
      ? info.status
      : Number.isFinite(error?.response?.status) && error.response.status > 0
        ? error.response.status
        : null;
  const code =
    typeof info?.code === "string" && info.code
      ? info.code
      : typeof error?.code === "string" && error.code
        ? error.code
        : null;
  const reason =
    typeof error?.message === "string" && error.message
      ? error.message
      : typeof info?.msg === "string" && info.msg
        ? info.msg
        : null;
  return { status, code, reason };
}

function notifyChunkApiFailure(paragraphIndex, chunkIndex, error = null) {
  const paragraphLabel = Number.isFinite(paragraphIndex) ? paragraphIndex + 1 : paragraphIndex;
  const sentenceLabel = Number.isFinite(chunkIndex) ? chunkIndex + 1 : chunkIndex;
  const failure = extractApiFailureMeta(error);
  const details = [];
  if (Number.isFinite(failure.status)) details.push(`status=${failure.status}`);
  if (failure.code) details.push(`code=${failure.code}`);
  if (failure.reason) details.push(`reason=${failure.reason}`);
  const detailSuffix = details.length ? ` | ${details.join(" | ")}` : "";
  console.log(
    `[Vejice CHECK] API chunk failed | paragraph=${paragraphLabel} | sentence=${sentenceLabel}${detailSuffix}`
  );
  warn("Sentence skipped due to API error", {
    paragraphIndex,
    chunkIndex,
    status: failure.status,
    code: failure.code,
    reason: failure.reason,
  });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  queueScanNotification(CHUNK_API_ERROR_MESSAGE, "warn");
}

function notifyChunkNonCommaChanges(paragraphIndex, chunkIndex, original, corrected) {
  warn("Sentence skipped due to non-comma changes", { paragraphIndex, chunkIndex, original, corrected });
  if (chunkNonCommaNotified) return;
  chunkNonCommaNotified = true;
  queueScanNotification(PARAGRAPH_NON_COMMA_MESSAGE, "warn");
}

function notifyParagraphTimeout(paragraphIndex, timeoutMs) {
  warn("Paragraph skipped due to timeout", { paragraphIndex, timeoutMs });
  if (paragraphTimeoutNotified) return;
  paragraphTimeoutNotified = true;
  queueScanNotification(PARAGRAPH_TIMEOUT_MESSAGE, "warn");
}

const anchorProvider = createAnchorProvider();
const anchorProviderSupportsCharHints =
  typeof anchorProvider.supportsCharHints === "function" ? anchorProvider.supportsCharHints() : false;
if (anchorProviderSupportsCharHints) {
  log("Anchor provider supports char hints; snippet fallback cleanup disabled");
}
const commaEngine = new CommaSuggestionEngine({
  anchorProvider,
  apiClient: {
    popraviPoved,
    popraviPovedDetailed,
  },
  notifiers: {
    onParagraphTooLong: notifyParagraphTooLong,
    onSentenceTooLong: notifySentenceTooLong,
    onChunkApiFailure: notifyChunkApiFailure,
    onChunkNonCommaChanges: notifyChunkNonCommaChanges,
  },
});
if (typeof window !== "undefined") {
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDump = () => commaEngine.lastDebugDump || null;
  window.__VEJICE_DEBUG_STATE__.getEngineDebugDumps = () =>
    Array.isArray(commaEngine.debugDumps) ? [...commaEngine.debugDumps] : [];
  window.getVejiceDebugDump = () => commaEngine.lastDebugDump || window.__VEJICE_LAST_DEBUG_DUMP__ || null;
  window.getVejiceDebugDumps = () => {
    if (Array.isArray(commaEngine.debugDumps) && commaEngine.debugDumps.length) {
      return [...commaEngine.debugDumps];
    }
    return Array.isArray(window.__VEJICE_DEBUG_DUMPS__) ? [...window.__VEJICE_DEBUG_DUMPS__] : [];
  };
}

const onlineTextBridge = new OnlineTextBridge({
  applyInsertSuggestion,
  applyDeleteSuggestion,
});

const desktopTextBridge = new DesktopTextBridge({
  applyInsertSuggestion,
  applyDeleteSuggestion,
});

let normalizationProbeCount = 0;

function getActiveTextBridge() {
  return isWordOnline() ? onlineTextBridge : desktopTextBridge;
}

function getNormalizationProfile() {
  return getActiveTextBridge().getNormalizationProfile();
}

const wordOnlineAdapter = new WordOnlineAdapter({
  highlightSuggestion: highlightSuggestionOnline,
  textBridge: onlineTextBridge,
  clearSuggestionMarkers: clearOnlineSuggestionMarkers,
});

const wordDesktopAdapter = new WordDesktopAdapter({
  textBridge: desktopTextBridge,
  trace: (...a) => log(...a),
});

function notifyParagraphNonCommaChanges(paragraphIndex, original, corrected) {
  const label = paragraphIndex + 1;
  warn("Paragraph skipped due to non-comma changes", { paragraphIndex, original, corrected });
  queueScanNotification(`Odstavek ${label}: ${PARAGRAPH_NON_COMMA_MESSAGE}`, "warn");
}

function notifyTrackedChangesPresent() {
  warn("Tracked changes present - aborting check");
  queueScanNotification(TRACKED_CHANGES_PRESENT_MESSAGE, "error");
}

function notifyTrackChangesRequired() {
  warn("Track changes disabled - aborting check");
  queueScanNotification(TRACK_CHANGES_REQUIRED_MESSAGE, "error");
}

let apiFailureNotified = false;
function notifyApiUnavailable() {
  if (apiFailureNotified) return;
  apiFailureNotified = true;
  warn("API unavailable - notifying taskpane");
  queueScanNotification(API_UNAVAILABLE_MESSAGE, "error");
}

function notifyNoIssuesFound() {
  log("No comma issues found - notifying taskpane");
  queueScanNotification(NO_ISSUES_FOUND_MESSAGE, "info");
}

function resetNotificationFlags() {
  apiFailureNotified = false;
  longSentenceNotified = false;
  chunkApiFailureNotified = false;
  chunkNonCommaNotified = false;
  paragraphTimeoutNotified = false;
  pendingScanNotifications.length = 0;
  emittedScanNotificationKeys.clear();
  clearTaskpaneNotifications();
}

async function documentHasTrackedChanges(context) {
  if (!context?.document) return false;
  if (isWordOnline()) {
    // Word Online does not expose revisions; assume no tracked changes to avoid ApiNotFound.
    return false;
  }
  const revisions = context.document.revisions;
  if (!revisions || typeof revisions.load !== "function") {
    return false;
  }
  try {
    if (typeof revisions.getFirstOrNullObject === "function") {
      logDesktopVerbose("Desktop phase: revisions.getFirstOrNullObject -> sync:start");
      const firstRevision = revisions.getFirstOrNullObject();
      firstRevision.load("isNullObject");
      await context.sync();
      const hasTracked = !firstRevision.isNullObject;
      logDesktopVerbose("Desktop phase: revisions.getFirstOrNullObject -> sync:done", hasTracked);
      return hasTracked;
    }
    logDesktopVerbose("Desktop phase: revisions.load(items) -> sync:start");
    revisions.load("items");
    await context.sync();
    logDesktopVerbose("Desktop phase: revisions.load(items) -> sync:done", revisions.items.length);
    return revisions.items.length > 0;
  } catch (err) {
    if (err?.code === "ApiNotFound") {
      warn("Revisions API unavailable on this host - skipping tracked-change preflight.");
      return false;
    }
    throw err;
  }
}



function countSnippetOccurrencesBefore(text, snippet, limit) {
  if (!snippet) return 0;
  const safeText = typeof text === "string" ? text : "";
  const hop = Math.max(1, snippet.length);
  let count = 0;
  let idx = safeText.indexOf(snippet);
  while (idx !== -1 && idx < limit) {
    count++;
    idx = safeText.indexOf(snippet, idx + hop);
  }
  return count;
}

function canonicalizeWithBoundaryMap(text, profile = getNormalizationProfile()) {
  const source = typeof text === "string" ? text : "";
  let canonical = "";
  const boundary = new Array(source.length + 1).fill(0);
  let prevWasSpace = false;

  const normalizeChar = (ch) => {
    if (profile?.normalizeQuotes) {
      if ("\"\u201C\u201D\u201E\u00AB\u00BB".includes(ch)) return "\"";
      if ("'`\u2019\u2018\u201A\u2039\u203A".includes(ch)) return "'";
    }
    if (profile?.normalizeDashes && "\u2013\u2014\u2212".includes(ch)) {
      return "-";
    }
    if (profile?.normalizeEllipsis && ch === "\u2026") {
      return "...";
    }
    return ch;
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const isSpace = /[\s\u00A0\u202F\u2007\u200B-\u200D\uFEFF]/.test(ch);
    if (isSpace) {
      if (profile?.collapseWhitespace !== false) {
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

  return { canonical, boundary };
}

function logNormalizationProbe(sourceText, targetText, sourceIndex, profile) {
  if (!DEBUG || normalizationProbeCount >= MAX_NORMALIZATION_PROBES) return;
  normalizationProbeCount++;
  const idx = Math.max(0, Math.floor(sourceIndex || 0));
  const left = Math.max(0, idx - 18);
  const right = Math.min((sourceText || "").length, idx + 18);
  const targetLeft = Math.max(0, idx - 18);
  const targetRight = Math.min((targetText || "").length, idx + 18);
  warn("normalization probe: prefix mismatch", {
    profile,
    sourceIndex: idx,
    sourceSnippet: (sourceText || "").slice(left, right),
    targetSnippet: (targetText || "").slice(targetLeft, targetRight),
  });
}

function resolveCanonicalMappingProfile(profileOrOptions) {
  const fallbackProfile = getNormalizationProfile();
  if (!profileOrOptions || typeof profileOrOptions !== "object") {
    return fallbackProfile;
  }
  const hasNormalizationKey = [
    "collapseWhitespace",
    "normalizeQuotes",
    "normalizeDashes",
    "normalizeEllipsis",
  ].some((key) => Object.prototype.hasOwnProperty.call(profileOrOptions, key));
  if (!hasNormalizationKey) {
    // Some call sites pass { allowEnd: true } as a mapping option.
    // Treat such objects as options-only and preserve host normalization profile.
    return fallbackProfile;
  }
  return {
    collapseWhitespace:
      typeof profileOrOptions.collapseWhitespace === "boolean"
        ? profileOrOptions.collapseWhitespace
        : fallbackProfile.collapseWhitespace,
    normalizeQuotes:
      typeof profileOrOptions.normalizeQuotes === "boolean"
        ? profileOrOptions.normalizeQuotes
        : fallbackProfile.normalizeQuotes,
    normalizeDashes:
      typeof profileOrOptions.normalizeDashes === "boolean"
        ? profileOrOptions.normalizeDashes
        : fallbackProfile.normalizeDashes,
    normalizeEllipsis:
      typeof profileOrOptions.normalizeEllipsis === "boolean"
        ? profileOrOptions.normalizeEllipsis
        : fallbackProfile.normalizeEllipsis,
  };
}

function mapIndexAcrossCanonical(sourceText, targetText, sourceIndex, profileOrOptions = null) {
  if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return 0;
  const profile = resolveCanonicalMappingProfile(profileOrOptions);
  const src = canonicalizeWithBoundaryMap(sourceText, profile);
  const dst = canonicalizeWithBoundaryMap(targetText, profile);
  if (!src.canonical.length || !dst.canonical.length) return 0;

  const safeSrcIndex = Math.max(0, Math.min(Math.floor(sourceIndex), sourceText.length));
  const srcCanonicalPos = src.boundary[safeSrcIndex] ?? 0;
  const srcPrefix = src.canonical.slice(0, srcCanonicalPos);

  const directPos = dst.canonical.startsWith(srcPrefix) ? srcCanonicalPos : -1;
  if (directPos < 0) {
    logNormalizationProbe(sourceText, targetText, sourceIndex, profile);
  }
  const estimatePos =
    src.canonical.length > 0
      ? Math.round((srcCanonicalPos / src.canonical.length) * dst.canonical.length)
      : srcCanonicalPos;
  const findBestFallbackPos = () => {
    const leftCtx = src.canonical.slice(Math.max(0, srcCanonicalPos - 20), srcCanonicalPos);
    const rightCtx = src.canonical.slice(srcCanonicalPos, Math.min(src.canonical.length, srcCanonicalPos + 20));
    if (!leftCtx && !rightCtx) return Math.min(Math.max(0, estimatePos), dst.canonical.length);

    const candidates = [];
    if (leftCtx) {
      let idx = dst.canonical.indexOf(leftCtx);
      while (idx !== -1) {
        candidates.push(idx + leftCtx.length);
        idx = dst.canonical.indexOf(leftCtx, idx + 1);
      }
    } else if (rightCtx) {
      let idx = dst.canonical.indexOf(rightCtx);
      while (idx !== -1) {
        candidates.push(idx);
        idx = dst.canonical.indexOf(rightCtx, idx + 1);
      }
    }
    if (!candidates.length) return Math.min(Math.max(0, estimatePos), dst.canonical.length);

    let bestPos = candidates[0];
    let bestScore = Number.POSITIVE_INFINITY;
    for (const pos of candidates) {
      const dstRight = dst.canonical.slice(pos, Math.min(dst.canonical.length, pos + rightCtx.length));
      let mismatch = 0;
      const overlap = Math.min(dstRight.length, rightCtx.length);
      for (let i = 0; i < overlap; i++) {
        if (dstRight[i] !== rightCtx[i]) mismatch++;
      }
      mismatch += Math.abs(rightCtx.length - dstRight.length);
      const distance = Math.abs(pos - estimatePos);
      const score = mismatch * 3 + distance;
      if (score < bestScore) {
        bestScore = score;
        bestPos = pos;
      }
    }
    return Math.min(Math.max(0, bestPos), dst.canonical.length);
  };
  const targetCanonicalPos =
    directPos >= 0
      ? Math.min(directPos, dst.canonical.length)
      : findBestFallbackPos();

  if (targetCanonicalPos <= 0) return 0;

  let low = 0;
  let high = targetText.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if ((dst.boundary[mid] ?? 0) < targetCanonicalPos) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return Math.max(0, Math.min(low, targetText.length));
}

async function getRangeForCharacterSpan(
  context,
  paragraph,
  paragraphText,
  charStart,
  charEnd,
  reason = "span",
  fallbackSnippet
) {
  if (charSpanRangeResolutionDisabled) {
    if (!charSpanRangeDisableLogged) {
      log("Char-span range resolution disabled; using search/ordinal fallback markers");
      charSpanRangeDisableLogged = true;
    }
    return null;
  }
  if (!paragraph || typeof paragraph.getRange !== "function") return null;
  if (!Number.isFinite(charStart) || charStart < 0) return null;
  const text = typeof paragraphText === "string" ? paragraphText : paragraph.text || "";
  if (!text) return null;
  const safeStart = Math.max(0, Math.min(Math.floor(charStart), text.length ? text.length - 1 : 0));
  const computedEnd = Math.max(safeStart + 1, Math.floor(charEnd ?? safeStart + 1));
  const safeEnd = Math.min(computedEnd, text.length);
  let snippet = text.slice(safeStart, safeEnd);
  if (!snippet && typeof fallbackSnippet === "string" && fallbackSnippet.length) {
    snippet = fallbackSnippet;
  }
  if (!snippet) return null;

  try {
    if (typeof paragraph.text !== "string") {
      paragraph.load("text");
      await context.sync();
    }
    const liveText = typeof paragraph.text === "string" ? paragraph.text : text;
    let searchSnippet = snippet;
    let matches = await searchParagraphForSnippet(context, paragraph, searchSnippet);
    if ((!matches?.items?.length) && snippet.trim() && snippet.trim() !== snippet) {
      searchSnippet = snippet.trim();
      matches = await searchParagraphForSnippet(context, paragraph, searchSnippet);
    }
    if (!matches?.items?.length) {
      warn(`getRangeForCharacterSpan(${reason}): snippet not found`, { snippet, safeStart });
      return null;
    }
    const mappedStart = mapIndexAcrossCanonical(text, liveText, safeStart);
    const occurrence = countSnippetOccurrencesBefore(liveText, searchSnippet, mappedStart);
    const idx = Math.min(occurrence, matches.items.length - 1);
    return matches.items[idx];
  } catch (err) {
    if (isWordOnline() && isApiNotFoundLikeError(err)) {
      charSpanRangeResolutionDisabled = true;
      return null;
    }
    if (isWordOnline() && String(err?.code || err?.message || "").includes("InvalidRequest")) {
      charSpanRangeResolutionDisabled = true;
      if (!charSpanRangeDisableLogged) {
        warn("Disabling char-span range resolution after InvalidRequest; fallback mode enabled");
        charSpanRangeDisableLogged = true;
      }
    }
    warn(`getRangeForCharacterSpan(${reason}) failed`, err);
  }
  return null;
}

async function getRangeForAnchorSpan(
  context,
  paragraph,
  anchorsEntry,
  charStart,
  charEnd,
  reason = "span",
  fallbackSnippet
) {
  const candidates = [];
  if (anchorsEntry?.originalText) {
    candidates.push({ text: anchorsEntry.originalText, label: "orig" });
  }
  const liveText = paragraph?.text;
  if (liveText && (!candidates.length || liveText !== candidates[0].text)) {
    candidates.push({ text: liveText, label: "live" });
  }
  if (!candidates.length) {
    candidates.push({ text: "", label: "empty" });
  }

  for (const candidate of candidates) {
    if (!candidate.text) continue;
    const range = await getRangeForCharacterSpan(
      context,
      paragraph,
      candidate.text,
      charStart,
      charEnd,
      `${reason}-${candidate.label}`,
      fallbackSnippet
    );
    if (range) {
      return range;
    }
  }
  return null;
}

function getAnchorResolvedEnd(anchor) {
  if (!Number.isFinite(anchor?.charStart) || anchor.charStart < 0) return -1;
  if (Number.isFinite(anchor?.charEnd) && anchor.charEnd > anchor.charStart) {
    return anchor.charEnd;
  }
  if (typeof anchor?.tokenText === "string" && anchor.tokenText.length > 0) {
    return anchor.charStart + anchor.tokenText.length;
  }
  return anchor.charStart + 1;
}

function isLemmaAuthoritativeSuggestion(suggestion) {
  return Boolean(suggestion?.meta?.lemmaAnchorAuthoritative);
}

function hasDesktopDirectInsertBoundary(suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return false;
  const beforeEnd = getAnchorResolvedEnd(meta.sourceTokenBefore);
  const atEnd = getAnchorResolvedEnd(meta.sourceTokenAt);
  const afterStart = Number.isFinite(meta.sourceTokenAfter?.charStart) ? meta.sourceTokenAfter.charStart : -1;
  const charHintStart = Number.isFinite(suggestion?.charHint?.start) ? suggestion.charHint.start : -1;
  return beforeEnd >= 0 || atEnd >= 0 || afterStart >= 0 || charHintStart >= 0;
}

function isDesktopDirectInsertOp(op) {
  if (op?.kind !== "insert") return false;
  const suggestions = Array.isArray(op?.suggestions) ? op.suggestions : [];
  return suggestions.length === 1 && suggestions.every(hasDesktopDirectInsertBoundary);
}

async function applyDesktopAuthoritativeInsertOp(context, paragraph, paragraphIndex, sourceText, op) {
  const suggestions = Array.isArray(op?.suggestions) ? op.suggestions.filter(Boolean) : [];
  if (!suggestions.length) return "failed";
  if (suggestions.some((candidate) => suggestionTouchesQuoteBoundary(candidate))) return "failed";
  const suggestion = suggestions[0];
  const suggestionLog = buildDesktopSuggestionLogEntry(suggestion);
  const meta = suggestion?.meta?.anchor;
  if (!meta) return "failed";
  logDesktopVerbose("Desktop direct insert:start", {
    paragraphIndex,
    suggestion: suggestionLog,
    op: buildDesktopOperationLogEntry(op, sourceText, sourceText),
  });

  paragraph.load("text");
  await context.sync();
  const liveText = paragraph.text || "";
  const anchorsEntry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
  const quoteCharRegex = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
  const boundary = op?.boundary ?? suggestion?.meta?.anchor?.boundaryMeta ?? {};
  const boundaryHasQuoteCue =
    quoteCharRegex.test(boundary?.leftContext || "") ||
    quoteCharRegex.test(boundary?.rightContext || "") ||
    quoteCharRegex.test(boundary?.beforeToken?.tokenText || "") ||
    quoteCharRegex.test(boundary?.afterToken?.tokenText || "") ||
    quoteCharRegex.test(meta?.sourceTokenBefore?.tokenText || "") ||
    quoteCharRegex.test(meta?.sourceTokenAfter?.tokenText || "");
  const hasQuoteNearBoundary = (text, pos, radius = 2) => {
    if (typeof text !== "string" || !text.length) return false;
    if (!Number.isFinite(pos)) return false;
    const safePos = Math.max(0, Math.min(text.length, Math.floor(pos)));
    const from = Math.max(0, safePos - Math.max(0, radius));
    const to = Math.min(text.length, safePos + Math.max(0, radius) + 1);
    return quoteCharRegex.test(text.slice(from, to));
  };
  const sourceBoundaryHint = firstFiniteValue([
    boundary?.sourceBoundaryPos,
    boundary?.sourceBoundaryStart,
    boundary?.sourceBoundaryEnd,
    boundary?.resolvedPos,
    boundary?.requestedPos,
    suggestion?.meta?.op?.originalPos,
    suggestion?.meta?.op?.correctedPos,
    op?.start,
    op?.end,
  ]);
  const liveBoundaryHint =
    Number.isFinite(sourceBoundaryHint) && typeof sourceText === "string"
      ? mapIndexAcrossCanonical(sourceText, liveText, sourceBoundaryHint, { allowEnd: true })
      : sourceBoundaryHint;
  if (
    boundaryHasQuoteCue ||
    hasQuoteNearBoundary(sourceText, sourceBoundaryHint, 3) ||
    hasQuoteNearBoundary(liveText, liveBoundaryHint, 3)
  ) {
    // Route quote-adjacent edits through strict resolver to avoid generic after-anchor placement.
    logDesktopVerbose("Desktop direct insert:failed quote-adjacent", {
      paragraphIndex,
      suggestion: suggestionLog,
      sourceBoundaryHint,
      liveBoundaryHint,
    });
    return "failed";
  }

  const tryBoundaryInsert = async (sourceBoundary, traceLabel, fallbackSnippet) => {
    if (!Number.isFinite(sourceBoundary) || sourceBoundary < 0) return false;
    const mappedBoundary = mapIndexAcrossCanonical(sourceText, liveText, sourceBoundary, {
      allowEnd: true,
    });
    if (!Number.isFinite(mappedBoundary) || mappedBoundary < 0 || mappedBoundary > liveText.length) {
      return false;
    }
    let adjustedBoundary = Math.max(0, Math.min(liveText.length, Math.floor(mappedBoundary)));
    while (adjustedBoundary > 0 && /\s/u.test(liveText[adjustedBoundary - 1] || "")) {
      adjustedBoundary--;
    }
    logDesktopVerbose("Desktop direct insert:boundary candidate", {
      paragraphIndex,
      suggestion: suggestionLog,
      traceLabel,
      sourceBoundary,
      mappedBoundary,
      adjustedBoundary,
      sourcePreview: clipDesktopPreviewWindow(sourceText, sourceBoundary),
      livePreview: clipDesktopPreviewWindow(liveText, adjustedBoundary),
    });
    if (hasCommaNearMappedHint(liveText, adjustedBoundary, 0)) {
      logDesktopVerbose("Desktop direct insert:boundary noop", {
        paragraphIndex,
        suggestion: suggestionLog,
        traceLabel,
        adjustedBoundary,
      });
      return "noop";
    }
    if (adjustedBoundary < liveText.length) {
      const range = await getRangeForAnchorSpan(
        context,
        paragraph,
        anchorsEntry,
        adjustedBoundary,
        Math.min(adjustedBoundary + 1, liveText.length),
        traceLabel,
        fallbackSnippet
      );
      if (!range) return false;
      range.insertText(",", Word.InsertLocation.before);
      logDesktopVerbose("Desktop direct insert:boundary applied", {
        paragraphIndex,
        suggestion: suggestionLog,
        traceLabel,
        adjustedBoundary,
        insertLocation: "before",
      });
      return true;
    }
    if (!liveText.length) return false;
    const range = await getRangeForAnchorSpan(
      context,
      paragraph,
      anchorsEntry,
      Math.max(0, liveText.length - 1),
      liveText.length,
      `${traceLabel}-append`,
      fallbackSnippet || liveText.slice(Math.max(0, liveText.length - 1))
    );
    if (!range) return false;
    range.insertText(",", Word.InsertLocation.after);
    logDesktopVerbose("Desktop direct insert:boundary applied", {
      paragraphIndex,
      suggestion: suggestionLog,
      traceLabel,
      adjustedBoundary,
      insertLocation: "after",
    });
    return true;
  };

  const tryAnchorInsert = async (anchor, insertLocation, traceLabel) => {
    if (!Number.isFinite(anchor?.charStart) || anchor.charStart < 0) return false;
    const anchorEnd = getAnchorResolvedEnd(anchor);
    if (!Number.isFinite(anchorEnd) || anchorEnd <= anchor.charStart) return false;
    const sourceBoundary = insertLocation === Word.InsertLocation.after ? anchorEnd : anchor.charStart;
    const boundaryFirst = await tryBoundaryInsert(
      sourceBoundary,
      `${traceLabel}-boundary-first`,
      anchor.tokenText || op?.snippet || ","
    );
    if (boundaryFirst === true || boundaryFirst === "noop") {
      return boundaryFirst;
    }
    const mappedBoundary = mapIndexAcrossCanonical(sourceText, liveText, sourceBoundary);
    if (Number.isFinite(mappedBoundary) && hasCommaNearMappedHint(liveText, mappedBoundary, 0)) {
      return "noop";
    }
    const range = await getRangeForAnchorSpan(
      context,
      paragraph,
      anchorsEntry,
      anchor.charStart,
      anchorEnd,
      traceLabel,
      anchor.tokenText || op?.snippet || ","
    );
    if (!range) return false;
    range.insertText(",", insertLocation);
    return true;
  };

  const beforeAnchor = meta.sourceTokenBefore ?? null;
  const atAnchor = meta.sourceTokenAt ?? null;
  const afterAnchor = meta.sourceTokenAfter ?? null;
  const anchorCandidates = [
    { anchor: beforeAnchor, location: Word.InsertLocation.after, label: "before" },
    { anchor: atAnchor, location: Word.InsertLocation.after, label: "at" },
    { anchor: afterAnchor, location: Word.InsertLocation.before, label: "after" },
  ];

  for (const candidate of anchorCandidates) {
    if (!candidate.anchor) continue;
    const status = await tryAnchorInsert(
      candidate.anchor,
      candidate.location,
      `desktop-authoritative-${candidate.label}`
    );
    logDesktopVerbose("Desktop direct insert:anchor candidate result", {
      paragraphIndex,
      suggestion: suggestionLog,
      anchorLabel: candidate.label,
      insertLocation: candidate.location,
      status,
    });
    if (status === "noop") return "noop";
    if (status) return "applied";
  }

  const fallbackBoundaryHints = [
    getAnchorResolvedEnd(beforeAnchor),
    getAnchorResolvedEnd(atAnchor),
    Number.isFinite(afterAnchor?.charStart) ? afterAnchor.charStart : -1,
    suggestion?.charHint?.start,
    meta?.charStart,
    suggestion?.meta?.op?.originalPos,
  ].filter((value, index, arr) => Number.isFinite(value) && value >= 0 && arr.indexOf(value) === index);

  for (const sourceBoundary of fallbackBoundaryHints) {
    const status = await tryBoundaryInsert(
      sourceBoundary,
      "desktop-authoritative-boundary",
      op?.snippet || meta?.highlightText || ","
    );
    logDesktopVerbose("Desktop direct insert:fallback boundary result", {
      paragraphIndex,
      suggestion: suggestionLog,
      sourceBoundary,
      status,
    });
    if (status === "noop") return "noop";
    if (status) return "applied";
  }

  logDesktopVerbose("Desktop direct insert:failed no-boundary-match", {
    paragraphIndex,
    suggestion: suggestionLog,
  });
  return "failed";
}

async function searchParagraphForSnippet(context, paragraph, snippet) {
  const range = paragraph.getRange();
  const matches = range.search(snippet, {
    matchCase: true,
    matchWholeWord: false,
    ignoreSpace: false,
    ignorePunct: false,
  });
  matches.load("items");
  await context.sync();
  return matches;
}

function findAllExactSnippetOccurrences(text, snippet) {
  const safeText = typeof text === "string" ? text : "";
  const safeSnippet = typeof snippet === "string" ? snippet : "";
  if (!safeText.length || !safeSnippet.length) return [];
  const starts = [];
  let searchFrom = 0;
  while (searchFrom <= safeText.length - safeSnippet.length) {
    const matchIndex = safeText.indexOf(safeSnippet, searchFrom);
    if (matchIndex < 0) break;
    starts.push(matchIndex);
    searchFrom = matchIndex + 1;
  }
  return starts;
}

async function findExactSnippetRangeNearIndex(
  context,
  paragraph,
  liveText,
  snippet,
  hintIndex,
  reason = "snippet-range"
) {
  if (!paragraph || typeof paragraph.getRange !== "function") return null;
  if (typeof snippet !== "string" || !snippet.length) return null;
  const safeLiveText = typeof liveText === "string" ? liveText : "";
  try {
    const matches = await searchParagraphForSnippet(context, paragraph, snippet);
    if (!matches?.items?.length) {
      warn(`findExactSnippetRangeNearIndex(${reason}): snippet not found`, {
        snippet,
        hintIndex,
      });
      return null;
    }
    const safeHint = Number.isFinite(hintIndex)
      ? Math.max(0, Math.min(Math.floor(hintIndex), safeLiveText.length))
      : 0;
    const occurrence = countSnippetOccurrencesBefore(safeLiveText, snippet, safeHint);
    return matches.items[Math.min(occurrence, matches.items.length - 1)] || null;
  } catch (err) {
    warn(`findExactSnippetRangeNearIndex(${reason}) failed`, err);
    return null;
  }
}

async function findUniqueExactSnippetRangeNearIndex(
  context,
  paragraph,
  liveText,
  snippet,
  hintIndex,
  reason = "unique-snippet-range",
  maxHintDrift = 12
) {
  if (!paragraph || typeof paragraph.getRange !== "function") return null;
  if (typeof snippet !== "string" || !snippet.length) return null;
  const safeLiveText = typeof liveText === "string" ? liveText : "";
  const occurrences = findAllExactSnippetOccurrences(safeLiveText, snippet);
  if (!occurrences.length) {
    warn(`findUniqueExactSnippetRangeNearIndex(${reason}): snippet not found`, {
      snippet,
      hintIndex,
    });
    return null;
  }

  let occurrenceIndex = -1;
  if (occurrences.length === 1) {
    occurrenceIndex = 0;
  } else if (Number.isFinite(hintIndex)) {
    const safeHint = Math.max(0, Math.min(Math.floor(hintIndex), safeLiveText.length));
    const nearby = occurrences
      .map((start, index) => ({
        start,
        index,
        drift: Math.abs(start - safeHint),
      }))
      .filter((item) => item.drift <= maxHintDrift);
    if (nearby.length === 1) {
      occurrenceIndex = nearby[0].index;
    }
  }
  if (occurrenceIndex < 0) {
    warn(`findUniqueExactSnippetRangeNearIndex(${reason}): ambiguous snippet`, {
      snippet,
      hintIndex,
      occurrenceCount: occurrences.length,
    });
    return null;
  }

  try {
    const matches = await searchParagraphForSnippet(context, paragraph, snippet);
    const range = matches?.items?.[Math.min(occurrenceIndex, (matches?.items?.length || 1) - 1)] || null;
    if (!range) {
      warn(`findUniqueExactSnippetRangeNearIndex(${reason}): range lookup failed`, {
        snippet,
        hintIndex,
        occurrenceIndex,
      });
      return null;
    }
    const start = occurrences[occurrenceIndex];
    return {
      range,
      start,
      end: start + snippet.length,
      occurrenceIndex,
    };
  } catch (err) {
    warn(`findUniqueExactSnippetRangeNearIndex(${reason}) failed`, err);
    return null;
  }
}

async function findReplaceableRegionRangeNearIndex(
  context,
  paragraph,
  liveText,
  replaceStart,
  replaceEnd,
  reason = "replaceable-region"
) {
  if (!paragraph || typeof paragraph.getRange !== "function") return null;
  const safeLiveText = typeof liveText === "string" ? liveText : "";
  if (!safeLiveText.length) return null;
  if (!Number.isFinite(replaceStart) || !Number.isFinite(replaceEnd)) return null;
  const safeStart = Math.max(0, Math.min(Math.floor(replaceStart), safeLiveText.length));
  const safeEnd = Math.max(safeStart, Math.min(Math.floor(replaceEnd), safeLiveText.length));
  if (safeEnd <= safeStart) return null;

  let searchStart = safeStart;
  let searchEnd = safeEnd;
  while (searchStart > 0 && /\s/u.test(safeLiveText[searchStart])) {
    searchStart--;
  }
  while (searchStart < safeEnd && /\s/u.test(safeLiveText[searchStart])) {
    searchStart++;
  }
  if (searchStart >= safeEnd) {
    searchStart = Math.max(0, safeStart - 1);
  } else if (searchStart > safeStart) {
    searchStart--;
  }
  while (searchEnd < safeLiveText.length && /\s/u.test(safeLiveText[searchEnd - 1])) {
    searchEnd++;
  }
  if (searchEnd <= searchStart || searchEnd > safeLiveText.length) {
    searchEnd = Math.min(safeLiveText.length, Math.max(safeEnd, searchStart + 1));
  }

  const snippet = safeLiveText.slice(searchStart, searchEnd);
  if (!snippet || !/[^\s]/u.test(snippet)) return null;
  const range = await findExactSnippetRangeNearIndex(
    context,
    paragraph,
    safeLiveText,
    snippet,
    searchStart,
    reason
  );
  if (!range) return null;
  return {
    range,
    prefix: safeLiveText.slice(searchStart, safeStart),
    suffix: safeLiveText.slice(safeEnd, searchEnd),
  };
}

async function resolveExactWindowInsertRangeForSuggestion(
  context,
  paragraph,
  op,
  suggestion,
  reason = "exact-window-insert"
) {
  const exactWindow = suggestion?.meta?.anchor?.boundaryMeta?.exactApplyWindow ?? null;
  if (!exactWindow?.sourceWindow || !exactWindow?.correctedWindow) {
    return { range: null, insertLocation: null, reason: "insert_missing_exact_window" };
  }
  if (typeof paragraph.text !== "string") {
    paragraph.load("text");
    await context.sync();
  }
  const liveText = paragraph.text || "";
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
  const sourceText = typeof entry?.originalText === "string" ? entry.originalText : "";
  const mappedHint = sourceText
    ? mapIndexAcrossCanonical(sourceText, liveText, exactWindow.sourceWindowStart, { allowEnd: true })
    : exactWindow.sourceWindowStart;
  const matchedWindow = await findUniqueExactSnippetRangeNearIndex(
    context,
    paragraph,
    liveText,
    exactWindow.sourceWindow,
    mappedHint,
    reason,
    suggestion?.meta?.lemmaAnchorAuthoritative ? 20 : 10
  );
  if (!matchedWindow?.range || !Number.isFinite(matchedWindow.start)) {
    return { range: null, insertLocation: null, reason: "insert_exact_window_unresolved" };
  }

  const replaceStart = matchedWindow.start + exactWindow.replaceStartOffset;
  const replaceEnd = matchedWindow.start + exactWindow.sourceReplaceEndOffset;
  const replaceableRegion = await findReplaceableRegionRangeNearIndex(
    context,
    paragraph,
    liveText,
    replaceStart,
    replaceEnd,
    `${reason}-replace-region`
  );
  if (!replaceableRegion?.range) {
    return { range: null, insertLocation: null, reason: "insert_exact_window_region_unresolved" };
  }

  const correctedReplaceText = exactWindow.correctedWindow.slice(
    exactWindow.replaceStartOffset,
    exactWindow.correctedReplaceEndOffset
  );
  return {
    range: replaceableRegion.range,
    insertLocation: Word.InsertLocation.replace,
    replacement: `${replaceableRegion.prefix}${correctedReplaceText}${replaceableRegion.suffix}`,
    reason: null,
  };
}

async function getRangesForPlannedOperations(context, paragraph, snapshotText, plan, reason = "apply-planned") {
  if (!Array.isArray(plan) || !plan.length) return [];
  if (!paragraph || typeof paragraph.getRange !== "function") {
    return plan.map(() => null);
  }
  if (typeof paragraph.text !== "string") {
    paragraph.load("text");
    await context.sync();
  }

  const text = typeof snapshotText === "string" ? snapshotText : paragraph.text || "";
  const liveText = typeof paragraph.text === "string" ? paragraph.text : text;
  const searchOptions = {
    matchCase: true,
    matchWholeWord: false,
    ignoreSpace: false,
    ignorePunct: false,
  };

  const resolvedRanges = new Array(plan.length).fill(null);
  const blockedInsertIndexes = new Set();
  const blockedDeleteIndexes = new Set();
  const requests = [];
  const searchCache = new Map();
  // Use the same token-boundary resolver for single-apply and apply-all so
  // batch inserts do not fall back to weaker snippet placement like `word ,next`.
  // Disable exact-window replace for inserts; it rewrites spans and can mangle words.
  const shouldUseExactWindowInsertResolution = false;
  const strictResolutionOnlineOnly = isWordOnline();
  const isDesktopRuntime = !strictResolutionOnlineOnly;
  for (let opIndex = 0; opIndex < plan.length; opIndex++) {
    const op = plan[opIndex];
    if (!op) continue;
    op.insertLocation =
      op.kind === "insert"
        ? op.insertAtEnd
          ? Word.InsertLocation.after
          : Word.InsertLocation.before
        : Word.InsertLocation.replace;
    if (op.kind === "insert") {
      const boundaryStart = Number.isFinite(op?.boundary?.sourceBoundaryStart) ? op.boundary.sourceBoundaryStart : op.start;
      const boundaryEnd = Number.isFinite(op?.boundary?.sourceBoundaryEnd) ? op.boundary.sourceBoundaryEnd : op.end;
      const windowStart = Math.max(0, Math.min(boundaryStart, boundaryEnd) - 4);
      const windowEnd = Math.max(boundaryStart, boundaryEnd) + 4;
      op.hasLocalDeleteCounterpart = plan.some((candidate, candidateIndex) => {
        if (candidateIndex === opIndex || candidate?.kind !== "delete") return false;
        const deleteStart = Number.isFinite(candidate?.start) ? candidate.start : -1;
        return deleteStart >= windowStart && deleteStart <= windowEnd;
      });
    }
    const opSuggestions = Array.isArray(op?.suggestions) ? op.suggestions.filter(Boolean) : [];
    const suggestion = opSuggestions[0] || null;
    const quoteSuggestion =
      opSuggestions.find((candidate) => suggestionTouchesQuoteBoundary(candidate)) || null;
    const strictSuggestion = quoteSuggestion || suggestion;
    const hasRelocationCounterpart = suggestion
      ? plan.some((candidate, candidateIndex) => {
          if (candidateIndex === opIndex) return false;
          const candidateSuggestion = Array.isArray(candidate?.suggestions) ? candidate.suggestions[0] : null;
          return isSameCommaRelocationPair(suggestion, candidateSuggestion);
        })
      : false;
    const explicitQuoteIntentCandidates = [
      resolveSuggestionQuoteBoundaryIntent(strictSuggestion, op),
      normalizeQuoteBoundaryIntent(op?.explicitQuoteIntent),
      normalizeQuoteBoundaryIntent(op?.boundary?.explicitQuoteIntent),
      normalizeQuoteBoundaryIntent(op?.boundary?.quotePolicy),
      ...opSuggestions.map((candidate) => resolveSuggestionQuoteBoundaryIntent(candidate, op)),
    ].filter(Boolean);
    const hasExplicitQuoteIntent = explicitQuoteIntentCandidates.some((intent) =>
      isExplicitQuoteBoundaryIntent(intent)
    );
    const opTouchesQuoteBoundary = opSuggestions.some((candidate) =>
      suggestionTouchesQuoteBoundary(candidate)
    );
    const shouldUseStrictInsertResolutionForOp =
      strictResolutionOnlineOnly ||
      (op.kind === "insert" &&
        (() => {
          const hasBoundaryTokenCue = Boolean(
            op?.boundary?.beforeToken?.tokenText ||
              op?.boundary?.afterToken?.tokenText ||
              suggestion?.meta?.anchor?.sourceTokenBefore?.tokenText ||
              suggestion?.meta?.anchor?.sourceTokenAfter?.tokenText
          );
          const opStart =
            Number.isFinite(op?.start) && op.start >= 0
              ? Math.floor(op.start)
              : Number.isFinite(op?.pos) && op.pos >= 0
                ? Math.floor(op.pos)
                : -1;
          const snippetChar =
            opStart >= 0 && opStart < text.length ? text.slice(opStart, Math.min(text.length, opStart + 1)) : "";
          const weakSnippet = !snippetChar.trim();
          const isAfterInsert = op?.insertLocation === Word.InsertLocation.after;
          const shouldForceDesktopStrict =
            isDesktopRuntime && suggestion && (hasBoundaryTokenCue || weakSnippet || isAfterInsert);
          if (shouldForceDesktopStrict) {
            logDesktopVerbose("Desktop strict insert forced", {
              opIndex,
              suggestionId: suggestion?.id ?? null,
              hasBoundaryTokenCue,
              weakSnippet,
              isAfterInsert,
            });
          }
          return hasExplicitQuoteIntent || opTouchesQuoteBoundary || shouldForceDesktopStrict;
        })());
    const shouldUseStrictDeleteResolutionForOp =
      strictResolutionOnlineOnly ||
      (op.kind === "delete" && (hasExplicitQuoteIntent || opTouchesQuoteBoundary));
    if (
      shouldUseExactWindowInsertResolution &&
      shouldUseStrictInsertResolutionForOp &&
      op.kind === "insert" &&
      suggestion
    ) {
      const exactWindowResolution = await resolveExactWindowInsertRangeForSuggestion(
        context,
        paragraph,
        op,
        suggestion,
        `${reason}-exact-window-insert`
      );
      if (exactWindowResolution?.range) {
        resolvedRanges[opIndex] = exactWindowResolution.range;
        op.insertLocation = exactWindowResolution.insertLocation ?? Word.InsertLocation.replace;
        if (typeof exactWindowResolution.replacement === "string") {
          op.replacement = exactWindowResolution.replacement;
        }
        op.strictResolutionBlocked = false;
        continue;
      }
      if (exactWindowResolution?.reason && exactWindowResolution.reason !== "insert_missing_exact_window") {
        op.strictResolutionBlocked = true;
        warn(`getRangesForPlannedOperations(${reason}): exact window insert resolution blocked apply`, {
          suggestionId: suggestion?.id ?? null,
          opIndex,
          resolutionReason: exactWindowResolution.reason,
        });
        continue;
      }
    }
    if (shouldUseStrictInsertResolutionForOp && op.kind === "insert" && strictSuggestion) {
      const strictResolution = await resolveStrictInsertRangeForSuggestion(
        context,
        paragraph,
        op,
        strictSuggestion,
        `${reason}-strict-insert`
      );
      if (strictResolution?.range) {
        resolvedRanges[opIndex] = strictResolution.range;
        op.insertLocation = strictResolution.insertLocation ?? Word.InsertLocation.replace;
        if (typeof strictResolution.replacement === "string") {
          op.replacement = strictResolution.replacement;
        }
        op.strictResolutionBlocked = false;
        continue;
      }
      blockedInsertIndexes.add(opIndex);
      op.strictResolutionBlocked = true;
      warn(`getRangesForPlannedOperations(${reason}): strict insert resolution blocked apply`, {
        opIndex,
          suggestionId: suggestion?.id ?? null,
          reason: strictResolution?.reason || "insert_strict_resolution_failed",
        });
      continue;
    }
    if (shouldUseStrictDeleteResolutionForOp && op.kind === "delete" && strictSuggestion) {
      const strictResolution = await resolveStrictDeleteRangeForSuggestion(
        context,
        paragraph,
        strictSuggestion,
        `${reason}-strict-delete`
      );
      if (strictResolution?.range) {
        resolvedRanges[opIndex] = strictResolution.range;
        op.insertLocation = strictResolution.insertLocation ?? Word.InsertLocation.replace;
        if (typeof strictResolution.replacement === "string") {
          op.replacement = strictResolution.replacement;
        }
        op.strictResolutionBlocked = false;
        continue;
      }
      if (hasRelocationCounterpart) {
        blockedDeleteIndexes.add(opIndex);
        op.strictResolutionBlocked = true;
        warn(`getRangesForPlannedOperations(${reason}): strict delete resolution blocked apply`, {
          opIndex,
          suggestionId: suggestion?.id ?? null,
          reason: strictResolution?.reason || "delete_strict_resolution_failed",
        });
      }
    }
  }

  if (blockedDeleteIndexes.size) {
    for (let opIndex = 0; opIndex < plan.length; opIndex++) {
      if (blockedInsertIndexes.has(opIndex)) continue;
      const op = plan[opIndex];
      if (op?.kind !== "insert") continue;
      const suggestion = Array.isArray(op?.suggestions) ? op.suggestions[0] : null;
      if (!suggestion) continue;
      const pairedBlockedDelete = plan.some((candidate, candidateIndex) => {
        if (!blockedDeleteIndexes.has(candidateIndex) || candidate?.kind !== "delete") return false;
        const candidateSuggestion = Array.isArray(candidate?.suggestions) ? candidate.suggestions[0] : null;
        return isSameCommaRelocationPair(suggestion, candidateSuggestion);
      });
      if (!pairedBlockedDelete) continue;
      resolvedRanges[opIndex] = null;
      blockedInsertIndexes.add(opIndex);
      op.strictResolutionBlocked = true;
      warn(`getRangesForPlannedOperations(${reason}): blocked insert because paired delete was unresolved`, {
        opIndex,
        suggestionId: suggestion?.id ?? null,
      });
    }
  }
  const perOpVariants = plan.map((op, opIndex) => {
    if (resolvedRanges[opIndex] || blockedInsertIndexes.has(opIndex) || blockedDeleteIndexes.has(opIndex)) return [];
    const safeStart = Math.max(0, Math.min(Math.floor(op.start ?? 0), Math.max(0, text.length - 1)));
    const computedEnd = Math.max(safeStart + 1, Math.floor(op.end ?? safeStart + 1));
    const safeEnd = Math.min(computedEnd, text.length);
    let snippet = text.slice(safeStart, safeEnd);
    if (!snippet && typeof op?.snippet === "string" && op.snippet.length) {
      snippet = op.snippet;
    }
    if (!snippet) return [];

    const variants = [];
    variants.push({ text: snippet, safeStart });
    const trimmed = snippet.trim();
    if (trimmed && trimmed !== snippet) {
      variants.push({ text: trimmed, safeStart });
    }

    const unique = [];
    const seen = new Set();
    for (const variant of variants) {
      if (seen.has(variant.text)) continue;
      seen.add(variant.text);
      let matches = searchCache.get(variant.text);
      if (!matches) {
        matches = paragraph.getRange().search(variant.text, searchOptions);
        matches.load("items");
        searchCache.set(variant.text, matches);
        requests.push({ matches, text: variant.text, safeStart, opIndex });
      }
      unique.push({ text: variant.text, safeStart, matches });
    }
    return unique;
  });

  if (requests.length) {
    await context.sync();
  }

  return plan.map((op, opIndex) => {
    if (resolvedRanges[opIndex]) return resolvedRanges[opIndex];
    if (blockedDeleteIndexes.has(opIndex)) return null;
    const variants = perOpVariants[opIndex] || [];
    if (!variants.length) return null;

    for (const variant of variants) {
      const items = variant.matches?.items || [];
      if (!items.length) continue;
      const mappedStart = mapIndexAcrossCanonical(text, liveText, variant.safeStart);
      const occurrence = countSnippetOccurrencesBefore(liveText, variant.text, mappedStart);
      const idx = Math.min(occurrence, items.length - 1);
      return items[idx];
    }

    const fallback = variants[0];
    warn(`getRangesForPlannedOperations(${reason}): snippet not found`, {
      snippet: fallback?.text,
      safeStart: fallback?.safeStart,
    });
    return null;
  });
}

function buildDeleteSuggestionMetadata(entry, charIndex) {
  const sourceAround = findAnchorsNearChar(entry, "source", charIndex);
  const documentOffset = entry?.documentOffset ?? 0;
  const charStart = Math.max(0, charIndex);
  const charEnd = charStart + 1;
  const paragraphText = entry?.originalText ?? "";
  const highlightText = paragraphText.slice(charStart, charEnd) || ",";
  return {
    kind: "delete",
    paragraphIndex: entry?.paragraphIndex ?? -1,
    charStart,
    charEnd,
    documentCharStart: documentOffset + charStart,
    documentCharEnd: documentOffset + charEnd,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    highlightText,
  };
}

const EXACT_APPLY_WINDOW_RADIUS_CHARS = 32;

function buildExactApplyWindowMeta(sourceText, correctedText, sourceBoundaryPos, targetBoundaryPos) {
  const safeSource = typeof sourceText === "string" ? sourceText : "";
  const safeCorrected = typeof correctedText === "string" ? correctedText : "";
  if (
    !safeSource ||
    !safeCorrected ||
    !Number.isFinite(sourceBoundaryPos) ||
    sourceBoundaryPos < 0 ||
    !Number.isFinite(targetBoundaryPos) ||
    targetBoundaryPos < 0
  ) {
    return null;
  }

  const safeSourceBoundary = Math.max(0, Math.min(Math.floor(sourceBoundaryPos), safeSource.length));
  const safeTargetBoundary = Math.max(0, Math.min(Math.floor(targetBoundaryPos), safeCorrected.length));
  const leftSpan = Math.min(EXACT_APPLY_WINDOW_RADIUS_CHARS, safeSourceBoundary, safeTargetBoundary);
  const rightSpan = Math.min(
    EXACT_APPLY_WINDOW_RADIUS_CHARS,
    safeSource.length - safeSourceBoundary,
    safeCorrected.length - safeTargetBoundary
  );
  const sourceWindowStart = safeSourceBoundary - leftSpan;
  const sourceWindowEnd = safeSourceBoundary + rightSpan;
  const correctedWindowStart = safeTargetBoundary - leftSpan;
  const correctedWindowEnd = safeTargetBoundary + rightSpan;
  const sourceWindow = safeSource.slice(sourceWindowStart, sourceWindowEnd);
  const correctedWindow = safeCorrected.slice(correctedWindowStart, correctedWindowEnd);
  if (!sourceWindow || !correctedWindow || sourceWindow === correctedWindow) {
    return null;
  }

  const maxSharedPrefix = Math.min(sourceWindow.length, correctedWindow.length);
  let replaceStartOffset = 0;
  while (
    replaceStartOffset < maxSharedPrefix &&
    sourceWindow[replaceStartOffset] === correctedWindow[replaceStartOffset]
  ) {
    replaceStartOffset++;
  }

  const maxSharedSuffix = Math.min(sourceWindow.length, correctedWindow.length) - replaceStartOffset;
  let sharedSuffixLen = 0;
  while (
    sharedSuffixLen < maxSharedSuffix &&
    sourceWindow[sourceWindow.length - 1 - sharedSuffixLen] ===
      correctedWindow[correctedWindow.length - 1 - sharedSuffixLen]
  ) {
    sharedSuffixLen++;
  }

  let sourceReplaceEndOffset = sourceWindow.length - sharedSuffixLen;
  let correctedReplaceEndOffset = correctedWindow.length - sharedSuffixLen;
  if (sourceReplaceEndOffset <= replaceStartOffset) {
    if (sourceReplaceEndOffset < sourceWindow.length) {
      sourceReplaceEndOffset++;
      correctedReplaceEndOffset = Math.min(correctedWindow.length, correctedReplaceEndOffset + 1);
    } else if (replaceStartOffset > 0) {
      replaceStartOffset--;
    } else {
      return null;
    }
  }

  return {
    sourceWindow,
    correctedWindow,
    sourceWindowStart,
    correctedWindowStart,
    sourceBoundaryOffset: safeSourceBoundary - sourceWindowStart,
    targetBoundaryOffset: safeTargetBoundary - correctedWindowStart,
    replaceStartOffset,
    sourceReplaceEndOffset,
    correctedReplaceEndOffset,
  };
}

function buildInsertSuggestionMetadata(entry, { originalCharIndex, targetCharIndex }) {
  const srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  const targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  const sourceAround = findAnchorsNearChar(entry, "source", srcIndex);
  const targetAround = findAnchorsNearChar(entry, "target", targetIndex);
  const documentOffset = entry?.documentOffset ?? 0;
  const originalText = typeof entry?.originalText === "string" ? entry.originalText : "";
  const correctedText = typeof entry?.correctedText === "string" ? entry.correctedText : "";
  const buildBoundaryMeta = () => {
    const directionalOpeningQuoteChars = new Set(["\u00BB", "\u203A", "(", "["]);
    const directionalClosingQuoteChars = new Set(["\u00AB", "\u2039", ")", "]"]);
    const genericQuoteCharRegex =
      /["'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u02BC\uFF02\uFF07]/u;
    const nearestNonSpaceLeft = (startIndex) => {
      let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : -1;
      while (idx >= 0 && /\s/u.test(correctedText[idx] || "")) idx--;
      return {
        index: idx >= 0 ? idx : -1,
        char: idx >= 0 ? correctedText[idx] || "" : "",
      };
    };
    const nearestNonSpaceRight = (startIndex) => {
      let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : 0;
      while (idx < correctedText.length && /\s/u.test(correctedText[idx] || "")) idx++;
      return {
        index: idx < correctedText.length ? idx : -1,
        char: idx < correctedText.length ? correctedText[idx] || "" : "",
      };
    };
    const classifyQuoteRoleAt = (quoteIndex, quoteChar = null) => {
      if (!Number.isFinite(quoteIndex) || quoteIndex < 0 || quoteIndex >= correctedText.length) return null;
      const current = typeof quoteChar === "string" && quoteChar.length ? quoteChar : correctedText[quoteIndex] || "";
      if (!current) return null;
      if (directionalOpeningQuoteChars.has(current)) return "opening";
      if (directionalClosingQuoteChars.has(current)) return "closing";
      if (!genericQuoteCharRegex.test(current)) return null;
      let left = quoteIndex - 1;
      while (left >= 0 && /[\s\u200B-\u200D\uFEFF]/u.test(correctedText[left] || "")) left--;
      let right = quoteIndex + 1;
      while (right < correctedText.length && /[\s\u200B-\u200D\uFEFF]/u.test(correctedText[right] || "")) right++;
      const leftIsWord = left >= 0 && /[\p{L}\p{N}]/u.test(correctedText[left] || "");
      const rightIsWord = right < correctedText.length && /[\p{L}\p{N}]/u.test(correctedText[right] || "");
      const immediateLeft = quoteIndex > 0 ? correctedText[quoteIndex - 1] || "" : "";
      const immediateRight = quoteIndex + 1 < correctedText.length ? correctedText[quoteIndex + 1] || "" : "";
      const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
      const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
      const leftHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateLeft || "");
      const rightHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateRight || "");
      if (rightIsWord && !leftIsWord) return "opening";
      if (leftIsWord && !rightIsWord) return "closing";
      if (leftIsWord && rightIsWord) {
        if (leftAdjacentIsWord && rightAdjacentIsWord) return null;
        if (rightHasGap && !leftHasGap) return "closing";
        if (leftHasGap && !rightHasGap) return "opening";
        if (leftAdjacentIsWord && !rightAdjacentIsWord) return "closing";
        if (!leftAdjacentIsWord && rightAdjacentIsWord) return "opening";
        return "closing";
      }
      return "closing";
    };
    const resolveCommaIndex = () => {
      if (!correctedText || !Number.isFinite(targetIndex) || targetIndex < 0) return -1;
      const direct = [targetIndex, targetIndex - 1, targetIndex + 1];
      for (const idx of direct) {
        if (idx >= 0 && idx < correctedText.length && correctedText[idx] === ",") return idx;
      }
      let left = targetIndex - 1;
      while (left >= 0 && /\s/u.test(correctedText[left])) left--;
      if (left >= 0 && correctedText[left] === ",") return left;
      let right = targetIndex;
      while (right < correctedText.length && /\s/u.test(correctedText[right])) right++;
      if (right < correctedText.length && correctedText[right] === ",") return right;
      return -1;
    };
    const classifyIntent = () => {
      const commaIndex = resolveCommaIndex();
      if (commaIndex < 0 || commaIndex >= correctedText.length) return "unknown";
      const leftInfo = nearestNonSpaceLeft(commaIndex - 1);
      const rightInfo = nearestNonSpaceRight(commaIndex + 1);
      const rightRole = classifyQuoteRoleAt(rightInfo.index, rightInfo.char);
      const leftRole = classifyQuoteRoleAt(leftInfo.index, leftInfo.char);
      if (rightRole === "closing") return "before_closing_quote";
      if (leftRole === "closing") return "after_closing_quote";
      if (rightRole === "opening") return "before_opening_quote";
      if (leftRole === "opening") return "after_opening_quote";
      return "none";
    };
    const commaIndex = resolveCommaIndex();
    const beforeAnchor = targetAround.before ?? sourceAround.before ?? null;
    const afterAnchor = targetAround.after ?? sourceAround.after ?? null;
    const preferredSide =
      Number.isFinite(afterAnchor?.charStart) && Number.isFinite(targetIndex) && targetIndex >= afterAnchor.charStart
        ? "before_after_token"
        : "after_before_token";
    return {
      sourceBoundaryPos: Number.isFinite(srcIndex) && srcIndex >= 0 ? srcIndex : null,
      targetBoundaryPos: Number.isFinite(targetIndex) && targetIndex >= 0 ? targetIndex : null,
      targetCommaPos: commaIndex >= 0 ? commaIndex : null,
      beforeToken: snapshotAnchor(beforeAnchor),
      afterToken: snapshotAnchor(afterAnchor),
      preferredSide,
      explicitQuoteIntent: classifyIntent(),
      leftContext: correctedText.slice(Math.max(0, targetIndex - 12), Math.max(0, targetIndex)),
      rightContext: correctedText.slice(targetIndex + 1, Math.min(correctedText.length, targetIndex + 13)),
      exactApplyWindow: buildExactApplyWindowMeta(originalText, correctedText, srcIndex, targetIndex),
    };
  };
  const highlightAnchor =
    sourceAround.at ??
    sourceAround.before ??
    sourceAround.after ??
    targetAround.at ??
    targetAround.before ??
    targetAround.after;
  const highlightCharStart = highlightAnchor?.charStart ?? srcIndex;
  const highlightCharEnd = highlightAnchor?.charEnd ?? srcIndex;
  const paragraphText = originalText;
  let highlightText = "";
  if (highlightCharStart >= 0 && highlightCharEnd > highlightCharStart) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharEnd);
  }
  if (!highlightText && highlightCharStart >= 0) {
    highlightText = paragraphText.slice(highlightCharStart, highlightCharStart + 1);
  }

  return {
    kind: "insert",
    paragraphIndex: entry?.paragraphIndex ?? -1,
    targetCharStart: targetIndex,
    targetCharEnd: targetIndex >= 0 ? targetIndex + 1 : targetIndex,
    targetDocumentCharStart: targetIndex >= 0 ? documentOffset + targetIndex : targetIndex,
    targetDocumentCharEnd: targetIndex >= 0 ? documentOffset + targetIndex + 1 : targetIndex,
    highlightCharStart,
    highlightCharEnd,
    highlightText,
    sourceTokenBefore: snapshotAnchor(sourceAround.before),
    sourceTokenAt: snapshotAnchor(sourceAround.at),
    sourceTokenAfter: snapshotAnchor(sourceAround.after),
    targetTokenBefore: snapshotAnchor(targetAround.before),
    targetTokenAt: snapshotAnchor(targetAround.at),
    targetTokenAfter: snapshotAnchor(targetAround.after),
    highlightAnchorTarget: snapshotAnchor(highlightAnchor),
    boundaryMeta: buildBoundaryMeta(),
  };
}

function buildDeleteRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
  if (!meta) return ranges;
  const allowCharHint = !suggestion?.meta?.lowAnchorReliability;
  const addRange = (start, end, snippet) => {
    if (!Number.isFinite(start) || start < 0) return;
    const safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({ start, end: safeEnd, snippet });
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  if (meta.highlightAnchorTarget) {
    addRange(
      meta.highlightAnchorTarget.charStart,
      meta.highlightAnchorTarget.charEnd,
      meta.highlightAnchorTarget.tokenText
    );
  }
  if (allowCharHint) {
    const charHint = suggestion?.charHint;
    addRange(charHint?.start, charHint?.end, meta.highlightText);
  }
  return ranges;
}

function buildInsertRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
  if (!meta) return ranges;
  const allowCharHint = !suggestion?.meta?.lowAnchorReliability;
  const op = suggestion?.meta?.op;
  const addRange = (start, end, snippet) => {
    if (!Number.isFinite(start) || start < 0) return;
    const safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({ start, end: safeEnd, snippet });
  };
  const addAnchor = (anchor) => {
    if (!anchor) return;
    addRange(anchor.charStart, anchor.charEnd, anchor.tokenText);
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.targetCharStart, meta.targetCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  // Keep op coordinates in candidate set even when charHint is disabled for low-reliability anchors.
  addRange(op?.originalPos, Number.isFinite(op?.originalPos) ? op.originalPos + 1 : null, meta.highlightText);
  addRange(op?.correctedPos, Number.isFinite(op?.correctedPos) ? op.correctedPos + 1 : null, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.sourceTokenAfter);
  addAnchor(meta.targetTokenBefore);
  addAnchor(meta.targetTokenAfter);
  if (allowCharHint) {
    const charHint = suggestion?.charHint;
    addRange(charHint?.start, charHint?.end, meta.highlightText);
  }
  return ranges;
}

// Vstavi vejico na podlagi sidra
async function insertCommaAt(context, paragraph, original, corrected, atCorrectedPos) {
  const { left, right } = makeAnchor(corrected, atCorrectedPos);
  const pr = paragraph.getRange();

  if (left.length > 0) {
    const m = pr.search(left, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("insert: left anchor not found");
      return;
    }
    const after = m.items[0].getRange("After");
    after.insertText(",", Word.InsertLocation.before);
  } else {
    if (!right) {
      warn("insert: no right anchor at paragraph start");
      return;
    }
    const m = pr.search(right, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("insert: right anchor not found");
      return;
    }
    const before = m.items[0].getRange("Before");
    before.insertText(",", Word.InsertLocation.before);
  }
}

// Po potrebi dodaj presledek po vejici (razen pred narekovaji ali stevkami)
async function ensureSpaceAfterComma(context, paragraph, corrected, atCorrectedPos) {
  const next = charAtSafe(corrected, atCorrectedPos + 1);
  if (!next || /\s/.test(next) || QUOTES.has(next) || isDigit(next)) return;

  const { left, right } = makeAnchor(corrected, atCorrectedPos + 1);
  const pr = paragraph.getRange();

  if (left.length > 0) {
    const m = pr.search(left, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("space-after: left anchor not found");
      return;
    }
    const beforeRight = m.items[0].getRange("Before");
    beforeRight.insertText(" ", Word.InsertLocation.before);
  } else if (right.length > 0) {
    const m = pr.search(right, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("space-after: right anchor not found");
      return;
    }
    const before = m.items[0].getRange("Before");
    before.insertText(" ", Word.InsertLocation.before);
  }
}

// Brisi samo znak vejice
async function deleteCommaAt(context, paragraph, original, atOriginalPos) {
  const pr = paragraph.getRange();
  let ordinal = 0;
  for (let i = 0; i <= atOriginalPos && i < original.length; i++) {
    if (original[i] === ",") ordinal++;
  }
  if (ordinal === 0) {
    warn("delete: no comma found in original at pos", atOriginalPos);
    return;
  }
  const matches = pr.search(",", { matchCase: false, matchWholeWord: false });
  matches.load("items");
  await context.sync();
  const idx = ordinal - 1;
  if (idx >= matches.items.length) {
    warn("delete: comma ordinal out of range", ordinal, "/", matches.items.length);
    return;
  }
  matches.items[idx].insertText("", Word.InsertLocation.replace);
}

async function highlightSuggestionOnline(context, paragraph, suggestion) {
  try {
    if (!suggestion) return false;
    if (suggestion.kind === "delete") {
      return highlightDeleteSuggestion(context, paragraph, suggestion);
    }
    return highlightInsertSuggestion(context, paragraph, suggestion);
  } catch (err) {
    warn("highlightSuggestionOnline failed; skipping marker", err);
    return false;
  }
}

function normalizeHighlightColorValue(color) {
  if (typeof color !== "string") return null;
  const trimmed = color.trim();
  if (!trimmed) return null;
  const lowered = trimmed.toLowerCase();
  if (lowered === "none" || lowered === "nocolor" || lowered === "no color") return null;
  return trimmed;
}

function normalizeHighlightColorForCompare(color) {
  const normalized = normalizeHighlightColorValue(color);
  return normalized ? normalized.toLowerCase() : null;
}

function normalizeHighlightColorToken(color) {
  const normalized = normalizeHighlightColorForCompare(color);
  if (!normalized) return null;
  return normalized.replace(/\s+/g, "");
}

function normalizeUnderlineStyleValue(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lowered = trimmed.toLowerCase();
  if (lowered === "none") return null;
  return trimmed;
}

function normalizeUnderlineStyleForCompare(value) {
  const normalized = normalizeUnderlineStyleValue(value);
  return normalized ? normalized.toLowerCase() : null;
}

function isVejiceMarkerHighlightColor(color) {
  const token = normalizeHighlightColorToken(color);
  if (!token) return false;
  const insertToken = normalizeHighlightColorToken(HIGHLIGHT_INSERT);
  const deleteToken = normalizeHighlightColorToken(HIGHLIGHT_DELETE);
  return token === insertToken || token === deleteToken;
}

function isStrictLegacyVejiceMarkerHighlightColor(color) {
  return isVejiceMarkerHighlightColor(color);
}

function sanitizeRestoredHighlightColor(color) {
  const normalized = normalizeHighlightColorValue(color);
  if (!normalized) return null;
  // Never restore add-in marker colors; they should be cleared, not persisted.
  if (isVejiceMarkerHighlightColor(normalized)) return null;
  return normalized;
}

function isVejiceMarkerStyle(underline, underlineColor) {
  const style = normalizeUnderlineStyleForCompare(underline);
  const color = normalizeHighlightColorForCompare(underlineColor);
  if (!style) return false;
  const insertStyle = normalizeUnderlineStyleForCompare(VEJICE_MARKER_INSERT_UNDERLINE);
  const deleteStyle = normalizeUnderlineStyleForCompare(VEJICE_MARKER_DELETE_UNDERLINE);
  const insertColor = normalizeHighlightColorForCompare(VEJICE_MARKER_INSERT_UNDERLINE_COLOR);
  const deleteColor = normalizeHighlightColorForCompare(VEJICE_MARKER_DELETE_UNDERLINE_COLOR);
  if (!color) {
    return style === insertStyle || style === deleteStyle;
  }
  return (
    (style === insertStyle && color === insertColor) ||
    (style === deleteStyle && color === deleteColor)
  );
}

function getSuggestionMarkerFormat(suggestion) {
  if (suggestion?.kind === "delete") {
    return {
      underline: VEJICE_MARKER_DELETE_UNDERLINE,
      underlineColor: VEJICE_MARKER_DELETE_UNDERLINE_COLOR,
    };
  }
  return {
    underline: VEJICE_MARKER_INSERT_UNDERLINE,
    underlineColor: VEJICE_MARKER_INSERT_UNDERLINE_COLOR,
  };
}

function getSuggestionMarkerHighlightColor(suggestion) {
  return suggestion?.kind === "delete" ? HIGHLIGHT_DELETE : HIGHLIGHT_INSERT;
}

function sanitizeMarkerIdPart(value) {
  if (value === null || typeof value === "undefined") return "";
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized;
}

function buildSuggestionMarkerId(suggestion) {
  const paragraphIndex = Number.isFinite(suggestion?.paragraphIndex) ? suggestion.paragraphIndex : "p";
  const kind = sanitizeMarkerIdPart(suggestion?.kind || "op");
  const opPos =
    suggestion?.meta?.op?.originalPos ??
    suggestion?.meta?.op?.pos ??
    suggestion?.charHint?.start ??
    "x";
  const baseId = sanitizeMarkerIdPart(suggestion?.id);
  const raw = [baseId, `p${paragraphIndex}`, kind, `at${opPos}`].filter(Boolean).join("-");
  if (raw) return raw.slice(0, 120);
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSuggestionMarkerTag(suggestion, { create = false } = {}) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const existingTag = typeof suggestion.markerTag === "string" ? suggestion.markerTag.trim() : "";
  if (existingTag.startsWith(VEJICE_MARKER_TAG_PREFIX)) {
    if (!suggestion.markerId) {
      suggestion.markerId = existingTag.slice(VEJICE_MARKER_TAG_PREFIX.length);
    }
    return existingTag;
  }
  const existingId = sanitizeMarkerIdPart(suggestion.markerId);
  if (existingId) {
    const tag = `${VEJICE_MARKER_TAG_PREFIX}${existingId}`;
    suggestion.markerId = existingId;
    suggestion.markerTag = tag;
    return tag;
  }
  if (!create) return null;
  const generated = buildSuggestionMarkerId(suggestion);
  const tag = `${VEJICE_MARKER_TAG_PREFIX}${generated}`;
  suggestion.markerId = generated;
  suggestion.markerTag = tag;
  return tag;
}

async function getSingleMarkerContentControlForSuggestion(context, suggestion) {
  const markerTag = getSuggestionMarkerTag(suggestion, { create: false });
  if (!markerTag) return null;
  try {
    const controls = context.document.body.contentControls.getByTag(markerTag);
    controls.load("items");
    await context.sync();
    const items = controls?.items || [];
    if (!items.length) return null;
    return items[0] || null;
  } catch (err) {
    warn("getSingleMarkerContentControlForSuggestion failed", err);
    return null;
  }
}

function shouldUseMarkerFirstInsertApply(suggestion, plan) {
  if (!isWordOnline()) return false;
  if (suggestion?.kind !== "insert") return false;
  if (!Array.isArray(plan) || plan.length !== 1) return false;
  const op = plan[0];
  if (!op || op.kind !== "insert") return false;
  if (op.hasLocalDeleteCounterpart) return false;
  const normalizeQuoteBoundaryIntent = (value) => {
    if (typeof value !== "string") return null;
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (!compact) return null;
    if (compact === "none") return "none";
    if (compact === "unknown") return "unknown";
    if (compact === "before") return "before_closing_quote";
    if (compact === "after") return "after_closing_quote";
    if (compact === "whitespaceonly") return "whitespace_only";
    if (compact === "insidequoteboundary") return "inside_quote_boundary";
    if (compact === "insidequotegap") return "inside_quote_gap";
    if (compact === "beforeclosingquote" || compact === "beforequote") return "before_closing_quote";
    if (compact === "afterclosingquote" || compact === "afterquote") return "after_closing_quote";
    if (compact === "beforeopeningquote") return "before_opening_quote";
    if (compact === "afteropeningquote") return "after_opening_quote";
    return null;
  };
  const isExplicitQuoteBoundaryIntent = (intent) =>
    intent === "before_closing_quote" ||
    intent === "after_closing_quote" ||
    intent === "before_opening_quote" ||
    intent === "after_opening_quote";
  const suggestionBoundary = suggestion?.meta?.anchor?.boundaryMeta ?? {};
  const opBoundary = op?.boundary ?? {};
  const boundary = op?.boundary ?? suggestionBoundary ?? {};
  const explicitQuoteIntent = normalizeQuoteBoundaryIntent(
    suggestionBoundary?.explicitQuoteIntent ??
      opBoundary?.explicitQuoteIntent ??
      suggestion?.meta?.op?.explicitQuoteIntent ??
      op?.explicitQuoteIntent ??
      suggestion?.meta?.op?.quoteIntent ??
      suggestion?.meta?.op?.quotePolicy ??
      opBoundary?.quotePolicy
  );
  if (isExplicitQuoteBoundaryIntent(explicitQuoteIntent)) return false;
  const quotePolicy =
    normalizeQuoteBoundaryIntent(
      suggestionBoundary?.explicitQuoteIntent ??
        opBoundary?.explicitQuoteIntent ??
        opBoundary?.quotePolicy
    ) ?? "none";
  const quoteCharRegex = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
  const boundaryHasQuoteCue =
    quoteCharRegex.test(boundary?.leftContext || "") ||
    quoteCharRegex.test(boundary?.rightContext || "") ||
    quoteCharRegex.test(boundary?.beforeToken?.tokenText || "") ||
    quoteCharRegex.test(boundary?.afterToken?.tokenText || "");
  const snippetHasQuoteCue =
    quoteCharRegex.test(suggestion?.snippets?.leftSnippet || "") ||
    quoteCharRegex.test(suggestion?.snippets?.rightSnippet || "");
  if (boundaryHasQuoteCue) return false;
  if (snippetHasQuoteCue) return false;
  return (
    quotePolicy === "none" ||
    quotePolicy === "unknown" ||
    quotePolicy === "whitespace_only" ||
    quotePolicy === "inside_quote_boundary" ||
    quotePolicy === "inside_quote_gap"
  );
}

async function applySimpleInsertSuggestionViaMarker(context, suggestion) {
  const control = await getSingleMarkerContentControlForSuggestion(context, suggestion);
  if (!control) {
    return { applied: false, reason: "marker_control_not_found" };
  }
  try {
    const contentRange = control.getRange("Content");
    contentRange.insertText(",", Word.InsertLocation.after);
    await context.sync();
    return { applied: true, reason: null };
  } catch (err) {
    warn("applySimpleInsertSuggestionViaMarker failed", err);
    return { applied: false, reason: "marker_apply_failed" };
  }
}

function resetSuggestionMarkerState(suggestion, { releaseBaseline = true } = {}) {
  if (!suggestion || typeof suggestion !== "object") return;
  suggestion.highlightRange = null;
  suggestion.previousHighlightColor = null;
  suggestion.previousUnderline = null;
  suggestion.previousUnderlineColor = null;
  suggestion.markerChannel = null;
  suggestion.markerTag = null;
  if (releaseBaseline) {
    releaseMarkerBaselineForSuggestion(suggestion);
  }
}

function firstFiniteValue(values = []) {
  for (const value of values) {
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function resolveSuggestionVisualBounds(suggestion) {
  if (!suggestion || typeof suggestion !== "object") {
    return { start: null, end: null };
  }
  const anchor = suggestion?.meta?.anchor || {};
  const startRaw = firstFiniteValue([
    anchor.highlightCharStart,
    anchor.charStart,
    suggestion?.charHint?.start,
    anchor.targetCharStart,
    suggestion?.meta?.op?.originalPos,
    suggestion?.meta?.op?.correctedPos,
    suggestion?.meta?.op?.pos,
  ]);
  if (!Number.isFinite(startRaw) || startRaw < 0) {
    return { start: null, end: null };
  }
  const start = Math.floor(startRaw);
  const endRaw = firstFiniteValue([
    anchor.highlightCharEnd,
    anchor.charEnd,
    suggestion?.charHint?.end,
    anchor.targetCharEnd,
  ]);
  const end = Number.isFinite(endRaw) && endRaw > start ? Math.floor(endRaw) : start + 1;
  return { start, end };
}

function mergeCharacterSpans(spans = []) {
  const normalized = [];
  for (const span of spans) {
    const start = Number.isFinite(span?.start) ? Math.max(0, Math.floor(span.start)) : null;
    const end = Number.isFinite(span?.end) ? Math.max(start ?? 0, Math.floor(span.end)) : null;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    normalized.push({ start, end });
  }
  if (!normalized.length) return [];
  normalized.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [normalized[0]];
  for (let i = 1; i < normalized.length; i += 1) {
    const current = normalized[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      continue;
    }
    merged.push(current);
  }
  return merged;
}

function doesRangeIntersectAnySpan(start, end, spans = []) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !Array.isArray(spans) || !spans.length) {
    return false;
  }
  for (const span of spans) {
    if (!Number.isFinite(span?.start) || !Number.isFinite(span?.end)) continue;
    if (end > span.start && start < span.end) {
      return true;
    }
  }
  return false;
}

function buildSuggestionHighlightKey(suggestion) {
  const paragraphIndex = suggestion?.paragraphIndex;
  const visualBounds = resolveSuggestionVisualBounds(suggestion);
  if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) return null;
  if (!Number.isFinite(visualBounds.start) || visualBounds.start < 0) return null;
  return `${paragraphIndex}:${visualBounds.start}:${visualBounds.end}`;
}

function buildSuggestionRenderDedupKey(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const paragraphIndex = Number.isFinite(suggestion?.paragraphIndex)
    ? suggestion.paragraphIndex
    : -1;
  const kind = typeof suggestion?.kind === "string" ? suggestion.kind : "unknown";
  const opOriginalPos = Number.isFinite(suggestion?.meta?.op?.originalPos)
    ? suggestion.meta.op.originalPos
    : Number.isFinite(suggestion?.meta?.op?.pos)
      ? suggestion.meta.op.pos
      : null;
  const opCorrectedPos = Number.isFinite(suggestion?.meta?.op?.correctedPos)
    ? suggestion.meta.op.correctedPos
    : Number.isFinite(suggestion?.meta?.op?.pos)
      ? suggestion.meta.op.pos
      : null;
  if (Number.isFinite(opOriginalPos) || Number.isFinite(opCorrectedPos)) {
    return `${paragraphIndex}:op:${kind}:o${
      Number.isFinite(opOriginalPos) ? opOriginalPos : "na"
    }:c${Number.isFinite(opCorrectedPos) ? opCorrectedPos : "na"}`;
  }

  const spanKey = buildSuggestionHighlightKey(suggestion);
  if (spanKey) {
    return spanKey;
  }

  const anchor = suggestion?.meta?.anchor || {};
  const tokenId =
    anchor?.sourceTokenAt?.tokenId ??
    anchor?.targetTokenAt?.tokenId ??
    anchor?.sourceTokenBefore?.tokenId ??
    anchor?.targetTokenBefore?.tokenId ??
    anchor?.highlightAnchorTarget?.tokenId ??
    "na";
  return `${paragraphIndex}:na:${kind}:t${tokenId}`;
}

function dedupeSuggestionsForRender(suggestions, paragraphIndex) {
  const source = Array.isArray(suggestions) ? suggestions : [];
  if (!source.length) {
    return { suggestions: [], dropped: 0 };
  }
  const seen = new Set();
  const deduped = [];
  let dropped = 0;
  for (const suggestion of source) {
    const key = buildSuggestionRenderDedupKey(suggestion) || `${paragraphIndex ?? -1}:fallback:${dropped}`;
    if (seen.has(key)) {
      dropped++;
      continue;
    }
    seen.add(key);
    deduped.push(suggestion);
  }
  return { suggestions: deduped, dropped };
}

function getSuggestionConfidenceScore(suggestion) {
  const score = suggestion?.meta?.confidence?.score;
  if (Number.isFinite(score)) return score;
  const level = getSuggestionConfidenceLevel(suggestion);
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function getSuggestionVisualSpanLength(suggestion) {
  const bounds = resolveSuggestionVisualBounds(suggestion);
  if (!Number.isFinite(bounds.start) || !Number.isFinite(bounds.end)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(1, bounds.end - bounds.start);
}

function pickRepresentativeSuggestionForOperation(operation) {
  const source = Array.isArray(operation?.suggestions) ? operation.suggestions.filter(Boolean) : [];
  if (!source.length) return null;

  let candidates = source;
  if (operation?.kind === "insert" || operation?.kind === "delete") {
    const sameKind = source.filter((item) => item?.kind === operation.kind);
    if (sameKind.length) {
      candidates = sameKind;
    }
  }

  let chosen = candidates[0];
  let chosenScore = getSuggestionConfidenceScore(chosen);
  let chosenSpan = getSuggestionVisualSpanLength(chosen);
  for (let i = 1; i < candidates.length; i++) {
    const candidate = candidates[i];
    const score = getSuggestionConfidenceScore(candidate);
    if (score > chosenScore) {
      chosen = candidate;
      chosenScore = score;
      chosenSpan = getSuggestionVisualSpanLength(candidate);
      continue;
    }
    if (score === chosenScore) {
      const span = getSuggestionVisualSpanLength(candidate);
      if (span < chosenSpan) {
        chosen = candidate;
        chosenSpan = span;
      }
    }
  }

  return chosen;
}

function pruneSuggestionsForRenderByPlan(snapshotText, sourceText, suggestions) {
  const input = Array.isArray(suggestions) ? suggestions.filter(Boolean) : [];
  if (!input.length) {
    return {
      suggestions: [],
      planCount: 0,
      noopCount: 0,
      skippedCount: 0,
      skippedByReason: {},
      deterministicSkipped: 0,
      mergedGroupCount: 0,
      dropped: 0,
    };
  }

  const { plan, skipped, noop } = buildParagraphOperationsPlan(snapshotText, sourceText, input);
  const skippedByReason = summarizeSkippedReasons(skipped);
  const deterministicSkipped = Object.entries(skippedByReason).reduce((total, [reason, count]) => {
    if (typeof reason === "string" && reason.startsWith("deterministic_")) {
      return total + (Number.isFinite(count) ? count : 0);
    }
    return total;
  }, 0);
  const output = [];
  const seenRenderKeys = new Set();
  let mergedGroupCount = 0;

  for (const operation of plan) {
    const opSuggestions = Array.isArray(operation?.suggestions) ? operation.suggestions.filter(Boolean) : [];
    if (!opSuggestions.length) continue;
    if (opSuggestions.length > 1) mergedGroupCount++;
    const chosen = pickRepresentativeSuggestionForOperation(operation);
    if (!chosen) continue;
    if (isSuggestionAppliedInLiveText(snapshotText, sourceText, chosen)) {
      continue;
    }
    const renderKey = buildSuggestionRenderDedupKey(chosen) || chosen?.id || `${output.length}`;
    if (seenRenderKeys.has(renderKey)) continue;
    seenRenderKeys.add(renderKey);
    output.push(chosen);
  }

  if (!output.length && skipped.length) {
    for (const skippedItem of skipped) {
      const fallbackSuggestion = skippedItem?.suggestion;
      if (!fallbackSuggestion) continue;
      // Do not re-render skipped suggestions that are already satisfied in live text.
      // This avoids persistent false highlights around quote boundaries when resolver
      // cannot produce a concrete op but the comma is already present.
      if (isSuggestionAppliedInLiveText(snapshotText, sourceText, fallbackSuggestion)) {
        continue;
      }
      const renderKey =
        buildSuggestionRenderDedupKey(fallbackSuggestion) ||
        fallbackSuggestion?.id ||
        `skipped-${output.length}`;
      if (seenRenderKeys.has(renderKey)) continue;
      seenRenderKeys.add(renderKey);
      output.push(fallbackSuggestion);
    }
  }

  return {
    suggestions: output,
    planCount: plan.length,
    noopCount: noop.length,
    skippedCount: skipped.length,
    skippedByReason,
    deterministicSkipped,
    mergedGroupCount,
    dropped: Math.max(0, input.length - output.length),
  };
}

function prepareSuggestionsForRender({
  paragraphIndex,
  snapshotText,
  sourceText,
  suggestions,
}) {
  const deduped = dedupeSuggestionsForRender(suggestions, paragraphIndex);
  const dedupedSuggestions = deduped.suggestions;
  if (!dedupedSuggestions.length) {
    return {
      suggestions: [],
      renderDedupDropped: deduped.dropped,
      planDropped: 0,
      planCount: 0,
      noopCount: 0,
      skippedCount: 0,
      skippedByReason: {},
      deterministicSkipped: 0,
      mergedGroupCount: 0,
    };
  }

  if (typeof snapshotText !== "string") {
    return {
      suggestions: sortSuggestionsForRenderByVisualOrder(dedupedSuggestions),
      renderDedupDropped: deduped.dropped,
      planDropped: 0,
      planCount: 0,
      noopCount: 0,
      skippedCount: 0,
      skippedByReason: {},
      deterministicSkipped: 0,
      mergedGroupCount: 0,
    };
  }

  const planPruned = pruneSuggestionsForRenderByPlan(
    snapshotText,
    typeof sourceText === "string" ? sourceText : snapshotText,
    dedupedSuggestions
  );
  return {
    // Planner order is descending for safe text edits; render should paint in document order.
    suggestions: sortSuggestionsForRenderByVisualOrder(planPruned.suggestions),
    renderDedupDropped: deduped.dropped,
    planDropped: planPruned.dropped,
    planCount: planPruned.planCount,
    noopCount: planPruned.noopCount,
    skippedCount: planPruned.skippedCount,
    skippedByReason: planPruned.skippedByReason,
    deterministicSkipped: planPruned.deterministicSkipped,
    mergedGroupCount: planPruned.mergedGroupCount,
  };
}

function shouldSkipSuggestionRender(suggestion) {
  const renderKey = buildSuggestionRenderDedupKey(suggestion);
  if (!renderKey) return false;
  return pendingSuggestionRenderKeys.has(renderKey);
}

function captureMarkerBaselineForSuggestion(suggestion, currentUnderline, currentUnderlineColor) {
  const key =
    suggestion?.underlineBaselineKey ||
    suggestion?.highlightBaselineKey ||
    buildSuggestionHighlightKey(suggestion);
  suggestion.underlineBaselineKey = key;
  suggestion.highlightBaselineKey = key;
  if (!key) {
    const fallbackUnderline = normalizeUnderlineStyleValue(currentUnderline);
    const fallbackUnderlineColor = normalizeHighlightColorValue(currentUnderlineColor);
    if (isVejiceMarkerStyle(fallbackUnderline, fallbackUnderlineColor)) {
      suggestion.previousUnderline = null;
      suggestion.previousUnderlineColor = null;
    } else {
      suggestion.previousUnderline = fallbackUnderline;
      suggestion.previousUnderlineColor = fallbackUnderlineColor;
    }
    suggestion.previousHighlightColor = null;
    return;
  }
  const existing = onlineMarkerBaselineByKey.get(key);
  if (existing) {
    existing.refCount += 1;
    suggestion.previousUnderline = existing.underline;
    suggestion.previousUnderlineColor = existing.underlineColor;
    suggestion.previousHighlightColor = null;
    return;
  }
  const capturedUnderline = normalizeUnderlineStyleValue(currentUnderline);
  const capturedUnderlineColor = normalizeHighlightColorValue(currentUnderlineColor);
  const baselineUnderline = isVejiceMarkerStyle(capturedUnderline, capturedUnderlineColor)
    ? null
    : capturedUnderline;
  const baselineUnderlineColor = isVejiceMarkerStyle(capturedUnderline, capturedUnderlineColor)
    ? null
    : capturedUnderlineColor;
  onlineMarkerBaselineByKey.set(key, {
    underline: baselineUnderline,
    underlineColor: baselineUnderlineColor,
    refCount: 1,
  });
  suggestion.previousUnderline = baselineUnderline;
  suggestion.previousUnderlineColor = baselineUnderlineColor;
  suggestion.previousHighlightColor = null;
}

function releaseMarkerBaselineForSuggestion(suggestion) {
  const key = suggestion?.underlineBaselineKey || suggestion?.highlightBaselineKey;
  if (!key) return;
  const existing = onlineMarkerBaselineByKey.get(key);
  if (existing) {
    existing.refCount -= 1;
    if (existing.refCount <= 0) {
      onlineMarkerBaselineByKey.delete(key);
    }
  }
  suggestion.underlineBaselineKey = null;
  suggestion.highlightBaselineKey = null;
}

function getSuggestionRestoreMarkerFormat(suggestion) {
  const key = suggestion?.underlineBaselineKey || suggestion?.highlightBaselineKey;
  if (key && onlineMarkerBaselineByKey.has(key)) {
    const cached = onlineMarkerBaselineByKey.get(key);
    const underline = normalizeUnderlineStyleValue(cached?.underline);
    const underlineColor = normalizeHighlightColorValue(cached?.underlineColor);
    if (isVejiceMarkerStyle(underline, underlineColor)) {
      return { underline: null, underlineColor: null };
    }
    return { underline, underlineColor };
  }
  const fallbackUnderline = normalizeUnderlineStyleValue(suggestion?.previousUnderline);
  const fallbackUnderlineColor = normalizeHighlightColorValue(
    suggestion?.previousUnderlineColor ?? suggestion?.previousHighlightColor
  );
  if (isVejiceMarkerStyle(fallbackUnderline, fallbackUnderlineColor)) {
    return { underline: null, underlineColor: null };
  }
  return { underline: fallbackUnderline, underlineColor: fallbackUnderlineColor };
}

function toWordUnderline(value) {
  const normalized = normalizeUnderlineStyleValue(value);
  return normalized || "None";
}

async function applySuggestionMarkerFormat(context, range, suggestion) {
  if (isWordOnline()) {
    const markerHighlightColor = getSuggestionMarkerHighlightColor(suggestion);
    const markerTag = getSuggestionMarkerTag(suggestion, { create: true });
    let markerRange = range;
    let markerControl = null;
    let markerViaContentControl = false;
    try {
      markerRange.font.load("highlightColor");
      await context.sync();
      const existingHighlightColor = normalizeHighlightColorValue(markerRange.font.highlightColor);
      // Preserve the user's exact original highlight (including yellow).
      suggestion.previousHighlightColor = sanitizeRestoredHighlightColor(existingHighlightColor);
      suggestion.previousUnderline = null;
      suggestion.previousUnderlineColor = null;
      suggestion.underlineBaselineKey = null;
      suggestion.highlightBaselineKey = null;
    } catch (captureErr) {
      warn("marker: failed to capture previous highlight color", captureErr);
      suggestion.previousHighlightColor = null;
    }
    if (markerTag) {
      try {
        markerControl = markerRange.insertContentControl();
        markerControl.tag = markerTag;
        markerControl.title = VEJICE_MARKER_TITLE;
        // These controls exist only as internal marker anchors; suppress Word Online's
        // default empty-control placeholder text if the wrapped content becomes empty.
        markerControl.placeholderText = "";
        markerControl.appearance = "Hidden";
        markerControl.removeWhenEdited = true;
        markerRange = markerControl.getRange("Content");
        markerViaContentControl = true;
      } catch (tagErr) {
        warn("marker: failed to create tagged content control", tagErr);
      }
    }
    try {
      suggestion.markerChannel = "highlight";
      markerRange.font.highlightColor = markerHighlightColor;
      if (markerViaContentControl) {
        suggestion.highlightRange = null;
      } else {
        context.trackedObjects.add(markerRange);
        suggestion.highlightRange = markerRange;
      }
      await context.sync();
      return true;
    } catch (applyErr) {
      warn("marker: failed to apply marker format", applyErr);
      try {
        if (markerControl) {
          markerControl.delete(true);
        }
      } catch (_controlCleanupErr) {
        // ignore cleanup failures
      }
      try {
        if (suggestion.highlightRange) {
          context.trackedObjects.remove(suggestion.highlightRange);
        }
      } catch (_cleanupErr) {
        // ignore cleanup failures
      }
      suggestion.highlightRange = null;
      return false;
    }
  }

  const marker = getSuggestionMarkerFormat(suggestion);
  try {
    suggestion.markerChannel = "underline";
    range.font.load("underline");
    await context.sync();
    captureMarkerBaselineForSuggestion(suggestion, range.font.underline, null);
  } catch (captureErr) {
    warn("marker: failed to capture previous underline style", captureErr);
    suggestion.previousUnderline = null;
    suggestion.previousUnderlineColor = null;
    suggestion.previousHighlightColor = null;
    suggestion.underlineBaselineKey =
      suggestion.underlineBaselineKey || suggestion.highlightBaselineKey || buildSuggestionHighlightKey(suggestion);
    suggestion.highlightBaselineKey = suggestion.highlightBaselineKey || buildSuggestionHighlightKey(suggestion);
  }
  try {
    range.font.underline = marker.underline;
    try {
      range.font.underlineColor = marker.underlineColor;
    } catch (_err) {
      // Some Word Online hosts do not support underlineColor reliably.
    }
    context.trackedObjects.add(range);
    suggestion.highlightRange = range;
    await context.sync();
    return true;
  } catch (applyErr) {
    warn("marker: failed to apply marker format", applyErr);
    try {
      if (suggestion.highlightRange) {
        context.trackedObjects.remove(suggestion.highlightRange);
      }
    } catch (_cleanupErr) {
      // ignore cleanup failures
    }
    suggestion.highlightRange = null;
    return false;
  }
}

function countCommasUpTo(text, pos) {
  let count = 0;
  for (let i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}

async function highlightDeleteSuggestion(context, paragraph, suggestion) {
  try {
    if (shouldSkipSuggestionRender(suggestion)) {
      return false;
    }
    const paragraphText = suggestion.meta?.originalText ?? paragraph.text ?? "";
    const meta = suggestion.meta?.anchor || {};
    const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
    const charStart =
      suggestion.charHint?.start ?? meta.charStart ?? suggestion.meta?.op?.originalPos ?? -1;
    const charEnd =
      suggestion.charHint?.end ??
      meta.charEnd ??
      (typeof charStart === "number" && charStart >= 0 ? charStart + 1 : charStart);
    const highlightText = meta.highlightText ?? suggestion.meta?.highlightText ?? ",";
    let targetRange = await findCommaRangeByOrdinal(
      context,
      paragraph,
      paragraphText,
      suggestion.meta?.op
    );

    if (!targetRange && Number.isFinite(charStart) && charStart >= 0) {
      targetRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        charStart,
        charEnd,
        "highlight-delete",
        highlightText
      );
    }

    if (!targetRange) return false;

    const applied = await applySuggestionMarkerFormat(context, targetRange, suggestion);
    if (!applied) return false;
    addPendingSuggestionOnline(suggestion);
    return true;
  } catch (err) {
    warn("highlightDeleteSuggestion failed; skipping marker", err);
    return false;
  }
}

async function highlightInsertSuggestion(context, paragraph, suggestion) {
  try {
    if (shouldSkipSuggestionRender(suggestion)) {
      return false;
    }
    const corrected = suggestion.meta?.correctedText ?? paragraph.text ?? "";
    const anchor = suggestion.meta?.anchor || {};
    const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
    const rawLeft = suggestion.snippets?.leftSnippet ?? corrected.slice(0, suggestion.meta?.op?.pos ?? 0);
    const rawRight = suggestion.snippets?.rightSnippet ?? corrected.slice(suggestion.meta?.op?.pos ?? 0);
    const lastWord = extractLastWord(rawLeft || "");
    let leftContext = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");
    const searchOpts = { matchCase: false, matchWholeWord: false };
    const boundaryIntent = resolveSuggestionQuoteBoundaryIntent(suggestion, suggestion?.meta?.op) ?? "none";
    const boundaryIntentSource = resolveSuggestionQuoteBoundaryIntentSource(
      suggestion,
      suggestion?.meta?.op
    );
    const expectedQuoteRoleForIntent =
      boundaryIntent === "before_opening_quote" || boundaryIntent === "after_opening_quote"
        ? "opening"
        : boundaryIntent === "before_closing_quote" || boundaryIntent === "after_closing_quote"
          ? "closing"
          : null;
    const boundaryPunctuationChar =
      typeof anchor?.boundaryMeta?.punctuationBoundaryChar === "string"
        ? anchor.boundaryMeta.punctuationBoundaryChar
        : "";
    const dashBoundaryRegex = /[-\u2013\u2014\u2212]/u;
    const quoteCharRegex = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
    const invisibleOrGapRegex = /[\s,\u200B-\u200D\uFEFF]/u;
    const directionalOpeningQuoteChars = new Set(["\u00BB", "\u203A"]);
    const directionalClosingQuoteChars = new Set(["\u00AB", "\u2039"]);
    const classifyQuoteRoleAt = (text, quoteIndex) => {
      if (typeof text !== "string" || !text.length || !Number.isFinite(quoteIndex)) return null;
      if (quoteIndex < 0 || quoteIndex >= text.length) return null;
      const current = text[quoteIndex] || "";
      if (!current || !quoteCharRegex.test(current)) return null;
      if (directionalOpeningQuoteChars.has(current)) return "opening";
      if (directionalClosingQuoteChars.has(current)) return "closing";
      let left = quoteIndex - 1;
      while (left >= 0 && /[\s\u200B-\u200D\uFEFF]/u.test(text[left] || "")) left--;
      let right = quoteIndex + 1;
      while (right < text.length && /[\s\u200B-\u200D\uFEFF]/u.test(text[right] || "")) right++;
      const leftIsWord = left >= 0 && /[\p{L}\p{N}]/u.test(text[left] || "");
      const rightIsWord = right < text.length && /[\p{L}\p{N}]/u.test(text[right] || "");
      const immediateLeft = quoteIndex > 0 ? text[quoteIndex - 1] || "" : "";
      const immediateRight = quoteIndex + 1 < text.length ? text[quoteIndex + 1] || "" : "";
      const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
      const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
      const leftHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateLeft || "");
      const rightHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateRight || "");
      if (rightIsWord && !leftIsWord) return "opening";
      if (leftIsWord && !rightIsWord) return "closing";
      if (leftIsWord && rightIsWord) {
        if (leftAdjacentIsWord && rightAdjacentIsWord) return null;
        if (rightHasGap && !leftHasGap) return "closing";
        if (leftHasGap && !rightHasGap) return "opening";
        if (leftAdjacentIsWord && !rightAdjacentIsWord) return "closing";
        if (!leftAdjacentIsWord && rightAdjacentIsWord) return "opening";
        return "closing";
      }
      return "closing";
    };
    let range = null;
    const baseText =
      (entry?.originalText && typeof entry.originalText === "string" ? entry.originalText : null) ||
      (typeof corrected === "string" ? corrected : "") ||
      "";
    const boundaryCandidates = [
      anchor?.boundaryMeta?.sourceBoundaryPos,
      anchor?.boundaryMeta?.sourceBoundaryStart,
      anchor?.boundaryMeta?.sourceBoundaryEnd,
      anchor?.boundaryMeta?.targetCommaPos,
      anchor?.boundaryMeta?.targetBoundaryPos,
      suggestion?.meta?.op?.originalPos,
      suggestion?.meta?.op?.correctedPos,
      suggestion?.meta?.op?.pos,
      anchor?.targetCharStart,
      anchor?.highlightCharStart,
      suggestion?.charHint?.start,
    ];
    const resolveQuotePosFromCandidates = (text, candidates, intent = "none") => {
      if (!text || !Array.isArray(candidates) || !candidates.length) return -1;
      const expectedRole =
        intent === "before_opening_quote" || intent === "after_opening_quote"
          ? "opening"
          : intent === "before_closing_quote" || intent === "after_closing_quote"
            ? "closing"
            : null;
      const isExpectedQuoteAt = (idx) => {
        if (!Number.isFinite(idx) || idx < 0 || idx >= text.length) return false;
        if (!quoteCharRegex.test(text[idx] || "")) return false;
        if (!expectedRole) return true;
        return classifyQuoteRoleAt(text, idx) === expectedRole;
      };
      const preferRight =
        intent === "before_closing_quote" || intent === "before_opening_quote";
      const preferLeft =
        intent === "after_closing_quote" || intent === "after_opening_quote";
      for (const candidate of candidates) {
        if (!Number.isFinite(candidate) || candidate < 0 || candidate > text.length) continue;
        const probeLeft = () => {
          let left = Math.min(text.length - 1, Math.floor(candidate) - 1);
          while (left >= 0 && invisibleOrGapRegex.test(text[left] || "")) left--;
          if (isExpectedQuoteAt(left)) return left;
          return -1;
        };
        const probeRight = () => {
          let right = Math.max(0, Math.floor(candidate));
          while (right < text.length && invisibleOrGapRegex.test(text[right] || "")) right++;
          if (isExpectedQuoteAt(right)) return right;
          return -1;
        };
        if (preferRight) {
          const rightHit = probeRight();
          if (rightHit >= 0) return rightHit;
          const leftHit = probeLeft();
          if (leftHit >= 0) return leftHit;
          continue;
        }
        if (preferLeft) {
          const leftHit = probeLeft();
          if (leftHit >= 0) return leftHit;
          const rightHit = probeRight();
          if (rightHit >= 0) return rightHit;
          continue;
        }
        const leftHit = probeLeft();
        if (leftHit >= 0) return leftHit;
        const rightHit = probeRight();
        if (rightHit >= 0) return rightHit;
      }
      return -1;
    };
    const resolveDashPosFromCandidates = (text, candidates) => {
      if (!text || !Array.isArray(candidates) || !candidates.length) return -1;
      for (const candidate of candidates) {
        if (!Number.isFinite(candidate) || candidate < 0 || candidate > text.length) continue;
        let left = Math.min(text.length - 1, Math.floor(candidate) - 1);
        while (left >= 0 && invisibleOrGapRegex.test(text[left] || "")) left--;
        if (left >= 0 && dashBoundaryRegex.test(text[left] || "")) {
          return left;
        }
        const at = Math.max(0, Math.min(text.length - 1, Math.floor(candidate)));
        if (dashBoundaryRegex.test(text[at] || "")) {
          return at;
        }
        let right = Math.max(0, Math.floor(candidate));
        while (right < text.length && invisibleOrGapRegex.test(text[right] || "")) right++;
        if (right < text.length && dashBoundaryRegex.test(text[right] || "")) {
          return right;
        }
      }
      return -1;
    };
    const quotePosFromBoundary = resolveQuotePosFromCandidates(
      baseText,
      boundaryCandidates,
      boundaryIntent
    );
    traceQuoteSuggestion("highlight_insert.quote_candidate", suggestion, {
      force: true,
      boundaryIntent,
      boundaryIntentSource,
      expectedQuoteRole: expectedQuoteRoleForIntent,
      quotePosFromBoundary,
      quoteCharFromBoundary:
        quotePosFromBoundary >= 0 && quotePosFromBoundary < baseText.length
          ? baseText[quotePosFromBoundary] || ""
          : null,
      quoteCharRoleFromBoundary:
        quotePosFromBoundary >= 0 ? classifyQuoteRoleAt(baseText, quotePosFromBoundary) : null,
      boundaryCandidates,
    });
    const opBoundaryPos = Number.isFinite(suggestion?.meta?.op?.correctedPos)
      ? Math.floor(suggestion.meta.op.correctedPos)
      : Number.isFinite(suggestion?.meta?.op?.pos)
        ? Math.floor(suggestion.meta.op.pos)
        : -1;
    const deriveDashPosFromOpSnippets = () => {
      if (!baseText || !Number.isFinite(opBoundaryPos) || opBoundaryPos < 0) return [];
      const hints = [];
      if (typeof rawRight === "string" && rawRight.length) {
        const rightDashOffset = rawRight.search(dashBoundaryRegex);
        if (rightDashOffset >= 0) {
          hints.push(opBoundaryPos + rightDashOffset);
        }
      }
      if (typeof rawLeft === "string" && rawLeft.length) {
        const leftDashRelative = rawLeft.search(/[-\u2013\u2014\u2212][^\S\r\n]*$/u);
        if (leftDashRelative >= 0) {
          hints.push(opBoundaryPos - Math.max(0, rawLeft.length - leftDashRelative));
        } else {
          const leftLastDash = rawLeft.lastIndexOf("-");
          if (leftLastDash >= 0) {
            hints.push(opBoundaryPos - Math.max(0, rawLeft.length - leftLastDash));
          }
        }
      }
      return hints
        .filter((value, index, arr) => Number.isFinite(value) && value >= 0 && value <= baseText.length && arr.indexOf(value) === index);
    };
    const dashBoundaryCandidates = [
      ...boundaryCandidates,
      opBoundaryPos,
      ...deriveDashPosFromOpSnippets(),
    ];
    const dashPosFromBoundary = resolveDashPosFromCandidates(baseText, dashBoundaryCandidates);
    const resolveQuoteRangeNearPos = async (quotePosHint) => {
      if (!Number.isFinite(quotePosHint) || quotePosHint < 0 || quotePosHint >= baseText.length) return null;
      const liveText = typeof paragraph.text === "string" ? paragraph.text : baseText;
      const mappedStart = mapIndexAcrossCanonical(baseText, liveText, quotePosHint);
      const hintChar = baseText[quotePosHint] || "";
      const variants = [];
      if (quoteCharRegex.test(hintChar)) variants.push(hintChar);
      for (const quoteVariant of QUOTES) {
        if (!quoteCharRegex.test(quoteVariant || "")) continue;
        if (!variants.includes(quoteVariant)) variants.push(quoteVariant);
      }
      const collectVariantPositions = (text, variant) => {
        if (typeof text !== "string" || !text.length || typeof variant !== "string" || !variant.length) return [];
        const out = [];
        let cursor = 0;
        while (cursor <= text.length - variant.length) {
          const hit = text.indexOf(variant, cursor);
          if (hit < 0) break;
          out.push(hit);
          cursor = hit + Math.max(1, variant.length);
        }
        return out;
      };
      const isVariantCompatibleWithIntent = (variant) => {
        if (typeof variant !== "string" || !variant.length) return false;
        if (!expectedQuoteRoleForIntent) return true;
        if (expectedQuoteRoleForIntent === "opening" && directionalClosingQuoteChars.has(variant)) return false;
        if (expectedQuoteRoleForIntent === "closing" && directionalOpeningQuoteChars.has(variant)) return false;
        return true;
      };
      const chooseBestMatchIndex = (variant, matchesCount) => {
        const positions = collectVariantPositions(liveText, variant);
        if (!positions.length || !Number.isFinite(mappedStart)) {
          return {
            index: 0,
            position: positions[0] ?? null,
            roleCompatible: !expectedQuoteRoleForIntent,
            roleUnknown: false,
          };
        }
        let bestIdx = 0;
        let bestScore = Number.POSITIVE_INFINITY;
        let bestRoleIdx = -1;
        let bestRoleScore = Number.POSITIVE_INFINITY;
        let bestUnknownIdx = -1;
        let bestUnknownScore = Number.POSITIVE_INFINITY;
        for (let i = 0; i < positions.length; i++) {
          const role = classifyQuoteRoleAt(liveText, positions[i]);
          const score = Math.abs(positions[i] - mappedStart);
          if (score < bestScore) {
            bestScore = score;
            bestIdx = i;
          }
          if (!expectedQuoteRoleForIntent) {
            continue;
          }
          if (role === expectedQuoteRoleForIntent && score < bestRoleScore) {
            bestRoleScore = score;
            bestRoleIdx = i;
            continue;
          }
          if (!role && score < bestUnknownScore) {
            bestUnknownScore = score;
            bestUnknownIdx = i;
          }
        }
        if (expectedQuoteRoleForIntent) {
          if (bestRoleIdx >= 0) {
            const clamped = Math.max(0, Math.min(bestRoleIdx, Math.max(0, matchesCount - 1)));
            return {
              index: clamped,
              position: positions[clamped] ?? null,
              roleCompatible: true,
              roleUnknown: false,
            };
          }
          if (bestUnknownIdx >= 0) {
            const clamped = Math.max(0, Math.min(bestUnknownIdx, Math.max(0, matchesCount - 1)));
            return {
              index: clamped,
              position: positions[clamped] ?? null,
              roleCompatible: true,
              roleUnknown: true,
            };
          }
          return null;
        }
        const clamped = Math.max(0, Math.min(bestIdx, Math.max(0, matchesCount - 1)));
        return {
          index: clamped,
          position: positions[clamped] ?? null,
          roleCompatible: true,
          roleUnknown: false,
        };
      };
      for (const quoteVariant of variants) {
        if (!isVariantCompatibleWithIntent(quoteVariant)) continue;
        const matches = await searchParagraphForSnippet(context, paragraph, quoteVariant);
        if (!matches?.items?.length) continue;
        try {
          for (const item of matches.items) {
            item.load("text");
          }
          await context.sync();
        } catch (loadErr) {
          traceQuoteSuggestion("highlight_insert.quote_variant_skip", suggestion, {
            force: true,
            traceId: suggestion?.meta?.op?.traceId || null,
            boundaryIntent,
            expectedQuoteRole: expectedQuoteRoleForIntent,
            quoteVariant,
            mappedStart,
            reason: "match-text-load-failed",
            error: loadErr?.message || String(loadErr),
          });
          // If host cannot load text for search hits, continue with raw matches.
        }
        const exactMatchIndexes = [];
        for (let i = 0; i < matches.items.length; i++) {
          const matchText = typeof matches.items[i]?.text === "string" ? matches.items[i].text : "";
          if (!matchText || matchText !== quoteVariant) continue;
          exactMatchIndexes.push(i);
        }
        if (!exactMatchIndexes.length) {
          traceQuoteSuggestion("highlight_insert.quote_variant_skip", suggestion, {
            force: true,
            traceId: suggestion?.meta?.op?.traceId || null,
            boundaryIntent,
            expectedQuoteRole: expectedQuoteRoleForIntent,
            quoteVariant,
            mappedStart,
            reason: "no-exact-glyph-match",
            rawMatchCount: matches.items.length,
          });
          continue;
        }
        const selected = chooseBestMatchIndex(quoteVariant, exactMatchIndexes.length);
        if (!selected) {
          traceQuoteSuggestion("highlight_insert.quote_variant_skip", suggestion, {
            force: true,
            traceId: suggestion?.meta?.op?.traceId || null,
            boundaryIntent,
            expectedQuoteRole: expectedQuoteRoleForIntent,
            quoteVariant,
            mappedStart,
            reason: "no-role-compatible-match",
          });
          continue;
        }
        const idx = Math.max(0, Math.min(selected.index, exactMatchIndexes.length - 1));
        const resolvedMatchIndex = exactMatchIndexes[idx];
        traceQuoteSuggestion("highlight_insert.quote_variant_pick", suggestion, {
          force: true,
          traceId: suggestion?.meta?.op?.traceId || null,
          boundaryIntent,
          expectedQuoteRole: expectedQuoteRoleForIntent,
          quoteVariant,
          mappedStart,
          selectedMatchIndex: idx,
          selectedRawMatchIndex: resolvedMatchIndex,
          exactMatchCount: exactMatchIndexes.length,
          rawMatchCount: matches.items.length,
          selectedPosition: selected.position,
          selectedRoleCompatible: selected.roleCompatible,
          selectedRoleUnknown: selected.roleUnknown,
          selectedRole:
            Number.isFinite(selected.position) && selected.position >= 0
              ? classifyQuoteRoleAt(liveText, selected.position)
              : null,
        });
        return matches.items[resolvedMatchIndex] || null;
      }
      return null;
    };
    const resolveQuoteContextRangeNearPos = async (quotePosHint) => {
      if (!Number.isFinite(quotePosHint) || quotePosHint < 0 || quotePosHint >= baseText.length) return null;
      const safePos = Math.max(0, Math.min(Math.floor(quotePosHint), baseText.length - 1));
      const liveText = typeof paragraph.text === "string" ? paragraph.text : baseText;
      const contextWindows = [
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2],
      ];
      for (const [leftSpan, rightSpan] of contextWindows) {
        const start = Math.max(0, safePos - leftSpan);
        const end = Math.min(baseText.length, safePos + rightSpan + 1);
        const snippet = baseText.slice(start, end);
        if (!snippet || !quoteCharRegex.test(snippet)) continue;
        if (![...snippet].some((ch) => /[\p{L}\p{N}]/u.test(ch))) continue;
        const mappedHint = mapIndexAcrossCanonical(baseText, liveText, start);
        const resolved = await findExactSnippetRangeNearIndex(
          context,
          paragraph,
          liveText,
          snippet,
          mappedHint,
          "highlight-insert-quote-context"
        );
        if (resolved) return resolved;
      }
      return null;
    };
    const resolveDashRangeNearPos = async (dashPosHint) => {
      if (!Number.isFinite(dashPosHint) || dashPosHint < 0 || dashPosHint >= baseText.length) return null;
      const liveText = typeof paragraph.text === "string" ? paragraph.text : baseText;
      const mappedStart = mapIndexAcrossCanonical(baseText, liveText, dashPosHint);
      const hintChar = baseText[dashPosHint] || "";
      const variants = [];
      if (dashBoundaryRegex.test(hintChar)) variants.push(hintChar);
      for (const dashVariant of ["-", "\u2013", "\u2014", "\u2212"]) {
        if (!variants.includes(dashVariant)) variants.push(dashVariant);
      }
      for (const dashVariant of variants) {
        const matches = await searchParagraphForSnippet(context, paragraph, dashVariant);
        if (!matches?.items?.length) continue;
        const occurrence = countSnippetOccurrencesBefore(liveText, dashVariant, mappedStart);
        const idx = Math.min(occurrence, matches.items.length - 1);
        return matches.items[idx] || null;
      }
      return null;
    };
    const resolveDashContextRangeNearPos = async (dashPosHint) => {
      if (!Number.isFinite(dashPosHint) || dashPosHint < 0 || dashPosHint >= baseText.length) return null;
      const safePos = Math.max(0, Math.min(Math.floor(dashPosHint), baseText.length - 1));
      const liveText = typeof paragraph.text === "string" ? paragraph.text : baseText;
      const contextWindows = [
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2],
      ];
      for (const [leftSpan, rightSpan] of contextWindows) {
        const start = Math.max(0, safePos - leftSpan);
        const end = Math.min(baseText.length, safePos + rightSpan + 1);
        const snippet = baseText.slice(start, end);
        if (!snippet || !dashBoundaryRegex.test(snippet)) continue;
        if (![...snippet].some((ch) => /[\p{L}\p{N}]/u.test(ch))) continue;
        const mappedHint = mapIndexAcrossCanonical(baseText, liveText, start);
        const resolved = await findExactSnippetRangeNearIndex(
          context,
          paragraph,
          liveText,
          snippet,
          mappedHint,
          "highlight-insert-dash-context"
        );
        if (resolved) return resolved;
      }
      return null;
    };
    const preferAfterLexical =
      boundaryIntent === "before_opening_quote" || boundaryIntent === "after_opening_quote";
    const lexicalAnchorPriority = preferAfterLexical
      ? [
          anchor.sourceTokenAfter,
          anchor.targetTokenAfter,
          anchor.sourceTokenAt,
          anchor.targetTokenAt,
          anchor.sourceTokenBefore,
          anchor.targetTokenBefore,
          anchor.highlightAnchorTarget,
        ]
      : [
          anchor.sourceTokenBefore,
          anchor.targetTokenBefore,
          anchor.sourceTokenAt,
          anchor.targetTokenAt,
          anchor.sourceTokenAfter,
          anchor.targetTokenAfter,
          anchor.highlightAnchorTarget,
        ];
    const lexicalAnchorCandidate = lexicalAnchorPriority.find(
      (candidate) =>
        Number.isFinite(candidate?.charStart) &&
        candidate.charStart >= 0 &&
        /[\p{L}\p{N}]/u.test(candidate?.tokenText || "")
    );
    const shouldForcePunctuationBoundary =
      anchor?.boundaryMeta?.forcePunctuationHighlight === true ||
      dashBoundaryRegex.test(boundaryPunctuationChar || "") ||
      dashPosFromBoundary >= 0;
    const punctuationAnchorCandidate = shouldForcePunctuationBoundary
      ? [
          anchor.highlightAnchorTarget,
          anchor.sourceTokenAt,
          anchor.targetTokenAt,
          anchor.sourceTokenBefore,
          anchor.targetTokenBefore,
          anchor.sourceTokenAfter,
          anchor.targetTokenAfter,
        ].find(
          (candidate) =>
            Number.isFinite(candidate?.charStart) &&
            candidate.charStart >= 0 &&
            dashBoundaryRegex.test(candidate?.tokenText || "")
        )
      : null;
    const hasExplicitQuoteBoundary = isExplicitQuoteBoundaryIntent(boundaryIntent);
    const shouldForceQuoteBoundary = shouldForceQuoteBoundaryHighlight(
      boundaryIntent,
      boundaryIntentSource
    );
    const shouldPreferQuoteBoundary =
      shouldForceQuoteBoundary ||
      (hasExplicitQuoteBoundary && !lexicalAnchorCandidate && quotePosFromBoundary >= 0);
    traceQuoteSuggestion("highlight_insert.quote_strategy", suggestion, {
      force: true,
      boundaryIntent,
      boundaryIntentSource,
      expectedQuoteRole: expectedQuoteRoleForIntent,
      hasExplicitQuoteBoundary,
      shouldForceQuoteBoundary,
      shouldPreferQuoteBoundary,
      lexicalAnchorToken: lexicalAnchorCandidate?.tokenText || null,
      lexicalAnchorStart: Number.isFinite(lexicalAnchorCandidate?.charStart)
        ? lexicalAnchorCandidate.charStart
        : null,
      quotePosFromBoundary,
    });

  const resolveAnchorEnd = (candidate) => {
    if (!Number.isFinite(candidate?.charStart) || candidate.charStart < 0) return null;
    if (Number.isFinite(candidate?.charEnd) && candidate.charEnd > candidate.charStart) {
      return candidate.charEnd;
    }
    if (typeof candidate?.tokenText === "string" && candidate.tokenText.length > 0) {
      return candidate.charStart + candidate.tokenText.length;
    }
    return candidate.charStart + 1;
  };

  if (shouldPreferQuoteBoundary) {
    if (!range && quotePosFromBoundary >= 0) {
      range = await resolveQuoteRangeNearPos(quotePosFromBoundary);
    }
    if (!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0) {
      const quotePosFromHighlight = resolveQuotePosFromCandidates(
        baseText,
        [anchor.highlightCharStart],
        boundaryIntent
      );
      if (!range && quotePosFromHighlight >= 0) {
        range = await resolveQuoteRangeNearPos(quotePosFromHighlight);
      }
    }
    if (!range) {
      const fallbackHints = [
        quotePosFromBoundary,
        anchor?.highlightCharStart,
        ...boundaryCandidates,
      ].filter((value, index, arr) => Number.isFinite(value) && value >= 0 && arr.indexOf(value) === index);
      for (const hint of fallbackHints) {
        const quotePos = resolveQuotePosFromCandidates(baseText, [hint], boundaryIntent);
        if (quotePos < 0) continue;
        range = await resolveQuoteRangeNearPos(quotePos);
        if (range) break;
      }
    }
    if (!range) {
      // For quote-boundary insertions, avoid falling back to adjacent words (e.g. highlighting "ki"/"i").
      const unresolvedPayload = {
        suggestionId: suggestion?.id ?? null,
        paragraphIndex: suggestion?.paragraphIndex,
        boundaryIntent,
        boundaryIntentSource,
        quotePosFromBoundary,
        opPos: suggestion?.meta?.op?.pos,
        opCorrectedPos: suggestion?.meta?.op?.correctedPos,
        boundaryCandidates,
      };
      warn("highlightInsertSuggestion: quote boundary unresolved", unresolvedPayload);
      warn("highlightInsertSuggestion: quote boundary unresolved payload", JSON.stringify(unresolvedPayload));
      traceQuoteSuggestion("highlight_insert.quote_unresolved", suggestion, {
        force: true,
        boundaryIntent,
        boundaryIntentSource,
        quotePosFromBoundary,
        boundaryCandidates,
      });
      return false;
    }
    traceQuoteSuggestion("highlight_insert.quote_selected", suggestion, {
      force: true,
      boundaryIntent,
      boundaryIntentSource,
      expectedQuoteRole: expectedQuoteRoleForIntent,
      quotePosFromBoundary,
    });
  } else if (shouldForcePunctuationBoundary) {
    if (!range && dashPosFromBoundary >= 0) {
      range = await resolveDashRangeNearPos(dashPosFromBoundary);
    }
    if (!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0) {
      const dashPosFromHighlight = resolveDashPosFromCandidates(baseText, [anchor.highlightCharStart]);
      if (dashPosFromHighlight >= 0) {
        range = await resolveDashRangeNearPos(dashPosFromHighlight);
      }
    }
    if (!range) {
      const fallbackHints = [
        dashPosFromBoundary,
        anchor?.highlightCharStart,
        ...dashBoundaryCandidates,
      ].filter((value, index, arr) => Number.isFinite(value) && value >= 0 && arr.indexOf(value) === index);
      for (const hint of fallbackHints) {
        const dashPos = resolveDashPosFromCandidates(baseText, [hint]);
        if (dashPos < 0) continue;
        range = await resolveDashContextRangeNearPos(dashPos);
        if (range) break;
      }
    }
    if (!range) {
      const unresolvedPayload = {
        suggestionId: suggestion?.id ?? null,
        paragraphIndex: suggestion?.paragraphIndex,
        boundaryPunctuationChar,
        dashPosFromBoundary,
        opPos: suggestion?.meta?.op?.pos,
        opCorrectedPos: suggestion?.meta?.op?.correctedPos,
        boundaryCandidates: dashBoundaryCandidates,
      };
      warn("highlightInsertSuggestion: punctuation boundary unresolved", unresolvedPayload);
      return false;
    }
  } else if (!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0) {
    const metaEndCandidate = {
      charStart: anchor.highlightCharStart,
      charEnd: anchor.highlightCharEnd,
      tokenText: anchor.highlightText,
    };
    const metaEnd = resolveAnchorEnd(metaEndCandidate);
    range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      anchor.highlightCharStart,
      metaEnd,
      "highlight-insert-meta",
      anchor.highlightText
    );
  }

  const highlightAnchorCandidate = shouldForcePunctuationBoundary
    ? punctuationAnchorCandidate ||
      [
        anchor.highlightAnchorTarget,
        anchor.sourceTokenAt,
        anchor.targetTokenAt,
        anchor.sourceTokenBefore,
        anchor.targetTokenBefore,
        anchor.sourceTokenAfter,
        anchor.targetTokenAfter,
      ].find((candidate) => Number.isFinite(candidate?.charStart) && candidate.charStart >= 0)
    : lexicalAnchorCandidate ||
      [
        anchor.highlightAnchorTarget,
        anchor.sourceTokenAt,
        anchor.targetTokenAt,
        anchor.sourceTokenBefore,
        anchor.targetTokenBefore,
        anchor.sourceTokenAfter,
        anchor.targetTokenAfter,
      ].find((candidate) => Number.isFinite(candidate?.charStart) && candidate.charStart >= 0);

  if (!range && !shouldPreferQuoteBoundary && !shouldForcePunctuationBoundary && highlightAnchorCandidate) {
    const anchorEnd = resolveAnchorEnd(highlightAnchorCandidate);
    range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      highlightAnchorCandidate.charStart,
      anchorEnd,
      "highlight-insert-anchor",
      highlightAnchorCandidate.tokenText || anchor.highlightText
    );
  }

  if (!range && shouldForcePunctuationBoundary) {
    return false;
  }

  if (!range && lastWord) {
    const wordSearch = paragraph.getRange().search(lastWord, {
      matchCase: false,
      matchWholeWord: true,
    });
    wordSearch.load("items");
    await context.sync();
    if (wordSearch.items.length) {
      range = wordSearch.items[wordSearch.items.length - 1];
    }
  }

  if (!range && leftContext && leftContext.trim()) {
    const leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightSnippet = (rawRight || "").replace(/,/g, "").trim();
    rightSnippet = rightSnippet.slice(0, 8);
    if (rightSnippet) {
      const rightSearch = paragraph.getRange().search(rightSnippet, searchOpts);
      rightSearch.load("items");
      await context.sync();
      if (rightSearch.items.length) {
        range = rightSearch.items[0];
      }
    }
  }

    if (!range) return false;

    try {
      range = range.getRange("Content");
    } catch (err) {
      warn("highlight insert: failed to focus range", err);
    }

    const applied = await applySuggestionMarkerFormat(context, range, suggestion);
    if (!applied) return false;
    addPendingSuggestionOnline(suggestion);
    return true;
  } catch (err) {
    warn("highlightInsertSuggestion failed; skipping marker", err);
    return false;
  }
}

async function findCommaRangeByOrdinal(context, paragraph, original, op) {
  try {
    const ordinal = countCommasUpTo(original, op.pos);
    if (ordinal <= 0) {
      warn("highlight delete: no comma ordinal", op);
      return null;
    }
    const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
    commaSearch.load("items");
    await context.sync();
    if (!commaSearch.items.length || ordinal > commaSearch.items.length) {
      warn("highlight delete: comma search out of range");
      return null;
    }
    return commaSearch.items[ordinal - 1];
  } catch (err) {
    warn("findCommaRangeByOrdinal failed", err);
    return null;
  }
}

function extractLastWord(text) {
  // Extract the last word, handling quotation marks as separate tokens
  // For Slovenian, quotes should not be grouped with words
  const match = text.match(/([\p{L}\d]+)[^\p{L}\d]*$/u);
  const word = match ? match[1] : "";
  return word;
}

function extractLastWordWithContext(text) {
  // Extract the last word along with any trailing quotation marks
  // This helps identify the word and understand comma positioning relative to quotes
  const match = text.match(
    /([\p{L}\d]+)(["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A\s]*)$/u
  );
  if (!match) return { word: "", trailingChars: "" };
  const word = match[1];
  const trailingChars = match[2];
  return { word, trailingChars };
}

async function tryApplyDeleteUsingMetadata(context, paragraph, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return false;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);

  const sourceAnchor =
    meta.sourceTokenAt ?? meta.sourceTokenBefore ?? meta.sourceTokenAfter ?? meta.highlightAnchorTarget;
  const charStart =
    suggestion.charHint?.start ??
    meta.charStart ??
    sourceAnchor?.charStart ??
    suggestion.meta?.op?.originalPos ??
    -1;
  const fallbackEndFromToken =
    typeof sourceAnchor?.tokenText === "string" && sourceAnchor.tokenText.length > 0
      ? charStart + sourceAnchor.tokenText.length
      : charStart + 1;
  const charEnd = suggestion.charHint?.end ?? meta.charEnd ?? fallbackEndFromToken;

  if (Number.isFinite(charStart) && charStart >= 0) {
    paragraph.load("text");
    await context.sync();
    const liveText = paragraph.text || "";
    const sourceText = entry?.originalText ?? liveText;
    const mappedStart = mapIndexAcrossCanonical(sourceText, liveText, charStart);

    let commaIndex = -1;
    for (let delta = 0; delta <= 3; delta++) {
      const left = mappedStart - delta;
      const right = mappedStart + delta;
      if (left >= 0 && liveText[left] === ",") {
        commaIndex = left;
        break;
      }
      if (right < liveText.length && liveText[right] === ",") {
        commaIndex = right;
        break;
      }
    }

    if (commaIndex >= 0) {
      const commaRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        commaIndex,
        commaIndex + 1,
        "apply-delete-comma",
        ","
      );
      if (commaRange) {
        commaRange.insertText("", Word.InsertLocation.replace);
        return true;
      }
    }
  }

  return false;
}

async function tryApplyDeleteUsingHighlight(context, paragraph, suggestion) {
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
  const tryByRange = async (range) => {
    if (!range) return false;
    try {
      range.insertText("", Word.InsertLocation.replace);
      return true;
    } catch (err) {
      warn("apply delete: highlight span removal failed", err);
      return false;
    }
  };

  const candidates = buildDeleteRangeCandidates(suggestion);
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!Number.isFinite(candidate.start) || candidate.start < 0) {
      continue;
    }
    const safeEnd =
      Number.isFinite(candidate.end) && candidate.end > candidate.start
        ? candidate.end
        : candidate.start + 1;
    let span = null;
    try {
      span = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        candidate.start,
        safeEnd,
        `apply-delete-highlight-${i}`,
        candidate.snippet
      );
    } catch (err) {
      warn("apply delete: candidate span lookup failed", err);
      continue;
    }
    if (await tryByRange(span)) {
      return true;
    }
  }

  return false;
}

async function applyDeleteSuggestionLegacy(context, paragraph, suggestion) {
  const pos =
    suggestion.meta?.op?.originalPos ??
    suggestion.meta?.op?.pos ??
    suggestion.charHint?.start ??
    0;
  const ordinal = countCommasUpTo(paragraph.text || "", pos);
  if (ordinal <= 0) {
    warn("apply delete: no ordinal");
    return false;
  }
  const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
  commaSearch.load("items");
  await context.sync();
  const idx = ordinal - 1;
  if (!commaSearch.items.length || idx >= commaSearch.items.length) {
    warn("apply delete: ordinal out of range");
    return false;
  }
  commaSearch.items[idx].insertText("", Word.InsertLocation.replace);
  return true;
}

async function applyDeleteSuggestion(context, paragraph, suggestion) {
  return await tryApplyDeleteUsingMetadata(context, paragraph, suggestion);
}

function isResolvedTokenWithinHintWindow(
  resolvedStart,
  tokenText,
  mappedHint,
  { preferEnd = false, maxDrift = null } = {}
) {
  if (!Number.isFinite(resolvedStart) || resolvedStart < 0) return false;
  if (!Number.isFinite(mappedHint) || mappedHint < 0) return true;
  if (!Number.isFinite(maxDrift) || maxDrift < 0) return true;
  const tokenLength = typeof tokenText === "string" ? tokenText.length : 0;
  const resolvedBoundary = preferEnd ? resolvedStart + tokenLength : resolvedStart;
  return Math.abs(resolvedBoundary - mappedHint) <= maxDrift;
}

async function findTokenRangeForAnchor(context, paragraph, anchorSnapshot, options = {}) {
  if (!anchorSnapshot?.tokenText) return null;
  if (typeof paragraph.text !== "string") {
    paragraph.load("text");
    await context.sync();
  }
  const liveText = typeof options.liveText === "string" ? options.liveText : paragraph.text || "";
  const fallbackOrdinal =
    typeof anchorSnapshot.textOccurrence === "number"
      ? anchorSnapshot.textOccurrence
      : typeof anchorSnapshot.tokenIndex === "number"
        ? anchorSnapshot.tokenIndex
        : 0;
  const resolveMappedHint = (tokenText, preferEnd = false) => {
    const trimmedToken = typeof tokenText === "string" ? tokenText.trim() : "";
    let sourceHint = Number.isFinite(options.hintIndex)
      ? options.hintIndex
      : preferEnd
        ? Number.isFinite(anchorSnapshot.charEnd)
          ? anchorSnapshot.charEnd
          : Number.isFinite(anchorSnapshot.charStart) && trimmedToken
            ? anchorSnapshot.charStart + trimmedToken.length
            : anchorSnapshot.charStart
        : anchorSnapshot.charStart;
    if (
      !Number.isFinite(options.hintIndex) &&
      !Number.isFinite(sourceHint) &&
      Number.isFinite(anchorSnapshot.charEnd) &&
      trimmedToken
    ) {
      sourceHint = anchorSnapshot.charEnd - trimmedToken.length;
    }
    if (!Number.isFinite(sourceHint) || sourceHint < 0) return null;
    if (typeof options.sourceText === "string" && options.sourceText.length) {
      const mapped = mapIndexAcrossCanonical(options.sourceText, liveText, sourceHint, {
        allowEnd: preferEnd,
      });
      return Number.isFinite(mapped) && mapped >= 0 ? mapped : null;
    }
    return sourceHint;
  };
  const tryFind = async (text, ordinalHint, variantOptions = {}) => {
    if (!text) return null;
    const wholeWord = WORD_CHAR_REGEX.test(text) && !/[^\p{L}\d]/u.test(text);
    const matches = paragraph.getRange().search(text, {
      matchCase: false,
      matchWholeWord: wholeWord,
    });
    matches.load("items");
    await context.sync();
    if (!matches.items.length) return null;
    const ordinal =
      typeof ordinalHint === "number"
        ? ordinalHint
        : typeof anchorSnapshot.tokenIndex === "number"
          ? anchorSnapshot.tokenIndex
          : fallbackOrdinal;
    let targetIndex = Math.max(0, Math.min(ordinal, matches.items.length - 1));
    let resolvedStart = -1;
    if (wholeWord && liveText) {
      const mappedHint = resolveMappedHint(text, Boolean(variantOptions.preferEnd));
      const lookupOptions = resolveLemmaAwareTokenLookupOptions(options.suggestion, anchorSnapshot);
      const positions = getWordTokenPositionsInText(liveText, text);
      const hintedIndex = findWordTokenMatchIndexInText(
        liveText,
        text,
        mappedHint,
        ordinal,
        lookupOptions,
        positions
      );
      if (hintedIndex >= 0 && hintedIndex < matches.items.length) {
        targetIndex = hintedIndex;
      }
      if (targetIndex >= 0 && targetIndex < positions.length) {
        resolvedStart = positions[targetIndex];
      }
      if (
        resolvedStart >= 0 &&
        !isResolvedTokenWithinHintWindow(resolvedStart, text, mappedHint, {
          preferEnd: Boolean(variantOptions.preferEnd),
          maxDrift: variantOptions.maxResolvedHintDrift,
        })
      ) {
        return null;
      }
    }
    return {
      range: matches.items[targetIndex],
      start: resolvedStart,
      tokenText: text,
    };
  };

  const trimmed = anchorSnapshot.tokenText.trim();
  const preferRawTokenText = Boolean(options?.preferRawTokenText);
  if (preferRawTokenText) {
    const rawResolved = await tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence, options);
    if (rawResolved) return rawResolved;
    if (trimmed && trimmed !== anchorSnapshot.tokenText) {
      const trimmedResolved = await tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence, options);
      if (trimmedResolved) return trimmedResolved;
    }
  } else {
    if (trimmed && trimmed !== anchorSnapshot.tokenText) {
      let resolved = await tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence, options);
      if (resolved) return resolved;
    }
    const resolved = await tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence, options);
    if (resolved) {
      if (trimmed && trimmed !== anchorSnapshot.tokenText) {
        resolved.tokenText = trimmed;
      }
      return resolved;
    }
  }
  return null;
}

function getCleanWordTokenFromAnchor(anchorSnapshot) {
  if (!anchorSnapshot?.tokenText) return "";
  return (anchorSnapshot.tokenText || "")
    .trim()
    .replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
}

function mapAnchorHintToText(anchorSnapshot, sourceText, targetText, { preferEnd = false, hintIndex = null } = {}) {
  let sourceHint = Number.isFinite(hintIndex)
    ? hintIndex
    : preferEnd
      ? Number.isFinite(anchorSnapshot?.charEnd)
        ? anchorSnapshot.charEnd
        : Number.isFinite(anchorSnapshot?.charStart)
          ? anchorSnapshot.charStart + getCleanWordTokenFromAnchor(anchorSnapshot).length
          : null
      : anchorSnapshot?.charStart;
  if (!Number.isFinite(sourceHint) || sourceHint < 0) return null;
  if (typeof sourceText === "string" && sourceText.length) {
    const mapped = mapIndexAcrossCanonical(sourceText, targetText, sourceHint, {
      allowEnd: preferEnd,
    });
    return Number.isFinite(mapped) && mapped >= 0 ? mapped : null;
  }
  return sourceHint;
}

function resolveTokenPairMatchInText(
  liveText,
  sourceText,
  suggestion,
  beforeAnchor,
  afterAnchor,
  options = {}
) {
  const beforeToken = getCleanWordTokenFromAnchor(beforeAnchor);
  const afterToken = getCleanWordTokenFromAnchor(afterAnchor);
  if (!beforeToken || !afterToken || !liveText) return null;

  const beforePositions = getWordTokenPositionsInText(liveText, beforeToken);
  const afterPositions = getWordTokenPositionsInText(liveText, afterToken);
  if (!beforePositions.length || !afterPositions.length) return null;

  const beforeLookup = resolveLemmaAwareTokenLookupOptions(suggestion, beforeAnchor);
  const afterLookup = resolveLemmaAwareTokenLookupOptions(suggestion, afterAnchor);
  const beforeHint = mapAnchorHintToText(beforeAnchor, sourceText, liveText, {
    preferEnd: true,
    hintIndex: options.beforeHintIndex,
  });
  const afterHint = mapAnchorHintToText(afterAnchor, sourceText, liveText, {
    preferEnd: false,
    hintIndex: options.afterHintIndex,
  });
  const preferredGapHint = Number.isFinite(options.preferredGapHintIndex)
    ? Math.max(0, Math.min(Math.floor(options.preferredGapHintIndex), liveText.length))
    : null;
  const allowQuoteGap = options.allowQuoteGap !== false;
  const allowCommaInGap = Boolean(options.allowCommaInGap);
  const maxGapLength = Number.isFinite(options.maxGapLength)
    ? Math.max(0, Math.floor(options.maxGapLength))
    : 24;
  const gapPattern = allowQuoteGap
    ? /^[\s"'`\u201C\u201D\u201E\u00AB\u00BB\u2019\u2018()\[\]]*$/u
    : /^\s*$/u;

  const candidates = [];
  for (let beforeIndex = 0; beforeIndex < beforePositions.length; beforeIndex++) {
    const beforeStart = beforePositions[beforeIndex];
    const beforeEnd = beforeStart + beforeToken.length;
    if (
      Number.isFinite(beforeHint) &&
      !isResolvedTokenWithinHintWindow(beforeStart, beforeToken, beforeHint, {
        preferEnd: true,
        maxDrift: beforeLookup.maxDistance ?? 24,
      })
    ) {
      continue;
    }
    for (let afterIndex = 0; afterIndex < afterPositions.length; afterIndex++) {
      const afterStart = afterPositions[afterIndex];
      if (afterStart < beforeEnd) continue;
      const gapText = liveText.slice(beforeEnd, afterStart);
      const gapWithoutCommas = allowCommaInGap ? gapText.replace(/,/gu, "") : gapText;
      if (!gapPattern.test(gapWithoutCommas)) continue;
      if (gapWithoutCommas.length > maxGapLength) continue;
      if (
        Number.isFinite(afterHint) &&
        !isResolvedTokenWithinHintWindow(afterStart, afterToken, afterHint, {
          preferEnd: false,
          maxDrift: afterLookup.maxDistance ?? 24,
        })
      ) {
        continue;
      }
      let score = gapWithoutCommas.length;
      if (Number.isFinite(beforeHint)) score += Math.abs(beforeStart - beforeHint);
      if (Number.isFinite(afterHint)) score += Math.abs(afterStart - afterHint);
      if (Number.isFinite(preferredGapHint)) score += Math.abs(beforeEnd - preferredGapHint);
      candidates.push({
        beforeIndex,
        afterIndex,
        beforeStart,
        beforeEnd,
        afterStart,
        gapText,
        score,
      });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((left, right) => left.score - right.score);
  if (candidates.length > 1 && candidates[1].score === candidates[0].score) {
    return null;
  }

  return {
    beforeToken,
    afterToken,
    ...candidates[0],
  };
}

async function resolveTokenPairRangesForAnchors(
  context,
  paragraph,
  liveText,
  sourceText,
  suggestion,
  beforeAnchor,
  afterAnchor,
  options = {}
) {
  const pairMatch = resolveTokenPairMatchInText(
    liveText,
    sourceText,
    suggestion,
    beforeAnchor,
    afterAnchor,
    options
  );
  if (!pairMatch) return null;

  const beforeMatches = paragraph.getRange().search(pairMatch.beforeToken, {
    matchCase: false,
    matchWholeWord: true,
  });
  const afterMatches = paragraph.getRange().search(pairMatch.afterToken, {
    matchCase: false,
    matchWholeWord: true,
  });
  beforeMatches.load("items");
  afterMatches.load("items");
  await context.sync();

  const beforeRange = beforeMatches.items[pairMatch.beforeIndex] || null;
  const afterRange = afterMatches.items[pairMatch.afterIndex] || null;
  if (!beforeRange || !afterRange) return null;

  return {
    beforeRange,
    afterRange,
    beforeResolved: {
      range: beforeRange,
      start: pairMatch.beforeStart,
      tokenText: pairMatch.beforeToken,
    },
    afterResolved: {
      range: afterRange,
      start: pairMatch.afterStart,
      tokenText: pairMatch.afterToken,
    },
    gapText: pairMatch.gapText,
  };
}

async function resolveStrictInsertRangeForSuggestion(
  context,
  paragraph,
  op,
  suggestion,
  reason = "strict-insert"
) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) {
    return { range: null, insertLocation: null, reason: "insert_missing_anchor_meta" };
  }

  const boundary = op?.boundary ?? null;
  const persistedBoundary = meta?.boundaryMeta ?? null;
  const normalizeQuoteBoundaryIntent = (value) => {
    if (typeof value !== "string") return null;
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (!compact) return null;
    if (compact === "none") return "none";
    if (compact === "unknown") return "unknown";
    if (compact === "before") return "before_closing_quote";
    if (compact === "after") return "after_closing_quote";
    if (compact === "whitespaceonly") return "whitespace_only";
    if (compact === "insidequoteboundary") return "inside_quote_boundary";
    if (compact === "insidequotegap") return "inside_quote_gap";
    if (compact === "beforeclosingquote" || compact === "beforequote") return "before_closing_quote";
    if (compact === "afterclosingquote" || compact === "afterquote") return "after_closing_quote";
    if (compact === "beforeopeningquote") return "before_opening_quote";
    if (compact === "afteropeningquote") return "after_opening_quote";
    return null;
  };
  const beforeAnchor =
    persistedBoundary?.beforeToken ??
    boundary?.beforeToken ??
    meta.targetTokenBefore ??
    meta.sourceTokenBefore ??
    null;
  const afterAnchor =
    persistedBoundary?.afterToken ??
    boundary?.afterToken ??
    meta.targetTokenAfter ??
    meta.sourceTokenAfter ??
    null;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
  const sourceText = typeof entry?.originalText === "string" ? entry.originalText : "";
  if (typeof paragraph.text !== "string") {
    paragraph.load("text");
    await context.sync();
  }
  const liveText = paragraph.text || "";
  const explicitQuoteIntent =
    normalizeQuoteBoundaryIntent(
      persistedBoundary?.explicitQuoteIntent ??
        suggestion?.meta?.op?.explicitQuoteIntent ??
        op?.explicitQuoteIntent ??
        boundary?.explicitQuoteIntent ??
        boundary?.quotePolicy
    ) ?? "unknown";
  const preferRawQuoteAnchors = explicitQuoteIntent !== "unknown" && explicitQuoteIntent !== "none";
  const requiresAfterQuoteBoundary =
    explicitQuoteIntent === "after_closing_quote" || explicitQuoteIntent === "after_opening_quote";
  const preferredCandidates = [
    persistedBoundary?.sourceBoundaryPos,
    suggestion?.meta?.op?.originalPos,
    boundary?.resolvedPos,
    boundary?.requestedPos,
    boundary?.sourceBoundaryEnd,
    boundary?.sourceBoundaryStart,
    suggestion?.meta?.op?.correctedPos,
    suggestion?.meta?.op?.pos,
    suggestion?.charHint?.start,
    meta?.targetCharStart,
    meta?.charStart,
  ].filter((value, index, array) => Number.isFinite(value) && value >= 0 && array.indexOf(value) === index);
  const preferredLiveHint = preferredCandidates.reduce((resolved, candidate) => {
    if (resolved >= 0) return resolved;
    const mapped = sourceText
      ? mapIndexAcrossCanonical(sourceText, liveText, candidate, { allowEnd: true })
      : candidate;
    return Number.isFinite(mapped) && mapped >= 0 ? mapped : -1;
  }, -1);
  const pairResolved =
    beforeAnchor && afterAnchor
      ? await resolveTokenPairRangesForAnchors(
          context,
          paragraph,
          liveText,
          sourceText,
          suggestion,
          beforeAnchor,
          afterAnchor,
          {
            beforeHintIndex: boundary?.sourceBoundaryStart,
            afterHintIndex: boundary?.sourceBoundaryEnd,
            preferredGapHintIndex: preferredLiveHint,
            allowQuoteGap: true,
          }
        )
      : null;
  const beforeResolved = pairResolved?.beforeResolved ??
    (beforeAnchor
      ? await findTokenRangeForAnchor(context, paragraph, beforeAnchor, {
          sourceText,
          liveText,
          suggestion,
          preferEnd: true,
          hintIndex: boundary?.sourceBoundaryStart,
          maxResolvedHintDrift: suggestion?.meta?.lemmaAnchorAuthoritative ? 24 : 16,
          preferRawTokenText: preferRawQuoteAnchors,
        })
      : null);
  const afterResolved = pairResolved?.afterResolved ??
    (afterAnchor
      ? await findTokenRangeForAnchor(context, paragraph, afterAnchor, {
          sourceText,
          liveText,
          suggestion,
          hintIndex: boundary?.sourceBoundaryEnd,
          maxResolvedHintDrift: suggestion?.meta?.lemmaAnchorAuthoritative ? 24 : 16,
          preferRawTokenText: preferRawQuoteAnchors,
        })
      : null);

  const beforeRange = beforeResolved?.range ?? null;
  const afterRange = afterResolved?.range ?? null;
  const beforeText = beforeRange
    ? beforeRange.text || beforeResolved.tokenText || (beforeAnchor?.tokenText || "").trim()
    : "";
  const afterText = afterRange
    ? afterRange.text || afterResolved.tokenText || (afterAnchor?.tokenText || "").trim()
    : "";
  let beforeStart =
    beforeRange && Number.isFinite(beforeResolved?.start) && beforeResolved.start >= 0
      ? beforeResolved.start
      : beforeRange
        ? findWordTokenStartByHintInText(
            liveText,
            beforeText,
            sourceText && Number.isFinite(beforeAnchor?.charStart)
              ? mapIndexAcrossCanonical(sourceText, liveText, beforeAnchor.charStart)
              : null,
            beforeAnchor?.textOccurrence ?? beforeAnchor?.tokenIndex ?? 0,
            resolveLemmaAwareTokenLookupOptions(suggestion, beforeAnchor)
          )
        : -1;
  let afterStart =
    afterRange && Number.isFinite(afterResolved?.start) && afterResolved.start >= 0
      ? afterResolved.start
      : afterRange
        ? findWordTokenStartByHintInText(
            liveText,
            afterText,
            sourceText && Number.isFinite(afterAnchor?.charStart)
              ? mapIndexAcrossCanonical(sourceText, liveText, afterAnchor.charStart)
              : null,
            afterAnchor?.textOccurrence ?? afterAnchor?.tokenIndex ?? 0,
            resolveLemmaAwareTokenLookupOptions(suggestion, afterAnchor)
          )
        : -1;
  if (
    (!Number.isFinite(beforeStart) || beforeStart < 0) &&
    beforeRange &&
    sourceText &&
    Number.isFinite(beforeAnchor?.charStart) &&
    beforeAnchor.charStart >= 0
  ) {
    const mappedBeforeStart = mapIndexAcrossCanonical(sourceText, liveText, beforeAnchor.charStart, {
      allowEnd: true,
    });
    if (Number.isFinite(mappedBeforeStart) && mappedBeforeStart >= 0) {
      beforeStart = mappedBeforeStart;
    }
  }
  if (
    (!Number.isFinite(afterStart) || afterStart < 0) &&
    afterRange &&
    sourceText &&
    Number.isFinite(afterAnchor?.charStart) &&
    afterAnchor.charStart >= 0
  ) {
    const mappedAfterStart = mapIndexAcrossCanonical(sourceText, liveText, afterAnchor.charStart, {
      allowEnd: true,
    });
    if (Number.isFinite(mappedAfterStart) && mappedAfterStart >= 0) {
      afterStart = mappedAfterStart;
    }
  }

  const preferredSide = persistedBoundary?.preferredSide ?? boundary?.preferredSide ?? "after_before_token";
  const quotePolicy =
    normalizeQuoteBoundaryIntent(
      persistedBoundary?.explicitQuoteIntent ?? boundary?.explicitQuoteIntent ?? boundary?.quotePolicy
    ) ?? "none";
  const directionalOpeningQuoteChars = new Set(["\u00BB", "\u203A", "(", "["]);
  const directionalClosingQuoteChars = new Set(["\u00AB", "\u2039", ")", "]"]);
  const genericQuoteCharRegex =
    /["'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A\u02BC\uFF02\uFF07]/u;
  const classifyQuoteRoleAt = (text, index) => {
    if (typeof text !== "string" || !text.length || !Number.isFinite(index) || index < 0 || index >= text.length) {
      return null;
    }
    const current = text[index] || "";
    if (!current) return null;
    if (directionalOpeningQuoteChars.has(current)) return "opening";
    if (directionalClosingQuoteChars.has(current)) return "closing";
    if (!genericQuoteCharRegex.test(current)) return null;
    let left = index - 1;
    while (left >= 0 && /[\s\u200B-\u200D\uFEFF]/u.test(text[left] || "")) left--;
    let right = index + 1;
    while (right < text.length && /[\s\u200B-\u200D\uFEFF]/u.test(text[right] || "")) right++;
    const leftIsWord = left >= 0 && /[\p{L}\p{N}]/u.test(text[left] || "");
    const rightIsWord = right < text.length && /[\p{L}\p{N}]/u.test(text[right] || "");
    const immediateLeft = index > 0 ? text[index - 1] || "" : "";
    const immediateRight = index + 1 < text.length ? text[index + 1] || "" : "";
    const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
    const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
    const leftHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateLeft || "");
    const rightHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateRight || "");
    if (rightIsWord && !leftIsWord) return "opening";
    if (leftIsWord && !rightIsWord) return "closing";
    if (leftIsWord && rightIsWord) {
      if (leftAdjacentIsWord && rightAdjacentIsWord) return null;
      if (rightHasGap && !leftHasGap) return "closing";
      if (leftHasGap && !rightHasGap) return "opening";
      if (leftAdjacentIsWord && !rightAdjacentIsWord) return "closing";
      if (!leftAdjacentIsWord && rightAdjacentIsWord) return "opening";
      return "closing";
    }
    return "closing";
  };
  const isOpeningQuoteChar = (char, index = -1, text = liveText) => {
    if (directionalOpeningQuoteChars.has(char || "")) return true;
    if (directionalClosingQuoteChars.has(char || "")) return false;
    if (!genericQuoteCharRegex.test(char || "")) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "opening";
    }
    return true;
  };
  const isClosingQuoteChar = (char, index = -1, text = liveText) => {
    if (directionalClosingQuoteChars.has(char || "")) return true;
    if (directionalOpeningQuoteChars.has(char || "")) return false;
    if (!genericQuoteCharRegex.test(char || "")) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "closing";
    }
    return true;
  };
  const isBoundaryQuoteChar = (char, index = -1, text = liveText) =>
    isClosingQuoteChar(char, index, text) || isOpeningQuoteChar(char, index, text);
  const explicitGapPosCandidates = [boundary?.resolvedPos, boundary?.requestedPos, preferredLiveHint].filter(
    (value, index, array) => Number.isFinite(value) && value >= 0 && array.indexOf(value) === index
  );
  const explicitGapPos = explicitGapPosCandidates.length ? explicitGapPosCandidates[0] : null;
  const hasLiveCommaAcrossQuoteBoundary = (pos) => {
    if (!Number.isFinite(pos) || pos < 0 || pos > liveText.length) return false;
    let left = pos - 1;
    while (left >= 0 && /\s/u.test(liveText[left])) left--;
    while (left >= 0 && isBoundaryQuoteChar(liveText[left], left, liveText)) left--;
    while (left >= 0 && /\s/u.test(liveText[left])) left--;
    if (left >= 0 && liveText[left] === ",") return true;

    let right = pos;
    while (right < liveText.length && /\s/u.test(liveText[right])) right++;
    while (right < liveText.length && isBoundaryQuoteChar(liveText[right], right, liveText)) right++;
    while (right < liveText.length && /\s/u.test(liveText[right])) right++;
    if (right < liveText.length && liveText[right] === ",") return true;
    return false;
  };
  const shouldBlockQuoteBoundaryInsert = (pos) =>
    !op?.hasLocalDeleteCounterpart && hasLiveCommaAcrossQuoteBoundary(pos);
  const resolveQuoteBoundaryRangeByIntent = async (
    quoteIntent,
    anchorPos,
    traceSuffix = "quote-boundary",
    { blockPosOverride } = {}
  ) => {
    if (
      quoteIntent !== "before_closing_quote" &&
      quoteIntent !== "after_closing_quote" &&
      quoteIntent !== "before_opening_quote" &&
      quoteIntent !== "after_opening_quote"
    ) {
      return null;
    }
    if (!Number.isFinite(anchorPos) || anchorPos < 0 || !liveText.length) {
      return {
        range: null,
        insertLocation: null,
        reason: "insert_live_quote_boundary_unresolved",
      };
    }
    const quoteMatcher =
      quoteIntent === "before_closing_quote" || quoteIntent === "after_closing_quote"
        ? (char, idx) => isClosingQuoteChar(char, idx, liveText)
        : (char, idx) => isOpeningQuoteChar(char, idx, liveText);
    const insertLocation = quoteIntent.startsWith("before_")
      ? Word.InsertLocation.before
      : Word.InsertLocation.after;
    const safeAnchor = Math.max(0, Math.min(Math.floor(anchorPos), liveText.length - 1));
    const offsets = [0];
    for (let step = 1; step <= 24; step++) {
      offsets.push(step, -step);
    }
    const preferredDirection = quoteIntent.startsWith("before_") ? "right" : "left";
    let bestQuoteIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    const considerCandidates = (allowOppositeSide = false) => {
      for (const offset of offsets) {
        const idx = safeAnchor + offset;
        if (idx < 0 || idx >= liveText.length) continue;
        if (!allowOppositeSide) {
          if (preferredDirection === "right" && idx < anchorPos) continue;
          if (preferredDirection === "left" && idx > anchorPos) continue;
        }
        const quoteChar = liveText[idx] || "";
        if (!quoteMatcher(quoteChar, idx)) continue;
        const score = Math.abs(idx - anchorPos);
        if (score < bestScore) {
          bestScore = score;
          bestQuoteIndex = idx;
        }
      }
    };
    considerCandidates(false);
    if (bestQuoteIndex < 0) {
      // Fallback if strict directional search fails due minor anchor drift.
      considerCandidates(true);
    }
    if (bestQuoteIndex < 0) {
      return {
        range: null,
        insertLocation: null,
        reason: "insert_live_quote_boundary_unresolved",
      };
    }
    const blockPos = Number.isFinite(blockPosOverride)
      ? blockPosOverride
      : Number.isFinite(explicitGapPos)
        ? explicitGapPos
        : bestQuoteIndex;
    if (shouldBlockQuoteBoundaryInsert(blockPos)) {
      return {
        range: null,
        insertLocation: null,
        reason: "insert_live_quote_boundary_already_has_comma",
      };
    }
    const charRange = await getRangeForCharacterSpan(
      context,
      paragraph,
      liveText,
      bestQuoteIndex,
      bestQuoteIndex + 1,
      `${reason}-${traceSuffix}`,
      liveText[bestQuoteIndex]
    );
    if (charRange) {
      return {
        range: charRange,
        insertLocation,
        reason: null,
      };
    }
    const snippetRange = await findExactSnippetRangeNearIndex(
      context,
      paragraph,
      liveText,
      liveText[bestQuoteIndex] || "",
      bestQuoteIndex,
      `${reason}-${traceSuffix}-fallback`
    );
    if (snippetRange) {
      return {
        range: snippetRange,
        insertLocation,
        reason: null,
      };
    }
    return {
      range: null,
      insertLocation: null,
      reason: "insert_live_quote_boundary_unresolved",
    };
  };
  const resolveExplicitQuoteBoundaryRange = async () => {
    if (
      explicitQuoteIntent !== "before_closing_quote" &&
      explicitQuoteIntent !== "after_closing_quote" &&
      explicitQuoteIntent !== "before_opening_quote" &&
      explicitQuoteIntent !== "after_opening_quote"
    ) {
      return null;
    }
    const anchorPos = Number.isFinite(explicitGapPos)
      ? explicitGapPos
      : Number.isFinite(preferredLiveHint) && preferredLiveHint >= 0
        ? preferredLiveHint
        : Number.isFinite(beforeStart) && beforeStart >= 0
          ? beforeStart
          : afterStart;
    return resolveQuoteBoundaryRangeByIntent(explicitQuoteIntent, anchorPos, "explicit-quote-boundary", {
      blockPosOverride: explicitGapPos,
    });
  };
  const explicitQuoteBoundaryResolution = await resolveExplicitQuoteBoundaryRange();
  if (explicitQuoteBoundaryResolution) {
    return explicitQuoteBoundaryResolution;
  }
  const resolveGapIntent = (beforeEnd, afterStart, gapText) => {
    if (!Number.isFinite(beforeEnd) || !Number.isFinite(afterStart) || afterStart < beforeEnd) {
      return "unknown";
    }
    if (!Number.isFinite(explicitGapPos)) return "unknown";
    const safePos = Math.max(beforeEnd, Math.min(afterStart, explicitGapPos));
    const offset = safePos - beforeEnd;
    const leadingWhitespaceLen = ((gapText || "").match(/^\s+/u) || [""])[0].length;
    let leadingClosingRun = "";
    for (let i = leadingWhitespaceLen; i < (gapText || "").length; i++) {
      const char = gapText[i] || "";
      const globalIdx = beforeEnd + i;
      if (!isClosingQuoteChar(char, globalIdx, liveText)) break;
      leadingClosingRun += char;
    }
    if (leadingClosingRun) {
      if (offset <= leadingWhitespaceLen) return "before_closing_quote";
      if (offset >= leadingWhitespaceLen + leadingClosingRun.length) return "after_closing_quote";
    }
    const trailingWhitespaceLen = ((gapText || "").match(/\s+$/u) || [""])[0].length;
    const coreGap = (gapText || "").slice(0, Math.max(0, (gapText || "").length - trailingWhitespaceLen));
    let trailingOpeningRun = "";
    for (let i = coreGap.length - 1; i >= 0; i--) {
      const char = coreGap[i] || "";
      const globalIdx = beforeEnd + i;
      if (!isOpeningQuoteChar(char, globalIdx, liveText)) break;
      trailingOpeningRun = char + trailingOpeningRun;
    }
    if (trailingOpeningRun) {
      const openingRunStart = coreGap.length - trailingOpeningRun.length;
      if (offset <= openingRunStart) return "before_opening_quote";
      if (offset >= openingRunStart + trailingOpeningRun.length) return "after_opening_quote";
    }
    return "inside_quote_gap";
  };
  const resolveBeforeRangeForInsert = async (traceSuffix = "insert-before-anchor") => {
    if (!beforeRange || !Number.isFinite(beforeStart) || beforeStart < 0) return beforeRange;
    const beforeEnd = beforeStart + (typeof beforeText === "string" ? beforeText.length : 0);
    if (!Number.isFinite(beforeEnd) || beforeEnd <= beforeStart) return beforeRange;
    const safeEnd = Math.max(beforeStart + 1, Math.min(liveText.length, Math.floor(beforeEnd)));
    let anchorIndex = safeEnd - 1;
    while (anchorIndex >= beforeStart && /[\s\u200B-\u200D\uFEFF]/u.test(liveText[anchorIndex] || "")) {
      anchorIndex--;
    }
    if (anchorIndex < beforeStart || anchorIndex === safeEnd - 1) {
      return beforeRange;
    }
    const trimmedRange = await getRangeForCharacterSpan(
      context,
      paragraph,
      liveText,
      anchorIndex,
      anchorIndex + 1,
      `${reason}-${traceSuffix}`,
      liveText[anchorIndex] || beforeText.trim() || ","
    );
    return trimmedRange || beforeRange;
  };

  if (beforeRange && afterRange && Number.isFinite(beforeStart) && beforeStart >= 0 && Number.isFinite(afterStart) && afterStart >= 0) {
    const beforeEnd = beforeStart + beforeText.length;
    if (beforeEnd <= afterStart) {
      const gapText = pairResolved?.gapText ?? liveText.slice(beforeEnd, afterStart);
      if (!gapText.includes(",")) {
        const gapNoLeadingWs = gapText.replace(/^\s+/u, "");
        const gapNoTrailingWs = gapText.replace(/\s+$/u, "");
        const gapIntent =
          explicitQuoteIntent !== "unknown" && explicitQuoteIntent !== "none"
            ? explicitQuoteIntent
            : resolveGapIntent(beforeEnd, afterStart, gapText);
        const openingQuoteGap =
          Boolean(gapText) &&
          gapNoLeadingWs.length > 0 &&
          [...gapNoLeadingWs].every((char, idx) => {
            const absoluteIdx = beforeEnd + (gapText.length - gapNoLeadingWs.length + idx);
            return isOpeningQuoteChar(char, absoluteIdx, liveText) || /\s/u.test(char);
          });
        const closingQuoteGap =
          Boolean(gapText) &&
          gapNoTrailingWs.length > 0 &&
          [...gapNoTrailingWs].every((char, idx) => {
            const absoluteIdx = beforeEnd + idx;
            return isClosingQuoteChar(char, absoluteIdx, liveText) || /\s/u.test(char);
          });
        const shouldPreferQuoteBoundary =
          isQuoteIntentInferenceEnabled() &&
          closingQuoteGap &&
          gapIntent !== "before_closing_quote" &&
          (quotePolicy === "after_closing_quote" ||
            (preferredSide !== "before_after_token" && preferredLiveHint >= beforeEnd));

        if (shouldPreferQuoteBoundary) {
          const leadingWhitespaceLen = ((gapText.match(/^\s+/u) || [""])[0] || "").length;
          let closingRun = "";
          for (let i = leadingWhitespaceLen; i < gapText.length; i++) {
            const char = gapText[i] || "";
            const absoluteIdx = beforeEnd + i;
            if (!isClosingQuoteChar(char, absoluteIdx, liveText)) break;
            closingRun += char;
          }
          if (closingRun) {
            const quoteBoundaryAnchor = beforeEnd + leadingWhitespaceLen + Math.max(0, closingRun.length - 1);
            const quoteBoundaryResolution = await resolveQuoteBoundaryRangeByIntent(
              "after_closing_quote",
              quoteBoundaryAnchor,
              "auto-quote-boundary",
              { blockPosOverride: explicitGapPos ?? quoteBoundaryAnchor }
            );
            if (quoteBoundaryResolution?.range) {
              return quoteBoundaryResolution;
            }
            if (quoteBoundaryResolution?.reason === "insert_live_quote_boundary_already_has_comma") {
              return quoteBoundaryResolution;
            }
          }
        }
        if (requiresAfterQuoteBoundary) {
          return {
            range: null,
            insertLocation: null,
            reason: "insert_explicit_after_quote_boundary_unresolved",
          };
        }
        return {
          range: await resolveBeforeRangeForInsert("insert-before-gap-anchor"),
          insertLocation: Word.InsertLocation.after,
          reason: null,
        };
      }
    }
  }

  if (beforeRange && Number.isFinite(beforeStart) && beforeStart >= 0) {
    const beforeEnd = beforeStart + beforeText.length;
    const gapEnd =
      Number.isFinite(afterStart) && afterStart >= beforeEnd ? afterStart : liveText.length;
    const gapText = liveText.slice(beforeEnd, gapEnd);
    let closingQuoteRun = "";
    let quoteCursor = 0;
    while (quoteCursor < gapText.length && isClosingQuoteChar(gapText[quoteCursor], beforeEnd + quoteCursor, liveText)) {
      closingQuoteRun += gapText[quoteCursor];
      quoteCursor++;
    }

    const shouldPreferQuoteBoundary =
      isQuoteIntentInferenceEnabled() &&
      Boolean(closingQuoteRun) &&
      resolveGapIntent(beforeEnd, gapEnd, gapText) !== "before_closing_quote" &&
      (quotePolicy === "after_closing_quote" ||
        (preferredSide !== "before_after_token" &&
          preferredLiveHint >= beforeEnd + closingQuoteRun.length));

    if (shouldPreferQuoteBoundary) {
      const quoteBoundaryAnchor = beforeEnd + Math.max(0, closingQuoteRun.length - 1);
      const quoteBoundaryResolution = await resolveQuoteBoundaryRangeByIntent(
        "after_closing_quote",
        quoteBoundaryAnchor,
        "auto-closing-quote-boundary",
        { blockPosOverride: explicitGapPos ?? quoteBoundaryAnchor }
      );
      if (quoteBoundaryResolution?.range) {
        return quoteBoundaryResolution;
      }
      if (quoteBoundaryResolution?.reason === "insert_live_quote_boundary_already_has_comma") {
        return quoteBoundaryResolution;
      }
    }
    if (requiresAfterQuoteBoundary) {
      return {
        range: null,
        insertLocation: null,
        reason: "insert_explicit_after_quote_boundary_unresolved",
      };
    }

    return {
      range: await resolveBeforeRangeForInsert("insert-before-anchor-fallback"),
      insertLocation: Word.InsertLocation.after,
      reason: null,
    };
  }

  if (afterRange) {
    if (Number.isFinite(afterStart) && afterStart > 0) {
      let gapStart = afterStart;
      while (gapStart > 0 && /\s/u.test(liveText[gapStart - 1])) {
        gapStart--;
      }
      if (gapStart < afterStart) {
        return { range: null, insertLocation: null, reason: "insert_after_anchor_requires_before_pair" };
      }
    }
    return {
      range: afterRange,
      insertLocation: Word.InsertLocation.before,
      reason: null,
    };
  }

  return { range: null, insertLocation: null, reason: "insert_anchor_lookup_failed" };
}

async function resolveStrictDeleteRangeForSuggestion(
  context,
  paragraph,
  suggestion,
  reason = "strict-delete"
) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) {
    return { range: null, insertLocation: null, reason: "delete_missing_anchor_meta" };
  }
  if (typeof paragraph.text !== "string") {
    paragraph.load("text");
    await context.sync();
  }
  const liveText = paragraph.text || "";
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
  const sourceText = typeof entry?.originalText === "string" ? entry.originalText : liveText;
  const resolved = resolveDeleteOperationFromSnapshot(liveText, sourceText, suggestion);
  if (!resolved?.op) {
    return {
      range: null,
      insertLocation: null,
      reason: resolved?.skipReason || "delete_strict_resolution_failed",
    };
  }

  const commaIndex = resolved.op.start;
  const deleteRegion = await findReplaceableRegionRangeNearIndex(
    context,
    paragraph,
    liveText,
    commaIndex,
    commaIndex + 1,
    `${reason}-region`
  );
  if (deleteRegion) {
    return {
      range: deleteRegion.range,
      insertLocation: Word.InsertLocation.replace,
      replacement: `${deleteRegion.prefix}${deleteRegion.suffix}`,
      reason: null,
    };
  }

  const exactCommaRange = await findExactSnippetRangeNearIndex(
    context,
    paragraph,
    liveText,
    ",",
    commaIndex,
    `${reason}-comma`
  );
  if (exactCommaRange) {
    return {
      range: exactCommaRange,
      insertLocation: Word.InsertLocation.replace,
      replacement: "",
      reason: null,
    };
  }

  const commaRange = await getRangeForAnchorSpan(
    context,
    paragraph,
    { originalText: liveText },
    commaIndex,
    commaIndex + 1,
    `${reason}-span`,
    ","
  );
  if (commaRange) {
    return {
      range: commaRange,
      insertLocation: Word.InsertLocation.replace,
      replacement: "",
      reason: null,
    };
  }

  return {
    range: null,
    insertLocation: null,
    reason: "delete_live_range_lookup_failed",
  };
}

function selectInsertAnchor(meta) {
  if (!meta) return null;
  const candidates = [
    meta.sourceTokenAfter
      ? { anchor: meta.sourceTokenAfter, location: Word.InsertLocation.before }
      : null,
    meta.sourceTokenAt ? { anchor: meta.sourceTokenAt, location: Word.InsertLocation.after } : null,
    meta.sourceTokenBefore
      ? { anchor: meta.sourceTokenBefore, location: Word.InsertLocation.after }
      : null,
    meta.targetTokenBefore
      ? { anchor: meta.targetTokenBefore, location: Word.InsertLocation.before }
      : null,
    meta.targetTokenAt ? { anchor: meta.targetTokenAt, location: Word.InsertLocation.after } : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (
      candidate?.anchor?.matched &&
      Number.isFinite(candidate.anchor.charStart) &&
      candidate.anchor.charStart >= 0
    ) {
      return candidate;
    }
  }
  return null;
}

async function tryApplyInsertUsingMetadata(context, paragraph, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) {
    traceQuoteSuggestion("apply.insert.skip", suggestion, { reason: "missing_anchor_meta" });
    return false;
  }
  traceQuoteSuggestion("apply.insert.start", suggestion, {
    lowReliability: Boolean(suggestion?.meta?.lowAnchorReliability),
  });
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const lowReliability = Boolean(suggestion?.meta?.lowAnchorReliability);
  const gapCharRegex = /[\s\u200B-\u200D\uFEFF]/u;
  const insertCommaAtBoundary = async (text, rawPos, traceLabel, fallbackSnippet, options = {}) => {
    if (typeof text !== "string") return false;
    if (!Number.isFinite(rawPos) || rawPos < 0 || rawPos > text.length) {
      traceQuoteSuggestion("apply.insert.boundary.skip", suggestion, {
        traceLabel,
        reason: "invalid_raw_pos",
        rawPos,
      });
      return false;
    }
    let insertionPos = Math.max(0, Math.min(text.length, Math.floor(rawPos)));
    if (options.rewindWhitespaceRun !== false) {
      while (insertionPos > 0 && gapCharRegex.test(text[insertionPos - 1])) {
        insertionPos--;
      }
    }
    const prevChar = insertionPos > 0 ? text[insertionPos - 1] : "";
    const nextChar = insertionPos < text.length ? text[insertionPos] : "";
    traceQuoteSuggestion("apply.insert.boundary.try", suggestion, {
      traceLabel,
      rawPos,
      insertionPos,
      prevChar,
      nextChar,
    });
    if (
      insertionPos > 0 &&
      insertionPos < text.length &&
      WORD_CHAR_REGEX.test(prevChar) &&
      WORD_CHAR_REGEX.test(nextChar)
    ) {
      warn(`${traceLabel}: refusing in-word comma insertion`, { insertionPos, prevChar, nextChar });
      traceQuoteSuggestion("apply.insert.boundary.skip", suggestion, {
        traceLabel,
        reason: "in_word_boundary",
        insertionPos,
        prevChar,
        nextChar,
      });
      return false;
    }

    if (insertionPos > 0 && insertionPos <= text.length && gapCharRegex.test(prevChar)) {
      let gapStart = insertionPos - 1;
      while (gapStart > 0 && gapCharRegex.test(text[gapStart - 1])) {
        gapStart--;
      }
      const gapText = text.slice(gapStart, insertionPos);
      if (gapText) {
        const gapRange = await getRangeForAnchorSpan(
          context,
          paragraph,
          entry,
          gapStart,
          insertionPos,
          `${traceLabel}-replace-preceding-ws`,
          gapText
        );
        if (gapRange) {
          gapRange.insertText(", ", Word.InsertLocation.replace);
          traceQuoteSuggestion("apply.insert.boundary.success", suggestion, {
            traceLabel,
            mode: "replace_whitespace_gap",
            insertionPos,
          });
          return true;
        }
      }
    }

    let targetRange = null;
    if (insertionPos < text.length) {
      targetRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        insertionPos,
        Math.min(insertionPos + 1, text.length),
        `${traceLabel}-insert`,
        fallbackSnippet
      );
      if (!targetRange) return false;
      targetRange.insertText(",", Word.InsertLocation.before);
      traceQuoteSuggestion("apply.insert.boundary.success", suggestion, {
        traceLabel,
        mode: "before_target",
        insertionPos,
      });
      return true;
    }

    if (!text.length) return false;
    targetRange = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      Math.max(0, text.length - 1),
      text.length,
      `${traceLabel}-append`,
      fallbackSnippet || text.slice(Math.max(0, text.length - 1))
    );
    if (!targetRange) return false;
    targetRange.insertText(",", Word.InsertLocation.after);
    traceQuoteSuggestion("apply.insert.boundary.success", suggestion, {
      traceLabel,
      mode: "append_after_last_char",
      insertionPos,
    });
    return true;
  };
  const insertCommaAtChar = async (charIndex, traceLabel) => {
    paragraph.load("text");
    await context.sync();
    const text = paragraph.text || "";
    if (!Number.isFinite(charIndex) || charIndex < 0 || charIndex > text.length) {
      return false;
    }
    return insertCommaAtBoundary(text, charIndex, traceLabel, meta.highlightText);
  };

  const findTokenStartByHint = (text, rawToken, hintIndex, occurrence) => {
    const tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
    if (!tokenRaw || !text) return -1;
    const token = tokenRaw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
    // Only use token-based placement for clean whole words; otherwise fallback to char mapping.
    if (!token || /[^\p{L}\d]/u.test(token)) return -1;
    const safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
    const safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
    const tokenRegex = new RegExp(
      `(^|[^\\p{L}\\d])(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=$|[^\\p{L}\\d])`,
      "gu"
    );
    const positions = [];
    let match;
    while ((match = tokenRegex.exec(text)) !== null) {
      positions.push(match.index + match[1].length);
    }
    if (!positions.length) return -1;
    if (safeHint !== null) {
      let best = positions[0];
      let bestDist = Math.abs(positions[0] - safeHint);
      for (let i = 1; i < positions.length; i++) {
        const dist = Math.abs(positions[i] - safeHint);
        if (dist < bestDist) {
          bestDist = dist;
          best = positions[i];
        }
      }
      return best;
    }
    return positions[Math.min(safeOccurrence, positions.length - 1)];
  };

  const cleanWordToken = (rawToken) => {
    const tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
    const token = tokenRaw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
    if (!token || /[^\p{L}\d]/u.test(token)) return null;
    return token;
  };

  const replaceGapBetweenAnchors = async (beforeAnchor, afterAnchor, traceLabel) => {
    if (!beforeAnchor || !afterAnchor) return false;
    paragraph.load("text");
    await context.sync();
    const liveText = paragraph.text || "";
    const originalText = entry?.originalText ?? "";
    const beforeToken = cleanWordToken(beforeAnchor.tokenText);
    const afterToken = cleanWordToken(afterAnchor.tokenText);
    if (!beforeToken || !afterToken) return false;

    const beforeHint = Number.isFinite(beforeAnchor.charEnd)
      ? mapIndexAcrossCanonical(originalText, liveText, beforeAnchor.charEnd)
      : null;
    const afterHint = Number.isFinite(afterAnchor.charStart)
      ? mapIndexAcrossCanonical(originalText, liveText, afterAnchor.charStart)
      : null;

    const beforeStart = findTokenStartByHint(liveText, beforeToken, beforeHint, beforeAnchor.textOccurrence);
    const afterStart = findTokenStartByHint(liveText, afterToken, afterHint, afterAnchor.textOccurrence);
    if (beforeStart < 0 || afterStart < 0) return false;

    const beforeEnd = beforeStart + beforeToken.length;
    if (beforeEnd > afterStart) return false;

    const gapText = liveText.slice(beforeEnd, afterStart);
    if (gapText.includes(",")) return true;
    if (/[^\s]/.test(gapText)) return false;

    if (beforeEnd === afterStart) {
      return insertCommaAtBoundary(liveText, afterStart, `${traceLabel}-insert-at-gap`, afterToken, {
        rewindWhitespaceRun: false,
      });
    }
    return insertCommaAtBoundary(liveText, beforeEnd, `${traceLabel}-insert-gap-start`, gapText || afterToken, {
      rewindWhitespaceRun: false,
    });
  };

  const insertCommaAfterToken = async (tokenAnchor, traceLabel) => {
    if (!tokenAnchor) return false;
    paragraph.load("text");
    await context.sync();
    const liveText = paragraph.text || "";
    const tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
    const tokenText = tokenTextRaw.trim() || tokenTextRaw;
    const tokenOrdinal =
      typeof tokenAnchor.textOccurrence === "number"
        ? tokenAnchor.textOccurrence
        : typeof tokenAnchor.tokenIndex === "number"
          ? tokenAnchor.tokenIndex
          : 0;
    const originalText = entry?.originalText ?? "";
    const anchorEnd = Number.isFinite(tokenAnchor.charEnd)
      ? tokenAnchor.charEnd
      : typeof tokenAnchor.tokenText === "string"
        ? tokenAnchor.charStart + tokenAnchor.tokenText.length
        : tokenAnchor.charStart;
    const hintIndex = mapIndexAcrossCanonical(originalText, liveText, anchorEnd);
    if (tokenText) {
      const tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
      if (tokenStart > 0 && gapCharRegex.test(liveText[tokenStart - 1])) {
        let wsStart = tokenStart - 1;
        while (wsStart > 0 && gapCharRegex.test(liveText[wsStart - 1])) {
          wsStart--;
        }
        return insertCommaAtBoundary(
          liveText,
          wsStart,
          `${traceLabel}-normalize-before-token`,
          liveText.slice(wsStart, tokenStart),
          { rewindWhitespaceRun: false }
        );
      }
    }
    const liveIndex = hintIndex;
    if (Number.isFinite(liveIndex) && liveIndex >= 0) {
      const insertedViaChar = await insertCommaAtChar(liveIndex, `${traceLabel}-mapped-char`);
      if (insertedViaChar) return true;
    }
    const nextChar = liveText[liveIndex] ?? "";
    if (nextChar && gapCharRegex.test(nextChar)) {
      let wsEnd = liveIndex;
      while (wsEnd < liveText.length && gapCharRegex.test(liveText[wsEnd])) {
        wsEnd++;
      }
      return insertCommaAtBoundary(
        liveText,
        liveIndex,
        `${traceLabel}-replace-ws`,
        liveText.slice(liveIndex, wsEnd),
        { rewindWhitespaceRun: false }
      );
    }
    return false;
  };

  const insertCommaBeforeToken = async (tokenAnchor, traceLabel) => {
    if (!tokenAnchor) return false;
    paragraph.load("text");
    await context.sync();
    const liveText = paragraph.text || "";
    const tokenTextRaw = typeof tokenAnchor.tokenText === "string" ? tokenAnchor.tokenText : "";
    const tokenText = tokenTextRaw.trim() || tokenTextRaw;
    const tokenOrdinal =
      typeof tokenAnchor.textOccurrence === "number"
        ? tokenAnchor.textOccurrence
        : typeof tokenAnchor.tokenIndex === "number"
          ? tokenAnchor.tokenIndex
          : 0;
    const originalText = entry?.originalText ?? "";
    const anchorStart = Number.isFinite(tokenAnchor.charStart) ? tokenAnchor.charStart : -1;
    const hintIndex =
      anchorStart >= 0 ? mapIndexAcrossCanonical(originalText, liveText, anchorStart) : null;
    if (tokenText) {
      const tokenStart = findTokenStartByHint(liveText, tokenText, hintIndex, tokenOrdinal);
      if (tokenStart > 0) {
        let wsStart = tokenStart;
        while (wsStart > 0 && gapCharRegex.test(liveText[wsStart - 1])) {
          wsStart--;
        }
        if (wsStart < tokenStart) {
          return insertCommaAtBoundary(
            liveText,
            wsStart,
            `${traceLabel}-normalize-before-token`,
            liveText.slice(wsStart, tokenStart),
            { rewindWhitespaceRun: false }
          );
        }
      }
    }
    if (anchorStart >= 0) {
      const liveIndex = hintIndex;
      const insertedViaChar = await insertCommaAtChar(liveIndex, `${traceLabel}-mapped-char`);
      if (insertedViaChar) return true;
    }
    return false;
  };

  const tryInsertUsingOpCharHint = async (traceLabel) => {
    const op = suggestion?.meta?.op;
    const hintedPositions = [
      op?.originalPos,
      meta?.charStart,
      suggestion?.charHint?.start,
      meta?.targetCharStart,
    ];
    const sourcePos = hintedPositions.find((pos) => Number.isFinite(pos) && pos >= 0);
    if (!Number.isFinite(sourcePos) || sourcePos < 0) return false;

    paragraph.load("text");
    await context.sync();
    const liveText = paragraph.text || "";
    const sourceText = entry?.originalText ?? liveText;
    const mappedPos = mapIndexAcrossCanonical(sourceText, liveText, sourcePos);
    if (!Number.isFinite(mappedPos) || mappedPos < 0) return false;
    return await insertCommaAtChar(mappedPos, traceLabel);
  };

  if (lowReliability) {
    if (await tryInsertUsingOpCharHint("apply-insert-op-char-low-reliability")) {
      traceQuoteSuggestion("apply.insert.success", suggestion, {
        path: "low_reliability_char_hint",
      });
      return true;
    }
  }

  const anchor =
    meta.highlightAnchorTarget ??
    meta.sourceTokenAt ??
    meta.targetTokenAt ??
    meta.sourceTokenBefore ??
    meta.targetTokenBefore;

  const anchorStart = anchor?.charStart;
  const anchorEnd =
    Number.isFinite(anchor?.charEnd) && anchor.charEnd > anchor.charStart
      ? anchor.charEnd
      : typeof anchor?.tokenText === "string" && anchor.tokenText.length > 0
        ? anchor.charStart + anchor.tokenText.length
        : undefined;

  if (Number.isFinite(anchorStart) && anchorStart >= 0) {
    const range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      anchorStart,
      anchorEnd,
      "apply-insert-lemma-anchor",
      anchor?.tokenText || meta.highlightText
    );
    if (range) {
      try {
        const afterAnchor = meta.sourceTokenAfter ?? meta.targetTokenAfter;
        const beforeAnchor = meta.sourceTokenBefore ?? meta.targetTokenBefore;
        if (await replaceGapBetweenAnchors(beforeAnchor, afterAnchor, "apply-insert-token-gap")) {
          traceQuoteSuggestion("apply.insert.success", suggestion, {
            path: "replace_gap_between_anchors",
          });
          return true;
        }
        if (await insertCommaBeforeToken(afterAnchor, "apply-insert-lemma-after-token")) {
          traceQuoteSuggestion("apply.insert.success", suggestion, {
            path: "insert_before_after_token",
          });
          return true;
        }
        if (await insertCommaAfterToken(beforeAnchor ?? anchor, "apply-insert-lemma-anchor")) {
          traceQuoteSuggestion("apply.insert.success", suggestion, {
            path: "insert_after_before_token",
          });
          return true;
        }
        const hasTokenAnchors = Boolean(beforeAnchor || afterAnchor || meta.sourceTokenAt || meta.targetTokenAt);
        if (!hasTokenAnchors && Number.isFinite(anchorEnd) && anchorEnd >= 0) {
          if (await insertCommaAtChar(anchorEnd, "apply-insert-lemma-anchor")) {
            traceQuoteSuggestion("apply.insert.success", suggestion, {
              path: "insert_at_anchor_end_char",
            });
            return true;
          }
        }
      } catch (err) {
        warn("apply insert metadata: failed to insert via lemma anchor", err);
      }
    }
  }

  const insertionCharStart =
    suggestion?.charHint?.start ?? (Number.isFinite(meta.targetCharStart) ? meta.targetCharStart : -1);
  const hasTokenAnchors = Boolean(
    meta.sourceTokenBefore || meta.sourceTokenAfter || meta.targetTokenBefore || meta.targetTokenAfter
  );
  if (hasTokenAnchors) {
    // Avoid unsafe char fallback when token anchors exist but did not resolve cleanly.
    traceQuoteSuggestion("apply.insert.skip", suggestion, {
      reason: "token_anchors_present_char_fallback_blocked",
    });
    return false;
  }
  if (!Number.isFinite(insertionCharStart) || insertionCharStart < 0) {
    traceQuoteSuggestion("apply.insert.skip", suggestion, {
      reason: "missing_insertion_char_start",
      insertionCharStart,
    });
    return false;
  }
  try {
    const inserted = await insertCommaAtChar(insertionCharStart, "apply-insert-target-char");
    if (inserted) {
      traceQuoteSuggestion("apply.insert.success", suggestion, {
        path: "target_char_fallback",
      });
    } else {
      traceQuoteSuggestion("apply.insert.skip", suggestion, {
        reason: "target_char_fallback_failed",
      });
    }
    return inserted;
  } catch (err) {
    warn("apply insert metadata: failed to insert via target char", err);
    traceQuoteSuggestion("apply.insert.error", suggestion, {
      reason: "target_char_exception",
      message: err?.message || null,
    });
    return false;
  }
}

async function applyInsertSuggestion(context, paragraph, suggestion) {
  return await tryApplyInsertUsingMetadata(context, paragraph, suggestion);
}

const COMMA_SPACE_BLOCKERS = new Set([")", "]", "}", ".", ",", ";", ":", "!", "?"]);

function shouldInsertSpaceAfterComma(nextChar) {
  if (!nextChar) return false;
  if (/\s/.test(nextChar)) return false;
  if (QUOTES.has(nextChar)) return false;
  if (isDigit(nextChar)) return false;
  if (COMMA_SPACE_BLOCKERS.has(nextChar)) return false;
  return true;
}

function areAllSuggestionsLemmaAuthoritative(suggestions = []) {
  return (
    Array.isArray(suggestions) &&
    suggestions.length > 0 &&
    suggestions.every((suggestion) => Boolean(suggestion?.meta?.lemmaAnchorAuthoritative))
  );
}

function collectOnlineCommaCleanupFixes(text = "") {
  if (typeof text !== "string" || !text.length) return [];
  const fixes = [];
  const addFix = (start, end, replacement, priority) => {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
    fixes.push({
      start,
      end,
      replacement,
      priority: Number.isFinite(priority) ? priority : 0,
    });
  };

  for (const match of text.matchAll(/,(?:\s*,)+/gu)) {
    addFix(match.index, match.index + match[0].length, ",", 4);
  }

  for (const match of text.matchAll(/\s+,/gu)) {
    addFix(match.index, match.index + match[0].length, ",", 3);
  }

  for (let idx = 0; idx < text.length - 1; idx++) {
    if (text[idx] !== ",") continue;
    const nextChar = text[idx + 1] ?? "";
    if (!shouldInsertSpaceAfterComma(nextChar)) continue;
    addFix(idx, idx + 2, `, ${nextChar}`, 2);
  }

  fixes.sort((left, right) => {
    if (left.start !== right.start) return right.start - left.start;
    if (left.priority !== right.priority) return right.priority - left.priority;
    return (right.end - right.start) - (left.end - left.start);
  });

  const accepted = [];
  const overlaps = (first, second) => first.start < second.end && second.start < first.end;
  for (const fix of fixes) {
    if (accepted.some((candidate) => overlaps(candidate, fix))) continue;
    accepted.push(fix);
  }
  return accepted;
}

function collectQuoteBoundaryCommaCleanupFixes(text = "") {
  if (typeof text !== "string" || !text.length) return [];
  const fixes = [];
  for (const match of text.matchAll(
    /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A][\s\u200B-\u200D\uFEFF]+,/gu
  )) {
    const start = match.index + 1;
    const end = match.index + match[0].length;
    if (end > start) {
      fixes.push({
        start,
        end,
        replacement: ",",
        priority: 5,
      });
    }
  }
  return fixes;
}

async function applyOnlineCommaCleanupFix(context, paragraph, liveText, fix, reason = "online-comma-cleanup") {
  if (!fix) return false;
  const region = await findReplaceableRegionRangeNearIndex(
    context,
    paragraph,
    liveText,
    fix.start,
    fix.end,
    reason
  );
  if (!region?.range) return false;
  region.range.insertText(
    `${region.prefix}${fix.replacement}${region.suffix}`,
    Word.InsertLocation.replace
  );
  await context.sync();
  return true;
}

async function normalizeCommaSpacingInParagraph(context, paragraph) {
  paragraph.load("text");
  await context.sync();
  let text = paragraph.text || "";
  if (!text.includes(",")) return;

  if (charSpanRangeResolutionDisabled) {
    for (let pass = 0; pass < 8; pass++) {
      const fixes = collectOnlineCommaCleanupFixes(text);
      if (!fixes.length) return;
      let applied = false;
      for (const fix of fixes) {
        applied = await applyOnlineCommaCleanupFix(
          context,
          paragraph,
          text,
          fix,
          `normalize-online-pass-${pass + 1}`
        );
        if (applied) {
          paragraph.load("text");
          await context.sync();
          text = paragraph.text || "";
          if (!text.includes(",")) return;
          break;
        }
      }
      if (!applied) return;
    }
    return;
  }

  for (let idx = text.length - 1; idx >= 0; idx--) {
    if (text[idx] !== ",") continue;
    if (idx > 0 && /\s/.test(text[idx - 1])) {
      const toTrim = await getRangeForCharacterSpan(
        context,
        paragraph,
        text,
        idx - 1,
        idx,
        "trim-space-before-comma",
        " "
      );
      if (toTrim) {
        toTrim.insertText("", Word.InsertLocation.replace);
      }
    }

    const nextChar = text[idx + 1] ?? "";
    if (shouldInsertSpaceAfterComma(nextChar)) {
      const afterRange = await getRangeForCharacterSpan(
        context,
        paragraph,
        text,
        idx + 1,
        idx + 2,
        "space-after-comma",
        nextChar
      );
      if (afterRange) {
        afterRange.insertText(" ", Word.InsertLocation.before);
      }
    }
  }
}

async function ensureCommaSpaceAfterInParagraph(context, paragraph) {
  paragraph.load("text");
  await context.sync();
  const text = paragraph.text || "";
  if (!text.includes(",")) return;

  const spacingPlan = [];
  for (let idx = text.length - 1; idx >= 0; idx--) {
    if (text[idx] !== ",") continue;
    const nextChar = text[idx + 1] ?? "";
    if (!shouldInsertSpaceAfterComma(nextChar)) continue;
    spacingPlan.push({
      kind: "insert",
      start: idx + 1,
      end: idx + 2,
      replacement: " ",
      snippet: nextChar,
      suggestions: [],
      sortPos: idx + 1,
    });
  }
  if (!spacingPlan.length) return;

  const ranges = await getRangesForPlannedOperations(
    context,
    paragraph,
    text,
    spacingPlan,
    "desktop-space-after-comma-only"
  );
  for (let i = 0; i < spacingPlan.length; i++) {
    const afterRange = ranges[i];
    if (afterRange) {
      afterRange.insertText(" ", Word.InsertLocation.before);
    }
  }
}

async function normalizeQuoteBoundaryCommaSpacingInParagraph(context, paragraph) {
  paragraph.load("text");
  await context.sync();
  let text = paragraph.text || "";
  if (!text.includes(",")) return;

  for (let pass = 0; pass < 4; pass++) {
    const fixes = collectQuoteBoundaryCommaCleanupFixes(text);
    if (!fixes.length) return;
    let applied = false;
    for (const fix of fixes) {
      applied = await applyOnlineCommaCleanupFix(
        context,
        paragraph,
        text,
        fix,
        `normalize-quote-comma-pass-${pass + 1}`
      );
      if (applied) {
        paragraph.load("text");
        await context.sync();
        text = paragraph.text || "";
        if (!text.includes(",")) return;
        break;
      }
    }
    if (!applied) return;
  }
}

async function cleanupCommaSpacingForParagraphs(context, paragraphs, indexes, { force = false } = {}) {
  if (anchorProviderSupportsCharHints && !force) {
    for (const idx of indexes) {
      const paragraph = paragraphs.items[idx];
      if (!paragraph) continue;
      try {
        await normalizeQuoteBoundaryCommaSpacingInParagraph(context, paragraph);
      } catch (err) {
        warn("Failed to normalize quote boundary comma spacing", err);
      }
    }
    return;
  }
  if (!indexes?.size) return;
  for (const idx of indexes) {
    const paragraph = paragraphs.items[idx];
    if (!paragraph) continue;
    try {
      await normalizeCommaSpacingInParagraph(context, paragraph);
    } catch (err) {
      warn("Failed to normalize comma spacing", err);
    }
  }
}

const HIGHLIGHT_SCRUB_DELIMITERS = [
  " ",
  "\t",
  "\r",
  "\n",
  ",",
  ".",
  ";",
  ":",
  "!",
  "?",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "\"",
  "'",
  "\u00AB",
  "\u00BB",
  "\u201C",
  "\u201D",
  "\u2018",
  "\u2019",
  "-",
  "\u2013",
  "\u2014",
];

const HIGHLIGHT_SCRUB_PUNCTUATION = [
  ",",
  ".",
  ";",
  ":",
  "!",
  "?",
  "\"",
  "'",
  "\u00BB",
  "\u00AB",
  "(",
  ")",
];

async function clearResidualVejiceHighlightsInParagraph(context, paragraph, options = {}) {
  const includeLegacyHighlightColors = Boolean(options?.includeLegacyHighlightColors);
  if (!paragraph || typeof paragraph.getRange !== "function") return;
  try {
    const contentRange = paragraph.getRange("Content");
    const textRanges = contentRange.getTextRanges(HIGHLIGHT_SCRUB_DELIMITERS, false);
    const punctuationMatches = HIGHLIGHT_SCRUB_PUNCTUATION.map((mark) => {
      const matches = contentRange.search(mark, {
        matchCase: false,
        matchWholeWord: false,
        ignorePunct: false,
        ignoreSpace: false,
      });
      matches.load("items/font/underline,items/font/highlightColor");
      return matches;
    });
    textRanges.load("items/font/underline,items/font/highlightColor");
    contentRange.font.load("underline,highlightColor");
    await context.sync();

    let changed = false;
    for (const range of textRanges.items || []) {
      if (isVejiceMarkerStyle(range?.font?.underline, null)) {
        range.font.underline = "None";
        try {
          range.font.underlineColor = null;
        } catch (_err) {
          // ignore: underlineColor not supported on some hosts
        }
        changed = true;
      }
      if (includeLegacyHighlightColors && isStrictLegacyVejiceMarkerHighlightColor(range?.font?.highlightColor)) {
        range.font.highlightColor = null;
        changed = true;
      }
    }
    for (const matches of punctuationMatches) {
      for (const range of matches.items || []) {
        if (isVejiceMarkerStyle(range?.font?.underline, null)) {
          range.font.underline = "None";
          try {
            range.font.underlineColor = null;
          } catch (_err) {
            // ignore: underlineColor not supported on some hosts
          }
          changed = true;
        }
        if (
          includeLegacyHighlightColors &&
          isStrictLegacyVejiceMarkerHighlightColor(range?.font?.highlightColor)
        ) {
          range.font.highlightColor = null;
          changed = true;
        }
      }
    }
    if (isVejiceMarkerStyle(contentRange?.font?.underline, null)) {
      contentRange.font.underline = "None";
      try {
        contentRange.font.underlineColor = null;
      } catch (_err) {
        // ignore: underlineColor not supported on some hosts
      }
      changed = true;
    }
    if (
      includeLegacyHighlightColors &&
      isStrictLegacyVejiceMarkerHighlightColor(contentRange?.font?.highlightColor)
    ) {
      contentRange.font.highlightColor = null;
      changed = true;
    }
    if (changed) {
      await context.sync();
    }
  } catch (err) {
    warn("Residual highlight scrub failed", err);
  }
}

async function clearResidualVejiceHighlightsForParagraphs(context, paragraphs, indexes, options = {}) {
  if (!indexes?.size) return;
  const includeLegacyHighlightColors = Boolean(options?.includeLegacyHighlightColors);
  const commitChanges = options?.commitChanges !== false;
  const workItems = [];
  for (const idx of indexes) {
    const paragraph = paragraphs?.items?.[idx];
    if (!paragraph || typeof paragraph.getRange !== "function") continue;
    const contentRange = paragraph.getRange("Content");
    const textRanges = contentRange.getTextRanges(HIGHLIGHT_SCRUB_DELIMITERS, false);
    const punctuationMatches = HIGHLIGHT_SCRUB_PUNCTUATION.map((mark) => {
      const matches = contentRange.search(mark, {
        matchCase: false,
        matchWholeWord: false,
        ignorePunct: false,
        ignoreSpace: false,
      });
      matches.load("items/font/underline,items/font/highlightColor");
      return matches;
    });
    textRanges.load("items/font/underline,items/font/highlightColor");
    contentRange.font.load("underline,highlightColor");
    workItems.push({ contentRange, textRanges, punctuationMatches });
  }
  if (!workItems.length) return;

  try {
    await context.sync();
    let changed = false;
    for (const item of workItems) {
      const contentRange = item.contentRange;
      const textRanges = item.textRanges;
      const punctuationMatches = item.punctuationMatches;

      for (const range of textRanges.items || []) {
        if (isVejiceMarkerStyle(range?.font?.underline, null)) {
          range.font.underline = "None";
          try {
            range.font.underlineColor = null;
          } catch (_err) {
            // ignore: underlineColor not supported on some hosts
          }
          changed = true;
        }
        if (
          includeLegacyHighlightColors &&
          isStrictLegacyVejiceMarkerHighlightColor(range?.font?.highlightColor)
        ) {
          range.font.highlightColor = null;
          changed = true;
        }
      }

      for (const matches of punctuationMatches) {
        for (const range of matches.items || []) {
          if (isVejiceMarkerStyle(range?.font?.underline, null)) {
            range.font.underline = "None";
            try {
              range.font.underlineColor = null;
            } catch (_err) {
              // ignore: underlineColor not supported on some hosts
            }
            changed = true;
          }
          if (
            includeLegacyHighlightColors &&
            isStrictLegacyVejiceMarkerHighlightColor(range?.font?.highlightColor)
          ) {
            range.font.highlightColor = null;
            changed = true;
          }
        }
      }

      if (isVejiceMarkerStyle(contentRange?.font?.underline, null)) {
        contentRange.font.underline = "None";
        try {
          contentRange.font.underlineColor = null;
        } catch (_err) {
          // ignore: underlineColor not supported on some hosts
        }
        changed = true;
      }
      if (
        includeLegacyHighlightColors &&
        isStrictLegacyVejiceMarkerHighlightColor(contentRange?.font?.highlightColor)
      ) {
        contentRange.font.highlightColor = null;
        changed = true;
      }
    }
    if (changed && commitChanges) {
      await context.sync();
    }
    return { changed, requiresCommit: changed && !commitChanges };
  } catch (err) {
    warn("Residual highlight scrub failed", err);
    return { changed: false, requiresCommit: false };
  }
}

async function clearHighlightBySpanSweepForParagraphs(context, paragraphSweepItems = [], options = {}) {
  const items = Array.isArray(paragraphSweepItems)
    ? paragraphSweepItems.filter((item) => item?.paragraph && Array.isArray(item?.spans) && item.spans.length)
    : [];
  const commitChanges = options?.commitChanges !== false;
  if (!items.length) {
    return {
      clearedRangeCount: 0,
      touchedParagraphIndexes: new Set(),
      requiresCommit: false,
    };
  }
  const workItems = [];
  for (const item of items) {
    const paragraph = item.paragraph;
    const contentRange = paragraph.getRange("Content");
    const textRanges = contentRange.getTextRanges(HIGHLIGHT_SCRUB_DELIMITERS, false);
    textRanges.load("items/text,items/font/highlightColor");
    paragraph.load("text");
    workItems.push({
      paragraphIndex: item.paragraphIndex,
      paragraph,
      spans: mergeCharacterSpans(item.spans),
      textRanges,
      restoreHighlightColor: sanitizeRestoredHighlightColor(item?.restoreHighlightColor),
    });
  }
  if (!workItems.length) {
    return {
      clearedRangeCount: 0,
      touchedParagraphIndexes: new Set(),
      requiresCommit: false,
    };
  }

  const touchedParagraphIndexes = new Set();
  let clearedRangeCount = 0;
  let requiresCommit = false;
  try {
    await context.sync();
    let changed = false;
    for (const item of workItems) {
      const paragraphText = item.paragraph?.text || "";
      if (!paragraphText || !item.spans.length) continue;
      let cursor = 0;
      let paragraphChanged = false;
      for (const range of item.textRanges.items || []) {
        const token = typeof range?.text === "string" ? range.text : "";
        if (!token) continue;
        let tokenStart = paragraphText.indexOf(token, cursor);
        if (tokenStart < 0 && cursor > 0) {
          tokenStart = paragraphText.indexOf(token);
        }
        if (tokenStart < 0) continue;
        const tokenEnd = tokenStart + token.length;
        cursor = tokenEnd;
        if (!doesRangeIntersectAnySpan(tokenStart, tokenEnd, item.spans)) continue;
        range.font.highlightColor = item.restoreHighlightColor;
        clearedRangeCount += 1;
        paragraphChanged = true;
        changed = true;
      }
      if (paragraphChanged && Number.isFinite(item.paragraphIndex) && item.paragraphIndex >= 0) {
        touchedParagraphIndexes.add(item.paragraphIndex);
      }
    }
    if (changed && commitChanges) {
      await context.sync();
    }
    if (changed && !commitChanges) {
      requiresCommit = true;
    }
  } catch (err) {
    warn("clearHighlightBySpanSweepForParagraphs failed", err);
  }
  return {
    clearedRangeCount,
    touchedParagraphIndexes,
    requiresCommit,
  };
}

async function clearAllHighlightsForParagraphs(context, paragraphs, indexes) {
  if (!indexes?.size) return;
  try {
    for (const idx of indexes) {
      const paragraph = paragraphs?.items?.[idx];
      if (!paragraph || typeof paragraph.getRange !== "function") continue;
      // Never blanket-clear paragraph highlights here; that would also remove
      // user-authored highlighting instead of only add-in markers.
    }
    await context.sync();
  } catch (err) {
    warn("clearAllHighlightsForParagraphs failed", err);
  }
}

async function clearStaleVejiceMarkerControlsInParagraph(context, paragraph) {
  if (!paragraph || typeof paragraph.getRange !== "function") return 0;
  try {
    const controls = paragraph.getRange("Content").contentControls;
    controls.load("items/tag,title");
    await context.sync();
    const matching = (controls.items || []).filter((control) => {
      const tag = typeof control?.tag === "string" ? control.tag : "";
      const title = typeof control?.title === "string" ? control.title : "";
      return tag.startsWith(VEJICE_MARKER_TAG_PREFIX) || title === VEJICE_MARKER_TITLE;
    });
    if (!matching.length) return 0;
    for (const control of matching) {
      try {
        control.delete(true);
      } catch (deleteErr) {
        warn("Failed to delete stale marker control", deleteErr);
      }
    }
    await context.sync();
    return matching.length;
  } catch (err) {
    warn("clearStaleVejiceMarkerControlsInParagraph failed", err);
    return 0;
  }
}

async function clearStaleVejiceMarkerControlsForParagraphs(context, paragraphs, indexes) {
  if (!indexes?.size) return { removed: 0, failed: false };
  const scopedControls = [];
  try {
    for (const idx of indexes) {
      const paragraph = paragraphs?.items?.[idx];
      if (!paragraph || typeof paragraph.getRange !== "function") continue;
      const controls = paragraph.getRange("Content").contentControls;
      controls.load("items/tag,title");
      scopedControls.push(controls);
    }
    if (!scopedControls.length) return { removed: 0, failed: false };
    await context.sync();

    const toDelete = [];
    for (const controls of scopedControls) {
      for (const control of controls.items || []) {
        const tag = typeof control?.tag === "string" ? control.tag : "";
        const title = typeof control?.title === "string" ? control.title : "";
        if (tag.startsWith(VEJICE_MARKER_TAG_PREFIX) || title === VEJICE_MARKER_TITLE) {
          toDelete.push(control);
        }
      }
    }
    if (!toDelete.length) return { removed: 0, failed: false };
    for (const control of toDelete) {
      try {
        control.delete(true);
      } catch (deleteErr) {
        warn("Failed to delete stale scoped marker control", deleteErr);
      }
    }
    await context.sync();
    return { removed: toDelete.length, failed: false };
  } catch (err) {
    warn("clearStaleVejiceMarkerControlsForParagraphs failed", err);
    return { removed: 0, failed: true };
  }
}

async function clearStaleVejiceMarkerControlsInDocument(context) {
  if (!context?.document?.body?.contentControls) return 0;
  try {
    const controls = context.document.body.contentControls;
    controls.load("items/tag,title");
    await context.sync();
    const matching = (controls.items || []).filter((control) => {
      const tag = typeof control?.tag === "string" ? control.tag : "";
      const title = typeof control?.title === "string" ? control.title : "";
      return tag.startsWith(VEJICE_MARKER_TAG_PREFIX) || title === VEJICE_MARKER_TITLE;
    });
    if (!matching.length) return 0;
    for (const control of matching) {
      try {
        control.delete(true);
      } catch (deleteErr) {
        warn("Failed to delete stale document marker control", deleteErr);
      }
    }
    await context.sync();
    return matching.length;
  } catch (err) {
    warn("clearStaleVejiceMarkerControlsInDocument failed", err);
    return 0;
  }
}

async function clearAddinMarkerFormattingOnRanges(context, ranges) {
  const validRanges = Array.isArray(ranges)
    ? ranges.filter((range) => range && range.font)
    : [];
  if (!validRanges.length) return 0;
  try {
    for (const range of validRanges) {
      range.font.load("underline,highlightColor");
    }
    await context.sync();
    let changed = 0;
    for (const range of validRanges) {
      const isUnderlineMarker = isVejiceMarkerStyle(range?.font?.underline, null);
      if (!isUnderlineMarker) continue;
      if (isUnderlineMarker) {
        range.font.underline = "None";
        try {
          range.font.underlineColor = null;
        } catch (_err) {
          // ignore: underlineColor not supported on some hosts
        }
      }
      changed += 1;
    }
    if (changed > 0) {
      await context.sync();
    }
    return changed;
  } catch (err) {
    warn("clearAddinMarkerFormattingOnRanges failed", err);
    return 0;
  }
}

async function findRangeForInsert(context, paragraph, suggestion) {
  const searchOpts = { matchCase: false, matchWholeWord: false };
  let range = null;
  const corrected = suggestion?.meta?.correctedText ?? paragraph.text ?? "";
  const rawLeft = suggestion?.snippets?.leftSnippet ?? corrected.slice(0, suggestion?.meta?.op?.pos ?? 0);
  const rawRight = suggestion?.snippets?.rightSnippet ?? corrected.slice(suggestion?.meta?.op?.pos ?? 0);
  const lastWord = extractLastWord(rawLeft || "");
  const leftFrag = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");

  if (lastWord) {
    const wordSearch = paragraph.getRange().search(lastWord, {
      matchCase: false,
      matchWholeWord: true,
    });
    wordSearch.load("items");
    await context.sync();
    if (wordSearch.items.length) {
      range = wordSearch.items[wordSearch.items.length - 1];
    }
  }

  if (!range && leftFrag.trim()) {
    const leftSearch = paragraph.getRange().search(leftFrag.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightFrag = (rawRight || "").replace(/,/g, "").trim();
    rightFrag = rightFrag.slice(0, 8);
    if (rightFrag) {
      const rightSearch = paragraph.getRange().search(rightFrag, searchOpts);
      rightSearch.load("items");
      await context.sync();
      if (rightSearch.items.length) {
        range = rightSearch.items[0];
      }
    }
  }

  return range;
}

function applyMarkerRestoreFormatting(range, suggestion) {
  if (!range?.font || !suggestion) return false;
  const restoreMarker = getSuggestionRestoreMarkerFormat(suggestion);
  const restoreWordUnderline = toWordUnderline(restoreMarker?.underline);
  const restoreWordUnderlineColor = normalizeHighlightColorValue(restoreMarker?.underlineColor);
  if (suggestion.markerChannel === "highlight") {
    range.font.highlightColor = sanitizeRestoredHighlightColor(suggestion.previousHighlightColor);
    return true;
  }
  range.font.underline = restoreWordUnderline;
  try {
    range.font.underlineColor = restoreWordUnderlineColor;
  } catch (_err) {
    // ignore: underlineColor not supported on some hosts
  }
  return true;
}

function normalizeSuggestionClearEntry(item, paragraphs) {
  const suggestion = item?.suggestion ?? item;
  if (!suggestion) return null;
  const paragraph = item?.paragraph ?? paragraphs?.items?.[suggestion.paragraphIndex] ?? null;
  return { suggestion, paragraph };
}

async function clearSuggestionMarkersByTag(context, entries, options = {}) {
  const commitChanges = options?.commitChanges !== false;
  const deferMutations = Boolean(options?.deferMutations);
  const normalizedEntries = Array.isArray(entries) ? entries.filter((entry) => entry?.suggestion) : [];
  if (!normalizedEntries.length) {
    return {
      clearedCount: 0,
      unresolvedEntries: [],
      requiresCommit: false,
      pendingTagMutations: [],
    };
  }
  const taggedEntries = [];
  const unresolvedEntries = [];
  for (const entry of normalizedEntries) {
    const markerTag = getSuggestionMarkerTag(entry.suggestion, { create: false });
    if (!markerTag) {
      unresolvedEntries.push({ ...entry, unresolvedReason: "no_marker_tag" });
      continue;
    }
    try {
      const controls = context.document.body.contentControls.getByTag(markerTag);
      controls.load("items");
      taggedEntries.push({ ...entry, controls });
    } catch (err) {
      warn("clearSuggestionMarkersByTag: failed to queue content control load", err);
      unresolvedEntries.push({ ...entry, unresolvedReason: "tag_lookup_queue_failed" });
    }
  }
  if (!taggedEntries.length) {
    return {
      clearedCount: 0,
      unresolvedEntries,
      requiresCommit: false,
      pendingTagMutations: [],
    };
  }
  try {
    await context.sync();
  } catch (syncErr) {
    warn("clearSuggestionMarkersByTag: failed to load tagged controls", syncErr);
    return {
      clearedCount: 0,
      unresolvedEntries: [
        ...unresolvedEntries,
        ...taggedEntries.map((entry) => ({
          suggestion: entry.suggestion,
          paragraph: entry.paragraph,
          unresolvedReason: "tag_lookup_sync_failed",
        })),
      ],
      requiresCommit: false,
      pendingTagMutations: [],
    };
  }

  let clearedCount = 0;
  let requiresCommit = false;
  const pendingTagMutations = [];
  if (deferMutations) {
    for (const entry of taggedEntries) {
      const items = entry.controls?.items || [];
      if (!items.length) {
        unresolvedEntries.push({
          suggestion: entry.suggestion,
          paragraph: entry.paragraph,
          unresolvedReason: "no_controls",
        });
        continue;
      }
      pendingTagMutations.push({
        suggestion: entry.suggestion,
        paragraph: entry.paragraph,
        controls: items,
      });
      clearedCount += 1;
    }
    return {
      clearedCount,
      unresolvedEntries,
      requiresCommit: false,
      pendingTagMutations,
    };
  }
  for (const entry of taggedEntries) {
    const items = entry.controls?.items || [];
    if (!items.length) {
      unresolvedEntries.push({
        suggestion: entry.suggestion,
        paragraph: entry.paragraph,
        unresolvedReason: "no_controls",
      });
      continue;
    }
    let entryCleared = false;
    for (const control of items) {
      try {
        const controlRange = control.getRange("Content");
        applyMarkerRestoreFormatting(controlRange, entry.suggestion);
        control.delete(true);
        requiresCommit = true;
        entryCleared = true;
      } catch (err) {
        warn("clearSuggestionMarkersByTag: failed to clear tagged control", err);
      }
    }
    if (entryCleared) {
      resetSuggestionMarkerState(entry.suggestion);
      clearedCount += 1;
    } else {
      unresolvedEntries.push({
        suggestion: entry.suggestion,
        paragraph: entry.paragraph,
        unresolvedReason: "tag_clear_failed",
      });
    }
  }
  if (requiresCommit && commitChanges) {
    try {
      await context.sync();
    } catch (syncErr) {
      warn("clearSuggestionMarkersByTag: failed to commit marker cleanup", syncErr);
    }
  }
  return {
    clearedCount,
    unresolvedEntries,
    requiresCommit: requiresCommit && !commitChanges,
    pendingTagMutations,
  };
}

async function clearSuggestionMarkersByKnownTags(context, markerTags, options = {}) {
  const restoreStateByTag = options?.restoreStateByTag || null;
  const resolveRestoreState = (tag) => {
    if (!tag || !restoreStateByTag) return null;
    if (restoreStateByTag instanceof Map) {
      return restoreStateByTag.get(tag) || null;
    }
    if (typeof restoreStateByTag === "object") {
      return restoreStateByTag[tag] || null;
    }
    return null;
  };
  const tags = Array.isArray(markerTags)
    ? [...new Set(markerTags.filter((tag) => typeof tag === "string" && tag.trim()))]
    : [];
  if (!tags.length) {
    return { clearedCount: 0, failedCount: 0 };
  }
  const controlsByTag = [];
  for (const tag of tags) {
    try {
      const controls = context.document.body.contentControls.getByTag(tag);
      controls.load("items");
      controlsByTag.push({ tag, controls });
    } catch (err) {
      warn("clearSuggestionMarkersByKnownTags: failed to queue tag lookup", { tag, err });
    }
  }
  if (!controlsByTag.length) {
    return { clearedCount: 0, failedCount: tags.length };
  }
  try {
    await context.sync();
  } catch (syncErr) {
    warn("clearSuggestionMarkersByKnownTags: failed to load tagged controls", syncErr);
    return { clearedCount: 0, failedCount: tags.length };
  }

  let clearedCount = 0;
  let failedCount = 0;
  let changed = false;
  for (const entry of controlsByTag) {
    const items = entry.controls?.items || [];
    if (!items.length) continue;
    const restoreState = resolveRestoreState(entry.tag);
    const restoreUnderline = toWordUnderline(restoreState?.previousUnderline);
    const restoreUnderlineColor = normalizeHighlightColorValue(restoreState?.previousUnderlineColor);
    const restoreChannel = restoreState?.markerChannel;
    const restoreHighlight = sanitizeRestoredHighlightColor(restoreState?.previousHighlightColor);
    for (const control of items) {
      try {
        const controlRange = control.getRange("Content");
        if (restoreChannel === "underline") {
          controlRange.font.underline = restoreUnderline;
          try {
            controlRange.font.underlineColor = restoreUnderlineColor;
          } catch (_err) {
            // ignore: underline can be unavailable in some hosts
          }
        } else if (restoreChannel === "highlight") {
          controlRange.font.highlightColor = restoreHighlight;
        } else {
          controlRange.font.highlightColor = null;
          try {
            controlRange.font.underline = toWordUnderline("None");
          } catch (_err) {
            // ignore: underline can be unavailable in some hosts
          }
        }
        control.delete(true);
        changed = true;
        clearedCount += 1;
      } catch (err) {
        failedCount += 1;
        warn("clearSuggestionMarkersByKnownTags: failed to clear tagged control", {
          tag: entry.tag,
          err,
        });
      }
    }
  }
  if (changed) {
    try {
      await context.sync();
    } catch (syncErr) {
      warn("clearSuggestionMarkersByKnownTags: failed to commit marker cleanup", syncErr);
    }
  }
  return { clearedCount, failedCount };
}

async function clearHighlightForSuggestion(context, paragraph, suggestion, options = {}) {
  if (!suggestion) return false;
  const restoreMarker = getSuggestionRestoreMarkerFormat(suggestion);
  const restoreWordUnderline = toWordUnderline(restoreMarker?.underline);
  const restoreWordUnderlineColor = normalizeHighlightColorValue(restoreMarker?.underlineColor);
  const skipTagLookup = Boolean(options?.skipTagLookup);
  const deleteTaggedControl = options?.deleteTaggedControl !== false;
  const disableTextFallback = Boolean(options?.disableTextFallback);
  if (isWordOnline() && !skipTagLookup) {
    const markerTag = getSuggestionMarkerTag(suggestion, { create: false });
    if (markerTag) {
      try {
        const controls = context.document.body.contentControls.getByTag(markerTag);
        controls.load("items");
        await context.sync();
        if (controls.items.length) {
          for (const control of controls.items) {
            const controlRange = control.getRange("Content");
            if (suggestion.markerChannel === "highlight") {
              controlRange.font.highlightColor = sanitizeRestoredHighlightColor(
                suggestion.previousHighlightColor
              );
            } else {
              controlRange.font.underline = restoreWordUnderline;
              try {
                controlRange.font.underlineColor = restoreWordUnderlineColor;
              } catch (_err) {
                // ignore: underlineColor not supported on some hosts
              }
            }
            if (deleteTaggedControl) {
              control.delete(true);
            }
          }
          await context.sync();
          resetSuggestionMarkerState(suggestion);
          return true;
        }
      } catch (tagErr) {
        if (isWordOnline() && isApiNotFoundLikeError(tagErr)) {
          return false;
        }
        warn("clearHighlightForSuggestion: failed via marker tag", tagErr);
      }
    }
  }
  if (suggestion.highlightRange) {
    let clearedViaTrackedRange = false;
    try {
      if (suggestion.markerChannel === "highlight") {
        suggestion.highlightRange.font.highlightColor = sanitizeRestoredHighlightColor(
          suggestion.previousHighlightColor
        );
      } else {
        suggestion.highlightRange.font.underline = restoreWordUnderline;
        try {
          suggestion.highlightRange.font.underlineColor = restoreWordUnderlineColor;
        } catch (_err) {
          // ignore: underlineColor not supported on some hosts
        }
      }
      context.trackedObjects.remove(suggestion.highlightRange);
      clearedViaTrackedRange = true;
    } catch (err) {
      warn("clearHighlightForSuggestion: failed via highlightRange", err);
    }
    if (clearedViaTrackedRange) {
      resetSuggestionMarkerState(suggestion);
      return true;
    }
  }
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const metaAnchor = suggestion.meta?.anchor;
  if (!metaAnchor) {
    resetSuggestionMarkerState(suggestion);
    return false;
  }
  const charStart =
    suggestion.charHint?.start ??
    (typeof metaAnchor.highlightCharStart === "number"
      ? metaAnchor.highlightCharStart
      : metaAnchor.charStart);
  const charEnd =
    suggestion.charHint?.end ??
    (typeof metaAnchor.highlightCharEnd === "number" ? metaAnchor.highlightCharEnd : metaAnchor.charEnd);
  if (!paragraph) {
    resetSuggestionMarkerState(suggestion);
    return false;
  }

  let range = null;
  if (Number.isFinite(charStart)) {
    range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      charStart,
      charEnd,
      "clear-highlight",
      metaAnchor.highlightText || metaAnchor.highlightAnchorTarget?.tokenText
    );
  }
  // Fallbacks: when highlight was created via snippet/ordinal path, anchor lookup can miss.
  if (!range && !disableTextFallback && suggestion?.kind === "insert") {
    range = await findRangeForInsert(context, paragraph, suggestion);
  }
  if (!range && !disableTextFallback && suggestion?.kind === "delete") {
    const liveText = paragraph.text || suggestion?.meta?.originalText || "";
    range = await findCommaRangeByOrdinal(context, paragraph, liveText, suggestion?.meta?.op || {});
  }
  if (range) {
    if (suggestion.markerChannel === "highlight") {
      range.font.highlightColor = sanitizeRestoredHighlightColor(suggestion.previousHighlightColor);
    } else {
      range.font.underline = restoreWordUnderline;
      try {
        range.font.underlineColor = restoreWordUnderlineColor;
      } catch (_err) {
        // ignore: underlineColor not supported on some hosts
      }
    }
  }
  resetSuggestionMarkerState(suggestion);
  return Boolean(range);
}
async function clearOnlineSuggestionMarkers(context, suggestionsOverride, paragraphs, options = {}) {
  const usingOverride = Array.isArray(suggestionsOverride);
  const softClearOnly = Boolean(options?.softClearOnly);
  const preferSingleFlush = Boolean(options?.preferSingleFlush);
  const source = usingOverride ? suggestionsOverride : pendingSuggestionsOnline;
  const normalizedEntries = [];
  for (const item of source) {
    const normalized = normalizeSuggestionClearEntry(item, paragraphs);
    if (normalized) normalizedEntries.push(normalized);
  }
  const result = {
    requestedCount: normalizedEntries.length,
    clearedByTagCount: 0,
    clearedFallbackCount: 0,
    postTagSanityClearedCount: 0,
    postTagSanitySweepRangeCount: 0,
    failedCount: 0,
    staleControlClears: 0,
  };
  let needsFinalSync = false;

  const clearHighlight = (sug) => {
    if (!sug?.highlightRange) return;
    try {
      applyMarkerRestoreFormatting(sug.highlightRange, sug);
      context.trackedObjects.remove(sug.highlightRange);
      result.clearedFallbackCount += 1;
    } catch (err) {
      warn("Failed to clear highlight", err);
      result.failedCount += 1;
    } finally {
      resetSuggestionMarkerState(sug);
    }
  };

  if (!normalizedEntries.length) {
    if (!usingOverride) {
      resetPendingSuggestionsOnline();
    }
    return result;
  }
  const markerStateBySuggestion = new Map();
  for (const entry of normalizedEntries) {
    const suggestion = entry?.suggestion;
    if (!suggestion) continue;
    markerStateBySuggestion.set(suggestion, {
      markerChannel: suggestion?.markerChannel ?? null,
      previousHighlightColor: normalizeHighlightColorValue(suggestion?.previousHighlightColor),
      previousUnderline: normalizeUnderlineStyleValue(suggestion?.previousUnderline),
      previousUnderlineColor: normalizeHighlightColorValue(suggestion?.previousUnderlineColor),
      highlightRange: suggestion?.highlightRange || null,
    });
  }
  const taggedResult = softClearOnly
    ? { clearedCount: 0, unresolvedEntries: normalizedEntries, requiresCommit: false }
    : await clearSuggestionMarkersByTag(context, normalizedEntries, {
        commitChanges: false,
        deferMutations: preferSingleFlush,
      });
  result.clearedByTagCount = taggedResult.clearedCount;
  if (taggedResult.requiresCommit) {
    needsFinalSync = true;
  }
  const pendingTagMutations = Array.isArray(taggedResult.pendingTagMutations)
    ? taggedResult.pendingTagMutations
    : [];
  if (isQuoteTraceEnabled()) {
    const quoteUnresolved = (taggedResult.unresolvedEntries || []).filter((entry) =>
      suggestionTouchesQuoteBoundary(entry?.suggestion)
    );
    if (quoteUnresolved.length) {
      log("[QUOTE TRACE]", "cleanup.unresolved_after_tag_clear", {
        unresolvedCount: quoteUnresolved.length,
        unresolved: quoteUnresolved.map((entry) => buildQuoteTraceSuggestionSnapshot(entry?.suggestion)),
      });
    }
  }
  const unresolvedSuggestionSet = new Set(
    (taggedResult.unresolvedEntries || []).map((entry) => entry?.suggestion).filter(Boolean)
  );
  if (!softClearOnly && taggedResult.clearedCount > 0) {
    const postTagSanityEntries = normalizedEntries.filter((entry) => {
      const suggestion = entry?.suggestion;
      const markerState = markerStateBySuggestion.get(suggestion);
      if (!suggestion || unresolvedSuggestionSet.has(suggestion)) return false;
      if (!entry?.paragraph) return false;
      if (markerState?.markerChannel !== "highlight") return false;
      if (sanitizeRestoredHighlightColor(markerState?.previousHighlightColor) !== null) return false;
      return true;
    });
    if (isQuoteTraceEnabled() && postTagSanityEntries.length) {
      log("[QUOTE TRACE]", "cleanup.post_tag_sanity_candidates", {
        candidateCount: postTagSanityEntries.length,
        candidates: postTagSanityEntries.map((entry) =>
          buildQuoteTraceSuggestionSnapshot(entry?.suggestion)
        ),
      });
    }
    const spanSweepByParagraph = new Map();
    const postTagSanityFallbackEntries = [];
    for (const entry of postTagSanityEntries) {
      const suggestion = entry.suggestion;
      const paragraphIndex = suggestion?.paragraphIndex;
      const visualBounds = resolveSuggestionVisualBounds(suggestion);
      if (
        !Number.isFinite(paragraphIndex) ||
        paragraphIndex < 0 ||
        !Number.isFinite(visualBounds?.start) ||
        !Number.isFinite(visualBounds?.end) ||
        visualBounds.end <= visualBounds.start
      ) {
        postTagSanityFallbackEntries.push(entry);
        continue;
      }
      if (!spanSweepByParagraph.has(paragraphIndex)) {
        spanSweepByParagraph.set(paragraphIndex, {
          paragraphIndex,
          paragraph: entry.paragraph,
          spans: [],
          entries: [],
        });
      }
      const group = spanSweepByParagraph.get(paragraphIndex);
      group.spans.push({
        start: Math.max(0, visualBounds.start - 1),
        end: Math.max(visualBounds.end + 1, visualBounds.start + 1),
      });
      group.entries.push(entry);
    }
    if (spanSweepByParagraph.size > 0) {
      const sweepItems = [...spanSweepByParagraph.values()];
      const sweepResult = await clearHighlightBySpanSweepForParagraphs(context, sweepItems, {
        commitChanges: false,
      });
      if (sweepResult.clearedRangeCount > 0 || sweepResult.requiresCommit) {
        needsFinalSync = true;
        result.postTagSanitySweepRangeCount += sweepResult.clearedRangeCount;
      }
      for (const sweepItem of sweepItems) {
        const paragraphTouched = sweepResult.touchedParagraphIndexes.has(sweepItem.paragraphIndex);
        if (!paragraphTouched) {
          postTagSanityFallbackEntries.push(...(sweepItem.entries || []));
          continue;
        }
        for (const resolvedEntry of sweepItem.entries || []) {
          const resolvedSuggestion = resolvedEntry?.suggestion;
          if (!resolvedSuggestion) continue;
          result.postTagSanityClearedCount += 1;
          traceQuoteSuggestion("cleanup.post_tag_sanity_result", resolvedSuggestion, {
            cleared: true,
            via: "span_sweep",
          });
          resetSuggestionMarkerState(resolvedSuggestion);
        }
      }
    }
    for (const entry of postTagSanityFallbackEntries) {
      const suggestion = entry.suggestion;
      const paragraph = entry.paragraph;
      const markerState = markerStateBySuggestion.get(suggestion);
      const trackedRange = markerState?.highlightRange || null;
      if (trackedRange && typeof trackedRange === "object") {
        let clearedViaTrackedRange = false;
        try {
          applyMarkerRestoreFormatting(trackedRange, {
            markerChannel: markerState.markerChannel,
            previousHighlightColor: markerState.previousHighlightColor,
            previousUnderline: markerState.previousUnderline,
            previousUnderlineColor: markerState.previousUnderlineColor,
          });
          context.trackedObjects.remove(trackedRange);
          clearedViaTrackedRange = true;
        } catch (trackedErr) {
          warn("cleanup.post_tag_sanity tracked range clear failed", trackedErr);
        }
        if (clearedViaTrackedRange) {
          result.postTagSanityClearedCount += 1;
          needsFinalSync = true;
          resetSuggestionMarkerState(suggestion);
          traceQuoteSuggestion("cleanup.post_tag_sanity_result", suggestion, {
            cleared: true,
            via: "tracked_range",
          });
          continue;
        }
      }
      if (markerState) {
        suggestion.markerChannel = markerState.markerChannel;
        suggestion.previousHighlightColor = markerState.previousHighlightColor;
        suggestion.previousUnderline = markerState.previousUnderline;
        suggestion.previousUnderlineColor = markerState.previousUnderlineColor;
      }
      const cleared = await clearHighlightForSuggestion(context, paragraph, suggestion, {
        skipTagLookup: true,
        deleteTaggedControl: false,
        disableTextFallback: true,
      });
      if (cleared) {
        result.postTagSanityClearedCount += 1;
        needsFinalSync = true;
      }
      traceQuoteSuggestion("cleanup.post_tag_sanity_result", suggestion, {
        cleared,
        via: cleared ? "anchor_span" : "anchor_span_miss",
      });
    }
  }
  const unresolvedSweepByParagraph = new Map();
  const unresolvedFallbackEntries = [];
  for (const entry of taggedResult.unresolvedEntries || []) {
    const suggestion = entry?.suggestion;
    const markerState = markerStateBySuggestion.get(suggestion);
    const paragraphIndex = suggestion?.paragraphIndex;
    const visualBounds = resolveSuggestionVisualBounds(suggestion);
    if (
      entry?.unresolvedReason === "no_controls" &&
      markerState?.markerChannel === "highlight" &&
      Number.isFinite(paragraphIndex) &&
      paragraphIndex >= 0 &&
      Number.isFinite(visualBounds?.start) &&
      Number.isFinite(visualBounds?.end) &&
      visualBounds.end > visualBounds.start
    ) {
      const restoreHighlightColor = sanitizeRestoredHighlightColor(markerState?.previousHighlightColor);
      const restoreColorKey = normalizeHighlightColorToken(restoreHighlightColor) || "__clear__";
      const paragraphSweepKey = `${paragraphIndex}:${restoreColorKey}`;
      if (!unresolvedSweepByParagraph.has(paragraphSweepKey)) {
        unresolvedSweepByParagraph.set(paragraphSweepKey, {
          paragraphIndex,
          paragraph: entry.paragraph,
          spans: [],
          entries: [],
          restoreHighlightColor,
        });
      }
      const group = unresolvedSweepByParagraph.get(paragraphSweepKey);
      group.spans.push({
        start: Math.max(0, visualBounds.start - 1),
        end: Math.max(visualBounds.end + 1, visualBounds.start + 1),
      });
      group.entries.push(entry);
      continue;
    }
    unresolvedFallbackEntries.push(entry);
  }
  if (unresolvedSweepByParagraph.size > 0) {
    const unresolvedSweepItems = [...unresolvedSweepByParagraph.values()];
    const unresolvedSweepResult = await clearHighlightBySpanSweepForParagraphs(context, unresolvedSweepItems, {
      commitChanges: false,
    });
    if (unresolvedSweepResult.clearedRangeCount > 0 || unresolvedSweepResult.requiresCommit) {
      needsFinalSync = true;
    }
    for (const sweepItem of unresolvedSweepItems) {
      const paragraphTouched = unresolvedSweepResult.touchedParagraphIndexes.has(sweepItem.paragraphIndex);
      if (!paragraphTouched) {
        unresolvedFallbackEntries.push(...(sweepItem.entries || []));
        continue;
      }
      for (const resolvedEntry of sweepItem.entries || []) {
        const resolvedSuggestion = resolvedEntry?.suggestion;
        if (!resolvedSuggestion) continue;
        result.clearedFallbackCount += 1;
        resetSuggestionMarkerState(resolvedSuggestion);
        traceQuoteSuggestion("cleanup.clear_result", resolvedSuggestion, {
          cleared: true,
          hadParagraph: true,
          via: "span_sweep",
        });
      }
    }
  }
  for (const entry of unresolvedFallbackEntries) {
    const suggestion = entry.suggestion;
    const paragraph = entry.paragraph;
    if (preferSingleFlush) {
      const markerState = markerStateBySuggestion.get(suggestion);
      const trackedRange = markerState?.highlightRange || null;
      const restoreHighlightColor = sanitizeRestoredHighlightColor(markerState?.previousHighlightColor);
      if (trackedRange && typeof trackedRange === "object") {
        let clearedViaTrackedRange = false;
        try {
          applyMarkerRestoreFormatting(trackedRange, {
            markerChannel: markerState.markerChannel,
            previousHighlightColor: markerState.previousHighlightColor,
            previousUnderline: markerState.previousUnderline,
            previousUnderlineColor: markerState.previousUnderlineColor,
          });
          context.trackedObjects.remove(trackedRange);
          clearedViaTrackedRange = true;
        } catch (trackedErr) {
          warn("cleanup.clear_result tracked range clear failed", trackedErr);
        }
        if (clearedViaTrackedRange) {
          result.clearedFallbackCount += 1;
          needsFinalSync = true;
          resetSuggestionMarkerState(suggestion);
          traceQuoteSuggestion("cleanup.clear_result", suggestion, {
            cleared: true,
            hadParagraph: Boolean(paragraph),
            via: "tracked_range_only",
          });
          continue;
        }
      }
      if (paragraph && restoreHighlightColor !== null) {
        suggestion.markerChannel = markerState?.markerChannel ?? "highlight";
        suggestion.previousHighlightColor = markerState?.previousHighlightColor ?? null;
        suggestion.previousUnderline = markerState?.previousUnderline ?? null;
        suggestion.previousUnderlineColor = markerState?.previousUnderlineColor ?? null;
        const clearedViaAnchor = await clearHighlightForSuggestion(context, paragraph, suggestion, {
          skipTagLookup: true,
          deleteTaggedControl: false,
          disableTextFallback: true,
        });
        if (clearedViaAnchor) {
          result.clearedFallbackCount += 1;
          needsFinalSync = true;
          traceQuoteSuggestion("cleanup.clear_result", suggestion, {
            cleared: true,
            hadParagraph: true,
            via: "single_flush_anchor_restore",
          });
          continue;
        }
      }
      resetSuggestionMarkerState(suggestion);
      result.failedCount += 1;
      traceQuoteSuggestion("cleanup.clear_result", suggestion, {
        cleared: false,
        hadParagraph: Boolean(paragraph),
        reason: "single_flush_skip_anchor",
      });
      continue;
    }
    if (paragraph) {
      const clearedBeforeTrackedFallback = result.clearedFallbackCount;
      const canSkipTagLookup = entry?.unresolvedReason === "no_controls";
      const cleared = await clearHighlightForSuggestion(context, paragraph, suggestion, {
        skipTagLookup: canSkipTagLookup,
        deleteTaggedControl: !softClearOnly,
      });
      traceQuoteSuggestion("cleanup.clear_result", suggestion, {
        cleared,
        hadParagraph: true,
      });
      if (cleared) {
        result.clearedFallbackCount += 1;
        needsFinalSync = true;
      }
      // After text edits, metadata-based range lookup can fail due shifted offsets.
      // Always clear tracked highlight objects as a fallback so stale highlights don't remain.
      clearHighlight(suggestion);
      if (!cleared && result.clearedFallbackCount === clearedBeforeTrackedFallback) {
        result.failedCount += 1;
      }
      continue;
    }
    if (suggestion?.highlightRange) {
      clearHighlight(suggestion);
      needsFinalSync = true;
      traceQuoteSuggestion("cleanup.clear_result", suggestion, {
        cleared: true,
        hadParagraph: false,
        via: "tracked_highlight_range",
      });
      continue;
    }
    resetSuggestionMarkerState(suggestion);
    result.failedCount += 1;
    traceQuoteSuggestion("cleanup.clear_result", suggestion, {
      cleared: false,
      hadParagraph: false,
      reason: "no_paragraph_no_tracked_range",
    });
  }
  if (pendingTagMutations.length) {
    for (const mutation of pendingTagMutations) {
      const suggestion = mutation?.suggestion;
      const markerState = markerStateBySuggestion.get(suggestion);
      const controls = Array.isArray(mutation?.controls) ? mutation.controls : [];
      for (const control of controls) {
        try {
          const controlRange = control.getRange("Content");
          applyMarkerRestoreFormatting(controlRange, {
            markerChannel: markerState?.markerChannel ?? "highlight",
            previousHighlightColor: markerState?.previousHighlightColor ?? null,
            previousUnderline: markerState?.previousUnderline ?? null,
            previousUnderlineColor: markerState?.previousUnderlineColor ?? null,
          });
          control.delete(true);
          needsFinalSync = true;
        } catch (tagMutationErr) {
          warn("clearOnlineSuggestionMarkers: deferred tag mutation failed", tagMutationErr);
        }
      }
      resetSuggestionMarkerState(suggestion);
    }
  }
  if (!softClearOnly && !preferSingleFlush) {
    try {
      const paragraphIndexes = new Set();
      for (const entry of normalizedEntries) {
        const idx = entry?.suggestion?.paragraphIndex;
        if (Number.isFinite(idx) && idx >= 0) {
          paragraphIndexes.add(idx);
        }
      }
      const scopedSweep = await clearStaleVejiceMarkerControlsForParagraphs(
        context,
        paragraphs,
        paragraphIndexes
      );
      if (scopedSweep.removed > 0) {
        result.staleControlClears += scopedSweep.removed;
      } else if (scopedSweep.failed) {
        for (const idx of paragraphIndexes) {
          const paragraph = paragraphs?.items?.[idx];
          if (!paragraph) continue;
          const removed = await clearStaleVejiceMarkerControlsInParagraph(context, paragraph);
          if (removed > 0) {
            result.staleControlClears += removed;
          }
        }
      }
      if (result.staleControlClears > 0) {
        result.clearedFallbackCount += result.staleControlClears;
      }
      const residualSweep = await clearResidualVejiceHighlightsForParagraphs(context, paragraphs, paragraphIndexes, {
        includeLegacyHighlightColors: true,
        commitChanges: false,
      });
      if (residualSweep?.requiresCommit) {
        needsFinalSync = true;
      }
    } catch (staleErr) {
      warn("clearOnlineSuggestionMarkers: stale marker sweep failed", staleErr);
    }
  }
  if (needsFinalSync) {
    try {
      await context.sync();
    } catch (syncErr) {
      if (isWordOnline() && isApiNotFoundLikeError(syncErr)) {
        if (!onlineMarkerCleanupApiNotFoundLogged) {
          onlineMarkerCleanupApiNotFoundLogged = true;
          log(
            "clearOnlineSuggestionMarkers: final sync ApiNotFound on this host; suppressing repeated warnings"
          );
        }
      } else {
        warn("clearOnlineSuggestionMarkers: final sync failed", syncErr);
      }
    }
  }
  if (!suggestionsOverride) {
    resetPendingSuggestionsOnline();
  }
  if (isQuoteTraceEnabled()) {
    log("[QUOTE TRACE]", "cleanup.summary", result);
  }
  return result;
}

function getSuggestionSortPos(suggestion) {
  return (
    suggestion?.meta?.op?.originalPos ??
    suggestion?.meta?.op?.correctedPos ??
    suggestion?.meta?.op?.pos ??
    suggestion?.charHint?.start ??
    -1
  );
}

function findWordTokenStartByHintInText(text, rawToken, hintIndex, occurrence, options = {}) {
  const positions = getWordTokenPositionsInText(text, rawToken);
  if (!positions.length) return -1;
  const matchIndex = findWordTokenMatchIndexInText(
    text,
    rawToken,
    hintIndex,
    occurrence,
    options,
    positions
  );
  return matchIndex >= 0 && matchIndex < positions.length ? positions[matchIndex] : -1;
}

function getWordTokenPositionsInText(text, rawToken) {
  const tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!tokenRaw || !text) return [];
  const token = tokenRaw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
  if (!token || /[^\p{L}\d]/u.test(token)) return [];
  const tokenRegex = new RegExp(
    `(^|[^\\p{L}\\d])(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=$|[^\\p{L}\\d])`,
    "gu"
  );
  const positions = [];
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    positions.push(match.index + match[1].length);
  }
  return positions;
}

function findWordTokenMatchIndexInText(text, rawToken, hintIndex, occurrence, options = {}, positionsOverride = null) {
  const positions = Array.isArray(positionsOverride)
    ? positionsOverride
    : getWordTokenPositionsInText(text, rawToken);
  if (!positions.length) return -1;
  const safeOccurrence = Number.isFinite(occurrence) ? Math.max(0, Math.floor(occurrence)) : 0;
  const safeHint = Number.isFinite(hintIndex) ? Math.max(0, Math.floor(hintIndex)) : null;
  const maxDistance = Number.isFinite(options?.maxDistance)
    ? Math.max(1, Math.floor(options.maxDistance))
    : 24;
  const preferOccurrence = Boolean(options?.preferOccurrence);

  if (safeHint === null) {
    return Math.min(safeOccurrence, positions.length - 1);
  }
  const ordinalIndex = Math.min(safeOccurrence, positions.length - 1);
  const ordinalPos = positions[ordinalIndex];

  let bestIndex = 0;
  let bestDist = Math.abs(positions[0] - safeHint);
  for (let i = 1; i < positions.length; i++) {
    const dist = Math.abs(positions[i] - safeHint);
    if (dist < bestDist) {
      bestIndex = i;
      bestDist = dist;
    }
  }
  // Reject far matches; these are the main source of in-word corruption.
  if (bestDist > maxDistance) {
    if (preferOccurrence && Math.abs(ordinalPos - safeHint) <= maxDistance * 2) {
      return ordinalIndex;
    }
    return -1;
  }
  return bestIndex;
}

const COMPANY_ABBREV_PATTERN = /\b(?:d\.\s*o\.\s*o\.|s\.\s*p\.|d\.\s*d\.|k\.\s*d\.|d\.\s*n\.\s*o\.)\b/iu;

function isAuthoritativeInsertSuggestion(suggestion) {
  if (suggestion?.kind !== "insert") return false;
  const opMeta = suggestion?.meta?.op || {};
  if (opMeta?.viaDiffFallback) return false;
  return Boolean(opMeta?.fromApiCommaOps || opMeta?.fromCorrections);
}

function resolveLemmaAwareTokenLookupOptions(suggestion, anchor) {
  const suggestionAuthoritative = Boolean(suggestion?.meta?.lemmaAnchorAuthoritative);
  const anchorAuthoritative = Boolean(anchor?.lemmaAuthoritative);
  const anchorLemmaMatched = Boolean(anchor?.lemmaMatched);
  if (suggestionAuthoritative || anchorAuthoritative) {
    return {
      maxDistance: 72,
      preferOccurrence: true,
    };
  }
  if (anchorLemmaMatched) {
    return {
      maxDistance: 48,
      preferOccurrence: true,
    };
  }
  return {
    maxDistance: 24,
    preferOccurrence: false,
  };
}

function resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return { op: null, skipReason: "insert_missing_anchor_meta" };
  let skipReason = "insert_unresolved";
  const opMeta = suggestion?.meta?.op || {};
  const normalizeQuoteBoundaryIntent = (value) => {
    if (typeof value !== "string") return null;
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
    if (!compact) return null;
    if (compact === "none") return "none";
    if (compact === "unknown") return "unknown";
    if (compact === "before") return "before_closing_quote";
    if (compact === "after") return "after_closing_quote";
    if (compact === "whitespaceonly") return "whitespace_only";
    if (compact === "insidequoteboundary") return "inside_quote_boundary";
    if (compact === "insidequotegap") return "inside_quote_gap";
    if (compact === "beforeclosingquote" || compact === "beforequote") return "before_closing_quote";
    if (compact === "afterclosingquote" || compact === "afterquote") return "after_closing_quote";
    if (compact === "beforeopeningquote") return "before_opening_quote";
    if (compact === "afteropeningquote") return "after_opening_quote";
    return null;
  };
  const suggestionExplicitQuoteIntent = normalizeQuoteBoundaryIntent(
    opMeta?.explicitQuoteIntent ??
      meta?.boundaryMeta?.explicitQuoteIntent ??
      opMeta?.quoteIntent ??
      opMeta?.quotePolicy
  );
  const authoritativeInsert = isAuthoritativeInsertSuggestion(suggestion);
  const useDirectHintMapping =
    Boolean(suggestion?.meta?.lemmaAnchorAuthoritative) &&
    typeof sourceText === "string" &&
    sourceText === snapshotText;

  const beforeAnchor = meta.sourceTokenBefore ?? meta.targetTokenBefore;
  const afterAnchor = meta.sourceTokenAfter ?? meta.targetTokenAfter;

  const mapSourceHintToSnapshot = (hint) => {
    if (!Number.isFinite(hint) || hint < 0) return -1;
    const mapped = useDirectHintMapping ? hint : mapIndexAcrossCanonical(sourceText, snapshotText, hint);
    if (!Number.isFinite(mapped) || mapped < 0 || mapped > snapshotText.length) return -1;
    return mapped;
  };

  const resolvePreferredInsertHint = () => {
    const candidates = [
      opMeta.correctedPos,
      suggestion?.kind === "insert" ? opMeta.pos : null,
      suggestion?.charHint?.start,
      meta?.targetCharStart,
      meta?.charStart,
      meta?.sourceTokenAt?.charStart,
      meta?.sourceTokenBefore?.charStart,
      meta?.sourceTokenAfter?.charStart,
      opMeta.originalPos,
    ]
      .filter((value) => Number.isFinite(value) && value >= 0)
      .filter((value, idx, arr) => arr.indexOf(value) === idx);
    for (const candidate of candidates) {
      const mapped = mapSourceHintToSnapshot(candidate);
      if (mapped >= 0) return mapped;
    }
    return -1;
  };
  const preferredInsertHint = resolvePreferredInsertHint();
  const maxHintDrift = suggestion?.meta?.lemmaAnchorAuthoritative ? 20 : 12;
  const maxAnchorHintDrift = suggestion?.meta?.lemmaAnchorAuthoritative ? 24 : 16;
  const traceAuthoritativeDecision = (reason, extra = {}) => {
    if (!authoritativeInsert) return;
    log("authoritative insert planning", {
      reason,
      suggestionId: suggestion?.id ?? null,
      originalPos: opMeta?.originalPos ?? null,
      correctedPos: opMeta?.correctedPos ?? opMeta?.pos ?? null,
      ...extra,
    });
  };

  const findStartForAnchor = (anchor, preferEnd = false, reasonOnMissing = "insert_anchor_token_unresolved") => {
    if (!anchor?.tokenText) return { start: -1, token: null };
    const token = (anchor.tokenText || "").trim().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
    if (!token || /[^\p{L}\d]/u.test(token)) return { start: -1, token: null };
    const sourceHint = preferEnd
      ? (Number.isFinite(anchor.charEnd) ? anchor.charEnd : anchor.charStart + token.length)
      : anchor.charStart;
    const lookupOptions = resolveLemmaAwareTokenLookupOptions(suggestion, anchor);
    const mappedHint = Number.isFinite(sourceHint)
      ? (useDirectHintMapping ? sourceHint : mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint))
      : null;
    const start = findWordTokenStartByHintInText(
      snapshotText,
      token,
      mappedHint,
      anchor.textOccurrence ?? anchor.tokenIndex ?? 0,
      lookupOptions
    );
    if (
      start >= 0 &&
      !isResolvedTokenWithinHintWindow(start, token, mappedHint, {
        preferEnd,
        maxDrift: maxAnchorHintDrift,
      })
    ) {
      skipReason = `${reasonOnMissing}_hint_drift`;
      if (authoritativeInsert) {
        traceAuthoritativeDecision("rejected_anchor_hint_drift", {
          anchorToken: token,
          mappedHint,
          resolvedStart: start,
          preferEnd,
        });
      }
      return { start: -1, token: null };
    }
    if (start < 0) {
      skipReason = reasonOnMissing;
    }
    return { start, token };
  };

  const isQuoteOrSpaceBoundary = (value) =>
    typeof value === "string" &&
    /^[\s\u200B-\u200D\uFEFF"'`\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A\u2019\u2018\u201A\u201B\u201F\u02BC\uFF02\uFF07]+$/u.test(value);
  const directionalOpeningQuoteChars = new Set(["\u00BB", "\u203A", "(", "["]);
  const directionalClosingQuoteChars = new Set(["\u00AB", "\u2039", ")", "]"]);
  const genericQuoteCharRegex =
    /["'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u02BC\uFF02\uFF07]/u;
  const classifyQuoteRoleAt = (text, index) => {
    if (typeof text !== "string" || !text.length || !Number.isFinite(index) || index < 0 || index >= text.length) {
      return null;
    }
    const current = text[index] || "";
    if (!current) return null;
    if (directionalOpeningQuoteChars.has(current)) return "opening";
    if (directionalClosingQuoteChars.has(current)) return "closing";
    if (!genericQuoteCharRegex.test(current)) return null;
    let left = index - 1;
    while (left >= 0 && /[\s\u200B-\u200D\uFEFF]/u.test(text[left] || "")) left--;
    let right = index + 1;
    while (right < text.length && /[\s\u200B-\u200D\uFEFF]/u.test(text[right] || "")) right++;
    const leftIsWord = left >= 0 && /[\p{L}\p{N}]/u.test(text[left] || "");
    const rightIsWord = right < text.length && /[\p{L}\p{N}]/u.test(text[right] || "");
    const immediateLeft = index > 0 ? text[index - 1] || "" : "";
    const immediateRight = index + 1 < text.length ? text[index + 1] || "" : "";
    const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
    const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
    const leftHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateLeft || "");
    const rightHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateRight || "");
    if (rightIsWord && !leftIsWord) return "opening";
    if (leftIsWord && !rightIsWord) return "closing";
    if (leftIsWord && rightIsWord) {
      if (leftAdjacentIsWord && rightAdjacentIsWord) return null;
      if (rightHasGap && !leftHasGap) return "closing";
      if (leftHasGap && !rightHasGap) return "opening";
      if (leftAdjacentIsWord && !rightAdjacentIsWord) return "closing";
      if (!leftAdjacentIsWord && rightAdjacentIsWord) return "opening";
      return "closing";
    }
    return "closing";
  };
  const isClosingQuoteOrCloser = (char, index = -1, text = snapshotText) => {
    const value = char || "";
    if (directionalClosingQuoteChars.has(value)) return true;
    if (directionalOpeningQuoteChars.has(value)) return false;
    if (!genericQuoteCharRegex.test(value)) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "closing";
    }
    return true;
  };
  const isOpeningQuoteOrOpener = (char, index = -1, text = snapshotText) => {
    const value = char || "";
    if (directionalOpeningQuoteChars.has(value)) return true;
    if (directionalClosingQuoteChars.has(value)) return false;
    if (!genericQuoteCharRegex.test(value)) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "opening";
    }
    return true;
  };
  // Keep insert boundary as planned (API-driven); do not auto-shift across quote boundaries.
  const normalizeInsertPosForQuoteBoundary = (pos, _options = {}) => {
    if (!Number.isFinite(pos)) return pos;
    return Math.max(0, Math.min(snapshotText.length, Math.floor(pos)));
  };

  const hasCompanyAbbreviationNear = (center, radius = 72) => {
    if (!Number.isFinite(center) || center < 0 || center > snapshotText.length) return false;
    const start = Math.max(0, center - radius);
    const end = Math.min(snapshotText.length, center + radius);
    return COMPANY_ABBREV_PATTERN.test(snapshotText.slice(start, end));
  };
  const isBoundaryQuoteChar = (char, index = -1, text = snapshotText) =>
    isClosingQuoteOrCloser(char, index, text) || isOpeningQuoteOrOpener(char, index, text);
  const snapshotGapCharRegex = /[\s\u200B-\u200D\uFEFF]/u;
  const hasCommaAcrossQuoteBoundary = (pos) => {
    if (!Number.isFinite(pos) || pos < 0 || pos > snapshotText.length) return false;
    let left = pos - 1;
    while (left >= 0 && snapshotGapCharRegex.test(snapshotText[left])) left--;
    while (left >= 0 && isBoundaryQuoteChar(snapshotText[left], left, snapshotText)) left--;
    while (left >= 0 && snapshotGapCharRegex.test(snapshotText[left])) left--;
    if (left >= 0 && snapshotText[left] === ",") return true;

    let right = pos;
    while (right < snapshotText.length && snapshotGapCharRegex.test(snapshotText[right])) right++;
    while (right < snapshotText.length && isBoundaryQuoteChar(snapshotText[right], right, snapshotText)) right++;
    while (right < snapshotText.length && snapshotGapCharRegex.test(snapshotText[right])) right++;
    if (right < snapshotText.length && snapshotText[right] === ",") return true;
    return false;
  };
  const rewindInsertPosBeforeWhitespace = (candidatePos) => {
    if (!Number.isFinite(candidatePos) || candidatePos <= 0) return candidatePos;
    let pos = Math.floor(candidatePos);
    while (pos > 0 && snapshotGapCharRegex.test(snapshotText[pos - 1])) {
      pos--;
    }
    return pos;
  };
  const isWordCharForInsertBoundary = (char) => /[\p{L}\p{N}]/u.test(char || "");
  const snapshotBoundaryAnchor = (anchor) => {
    if (!anchor || typeof anchor !== "object") return null;
    return {
      tokenId: anchor.tokenId ?? null,
      tokenText: anchor.tokenText ?? "",
      tokenIndex: Number.isFinite(anchor.tokenIndex) ? anchor.tokenIndex : null,
      textOccurrence: Number.isFinite(anchor.textOccurrence) ? anchor.textOccurrence : null,
      charStart: Number.isFinite(anchor.charStart) ? anchor.charStart : null,
      charEnd: Number.isFinite(anchor.charEnd) ? anchor.charEnd : null,
      matched: Boolean(anchor.matched),
      lemmaMatched: Boolean(anchor.lemmaMatched),
      lemmaAuthoritative: Boolean(anchor.lemmaAuthoritative),
    };
  };
  const buildInsertBoundarySpec = (requestedPos, resolvedPos, options = {}) => {
    const boundaryBeforeAnchor =
      options?.beforeAnchor ??
      meta.sourceTokenBefore ??
      meta.targetTokenBefore ??
      meta.sourceTokenAt ??
      null;
    const boundaryAfterAnchor =
      options?.afterAnchor ??
      meta.sourceTokenAfter ??
      meta.targetTokenAfter ??
      meta.targetTokenAt ??
      null;
    const beforeStart = Number.isFinite(options?.beforeStart) ? options.beforeStart : -1;
    const beforeTokenLength = Number.isFinite(options?.beforeTokenLength)
      ? options.beforeTokenLength
      : typeof options?.beforeToken === "string"
        ? options.beforeToken.length
        : typeof boundaryBeforeAnchor?.tokenText === "string"
          ? boundaryBeforeAnchor.tokenText.trim().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "").length
          : -1;
    const beforeEnd =
      Number.isFinite(options?.beforeEnd)
        ? options.beforeEnd
        : beforeStart >= 0 && beforeTokenLength >= 0
          ? beforeStart + beforeTokenLength
          : -1;
    const afterStart = Number.isFinite(options?.afterStart) ? options.afterStart : -1;
    const gapStart = beforeEnd >= 0 ? beforeEnd : Number.isFinite(resolvedPos) ? resolvedPos : -1;
    const gapEnd = afterStart >= 0 ? afterStart : gapStart;
    const gapText =
      gapStart >= 0 && gapEnd >= gapStart ? snapshotText.slice(gapStart, gapEnd) : "";
    let preferredSide = "after_before_token";
    if (afterStart >= 0 && Number.isFinite(resolvedPos) && resolvedPos >= afterStart) {
      preferredSide = "before_after_token";
    } else if (beforeEnd < 0 && afterStart >= 0) {
      preferredSide = "before_after_token";
    }
    let quotePolicy = "none";
    const explicitQuoteIntent =
      normalizeQuoteBoundaryIntent(options?.explicitQuoteIntent) ?? suggestionExplicitQuoteIntent ?? null;
    if (explicitQuoteIntent) {
      quotePolicy = explicitQuoteIntent;
    } else if (isQuoteIntentInferenceEnabled() && gapText && isQuoteOrSpaceBoundary(gapText)) {
      const trimmedGap = gapText.replace(/\s+/gu, "");
      if (trimmedGap) {
        let leadingClosers = "";
        for (let i = 0; i < trimmedGap.length; i++) {
          if (!isClosingQuoteOrCloser(trimmedGap[i], i, trimmedGap)) break;
          leadingClosers += trimmedGap[i];
        }
        let trailingOpeners = "";
        for (let i = trimmedGap.length - 1; i >= 0; i--) {
          if (!isOpeningQuoteOrOpener(trimmedGap[i], i, trimmedGap)) break;
          trailingOpeners = trimmedGap[i] + trailingOpeners;
        }
        if (leadingClosers && (!trailingOpeners || preferredSide === "after_before_token")) {
          quotePolicy = "after_closing_quote";
        } else if (trailingOpeners) {
          quotePolicy = "before_opening_quote";
        } else {
          quotePolicy = "inside_quote_boundary";
        }
      } else {
        quotePolicy = "whitespace_only";
      }
    }
    return {
      beforeToken: snapshotBoundaryAnchor(boundaryBeforeAnchor),
      afterToken: snapshotBoundaryAnchor(boundaryAfterAnchor),
      preferredSide,
      quotePolicy,
      explicitQuoteIntent,
      sourceBoundaryStart: gapStart >= 0 ? gapStart : null,
      sourceBoundaryEnd: gapEnd >= gapStart ? gapEnd : null,
      requestedPos: Number.isFinite(requestedPos) ? requestedPos : null,
      resolvedPos: Number.isFinite(resolvedPos) ? resolvedPos : null,
      authoritative: authoritativeInsert,
    };
  };
  const isInsideWordBoundary = (pos) => {
    if (!Number.isFinite(pos) || pos <= 0 || pos >= snapshotText.length) return false;
    return (
      isWordCharForInsertBoundary(snapshotText[pos - 1]) &&
      isWordCharForInsertBoundary(snapshotText[pos])
    );
  };
  const resolveSafeBoundaryNearWord = (pos, preferredPos = -1) => {
    if (!isInsideWordBoundary(pos)) return pos;
    let wordStart = pos;
    while (wordStart > 0 && isWordCharForInsertBoundary(snapshotText[wordStart - 1])) wordStart--;
    let wordEnd = pos;
    while (wordEnd < snapshotText.length && isWordCharForInsertBoundary(snapshotText[wordEnd])) wordEnd++;

    const candidateSet = new Set([wordStart, wordEnd]);
    if (wordStart > 0 && snapshotGapCharRegex.test(snapshotText[wordStart - 1])) {
      let wsStart = wordStart;
      while (wsStart > 0 && snapshotGapCharRegex.test(snapshotText[wsStart - 1])) wsStart--;
      candidateSet.add(wsStart);
    }
    if (wordEnd < snapshotText.length && snapshotGapCharRegex.test(snapshotText[wordEnd])) {
      let wsEnd = wordEnd;
      while (wsEnd < snapshotText.length && snapshotGapCharRegex.test(snapshotText[wsEnd])) wsEnd++;
      candidateSet.add(wsEnd);
    }
    if (Number.isFinite(preferredPos) && preferredPos >= 0 && preferredPos <= snapshotText.length) {
      candidateSet.add(preferredPos);
    }

    const target = Number.isFinite(preferredPos) && preferredPos >= 0 ? preferredPos : pos;
    let bestPos = pos;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const candidateRaw of candidateSet) {
      const candidate = normalizeInsertPosForQuoteBoundary(
        Math.max(0, Math.min(snapshotText.length, Math.floor(candidateRaw)))
      );
      const wordPenalty = isInsideWordBoundary(candidate) ? 10_000 : 0;
      const distanceScore = Math.abs(candidate - target);
      const score = wordPenalty + distanceScore;
      if (score < bestScore) {
        bestScore = score;
        bestPos = candidate;
      }
    }
    return bestPos;
  };
  const createInsertOpResult = (rawPos, snippet, options = {}) => {
    const allowQuoteBoundaryHeuristic = options?.allowQuoteBoundaryHeuristic !== false;
    const clampedRawPos = Math.max(0, Math.min(snapshotText.length, rawPos));
    let pos = normalizeInsertPosForQuoteBoundary(clampedRawPos, {
      allowHeuristic: allowQuoteBoundaryHeuristic,
    });
    pos = rewindInsertPosBeforeWhitespace(pos);
    const hintedPos =
      preferredInsertHint >= 0
        ? rewindInsertPosBeforeWhitespace(
            normalizeInsertPosForQuoteBoundary(
              Math.max(0, Math.min(snapshotText.length, preferredInsertHint)),
              { allowHeuristic: allowQuoteBoundaryHeuristic }
            )
          )
        : -1;
    if (hintedPos >= 0) {
      if (authoritativeInsert) {
        if (pos !== hintedPos) {
          traceAuthoritativeDecision("preferred_hint_overrode_candidate", {
            candidatePos: pos,
            hintedPos,
            rawPos: clampedRawPos,
          });
        }
        pos = hintedPos;
      } else if (
        suggestion?.meta?.lemmaAnchorAuthoritative ||
        Math.abs(pos - hintedPos) > maxHintDrift ||
        (isInsideWordBoundary(pos) && !isInsideWordBoundary(hintedPos))
      ) {
        pos = hintedPos;
      }
    }
    if (isInsideWordBoundary(pos)) {
      if (authoritativeInsert) {
        traceAuthoritativeDecision("rejected_in_word_boundary", {
          rawPos: clampedRawPos,
          resolvedPos: pos,
          hintedPos,
        });
        return { op: null, skipReason: "insert_authoritative_inside_word" };
      }
      pos = resolveSafeBoundaryNearWord(pos, hintedPos);
    }
    pos = rewindInsertPosBeforeWhitespace(pos);
    if (isInsideWordBoundary(pos)) {
      if (authoritativeInsert) {
        traceAuthoritativeDecision("rejected_unresolved_word_boundary", {
          rawPos: clampedRawPos,
          resolvedPos: pos,
        });
        return { op: null, skipReason: "insert_authoritative_inside_word" };
      }
      return { op: { kind: "noop" }, skipReason: null };
    }
    const left = snapshotText.slice(Math.max(0, pos - 3), pos);
    const right = snapshotText.slice(pos, Math.min(snapshotText.length, pos + 3));
    if (/,\s*$/.test(left) || /^\s*,/.test(right)) {
      if (authoritativeInsert) {
        traceAuthoritativeDecision("duplicate_comma_detected", {
          rawPos: clampedRawPos,
          resolvedPos: pos,
        });
      }
      return { op: { kind: "noop" }, skipReason: null };
    }
    const contextSnippet = snapshotText.slice(Math.max(0, pos - 6), Math.min(snapshotText.length, pos + 6));
    const explicitSnippet =
      typeof snippet === "string" && /[^\s]/.test(snippet) ? snippet : "";
    return {
      op: {
        kind: "insert",
        start: pos,
        end: pos,
        replacement: ",",
        explicitQuoteIntent: suggestionExplicitQuoteIntent ?? undefined,
        snippet: explicitSnippet || contextSnippet,
        boundaryHint: pos,
        authoritativeBoundary: authoritativeInsert,
        insertAtEnd: pos >= snapshotText.length,
        boundary: buildInsertBoundarySpec(clampedRawPos, pos, {
          ...(options?.boundaryContext || {}),
          explicitQuoteIntent: options?.explicitQuoteIntent ?? suggestionExplicitQuoteIntent,
        }),
      },
      skipReason: null,
    };
  };
  const resolveCompanyInsertFallback = () => {
    const sourceAnchor =
      meta.sourceTokenAt ?? meta.sourceTokenBefore ?? meta.sourceTokenAfter ?? meta.highlightAnchorTarget;
    const charStart =
      suggestion?.charHint?.start ??
      meta.charStart ??
      sourceAnchor?.charStart ??
      suggestion?.meta?.op?.originalPos ??
      -1;
    if (!Number.isFinite(charStart) || charStart < 0) {
      skipReason = "insert_fallback_no_char_hint";
      return null;
    }
    const mapped = mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
    if (!Number.isFinite(mapped) || mapped < 0 || mapped > snapshotText.length) {
      skipReason = "insert_fallback_mapped_pos_invalid";
      return null;
    }
    if (!hasCompanyAbbreviationNear(mapped)) {
      skipReason = "insert_fallback_company_form_not_detected";
      return null;
    }
    let pos = mapped;
    if (pos > 0 && pos < snapshotText.length && /[\p{L}\d]/u.test(snapshotText[pos - 1]) && /[\p{L}\d]/u.test(snapshotText[pos])) {
      while (pos < snapshotText.length && /[\p{L}\d.]/u.test(snapshotText[pos])) pos++;
    }
    return createInsertOpResult(pos);
  };

  // Best path: insert at exact whitespace gap between before/after anchors.
  if (beforeAnchor && afterAnchor) {
    const before = findStartForAnchor(beforeAnchor, true, "insert_before_anchor_lookup_failed");
    const after = findStartForAnchor(afterAnchor, false, "insert_after_anchor_lookup_failed");
    if (before.start >= 0 && after.start >= 0) {
      const beforeEnd = before.start + before.token.length;
      if (beforeEnd <= after.start) {
        const gap = snapshotText.slice(beforeEnd, after.start);
        // Only treat as already satisfied when the direct token gap is just comma+spaces.
        if (/^\s*,\s*$/.test(gap)) {
          return { op: { kind: "noop" }, skipReason: null };
        }
        // Normal adjacency gap: whitespace-only.
        if (!/[^\s]/.test(gap)) {
          return createInsertOpResult(beforeEnd, gap || before.token, {
            allowQuoteBoundaryHeuristic: !authoritativeInsert,
            boundaryContext: {
              beforeAnchor,
              afterAnchor,
              beforeStart: before.start,
              beforeTokenLength: before.token.length,
              afterStart: after.start,
            },
          });
        }
        // Quote boundary adjacency (e.g. "'foo' 'bar'"): insert after closing quote.
        if (isQuoteOrSpaceBoundary(gap)) {
          const quoteBoundaryPos = preferredInsertHint >= 0 ? preferredInsertHint : beforeEnd;
          if (authoritativeInsert && preferredInsertHint >= 0) {
            traceAuthoritativeDecision("quote_gap_preserved_api_boundary", {
              beforeEnd,
              afterStart: after.start,
              preferredInsertHint,
            });
          }
          return createInsertOpResult(quoteBoundaryPos, gap || before.token, {
            allowQuoteBoundaryHeuristic: false,
            boundaryContext: {
              beforeAnchor,
              afterAnchor,
              beforeStart: before.start,
              beforeTokenLength: before.token.length,
              afterStart: after.start,
            },
          });
        }
        skipReason = "insert_gap_contains_nonspace_content";
      }
      skipReason = "insert_before_after_order_invalid";
    }
  }

  // Secondary path: normalize whitespace right before "after" token.
  if (afterAnchor) {
    const after = findStartForAnchor(afterAnchor, false, "insert_after_anchor_lookup_failed");
    if (after.start > 0) {
      let wsStart = after.start;
      while (wsStart > 0 && snapshotGapCharRegex.test(snapshotText[wsStart - 1])) wsStart--;
      if (wsStart < after.start) {
        return createInsertOpResult(wsStart, snapshotText.slice(wsStart, after.start), {
          allowQuoteBoundaryHeuristic: !authoritativeInsert,
          boundaryContext: {
            beforeAnchor,
            afterAnchor,
            afterStart: after.start,
          },
        });
      }
      const safePos = normalizeInsertPosForQuoteBoundary(after.start, {
        allowHeuristic: !authoritativeInsert,
      });
      return createInsertOpResult(
        safePos,
        snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1)),
        {
          allowQuoteBoundaryHeuristic: !authoritativeInsert,
          boundaryContext: {
            beforeAnchor,
            afterAnchor,
            afterStart: after.start,
          },
        }
      );
    }
  }

  // Secondary path: normalize whitespace right after "before" token.
  if (beforeAnchor) {
    const before = findStartForAnchor(beforeAnchor, true, "insert_before_anchor_lookup_failed");
    if (before.start >= 0) {
      const beforeEnd = before.start + before.token.length;
      let wsEnd = beforeEnd;
      while (wsEnd < snapshotText.length && snapshotGapCharRegex.test(snapshotText[wsEnd])) wsEnd++;
      if (wsEnd > beforeEnd) {
        return createInsertOpResult(beforeEnd, snapshotText.slice(beforeEnd, wsEnd), {
          allowQuoteBoundaryHeuristic: !authoritativeInsert,
          boundaryContext: {
            beforeAnchor,
            afterAnchor,
            beforeStart: before.start,
            beforeTokenLength: before.token.length,
          },
        });
      }
      const safePos = normalizeInsertPosForQuoteBoundary(beforeEnd, {
        allowHeuristic: !authoritativeInsert,
      });
      return createInsertOpResult(
        safePos,
        snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1)),
        {
          allowQuoteBoundaryHeuristic: !authoritativeInsert,
          boundaryContext: {
            beforeAnchor,
            afterAnchor,
            beforeStart: before.start,
            beforeTokenLength: before.token.length,
          },
        }
      );
    }
  }

  const fallbackOp = resolveCompanyInsertFallback();
  if (fallbackOp) return fallbackOp;
  return { op: null, skipReason };
}

function resolveInsertOperationFromSnapshotDesktopLegacy(snapshotText, sourceText, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return { op: null, skipReason: "insert_missing_anchor_meta" };
  let skipReason = "insert_unresolved";
  const opMeta = suggestion?.meta?.op || {};

  const beforeAnchor = meta.sourceTokenBefore ?? meta.targetTokenBefore;
  const afterAnchor = meta.sourceTokenAfter ?? meta.targetTokenAfter;
  const resolvePreferredInsertHint = () => {
    const candidates = [
      opMeta.correctedPos,
      suggestion?.kind === "insert" ? opMeta.pos : null,
      suggestion?.charHint?.start,
      meta?.targetCharStart,
      meta?.charStart,
      opMeta.originalPos,
    ]
      .filter((value) => Number.isFinite(value) && value >= 0)
      .filter((value, idx, arr) => arr.indexOf(value) === idx);
    for (const candidate of candidates) {
      const mapped = mapIndexAcrossCanonical(sourceText, snapshotText, candidate);
      if (Number.isFinite(mapped) && mapped >= 0 && mapped <= snapshotText.length) {
        return mapped;
      }
    }
    return -1;
  };
  const preferredInsertHint = resolvePreferredInsertHint();

  const findStartForAnchor = (anchor, preferEnd = false, reasonOnMissing = "insert_anchor_token_unresolved") => {
    if (!anchor?.tokenText) return { start: -1, token: null };
    const token = (anchor.tokenText || "").trim().replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
    if (!token || /[^\p{L}\d]/u.test(token)) return { start: -1, token: null };
    const sourceHint = preferEnd
      ? (Number.isFinite(anchor.charEnd) ? anchor.charEnd : anchor.charStart + token.length)
      : anchor.charStart;
    const mappedHint = Number.isFinite(sourceHint)
      ? mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint)
      : null;
    const start = findWordTokenStartByHintInText(
      snapshotText,
      token,
      mappedHint,
      anchor.textOccurrence ?? anchor.tokenIndex ?? 0
    );
    if (start < 0) {
      skipReason = reasonOnMissing;
    }
    return { start, token };
  };

  const isQuoteOrSpaceBoundary = (value) =>
    typeof value === "string" &&
    /^[\s\u200B-\u200D\uFEFF"'`\u00AB\u00BB\u2039\u203A\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u02BC\uFF02\uFF07]+$/u.test(value);
  const directionalOpeningQuoteChars = new Set(["\u00BB", "\u203A", "(", "["]);
  const directionalClosingQuoteChars = new Set(["\u00AB", "\u2039", ")", "]"]);
  const genericQuoteCharRegex =
    /["'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u02BC\uFF02\uFF07]/u;
  const classifyQuoteRoleAt = (text, index) => {
    if (typeof text !== "string" || !text.length || !Number.isFinite(index) || index < 0 || index >= text.length) {
      return null;
    }
    const current = text[index] || "";
    if (!current) return null;
    if (directionalOpeningQuoteChars.has(current)) return "opening";
    if (directionalClosingQuoteChars.has(current)) return "closing";
    if (!genericQuoteCharRegex.test(current)) return null;
    let left = index - 1;
    while (left >= 0 && /[\s\u200B-\u200D\uFEFF]/u.test(text[left] || "")) left--;
    let right = index + 1;
    while (right < text.length && /[\s\u200B-\u200D\uFEFF]/u.test(text[right] || "")) right++;
    const leftIsWord = left >= 0 && /[\p{L}\p{N}]/u.test(text[left] || "");
    const rightIsWord = right < text.length && /[\p{L}\p{N}]/u.test(text[right] || "");
    const immediateLeft = index > 0 ? text[index - 1] || "" : "";
    const immediateRight = index + 1 < text.length ? text[index + 1] || "" : "";
    const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
    const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
    const leftHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateLeft || "");
    const rightHasGap = /[\s\u200B-\u200D\uFEFF]/u.test(immediateRight || "");
    if (rightIsWord && !leftIsWord) return "opening";
    if (leftIsWord && !rightIsWord) return "closing";
    if (leftIsWord && rightIsWord) {
      if (leftAdjacentIsWord && rightAdjacentIsWord) return null;
      if (rightHasGap && !leftHasGap) return "closing";
      if (leftHasGap && !rightHasGap) return "opening";
      if (leftAdjacentIsWord && !rightAdjacentIsWord) return "closing";
      if (!leftAdjacentIsWord && rightAdjacentIsWord) return "opening";
      return "closing";
    }
    return "closing";
  };
  const isClosingQuoteOrCloser = (char, index = -1, text = snapshotText) => {
    const value = char || "";
    if (directionalClosingQuoteChars.has(value)) return true;
    if (directionalOpeningQuoteChars.has(value)) return false;
    if (!genericQuoteCharRegex.test(value)) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "closing";
    }
    return true;
  };
  const isOpeningQuoteOrOpener = (char, index = -1, text = snapshotText) => {
    const value = char || "";
    if (directionalOpeningQuoteChars.has(value)) return true;
    if (directionalClosingQuoteChars.has(value)) return false;
    if (!genericQuoteCharRegex.test(value)) return false;
    if (Number.isFinite(index) && typeof text === "string") {
      return classifyQuoteRoleAt(text, index) === "opening";
    }
    return true;
  };
  // Keep insert boundary as planned (API-driven); do not auto-shift across quote boundaries.
  const normalizeInsertPosForQuoteBoundary = (pos) => {
    if (!Number.isFinite(pos)) return pos;
    return Math.max(0, Math.min(snapshotText.length, Math.floor(pos)));
  };

  const hasCompanyAbbreviationNear = (center, radius = 72) => {
    if (!Number.isFinite(center) || center < 0 || center > snapshotText.length) return false;
    const start = Math.max(0, center - radius);
    const end = Math.min(snapshotText.length, center + radius);
    return COMPANY_ABBREV_PATTERN.test(snapshotText.slice(start, end));
  };

  const hasCommaAcrossQuoteBoundary = (pos) => {
    const snapshotGapCharRegex = /[\s\u200B-\u200D\uFEFF]/u;
    if (!Number.isFinite(pos) || pos < 0 || pos > snapshotText.length) return false;
    let left = pos - 1;
    while (left >= 0 && snapshotGapCharRegex.test(snapshotText[left])) left--;
    while (left >= 0 && isClosingQuoteOrCloser(snapshotText[left], left, snapshotText)) left--;
    while (left >= 0 && snapshotGapCharRegex.test(snapshotText[left])) left--;
    if (left >= 0 && snapshotText[left] === ",") return true;

    let right = pos;
    while (right < snapshotText.length && snapshotGapCharRegex.test(snapshotText[right])) right++;
    while (right < snapshotText.length && isOpeningQuoteOrOpener(snapshotText[right], right, snapshotText)) right++;
    while (right < snapshotText.length && snapshotGapCharRegex.test(snapshotText[right])) right++;
    if (right < snapshotText.length && snapshotText[right] === ",") return true;
    return false;
  };

  const rewindInsertPosBeforeWhitespace = (candidatePos) => {
    const snapshotGapCharRegex = /[\s\u200B-\u200D\uFEFF]/u;
    if (!Number.isFinite(candidatePos) || candidatePos <= 0) return candidatePos;
    let pos = Math.floor(candidatePos);
    while (pos > 0 && snapshotGapCharRegex.test(snapshotText[pos - 1])) {
      pos--;
    }
    return pos;
  };

  const buildInsertOp = (rawPos, snippet) => {
    const pos = rewindInsertPosBeforeWhitespace(
      normalizeInsertPosForQuoteBoundary(Math.max(0, Math.min(snapshotText.length, rawPos)))
    );
    const left = snapshotText.slice(Math.max(0, pos - 3), pos);
    const right = snapshotText.slice(pos, Math.min(snapshotText.length, pos + 3));
    if (/,\s*$/.test(left) || /^\s*,/.test(right)) {
      return { kind: "noop" };
    }
    return {
      kind: "insert",
      start: pos,
      end: pos,
      replacement: ",",
      snippet: snippet || snapshotText.slice(Math.max(0, pos - 6), Math.min(snapshotText.length, pos + 6)),
    };
  };

  const resolveCompanyInsertFallback = () => {
    const sourceAnchor =
      meta.sourceTokenAt ?? meta.sourceTokenBefore ?? meta.sourceTokenAfter ?? meta.highlightAnchorTarget;
    const charStart =
      suggestion?.charHint?.start ??
      meta.charStart ??
      sourceAnchor?.charStart ??
      suggestion?.meta?.op?.originalPos ??
      -1;
    if (!Number.isFinite(charStart) || charStart < 0) {
      skipReason = "insert_fallback_no_char_hint";
      return null;
    }
    const mapped = mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
    if (!Number.isFinite(mapped) || mapped < 0 || mapped > snapshotText.length) {
      skipReason = "insert_fallback_mapped_pos_invalid";
      return null;
    }
    if (!hasCompanyAbbreviationNear(mapped)) {
      skipReason = "insert_fallback_company_form_not_detected";
      return null;
    }
    let pos = mapped;
    if (pos > 0 && pos < snapshotText.length && /[\p{L}\d]/u.test(snapshotText[pos - 1]) && /[\p{L}\d]/u.test(snapshotText[pos])) {
      while (pos < snapshotText.length && /[\p{L}\d.]/u.test(snapshotText[pos])) pos++;
    }
    return buildInsertOp(pos);
  };

  if (beforeAnchor && afterAnchor) {
    const before = findStartForAnchor(beforeAnchor, true, "insert_before_anchor_lookup_failed");
    const after = findStartForAnchor(afterAnchor, false, "insert_after_anchor_lookup_failed");
    if (before.start >= 0 && after.start >= 0) {
      const beforeEnd = before.start + before.token.length;
      if (beforeEnd <= after.start) {
        const gap = snapshotText.slice(beforeEnd, after.start);
        if (/^\s*,\s*$/.test(gap)) {
          return { op: { kind: "noop" }, skipReason: null };
        }
        if (!/[^\s]/.test(gap)) {
          return { op: buildInsertOp(beforeEnd, gap || before.token), skipReason: null };
        }
        if (isQuoteOrSpaceBoundary(gap)) {
          const quoteBoundaryPos = preferredInsertHint >= 0 ? preferredInsertHint : beforeEnd;
          return { op: buildInsertOp(quoteBoundaryPos, gap || before.token), skipReason: null };
        }
        skipReason = "insert_gap_contains_nonspace_content";
      }
      skipReason = "insert_before_after_order_invalid";
    }
  }

  if (afterAnchor) {
    const after = findStartForAnchor(afterAnchor, false, "insert_after_anchor_lookup_failed");
    if (after.start > 0) {
      let wsStart = after.start;
      while (wsStart > 0 && /\s/.test(snapshotText[wsStart - 1])) wsStart--;
      if (wsStart < after.start) {
        return { op: buildInsertOp(wsStart, snapshotText.slice(wsStart, after.start)), skipReason: null };
      }
      const safePos = normalizeInsertPosForQuoteBoundary(after.start);
      return {
        op: buildInsertOp(
          safePos,
          snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1))
        ),
        skipReason: null,
      };
    }
  }

  if (beforeAnchor) {
    const before = findStartForAnchor(beforeAnchor, true, "insert_before_anchor_lookup_failed");
    if (before.start >= 0) {
      const beforeEnd = before.start + before.token.length;
      let wsEnd = beforeEnd;
      while (wsEnd < snapshotText.length && /\s/.test(snapshotText[wsEnd])) wsEnd++;
      if (wsEnd > beforeEnd) {
        return { op: buildInsertOp(beforeEnd, snapshotText.slice(beforeEnd, wsEnd)), skipReason: null };
      }
      const safePos = normalizeInsertPosForQuoteBoundary(beforeEnd);
      return {
        op: buildInsertOp(
          safePos,
          snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1))
        ),
        skipReason: null,
      };
    }
  }

  const fallbackOp = resolveCompanyInsertFallback();
  if (fallbackOp) return { op: fallbackOp, skipReason: null };
  return { op: null, skipReason };
}

function isProtectedAbbreviationComma(snapshotText = "", commaIndex = -1) {
  if (typeof snapshotText !== "string" || !snapshotText || !Number.isFinite(commaIndex) || commaIndex < 1) {
    return false;
  }
  if (snapshotText[commaIndex] !== ",") return false;
  const left = snapshotText.slice(Math.max(0, commaIndex - 24), commaIndex + 1);
  const normalized = left.replace(/\s+/g, "");
  return /\b(?:itd|itn|ipd|idr|npr|oz|tj|dr|mr|ga|gos|prim|prof|doc|mag)\.,$/iu.test(normalized);
}

function normalizeDeleteContextToken(rawToken) {
  const tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
  const token = tokenRaw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
  if (!token || /[^\p{L}\d]/u.test(token)) return null;
  return token;
}

function isSafeGapBetweenTokenAndComma(gap = "", direction = "before") {
  if (typeof gap !== "string") return false;
  if (direction === "before") {
    return /^[\s"'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u2039)\]]*$/u.test(gap);
  }
  return /^[\s"'`\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00BB\u203A(\[]*$/u.test(gap);
}

function hasStrongDeleteContext(snapshotText, sourceText, suggestion, commaIndex) {
  const meta = suggestion?.meta?.anchor;
  if (!meta || typeof snapshotText !== "string" || !snapshotText) return false;
  const useDirectHintMapping =
    Boolean(suggestion?.meta?.lemmaAnchorAuthoritative) &&
    typeof sourceText === "string" &&
    sourceText === snapshotText;
  const beforeAnchor = meta.sourceTokenBefore ?? meta.sourceTokenAt ?? meta.highlightAnchorTarget ?? null;
  const afterAnchor = meta.sourceTokenAfter ?? meta.sourceTokenAt ?? meta.highlightAnchorTarget ?? null;
  let checked = 0;

  if (beforeAnchor?.tokenText) {
    const token = normalizeDeleteContextToken(beforeAnchor.tokenText);
    if (token) {
      const sourceHint = Number.isFinite(beforeAnchor.charStart)
        ? beforeAnchor.charStart
        : Number.isFinite(beforeAnchor.charEnd)
          ? beforeAnchor.charEnd - token.length
          : null;
      const lookupOptions = resolveLemmaAwareTokenLookupOptions(suggestion, beforeAnchor);
      const mappedHint =
        Number.isFinite(sourceHint) && typeof sourceText === "string"
          ? (useDirectHintMapping ? sourceHint : mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint))
          : null;
      const start = findWordTokenStartByHintInText(
        snapshotText,
        token,
        mappedHint,
        beforeAnchor.textOccurrence ?? beforeAnchor.tokenIndex ?? 0,
        lookupOptions
      );
      checked++;
      if (start < 0) return false;
      const end = start + token.length;
      const gap = snapshotText.slice(end, commaIndex);
      if (end > commaIndex || !isSafeGapBetweenTokenAndComma(gap, "before")) return false;
    }
  }

  if (afterAnchor?.tokenText) {
    const token = normalizeDeleteContextToken(afterAnchor.tokenText);
    if (token) {
      const sourceHint = Number.isFinite(afterAnchor.charStart)
        ? afterAnchor.charStart
        : Number.isFinite(afterAnchor.charEnd)
          ? afterAnchor.charEnd - token.length
          : null;
      const lookupOptions = resolveLemmaAwareTokenLookupOptions(suggestion, afterAnchor);
      const mappedHint =
        Number.isFinite(sourceHint) && typeof sourceText === "string"
          ? (useDirectHintMapping ? sourceHint : mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint))
          : null;
      const start = findWordTokenStartByHintInText(
        snapshotText,
        token,
        mappedHint,
        afterAnchor.textOccurrence ?? afterAnchor.tokenIndex ?? 0,
        lookupOptions
      );
      checked++;
      if (start < 0) return false;
      const gap = snapshotText.slice(commaIndex + 1, start);
      if (start <= commaIndex || !isSafeGapBetweenTokenAndComma(gap, "after")) return false;
    }
  }

  // If no clean tokens are available, fallback to char-mapping confidence only.
  return true;
}

function findNearestNonSpaceIndex(text = "", start = 0, step = 1) {
  if (typeof text !== "string" || !text.length) return -1;
  for (let i = start; i >= 0 && i < text.length; i += step) {
    if (!/\s/u.test(text[i])) return i;
  }
  return -1;
}

function hasWordBoundaryAroundComma(snapshotText, commaIndex) {
  if (typeof snapshotText !== "string" || !snapshotText.length) return false;
  const leftIdx = findNearestNonSpaceIndex(snapshotText, commaIndex - 1, -1);
  const rightIdx = findNearestNonSpaceIndex(snapshotText, commaIndex + 1, 1);
  if (leftIdx < 0 || rightIdx < 0) return false;
  return /\p{L}|\p{N}/u.test(snapshotText[leftIdx]) && /\p{L}|\p{N}/u.test(snapshotText[rightIdx]);
}

function resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return { op: null, skipReason: "delete_missing_anchor_meta" };
  const sourceAnchor =
    meta.sourceTokenAt ?? meta.sourceTokenBefore ?? meta.sourceTokenAfter ?? meta.highlightAnchorTarget;
  const charStart =
    suggestion?.charHint?.start ??
    meta.charStart ??
    sourceAnchor?.charStart ??
    suggestion?.meta?.op?.originalPos ??
    -1;
  if (!Number.isFinite(charStart) || charStart < 0) return { op: null, skipReason: "delete_missing_char_hint" };

  const useDirectHintMapping =
    Boolean(suggestion?.meta?.lemmaAnchorAuthoritative) &&
    typeof sourceText === "string" &&
    sourceText === snapshotText;
  const mappedStart = useDirectHintMapping
    ? charStart
    : mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
  let commaIndex = -1;
  const maxDelta = suggestion?.meta?.lemmaAnchorAuthoritative ? 2 : 1;
  for (let delta = 0; delta <= maxDelta; delta++) {
    const left = mappedStart - delta;
    const right = mappedStart + delta;
    if (left >= 0 && snapshotText[left] === ",") {
      commaIndex = left;
      break;
    }
    if (right < snapshotText.length && snapshotText[right] === ",") {
      commaIndex = right;
      break;
    }
  }
  if (commaIndex < 0) return { op: null, skipReason: "delete_comma_not_found_near_hint" };
  if (isProtectedAbbreviationComma(snapshotText, commaIndex)) return { op: null, skipReason: "delete_protected_abbreviation" };
  if (!hasStrongDeleteContext(snapshotText, sourceText, suggestion, commaIndex)) {
    const charAligned = Math.abs(commaIndex - mappedStart) <= maxDelta;
    const safeBoundary = hasWordBoundaryAroundComma(snapshotText, commaIndex);
    if (!(charAligned && safeBoundary)) {
      return { op: null, skipReason: "delete_context_mismatch" };
    }
  }
  return { op: {
    kind: "delete",
    start: commaIndex,
    end: commaIndex + 1,
    replacement: "",
    snippet: ",",
  }, skipReason: null };
}

function resolveSuggestionMappedCharHint(snapshotText, sourceText, suggestion) {
  if (typeof snapshotText !== "string") return -1;
  const meta = suggestion?.meta?.anchor;
  const op = suggestion?.meta?.op;
  const sourceAnchor =
    meta?.sourceTokenAt ?? meta?.sourceTokenBefore ?? meta?.sourceTokenAfter ?? meta?.highlightAnchorTarget;
  const opHintPrimary =
    suggestion?.kind === "insert"
      ? Number.isFinite(op?.correctedPos)
        ? op.correctedPos
        : Number.isFinite(op?.pos)
          ? op.pos
          : Number.isFinite(op?.originalPos)
            ? op.originalPos
            : -1
      : Number.isFinite(op?.originalPos)
        ? op.originalPos
        : Number.isFinite(op?.pos)
          ? op.pos
          : Number.isFinite(op?.correctedPos)
            ? op.correctedPos
            : -1;
  const candidateHints = [
    suggestion?.charHint?.start,
    meta?.charStart,
    sourceAnchor?.charStart,
    opHintPrimary,
    op?.originalPos,
    op?.correctedPos,
    op?.pos,
  ]
    .filter((value) => Number.isFinite(value) && value >= 0)
    .filter((value, index, arr) => arr.indexOf(value) === index);
  if (!candidateHints.length) return -1;
  const useDirectHintMapping =
    Boolean(suggestion?.meta?.lemmaAnchorAuthoritative) &&
    typeof sourceText === "string" &&
    sourceText === snapshotText;
  for (const sourceHint of candidateHints) {
    const mapped = useDirectHintMapping
      ? sourceHint
      : mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint);
    if (Number.isFinite(mapped) && mapped >= 0 && mapped <= snapshotText.length) {
      return mapped;
    }
  }
  return -1;
}

function hasCommaNearMappedHint(snapshotText, mappedHint, radius = 4) {
  if (
    typeof snapshotText !== "string" ||
    !snapshotText.length ||
    !Number.isFinite(mappedHint) ||
    mappedHint < 0 ||
    mappedHint > snapshotText.length
  ) {
    return false;
  }
  const safeRadius = Number.isFinite(radius) ? Math.max(0, Math.floor(radius)) : 4;
  for (let delta = 0; delta <= safeRadius; delta++) {
    const left = mappedHint - delta;
    const right = mappedHint + delta;
    if (left >= 0 && snapshotText[left] === ",") return true;
    if (right < snapshotText.length && snapshotText[right] === ",") return true;
  }
  const isBoundary = (char) => /[\s"'`\u00AB\u00BB\u2018\u2019\u201C\u201D\u201E()[\]]/u.test(char || "");
  let left = mappedHint - 1;
  while (left >= 0 && isBoundary(snapshotText[left])) left--;
  if (left >= 0 && snapshotText[left] === ",") return true;
  let right = mappedHint;
  while (right < snapshotText.length && isBoundary(snapshotText[right])) right++;
  if (right < snapshotText.length && snapshotText[right] === ",") return true;
  return false;
}

function findCommaIndexNearMappedHint(snapshotText, mappedHint, radius = 4) {
  if (
    typeof snapshotText !== "string" ||
    !snapshotText.length ||
    !Number.isFinite(mappedHint) ||
    mappedHint < 0 ||
    mappedHint > snapshotText.length
  ) {
    return -1;
  }
  const safeRadius = Math.max(0, Number.isFinite(radius) ? Math.floor(radius) : 0);
  for (let delta = 0; delta <= safeRadius; delta++) {
    const left = mappedHint - delta;
    const right = mappedHint + delta;
    if (left >= 0 && left < snapshotText.length && snapshotText[left] === ",") {
      return left;
    }
    if (right >= 0 && right < snapshotText.length && snapshotText[right] === ",") {
      return right;
    }
  }
  const isBoundary = (char) => /[\s"'`\u00AB\u00BB\u2018\u2019\u201C\u201D\u201E()[\]]/u.test(char || "");
  let left = Math.min(snapshotText.length - 1, Math.max(0, Math.floor(mappedHint) - 1));
  while (left >= 0 && isBoundary(snapshotText[left])) left--;
  if (left >= 0 && snapshotText[left] === ",") return left;
  let right = Math.max(0, Math.min(snapshotText.length, Math.floor(mappedHint)));
  while (right < snapshotText.length && isBoundary(snapshotText[right])) right++;
  if (right < snapshotText.length && snapshotText[right] === ",") return right;
  return -1;
}

function resolveDeterministicConfidenceLevel(suggestion) {
  const explicit = suggestion?.meta?.deterministicConfidence?.level;
  if (explicit === "high" || explicit === "low") return explicit;
  if (suggestion?.meta?.lowAnchorReliability) return "low";
  const base = suggestion?.meta?.confidence?.level;
  return base === "high" ? "high" : "low";
}

function isDeterministicOpStable(snapshotText, sourceText, suggestion, op) {
  if (!op || typeof op !== "object") return false;
  const mappedHint = resolveSuggestionMappedCharHint(snapshotText, sourceText, suggestion);
  if (!Number.isFinite(mappedHint) || mappedHint < 0 || mappedHint > snapshotText.length) {
    return false;
  }
  const driftTolerance = suggestion?.meta?.lemmaAnchorAuthoritative ? 8 : 5;
  const opStart =
    Number.isFinite(op?.start) && op.start >= 0
      ? Math.floor(op.start)
      : Number.isFinite(op?.pos) && op.pos >= 0
        ? Math.floor(op.pos)
        : -1;
  if (opStart < 0) return false;
  if (op.kind === "insert") {
    return Math.abs(opStart - mappedHint) <= driftTolerance;
  }
  if (op.kind === "delete") {
    if (Math.abs(opStart - mappedHint) <= driftTolerance) return true;
    return hasCommaNearMappedHint(snapshotText, mappedHint, 1);
  }
  return true;
}

function buildParagraphOperationsPlan(snapshotText, sourceText, suggestions, options = {}) {
  const deterministicMode =
    typeof options?.deterministicMode === "boolean"
      ? options.deterministicMode
      : isDeterministicMappingV2Enabled();
  const setDeterministicSkipReason = (suggestion, reason) => {
    if (!deterministicMode) return;
    if (!suggestion || typeof suggestion !== "object") return;
    const meta =
      suggestion.meta && typeof suggestion.meta === "object"
        ? suggestion.meta
        : (suggestion.meta = {});
    meta.deterministicSkipReason = reason;
  };
  const clearDeterministicSkipReason = (suggestion) => {
    if (!deterministicMode) return;
    if (!suggestion || typeof suggestion !== "object") return;
    const meta = suggestion.meta;
    if (!meta || typeof meta !== "object") return;
    if (Object.prototype.hasOwnProperty.call(meta, "deterministicSkipReason")) {
      delete meta.deterministicSkipReason;
    }
  };
  const resolveInsertOperation = options?.resolveInsertOperation || resolveInsertOperationFromSnapshot;
  const resolveDeleteOperation = options?.resolveDeleteOperation || resolveDeleteOperationFromSnapshot;
  const rawPlan = [];
  const skipped = [];
  const noop = [];

  for (const suggestion of suggestions) {
    if (deterministicMode) {
      const deterministicConfidence = resolveDeterministicConfidenceLevel(suggestion);
      if (deterministicConfidence !== "high") {
        traceQuoteSuggestion("planner.skip", suggestion, {
          reason: "deterministic_low_confidence",
          deterministicConfidence,
        });
        setDeterministicSkipReason(suggestion, "deterministic_low_confidence");
        skipped.push({
          suggestion,
          reason: "deterministic_low_confidence",
        });
        continue;
      }
    }
    let opResult = { op: null, skipReason: "planner_unknown" };
    if (suggestion?.kind === "delete") {
      opResult = resolveDeleteOperation(snapshotText, sourceText, suggestion);
    } else {
      opResult = resolveInsertOperation(snapshotText, sourceText, suggestion);
    }
    const op = opResult?.op ?? null;
    traceQuoteSuggestion("planner.resolve", suggestion, {
      opKind: op?.kind || null,
      opStart: Number.isFinite(op?.start) ? op.start : null,
      opEnd: Number.isFinite(op?.end) ? op.end : null,
      opReplacement: typeof op?.replacement === "string" ? op.replacement : null,
      skipReason: opResult?.skipReason || null,
    });

    if (!op) {
      if (deterministicMode) {
        setDeterministicSkipReason(suggestion, opResult?.skipReason || "planner_unresolved");
      }
      skipped.push({
        suggestion,
        reason: opResult?.skipReason || "planner_unresolved",
      });
      continue;
    }
    clearDeterministicSkipReason(suggestion);
    if (op.kind === "noop") {
      traceQuoteSuggestion("planner.noop", suggestion, {
        reason: "resolved_noop",
      });
      noop.push(suggestion);
      continue;
    }
    if (deterministicMode && !isDeterministicOpStable(snapshotText, sourceText, suggestion, op)) {
      traceQuoteSuggestion("planner.skip", suggestion, {
        reason: "deterministic_mapping_drift",
        opKind: op?.kind || null,
      });
      setDeterministicSkipReason(suggestion, "deterministic_mapping_drift");
      skipped.push({
        suggestion,
        reason: "deterministic_mapping_drift",
      });
      continue;
    }
    rawPlan.push({
      ...op,
      suggestions: [suggestion],
      sortPos: getSuggestionSortPos(suggestion),
    });
  }

  // Apply comma relocation suggestions atomically: if delete/insert counterpart is missing,
  // skip the planned side to avoid creating duplicated comma around quotes.
  if (suggestions.length > 1 && rawPlan.length) {
    const droppedPlanIndexes = new Set();
    const skippedSuggestions = new Set(skipped.map((item) => item?.suggestion).filter(Boolean));
    const noopSuggestions = new Set(noop);
    for (let i = 0; i < rawPlan.length; i++) {
      const plannedSuggestion = rawPlan[i]?.suggestions?.[0];
      if (!plannedSuggestion) continue;
      const hasPairCandidateInInput = suggestions.some((candidate) =>
        isSameCommaRelocationPair(plannedSuggestion, candidate)
      );
      if (!hasPairCandidateInInput) continue;
      const hasPairedPlannedOperation = rawPlan.some((candidatePlan, candidateIndex) => {
        if (candidateIndex === i) return false;
        const candidateSuggestion = candidatePlan?.suggestions?.[0];
        return isSameCommaRelocationPair(plannedSuggestion, candidateSuggestion);
      });
      if (hasPairedPlannedOperation) continue;
      droppedPlanIndexes.add(i);
      traceQuoteSuggestion("planner.drop_unpaired_relocation", plannedSuggestion, {
        reason: "paired_relocation_counterpart_unresolved",
      });
      if (!skippedSuggestions.has(plannedSuggestion) && !noopSuggestions.has(plannedSuggestion)) {
        skipped.push({
          suggestion: plannedSuggestion,
          reason: "paired_relocation_counterpart_unresolved",
        });
        skippedSuggestions.add(plannedSuggestion);
      }
    }
    if (droppedPlanIndexes.size) {
      const keptPlan = [];
      for (let i = 0; i < rawPlan.length; i++) {
        if (!droppedPlanIndexes.has(i)) {
          keptPlan.push(rawPlan[i]);
        }
      }
      rawPlan.length = 0;
      rawPlan.push(...keptPlan);
    }
  }

  // Hard dedupe for repeated insert ops landing on the same boundary.
  // During unstable API/retry flows we can occasionally receive duplicate
  // inserts for identical target gaps; keep only one planned op and merge
  // backing suggestions for traceability.
  if (rawPlan.length > 1) {
    const dedupedRawPlan = [];
    const insertKeyToIndex = new Map();
    for (const entry of rawPlan) {
      if (!entry || entry.kind !== "insert") {
        dedupedRawPlan.push(entry);
        continue;
      }
      const key = `${entry.start}:${entry.end}:${entry.replacement || ""}`;
      const existingIndex = insertKeyToIndex.get(key);
      if (typeof existingIndex === "number") {
        const existing = dedupedRawPlan[existingIndex];
        const existingSuggestions = Array.isArray(existing?.suggestions) ? existing.suggestions : [];
        const incomingSuggestions = Array.isArray(entry?.suggestions) ? entry.suggestions : [];
        dedupedRawPlan[existingIndex] = {
          ...existing,
          suggestions: [...existingSuggestions, ...incomingSuggestions],
          sortPos: Math.max(existing?.sortPos ?? 0, entry?.sortPos ?? 0),
        };
        continue;
      }
      insertKeyToIndex.set(key, dedupedRawPlan.length);
      dedupedRawPlan.push(entry);
    }
    rawPlan.length = 0;
    rawPlan.push(...dedupedRawPlan);
  }

  rawPlan.sort((a, b) => {
    if (a.start !== b.start) return b.start - a.start;
    if (a.kind !== b.kind) return a.kind === "delete" ? -1 : 1;
    return b.sortPos - a.sortPos;
  });

  const consumed = new Set();
  const plan = [];
  for (let i = 0; i < rawPlan.length; i++) {
    if (consumed.has(i)) continue;
    const current = rawPlan[i];

    // Drop redundant inserts only when comma is already exactly at the insertion gap.
    if (current.kind === "insert") {
      const segment = snapshotText.slice(current.start, current.end);
      if (segment === current.replacement) {
        noop.push(...current.suggestions);
        continue;
      }
      if (current.replacement.startsWith(",")) {
        const segmentIsCommaGap = /^\s*,\s*$/.test(segment);
        let left = current.start - 1;
        while (left >= 0 && /\s/.test(snapshotText[left])) left--;
        let right = current.end;
        while (right < snapshotText.length && /\s/.test(snapshotText[right])) right++;
        const leftChar = left >= 0 ? snapshotText[left] : "";
        const rightChar = right < snapshotText.length ? snapshotText[right] : "";
        const segmentHasOnlyWhitespace = !/[^\s]/.test(segment);
        if (segmentIsCommaGap || (segmentHasOnlyWhitespace && (leftChar === "," || rightChar === ","))) {
          noop.push(...current.suggestions);
          continue;
        }
      }
    }

    // Coalesce local delete+insert into a single replace to avoid visual "double comma then delete".
    if (current.kind === "delete") {
      const deletePos = current.start;
      let merged = false;
      for (let j = i + 1; j < rawPlan.length; j++) {
        if (consumed.has(j)) continue;
        const candidate = rawPlan[j];
        if (candidate.kind !== "insert") continue;
        if (Math.abs(candidate.start - deletePos) > 1) continue;
        if (!candidate.replacement.startsWith(",")) continue;
        const start = Math.min(current.start, candidate.start);
        const end = Math.max(current.end, candidate.end);
        const mergeSegment = snapshotText.slice(start, end);
        // Do not coalesce across whitespace; replacing mixed spans can drop spaces in tracked mode.
        if (/\s/.test(mergeSegment)) continue;
        plan.push({
          kind: "replace",
          start,
          end,
          replacement: ",",
          snippet: mergeSegment || ",",
          suggestions: [...current.suggestions, ...candidate.suggestions],
          sortPos: Math.max(current.sortPos, candidate.sortPos),
        });
        consumed.add(j);
        merged = true;
        break;
      }
      if (merged) continue;
    }

    plan.push(current);
  }

  if (isQuoteTraceEnabled()) {
    const quoteSuggestions = (suggestions || []).filter((suggestion) => suggestionTouchesQuoteBoundary(suggestion));
    if (quoteSuggestions.length) {
      log("[QUOTE TRACE]", "planner.summary", {
        quoteSuggestions: quoteSuggestions.map((suggestion) => suggestion?.id ?? null),
        rawPlanCount: rawPlan.length,
        planCount: plan.length,
        skippedCount: skipped.length,
        noopCount: noop.length,
      });
    }
  }

  return { plan, skipped, noop };
}

function summarizeSkippedReasons(skipped = []) {
  const summary = {};
  for (const item of skipped) {
    const reason = item?.reason || "planner_unresolved";
    summary[reason] = (summary[reason] || 0) + 1;
  }
  return summary;
}

function countDeterministicSkippedReasons(skipped = []) {
  return skipped.reduce((total, item) => {
    const reason = item?.reason;
    if (typeof reason === "string" && reason.startsWith("deterministic_")) {
      return total + 1;
    }
    return total;
  }, 0);
}

function buildSkippedSuggestionLogEntry(skippedItem, sourceText = "") {
  const suggestion = skippedItem?.suggestion || {};
  const meta = suggestion?.meta?.anchor || {};
  const hintStart =
    suggestion?.charHint?.start ??
    meta?.charStart ??
    meta?.sourceTokenAt?.charStart ??
    meta?.sourceTokenBefore?.charStart ??
    meta?.sourceTokenAfter?.charStart ??
    -1;
  const start = Number.isFinite(hintStart) ? Math.max(0, hintStart) : -1;
  const from = start >= 0 ? Math.max(0, start - 24) : 0;
  const to = start >= 0 ? Math.min(sourceText.length, start + 40) : Math.min(sourceText.length, 64);
  return {
    reason: skippedItem?.reason || "planner_unresolved",
    id: suggestion?.id ?? null,
    kind: suggestion?.kind ?? null,
    hintStart: start,
    preview: (sourceText || "").slice(from, to),
  };
}

function clipDesktopPreviewWindow(text, center, leftRadius = 28, rightRadius = 40) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText.length) return "";
  const safeCenter = Number.isFinite(center) ? Math.max(0, Math.min(safeText.length, Math.floor(center))) : 0;
  const from = Math.max(0, safeCenter - Math.max(0, leftRadius));
  const to = Math.min(safeText.length, safeCenter + Math.max(0, rightRadius));
  return safeText.slice(from, to);
}

function buildDesktopSuggestionLogEntry(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const opMeta = suggestion?.meta?.op || {};
  const anchor = suggestion?.meta?.anchor || {};
  const traceId =
    typeof opMeta?.traceId === "string" && opMeta.traceId.trim()
      ? opMeta.traceId.trim()
      : null;
  return {
    id: suggestion?.id ?? null,
    kind: suggestion?.kind ?? null,
    traceId,
    paragraphIndex: Number.isFinite(suggestion?.paragraphIndex) ? suggestion.paragraphIndex : null,
    charHintStart: Number.isFinite(suggestion?.charHint?.start) ? suggestion.charHint.start : null,
    charHintEnd: Number.isFinite(suggestion?.charHint?.end) ? suggestion.charHint.end : null,
    opOriginalPos: Number.isFinite(opMeta?.originalPos) ? opMeta.originalPos : null,
    opCorrectedPos: Number.isFinite(opMeta?.correctedPos) ? opMeta.correctedPos : null,
    opPos: Number.isFinite(opMeta?.pos) ? opMeta.pos : null,
    quoteIntent: resolveSuggestionQuoteBoundaryIntent(suggestion, opMeta) || null,
    quoteIntentSource: opMeta?.explicitQuoteIntentSource || null,
    highlightText:
      typeof anchor?.highlightText === "string"
        ? anchor.highlightText
        : typeof suggestion?.meta?.highlightText === "string"
          ? suggestion.meta.highlightText
          : null,
    sourceTokenBefore: anchor?.sourceTokenBefore?.tokenText || null,
    sourceTokenAfter: anchor?.sourceTokenAfter?.tokenText || null,
  };
}

function buildDesktopOperationLogEntry(op, planText = "", sourceText = "") {
  if (!op || typeof op !== "object") return null;
  const opStart = Number.isFinite(op?.start) ? op.start : Number.isFinite(op?.pos) ? op.pos : null;
  const opEnd = Number.isFinite(op?.end) ? op.end : opStart;
  const opSnippet =
    typeof op?.snippet === "string" && op.snippet.length
      ? op.snippet
      : Number.isFinite(opStart) && Number.isFinite(opEnd)
        ? (planText || "").slice(Math.max(0, opStart), Math.max(0, opEnd))
        : "";
  const sourceHint = firstFiniteValue([
    op?.boundary?.sourceBoundaryPos,
    op?.boundary?.sourceBoundaryStart,
    op?.boundary?.sourceBoundaryEnd,
    op?.boundary?.resolvedPos,
    op?.boundary?.requestedPos,
    op?.suggestions?.[0]?.meta?.op?.originalPos,
    op?.suggestions?.[0]?.charHint?.start,
    opStart,
  ]);
  return {
    kind: op?.kind || null,
    start: Number.isFinite(opStart) ? opStart : null,
    end: Number.isFinite(opEnd) ? opEnd : null,
    replacement: typeof op?.replacement === "string" ? op.replacement : null,
    insertLocation: op?.insertLocation ?? null,
    snippet: opSnippet || null,
    preview: clipDesktopPreviewWindow(planText, opStart),
    sourcePreview: clipDesktopPreviewWindow(sourceText, sourceHint),
    boundary: op?.boundary
      ? {
          sourceBoundaryPos: Number.isFinite(op.boundary?.sourceBoundaryPos)
            ? op.boundary.sourceBoundaryPos
            : null,
          sourceBoundaryStart: Number.isFinite(op.boundary?.sourceBoundaryStart)
            ? op.boundary.sourceBoundaryStart
            : null,
          sourceBoundaryEnd: Number.isFinite(op.boundary?.sourceBoundaryEnd)
            ? op.boundary.sourceBoundaryEnd
            : null,
          targetBoundaryPos: Number.isFinite(op.boundary?.targetBoundaryPos)
            ? op.boundary.targetBoundaryPos
            : null,
          beforeToken: op.boundary?.beforeToken?.tokenText || null,
          afterToken: op.boundary?.afterToken?.tokenText || null,
          leftContext:
            typeof op.boundary?.leftContext === "string" ? op.boundary.leftContext.slice(-24) : null,
          rightContext:
            typeof op.boundary?.rightContext === "string"
              ? op.boundary.rightContext.slice(0, 24)
              : null,
        }
      : null,
    suggestions: (Array.isArray(op?.suggestions) ? op.suggestions : [])
      .map((suggestion) => buildDesktopSuggestionLogEntry(suggestion))
      .filter(Boolean),
  };
}

function normalizeInsertVerificationWindowText(text) {
  const canonical = canonicalizeWithBoundaryMap((text || "").replace(/,/gu, ""), getNormalizationProfile());
  return (canonical?.canonical || "").trim();
}

function isInsertSuggestionLocalContextIntact(liveText, sourceText, suggestion) {
  if (typeof liveText !== "string" || typeof sourceText !== "string" || !sourceText.length) return true;
  const meta = suggestion?.meta?.anchor || {};
  const boundaryMeta = meta?.boundaryMeta || {};
  const sourceCenter = firstFiniteValue([
    boundaryMeta?.sourceBoundaryPos,
    boundaryMeta?.sourceBoundaryStart,
    suggestion?.meta?.op?.originalPos,
    suggestion?.charHint?.start,
    meta?.charStart,
  ]);
  if (!Number.isFinite(sourceCenter) || sourceCenter < 0) return true;

  const radius = 24;
  const sourceStart = Math.max(0, Math.floor(sourceCenter) - radius);
  const sourceEnd = Math.min(sourceText.length, Math.floor(sourceCenter) + radius);
  const liveStart = mapIndexAcrossCanonical(sourceText, liveText, sourceStart, { allowEnd: true });
  const liveEnd = mapIndexAcrossCanonical(sourceText, liveText, sourceEnd, { allowEnd: true });
  if (!Number.isFinite(liveStart) || !Number.isFinite(liveEnd)) return true;

  const sourceWindow = sourceText.slice(sourceStart, sourceEnd);
  const liveWindow = liveText.slice(
    Math.max(0, Math.min(liveText.length, liveStart) - 2),
    Math.min(liveText.length, Math.max(liveStart, liveEnd) + 2)
  );
  return normalizeInsertVerificationWindowText(sourceWindow) === normalizeInsertVerificationWindowText(liveWindow);
}

function isInsertSuggestionBoundaryIntact(liveText, sourceText, suggestion) {
  const meta = suggestion?.meta?.anchor || {};
  const boundaryMeta = meta?.boundaryMeta || {};
  const beforeAnchor =
    boundaryMeta?.beforeToken ??
    meta?.sourceTokenBefore ??
    meta?.targetTokenBefore ??
    null;
  const afterAnchor =
    boundaryMeta?.afterToken ??
    meta?.sourceTokenAfter ??
    meta?.targetTokenAfter ??
    null;
  if (!beforeAnchor || !afterAnchor) return true;
  const beforeWord = getCleanWordTokenFromAnchor(beforeAnchor);
  const afterWord = getCleanWordTokenFromAnchor(afterAnchor);
  if (!beforeWord || !afterWord) {
    const mappedHint = resolveSuggestionMappedCharHint(liveText, sourceText, suggestion);
    if (!Number.isFinite(mappedHint) || mappedHint < 0 || mappedHint > liveText.length) {
      return true;
    }
    const hintRadius = suggestion?.meta?.lemmaAnchorAuthoritative ? 5 : 4;
    return hasCommaNearMappedHint(liveText, mappedHint, hintRadius);
  }

  const preferredGapHint = firstFiniteValue([
    boundaryMeta?.sourceBoundaryPos,
    boundaryMeta?.sourceBoundaryStart,
    suggestion?.meta?.op?.originalPos,
    suggestion?.charHint?.start,
    meta?.charStart,
  ]);
  return Boolean(
    resolveTokenPairMatchInText(liveText, sourceText, suggestion, beforeAnchor, afterAnchor, {
      beforeHintIndex: boundaryMeta?.sourceBoundaryStart,
      afterHintIndex: boundaryMeta?.sourceBoundaryEnd,
      preferredGapHintIndex: preferredGapHint,
      allowQuoteGap: true,
      allowCommaInGap: true,
    })
  );
}

function verifyInsertSuggestionAppliedSafely(liveText, sourceText, suggestion) {
  return (
    isInsertSuggestionBoundaryIntact(liveText, sourceText, suggestion) &&
    isInsertSuggestionLocalContextIntact(liveText, sourceText, suggestion)
  );
}

function isSuggestionAppliedInLiveText(liveText, sourceText, suggestion, options = {}) {
  const verifyResult = buildParagraphOperationsPlan(liveText, sourceText, [suggestion], options);
  if (verifyResult.noop.length > 0) {
    if (suggestion?.kind === "insert") {
      return verifyInsertSuggestionAppliedSafely(liveText, sourceText, suggestion);
    }
    return true;
  }
  const mappedHint = resolveSuggestionMappedCharHint(liveText, sourceText, suggestion);
  const hintRadius = suggestion?.meta?.lemmaAnchorAuthoritative ? 5 : 4;
  const resolveDeleteOperation = options?.resolveDeleteOperation || resolveDeleteOperationFromSnapshot;
  const resolveInsertOperation = options?.resolveInsertOperation || resolveInsertOperationFromSnapshot;
  if (suggestion?.kind === "delete") {
    const resolved = resolveDeleteOperation(
      liveText,
      sourceText,
      suggestion
    );
    if (!resolved?.op && resolved?.skipReason === "delete_comma_not_found_near_hint") {
      if (!Number.isFinite(mappedHint) || mappedHint < 0) return false;
      return !hasCommaNearMappedHint(liveText, mappedHint, hintRadius);
    }
    return false;
  }
  if (suggestion?.kind === "insert") {
    const resolved = resolveInsertOperation(
      liveText,
      sourceText,
      suggestion
    );
    if (resolved?.op?.kind === "insert") {
      if (Number.isFinite(mappedHint) && mappedHint >= 0) {
        if (
          hasCommaNearMappedHint(liveText, mappedHint, hintRadius) &&
          verifyInsertSuggestionAppliedSafely(liveText, sourceText, suggestion)
        ) {
          return true;
        }
      }
    }
    const allowFallbackForReason =
      resolved?.skipReason === "insert_before_anchor_lookup_failed" ||
      resolved?.skipReason === "insert_after_anchor_requires_before_pair" ||
      resolved?.skipReason === "insert_after_anchor_lookup_failed" ||
      resolved?.skipReason === "insert_before_after_order_invalid" ||
      resolved?.skipReason === "insert_gap_contains_nonspace_content" ||
      resolved?.skipReason === "insert_anchor_token_unresolved";
    if (!resolved?.op && allowFallbackForReason) {
      if (!Number.isFinite(mappedHint) || mappedHint < 0) return false;
      return (
        hasCommaNearMappedHint(liveText, mappedHint, hintRadius) &&
        verifyInsertSuggestionAppliedSafely(liveText, sourceText, suggestion)
      );
    }
  }
  return false;
}

async function revertAppliedSuggestionInParagraph(context, paragraph, suggestion) {
  if (!suggestion || !paragraph) return false;
  if (suggestion.kind === "insert") {
    const meta = suggestion?.meta?.anchor || {};
    const boundaryMeta = meta?.boundaryMeta || {};
    if (typeof paragraph.text !== "string") {
      paragraph.load("text");
      await context.sync();
    }
    const liveText = paragraph.text || "";
    const correctedText =
      suggestion?.meta?.correctedText ??
      anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex)?.correctedText ??
      liveText;
    const candidateHints = [
      boundaryMeta?.targetCommaPos,
      boundaryMeta?.targetBoundaryPos,
      suggestion?.charHint?.start,
      meta?.targetCharStart,
      suggestion?.meta?.op?.correctedPos,
      suggestion?.meta?.op?.pos,
    ]
      .filter((value) => Number.isFinite(value) && value >= 0)
      .filter((value, index, arr) => arr.indexOf(value) === index);
    for (const targetHint of candidateHints) {
      const mappedHint =
        typeof correctedText === "string" && correctedText.length
          ? mapIndexAcrossCanonical(correctedText, liveText, targetHint, { allowEnd: true })
          : targetHint;
      if (!Number.isFinite(mappedHint) || mappedHint < 0) continue;
      const commaIndex = findCommaIndexNearMappedHint(liveText, mappedHint, 4);
      if (commaIndex < 0) continue;
      const exactCommaRange = await findExactSnippetRangeNearIndex(
        context,
        paragraph,
        liveText,
        ",",
        commaIndex,
        "revert-insert-target"
      );
      if (exactCommaRange) {
        exactCommaRange.insertText("", Word.InsertLocation.replace);
        return true;
      }
      const deleteRegion = await findReplaceableRegionRangeNearIndex(
        context,
        paragraph,
        liveText,
        commaIndex,
        commaIndex + 1,
        "revert-insert-target-region"
      );
      if (deleteRegion) {
        deleteRegion.range.insertText(`${deleteRegion.prefix}${deleteRegion.suffix}`, Word.InsertLocation.replace);
        return true;
      }
    }
    return applyDeleteSuggestion(context, paragraph, suggestion);
  }
  if (suggestion.kind === "delete") {
    return applyInsertSuggestion(context, paragraph, suggestion);
  }
  return false;
}

export async function applySuggestionOnlineById(suggestionId = null) {
  const startedAt = tnow();
  const summary = {
    status: "noop",
    reason: null,
    restored: 0,
    pendingBefore: 0,
    targetSuggestionId: null,
    appliedSuggestions: 0,
    skippedSuggestions: 0,
    failedSuggestions: 0,
    skippedUnresolvable: 0,
    clearedMarkers: 0,
    touchedParagraphs: 0,
    pendingAfter: 0,
    durationMs: 0,
  };
  const finalize = (status, reason = null) => {
    summary.status = status;
    summary.reason = reason;
    summary.pendingAfter = pendingSuggestionsOnline.length;
    summary.durationMs = Math.round(tnow() - startedAt);
    return summary;
  };

  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`applySuggestionOnlineById: restored ${restored} pending suggestions from storage`);
    }
  }
  if (pendingSuggestionsOnline.length) {
    // Do not force global stale pruning in one-by-one flow.
    // A single accepted/rejected comma changes the paragraph hash and can
    // incorrectly invalidate other still-actionable suggestions in that paragraph.
    const staleSummary = await pruneStalePendingSuggestionsAgainstLiveDocument();
    if (staleSummary.removed > 0) {
      log("applySuggestionOnlineById: pruned stale pending suggestions", staleSummary);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    return finalize("noop", "no-pending-suggestions");
  }

  const targetIndexRaw =
    suggestionId === null || typeof suggestionId === "undefined"
      ? 0
      : findPendingSuggestionIndexById(suggestionId);
  if (targetIndexRaw < 0) {
    return finalize("noop", "suggestion-not-found");
  }
  const targetSuggestion = pendingSuggestionsOnline[targetIndexRaw];
  if (!targetSuggestion) {
    return finalize("noop", "suggestion-not-found");
  }
  summary.targetSuggestionId = targetSuggestion.id ?? null;
  const selectedSuggestions = collectRelocationPairSuggestions(
    targetSuggestion,
    pendingSuggestionsOnline
  );

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("PoÄakajte, da se pregled dokumenta zakljuÄi, nato poskusite znova.", "warn");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  const actionToken = beginAction(ACTION_TYPE_APPLY);
  if (!actionToken) {
    return finalize("deferred", "action-in-progress");
  }
  let suggestionResolvedAsNoop = false;
  let paragraphBaselineSourceText = "";
  let paragraphLiveTextAfterApply = "";
  let paragraphBaselineDocumentOffset = 0;
  let actionableSelectedSuggestions = [];
  let noopSelectedSuggestions = [];
  try {
    await Word.run(async (context) => {
      const paragraphIndex = targetSuggestion?.paragraphIndex;
      if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) {
        summary.failedSuggestions = 1;
        return;
      }
      const paras = await wordOnlineAdapter.getParagraphs(context);
      const paragraph = paras.items[paragraphIndex];
      if (!paragraph) {
        summary.failedSuggestions = 1;
        return;
      }

      const entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
      const snapshotText = paragraph.text || "";
      const sourceText = entry?.originalText ?? snapshotText;
      const oneByOnePlanOptions = {
        deterministicMode: false,
      };
      paragraphBaselineSourceText = sourceText;
      paragraphBaselineDocumentOffset = Number.isFinite(entry?.documentOffset)
        ? entry.documentOffset
        : 0;
      const { plan, skipped, noop } = buildParagraphOperationsPlan(
        snapshotText,
        sourceText,
        selectedSuggestions,
        oneByOnePlanOptions
      );
      const actionableSuggestions = [];
      const actionableSuggestionSet = new Set();
      noopSelectedSuggestions = [...noop];
      for (const item of noopSelectedSuggestions) {
        if (!item || actionableSuggestionSet.has(item)) continue;
        actionableSuggestionSet.add(item);
        actionableSuggestions.push(item);
      }
      for (const op of plan) {
        for (const item of op?.suggestions || []) {
          if (!item || actionableSuggestionSet.has(item)) continue;
          actionableSuggestionSet.add(item);
          actionableSuggestions.push(item);
        }
      }
      actionableSelectedSuggestions = actionableSuggestions;

      summary.skippedSuggestions += skipped.length + noop.length;
      suggestionResolvedAsNoop =
        actionableSuggestions.length > 0 &&
        actionableSuggestions.every((item) => noopSelectedSuggestions.includes(item));
      if (!plan.length) {
        if (!noop.length) {
          summary.failedSuggestions += skipped.length ? 0 : 1;
        }
        await context.sync();
        return;
      }

      const areSelectedSuggestionsApplied = async () => {
        paragraph.load("text");
        await context.sync();
        const liveText = paragraph.text || "";
        return actionableSuggestions.every((suggestion) =>
          isSuggestionAppliedInLiveText(
            liveText,
            sourceText,
            suggestion,
            oneByOnePlanOptions
          )
        );
      };

      const canUseMarkerFirstInsert =
        selectedSuggestions.length === 1 &&
        actionableSuggestions.length === 1 &&
        shouldUseMarkerFirstInsertApply(targetSuggestion, plan);
      if (canUseMarkerFirstInsert) {
        const markerApplyResult = await applySimpleInsertSuggestionViaMarker(context, targetSuggestion);
        if (markerApplyResult.applied) {
          const markerCleanupSummary = await clearOnlineSuggestionMarkers(
            context,
            selectedSuggestions.map((suggestion) => ({ suggestion, paragraph })),
            paras
          );
          summary.clearedMarkers =
            (markerCleanupSummary?.clearedByTagCount || 0) +
            (markerCleanupSummary?.clearedFallbackCount || 0);
          summary.touchedParagraphs = 1;
          const verifiedApplied = await areSelectedSuggestionsApplied();
          if (verifiedApplied) {
            summary.appliedSuggestions += actionableSuggestions.length || 1;
          } else {
            warn("applySuggestionOnlineById: marker-first insert not verified after apply", {
              suggestionId: targetSuggestion?.id ?? null,
              reason: markerApplyResult.reason,
            });
            summary.failedSuggestions += actionableSuggestions.length || 1;
          }
          paragraph.load("text");
          await context.sync();
          paragraphLiveTextAfterApply = paragraph.text || snapshotText;
          return;
        }
      }

      const markerCleanupSummary = await clearOnlineSuggestionMarkers(
        context,
        selectedSuggestions.map((suggestion) => ({ suggestion, paragraph })),
        paras
      );
      summary.clearedMarkers =
        (markerCleanupSummary?.clearedByTagCount || 0) +
        (markerCleanupSummary?.clearedFallbackCount || 0);

      const plannedRanges = await getRangesForPlannedOperations(
        context,
        paragraph,
        snapshotText,
        plan,
        "apply-single-suggestion"
      );
      const touchedIndexes = new Set();
      let plannedEditApplied = false;
      for (let opIndex = 0; opIndex < plan.length; opIndex++) {
        const op = plan[opIndex];
        const opSuggestionCount = Array.isArray(op?.suggestions) ? op.suggestions.length : 1;
        const range = plannedRanges[opIndex];
        if (!range) {
          if (op?.strictResolutionBlocked) {
            summary.skippedSuggestions += opSuggestionCount;
            continue;
          }
          summary.failedSuggestions += opSuggestionCount;
          continue;
        }
        try {
          const insertLocation =
            op?.insertLocation ??
            (op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace);
          range.insertText(op.replacement, insertLocation);
          plannedEditApplied = true;
          touchedIndexes.add(paragraphIndex);
        } catch (applyErr) {
          warn("applySuggestionOnlineById: failed planned op", applyErr);
          summary.failedSuggestions += opSuggestionCount;
        }
      }
      if (touchedIndexes.size > 0) {
        await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
          force: wordOnlineAdapter.shouldForceSpacingCleanup(),
        });
      }
      summary.touchedParagraphs = touchedIndexes.size;
      await context.sync();

      if (plannedEditApplied) {
        let verifiedApplied = await areSelectedSuggestionsApplied();
        if (!verifiedApplied) {
          let fallbackApplied = false;
          if (targetSuggestion?.kind === "delete") {
            fallbackApplied = await applyDeleteSuggestion(context, paragraph, targetSuggestion);
          }
          if (fallbackApplied) {
            await context.sync();
            verifiedApplied = await areSelectedSuggestionsApplied();
          }
        }
        if (verifiedApplied) {
          summary.appliedSuggestions += actionableSuggestions.length || 1;
          touchedIndexes.add(paragraphIndex);
        } else {
          const revertCandidates = [...actionableSuggestions].sort((left, right) => {
            const leftKind = left?.kind === "insert" ? 0 : left?.kind === "delete" ? 1 : 2;
            const rightKind = right?.kind === "insert" ? 0 : right?.kind === "delete" ? 1 : 2;
            return leftKind - rightKind;
          });
          let revertedAny = false;
          for (const suggestion of revertCandidates) {
            paragraph.load("text");
            await context.sync();
            const liveText = paragraph.text || "";
            if (!isSuggestionAppliedInLiveText(liveText, sourceText, suggestion, oneByOnePlanOptions)) {
              continue;
            }
            const reverted = await revertAppliedSuggestionInParagraph(context, paragraph, suggestion);
            if (reverted) {
              revertedAny = true;
            }
          }
          if (revertedAny) {
            await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
              force: wordOnlineAdapter.shouldForceSpacingCleanup(),
            });
            await context.sync();
          }
          warn("applySuggestionOnlineById: operation not verified after apply", {
            suggestionId: targetSuggestion?.id ?? null,
            kind: targetSuggestion?.kind ?? null,
          });
          summary.failedSuggestions += actionableSuggestions.length || 1;
        }

        paragraph.load("text");
        await context.sync();
        paragraphLiveTextAfterApply = paragraph.text || snapshotText;
      }
    });

    const removedParagraphIndexes = new Set();
    if (summary.appliedSuggestions > 0 || suggestionResolvedAsNoop) {
      const removableSuggestions =
        summary.appliedSuggestions > 0
          ? actionableSelectedSuggestions
          : noopSelectedSuggestions;
      const removedSuggestions = removePendingSuggestionsByReference(removableSuggestions, {
        persist: false,
      });
      for (const removed of removedSuggestions) {
        const paragraphIndex = removed?.paragraphIndex;
        if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
          removedParagraphIndexes.add(paragraphIndex);
        }
      }
      for (const paragraphIndex of removedParagraphIndexes) {
        clearOnlineParagraphRenderState(paragraphIndex);
        unstableOnlineParagraphBackoff.delete(paragraphIndex);
      }
      if (summary.appliedSuggestions > 0) {
        const paragraphIndex = targetSuggestion?.paragraphIndex;
        const reanchorSummary = refreshPendingSuggestionsForEditedParagraphBaseline({
          paragraphIndex,
          sourceText: paragraphBaselineSourceText,
          targetText: paragraphLiveTextAfterApply,
          documentOffset: paragraphBaselineDocumentOffset,
        });
        if (reanchorSummary.updatedSuggestions > 0) {
          log("applySuggestionOnlineById: refreshed paragraph baselines", reanchorSummary);
        }
      }
      persistPendingSuggestionsOnline();
      if (summary.appliedSuggestions > 0) {
        startPostApplyCheckCooldown();
        return finalize(summary.failedSuggestions > 0 ? "partial" : "applied");
      }
      return finalize("applied", "already-applied");
    }

    // Keep one-by-one flow moving forward: if this suggestion cannot be applied
    // (stale anchors / unresolved op), drop it from the pending queue.
    const removedSuggestions = removePendingSuggestionsByReference(selectedSuggestions, {
      persist: false,
    });
    summary.skippedUnresolvable = removedSuggestions.length || 1;
    for (const removed of removedSuggestions) {
      const paragraphIndex = removed?.paragraphIndex;
      if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
        clearOnlineParagraphRenderState(paragraphIndex);
        unstableOnlineParagraphBackoff.delete(paragraphIndex);
      }
    }
    if (!removedSuggestions.length) {
      const paragraphIndex = targetSuggestion?.paragraphIndex;
      if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
        clearOnlineParagraphRenderState(paragraphIndex);
        unstableOnlineParagraphBackoff.delete(paragraphIndex);
      }
    }
    persistPendingSuggestionsOnline();
    return finalize(
      summary.failedSuggestions > 0 ? "partial" : "noop",
      "suggestion-skipped-unresolvable"
    );
  } finally {
    finishAction(actionToken);
  }
}

export async function rejectSuggestionOnlineById(suggestionId = null) {
  const startedAt = tnow();
  const summary = {
    status: "noop",
    reason: null,
    restored: 0,
    pendingBefore: 0,
    targetSuggestionId: null,
    clearedMarkers: 0,
    failedClear: 0,
    rejectedSuggestions: 0,
    revertedAppliedSuggestions: 0,
    pendingAfter: 0,
    durationMs: 0,
  };
  const finalize = (status, reason = null) => {
    summary.status = status;
    summary.reason = reason;
    summary.pendingAfter = pendingSuggestionsOnline.length;
    summary.durationMs = Math.round(tnow() - startedAt);
    return summary;
  };

  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`rejectSuggestionOnlineById: restored ${restored} pending suggestions from storage`);
    }
  }
  if (pendingSuggestionsOnline.length) {
    // Do not force global stale pruning in one-by-one flow.
    // A single accepted/rejected comma changes the paragraph hash and can
    // incorrectly invalidate other still-actionable suggestions in that paragraph.
    const staleSummary = await pruneStalePendingSuggestionsAgainstLiveDocument();
    if (staleSummary.removed > 0) {
      log("rejectSuggestionOnlineById: pruned stale pending suggestions", staleSummary);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    return finalize("noop", "no-pending-suggestions");
  }

  const targetIndexRaw =
    suggestionId === null || typeof suggestionId === "undefined"
      ? 0
      : findPendingSuggestionIndexById(suggestionId);
  if (targetIndexRaw < 0) {
    return finalize("noop", "suggestion-not-found");
  }
  const targetSuggestion = pendingSuggestionsOnline[targetIndexRaw];
  if (!targetSuggestion) {
    return finalize("noop", "suggestion-not-found");
  }
  summary.targetSuggestionId = targetSuggestion.id ?? null;
  const selectedSuggestions = collectRelocationPairSuggestions(
    targetSuggestion,
    pendingSuggestionsOnline
  );

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("PoÄakajte, da se pregled dokumenta zakljuÄi, nato poskusite znova.", "warn");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  const actionToken = beginAction(ACTION_TYPE_REJECT);
  if (!actionToken) {
    return finalize("deferred", "action-in-progress");
  }
  let paragraphBaselineSourceText = "";
  let paragraphLiveTextAfterReject = "";
  let paragraphBaselineDocumentOffset = 0;
  try {
    await Word.run(async (context) => {
      const paragraphIndex = targetSuggestion?.paragraphIndex;
      const hasParagraphIndex = Number.isFinite(paragraphIndex) && paragraphIndex >= 0;
      const paras = await wordOnlineAdapter.getParagraphs(context);
      const paragraph = hasParagraphIndex ? paras.items[paragraphIndex] || null : null;
      const entry = hasParagraphIndex ? anchorProvider.getAnchorsForParagraph(paragraphIndex) : null;
      const sourceText = entry?.originalText ?? paragraph?.text ?? "";
      paragraphBaselineSourceText = sourceText;
      paragraphBaselineDocumentOffset = Number.isFinite(entry?.documentOffset)
        ? entry.documentOffset
        : 0;
      const clearResult = await wordOnlineAdapter.clearHighlights(
        context,
        selectedSuggestions.map((suggestion) => ({ suggestion, paragraph })),
        paras
      );
      summary.clearedMarkers =
        (clearResult?.clearedByTagCount || 0) + (clearResult?.clearedFallbackCount || 0);
      summary.failedClear = clearResult?.failedCount || 0;

      if (paragraph) {
        const revertCandidates = [...selectedSuggestions].sort((left, right) => {
          const leftKind = left?.kind === "insert" ? 0 : left?.kind === "delete" ? 1 : 2;
          const rightKind = right?.kind === "insert" ? 0 : right?.kind === "delete" ? 1 : 2;
          return leftKind - rightKind;
        });
        if (revertCandidates.length > 0) {
          const touchedIndexes = new Set();
          for (const suggestion of revertCandidates) {
            paragraph.load("text");
            await context.sync();
            const liveText = paragraph.text || "";
            if (!isSuggestionAppliedInLiveText(liveText, sourceText, suggestion)) {
              continue;
            }
            const reverted = await revertAppliedSuggestionInParagraph(context, paragraph, suggestion);
            if (reverted) {
              summary.revertedAppliedSuggestions += 1;
              touchedIndexes.add(paragraphIndex);
            }
          }
          if (touchedIndexes.size > 0) {
            await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
              force: wordOnlineAdapter.shouldForceSpacingCleanup(),
            });
          }
        }
      }

      if (paragraph && summary.revertedAppliedSuggestions > 0) {
        paragraph.load("text");
      }
      await context.sync();
      if (paragraph && summary.revertedAppliedSuggestions > 0) {
        paragraphLiveTextAfterReject = paragraph.text || sourceText;
      }
    });

    const removedSuggestions = removePendingSuggestionsByReference(selectedSuggestions, {
      persist: false,
    });
    summary.rejectedSuggestions = removedSuggestions.length || 1;
    if (removedSuggestions.length) {
      for (const removed of removedSuggestions) {
        const paragraphIndex = removed?.paragraphIndex;
        if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
          clearOnlineParagraphRenderState(paragraphIndex);
        }
      }
    } else {
      const paragraphIndex = targetSuggestion?.paragraphIndex;
      if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
        clearOnlineParagraphRenderState(paragraphIndex);
      }
    }
    if (summary.revertedAppliedSuggestions > 0) {
      const paragraphIndex = targetSuggestion?.paragraphIndex;
      const reanchorSummary = refreshPendingSuggestionsForEditedParagraphBaseline({
        paragraphIndex,
        sourceText: paragraphBaselineSourceText,
        targetText: paragraphLiveTextAfterReject,
        documentOffset: paragraphBaselineDocumentOffset,
      });
      if (reanchorSummary.updatedSuggestions > 0) {
        log("rejectSuggestionOnlineById: refreshed paragraph baselines", reanchorSummary);
      }
    }
    persistPendingSuggestionsOnline();
    if (summary.failedClear > 0) {
      return finalize(summary.clearedMarkers > 0 ? "partial" : "rejected", "some-marker-clear-failures");
    }
    return finalize("rejected");
  } finally {
    finishAction(actionToken);
  }
}

export async function applyAllSuggestionsOnline() {
  const startedAt = tnow();
  const summary = {
    status: "noop",
    reason: null,
    restored: 0,
    pendingBefore: 0,
    autoApply: 0,
    retainedForReview: 0,
    appliedSuggestions: 0,
    failedSuggestions: 0,
    skippedSuggestions: 0,
    clearedMarkers: 0,
    touchedParagraphs: 0,
    pendingAfter: 0,
    durationMs: 0,
  };
  const finalize = (status, reason = null) => {
    summary.status = status;
    summary.reason = reason;
    summary.pendingAfter = pendingSuggestionsOnline.length;
    summary.durationMs = Math.round(tnow() - startedAt);
    return summary;
  };

  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`applyAllSuggestionsOnline: restored ${restored} pending suggestions from storage`);
    }
  }
  if (pendingSuggestionsOnline.length) {
    const staleSummary = await pruneStalePendingSuggestionsAgainstLiveDocument({ force: true });
    if (staleSummary.removed > 0) {
      log("applyAllSuggestionsOnline: pruned stale pending suggestions", staleSummary);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    warn("applyAllSuggestionsOnline: no pending suggestions");
    return finalize("noop", "no-pending-suggestions");
  }

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("Po\u010dakajte, da se pregled dokumenta zaklju\u010di, nato poskusite znova.", "warn");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  const actionToken = beginAction(ACTION_TYPE_APPLY);
  if (!actionToken) {
    return finalize("deferred", "action-in-progress");
  }
  try {
  let autoApplySuggestions = [];
  let retainedSuggestions = [];
  for (const sug of pendingSuggestionsOnline) {
    if (isSuggestionAutoApplyEligibleOnline(sug)) {
      autoApplySuggestions.push(sug);
    } else {
      retainedSuggestions.push(sug);
    }
  }

  // Keep comma relocation pairs together (delete+insert). Applying only one side can create
  // double-comma drift around quotes (for example comma-before-quote + comma-after-quote).
  if (autoApplySuggestions.length && retainedSuggestions.length) {
    const promoted = new Set();
    for (const retained of retainedSuggestions) {
      const hasSelectedPair = autoApplySuggestions.some((selected) =>
        isSameCommaRelocationPair(selected, retained)
      );
      if (hasSelectedPair) {
        promoted.add(retained);
      }
    }
    if (promoted.size) {
      autoApplySuggestions = pendingSuggestionsOnline.filter(
        (sug) => isSuggestionAutoApplyEligibleOnline(sug) || promoted.has(sug)
      );
      retainedSuggestions = pendingSuggestionsOnline.filter(
        (sug) => !isSuggestionAutoApplyEligibleOnline(sug) && !promoted.has(sug)
      );
      log("applyAll promoted paired relocation suggestions", {
        promoted: promoted.size,
      });
    }
  }
  summary.autoApply = autoApplySuggestions.length;
  summary.retainedForReview = retainedSuggestions.length;
  log("applyAll confidence gate", {
    minLevel: ONLINE_ACCEPT_MIN_CONFIDENCE_LEVEL,
    totalPending: pendingSuggestionsOnline.length,
    autoApply: autoApplySuggestions.length,
    retainedForReview: retainedSuggestions.length,
  });
  if (retainedSuggestions.length) {
    const retainedByLevel = retainedSuggestions.reduce(
      (acc, sug) => {
        const level = getSuggestionConfidenceLevel(sug);
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
    log("applyAll retained by confidence", retainedByLevel);
    const retainedDetails = retainedSuggestions
      .slice(0, 50)
      .map((sug) => toConfidenceLogEntry(sug));
    log("applyAll retained details (first 50)", retainedDetails);
  }
  if (!autoApplySuggestions.length) {
    warn("applyAllSuggestionsOnline: no eligible suggestions after confidence gate");
    return finalize("noop", "no-eligible-suggestions");
  }
  const suggestionsByParagraph = new Map();
  for (const sug of autoApplySuggestions) {
    if (typeof sug?.paragraphIndex !== "number" || sug.paragraphIndex < 0) continue;
    if (!suggestionsByParagraph.has(sug.paragraphIndex)) {
      suggestionsByParagraph.set(sug.paragraphIndex, []);
    }
    suggestionsByParagraph.get(sug.paragraphIndex).push(sug);
  }
  if (!suggestionsByParagraph.size) return finalize("noop", "no-valid-paragraphs");
  await Word.run(async (context) => {
    const paras = await wordOnlineAdapter.getParagraphs(context);
    const touchedIndexes = new Set();
    const failedSuggestions = [];
    for (const [paragraphIndex, suggestions] of suggestionsByParagraph.entries()) {
      const paragraph = paras.items[paragraphIndex];
      if (!paragraph) {
        failedSuggestions.push(...suggestions);
        summary.failedSuggestions += suggestions.length;
        continue;
      }
      const markerCleanupSummary = await clearOnlineSuggestionMarkers(
        context,
        suggestions.map((suggestion) => ({ suggestion, paragraph }))
      );
      const directlyClearedMarkers =
        (markerCleanupSummary?.clearedByTagCount || 0) +
        (markerCleanupSummary?.clearedFallbackCount || 0);
      summary.clearedMarkers += directlyClearedMarkers;
      summary.failedSuggestions += markerCleanupSummary?.failedCount || 0;
      const entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
      const snapshotText = paragraph.text || "";
      const sourceText = entry?.originalText ?? snapshotText;
      const { plan, skipped, noop } = buildParagraphOperationsPlan(snapshotText, sourceText, suggestions);
      log("applyAll plan", {
        paragraphIndex,
        total: suggestions.length,
        planned: plan.length,
        skipped: skipped.length,
        noop: noop.length,
        skippedByReason: summarizeSkippedReasons(skipped),
      });
      if (skipped.length) {
        summary.skippedSuggestions += skipped.length;
        const skippedDetails = skipped
          .slice(0, 10)
          .map((item) => buildSkippedSuggestionLogEntry(item, sourceText));
        log(
          "applyAll skipped details",
          skippedDetails
        );
        log("applyAll skipped details json", JSON.stringify(skippedDetails));
        if (typeof window !== "undefined") {
          window.__VEJICE_LAST_APPLYALL_SKIPPED__ = skippedDetails;
        }
      }
      summary.skippedSuggestions += noop.length;

      let anyApplied = false;
      let appliedCount = 0;
      let applyFailedCount = 0;
      const plannedRanges = await getRangesForPlannedOperations(
        context,
        paragraph,
        snapshotText,
        plan,
        "apply-all-batch"
      );
      if (directlyClearedMarkers > 0) {
        log("applyAll marker cleanup", {
          paragraphIndex,
          directClearedMarkers: directlyClearedMarkers,
        });
      }
      for (let opIndex = 0; opIndex < plan.length; opIndex++) {
        const op = plan[opIndex];
        const opSuggestionCount = Array.isArray(op?.suggestions) ? op.suggestions.length : 1;
        const range = plannedRanges[opIndex];
        if (!range) {
          if (op?.strictResolutionBlocked) {
            summary.skippedSuggestions += opSuggestionCount;
            continue;
          }
          failedSuggestions.push(...op.suggestions);
          summary.failedSuggestions += opSuggestionCount;
          applyFailedCount++;
          continue;
        }
        try {
          const insertLocation =
            op?.insertLocation ??
            (op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace);
          range.insertText(op.replacement, insertLocation);
          anyApplied = true;
          summary.appliedSuggestions += opSuggestionCount;
          appliedCount++;
        } catch (applyErr) {
          warn("applyAllSuggestionsOnline: failed planned op", applyErr);
          failedSuggestions.push(...op.suggestions);
          summary.failedSuggestions += opSuggestionCount;
          applyFailedCount++;
        }
      }
      log("applyAll result", { paragraphIndex, appliedCount, applyFailedCount });
      if (anyApplied) {
        touchedIndexes.add(paragraphIndex);
      }
    }
    // Highlights are already cleared before text edits in this apply-all flow.
    // A second metadata-based clear pass can fail on shifted ranges in Word Online.
    // Skip post-apply clear to avoid invalid-range RichApi failures.
    await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes, {
      force: wordOnlineAdapter.shouldForceSpacingCleanup(),
    });
    summary.touchedParagraphs = touchedIndexes.size;
    for (const idx of touchedIndexes) {
      anchorProvider.deleteAnchors(idx);
      clearOnlineParagraphRenderState(idx);
      unstableOnlineParagraphBackoff.delete(idx);
    }
    const droppedRetainedFromTouchedParagraphs = [];
    const canRetainSuggestion = (suggestion) => {
      const paragraphIndex = suggestion?.paragraphIndex;
      if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) return true;
      if (!touchedIndexes.has(paragraphIndex)) return true;
      droppedRetainedFromTouchedParagraphs.push(suggestion);
      return false;
    };
    pendingSuggestionsOnline.length = 0;
    pendingSuggestionRenderKeys.clear();
    for (const suggestion of retainedSuggestions) {
      if (canRetainSuggestion(suggestion)) {
        addPendingSuggestionOnline(suggestion, { persist: false });
      }
    }
    for (const suggestion of failedSuggestions) {
      if (canRetainSuggestion(suggestion)) {
        addPendingSuggestionOnline(suggestion, { persist: false });
      }
    }
    if (droppedRetainedFromTouchedParagraphs.length) {
      const droppedEntries = droppedRetainedFromTouchedParagraphs.map((suggestion) => {
        const paragraphIndex = suggestion?.paragraphIndex;
        const paragraph =
          Number.isFinite(paragraphIndex) && paragraphIndex >= 0 ? paras.items[paragraphIndex] || null : null;
        return { suggestion, paragraph };
      });
      const droppedCleanupSummary = await clearOnlineSuggestionMarkers(context, droppedEntries, paras);
      summary.clearedMarkers +=
        (droppedCleanupSummary?.clearedByTagCount || 0) + (droppedCleanupSummary?.clearedFallbackCount || 0);
      summary.failedSuggestions += droppedCleanupSummary?.failedCount || 0;
      log("applyAll pruned retained suggestions from touched paragraphs", {
        dropped: droppedRetainedFromTouchedParagraphs.length,
      });
    }
    persistPendingSuggestionsOnline();
    if (pendingSuggestionsOnline.length) {
      log("applyAll final pending by confidence reason", {
        totalPending: pendingSuggestionsOnline.length,
        byReason: buildReasonIdSummary(pendingSuggestionsOnline),
      });
    } else {
      log("applyAll final pending by confidence reason", {
        totalPending: 0,
        byReason: {},
      });
    }
    await context.sync();
  });
  if (summary.appliedSuggestions > 0 && summary.failedSuggestions === 0) {
    startPostApplyCheckCooldown();
    return finalize("applied");
  }
  if (summary.appliedSuggestions > 0 || summary.failedSuggestions > 0) {
    if (summary.appliedSuggestions > 0) {
      startPostApplyCheckCooldown();
    }
    return finalize("partial", summary.failedSuggestions > 0 ? "some-operations-failed" : null);
  }
  return finalize("noop", "no-effective-operations");
  } finally {
    finishAction(actionToken);
  }
}

export async function rejectAllSuggestionsOnline() {
  const startedAt = tnow();
  const summary = {
    status: "noop",
    reason: null,
    restored: 0,
    pendingBefore: 0,
    clearedMarkers: 0,
    failedClear: 0,
    revertedAppliedSuggestions: 0,
    pendingAfter: 0,
    durationMs: 0,
  };
  const finalize = (status, reason = null) => {
    summary.status = status;
    summary.reason = reason;
    summary.pendingAfter = pendingSuggestionsOnline.length;
    summary.durationMs = Math.round(tnow() - startedAt);
    return summary;
  };

  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`rejectAllSuggestionsOnline: restored ${restored} pending suggestions from storage`);
    }
  }
  if (pendingSuggestionsOnline.length) {
    const staleSummary = await pruneStalePendingSuggestionsAgainstLiveDocument({ force: true });
    if (staleSummary.removed > 0) {
      log("rejectAllSuggestionsOnline: pruned stale pending suggestions", staleSummary);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    return finalize("noop", "no-pending-suggestions");
  }

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("Po\u010dakajte, da se pregled dokumenta zaklju\u010di, nato poskusite znova.", "warn");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  const actionToken = beginAction(ACTION_TYPE_REJECT);
  if (!actionToken) {
    return finalize("deferred", "action-in-progress");
  }
  try {
  await Word.run(async (context) => {
    const paras = await wordOnlineAdapter.getParagraphs(context);
    const entries = pendingSuggestionsOnline.map((suggestion) => ({
      suggestion,
      paragraph:
        Number.isFinite(suggestion?.paragraphIndex) && suggestion.paragraphIndex >= 0
          ? paras.items[suggestion.paragraphIndex] || null
          : null,
    }));
    const clearResult = await wordOnlineAdapter.clearHighlights(context, entries, paras);
    summary.clearedMarkers =
      (clearResult?.clearedByTagCount || 0) + (clearResult?.clearedFallbackCount || 0);
    summary.failedClear = clearResult?.failedCount || 0;
    const suggestionsByParagraph = new Map();
    for (const suggestion of pendingSuggestionsOnline) {
      const paragraphIndex = suggestion?.paragraphIndex;
      if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) continue;
      if (!suggestionsByParagraph.has(paragraphIndex)) {
        suggestionsByParagraph.set(paragraphIndex, []);
      }
      suggestionsByParagraph.get(paragraphIndex).push(suggestion);
    }
    const touchedParagraphIndexes = new Set();
    for (const [paragraphIndex, suggestionsInParagraph] of suggestionsByParagraph.entries()) {
      const paragraph = paras.items[paragraphIndex] || null;
      if (!paragraph) continue;
      const entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
      const sourceText = entry?.originalText ?? paragraph.text ?? "";
      const revertCandidates = [...suggestionsInParagraph].sort((left, right) => {
        const leftKind = left?.kind === "insert" ? 0 : left?.kind === "delete" ? 1 : 2;
        const rightKind = right?.kind === "insert" ? 0 : right?.kind === "delete" ? 1 : 2;
        return leftKind - rightKind;
      });
      for (const suggestion of revertCandidates) {
        paragraph.load("text");
        await context.sync();
        const liveText = paragraph.text || "";
        if (!isSuggestionAppliedInLiveText(liveText, sourceText, suggestion)) {
          continue;
        }
        const reverted = await revertAppliedSuggestionInParagraph(context, paragraph, suggestion);
        if (reverted) {
          summary.revertedAppliedSuggestions += 1;
          touchedParagraphIndexes.add(paragraphIndex);
        }
      }
    }
    if (touchedParagraphIndexes.size > 0) {
      await cleanupCommaSpacingForParagraphs(context, paras, touchedParagraphIndexes, {
        force: wordOnlineAdapter.shouldForceSpacingCleanup(),
      });
    }
    for (const suggestion of pendingSuggestionsOnline) {
      if (Number.isFinite(suggestion?.paragraphIndex)) {
        clearOnlineParagraphRenderState(suggestion.paragraphIndex);
      }
    }
    await context.sync();
  });
  resetPendingSuggestionsOnline();
  if (summary.failedClear > 0) {
    return finalize(summary.clearedMarkers > 0 ? "partial" : "noop", "some-marker-clear-failures");
  }
  return finalize(summary.clearedMarkers > 0 ? "cleared" : "noop");
  } finally {
    finishAction(actionToken);
  }
}

export async function clearPendingSuggestionHighlightsOnline() {
  const startedAt = tnow();
  const summary = {
    status: "noop",
    reason: null,
    restored: 0,
    pendingBefore: 0,
    clearedMarkers: 0,
    failedClear: 0,
    pendingAfter: 0,
    durationMs: 0,
  };
  const finalize = (status, reason = null) => {
    summary.status = status;
    summary.reason = reason;
    summary.pendingAfter = pendingSuggestionsOnline.length;
    summary.durationMs = Math.round(tnow() - startedAt);
    return summary;
  };

  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`clearPendingSuggestionHighlightsOnline: restored ${restored} pending suggestions from storage`);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    return finalize("noop", "no-pending-suggestions");
  }

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("Po\u010dakajte, da se pregled dokumenta zaklju\u010di, nato poskusite znova.", "warn");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  const actionToken = beginAction(ACTION_TYPE_CLEAR);
  if (!actionToken) {
    return finalize("deferred", "action-in-progress");
  }
  try {
    await Word.run(async (context) => {
      const paras = await wordOnlineAdapter.getParagraphs(context);
      const entries = pendingSuggestionsOnline.map((suggestion) => ({
        suggestion,
        paragraph:
          Number.isFinite(suggestion?.paragraphIndex) && suggestion.paragraphIndex >= 0
            ? paras.items[suggestion.paragraphIndex] || null
            : null,
      }));
      const clearResult = await wordOnlineAdapter.clearHighlights(context, entries, paras, {
        preferSingleFlush: true,
      });
      summary.clearedMarkers =
        (clearResult?.clearedByTagCount || 0) + (clearResult?.clearedFallbackCount || 0);
      summary.failedClear = clearResult?.failedCount || 0;
    });

    for (const suggestion of pendingSuggestionsOnline) {
      const paragraphIndex = suggestion?.paragraphIndex;
      if (Number.isFinite(paragraphIndex) && paragraphIndex >= 0) {
        clearOnlineParagraphRenderState(paragraphIndex);
      }
    }
    persistPendingSuggestionsOnline();
    if (summary.failedClear > 0) {
      return finalize(summary.clearedMarkers > 0 ? "partial" : "noop", "some-marker-clear-failures");
    }
    return finalize(summary.clearedMarkers > 0 ? "cleared" : "noop");
  } finally {
    finishAction(actionToken);
  }
}
/**
 * MAIN: Preveri vejice
 */
export async function checkDocumentText() {
  if (isWordOnline()) {
    const cooldownRemainingMs = getPostApplyCheckCooldownRemainingMs();
    if (cooldownRemainingMs > 0) {
      log("checkDocumentText deferred due to post-apply cooldown", { cooldownRemainingMs });
      queueScanNotification(POST_APPLY_COOLDOWN_MESSAGE, "info");
      flushScanNotifications();
      return {
        status: "deferred",
        reason: "post-apply-cooldown",
        cooldownMsRemaining: cooldownRemainingMs,
      };
    }
  }
  if (isWordOnline() && getActiveActionType() === ACTION_TYPE_CHECK) {
    const activeToken = activeActionState?.token;
    if (activeToken) {
      warn("checkDocumentText: superseding active online check", { activeCheckId: activeToken.id });
      cancelActionToken(activeToken, CHECK_ABORT_REASON_SUPERSEDED);
      const stopped = await waitForOnlineScanCompletion({
        timeoutMs: 6000,
        pollMs: 30,
        silent: true,
      });
      if (!stopped) {
        return {
          status: "deferred",
          reason: "previous-check-still-stopping",
          activeAction: getActiveActionType(),
        };
      }
    }
  }
  const actionToken = beginAction(ACTION_TYPE_CHECK);
  if (!actionToken) {
    const activeAction = getActiveActionType();
    warn("checkDocumentText ignored: another action is already running", activeAction);
    if (activeAction !== ACTION_TYPE_CHECK) {
      queueScanNotification("Po\u010dakajte, da se trenutno opravilo zaklju\u010di.", "warn");
      flushScanNotifications();
    }
    return {
      status: "deferred",
      reason: "action-in-progress",
      activeAction,
    };
  }
  documentCheckInProgress = true;
  resetNotificationFlags();
  try {
    if (isWordOnline()) {
      actionToken.deadlineAt = Date.now() + resolveOnlineCheckTimeoutMs();
      getCheckAbortController(actionToken, { create: true });
      return await checkDocumentTextOnline(actionToken);
    }
    return await checkDocumentTextDesktop(actionToken);
  } finally {
    documentCheckInProgress = false;
    finishAction(actionToken);
  }
}

async function checkDocumentTextDesktop(checkToken) {
  log("START checkDocumentText()");
  const checkStartedAt = tnow();
  let totalInserted = 0;
  let totalDeleted = 0;
  let paragraphsProcessed = 0;
  let suggestionsDetected = 0;
  let apiErrors = 0;
  let nonCommaSkips = 0;
  let nonCommaSalvaged = 0;
  let unchangedHardSkips = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  let applyRangeMisses = 0;
  let applyOpFailures = 0;
  let deterministicPlannerSkips = 0;
  let paragraphTimingCount = 0;
  let paragraphTimingTotalMs = 0;
  let paragraphTimingMaxMs = 0;
  let paragraphTimingMinMs = Number.POSITIVE_INFINITY;
  const paragraphCacheDisabled = isParagraphCacheDisabled();
  const desktopAnalyzeConcurrency = resolveDesktopAnalyzeConcurrency();
  const paragraphTimeoutMs = resolveOnlineParagraphTimeoutMs();
  const checkAbortController = getCheckAbortController(checkToken, { create: true });
  const checkAbortSignal = checkAbortController?.signal || null;
  const paragraphSnapshots = [];
  let desktopCheckBlocked = false;

  try {
    // Phase 1: read document state + paragraph text in a single Word batch.
    await Word.run(async (context) => {
      logDesktopVerbose("Desktop phase: tracked-change guard:start");
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        desktopCheckBlocked = true;
        return;
      }
      logDesktopVerbose("Desktop phase: tracked-change guard:done");

      // On desktop we require the user to enable Track Changes manually.
      const doc = context.document;
      try {
        logDesktopVerbose("Desktop phase: doc.load(trackRevisions) -> sync:start");
        doc.load("trackRevisions");
        await context.sync();
        logDesktopVerbose("Desktop phase: doc.load(trackRevisions) -> sync:done");
        if (!doc.trackRevisions) {
          notifyTrackChangesRequired();
          desktopCheckBlocked = true;
          return;
        }
      } catch (trackErr) {
        warn("trackRevisions not available -> require manual enablement", trackErr);
        notifyTrackChangesRequired();
        desktopCheckBlocked = true;
        return;
      }

      logDesktopVerbose("Desktop phase: getParagraphs:start");
      const paras = await wordDesktopAdapter.getParagraphs(context);
      logDesktopVerbose("Desktop phase: getParagraphs:done");
      logDesktopVerbose("Paragraphs found:", paras.items.length);
      let documentCharOffset = 0;
      for (let idx = 0; idx < paras.items.length; idx++) {
        const paragraph = paras.items[idx];
        const sourceText = paragraph.text || "";
        const snapshot = {
          paragraphIndex: idx,
          sourceText,
          paragraphDocOffset: documentCharOffset,
        };
        paragraphSnapshots.push(snapshot);
        documentCharOffset += sourceText.length + 1;
      }
    });
    if (desktopCheckBlocked) {
      return {
        status: "blocked",
        paragraphsProcessed,
        inserted: totalInserted,
        deleted: totalDeleted,
        detected: suggestionsDetected,
        apiErrors,
        nonCommaSkips,
        nonCommaSalvaged,
        applyRangeMisses,
        applyOpFailures,
      };
    }

    // Phase 2: analyze paragraphs outside Word.run with bounded concurrency.
    anchorProvider.reset();
    if (paragraphCacheDisabled) {
      desktopParagraphAnalysisCache.length = 0;
    } else {
      desktopParagraphAnalysisCache.length = paragraphSnapshots.length;
    }
    const analysisJobs = [];
    const applyJobs = [];
    for (const snapshot of paragraphSnapshots) {
      const normalizedSource = normalizeParagraphWhitespace(snapshot.sourceText);
      const trimmed = normalizedSource.trim();
      if (!trimmed) {
        await anchorProvider.getAnchors({
          paragraphIndex: snapshot.paragraphIndex,
          originalText: snapshot.sourceText,
          correctedText: snapshot.sourceText,
          sourceTokens: [],
          targetTokens: [],
          documentOffset: snapshot.paragraphDocOffset,
        });
        if (!paragraphCacheDisabled) {
          desktopParagraphAnalysisCache[snapshot.paragraphIndex] = null;
        }
        continue;
      }
      if (trimmed.length > MAX_PARAGRAPH_CHARS) {
        notifyParagraphTooLong(snapshot.paragraphIndex, trimmed.length);
        if (!paragraphCacheDisabled) {
          desktopParagraphAnalysisCache[snapshot.paragraphIndex] = null;
        }
        continue;
      }
      paragraphsProcessed++;
      if (!paragraphCacheDisabled && isDesktopParagraphUnchangedAndSuggestionFree(snapshot)) {
        cacheHits++;
        unchangedHardSkips++;
        logDesktopVerbose("Desktop hard-skip unchanged paragraph (clean cache)", {
          paragraphIndex: snapshot.paragraphIndex,
        });
        continue;
      }
      const cached = paragraphCacheDisabled ? null : tryGetDesktopParagraphCacheResult(snapshot);
      if (cached) {
        cacheHits++;
        suggestionsDetected += cached.suggestions.length;
        if (cached.suggestions.length) {
          applyJobs.push({
            paragraphIndex: cached.paragraphIndex,
            sourceText: cached.sourceText,
            suggestions: cached.suggestions,
            analysisDurationMs: cached.durationMs,
            fromCache: true,
          });
        }
        continue;
      }
      if (!paragraphCacheDisabled) {
        cacheMisses++;
      }
      analysisJobs.push({
        ...snapshot,
        normalizedSource,
        trimmed,
        paragraphHash: buildParagraphCacheHash(snapshot.sourceText),
        paragraphGuardTimeoutMs: paragraphTimeoutMs,
        timeoutReason: CHECK_ABORT_REASON_PARAGRAPH_TIMEOUT,
        timeoutLabel: `Paragraph ${snapshot.paragraphIndex + 1} timed out`,
      });
    }
    logDesktopVerbose("Desktop phase: analyze jobs", {
      jobs: analysisJobs.length,
      concurrency: desktopAnalyzeConcurrency,
      cacheHits,
      cacheMisses,
    });

    const analysisResults = await runWithConcurrency(
      analysisJobs,
      desktopAnalyzeConcurrency,
      async (job) => {
        const pStart = tnow();
        logDesktopVerbose(`P${job.paragraphIndex}: len=${job.sourceText.length} | "${SNIP(job.trimmed)}"`);
        try {
          ensureCheckActionActive(checkToken);
          if (checkAbortSignal?.aborted) {
            throw new CheckAbortError(
              "Check was cancelled",
              checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
            );
          }
          const result = await runWithTimeout(
            () =>
              commaEngine.analyzeParagraph({
                paragraphIndex: job.paragraphIndex,
                originalText: job.sourceText,
                normalizedOriginalText: job.normalizedSource,
                paragraphDocOffset: job.paragraphDocOffset,
                abortSignal: checkAbortSignal,
              }),
            job.paragraphGuardTimeoutMs,
            job.timeoutReason,
            job.timeoutLabel
          );
          return {
            paragraphIndex: job.paragraphIndex,
            sourceText: job.sourceText,
            result,
            durationMs: Math.round(tnow() - pStart),
            error: null,
            paragraphHash: job.paragraphHash,
          };
        } catch (error) {
          return {
            paragraphIndex: job.paragraphIndex,
            sourceText: job.sourceText,
            result: null,
            durationMs: Math.round(tnow() - pStart),
            error,
            paragraphHash: job.paragraphHash,
          };
        }
      }
    );

    for (const analyzed of analysisResults) {
      if (!analyzed) continue;
      if (Number.isFinite(analyzed.durationMs)) {
        paragraphTimingCount += 1;
        paragraphTimingTotalMs += analyzed.durationMs;
        paragraphTimingMaxMs = Math.max(paragraphTimingMaxMs, analyzed.durationMs);
        paragraphTimingMinMs = Math.min(paragraphTimingMinMs, analyzed.durationMs);
      }
      if (analyzed.error) {
        if (
          isAbortLikeError(analyzed.error) ||
          checkAbortSignal?.aborted ||
          checkToken?.cancelled
        ) {
          throw new CheckAbortError(
            "Check was cancelled",
            checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
          );
        }
        if (
          analyzed.error instanceof CheckAbortError &&
          analyzed.error.reason === CHECK_ABORT_REASON_PARAGRAPH_TIMEOUT
        ) {
          apiErrors++;
          notifyParagraphTimeout(analyzed.paragraphIndex, paragraphTimeoutMs);
          if (!paragraphCacheDisabled) {
            desktopParagraphAnalysisCache[analyzed.paragraphIndex] = null;
          }
          continue;
        }
        apiErrors++;
        warn(`P${analyzed.paragraphIndex}: engine failed`, analyzed.error);
        notifyApiUnavailable();
        if (!paragraphCacheDisabled) {
          desktopParagraphAnalysisCache[analyzed.paragraphIndex] = null;
        }
        continue;
      }
      const result = analyzed.result || {};
      const paragraphApiErrors = result.apiErrors || 0;
      const paragraphNonCommaSkips = result.nonCommaSkips || 0;
      const paragraphNonCommaSalvaged = result.nonCommaSalvaged || 0;
      apiErrors += paragraphApiErrors;
      nonCommaSkips += paragraphNonCommaSkips;
      nonCommaSalvaged += paragraphNonCommaSalvaged;
      const paragraphStable = paragraphApiErrors === 0 && paragraphNonCommaSkips === 0;
      if (!paragraphCacheDisabled && paragraphStable) {
        const cacheEntry = makeDesktopParagraphCacheEntry(analyzed.paragraphHash, result);
        desktopParagraphAnalysisCache[analyzed.paragraphIndex] = cacheEntry || null;
      } else if (!paragraphCacheDisabled) {
        desktopParagraphAnalysisCache[analyzed.paragraphIndex] = null;
      }
      const suggestions = result.suggestions || [];
      suggestionsDetected += suggestions.length;
      if (!suggestions.length) continue;
      applyJobs.push({
        paragraphIndex: analyzed.paragraphIndex,
        sourceText: analyzed.sourceText,
        suggestions,
        analysisDurationMs: analyzed.durationMs,
        fromCache: false,
      });
    }

    // Phase 3: apply edits in Word.run.
    if (applyJobs.length) {
      await Word.run(async (context) => {
        logDesktopVerbose("Desktop phase: apply:start", { paragraphsWithSuggestions: applyJobs.length });
        // Re-check tracked changes safety before mutating document.
        if (await documentHasTrackedChanges(context)) {
          notifyTrackedChangesPresent();
          return;
        }
        const doc = context.document;
        try {
          doc.load("trackRevisions");
          await context.sync();
          if (!doc.trackRevisions) {
            notifyTrackChangesRequired();
            return;
          }
        } catch (trackErr) {
          warn("trackRevisions unavailable during apply phase", trackErr);
          notifyTrackChangesRequired();
          return;
        }
        const paras = await wordDesktopAdapter.getParagraphs(context);
        const deterministicMappingV2 = isDeterministicMappingV2Enabled();
        for (const job of applyJobs) {
          const paragraph = paras.items[job.paragraphIndex];
          if (!paragraph) {
            warn("Desktop apply skipped: paragraph missing", {
              paragraphIndex: job.paragraphIndex,
            });
            if (!paragraphCacheDisabled) {
              desktopParagraphAnalysisCache[job.paragraphIndex] = null;
            }
            continue;
          }
          const anchorsEntry = anchorProvider.getAnchorsForParagraph(job.paragraphIndex);
          const snapshotText = paragraph.text || "";
          const sourceForPlan = anchorsEntry?.originalText ?? job.sourceText ?? snapshotText;
          const planOptions = deterministicMappingV2
            ? { deterministicMode: true }
            : {
                deterministicMode: false,
              };
          const { plan, skipped, noop } = buildParagraphOperationsPlan(
            snapshotText,
            sourceForPlan,
            job.suggestions,
            planOptions
          );
          logDesktopVerbose("Desktop apply plan", {
            paragraphIndex: job.paragraphIndex,
            total: job.suggestions.length,
            planned: plan.length,
            skipped: skipped.length,
            noop: noop.length,
            skippedByReason: summarizeSkippedReasons(skipped),
          });
          if (plan.length) {
            logDesktopVerbose("Desktop apply op details", {
              paragraphIndex: job.paragraphIndex,
              ops: plan.map((op, opIndex) => ({
                opIndex,
                ...buildDesktopOperationLogEntry(op, snapshotText, sourceForPlan),
              })),
            });
          }
          if (skipped.length) {
            logDesktopVerbose("Desktop apply skipped details", {
              paragraphIndex: job.paragraphIndex,
              skipped: skipped.map((item) => buildSkippedSuggestionLogEntry(item, sourceForPlan)),
            });
          }
          if (noop.length) {
            logDesktopVerbose("Desktop apply noop details", {
              paragraphIndex: job.paragraphIndex,
              noop: noop.map((suggestion) => buildDesktopSuggestionLogEntry(suggestion)).filter(Boolean),
            });
          }
          deterministicPlannerSkips += countDeterministicSkippedReasons(skipped);

          let appliedInParagraph = 0;
          const countAppliedSuggestions = (op) => {
            const suggestions = Array.isArray(op?.suggestions) && op.suggestions.length ? op.suggestions : [null];
            appliedInParagraph += suggestions.length;
            for (const suggestion of suggestions) {
              if (suggestion?.kind === "insert") {
                totalInserted++;
              } else if (suggestion?.kind === "delete") {
                totalDeleted++;
              }
            }
          };

          const deferredSuggestions = [];
          for (let opIndex = 0; opIndex < plan.length; opIndex++) {
            const op = plan[opIndex];
            try {
              logDesktopVerbose("Desktop apply op:attempt", {
                paragraphIndex: job.paragraphIndex,
                opIndex,
                op: buildDesktopOperationLogEntry(op, snapshotText, sourceForPlan),
              });
              if (!deterministicMappingV2 && isDesktopDirectInsertOp(op)) {
                const directStatus = await applyDesktopAuthoritativeInsertOp(
                  context,
                  paragraph,
                  job.paragraphIndex,
                  sourceForPlan,
                  op
                );
                logDesktopVerbose("Desktop apply op:direct result", {
                  paragraphIndex: job.paragraphIndex,
                  opIndex,
                  status: directStatus,
                  op: buildDesktopOperationLogEntry(op, snapshotText, sourceForPlan),
                });
                if (directStatus === "noop") {
                  continue;
                }
                if (directStatus === "applied") {
                  countAppliedSuggestions(op);
                  continue;
                }
              }
              if (Array.isArray(op?.suggestions) && op.suggestions.length) {
                deferredSuggestions.push(...op.suggestions);
              }
            } catch (err) {
              applyOpFailures++;
              warn("Desktop batch op failed", {
                paragraphIndex: job.paragraphIndex,
                opIndex,
                kind: op?.kind,
                err,
              });
            }
          }

          if (deferredSuggestions.length) {
            paragraph.load("text");
            await context.sync();
            const currentSnapshotText = paragraph.text || "";
            const {
              plan: deferredPlan,
              skipped: deferredSkipped,
              noop: deferredNoop,
            } = buildParagraphOperationsPlan(
              currentSnapshotText,
              sourceForPlan,
              deferredSuggestions,
              planOptions
            );
            logDesktopVerbose("Desktop deferred apply plan", {
              paragraphIndex: job.paragraphIndex,
              total: deferredSuggestions.length,
              planned: deferredPlan.length,
              skipped: deferredSkipped.length,
              noop: deferredNoop.length,
              skippedByReason: summarizeSkippedReasons(deferredSkipped),
            });
            if (deferredPlan.length) {
              logDesktopVerbose("Desktop deferred op details", {
                paragraphIndex: job.paragraphIndex,
                ops: deferredPlan.map((op, deferredOpIndex) => ({
                  deferredOpIndex,
                  ...buildDesktopOperationLogEntry(op, currentSnapshotText, sourceForPlan),
                })),
              });
            }
            if (deferredSkipped.length) {
              logDesktopVerbose("Desktop deferred skipped details", {
                paragraphIndex: job.paragraphIndex,
                skipped: deferredSkipped.map((item) =>
                  buildSkippedSuggestionLogEntry(item, sourceForPlan)
                ),
              });
            }
            if (deferredNoop.length) {
              logDesktopVerbose("Desktop deferred noop details", {
                paragraphIndex: job.paragraphIndex,
                noop: deferredNoop
                  .map((suggestion) => buildDesktopSuggestionLogEntry(suggestion))
                  .filter(Boolean),
              });
            }
            deterministicPlannerSkips += countDeterministicSkippedReasons(deferredSkipped);
            const deferredRanges = await getRangesForPlannedOperations(
              context,
              paragraph,
              currentSnapshotText,
              deferredPlan,
              "desktop-batch"
            );
            for (let deferredIndex = 0; deferredIndex < deferredPlan.length; deferredIndex++) {
              const deferredOp = deferredPlan[deferredIndex];
              const deferredRange = deferredRanges[deferredIndex];
              if (!deferredRange) {
                applyRangeMisses++;
                warn("Desktop batch op skipped: range not resolved", {
                  paragraphIndex: job.paragraphIndex,
                  opIndex: deferredIndex,
                  kind: deferredOp?.kind,
                });
                continue;
              }
              try {
                logDesktopVerbose("Desktop deferred op:attempt", {
                  paragraphIndex: job.paragraphIndex,
                  opIndex: deferredIndex,
                  op: buildDesktopOperationLogEntry(deferredOp, currentSnapshotText, sourceForPlan),
                });
                const insertLocation =
                  deferredOp?.insertLocation ??
                  (deferredOp.kind === "insert"
                    ? Word.InsertLocation.before
                    : Word.InsertLocation.replace);
                deferredRange.insertText(deferredOp.replacement, insertLocation);
                logDesktopVerbose("Desktop deferred op:queued", {
                  paragraphIndex: job.paragraphIndex,
                  opIndex: deferredIndex,
                  insertLocation,
                  op: buildDesktopOperationLogEntry(deferredOp, currentSnapshotText, sourceForPlan),
                });
                countAppliedSuggestions(deferredOp);
              } catch (err) {
                applyOpFailures++;
                warn("Desktop batch op failed", {
                  paragraphIndex: job.paragraphIndex,
                  opIndex: deferredIndex,
                  kind: deferredOp?.kind,
                  err,
                });
              }
            }
          }

          if (appliedInParagraph) {
            logDesktopVerbose(
              `P${job.paragraphIndex}: applied (ins=${totalInserted}, del=${totalDeleted}) | analyze=${job.analysisDurationMs} ms | cache=${job.fromCache ? "hit" : "miss"}`
            );
          }
          if (!paragraphCacheDisabled) {
            desktopParagraphAnalysisCache[job.paragraphIndex] = null;
          }
        }
      });
    }

    log(
      "DONE checkDocumentText() | paragraphs:",
      paragraphsProcessed,
      "| inserted:",
      totalInserted,
      "| deleted:",
      totalDeleted,
      "| detected:",
      suggestionsDetected,
      "| cacheDisabled:",
      paragraphCacheDisabled,
      "| cacheHits:",
      cacheHits,
      "| cacheMisses:",
      cacheMisses,
      "| unchangedHardSkips:",
      unchangedHardSkips,
      "| apiErrors:",
      apiErrors,
      "| nonCommaSkips:",
      nonCommaSkips,
      "| nonCommaSalvaged:",
      nonCommaSalvaged,
      "| deterministicPlannerSkips:",
      deterministicPlannerSkips,
      "| applyRangeMisses:",
      applyRangeMisses,
      "| applyOpFailures:",
      applyOpFailures,
      "| totalMs:",
      roundMs(tnow() - checkStartedAt),
      "| perParagraphMs:",
      roundMs(paragraphsProcessed > 0 ? (tnow() - checkStartedAt) / paragraphsProcessed : 0),
      "| avgParagraphMs:",
      roundMs(paragraphTimingCount > 0 ? paragraphTimingTotalMs / paragraphTimingCount : 0),
      "| minParagraphMs:",
      roundMs(paragraphTimingCount > 0 ? paragraphTimingMinMs : 0),
      "| maxParagraphMs:",
      roundMs(paragraphTimingCount > 0 ? paragraphTimingMaxMs : 0)
    );
    if (
      paragraphsProcessed > 0 &&
      suggestionsDetected === 0 &&
      totalInserted === 0 &&
      totalDeleted === 0 &&
      apiErrors === 0 &&
      nonCommaSkips === 0
    ) {
      notifyNoIssuesFound();
    }
    return {
      status: "done",
      paragraphsProcessed,
      inserted: totalInserted,
      deleted: totalDeleted,
      detected: suggestionsDetected,
      apiErrors,
      nonCommaSkips,
      nonCommaSalvaged,
      deterministicPlannerSkips,
      applyRangeMisses,
      applyOpFailures,
      cacheDisabled: paragraphCacheDisabled,
      cacheHits,
      cacheMisses,
      unchangedHardSkips,
      totalMs: roundMs(tnow() - checkStartedAt),
      perParagraphMs: roundMs(paragraphsProcessed > 0 ? (tnow() - checkStartedAt) / paragraphsProcessed : 0),
      avgParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingTotalMs / paragraphTimingCount : 0),
      minParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingMinMs : 0),
      maxParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingMaxMs : 0),
    };
  } catch (e) {
    if (e instanceof CheckAbortError && e.reason === CHECK_ABORT_REASON_TIMEOUT) {
      warn("checkDocumentTextDesktop stopped due to timeout");
      queueScanNotification(CHECK_TIMEOUT_MESSAGE, "error");
    } else if (e instanceof CheckAbortError) {
      warn("checkDocumentTextDesktop cancelled", e.reason);
      queueScanNotification(CHECK_CANCELLED_MESSAGE, "warn");
    } else {
      errL("ERROR in checkDocumentText:", e);
    }
    return {
      status: "error",
      paragraphsProcessed,
      inserted: totalInserted,
      deleted: totalDeleted,
      detected: suggestionsDetected,
      apiErrors,
      nonCommaSkips,
      nonCommaSalvaged,
      deterministicPlannerSkips,
      applyRangeMisses,
      applyOpFailures,
      unchangedHardSkips,
      totalMs: roundMs(tnow() - checkStartedAt),
      perParagraphMs: roundMs(paragraphsProcessed > 0 ? (tnow() - checkStartedAt) / paragraphsProcessed : 0),
      avgParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingTotalMs / paragraphTimingCount : 0),
      minParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingMinMs : 0),
      maxParagraphMs: roundMs(paragraphTimingCount > 0 ? paragraphTimingMaxMs : 0),
      error: String(e?.message || e || "unknown-error"),
    };
  } finally {
    flushScanNotifications();
  }
}

async function checkDocumentTextOnline(checkToken) {
  log("START checkDocumentTextOnline()");
  const checkStartedAt = tnow();
  let paragraphsProcessed = 0;
  let suggestionsDetected = 0;
  let suggestions = 0;
  let apiErrors = 0;
  let nonCommaSkips = 0;
  let nonCommaSalvaged = 0;
  let unchangedHardSkips = 0;
  let unstableBackoffSkips = 0;
  let rerenderSkipped = 0;
  let scopedMarkerClears = 0;
  let deterministicPlannerSkips = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  let paragraphTimingCount = 0;
  let paragraphTimingTotalMs = 0;
  let paragraphTimingMaxMs = 0;
  let paragraphTimingMinMs = Number.POSITIVE_INFINITY;
  const paragraphCacheDisabled = isParagraphCacheDisabled();
  const checkAbortController = getCheckAbortController(checkToken, { create: true });
  const checkAbortSignal = checkAbortController?.signal || null;
  const previousPendingSuggestionsSnapshot = [...pendingSuggestionsOnline];
  const reconciledParagraphIndexes = new Set();

  try {
    await Word.run(async (context) => {
      ensureCheckActionActive(checkToken);
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        return;
      }
      const paras = await wordOnlineAdapter.getParagraphs(context);
      const previousPendingMarkerStateByRenderKey = new Map();
      const previousMarkerRestoreByTag = new Map();
      for (const existingSuggestion of pendingSuggestionsOnline) {
        const renderKey = buildSuggestionRenderDedupKey(existingSuggestion);
        if (!renderKey || previousPendingMarkerStateByRenderKey.has(renderKey)) continue;
        const markerTag =
          typeof existingSuggestion?.markerTag === "string"
            ? existingSuggestion.markerTag.trim()
            : "";
        const markerRestoreState = {
          markerChannel:
            existingSuggestion?.markerChannel === "highlight" ||
            existingSuggestion?.markerChannel === "underline"
              ? existingSuggestion.markerChannel
              : null,
          previousHighlightColor: sanitizeRestoredHighlightColor(existingSuggestion?.previousHighlightColor),
          previousUnderline:
            existingSuggestion?.previousUnderline === null ||
            typeof existingSuggestion?.previousUnderline === "string"
              ? existingSuggestion.previousUnderline
              : null,
          previousUnderlineColor:
            existingSuggestion?.previousUnderlineColor === null ||
            typeof existingSuggestion?.previousUnderlineColor === "string"
              ? existingSuggestion.previousUnderlineColor
              : null,
        };
        previousPendingMarkerStateByRenderKey.set(renderKey, {
          markerChannel: markerRestoreState.markerChannel,
          markerId: sanitizeMarkerIdPart(existingSuggestion?.markerId),
          markerTag,
          previousHighlightColor: markerRestoreState.previousHighlightColor,
          previousUnderline: markerRestoreState.previousUnderline,
          previousUnderlineColor: markerRestoreState.previousUnderlineColor,
        });
        if (markerTag && !previousMarkerRestoreByTag.has(markerTag)) {
          previousMarkerRestoreByTag.set(markerTag, markerRestoreState);
        }
      }
      resetPendingSuggestionsOnline();
      anchorProvider.reset();
      pruneOnlineRuntimeState(paras.items.length);
      if (paragraphCacheDisabled) {
        onlineParagraphAnalysisCache.length = 0;
      } else {
        onlineParagraphAnalysisCache.length = paras.items.length;
      }

      let documentCharOffset = 0;
      let pendingHighlightParagraphs = 0;
      let pendingHighlightSuggestions = 0;
      let hasFlushedHighlightsInCurrentCheck = false;
      const markerParagraphCleanupDone = new Set();
      const paragraphTimeoutMs = resolveOnlineParagraphTimeoutMs();
      const flushParagraphThreshold = resolveOnlineHighlightFlushParagraphs();
      const flushSuggestionThreshold = resolveOnlineHighlightFlushSuggestions();
      log("Online highlight flush thresholds", {
        paragraphs: flushParagraphThreshold,
        suggestions: flushSuggestionThreshold,
      });
      const flushHighlightsIfNeeded = async (highlightedInParagraph) => {
        if (highlightedInParagraph <= 0) return;
        ensureCheckActionActive(checkToken);
        pendingHighlightParagraphs++;
        pendingHighlightSuggestions += highlightedInParagraph;
        const shouldFlushNow =
          !hasFlushedHighlightsInCurrentCheck ||
          pendingHighlightParagraphs >= flushParagraphThreshold ||
          pendingHighlightSuggestions >= flushSuggestionThreshold;
        if (shouldFlushNow) {
          await context.sync();
          hasFlushedHighlightsInCurrentCheck = true;
          pendingHighlightParagraphs = 0;
          pendingHighlightSuggestions = 0;
        }
      };
      const clearPreviousRenderMarkers = async (paragraphIndex, paragraph) => {
        if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) return;
        const previousRender = onlineParagraphRenderState.get(paragraphIndex);
        if (Array.isArray(previousRender?.markerTags) && previousRender.markerTags.length) {
          const clearSummary = await clearSuggestionMarkersByKnownTags(
            context,
            previousRender.markerTags,
            { restoreStateByTag: previousMarkerRestoreByTag }
          );
          if (clearSummary.clearedCount > 0) {
            scopedMarkerClears += clearSummary.clearedCount;
            log("Scoped marker cleanup (known tags)", {
              paragraphIndex,
              cleared: clearSummary.clearedCount,
            });
          }
          clearOnlineParagraphRenderState(paragraphIndex);
          reconciledParagraphIndexes.add(paragraphIndex);
          return;
        }
        if (paragraph && !markerParagraphCleanupDone.has(paragraphIndex)) {
          const removed = await clearStaleVejiceMarkerControlsInParagraph(context, paragraph);
          markerParagraphCleanupDone.add(paragraphIndex);
          if (removed > 0) {
            scopedMarkerClears += removed;
            log("Scoped marker cleanup (stale paragraph scan)", { paragraphIndex, removed });
          }
          reconciledParagraphIndexes.add(paragraphIndex);
        }
      };
      const renderSuggestionsForParagraph = async ({
        paragraphIndex,
        paragraph,
        sourceText,
        suggestionsToRender,
      }) => {
        const renderList = Array.isArray(suggestionsToRender)
          ? suggestionsToRender.filter(Boolean)
          : [];

        const sourceHash = buildDesktopParagraphHash(sourceText);
        const suggestionHash = buildParagraphSuggestionSetHash(sourceText, renderList);
        const previousRender = onlineParagraphRenderState.get(paragraphIndex);

        if (!renderList.length) {
          if (previousRender) {
            await clearPreviousRenderMarkers(paragraphIndex, paragraph);
          }
          clearOnlineParagraphRenderState(paragraphIndex);
          return { highlighted: 0, skippedRerender: false };
        }

        if (
          previousRender &&
          previousRender.sourceHash === sourceHash &&
          previousRender.suggestionHash === suggestionHash
        ) {
          for (const suggestionObj of renderList) {
            suggestionObj.sourceParagraphHash = sourceHash;
            const renderKey = buildSuggestionRenderDedupKey(suggestionObj);
            const previousMarkerState =
              renderKey && previousPendingMarkerStateByRenderKey.has(renderKey)
                ? previousPendingMarkerStateByRenderKey.get(renderKey)
                : null;
            if (previousMarkerState) {
              if (previousMarkerState.markerChannel) {
                suggestionObj.markerChannel = previousMarkerState.markerChannel;
              }
              if (previousMarkerState.markerId) {
                suggestionObj.markerId = previousMarkerState.markerId;
              }
              if (previousMarkerState.markerTag) {
                suggestionObj.markerTag = previousMarkerState.markerTag;
              }
              suggestionObj.previousHighlightColor = sanitizeRestoredHighlightColor(
                previousMarkerState.previousHighlightColor
              );
              suggestionObj.previousUnderline = previousMarkerState.previousUnderline;
              suggestionObj.previousUnderlineColor = previousMarkerState.previousUnderlineColor;
            }
            if (!suggestionObj.markerChannel) {
              // Online markers are rendered as highlights; default so cleanup restores highlight formatting.
              suggestionObj.markerChannel = "highlight";
            }
            if (
              typeof suggestionObj.previousHighlightColor !== "string" &&
              suggestionObj.previousHighlightColor !== null
            ) {
              suggestionObj.previousHighlightColor = null;
            }
            getSuggestionMarkerTag(suggestionObj, { create: true });
            addPendingSuggestionOnline(suggestionObj, { persist: false });
          }
          rerenderSkipped++;
          log("Render hash unchanged; rerender skipped", {
            paragraphIndex,
            suggestionCount: renderList.length,
          });
          return { highlighted: 0, skippedRerender: true };
        }

        await clearPreviousRenderMarkers(paragraphIndex, paragraph);

        let highlightedInParagraph = 0;
        for (const suggestionObj of renderList) {
          suggestionObj.sourceParagraphHash = sourceHash;
          ensureCheckActionActive(checkToken);
          if (checkAbortSignal?.aborted) {
            throw new CheckAbortError(
              "Check was cancelled",
              checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
            );
          }
          const highlighted = await wordOnlineAdapter.highlightSuggestion(
            context,
            paragraph,
            suggestionObj
          );
          if (highlighted) {
            highlightedInParagraph++;
          }
        }
        if (highlightedInParagraph > 0) {
          onlineParagraphRenderState.set(paragraphIndex, {
            sourceHash,
            suggestionHash,
            markerTags: collectMarkerTagsFromSuggestions(renderList),
            suggestionCount: renderList.length,
            updatedAt: Date.now(),
          });
        } else {
          clearOnlineParagraphRenderState(paragraphIndex);
        }
        return { highlighted: highlightedInParagraph, skippedRerender: false };
      };

      const onlineAnalyzeConcurrency = resolveOnlineAnalyzeConcurrency();
      const recordParagraphTiming = (elapsedMs) => {
        const paragraphElapsedMs = Math.max(0, Number(elapsedMs) || 0);
        paragraphTimingCount++;
        paragraphTimingTotalMs += paragraphElapsedMs;
        paragraphTimingMaxMs = Math.max(paragraphTimingMaxMs, paragraphElapsedMs);
        paragraphTimingMinMs = Math.min(paragraphTimingMinMs, paragraphElapsedMs);
      };
      const analysisJobs = [];

      for (let idx = 0; idx < paras.items.length; idx++) {
        ensureCheckActionActive(checkToken);
        if (checkAbortSignal?.aborted) {
          throw new CheckAbortError(
            "Check was cancelled",
            checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
          );
        }
        const paragraphStartedAt = tnow();
        const p = paras.items[idx];
        const original = p.text || "";
        const normalizedOriginal = normalizeParagraphWhitespace(original);
        const trimmed = normalizedOriginal.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += original.length + 1;
        const snapshot = {
          paragraphIndex: idx,
          sourceText: original,
          paragraphDocOffset,
        };
        if (!trimmed) {
          await clearPreviousRenderMarkers(idx, p);
          recordUnstableOnlineParagraphOutcome(idx, original, { nonCommaSkips: 0 });
          try {
            await anchorProvider.getAnchors({
              paragraphIndex: idx,
              originalText: original,
              correctedText: original,
              sourceTokens: [],
              targetTokens: [],
              documentOffset: paragraphDocOffset,
            });
          } catch (anchorErr) {
            warn(`P${idx} ONLINE: empty-paragraph anchor init failed`, anchorErr);
          }
          if (!paragraphCacheDisabled) {
            onlineParagraphAnalysisCache[idx] = null;
          }
          recordParagraphTiming(tnow() - paragraphStartedAt);
          continue;
        }
        if (trimmed.length > MAX_PARAGRAPH_CHARS) {
          await clearPreviousRenderMarkers(idx, p);
          recordUnstableOnlineParagraphOutcome(idx, original, { nonCommaSkips: 0 });
          notifyParagraphTooLong(idx, trimmed.length);
          if (!paragraphCacheDisabled) {
            onlineParagraphAnalysisCache[idx] = null;
          }
          recordParagraphTiming(tnow() - paragraphStartedAt);
          continue;
        }

        log(`P${idx} ONLINE: len=${original.length} | "${SNIP(trimmed)}"`);
        paragraphsProcessed++;
        if (!paragraphCacheDisabled && isOnlineParagraphUnchangedAndSuggestionFree(snapshot)) {
          await clearPreviousRenderMarkers(idx, p);
          cacheHits++;
          unchangedHardSkips++;
          recordUnstableOnlineParagraphOutcome(idx, original, { nonCommaSkips: 0 });
          log("Online hard-skip unchanged paragraph (clean cache)", {
            paragraphIndex: idx,
          });
          recordParagraphTiming(tnow() - paragraphStartedAt);
          continue;
        }
        if (shouldBackoffUnstableOnlineParagraph(idx, original)) {
          await clearPreviousRenderMarkers(idx, p);
          unstableBackoffSkips++;
          cacheHits++;
          log("Online unstable paragraph backoff skip", {
            paragraphIndex: idx,
            threshold: resolveOnlineUnstableBackoffThreshold(),
          });
          recordParagraphTiming(tnow() - paragraphStartedAt);
          continue;
        }
        const cached = paragraphCacheDisabled ? null : tryGetOnlineParagraphCacheResult(snapshot);
        if (cached) {
          cacheHits++;
          const cachedAnchors = anchorProvider.getAnchorsForParagraph(idx);
          const renderReadyCached = prepareSuggestionsForRender({
            paragraphIndex: idx,
            snapshotText: original,
            sourceText: cachedAnchors?.originalText ?? original,
            suggestions: cached.suggestions,
          });
          if (renderReadyCached.renderDedupDropped > 0) {
            log("Render dedupe (cached)", {
              paragraphIndex: idx,
              dropped: renderReadyCached.renderDedupDropped,
              before: cached.suggestions.length,
              after: renderReadyCached.suggestions.length,
            });
          }
          if (
            renderReadyCached.planDropped > 0 ||
            renderReadyCached.noopCount > 0 ||
            renderReadyCached.mergedGroupCount > 0
          ) {
            log("Render plan prune (cached)", {
              paragraphIndex: idx,
              dropped: renderReadyCached.planDropped,
              planCount: renderReadyCached.planCount,
              noop: renderReadyCached.noopCount,
              skipped: renderReadyCached.skippedCount,
              mergedGroups: renderReadyCached.mergedGroupCount,
              after: renderReadyCached.suggestions.length,
            });
          }
          if (renderReadyCached.deterministicSkipped > 0) {
            deterministicPlannerSkips += renderReadyCached.deterministicSkipped;
            if (!paragraphCacheDisabled) {
              onlineParagraphAnalysisCache[idx] = null;
            }
            log("Deterministic planner skipped cached suggestions; forcing reanalysis next run", {
              paragraphIndex: idx,
              deterministicSkipped: renderReadyCached.deterministicSkipped,
              skippedByReason: renderReadyCached.skippedByReason,
            });
          }
          suggestionsDetected += renderReadyCached.suggestions.length;
          const renderOutcome = await renderSuggestionsForParagraph({
            paragraphIndex: idx,
            paragraph: p,
            sourceText: original,
            suggestionsToRender: renderReadyCached.suggestions,
          });
          suggestions += renderOutcome.highlighted;
          await flushHighlightsIfNeeded(renderOutcome.highlighted);
          recordUnstableOnlineParagraphOutcome(idx, original, { nonCommaSkips: 0 });
          recordParagraphTiming(tnow() - paragraphStartedAt);
          continue;
        }
        if (!paragraphCacheDisabled) {
          cacheMisses++;
        }
        const remainingCheckMs =
          checkToken?.deadlineAt > 0
            ? Math.max(1, checkToken.deadlineAt - Date.now())
            : paragraphTimeoutMs;
        const paragraphGuardTimeoutMs = Math.min(paragraphTimeoutMs, remainingCheckMs);
        const timeoutReason =
          paragraphGuardTimeoutMs < paragraphTimeoutMs
            ? CHECK_ABORT_REASON_TIMEOUT
            : CHECK_ABORT_REASON_PARAGRAPH_TIMEOUT;
        analysisJobs.push({
          paragraphIndex: idx,
          paragraph: p,
          sourceText: original,
          normalizedOriginalText: normalizedOriginal,
          paragraphDocOffset,
          paragraphHash: buildParagraphCacheHash(original),
          paragraphGuardTimeoutMs,
          timeoutReason,
          timeoutLabel: `Paragraph ${idx + 1} timed out`,
        });
      }

      if (analysisJobs.length > 0) {
        log("Online phase: analyze jobs", {
          jobs: analysisJobs.length,
          concurrency: onlineAnalyzeConcurrency,
          cacheHits,
          cacheMisses,
        });
      }
      const processAnalyzedOnlineJob = async (analyzed) => {
        if (!analyzed?.job) return;
        const job = analyzed.job;
        const paragraphPhaseStartedAt = tnow();
        try {
          ensureCheckActionActive(checkToken);
          if (checkAbortSignal?.aborted) {
            throw new CheckAbortError(
              "Check was cancelled",
              checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
            );
          }
          if (analyzed.error) {
            throw analyzed.error;
          }
          const result = analyzed.result || {};
          const paragraphApiErrors = result.apiErrors || 0;
          const paragraphNonCommaSkips = result.nonCommaSkips || 0;
          const paragraphNonCommaSalvaged = result.nonCommaSalvaged || 0;
          apiErrors += paragraphApiErrors;
          nonCommaSkips += paragraphNonCommaSkips;
          nonCommaSalvaged += paragraphNonCommaSalvaged;
          recordUnstableOnlineParagraphOutcome(job.paragraphIndex, job.sourceText, {
            nonCommaSkips: paragraphNonCommaSkips,
          });
          const paragraphStable = paragraphApiErrors === 0 && paragraphNonCommaSkips === 0;
          if (!paragraphCacheDisabled && paragraphStable) {
            const cacheEntry = makeOnlineParagraphCacheEntry(job.paragraphHash, result);
            onlineParagraphAnalysisCache[job.paragraphIndex] = cacheEntry || null;
          } else if (!paragraphCacheDisabled) {
            onlineParagraphAnalysisCache[job.paragraphIndex] = null;
          }
          const renderReadyResult = prepareSuggestionsForRender({
            paragraphIndex: job.paragraphIndex,
            snapshotText: job.sourceText,
            sourceText: result?.anchorsEntry?.originalText ?? job.sourceText,
            suggestions: result.suggestions,
          });
          if (renderReadyResult.renderDedupDropped > 0) {
            log("Render dedupe (fresh)", {
              paragraphIndex: job.paragraphIndex,
              dropped: renderReadyResult.renderDedupDropped,
              before: Array.isArray(result.suggestions) ? result.suggestions.length : 0,
              after: renderReadyResult.suggestions.length,
            });
          }
          if (
            renderReadyResult.planDropped > 0 ||
            renderReadyResult.noopCount > 0 ||
            renderReadyResult.mergedGroupCount > 0
          ) {
            log("Render plan prune (fresh)", {
              paragraphIndex: job.paragraphIndex,
              dropped: renderReadyResult.planDropped,
              planCount: renderReadyResult.planCount,
              noop: renderReadyResult.noopCount,
              skipped: renderReadyResult.skippedCount,
              mergedGroups: renderReadyResult.mergedGroupCount,
              after: renderReadyResult.suggestions.length,
            });
          }
          if (renderReadyResult.deterministicSkipped > 0) {
            deterministicPlannerSkips += renderReadyResult.deterministicSkipped;
            if (!paragraphCacheDisabled) {
              onlineParagraphAnalysisCache[job.paragraphIndex] = null;
            }
            log("Deterministic planner skipped fresh suggestions; forcing reanalysis next run", {
              paragraphIndex: job.paragraphIndex,
              deterministicSkipped: renderReadyResult.deterministicSkipped,
              skippedByReason: renderReadyResult.skippedByReason,
            });
          }
          suggestionsDetected += renderReadyResult.suggestions.length;
          const renderOutcome = await renderSuggestionsForParagraph({
            paragraphIndex: job.paragraphIndex,
            paragraph: job.paragraph,
            sourceText: job.sourceText,
            suggestionsToRender: renderReadyResult.suggestions,
          });
          suggestions += renderOutcome.highlighted;
          await flushHighlightsIfNeeded(renderOutcome.highlighted);
        } catch (paragraphErr) {
          if (!paragraphCacheDisabled) {
            onlineParagraphAnalysisCache[job.paragraphIndex] = null;
          }
          if (
            isAbortLikeError(paragraphErr) ||
            checkAbortSignal?.aborted ||
            checkToken?.cancelled
          ) {
            throw new CheckAbortError(
              "Check was cancelled",
              checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
            );
          }
          if (
            paragraphErr instanceof CheckAbortError &&
            paragraphErr.reason === CHECK_ABORT_REASON_TIMEOUT
          ) {
            throw paragraphErr;
          }
          if (
            paragraphErr instanceof CheckAbortError &&
            paragraphErr.reason === CHECK_ABORT_REASON_PARAGRAPH_TIMEOUT
          ) {
            apiErrors++;
            notifyParagraphTimeout(job.paragraphIndex, paragraphTimeoutMs);
            return;
          }
          apiErrors++;
          warn(`P${job.paragraphIndex} ONLINE: paragraph processing failed`, paragraphErr);
          notifyApiUnavailable();
        } finally {
          const renderElapsedMs = Math.max(0, tnow() - paragraphPhaseStartedAt);
          const analysisElapsedMs = Math.max(0, Number(analyzed.durationMs) || 0);
          recordParagraphTiming(analysisElapsedMs + renderElapsedMs);
        }
      };

      const analyzedByIndex = new Array(analysisJobs.length).fill(null);
      let nextAnalyzedToRender = 0;
      let orderedRenderDrain = Promise.resolve();
      const drainReadyAnalyzedInOrder = () => {
        orderedRenderDrain = orderedRenderDrain.then(async () => {
          while (nextAnalyzedToRender < analyzedByIndex.length) {
            const analyzed = analyzedByIndex[nextAnalyzedToRender];
            if (!analyzed) break;
            analyzedByIndex[nextAnalyzedToRender] = null;
            nextAnalyzedToRender++;
            await processAnalyzedOnlineJob(analyzed);
          }
        });
        return orderedRenderDrain;
      };

      await runWithConcurrency(
        analysisJobs,
        onlineAnalyzeConcurrency,
        async (job, index) => {
          const startedAt = tnow();
          let analyzed;
          try {
            ensureCheckActionActive(checkToken);
            if (checkAbortSignal?.aborted) {
              throw new CheckAbortError(
                "Check was cancelled",
                checkToken?.cancelReason || CHECK_ABORT_REASON_CANCELLED
              );
            }
            const result = await runWithTimeout(
              () =>
                commaEngine.analyzeParagraph({
                  paragraphIndex: job.paragraphIndex,
                  originalText: job.sourceText,
                  normalizedOriginalText: job.normalizedOriginalText,
                  paragraphDocOffset: job.paragraphDocOffset,
                  abortSignal: checkAbortSignal,
                }),
              job.paragraphGuardTimeoutMs,
              job.timeoutReason,
              job.timeoutLabel
            );
            analyzed = {
              job,
              result,
              error: null,
              durationMs: Math.max(0, tnow() - startedAt),
            };
          } catch (error) {
            analyzed = {
              job,
              result: null,
              error,
              durationMs: Math.max(0, tnow() - startedAt),
            };
          }
          analyzedByIndex[index] = analyzed;
          await drainReadyAnalyzedInOrder();
          return analyzed;
        }
      );
      await drainReadyAnalyzedInOrder();

      persistPendingSuggestionsOnline();
      await context.sync();
    });

    const totalDurationMsRaw = Math.max(0, tnow() - checkStartedAt);
    const perParagraphMsRaw =
      paragraphsProcessed > 0 ? totalDurationMsRaw / paragraphsProcessed : 0;
    const avgParagraphMsRaw =
      paragraphTimingCount > 0 ? paragraphTimingTotalMs / paragraphTimingCount : 0;
    const minParagraphMsRaw =
      paragraphTimingCount > 0 ? paragraphTimingMinMs : 0;
    const maxParagraphMsRaw =
      paragraphTimingCount > 0 ? paragraphTimingMaxMs : 0;
    log(
      "DONE checkDocumentTextOnline() | paragraphs:",
      paragraphsProcessed,
      "| suggestions:",
      suggestions,
      "| detected:",
      suggestionsDetected,
      "| cacheDisabled:",
      paragraphCacheDisabled,
      "| cacheHits:",
      cacheHits,
      "| cacheMisses:",
      cacheMisses,
      "| unchangedHardSkips:",
      unchangedHardSkips,
      "| unstableBackoffSkips:",
      unstableBackoffSkips,
      "| rerenderSkipped:",
      rerenderSkipped,
      "| scopedMarkerClears:",
      scopedMarkerClears,
      "| totalMs:",
      roundMs(totalDurationMsRaw),
      "| perParagraphMs:",
      roundMs(perParagraphMsRaw),
      "| avgParagraphMs:",
      roundMs(avgParagraphMsRaw),
      "| minParagraphMs:",
      roundMs(minParagraphMsRaw),
      "| maxParagraphMs:",
      roundMs(maxParagraphMsRaw),
      "| apiErrors:",
      apiErrors,
      "| nonCommaSkips:",
      nonCommaSkips,
      "| nonCommaSalvaged:",
      nonCommaSalvaged,
      "| deterministicPlannerSkips:",
      deterministicPlannerSkips
    );
    if (
      paragraphsProcessed > 0 &&
      suggestionsDetected > 0 &&
      suggestions === 0 &&
      apiErrors === 0 &&
      nonCommaSkips === 0
    ) {
      queueScanNotification(MARKER_RENDER_FAILED_MESSAGE, "warn");
    }
    if (paragraphsProcessed > 0 && suggestionsDetected === 0 && apiErrors === 0 && nonCommaSkips === 0) {
      notifyNoIssuesFound();
    }
  } catch (e) {
    if (e instanceof CheckAbortError && e.reason === CHECK_ABORT_REASON_TIMEOUT) {
      warn("checkDocumentTextOnline stopped due to timeout");
      queueScanNotification(CHECK_TIMEOUT_MESSAGE, "error");
    } else if (e instanceof CheckAbortError) {
      warn("checkDocumentTextOnline cancelled", e.reason);
      queueScanNotification(CHECK_CANCELLED_MESSAGE, "warn");
    } else {
      errL("ERROR in checkDocumentTextOnline:", e);
    }
    const restored = recoverPendingSuggestionsAfterInterruptedOnlineScan(
      previousPendingSuggestionsSnapshot,
      reconciledParagraphIndexes
    );
    if (restored > 0) {
      log("Recovered pending suggestions after interrupted online scan", {
        restored,
      });
    }
    persistPendingSuggestionsOnline();
  } finally {
    persistPendingSuggestionsOnline();
    flushScanNotifications();
  }
}
