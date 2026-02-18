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
  normalizeParagraphWhitespace,
  normalizeParagraphForEquality,
  QUOTES,
  charAtSafe,
  isDigit,
  makeAnchor,
  normalizeTokenRepeatKey,
} from "./engine/textUtils.js";

/** ─────────────────────────────────────────────────────────
 *  DEBUG helpers (flip DEBUG=false to silence logs)
 *  ───────────────────────────────────────────────────────── */
const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const log = (...a) => DEBUG && console.log("[Vejice CHECK]", ...a);
const warn = (...a) => DEBUG && console.warn("[Vejice CHECK]", ...a);
const errL = (...a) => console.error("[Vejice CHECK]", ...a);
const tnow = () => performance?.now?.() ?? Date.now();
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
const onlineMarkerBaselineByKey = new Map();
const PENDING_SUGGESTIONS_STORAGE_BASE_KEY = "vejice.pendingSuggestionsOnline.v1";
const PENDING_SUGGESTIONS_SESSION_KEY = "vejice.pendingSuggestionsSessionId.v1";
const MAX_PARAGRAPH_CHARS = 3000; //???
const LONG_PARAGRAPH_MESSAGE =
  "Odstavek je predolg za preverjanje. Razdelite ga na krajše povedi in poskusite znova.";
const LONG_SENTENCE_MESSAGE =
  "Poved je predolga za preverjanje. Razdelite jo na krajše povedi in poskusite znova.";
const CHUNK_API_ERROR_MESSAGE =
  "Nekatere povedi niso bile pregledane.";
const PARAGRAPH_NON_COMMA_MESSAGE =
  "API je spremenil več kot vejice. Preglejte odstavek.";
const TRACKED_CHANGES_PRESENT_MESSAGE =
  "Najprej sprejmite ali zavrnite obstoječe spremembe (Track Changes) in nato ponovno zaženite preverjanje.";
const TRACK_CHANGES_REQUIRED_MESSAGE =
  "Vključite Sledenje spremembam (Track Changes) in poskusite znova.";
const API_UNAVAILABLE_MESSAGE =
  "Storitev CJVT Vejice trenutno ni na voljo. Znova poskusite kasneje.";
const NO_ISSUES_FOUND_MESSAGE = "Ni bilo najdenih manjkajočih ali napačnih vejic.";
const MARKER_RENDER_FAILED_MESSAGE =
  "Napake so bile najdene, vendar jih v Word Online ni bilo mogoče označiti.";
const ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS = 3;
const ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS = 12;
const ONLINE_ACCEPT_MIN_CONFIDENCE_LEVEL = "medium";
const DISABLE_CHAR_SPAN_RANGES_ON_WORD_ONLINE = true;
let longSentenceNotified = false;
let chunkApiFailureNotified = false;
const pendingScanNotifications = [];
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
  onlineMarkerBaselineByKey.clear();
  persistPendingSuggestionsOnline();
}
function addPendingSuggestionOnline(suggestion) {
  pendingSuggestionsOnline.push(suggestion);
  persistPendingSuggestionsOnline();
}
export function getPendingSuggestionsOnline(debugSnapshot = false) {
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
  const serializable = {
    id: suggestion.id,
    kind: suggestion.kind,
    paragraphIndex: suggestion.paragraphIndex,
    charHint: suggestion.charHint,
    snippets: suggestion.snippets,
    meta: suggestion.meta,
    originalPos: suggestion.originalPos,
    previousHighlightColor: suggestion.previousHighlightColor,
    highlightBaselineKey: suggestion.highlightBaselineKey,
    previousUnderline: suggestion.previousUnderline,
    previousUnderlineColor: suggestion.previousUnderlineColor,
    underlineBaselineKey: suggestion.underlineBaselineKey,
    markerChannel: suggestion.markerChannel,
    markerId: suggestion.markerId,
    markerTag: suggestion.markerTag,
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
    warn("persistPendingSuggestionsOnline failed", storageErr);
  }
}

function restorePendingSuggestionsOnline() {
  if (pendingSuggestionsOnline.length) return pendingSuggestionsOnline.length;
  if (typeof window === "undefined") return 0;
  try {
    const storage = window.localStorage;
    if (!storage) return 0;
    const raw = storage.getItem(getPendingSuggestionsStorageKey());
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      pendingSuggestionsOnline.push(item);
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
let onlineScanInProgress = false;
let documentCheckInProgress = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForOnlineScanCompletion({ timeoutMs = 120000, pollMs = 80 } = {}) {
  if (!onlineScanInProgress) return true;
  const startedAt = Date.now();
  warn("Waiting for active online scan to complete before apply/reject.");
  while (onlineScanInProgress && Date.now() - startedAt < timeoutMs) {
    await sleep(pollMs);
  }
  if (onlineScanInProgress) {
    warn("Timed out while waiting for online scan completion.");
    return false;
  }
  return true;
}

export function isDocumentCheckInProgress() {
  return Boolean(documentCheckInProgress || onlineScanInProgress);
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

function queueScanNotification(message) {
  if (!message) return;
  pendingScanNotifications.push(message);
}

function flushScanNotifications() {
  if (!pendingScanNotifications.length) return;
  const seen = new Set();
  const uniqueMessages = [];
  for (const message of pendingScanNotifications) {
    if (!message || seen.has(message)) continue;
    seen.add(message);
    uniqueMessages.push(message);
  }
  pendingScanNotifications.length = 0;
  if (!uniqueMessages.length) return;
  showToastNotification(uniqueMessages.join("\n"));
}
function notifyParagraphTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_PARAGRAPH_MESSAGE} (${length} znakov).`;
  warn("Paragraph too long – skipped", { paragraphIndex, length });
  queueScanNotification(msg);
}

function notifySentenceTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_SENTENCE_MESSAGE} (${length} znakov).`;
  warn("Sentence too long – skipped", { paragraphIndex, length });
  if (longSentenceNotified) return;
  longSentenceNotified = true;
  queueScanNotification(msg);
}

function notifyChunkApiFailure(paragraphIndex, chunkIndex) {
  warn("Sentence skipped due to API error", { paragraphIndex, chunkIndex });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  queueScanNotification(CHUNK_API_ERROR_MESSAGE);
}

function notifyChunkNonCommaChanges(paragraphIndex, chunkIndex, original, corrected) {
  warn("Sentence skipped due to non-comma changes", { paragraphIndex, chunkIndex, original, corrected });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  queueScanNotification(CHUNK_API_ERROR_MESSAGE);
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
  queueScanNotification(`Odstavek ${label}: ${PARAGRAPH_NON_COMMA_MESSAGE}`);
}

function notifyTrackedChangesPresent() {
  warn("Tracked changes present – aborting check");
  queueScanNotification(TRACKED_CHANGES_PRESENT_MESSAGE);
}

function notifyTrackChangesRequired() {
  warn("Track changes disabled – aborting check");
  queueScanNotification(TRACK_CHANGES_REQUIRED_MESSAGE);
}

let apiFailureNotified = false;
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
    log("Desktop phase: revisions.load(items) -> sync:start");
    revisions.load("items");
    await context.sync();
    log("Desktop phase: revisions.load(items) -> sync:done", revisions.items.length);
    return revisions.items.length > 0;
  } catch (err) {
    if (err?.code === "ApiNotFound") {
      warn("Revisions API unavailable on this host – skipping tracked changes guard");
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
      if ("\"“”„«»".includes(ch)) return "\"";
      if ("'`´‘’".includes(ch)) return "'";
    }
    if (profile?.normalizeDashes && "–—‑−".includes(ch)) {
      return "-";
    }
    if (profile?.normalizeEllipsis && ch === "…") {
      return "...";
    }
    return ch;
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const isSpace = /[\s\u00A0\u202F\u2007]/.test(ch);
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

function mapIndexAcrossCanonical(sourceText, targetText, sourceIndex, profile = getNormalizationProfile()) {
  if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return 0;
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

  const requests = [];
  const searchCache = new Map();
  const perOpVariants = plan.map((op, opIndex) => {
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

function buildInsertSuggestionMetadata(entry, { originalCharIndex, targetCharIndex }) {
  const srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  const targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  const sourceAround = findAnchorsNearChar(entry, "source", srcIndex);
  const targetAround = findAnchorsNearChar(entry, "target", targetIndex);
  const documentOffset = entry?.documentOffset ?? 0;
  const highlightAnchor =
    sourceAround.at ??
    sourceAround.before ??
    sourceAround.after ??
    targetAround.at ??
    targetAround.before ??
    targetAround.after;
  const highlightCharStart = highlightAnchor?.charStart ?? srcIndex;
  const highlightCharEnd = highlightAnchor?.charEnd ?? srcIndex;
  const paragraphText = entry?.originalText ?? "";
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
  };
}

function buildDeleteRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
  if (!meta) return ranges;
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
  const charHint = suggestion?.charHint;
  addRange(charHint?.start, charHint?.end, meta.highlightText);
  return ranges;
}

function buildInsertRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
  if (!meta) return ranges;
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
  const charHint = suggestion?.charHint;
  addRange(charHint?.start, charHint?.end, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.targetTokenBefore);
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

// Po potrebi dodaj presledek po vejici (razen pred narekovaji ali števkami)
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

// Briši samo znak vejice
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
  const insertSet = new Set([
    insertToken,
    "#fff9c4",
    "#ffff00",
    "#ff0",
    "yellow",
  ]);
  const deleteSet = new Set([
    deleteToken,
    "#ffcdd2",
    "#ff0000",
    "#f00",
    "red",
    "pink",
  ]);
  return insertSet.has(token) || deleteSet.has(token);
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

function buildSuggestionHighlightKey(suggestion) {
  const paragraphIndex = suggestion?.paragraphIndex;
  const anchor = suggestion?.meta?.anchor || {};
  const startRaw =
    suggestion?.charHint?.start ??
    anchor.highlightCharStart ??
    anchor.charStart ??
    anchor.targetCharStart ??
    -1;
  const endRaw =
    suggestion?.charHint?.end ??
    anchor.highlightCharEnd ??
    anchor.charEnd ??
    anchor.targetCharEnd ??
    startRaw + 1;
  if (!Number.isFinite(paragraphIndex) || paragraphIndex < 0) return null;
  if (!Number.isFinite(startRaw) || startRaw < 0) return null;
  const start = Math.floor(startRaw);
  const end = Number.isFinite(endRaw) && endRaw > start ? Math.floor(endRaw) : start + 1;
  return `${paragraphIndex}:${start}:${end}`;
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
      suggestion.previousHighlightColor = existingHighlightColor;
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
    let targetRange = null;

    if (Number.isFinite(charStart) && charStart >= 0) {
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

    if (!targetRange) {
      targetRange = await findCommaRangeByOrdinal(context, paragraph, paragraphText, suggestion.meta?.op);
      if (!targetRange) return false;
    }

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
    const corrected = suggestion.meta?.correctedText ?? paragraph.text ?? "";
    const anchor = suggestion.meta?.anchor || {};
    const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
    const rawLeft = suggestion.snippets?.leftSnippet ?? corrected.slice(0, suggestion.meta?.op?.pos ?? 0);
    const rawRight = suggestion.snippets?.rightSnippet ?? corrected.slice(suggestion.meta?.op?.pos ?? 0);
    const lastWord = extractLastWord(rawLeft || "");
    let leftContext = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");
    const searchOpts = { matchCase: false, matchWholeWord: false };
    let range = null;

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

  const highlightAnchorCandidate = [
    anchor.highlightAnchorTarget,
    anchor.sourceTokenAt,
    anchor.targetTokenAt,
    anchor.sourceTokenBefore,
    anchor.targetTokenBefore,
  ].find((candidate) => Number.isFinite(candidate?.charStart) && candidate.charStart >= 0);

  if (highlightAnchorCandidate) {
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

  if (!range && Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0) {
    const metaEndCandidate = {
      charStart: anchor.highlightCharStart,
      charEnd: anchor.highlightCharEnd,
      tokenText:
        anchor.highlightAnchorTarget?.tokenText ||
        anchor.sourceTokenAt?.tokenText ||
        anchor.targetTokenAt?.tokenText ||
        anchor.highlightText,
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
  const match = text.match(/([\p{L}\d]+)[^\p{L}\d]*$/u);
  return match ? match[1] : "";
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

async function findTokenRangeForAnchor(context, paragraph, anchorSnapshot) {
  if (!anchorSnapshot?.tokenText) return null;
  const fallbackOrdinal =
    typeof anchorSnapshot.textOccurrence === "number"
      ? anchorSnapshot.textOccurrence
      : typeof anchorSnapshot.tokenIndex === "number"
        ? anchorSnapshot.tokenIndex
        : 0;
  const tryFind = async (text, ordinalHint) => {
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
    const targetIndex = Math.max(0, Math.min(ordinal, matches.items.length - 1));
    return matches.items[targetIndex];
  };

  let range = await tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence);
  if (range) return range;
  const trimmed = anchorSnapshot.tokenText.trim();
  if (trimmed && trimmed !== anchorSnapshot.tokenText) {
    range = await tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence);
    if (range) return range;
  }
  return null;
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
  if (!meta) return false;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const insertCommaAtChar = async (charIndex, traceLabel) => {
    paragraph.load("text");
    await context.sync();
    const text = paragraph.text || "";
    if (!Number.isFinite(charIndex) || charIndex < 0 || charIndex > text.length) {
      return false;
    }

    // Move insertion point to first non-space char to avoid creating "word ,next".
    let insertionPos = charIndex;
    while (insertionPos < text.length && /\s/.test(text[insertionPos])) {
      insertionPos++;
    }
    // Expand backwards over spaces so we can replace "   " with ", ".
    let trimStart = insertionPos;
    while (trimStart > 0 && /\s/.test(text[trimStart - 1])) {
      trimStart--;
    }

    const nextChar = insertionPos < text.length ? text[insertionPos] : "";
    const prevChar = insertionPos > 0 ? text[insertionPos - 1] : "";
    if (
      insertionPos > 0 &&
      insertionPos < text.length &&
      WORD_CHAR_REGEX.test(prevChar) &&
      WORD_CHAR_REGEX.test(nextChar)
    ) {
      warn(`${traceLabel}: refusing in-word comma insertion`, { insertionPos, prevChar, nextChar });
      return false;
    }
    const withFollowingSpace = nextChar && !/\s/.test(nextChar) && !QUOTES.has(nextChar) && !isDigit(nextChar);
    const commaText = withFollowingSpace ? ", " : ",";

    if (trimStart < insertionPos) {
      const replaceWhitespaceRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        trimStart,
        insertionPos,
        `${traceLabel}-replace-whitespace`,
        text.slice(trimStart, insertionPos)
      );
      if (!replaceWhitespaceRange) return false;
      replaceWhitespaceRange.insertText(commaText, Word.InsertLocation.replace);
      return true;
    }

    const insertRange = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      insertionPos,
      Math.min(insertionPos + 1, text.length),
      `${traceLabel}-insert`,
      meta.highlightText
    );
    if (!insertRange) return false;
    insertRange.insertText(commaText, Word.InsertLocation.before);
    return true;
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
      const insertRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        afterStart,
        Math.min(afterStart + 1, liveText.length),
        `${traceLabel}-insert-at-gap`,
        afterToken
      );
      if (!insertRange) return false;
      insertRange.insertText(", ", Word.InsertLocation.before);
      return true;
    }

    const gapRange = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      beforeEnd,
      afterStart,
      `${traceLabel}-replace-gap`,
      gapText || " "
    );
    if (!gapRange) return false;
    gapRange.insertText(", ", Word.InsertLocation.replace);
    return true;
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
      if (tokenStart > 0 && /\s/.test(liveText[tokenStart - 1])) {
        let wsStart = tokenStart - 1;
        while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
          wsStart--;
        }
        const firstTokenChar = liveText[tokenStart] ?? "";
        const commaText =
          firstTokenChar && !/\s/.test(firstTokenChar) && !QUOTES.has(firstTokenChar) && !isDigit(firstTokenChar)
            ? ", "
            : ",";
        const beforeTokenWsRange = await getRangeForAnchorSpan(
          context,
          paragraph,
          entry,
          wsStart,
          tokenStart,
          `${traceLabel}-normalize-before-token`,
          liveText.slice(wsStart, tokenStart)
        );
        if (beforeTokenWsRange) {
          beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
          return true;
        }
      }
    }
    const liveIndex = hintIndex;
    if (Number.isFinite(liveIndex) && liveIndex >= 0) {
      const insertedViaChar = await insertCommaAtChar(liveIndex, `${traceLabel}-mapped-char`);
      if (insertedViaChar) return true;
    }
    const nextChar = liveText[liveIndex] ?? "";
    if (nextChar && /\s/.test(nextChar)) {
      let wsEnd = liveIndex;
      while (wsEnd < liveText.length && /\s/.test(liveText[wsEnd])) {
        wsEnd++;
      }
      const afterWsChar = liveText[wsEnd] ?? "";
      const withSpace =
        afterWsChar && !/\s/.test(afterWsChar) && !QUOTES.has(afterWsChar) && !isDigit(afterWsChar);
      const commaText = withSpace ? ", " : ",";
      const replaceRange = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        liveIndex,
        wsEnd,
        `${traceLabel}-replace-ws`,
        liveText.slice(liveIndex, wsEnd)
      );
      if (replaceRange) {
        replaceRange.insertText(commaText, Word.InsertLocation.replace);
        return true;
      }
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
        while (wsStart > 0 && /\s/.test(liveText[wsStart - 1])) {
          wsStart--;
        }
        if (wsStart < tokenStart) {
          const firstTokenChar = liveText[tokenStart] ?? "";
          const commaText =
            firstTokenChar && !/\s/.test(firstTokenChar) && !QUOTES.has(firstTokenChar) && !isDigit(firstTokenChar)
              ? ", "
              : ",";
          const beforeTokenWsRange = await getRangeForAnchorSpan(
            context,
            paragraph,
            entry,
            wsStart,
            tokenStart,
            `${traceLabel}-normalize-before-token`,
            liveText.slice(wsStart, tokenStart)
          );
          if (beforeTokenWsRange) {
            beforeTokenWsRange.insertText(commaText, Word.InsertLocation.replace);
            return true;
          }
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
        if (await replaceGapBetweenAnchors(beforeAnchor, afterAnchor, "apply-insert-token-gap")) return true;
        if (await insertCommaBeforeToken(afterAnchor, "apply-insert-lemma-after-token")) return true;
        if (await insertCommaAfterToken(beforeAnchor ?? anchor, "apply-insert-lemma-anchor")) return true;
        const hasTokenAnchors = Boolean(beforeAnchor || afterAnchor || meta.sourceTokenAt || meta.targetTokenAt);
        if (!hasTokenAnchors && Number.isFinite(anchorEnd) && anchorEnd >= 0) {
          if (await insertCommaAtChar(anchorEnd, "apply-insert-lemma-anchor")) {
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
    return false;
  }
  if (!Number.isFinite(insertionCharStart) || insertionCharStart < 0) return false;
  try {
    return await insertCommaAtChar(insertionCharStart, "apply-insert-target-char");
  } catch (err) {
    warn("apply insert metadata: failed to insert via target char", err);
    return false;
  }
}

async function applyInsertSuggestion(context, paragraph, suggestion) {
  return await tryApplyInsertUsingMetadata(context, paragraph, suggestion);
}

async function normalizeCommaSpacingInParagraph(context, paragraph) {
  paragraph.load("text");
  await context.sync();
  const text = paragraph.text || "";
  if (!text.includes(",")) return;

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
    if (!nextChar) continue;
    if (!/\s/.test(nextChar) && !QUOTES.has(nextChar) && !isDigit(nextChar)) {
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
    if (!nextChar) continue;
    if (/\s/.test(nextChar) || QUOTES.has(nextChar) || isDigit(nextChar)) continue;
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

async function cleanupCommaSpacingForParagraphs(context, paragraphs, indexes, { force = false } = {}) {
  if (anchorProviderSupportsCharHints && !force) {
    log("Skipping comma spacing cleanup – lemmatizer anchors already normalized.");
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
  "«",
  "»",
  "…",
  "—",
  "–",
  "-",
];

async function clearResidualVejiceHighlightsInParagraph(context, paragraph) {
  if (!paragraph || typeof paragraph.getRange !== "function") return;
  try {
    const contentRange = paragraph.getRange("Content");
    const textRanges = contentRange.getTextRanges(HIGHLIGHT_SCRUB_DELIMITERS, false);
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
      if (isVejiceMarkerHighlightColor(range?.font?.highlightColor)) {
        range.font.highlightColor = null;
        changed = true;
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
    if (isVejiceMarkerHighlightColor(contentRange?.font?.highlightColor)) {
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

async function clearResidualVejiceHighlightsForParagraphs(context, paragraphs, indexes) {
  if (!indexes?.size) return;
  for (const idx of indexes) {
    const paragraph = paragraphs?.items?.[idx];
    await clearResidualVejiceHighlightsInParagraph(context, paragraph);
  }
}

async function clearAllHighlightsForParagraphs(context, paragraphs, indexes) {
  if (!indexes?.size) return;
  try {
    for (const idx of indexes) {
      const paragraph = paragraphs?.items?.[idx];
      if (!paragraph || typeof paragraph.getRange !== "function") continue;
      paragraph.getRange("Content").font.highlightColor = null;
    }
    await context.sync();
  } catch (err) {
    warn("clearAllHighlightsForParagraphs failed", err);
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
      const isHighlightMarker = isVejiceMarkerHighlightColor(range?.font?.highlightColor);
      const isUnderlineMarker = isVejiceMarkerStyle(range?.font?.underline, null);
      if (!isHighlightMarker && !isUnderlineMarker) continue;
      if (isHighlightMarker) {
        range.font.highlightColor = null;
      }
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
    range.font.highlightColor = suggestion.previousHighlightColor || null;
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

async function clearSuggestionMarkersByTag(context, entries) {
  const normalizedEntries = Array.isArray(entries) ? entries.filter((entry) => entry?.suggestion) : [];
  if (!normalizedEntries.length) {
    return {
      clearedCount: 0,
      unresolvedEntries: [],
    };
  }
  const taggedEntries = [];
  const unresolvedEntries = [];
  for (const entry of normalizedEntries) {
    const markerTag = getSuggestionMarkerTag(entry.suggestion, { create: false });
    if (!markerTag) {
      unresolvedEntries.push(entry);
      continue;
    }
    try {
      const controls = context.document.body.contentControls.getByTag(markerTag);
      controls.load("items");
      taggedEntries.push({ ...entry, controls });
    } catch (err) {
      warn("clearSuggestionMarkersByTag: failed to queue content control load", err);
      unresolvedEntries.push(entry);
    }
  }
  if (!taggedEntries.length) {
    return {
      clearedCount: 0,
      unresolvedEntries,
    };
  }
  try {
    await context.sync();
  } catch (syncErr) {
    warn("clearSuggestionMarkersByTag: failed to load tagged controls", syncErr);
    return {
      clearedCount: 0,
      unresolvedEntries: [...unresolvedEntries, ...taggedEntries.map((entry) => ({ suggestion: entry.suggestion, paragraph: entry.paragraph }))],
    };
  }

  let clearedCount = 0;
  let changed = false;
  for (const entry of taggedEntries) {
    const items = entry.controls?.items || [];
    if (!items.length) {
      unresolvedEntries.push({ suggestion: entry.suggestion, paragraph: entry.paragraph });
      continue;
    }
    let entryCleared = false;
    for (const control of items) {
      try {
        const controlRange = control.getRange("Content");
        applyMarkerRestoreFormatting(controlRange, entry.suggestion);
        control.delete(true);
        changed = true;
        entryCleared = true;
      } catch (err) {
        warn("clearSuggestionMarkersByTag: failed to clear tagged control", err);
      }
    }
    if (entryCleared) {
      resetSuggestionMarkerState(entry.suggestion);
      clearedCount += 1;
    } else {
      unresolvedEntries.push({ suggestion: entry.suggestion, paragraph: entry.paragraph });
    }
  }
  if (changed) {
    try {
      await context.sync();
    } catch (syncErr) {
      warn("clearSuggestionMarkersByTag: failed to commit marker cleanup", syncErr);
    }
  }
  return {
    clearedCount,
    unresolvedEntries,
  };
}

async function clearHighlightForSuggestion(context, paragraph, suggestion, options = {}) {
  if (!suggestion) return false;
  const restoreMarker = getSuggestionRestoreMarkerFormat(suggestion);
  const restoreWordUnderline = toWordUnderline(restoreMarker?.underline);
  const restoreWordUnderlineColor = normalizeHighlightColorValue(restoreMarker?.underlineColor);
  const skipTagLookup = Boolean(options?.skipTagLookup);
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
              controlRange.font.highlightColor = suggestion.previousHighlightColor || null;
            } else {
              controlRange.font.underline = restoreWordUnderline;
              try {
                controlRange.font.underlineColor = restoreWordUnderlineColor;
              } catch (_err) {
                // ignore: underlineColor not supported on some hosts
              }
            }
            control.delete(true);
          }
          await context.sync();
          resetSuggestionMarkerState(suggestion);
          return true;
        }
      } catch (tagErr) {
        warn("clearHighlightForSuggestion: failed via marker tag", tagErr);
      }
    }
  }
  if (suggestion.highlightRange) {
    let clearedViaTrackedRange = false;
    try {
      if (suggestion.markerChannel === "highlight") {
        suggestion.highlightRange.font.highlightColor = suggestion.previousHighlightColor || null;
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
  if (!range && suggestion?.kind === "insert") {
    range = await findRangeForInsert(context, paragraph, suggestion);
  }
  if (!range && suggestion?.kind === "delete") {
    const liveText = paragraph.text || suggestion?.meta?.originalText || "";
    range = await findCommaRangeByOrdinal(context, paragraph, liveText, suggestion?.meta?.op || {});
  }
  if (range) {
    if (suggestion.markerChannel === "highlight") {
      range.font.highlightColor = suggestion.previousHighlightColor || null;
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
async function clearOnlineSuggestionMarkers(context, suggestionsOverride, paragraphs) {
  const usingOverride = Array.isArray(suggestionsOverride);
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
    failedCount: 0,
  };

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
  const taggedResult = await clearSuggestionMarkersByTag(context, normalizedEntries);
  result.clearedByTagCount = taggedResult.clearedCount;
  let needsFinalSync = false;
  for (const entry of taggedResult.unresolvedEntries) {
    const suggestion = entry.suggestion;
    const paragraph = entry.paragraph;
    if (paragraph) {
      const clearedBeforeTrackedFallback = result.clearedFallbackCount;
      const cleared = await clearHighlightForSuggestion(context, paragraph, suggestion, {
        skipTagLookup: true,
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
      continue;
    }
    resetSuggestionMarkerState(suggestion);
    result.failedCount += 1;
  }
  if (needsFinalSync) {
    try {
      await context.sync();
    } catch (syncErr) {
      warn("clearOnlineSuggestionMarkers: final sync failed", syncErr);
    }
  }
  if (!suggestionsOverride) {
    resetPendingSuggestionsOnline();
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

function findWordTokenStartByHintInText(text, rawToken, hintIndex, occurrence) {
  const tokenRaw = typeof rawToken === "string" ? rawToken.trim() : "";
  if (!tokenRaw || !text) return -1;
  const token = tokenRaw.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
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

  if (safeHint === null) {
    return positions[Math.min(safeOccurrence, positions.length - 1)];
  }

  let best = positions[0];
  let bestDist = Math.abs(positions[0] - safeHint);
  for (let i = 1; i < positions.length; i++) {
    const dist = Math.abs(positions[i] - safeHint);
    if (dist < bestDist) {
      best = positions[i];
      bestDist = dist;
    }
  }
  // Reject far matches; these are the main source of in-word corruption.
  if (bestDist > 24) return -1;
  return best;
}

const COMPANY_ABBREV_PATTERN = /\b(?:d\.\s*o\.\s*o\.|s\.\s*p\.|d\.\s*d\.|k\.\s*d\.|d\.\s*n\.\s*o\.)\b/iu;

function resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion) {
  const meta = suggestion?.meta?.anchor;
  if (!meta) return { op: null, skipReason: "insert_missing_anchor_meta" };
  let skipReason = "insert_unresolved";

  const beforeAnchor = meta.sourceTokenBefore ?? meta.targetTokenBefore;
  const afterAnchor = meta.sourceTokenAfter ?? meta.targetTokenAfter;

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
    typeof value === "string" && /^[\s"'«»“”„’)\]]+$/.test(value);
  // In Word content, angled quotes can surface in either direction around boundaries.
  // Treat both « and » as quote chars when normalizing insert positions.
  const isClosingQuoteOrCloser = (char) => /["'«»”’)\]]/.test(char || "");
  const isOpeningQuoteOrOpener = (char) => /["'«»“„(\[]/.test(char || "");
  const normalizeInsertPosForQuoteBoundary = (pos) => {
    if (!Number.isFinite(pos) || pos < 0 || pos > snapshotText.length) return pos;
    let left = pos - 1;
    while (left >= 0 && /\s/.test(snapshotText[left])) left--;
    let right = pos;
    while (right < snapshotText.length && /\s/.test(snapshotText[right])) right++;
    if (
      left >= 0 &&
      right < snapshotText.length &&
      isClosingQuoteOrCloser(snapshotText[left]) &&
      isOpeningQuoteOrOpener(snapshotText[right])
    ) {
      return left + 1;
    }
    // Also catch insert positions that land at the start of the next word:
    // ...'<space>'Word  -> move comma after the closing quote.
    if (left >= 0 && isOpeningQuoteOrOpener(snapshotText[left])) {
      let prev = left - 1;
      while (prev >= 0 && /\s/.test(snapshotText[prev])) prev--;
      if (prev >= 0 && isClosingQuoteOrCloser(snapshotText[prev])) {
        return prev + 1;
      }
    }
    return pos;
  };

  const hasCompanyAbbreviationNear = (center, radius = 72) => {
    if (!Number.isFinite(center) || center < 0 || center > snapshotText.length) return false;
    const start = Math.max(0, center - radius);
    const end = Math.min(snapshotText.length, center + radius);
    return COMPANY_ABBREV_PATTERN.test(snapshotText.slice(start, end));
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
    pos = normalizeInsertPosForQuoteBoundary(Math.max(0, Math.min(snapshotText.length, pos)));
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
      snippet: snapshotText.slice(Math.max(0, pos - 6), Math.min(snapshotText.length, pos + 6)),
    };
  };

  // Best path: replace exact whitespace gap between before/after anchors.
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
          return { op: {
            kind: "insert",
            start: normalizeInsertPosForQuoteBoundary(beforeEnd),
            end: normalizeInsertPosForQuoteBoundary(beforeEnd),
            replacement: ",",
            snippet: gap || before.token,
          }, skipReason: null };
        }
        // Quote boundary adjacency (e.g. "'foo' 'bar'"): insert after closing quote.
        if (isQuoteOrSpaceBoundary(gap)) {
          let insertPos = beforeEnd;
          while (
            insertPos < after.start &&
            isClosingQuoteOrCloser(snapshotText[insertPos])
          ) {
            insertPos++;
          }
          const boundarySegment = snapshotText.slice(insertPos, after.start);
          if (/,\s*$/.test(boundarySegment) || /^\s*,/.test(boundarySegment)) {
            return { op: { kind: "noop" }, skipReason: null };
          }
          return { op: {
            kind: "insert",
            start: normalizeInsertPosForQuoteBoundary(insertPos),
            end: normalizeInsertPosForQuoteBoundary(insertPos),
            replacement: ",",
            snippet: gap || before.token,
          }, skipReason: null };
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
      while (wsStart > 0 && /\s/.test(snapshotText[wsStart - 1])) wsStart--;
      if (wsStart < after.start) {
        return { op: {
          kind: "insert",
          start: normalizeInsertPosForQuoteBoundary(wsStart),
          end: normalizeInsertPosForQuoteBoundary(wsStart),
          replacement: ",",
          snippet: snapshotText.slice(wsStart, after.start),
        }, skipReason: null };
      }
      const safePos = normalizeInsertPosForQuoteBoundary(after.start);
      return { op: {
        kind: "insert",
        start: safePos,
        end: safePos,
        replacement: ",",
        snippet: snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1)),
      }, skipReason: null };
    }
  }

  // Secondary path: normalize whitespace right after "before" token.
  if (beforeAnchor) {
    const before = findStartForAnchor(beforeAnchor, true, "insert_before_anchor_lookup_failed");
    if (before.start >= 0) {
      const beforeEnd = before.start + before.token.length;
      let wsEnd = beforeEnd;
      while (wsEnd < snapshotText.length && /\s/.test(snapshotText[wsEnd])) wsEnd++;
      if (wsEnd > beforeEnd) {
        return { op: {
          kind: "insert",
          start: normalizeInsertPosForQuoteBoundary(beforeEnd),
          end: normalizeInsertPosForQuoteBoundary(beforeEnd),
          replacement: ",",
          snippet: snapshotText.slice(beforeEnd, wsEnd),
        }, skipReason: null };
      }
      const safePos = normalizeInsertPosForQuoteBoundary(beforeEnd);
      return { op: {
        kind: "insert",
        start: safePos,
        end: safePos,
        replacement: ",",
        snippet: snapshotText.slice(Math.max(0, safePos - 1), Math.min(snapshotText.length, safePos + 1)),
      }, skipReason: null };
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
    return /^[\s"'Â»â€â€™)\]]*$/.test(gap);
  }
  return /^[\s"'Â«â€œâ€žâ€˜(\[]*$/.test(gap);
}

function hasStrongDeleteContext(snapshotText, sourceText, suggestion, commaIndex) {
  const meta = suggestion?.meta?.anchor;
  if (!meta || typeof snapshotText !== "string" || !snapshotText) return false;
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
      const mappedHint =
        Number.isFinite(sourceHint) && typeof sourceText === "string"
          ? mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint)
          : null;
      const start = findWordTokenStartByHintInText(
        snapshotText,
        token,
        mappedHint,
        beforeAnchor.textOccurrence ?? beforeAnchor.tokenIndex ?? 0
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
      const mappedHint =
        Number.isFinite(sourceHint) && typeof sourceText === "string"
          ? mapIndexAcrossCanonical(sourceText, snapshotText, sourceHint)
          : null;
      const start = findWordTokenStartByHintInText(
        snapshotText,
        token,
        mappedHint,
        afterAnchor.textOccurrence ?? afterAnchor.tokenIndex ?? 0
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

  const mappedStart = mapIndexAcrossCanonical(sourceText, snapshotText, charStart);
  let commaIndex = -1;
  const maxDelta = 1;
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
    const charAligned = Math.abs(commaIndex - mappedStart) <= 1;
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

function buildParagraphOperationsPlan(snapshotText, sourceText, suggestions) {
  const rawPlan = [];
  const skipped = [];
  const noop = [];

  for (const suggestion of suggestions) {
    let opResult = { op: null, skipReason: "planner_unknown" };
    if (suggestion?.kind === "delete") {
      opResult = resolveDeleteOperationFromSnapshot(snapshotText, sourceText, suggestion);
    } else {
      opResult = resolveInsertOperationFromSnapshot(snapshotText, sourceText, suggestion);
    }
    const op = opResult?.op ?? null;

    if (!op) {
      skipped.push({
        suggestion,
        reason: opResult?.skipReason || "planner_unresolved",
      });
      continue;
    }
    if (op.kind === "noop") {
      noop.push(suggestion);
      continue;
    }
    rawPlan.push({
      ...op,
      suggestions: [suggestion],
      sortPos: getSuggestionSortPos(suggestion),
    });
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

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("Počakajte, da se pregled dokumenta zaključi, nato poskusite znova.");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`applyAllSuggestionsOnline: restored ${restored} pending suggestions from storage`);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    warn("applyAllSuggestionsOnline: no pending suggestions");
    return finalize("noop", "no-pending-suggestions");
  }
  const autoApplySuggestions = [];
  const retainedSuggestions = [];
  for (const sug of pendingSuggestionsOnline) {
    if (isSuggestionAutoApplyEligibleOnline(sug)) {
      autoApplySuggestions.push(sug);
    } else {
      retainedSuggestions.push(sug);
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
          failedSuggestions.push(...op.suggestions);
          summary.failedSuggestions += opSuggestionCount;
          applyFailedCount++;
          continue;
        }
        try {
          const insertLocation =
            op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace;
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
    }
    pendingSuggestionsOnline.length = 0;
    if (retainedSuggestions.length) {
      pendingSuggestionsOnline.push(...retainedSuggestions);
    }
    if (failedSuggestions.length) {
      pendingSuggestionsOnline.push(...failedSuggestions);
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
    return finalize("applied");
  }
  if (summary.appliedSuggestions > 0 || summary.failedSuggestions > 0) {
    return finalize("partial", summary.failedSuggestions > 0 ? "some-operations-failed" : null);
  }
  return finalize("noop", "no-effective-operations");
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

  const scanCompleted = await waitForOnlineScanCompletion();
  if (!scanCompleted) {
    queueScanNotification("Počakajte, da se pregled dokumenta zaključi, nato poskusite znova.");
    flushScanNotifications();
    return finalize("deferred", "scan-in-progress");
  }
  if (!pendingSuggestionsOnline.length) {
    const restored = restorePendingSuggestionsOnline();
    summary.restored = restored;
    if (restored > 0) {
      log(`rejectAllSuggestionsOnline: restored ${restored} pending suggestions from storage`);
    }
  }
  summary.pendingBefore = pendingSuggestionsOnline.length;
  if (!pendingSuggestionsOnline.length) {
    return finalize("noop", "no-pending-suggestions");
  }
  await Word.run(async (context) => {
    const clearResult = await wordOnlineAdapter.clearHighlights(context, null, null);
    summary.clearedMarkers =
      (clearResult?.clearedByTagCount || 0) + (clearResult?.clearedFallbackCount || 0);
    summary.failedClear = clearResult?.failedCount || 0;
    await context.sync();
  });
  if (summary.failedClear > 0) {
    return finalize(summary.clearedMarkers > 0 ? "partial" : "noop", "some-marker-clear-failures");
  }
  return finalize(summary.clearedMarkers > 0 ? "cleared" : "noop");
}
/** ─────────────────────────────────────────────────────────
 *  MAIN: Preveri vejice – celoten dokument, po odstavkih
 *  ───────────────────────────────────────────────────────── */
export async function checkDocumentText() {
  if (documentCheckInProgress) {
    warn("checkDocumentText ignored: document check already in progress");
    queueScanNotification("Pregled dokumenta že poteka.");
    flushScanNotifications();
    return;
  }
  documentCheckInProgress = true;
  resetNotificationFlags();
  try {
    if (isWordOnline()) {
      return await checkDocumentTextOnline();
    }
    return await checkDocumentTextDesktop();
  } finally {
    documentCheckInProgress = false;
  }
}

async function checkDocumentTextDesktop() {
  log("START checkDocumentText()");
  let totalInserted = 0;
  let totalDeleted = 0;
  let paragraphsProcessed = 0;
  let apiErrors = 0;
  let nonCommaSkips = 0;

  try {
    await Word.run(async (context) => {
      log("Desktop phase: tracked-change guard:start");
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        return;
      }
      log("Desktop phase: tracked-change guard:done");

      // On desktop we require the user to enable Track Changes manually.
      const doc = context.document;
      try {
        log("Desktop phase: doc.load(trackRevisions) -> sync:start");
        doc.load("trackRevisions");
        await context.sync();
        log("Desktop phase: doc.load(trackRevisions) -> sync:done");
        if (!doc.trackRevisions) {
          notifyTrackChangesRequired();
          return;
        }
      } catch (trackErr) {
        warn("trackRevisions not available -> require manual enablement", trackErr);
        notifyTrackChangesRequired();
        return;
      }

      log("Desktop phase: getParagraphs:start");
      const paras = await wordDesktopAdapter.getParagraphs(context);
      log("Desktop phase: getParagraphs:done");
      log("Paragraphs found:", paras.items.length);
      anchorProvider.reset();
      let documentCharOffset = 0;

      for (let idx = 0; idx < paras.items.length; idx++) {
        const paragraph = paras.items[idx];
        const sourceText = paragraph.text || "";
        const normalizedSource = normalizeParagraphWhitespace(sourceText);
        const trimmed = normalizedSource.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += sourceText.length + 1;
        if (!trimmed) {
          await anchorProvider.getAnchors({
            paragraphIndex: idx,
            originalText: sourceText,
            correctedText: sourceText,
            sourceTokens: [],
            targetTokens: [],
            documentOffset: paragraphDocOffset,
          });
          continue;
        }
        if (trimmed.length > MAX_PARAGRAPH_CHARS) {
          notifyParagraphTooLong(idx, trimmed.length);
          continue;
        }

        const pStart = tnow();
        paragraphsProcessed++;
        log(`P${idx}: len=${sourceText.length} | "${SNIP(trimmed)}"`);

        let result;
        try {
          result = await commaEngine.analyzeParagraph({
            paragraphIndex: idx,
            originalText: sourceText,
            normalizedOriginalText: normalizedSource,
            paragraphDocOffset,
          });
        } catch (err) {
          apiErrors++;
          warn(`P${idx}: engine failed`, err);
          notifyApiUnavailable();
          continue;
        }
        apiErrors += result.apiErrors;
        nonCommaSkips += result.nonCommaSkips || 0;
        const suggestions = result.suggestions || [];
        if (!suggestions.length) continue;

        const anchorsEntry = anchorProvider.getAnchorsForParagraph(idx);
        const snapshotText = sourceText;
        const sourceForPlan = anchorsEntry?.originalText ?? sourceText;
        const { plan, skipped, noop } = buildParagraphOperationsPlan(
          snapshotText,
          sourceForPlan,
          suggestions
        );
        log("Desktop apply plan", {
          paragraphIndex: idx,
          total: suggestions.length,
          planned: plan.length,
          skipped: skipped.length,
          noop: noop.length,
          skippedByReason: summarizeSkippedReasons(skipped),
        });

        let appliedInParagraph = 0;
        const plannedRanges = await getRangesForPlannedOperations(
          context,
          paragraph,
          snapshotText,
          plan,
          "desktop-batch"
        );
        for (let opIndex = 0; opIndex < plan.length; opIndex++) {
          const op = plan[opIndex];
          const range = plannedRanges[opIndex];
          if (!range) {
            warn("Desktop batch op skipped: range not resolved", {
              paragraphIndex: idx,
              opIndex,
              kind: op?.kind,
            });
            continue;
          }
          try {
            const insertLocation =
              op.kind === "insert" ? Word.InsertLocation.before : Word.InsertLocation.replace;
            range.insertText(op.replacement, insertLocation);
            appliedInParagraph += op.suggestions?.length || 1;
            for (const suggestion of op.suggestions || []) {
              if (suggestion.kind === "insert") {
                totalInserted++;
              } else if (suggestion.kind === "delete") {
                totalDeleted++;
              }
            }
          } catch (err) {
            warn("Desktop batch op failed", err);
          }
        }
        if (appliedInParagraph) {
          if (anchorProviderSupportsCharHints) {
            await ensureCommaSpaceAfterInParagraph(context, paragraph);
            log("Desktop post-pass: ensured missing spaces after commas.");
          } else {
            await normalizeCommaSpacingInParagraph(context, paragraph);
          }
          log(
            `P${idx}: applied (ins=${totalInserted}, del=${totalDeleted}) | ${Math.round(
              tnow() - pStart
            )} ms`
          );
        }
      }
    });

    log(
      "DONE checkDocumentText() | paragraphs:",
      paragraphsProcessed,
      "| inserted:",
      totalInserted,
      "| deleted:",
      totalDeleted,
      "| apiErrors:",
      apiErrors,
      "| nonCommaSkips:",
      nonCommaSkips
    );
    if (
      paragraphsProcessed > 0 &&
      totalInserted === 0 &&
      totalDeleted === 0 &&
      apiErrors === 0 &&
      nonCommaSkips === 0
    ) {
      notifyNoIssuesFound();
    }
  } catch (e) {
    errL("ERROR in checkDocumentText:", e);
  } finally {
    flushScanNotifications();
  }
}

async function checkDocumentTextOnline() {
  if (onlineScanInProgress) {
    warn("checkDocumentTextOnline skipped: scan already in progress");
    queueScanNotification("Pregled dokumenta že poteka.");
    flushScanNotifications();
    return;
  }
  onlineScanInProgress = true;
  log("START checkDocumentTextOnline()");
  let paragraphsProcessed = 0;
  let suggestionsDetected = 0;
  let suggestions = 0;
  let apiErrors = 0;
  let nonCommaSkips = 0;

  try {
    await Word.run(async (context) => {
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        return;
      }
      const paras = await wordOnlineAdapter.getParagraphs(context);
      await wordOnlineAdapter.clearHighlights(context, null, paras);
      resetPendingSuggestionsOnline();
      anchorProvider.reset();

      let documentCharOffset = 0;
      let pendingHighlightParagraphs = 0;
      let pendingHighlightSuggestions = 0;

      for (let idx = 0; idx < paras.items.length; idx++) {
        const p = paras.items[idx];
        const original = p.text || "";
        const normalizedOriginal = normalizeParagraphWhitespace(original);
        const trimmed = normalizedOriginal.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += original.length + 1;
        if (!trimmed) {
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
          continue;
        }
        if (trimmed.length > MAX_PARAGRAPH_CHARS) {
          notifyParagraphTooLong(idx, trimmed.length);
          continue;
        }

        log(`P${idx} ONLINE: len=${original.length} | "${SNIP(trimmed)}"`);
        paragraphsProcessed++;
        try {
          const result = await commaEngine.analyzeParagraph({
            paragraphIndex: idx,
            originalText: original,
            normalizedOriginalText: normalizedOriginal,
            paragraphDocOffset,
          });
          apiErrors += result.apiErrors;
          nonCommaSkips += result.nonCommaSkips || 0;
          suggestionsDetected += result.suggestions?.length || 0;
          if (!result.suggestions?.length) continue;
          let highlightedInParagraph = 0;
          for (const suggestionObj of result.suggestions) {
            const highlighted = await wordOnlineAdapter.highlightSuggestion(context, p, suggestionObj);
            if (highlighted) {
              suggestions++;
              highlightedInParagraph++;
            }
          }
          // Flush in small batches: still visible during scan, fewer sync calls.
          if (highlightedInParagraph > 0) {
            pendingHighlightParagraphs++;
            pendingHighlightSuggestions += highlightedInParagraph;
            const shouldFlushNow =
              pendingHighlightParagraphs >= ONLINE_HIGHLIGHT_FLUSH_PARAGRAPHS ||
              pendingHighlightSuggestions >= ONLINE_HIGHLIGHT_FLUSH_SUGGESTIONS;
            if (shouldFlushNow) {
              await context.sync();
              pendingHighlightParagraphs = 0;
              pendingHighlightSuggestions = 0;
            }
          }
        } catch (paragraphErr) {
          apiErrors++;
          warn(`P${idx} ONLINE: paragraph processing failed`, paragraphErr);
          notifyApiUnavailable();
        }
      }

      await context.sync();
    });

    log(
      "DONE checkDocumentTextOnline() | paragraphs:",
      paragraphsProcessed,
      "| suggestions:",
      suggestions,
      "| detected:",
      suggestionsDetected,
      "| apiErrors:",
      apiErrors,
      "| nonCommaSkips:",
      nonCommaSkips
    );
    if (
      paragraphsProcessed > 0 &&
      suggestionsDetected > 0 &&
      suggestions === 0 &&
      apiErrors === 0 &&
      nonCommaSkips === 0
    ) {
      queueScanNotification(MARKER_RENDER_FAILED_MESSAGE);
    }
    if (paragraphsProcessed > 0 && suggestionsDetected === 0 && apiErrors === 0 && nonCommaSkips === 0) {
      notifyNoIssuesFound();
    }
  } catch (e) {
    errL("ERROR in checkDocumentTextOnline:", e);
  } finally {
    onlineScanInProgress = false;
    flushScanNotifications();
  }
}

