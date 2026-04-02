/* global window, process, performance, console, setTimeout */
// src/api/apiVejice.js
import axios from "axios";
import { isWordOnline } from "../utils/host.js";

const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const parseQuietBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};
const QUIET_LOGS_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_QUIET_LOGS__ === "boolean"
    ? window.__VEJICE_QUIET_LOGS__
    : typeof process !== "undefined"
      ? parseQuietBoolean(process.env?.VEJICE_QUIET_LOGS)
      : undefined;
const ONLINE_VERBOSE_LOGS_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_ONLINE_VERBOSE_LOGS__ === "boolean"
    ? window.__VEJICE_ONLINE_VERBOSE_LOGS__
    : typeof process !== "undefined"
      ? parseQuietBoolean(process.env?.VEJICE_ONLINE_VERBOSE_LOGS)
      : undefined;
const QUIET_LOGS = true;
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const isOnlineVerboseLogsEnabled = () => {
  if (typeof window !== "undefined") {
    const direct = parseQuietBoolean(window.__VEJICE_ONLINE_VERBOSE_LOGS__);
    if (typeof direct === "boolean") return direct;
  }
  if (typeof ONLINE_VERBOSE_LOGS_OVERRIDE === "boolean") {
    return ONLINE_VERBOSE_LOGS_OVERRIDE;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseQuietBoolean(process.env?.VEJICE_ONLINE_VERBOSE_LOGS);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return false;
};
const shouldEmitApiRuntimeLogs = () =>
  (isOnlineVerboseLogsEnabled() && isWordOnline()) || (!QUIET_LOGS && DEBUG);
const log = (...a) => shouldEmitApiRuntimeLogs() && console.log("[Vejice API]", ...a);
const QUOTE_TRACE_REGEX = /["'`\u00AB\u00BB\u2039\u203A\u2018\u2019\u201A\u201C\u201D\u201E]/u;
function isQuoteTraceEnabled() {
  if (!((isOnlineVerboseLogsEnabled() && isWordOnline()) || !QUIET_LOGS)) return false;
  if (typeof window !== "undefined") {
    const parsed = parseQuietBoolean(window.__VEJICE_QUOTE_TRACE__);
    if (typeof parsed === "boolean") return parsed;
  }
  if (typeof process !== "undefined") {
    const parsed = parseQuietBoolean(process.env?.VEJICE_QUOTE_TRACE);
    if (typeof parsed === "boolean") return parsed;
  }
  return false;
}
function quoteTraceLog(stage, payload = {}) {
  if (!isQuoteTraceEnabled()) return;
  try {
    console.log("[Vejice QUOTE TRACE][api]", stage, payload);
  } catch (_err) {
    // Ignore console failures in constrained runtimes.
  }
}
const MAX_SNIPPET = 120;
const snip = (s) => (typeof s === "string" ? s.slice(0, MAX_SNIPPET) : s);

function resolveApiUrl() {
  const winOverride =
    typeof window !== "undefined" && typeof window.__VEJICE_API_URL === "string"
      ? window.__VEJICE_API_URL.trim()
      : "";
  if (winOverride) return winOverride;

  const envUrl =
    typeof process !== "undefined" && typeof process.env?.VEJICE_API_URL === "string"
      ? process.env.VEJICE_API_URL.trim()
      : "";
  if (envUrl) return envUrl;

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/postavi_vejice`;
  }
  return "/api/postavi_vejice";
}

const API_URL = resolveApiUrl();

function isLocalhostHostname(hostname = "") {
  const normalized = typeof hostname === "string" ? hostname.trim().toLowerCase() : "";
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function isLocalApiTarget(url = "") {
  const safeUrl = typeof url === "string" ? url.trim() : "";
  if (safeUrl) {
    try {
      const baseOrigin =
        typeof window !== "undefined" && typeof window.location?.origin === "string"
          ? window.location.origin
          : "http://localhost";
      const parsed = new URL(safeUrl, baseOrigin);
      if (isLocalhostHostname(parsed.hostname)) return true;
    } catch (_err) {
      // Fall through to origin-based heuristic.
    }
  }
  return (
    typeof window !== "undefined" &&
    typeof window.location?.hostname === "string" &&
    isLocalhostHostname(window.location.hostname)
  );
}

const USE_LOCAL_RETRY_PROFILE = isLocalApiTarget(API_URL);

const API_KEY =
  (typeof window !== "undefined" && window.__VEJICE_API_KEY) ||
  (typeof process !== "undefined" && process.env?.VEJICE_API_KEY) ||
  "";
const DEFAULT_API_MAX_ATTEMPTS = 2;
const LOCAL_API_MAX_ATTEMPTS = 2;
const DEFAULT_API_RETRY_BASE_DELAY_MS = 400;
const DEFAULT_API_RETRY_MAX_DELAY_MS = 2500;
const DEFAULT_API_RETRY_JITTER_MS = 250;
const LOCAL_API_RETRY_BASE_DELAY_MS = 150;
const LOCAL_API_RETRY_MAX_DELAY_MS = 900;
const LOCAL_API_RETRY_JITTER_MS = 90;
const DEFAULT_API_CIRCUIT_BREAKER_THRESHOLD = 4;
const DEFAULT_API_CIRCUIT_BREAKER_COOLDOWN_MS = 20000;

const boolFromString = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};

const delayMs = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason || new Error("Request aborted"));
      return;
    }
    let timerId = null;
    const onAbort = () => {
      if (timerId != null) {
        clearTimeout(timerId);
      }
      reject(signal.reason || new Error("Request aborted"));
    };
    timerId = setTimeout(() => {
      if (typeof signal?.removeEventListener === "function") {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);
    if (typeof signal?.addEventListener === "function") {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });

function isAbortLikeError(err, signal) {
  if (signal?.aborted) return true;
  const code = typeof err?.code === "string" ? err.code.toUpperCase() : "";
  const name = typeof err?.name === "string" ? err.name : "";
  return code === "ERR_CANCELED" || name === "AbortError" || name === "CanceledError";
}

const envMockFlag =
  typeof process !== "undefined" ? boolFromString(process.env?.VEJICE_USE_MOCK ?? "") : undefined;
const winMockFlag =
  typeof window !== "undefined" && typeof window.__VEJICE_USE_MOCK__ === "boolean"
    ? window.__VEJICE_USE_MOCK__
    : undefined;
let USE_MOCK = false;
if (typeof winMockFlag === "boolean") {
  USE_MOCK = winMockFlag;
} else if (typeof envMockFlag === "boolean") {
  USE_MOCK = envMockFlag;
}

export class VejiceApiError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "VejiceApiError";
    this.meta = meta;
    if (meta.cause) this.cause = meta.cause;
  }
}

function describeAxiosError(err) {
  const status = err?.response?.status;
  const code = err?.code; // e.g. 'ECONNABORTED'
  const data = err?.response?.data;
  const msg = err?.message;
  return {
    status,
    code,
    msg,
    dataPreview: typeof data === "string" ? snip(data) : data && Object.keys(data),
  };
}

const MOCK_LATENCY_MS = 350;
const MOCK_INSERT_KEYWORDS = ["ki", "ker", "ko", "kjer", "da", "zato", "toda"];

function insertCommaBeforeKeyword(sentence = "", keyword) {
  if (!sentence || !keyword) return null;
  const lower = sentence.toLowerCase();
  const needle = ` ${keyword.toLowerCase()}`;
  const idx = lower.indexOf(needle);
  if (idx > 0) {
    const before = sentence[idx - 1];
    if (before && before !== "," && before !== "\n") {
      return sentence.slice(0, idx) + "," + sentence.slice(idx);
    }
  }
  return null;
}

function removeRedundantComma(sentence = "") {
  const double = sentence.indexOf(", ,");
  if (double >= 0) {
    return sentence.slice(0, double) + sentence.slice(double + 1);
  }
  const beforeAnd = sentence.indexOf(", in");
  if (beforeAnd >= 0) {
    return sentence.slice(0, beforeAnd) + sentence.slice(beforeAnd + 1);
  }
  return null;
}

function mockCorrectSentence(sentence = "") {
  let corrected = sentence;
  for (const keyword of MOCK_INSERT_KEYWORDS) {
    const updated = insertCommaBeforeKeyword(corrected, keyword);
    if (updated) {
      corrected = updated;
      return corrected;
    }
  }
  const removed = removeRedundantComma(corrected);
  if (removed) return removed;
  return corrected;
}

function tokenizeForMock(text = "", prefix = "t") {
  if (typeof text !== "string" || !text.length) return [];
  const tokens = [];
  const isWordChar = (char) => /[\p{L}\p{N}]/u.test(char || "");
  const isInnerWordJoiner = (char) => /['\u2019`-]/u.test(char || "");
  // Define ONLY true quotation marks - NOT apostrophes which are inner word joiners
  // Include: straight double quotes ("), curly quotes (""), guillemets («»)
  // Exclude: apostrophes (') and right single quote (\u2019) which are word joiners
  const isQuoteChar = (char) => /[""\u201C\u201D\u00AB\u00BB]/u.test(char || "");
  let idx = 1;
  let cursor = 0;
  while (cursor < text.length) {
    while (cursor < text.length && /\s/u.test(text[cursor])) cursor++;
    if (cursor >= text.length) break;
    const start = cursor;
    let end = cursor + 1;
    const first = text[start];
    // True quotation marks are always separate tokens for Slovenian comma placement
    if (isQuoteChar(first)) {
      end = start + 1;
    } else if (isWordChar(first)) {
      while (end < text.length) {
        const next = text[end];
        if (isWordChar(next)) {
          end++;
          continue;
        }
        // Stop at true quote characters - they'll be tokenized separately
        if (isQuoteChar(next)) {
          break;
        }
        // But DO continue through inner word joiners (apostrophes, dashes, backticks)
        if (
          isInnerWordJoiner(next) &&
          end + 1 < text.length &&
          isWordChar(text[end + 1])
        ) {
          end++;
          continue;
        }
        break;
      }
    } else if (first === "." && text.slice(start, start + 3) === "...") {
      end = start + 3;
    }
    const tokenText = text.slice(start, end);
    tokens.push({
      token_id: `${prefix}${idx++}`,
      token: tokenText,
      start_char: start,
      end_char: end,
    });
    cursor = end;
  }
  return tokens;
}

async function mockRequestPopravljenPoved(poved = "") {
  return new Promise((resolve) => {
    setTimeout(() => {
      const correctedText = mockCorrectSentence(poved);
      resolve({
        correctedText,
        raw: {
          source_text: poved,
          target_text: correctedText,
          source_tokens: tokenizeForMock(poved, "s"),
          target_tokens: tokenizeForMock(correctedText, "t"),
        },
      });
    }, MOCK_LATENCY_MS);
  });
}

function pickCorrectedText(fallback, payload = {}) {
  const targetTextFromTokens = tokensToSentenceText(
    pickFirstArray([payload.target_tokens, payload.targetTokens, payload.target])
  );
  const correctionArray = Array.isArray(payload.corrections) ? payload.corrections : [];
  const applyCorrections = Array.isArray(payload.apply_corrections) ? payload.apply_corrections : [];
  const firstApplyCorrection = applyCorrections[0];
  const candidateTexts = [
    payload.popravljeno_besedilo,
    payload.corrected_text,
    payload.target_text,
    targetTextFromTokens,
    payload.popravki?.[0]?.predlog,
    correctionArray[0]?.suggested_text,
    firstApplyCorrection && typeof firstApplyCorrection === "object"
      ? firstApplyCorrection.suggested_text
      : undefined,
  ];
  for (const candidate of candidateTexts) {
    if (hasNonWhitespaceText(candidate)) return candidate;
  }
  return fallback;
}

function pickFirstArray(values = []) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function tokensToSentenceText(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return "";
  let out = "";
  for (const token of tokens) {
    if (typeof token === "string") {
      out = appendFragmentWithBoundaryDedup(out, token);
      continue;
    }
    if (!token || typeof token !== "object") continue;
    const base = firstDefinedValue([
      token.token,
      token.text,
      token.form,
      token.value,
      token.surface,
      token.word,
    ]);
    if (typeof base !== "string" || !base.length) continue;
    const leading = firstDefinedValue([
      token.leading_ws,
      token.leadingWhitespace,
      token.before,
      token.prefix,
    ]);
    const trailing = firstDefinedValue([
      token.whitespace,
      token.trailing_ws,
      token.trailingWhitespace,
      token.after,
      token.space,
    ]);
    let fragment = base;
    if (typeof leading === "string" && leading.length && !fragment.startsWith(leading)) {
      fragment = `${leading}${fragment}`;
    }
    if (typeof trailing === "string" && trailing.length && !fragment.endsWith(trailing)) {
      fragment = `${fragment}${trailing}`;
    }
    out = appendFragmentWithBoundaryDedup(out, fragment);
  }
  return out;
}

function appendFragmentWithBoundaryDedup(currentText = "", fragment = "") {
  if (typeof fragment !== "string" || !fragment.length) return currentText;
  if (typeof currentText !== "string" || !currentText.length) return fragment;
  const trailingWhitespace = currentText.match(/[\s\u200B-\u200D\uFEFF]+$/u)?.[0] || "";
  const leadingWhitespace = fragment.match(/^[\s\u200B-\u200D\uFEFF]+/u)?.[0] || "";
  if (trailingWhitespace && leadingWhitespace) {
    return `${currentText}${fragment.slice(leadingWhitespace.length)}`;
  }
  return `${currentText}${fragment}`;
}

function hasNonWhitespaceText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizePayloadTokenArrays(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const sourceTokens = pickFirstArray([raw.source_tokens, raw.sourceTokens, raw.source]);
  const targetTokens = pickFirstArray([raw.target_tokens, raw.targetTokens, raw.target]);
  if (!Array.isArray(raw.source_tokens) && sourceTokens.length) {
    raw.source_tokens = sourceTokens;
  }
  if (!Array.isArray(raw.target_tokens) && targetTokens.length) {
    raw.target_tokens = targetTokens;
  }
  return raw;
}

function isCorrectionGroupPayload(value) {
  if (Array.isArray(value)) {
    return value.some((entry) => entry && typeof entry === "object");
  }
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some((entry) => entry && typeof entry === "object");
}

function mergeCorrectionGroups(primary, secondary) {
  const merged = {};
  let syntheticIndex = 1;
  const appendCollection = (collection, prefix = "") => {
    if (Array.isArray(collection)) {
      for (const group of collection) {
        if (!group || typeof group !== "object") continue;
        let key = `${prefix}${syntheticIndex++}`;
        while (Object.prototype.hasOwnProperty.call(merged, key)) {
          key = `${prefix}${syntheticIndex++}`;
        }
        merged[key] = group;
      }
      return;
    }
    if (!collection || typeof collection !== "object") return;
    for (const [rawKey, group] of Object.entries(collection)) {
      if (!group || typeof group !== "object") continue;
      let key = String(rawKey || `${prefix}${syntheticIndex++}`);
      if (prefix) key = `${prefix}${key}`;
      while (Object.prototype.hasOwnProperty.call(merged, key)) {
        key = `${prefix}${syntheticIndex++}`;
      }
      merged[key] = group;
    }
  };
  appendCollection(primary);
  appendCollection(secondary, "applied_");
  return Object.keys(merged).length ? merged : undefined;
}

function pickCorrectionsPayload(rawPayload = {}) {
  const baseCorrections = isCorrectionGroupPayload(rawPayload?.corrections)
    ? rawPayload.corrections
    : undefined;
  const appliedCorrections = isCorrectionGroupPayload(rawPayload?.applied_corrections)
    ? rawPayload.applied_corrections
    : undefined;
  if (baseCorrections && appliedCorrections) {
    return mergeCorrectionGroups(baseCorrections, appliedCorrections);
  }
  return baseCorrections ?? appliedCorrections;
}

function isTransientError(info) {
  const status = info?.status;
  if (typeof status === "number") {
    // Retry only on infrastructure/rate/timeout statuses.
    // Treat hard 500 payload failures as non-transient to fail fast.
    if (status === 408 || status === 429 || status === 502 || status === 503 || status === 504) {
      return true;
    }
  }
  const code = typeof info?.code === "string" ? info.code.toUpperCase() : "";
  if (!code) return false;
  return [
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENOTFOUND",
    "EPIPE",
  ].includes(code);
}

function isCircuitBreakerEligibleError(info) {
  const status = info?.status;
  if (typeof status === "number") {
    // Keep retry behavior for all 5xx, but only trip the global breaker on
    // infrastructure-like failures (gateway/service unavailable/rate/timeout).
    if (status === 408 || status === 429 || status === 502 || status === 503 || status === 504) {
      return true;
    }
  }
  const code = typeof info?.code === "string" ? info.code.toUpperCase() : "";
  if (!code) return false;
  return [
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENOTFOUND",
    "EPIPE",
  ].includes(code);
}

function requiresApiKey(url) {
  return typeof url === "string" && /gpu-proc1\.cjvt\.si/i.test(url);
}

const DOT_GUARD_PLACEHOLDER = "\uE000";
const DATE_DOT_PATTERN = /\b(\d{1,2})\.\s*(\d{1,2})(?:\.\s*(\d{2,4}))?\b/g;
const INITIALS_DOT_PATTERN = /\b(?:[\p{L}]\.\s*){2,}/gu;
const SHORT_ABBREV_DOT_PATTERN = /\b[\p{L}]{1,3}\.(?=\s+\p{L})/gu;
const ORDINAL_DOT_PATTERN = /\b\d+\.(?=\s+\p{L})/g;
const DOT_GUARD_PATTERNS = [
  INITIALS_DOT_PATTERN,
  SHORT_ABBREV_DOT_PATTERN,
  ORDINAL_DOT_PATTERN,
  /\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g,
  /\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|gos|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|sep|okt|nov|dec|sv|st)\./giu,
  /\b(?:d\.\s*o\.\s*o\.|d\.\s*d\.|s\.\s*p\.|d\.\s*n\.\s*o\.|k\.\s*d\.)/giu,
];
function numberFromUnknown(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toBoundedIndex(value, maxLength) {
  const parsed = numberFromUnknown(value);
  if (!Number.isFinite(parsed)) return undefined;
  const max = Number.isFinite(maxLength) ? Math.max(0, Math.floor(maxLength)) : 0;
  const floored = Math.floor(parsed);
  return Math.max(0, Math.min(floored, max));
}

function firstDefinedValue(values = []) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function normalizeCommaOpKind(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[_\s-]+/g, "");
  if (!normalized) return null;
  if (["insert", "add", "plus", "create", "put"].includes(normalized)) return "insert";
  if (["delete", "remove", "minus", "drop"].includes(normalized)) return "delete";
  return null;
}

function normalizeQuoteIntent(value, sideHint = null) {
  if (typeof value !== "string") return null;
  const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!compact) return null;
  const normalizedSide = normalizeQuoteBoundarySide(sideHint);
  if (compact === "none") return "none";
  if (compact === "unknown") return "unknown";
  if (compact === "before") {
    return normalizedSide === "opening" ? "before_opening_quote" : "before_closing_quote";
  }
  if (compact === "after") {
    return normalizedSide === "opening" ? "after_opening_quote" : "after_closing_quote";
  }
  if (compact === "beforeopening" || compact === "openingbefore") return "before_opening_quote";
  if (compact === "afteropening" || compact === "openingafter") return "after_opening_quote";
  if (compact === "beforeclosing" || compact === "closingbefore") return "before_closing_quote";
  if (compact === "afterclosing" || compact === "closingafter") return "after_closing_quote";
  if (compact === "beforeclosingquote" || compact === "beforequote") return "before_closing_quote";
  if (compact === "afterclosingquote" || compact === "afterquote") return "after_closing_quote";
  if (compact === "beforeopeningquote") return "before_opening_quote";
  if (compact === "afteropeningquote") return "after_opening_quote";
  return null;
}

function normalizeQuoteBoundarySide(value) {
  if (typeof value !== "string") return null;
  const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!compact) return null;
  if (compact === "opening" || compact === "open" || compact === "left") return "opening";
  if (compact === "closing" || compact === "close" || compact === "right") return "closing";
  return null;
}

function parseLooseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value === "string") {
    const parsed = boolFromString(value);
    if (typeof parsed === "boolean") return parsed;
  }
  return null;
}

function inferQuoteIntentFromFlags(rawOp = {}) {
  const explicitBooleanIntent = [
    [
      firstDefinedValue([
        rawOp.before_closing_quote,
        rawOp.beforeClosingQuote,
        rawOp.comma_before_closing_quote,
        rawOp.commaBeforeClosingQuote,
        rawOp.is_before_closing_quote,
        rawOp.isBeforeClosingQuote,
      ]),
      "before_closing_quote",
    ],
    [
      firstDefinedValue([
        rawOp.after_closing_quote,
        rawOp.afterClosingQuote,
        rawOp.comma_after_closing_quote,
        rawOp.commaAfterClosingQuote,
        rawOp.is_after_closing_quote,
        rawOp.isAfterClosingQuote,
      ]),
      "after_closing_quote",
    ],
    [
      firstDefinedValue([
        rawOp.before_opening_quote,
        rawOp.beforeOpeningQuote,
        rawOp.comma_before_opening_quote,
        rawOp.commaBeforeOpeningQuote,
        rawOp.is_before_opening_quote,
        rawOp.isBeforeOpeningQuote,
      ]),
      "before_opening_quote",
    ],
    [
      firstDefinedValue([
        rawOp.after_opening_quote,
        rawOp.afterOpeningQuote,
        rawOp.comma_after_opening_quote,
        rawOp.commaAfterOpeningQuote,
        rawOp.is_after_opening_quote,
        rawOp.isAfterOpeningQuote,
      ]),
      "after_opening_quote",
    ],
  ];
  for (const [value, intent] of explicitBooleanIntent) {
    if (parseLooseBoolean(value) === true) return intent;
  }

  const beforeQuoteFlag = parseLooseBoolean(
    firstDefinedValue([
      rawOp.comma_before_quote,
      rawOp.commaBeforeQuote,
      rawOp.before_quote,
      rawOp.beforeQuote,
      rawOp.insert_before_quote,
      rawOp.insertBeforeQuote,
      rawOp.place_before_quote,
      rawOp.placeBeforeQuote,
      rawOp.is_before_quote,
      rawOp.isBeforeQuote,
    ])
  );
  const afterQuoteFlag = parseLooseBoolean(
    firstDefinedValue([
      rawOp.comma_after_quote,
      rawOp.commaAfterQuote,
      rawOp.after_quote,
      rawOp.afterQuote,
      rawOp.insert_after_quote,
      rawOp.insertAfterQuote,
      rawOp.place_after_quote,
      rawOp.placeAfterQuote,
      rawOp.is_after_quote,
      rawOp.isAfterQuote,
    ])
  );
  const quoteSide = normalizeQuoteBoundarySide(
    firstDefinedValue([
      rawOp.quote_side,
      rawOp.quoteSide,
      rawOp.boundary_quote_side,
      rawOp.boundaryQuoteSide,
      rawOp.quote_type,
      rawOp.quoteType,
    ])
  );
  if (beforeQuoteFlag === true) {
    return quoteSide === "opening" ? "before_opening_quote" : "before_closing_quote";
  }
  if (afterQuoteFlag === true) {
    return quoteSide === "opening" ? "after_opening_quote" : "after_closing_quote";
  }
  return null;
}

function extractCommaOps(rawPayload, sourceText = "", targetText = "") {
  const rawOps = Array.isArray(rawPayload?.comma_ops)
    ? rawPayload.comma_ops
    : Array.isArray(rawPayload?.commaOps)
      ? rawPayload.commaOps
      : [];
  if (!rawOps.length) return [];

  const sourceLen = typeof sourceText === "string" ? sourceText.length : 0;
  const targetLen = typeof targetText === "string" ? targetText.length : 0;
  const seen = new Set();
  const commaOps = [];

  for (let rawIndex = 0; rawIndex < rawOps.length; rawIndex++) {
    const rawOp = rawOps[rawIndex];
    if (!rawOp || typeof rawOp !== "object") continue;
    const kind = normalizeCommaOpKind(
      firstDefinedValue([rawOp.kind, rawOp.type, rawOp.op, rawOp.action])
    );
    if (!kind) continue;

    const originalCandidate = firstDefinedValue([
      rawOp.original_pos,
      rawOp.originalPos,
      rawOp.source_pos,
      rawOp.sourcePos,
      rawOp.source_index,
      rawOp.sourceIndex,
      rawOp.original_index,
      rawOp.originalIndex,
      kind === "delete" ? rawOp.pos : undefined,
    ]);
    const correctedCandidate = firstDefinedValue([
      rawOp.corrected_pos,
      rawOp.correctedPos,
      rawOp.target_pos,
      rawOp.targetPos,
      rawOp.target_index,
      rawOp.targetIndex,
      kind === "insert" ? rawOp.pos : undefined,
    ]);
    const quoteSideHint = firstDefinedValue([
      rawOp.quote_side,
      rawOp.quoteSide,
      rawOp.boundary_quote_side,
      rawOp.boundaryQuoteSide,
      rawOp.quote_type,
      rawOp.quoteType,
      rawOp.boundary_side,
      rawOp.boundarySide,
      rawOp.side,
    ]);
    const explicitIntentRaw = firstDefinedValue([
      rawOp.explicit_quote_intent,
      rawOp.explicitQuoteIntent,
      rawOp.quote_intent,
      rawOp.quoteIntent,
      rawOp.quote_policy,
      rawOp.quotePolicy,
    ]);
    const explicitQuoteIntentFromPayload = normalizeQuoteIntent(explicitIntentRaw, quoteSideHint);
    const explicitQuoteIntentFromFlags = inferQuoteIntentFromFlags(rawOp);
    const explicitQuoteIntent = explicitQuoteIntentFromPayload ?? explicitQuoteIntentFromFlags;
    const explicitQuoteIntentSource = explicitQuoteIntentFromPayload
      ? "payload_explicit"
      : explicitQuoteIntentFromFlags
        ? "payload_flags"
        : null;

    let originalPos = toBoundedIndex(originalCandidate, sourceLen);
    let correctedPos = toBoundedIndex(correctedCandidate, targetLen);

    if (!Number.isFinite(originalPos) && !Number.isFinite(correctedPos)) continue;
    if (!Number.isFinite(originalPos)) originalPos = correctedPos;
    if (!Number.isFinite(correctedPos)) correctedPos = originalPos;

    const pos = kind === "delete" ? originalPos : correctedPos;
    const identity = `${kind}:${originalPos}:${correctedPos}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    const traceIdRaw = firstDefinedValue([rawOp.trace_id, rawOp.traceId, rawOp.op_id, rawOp.opId, rawOp.id]);
    const traceId =
      typeof traceIdRaw === "string" && traceIdRaw.trim()
        ? traceIdRaw.trim()
        : `api:${rawIndex}:${kind}:${originalPos}:${correctedPos}`;

    const normalizedOp = {
      kind,
      pos,
      originalPos,
      correctedPos,
      traceId,
    };
    if (explicitQuoteIntent) {
      normalizedOp.explicitQuoteIntent = explicitQuoteIntent;
      normalizedOp.explicitQuoteIntentSource = explicitQuoteIntentSource || "unknown";
    }
    commaOps.push(normalizedOp);
    const touchesQuoteByText =
      typeof sourceText === "string" &&
      (QUOTE_TRACE_REGEX.test(sourceText) || (typeof targetText === "string" && QUOTE_TRACE_REGEX.test(targetText)));
    if (explicitQuoteIntent || touchesQuoteByText) {
      quoteTraceLog("extract_comma_op", {
        traceId,
        index: rawIndex,
        kind,
        originalPos,
        correctedPos,
        explicitQuoteIntent: explicitQuoteIntent || null,
        explicitQuoteIntentSource: explicitQuoteIntentSource || null,
        sideHint: quoteSideHint || null,
      });
    }
  }

  return commaOps;
}

function tokenTextFromApiToken(token) {
  if (typeof token === "string") return token;
  if (!token || typeof token !== "object") return "";
  return (
    token.token ??
    token.text ??
    token.form ??
    token.value ??
    token.surface ??
    token.word ??
    ""
  );
}

function tokenIdFromApiToken(token, fallbackIndex = 0, prefix = "tok") {
  if (token && typeof token === "object") {
    const rawId =
      token.token_id ??
      token.tokenId ??
      token.id ??
      token.ID ??
      token.name ??
      token.key;
    if (typeof rawId === "string" && rawId.trim()) return rawId.trim();
  }
  return `${prefix}${fallbackIndex + 1}`;
}

function parseTokenOffset(value) {
  return numberFromUnknown(value);
}

function buildTokenPositionIndex(tokens = [], fallbackText = "") {
  const list = Array.isArray(tokens) ? tokens : [];
  const byId = Object.create(null);
  const ordered = [];
  let cursor = 0;
  const safeFallback = typeof fallbackText === "string" ? fallbackText : "";

  for (let i = 0; i < list.length; i++) {
    const token = list[i];
    const id = tokenIdFromApiToken(token, i);
    const text = tokenTextFromApiToken(token);
    const explicitStart = parseTokenOffset(
      token?.start_char ?? token?.startChar ?? token?.charStart ?? token?.start ?? token?.begin
    );
    const explicitEnd = parseTokenOffset(
      token?.end_char ?? token?.endChar ?? token?.charEnd ?? token?.end ?? token?.finish
    );
    let start = Number.isFinite(explicitStart) ? Math.max(0, Math.floor(explicitStart)) : cursor;
    let end = Number.isFinite(explicitEnd) && explicitEnd >= start
      ? Math.floor(explicitEnd)
      : start + (typeof text === "string" ? text.length : 0);
    if (safeFallback.length) {
      start = Math.max(0, Math.min(start, safeFallback.length));
      end = Math.max(start, Math.min(end, safeFallback.length));
    } else {
      start = Math.max(0, start);
      end = Math.max(start, end);
    }
    cursor = Math.max(cursor, end);
    const mapped = {
      id,
      text: typeof text === "string" ? text : "",
      start,
      end,
      tokenIndex: i,
    };
    byId[id] = mapped;
    ordered.push(mapped);
  }

  return {
    byId,
    ordered,
    combinedText: ordered.map((entry) => entry.text || "").join(""),
  };
}

function flattenCorrectionEntries(rawEntries, out = []) {
  if (Array.isArray(rawEntries)) {
    for (const entry of rawEntries) flattenCorrectionEntries(entry, out);
    return out;
  }
  if (rawEntries && typeof rawEntries === "object") out.push(rawEntries);
  return out;
}

function normalizeCorrectionOperationKind(value) {
  if (typeof value !== "string") return null;
  const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (!compact) return null;
  if (compact === "insert" || compact === "add" || compact === "plus" || compact === "create") return "insert";
  if (compact === "delete" || compact === "remove" || compact === "minus" || compact === "drop") return "delete";
  if (compact === "replace" || compact === "update" || compact === "substitute") return "replace";
  return null;
}

function normalizeSegmentForCommaCompare(value = "") {
  return (typeof value === "string" ? value : "").replace(/[\s\u200B-\u200D\uFEFF]+/gu, " ").trim();
}

function findInsertedCommaIndexFromSegments(sourceSegment = "", correctedSegment = "") {
  if (typeof correctedSegment !== "string" || !correctedSegment.includes(",")) return -1;
  const safeSource = typeof sourceSegment === "string" ? sourceSegment : "";
  const commaPositions = [];
  for (let i = 0; i < correctedSegment.length; i++) {
    if (correctedSegment[i] === ",") commaPositions.push(i);
  }
  for (const idx of commaPositions) {
    const withoutComma = `${correctedSegment.slice(0, idx)}${correctedSegment.slice(idx + 1)}`;
    if (normalizeSegmentForCommaCompare(withoutComma) === normalizeSegmentForCommaCompare(safeSource)) {
      return idx;
    }
  }
  if (!safeSource.includes(",") && commaPositions.length === 1) {
    return commaPositions[0];
  }
  return commaPositions.length ? commaPositions[commaPositions.length - 1] : -1;
}

function findRemovedCommaIndexFromSegments(sourceSegment = "", correctedSegment = "") {
  if (typeof sourceSegment !== "string" || !sourceSegment.includes(",")) return -1;
  const safeCorrected = typeof correctedSegment === "string" ? correctedSegment : "";
  const commaPositions = [];
  for (let i = 0; i < sourceSegment.length; i++) {
    if (sourceSegment[i] === ",") commaPositions.push(i);
  }
  for (const idx of commaPositions) {
    const withoutComma = `${sourceSegment.slice(0, idx)}${sourceSegment.slice(idx + 1)}`;
    if (normalizeSegmentForCommaCompare(withoutComma) === normalizeSegmentForCommaCompare(safeCorrected)) {
      return idx;
    }
  }
  return commaPositions.length ? commaPositions[commaPositions.length - 1] : -1;
}

const INVISIBLE_GAP_REGEX = /[\s\u200B-\u200D\uFEFF]/u;
const BOUNDARY_QUOTE_REGEX = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A()\[\]]/u;
const HARD_OPENING_QUOTE_CHARS = new Set(["\u00BB", "\u203A", "(", "["]);
const HARD_CLOSING_QUOTE_CHARS = new Set(["\u00AB", "\u2039", ")", "]"]);

function nearestVisibleCharLeft(text = "", startIndex = -1) {
  if (typeof text !== "string" || !text.length) return { char: "", index: -1 };
  let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : -1;
  while (idx >= 0 && INVISIBLE_GAP_REGEX.test(text[idx] || "")) idx--;
  return idx >= 0 ? { char: text[idx] || "", index: idx } : { char: "", index: -1 };
}

function nearestVisibleCharRight(text = "", startIndex = 0) {
  if (typeof text !== "string" || !text.length) return { char: "", index: -1 };
  let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : 0;
  while (idx < text.length && INVISIBLE_GAP_REGEX.test(text[idx] || "")) idx++;
  return idx < text.length ? { char: text[idx] || "", index: idx } : { char: "", index: -1 };
}

function classifyBoundaryQuoteRole(text = "", quoteIndex = -1) {
  if (!Number.isFinite(quoteIndex) || quoteIndex < 0 || quoteIndex >= text.length) {
    return null;
  }
  const char = text[quoteIndex] || "";
  if (!char) return null;
  if (HARD_OPENING_QUOTE_CHARS.has(char)) return "opening";
  if (HARD_CLOSING_QUOTE_CHARS.has(char)) return "closing";
  if (!BOUNDARY_QUOTE_REGEX.test(char)) return null;
  const left = nearestVisibleCharLeft(text, quoteIndex - 1).char;
  const right = nearestVisibleCharRight(text, quoteIndex + 1).char;
  const leftIsWord = /[\p{L}\p{N}]/u.test(left || "");
  const rightIsWord = /[\p{L}\p{N}]/u.test(right || "");
  const immediateLeft = quoteIndex > 0 ? text[quoteIndex - 1] || "" : "";
  const immediateRight = quoteIndex + 1 < text.length ? text[quoteIndex + 1] || "" : "";
  const leftAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateLeft || "");
  const rightAdjacentIsWord = /[\p{L}\p{N}]/u.test(immediateRight || "");
  const leftHasGap = INVISIBLE_GAP_REGEX.test(immediateLeft || "");
  const rightHasGap = INVISIBLE_GAP_REGEX.test(immediateRight || "");
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
}

function inferQuoteIntentFromBoundary(text = "", boundaryPos = -1) {
  if (typeof text !== "string" || !text.length || !Number.isFinite(boundaryPos) || boundaryPos < 0) return null;
  const safePos = Math.max(0, Math.min(Math.floor(boundaryPos), text.length));
  const skipBoundaryChars = (char) => INVISIBLE_GAP_REGEX.test(char || "") || char === ",";
  const scanLeft = (startIndex) => {
    let cursor = Number.isFinite(startIndex) ? Math.floor(startIndex) : -1;
    let probe = nearestVisibleCharLeft(text, cursor);
    while (probe.index >= 0 && skipBoundaryChars(probe.char)) {
      cursor = probe.index - 1;
      probe = nearestVisibleCharLeft(text, cursor);
    }
    return probe;
  };
  const scanRight = (startIndex) => {
    let cursor = Number.isFinite(startIndex) ? Math.floor(startIndex) : 0;
    let probe = nearestVisibleCharRight(text, cursor);
    while (probe.index >= 0 && skipBoundaryChars(probe.char)) {
      cursor = probe.index + 1;
      probe = nearestVisibleCharRight(text, cursor);
    }
    return probe;
  };
  const left = scanLeft(safePos - 1);
  const right = scanRight(safePos);
  if (right.index >= 0 && BOUNDARY_QUOTE_REGEX.test(right.char || "")) {
    const side = classifyBoundaryQuoteRole(text, right.index);
    if (side === "opening") return "before_opening_quote";
    if (side === "closing") return "before_closing_quote";
  }
  if (left.index >= 0 && BOUNDARY_QUOTE_REGEX.test(left.char || "")) {
    const side = classifyBoundaryQuoteRole(text, left.index);
    if (side === "opening") return "after_opening_quote";
    if (side === "closing") return "after_closing_quote";
  }
  return null;
}

function extractExplicitQuoteIntentFromCorrectionEntry(entry = {}, group = {}) {
  const sideHint = firstDefinedValue([
    entry?.quote_side,
    entry?.quoteSide,
    entry?.boundary_quote_side,
    entry?.boundaryQuoteSide,
    entry?.quote_type,
    entry?.quoteType,
    group?.quote_side,
    group?.quoteSide,
    group?.boundary_quote_side,
    group?.boundaryQuoteSide,
    group?.quote_type,
    group?.quoteType,
    entry?.boundary_side,
    entry?.boundarySide,
    entry?.side,
    group?.boundary_side,
    group?.boundarySide,
    group?.side,
  ]);
  const explicitIntentRaw = firstDefinedValue([
    entry?.explicit_quote_intent,
    entry?.explicitQuoteIntent,
    entry?.quote_intent,
    entry?.quoteIntent,
    entry?.quote_policy,
    entry?.quotePolicy,
    group?.explicit_quote_intent,
    group?.explicitQuoteIntent,
    group?.quote_intent,
    group?.quoteIntent,
    group?.quote_policy,
    group?.quotePolicy,
  ]);
  const explicitFromPayload = normalizeQuoteIntent(explicitIntentRaw, sideHint);
  if (explicitFromPayload) return { intent: explicitFromPayload, source: "corrections_payload" };

  const fromFlags = inferQuoteIntentFromFlags({ ...(group || {}), ...(entry || {}) });
  if (fromFlags) return { intent: fromFlags, source: "corrections_flags" };
  return { intent: null, source: null };
}

function resolveCorrectionSourceTokenId(entry = {}, group = {}) {
  return (
    entry?.source_id ??
    entry?.sourceId ??
    entry?.token_id ??
    entry?.tokenId ??
    group?.source_start ??
    group?.sourceStart ??
    group?.source_id ??
    group?.sourceId ??
    null
  );
}

function resolveCorrectionTargetTokenId(entry = {}, group = {}) {
  return (
    entry?.target_id ??
    entry?.targetId ??
    entry?.target_start ??
    entry?.targetStart ??
    group?.target_start ??
    group?.targetStart ??
    group?.target_id ??
    group?.targetId ??
    null
  );
}

function synthesizeCommaOpsFromCorrections(corrections, sourceTokens, targetTokens) {
  if (!corrections) return [];
  const groups = Array.isArray(corrections)
    ? corrections
    : typeof corrections === "object"
      ? Object.values(corrections)
      : [];
  if (!groups.length) return [];

  const sourceIndex = buildTokenPositionIndex(sourceTokens);
  const targetIndex = buildTokenPositionIndex(targetTokens);
  const seen = new Set();
  const ops = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];
    if (!group || typeof group !== "object") continue;
    const groupKind = normalizeCorrectionOperationKind(group.operation ?? group.type ?? group.op);
    const entries = flattenCorrectionEntries(group.corrections);
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const entry = entries[entryIndex];
      if (!entry || typeof entry !== "object") continue;
      const sourceSegment = firstDefinedValue([
        entry.source_text,
        entry.sourceText,
        entry.source,
        entry.original_text,
        entry.originalText,
      ]) || "";
      const correctedSegment = firstDefinedValue([
        entry.text,
        entry.target_text,
        entry.targetText,
        entry.corrected_text,
        entry.correctedText,
        entry.suggested_text,
        entry.suggestedText,
      ]) || "";
      const sourceHasComma = typeof sourceSegment === "string" && sourceSegment.includes(",");
      const correctedHasComma = typeof correctedSegment === "string" && correctedSegment.includes(",");
      let kind = null;
      if (!sourceHasComma && correctedHasComma) kind = "insert";
      else if (sourceHasComma && !correctedHasComma) kind = "delete";
      else if (groupKind === "insert" || groupKind === "delete") kind = groupKind;
      if (!kind) continue;

      const sourceTokenId = resolveCorrectionSourceTokenId(entry, group);
      const targetTokenId = resolveCorrectionTargetTokenId(entry, group);
      const sourceToken = sourceTokenId ? sourceIndex.byId[sourceTokenId] : null;
      const targetToken = targetTokenId ? targetIndex.byId[targetTokenId] : null;
      if (!sourceToken && !targetToken) continue;

      let originalPos = null;
      let correctedPos = null;
      if (kind === "insert") {
        let relativeInsertIndex = findInsertedCommaIndexFromSegments(sourceSegment, correctedSegment);
        if (
          relativeInsertIndex < 0 &&
          targetToken &&
          typeof targetToken.text === "string" &&
          targetToken.text.includes(",")
        ) {
          relativeInsertIndex = targetToken.text.indexOf(",");
        }
        if (sourceToken) {
          const fallbackRelative = typeof sourceSegment === "string" ? sourceSegment.length : sourceToken.text.length;
          const safeRelative =
            relativeInsertIndex >= 0
              ? Math.min(relativeInsertIndex, sourceToken.text.length)
              : Math.max(0, Math.min(fallbackRelative, sourceToken.text.length));
          originalPos = sourceToken.start + safeRelative;
        }
        if (targetToken) {
          const targetCommaIndex =
            relativeInsertIndex >= 0
              ? Math.min(relativeInsertIndex, targetToken.text.length)
              : targetToken.text.includes(",")
                ? targetToken.text.indexOf(",")
                : targetToken.text.length;
          correctedPos = targetToken.start + Math.max(0, targetCommaIndex);
        }
      } else {
        let relativeDeleteIndex = findRemovedCommaIndexFromSegments(sourceSegment, correctedSegment);
        if (
          relativeDeleteIndex < 0 &&
          sourceToken &&
          typeof sourceToken.text === "string" &&
          sourceToken.text.includes(",")
        ) {
          relativeDeleteIndex = sourceToken.text.indexOf(",");
        }
        if (sourceToken) {
          const safeRelative =
            relativeDeleteIndex >= 0
              ? Math.min(relativeDeleteIndex, Math.max(0, sourceToken.text.length - 1))
              : Math.max(0, sourceToken.text.length - 1);
          originalPos = sourceToken.start + safeRelative;
        }
        if (targetToken) {
          const correctedFallback =
            relativeDeleteIndex >= 0
              ? Math.min(relativeDeleteIndex, targetToken.text.length)
              : targetToken.text.length;
          correctedPos = targetToken.start + Math.max(0, correctedFallback);
        }
      }

      if (!Number.isFinite(originalPos) && Number.isFinite(correctedPos)) originalPos = correctedPos;
      if (!Number.isFinite(correctedPos) && Number.isFinite(originalPos)) correctedPos = originalPos;
      if (!Number.isFinite(originalPos) || !Number.isFinite(correctedPos)) continue;

      const payloadIntent = extractExplicitQuoteIntentFromCorrectionEntry(entry, group);
      const inferredIntent =
        kind === "insert"
          ? inferQuoteIntentFromBoundary(
              correctedSegment,
              findInsertedCommaIndexFromSegments(sourceSegment, correctedSegment)
            )
          : inferQuoteIntentFromBoundary(
              sourceSegment,
              findRemovedCommaIndexFromSegments(sourceSegment, correctedSegment)
            );
      const explicitQuoteIntent = payloadIntent.intent ?? inferredIntent;
      const explicitQuoteIntentSource = payloadIntent.intent
        ? payloadIntent.source
        : inferredIntent
          ? "corrections_segment"
          : null;

      const safeOriginalPos = Math.max(0, Math.floor(originalPos));
      const safeCorrectedPos = Math.max(0, Math.floor(correctedPos));
      const identity = `${kind}:${safeOriginalPos}:${safeCorrectedPos}`;
      if (seen.has(identity)) continue;
      seen.add(identity);

      const syntheticOp = {
        kind,
        pos: kind === "delete" ? safeOriginalPos : safeCorrectedPos,
        originalPos: safeOriginalPos,
        correctedPos: safeCorrectedPos,
        traceId: `synthetic:corr:${groupIndex}:${entryIndex}:${kind}:${safeOriginalPos}:${safeCorrectedPos}`,
        syntheticFallback: true,
        syntheticSource: "corrections",
      };
      if (explicitQuoteIntent) {
        syntheticOp.explicitQuoteIntent = explicitQuoteIntent;
        syntheticOp.explicitQuoteIntentSource = explicitQuoteIntentSource || "corrections_segment";
      }
      ops.push(syntheticOp);
    }
  }

  return ops;
}

function synthesizeCommaOpsFromTextDiff(sourceText = "", targetText = "") {
  if (typeof sourceText !== "string" || typeof targetText !== "string") return [];
  if (!sourceText.length && !targetText.length) return [];
  let i = 0;
  let j = 0;
  let guard = 0;
  const guardLimit = Math.max(256, (sourceText.length + targetText.length) * 4);
  const ops = [];
  const seen = new Set();

  while (i < sourceText.length || j < targetText.length) {
    if (guard++ > guardLimit) return [];
    const sourceChar = sourceText[i] ?? "";
    const targetChar = targetText[j] ?? "";
    if (sourceChar === targetChar) {
      i++;
      j++;
      continue;
    }
    if (targetChar === "," && sourceChar !== ",") {
      const originalPos = Math.max(0, Math.min(i, sourceText.length));
      const correctedPos = Math.max(0, Math.min(j, targetText.length));
      const identity = `insert:${originalPos}:${correctedPos}`;
      if (!seen.has(identity)) {
        seen.add(identity);
        const op = {
          kind: "insert",
          pos: correctedPos,
          originalPos,
          correctedPos,
          traceId: `synthetic:diff:insert:${originalPos}:${correctedPos}`,
          syntheticFallback: true,
          syntheticSource: "text_diff",
        };
        const inferredIntent = inferQuoteIntentFromBoundary(targetText, correctedPos);
        if (inferredIntent) {
          op.explicitQuoteIntent = inferredIntent;
          op.explicitQuoteIntentSource = "text_diff_boundary";
        }
        ops.push(op);
      }
      j++;
      continue;
    }
    if (sourceChar === "," && targetChar !== ",") {
      const originalPos = Math.max(0, Math.min(i, sourceText.length));
      const correctedPos = Math.max(0, Math.min(j, targetText.length));
      const identity = `delete:${originalPos}:${correctedPos}`;
      if (!seen.has(identity)) {
        seen.add(identity);
        ops.push({
          kind: "delete",
          pos: originalPos,
          originalPos,
          correctedPos,
          traceId: `synthetic:diff:delete:${originalPos}:${correctedPos}`,
          syntheticFallback: true,
          syntheticSource: "text_diff",
        });
      }
      i++;
      continue;
    }
    if (sourceText[i + 1] === targetChar) {
      i++;
      continue;
    }
    if (targetText[j + 1] === sourceChar) {
      j++;
      continue;
    }
    // Non-comma drift: abort synthetic diff ops to avoid wrong placements.
    return [];
  }

  return ops;
}

function synthesizeCommaOpsFallback({
  rawPayload,
  corrections,
  sourceTokens,
  targetTokens,
  sourceText,
  targetText,
} = {}) {
  const fromCorrections = synthesizeCommaOpsFromCorrections(corrections, sourceTokens, targetTokens);
  if (fromCorrections.length) {
    quoteTraceLog("synthetic_comma_ops_from_corrections", {
      count: fromCorrections.length,
      hasQuoteIntent: fromCorrections.some((op) => typeof op.explicitQuoteIntent === "string"),
    });
    return fromCorrections;
  }
  const fromDiff = synthesizeCommaOpsFromTextDiff(sourceText, targetText);
  if (fromDiff.length) {
    quoteTraceLog("synthetic_comma_ops_from_diff", {
      count: fromDiff.length,
      hasQuoteIntent: fromDiff.some((op) => typeof op.explicitQuoteIntent === "string"),
    });
    return fromDiff;
  }
  quoteTraceLog("synthetic_comma_ops_empty", {
    hasCorrections: Boolean(corrections),
    hasRawPayload: Boolean(rawPayload),
  });
  return [];
}

function resolveFeatureFlag({ windowKeys = [], envKey, defaultValue }) {
  if (typeof window !== "undefined") {
    for (const key of windowKeys) {
      if (!key) continue;
      const parsed = boolFromString(window[key]);
      if (typeof parsed === "boolean") return parsed;
    }
  }
  if (typeof process !== "undefined" && envKey) {
    const parsed = boolFromString(process.env?.[envKey]);
    if (typeof parsed === "boolean") return parsed;
  }
  return defaultValue;
}

function resolveApiMaxAttempts() {
  const winValue =
    typeof window !== "undefined"
      ? numberFromUnknown(
          window.__VEJICE_API_MAX_ATTEMPTS ?? window.__VEJICE_MAX_API_ATTEMPTS__
        )
      : undefined;
  const envValue =
    typeof process !== "undefined"
      ? numberFromUnknown(
          process.env?.VEJICE_API_MAX_ATTEMPTS ?? process.env?.VEJICE_MAX_API_ATTEMPTS
        )
      : undefined;
  const defaultAttempts = USE_LOCAL_RETRY_PROFILE
    ? LOCAL_API_MAX_ATTEMPTS
    : DEFAULT_API_MAX_ATTEMPTS;
  const resolved = winValue ?? envValue ?? defaultAttempts;
  // Temporary cap while backend error analysis is in progress.
  return Math.max(1, Math.min(2, Math.round(resolved)));
}

function resolveApiNumberSetting({
  windowKeys = [],
  envKeys = [],
  defaultValue,
  min,
  max,
  round = false,
}) {
  let resolved;
  if (typeof window !== "undefined") {
    for (const key of windowKeys) {
      if (!key) continue;
      const parsed = numberFromUnknown(window[key]);
      if (typeof parsed === "number") {
        resolved = parsed;
        break;
      }
    }
  }
  if (typeof resolved !== "number" && typeof process !== "undefined") {
    for (const key of envKeys) {
      if (!key) continue;
      const parsed = numberFromUnknown(process.env?.[key]);
      if (typeof parsed === "number") {
        resolved = parsed;
        break;
      }
    }
  }
  const base = typeof resolved === "number" ? resolved : defaultValue;
  const normalized = round ? Math.round(base) : base;
  return Math.max(min, Math.min(max, normalized));
}

const API_MAX_ATTEMPTS = resolveApiMaxAttempts();
const RETRY_BASE_DELAY_DEFAULT = USE_LOCAL_RETRY_PROFILE
  ? LOCAL_API_RETRY_BASE_DELAY_MS
  : DEFAULT_API_RETRY_BASE_DELAY_MS;
const RETRY_MAX_DELAY_DEFAULT = USE_LOCAL_RETRY_PROFILE
  ? LOCAL_API_RETRY_MAX_DELAY_MS
  : DEFAULT_API_RETRY_MAX_DELAY_MS;
const RETRY_JITTER_DEFAULT = USE_LOCAL_RETRY_PROFILE
  ? LOCAL_API_RETRY_JITTER_MS
  : DEFAULT_API_RETRY_JITTER_MS;
const API_RETRY_BASE_DELAY_MS = resolveApiNumberSetting({
  windowKeys: ["__VEJICE_API_RETRY_BASE_DELAY_MS__"],
  envKeys: ["VEJICE_API_RETRY_BASE_DELAY_MS"],
  defaultValue: RETRY_BASE_DELAY_DEFAULT,
  min: 100,
  max: 5000,
  round: true,
});
const API_RETRY_MAX_DELAY_MS = resolveApiNumberSetting({
  windowKeys: ["__VEJICE_API_RETRY_MAX_DELAY_MS__"],
  envKeys: ["VEJICE_API_RETRY_MAX_DELAY_MS"],
  defaultValue: RETRY_MAX_DELAY_DEFAULT,
  min: 250,
  max: 20000,
  round: true,
});
const API_RETRY_JITTER_MS = resolveApiNumberSetting({
  windowKeys: ["__VEJICE_API_RETRY_JITTER_MS__"],
  envKeys: ["VEJICE_API_RETRY_JITTER_MS"],
  defaultValue: RETRY_JITTER_DEFAULT,
  min: 0,
  max: 5000,
  round: true,
});
const API_CIRCUIT_BREAKER_THRESHOLD = resolveApiNumberSetting({
  windowKeys: ["__VEJICE_API_CIRCUIT_BREAKER_THRESHOLD__"],
  envKeys: ["VEJICE_API_CIRCUIT_BREAKER_THRESHOLD"],
  defaultValue: DEFAULT_API_CIRCUIT_BREAKER_THRESHOLD,
  min: 2,
  max: 20,
  round: true,
});
const API_CIRCUIT_BREAKER_COOLDOWN_MS = resolveApiNumberSetting({
  windowKeys: ["__VEJICE_API_CIRCUIT_BREAKER_COOLDOWN_MS__"],
  envKeys: ["VEJICE_API_CIRCUIT_BREAKER_COOLDOWN_MS"],
  defaultValue: DEFAULT_API_CIRCUIT_BREAKER_COOLDOWN_MS,
  min: 1000,
  max: 120000,
  round: true,
});
const ENABLE_NORMALIZED_TRANSPORT_RETRY = resolveFeatureFlag({
  windowKeys: [
    "__VEJICE_ENABLE_NORMALIZED_TRANSPORT_RETRY__",
    "__VEJICE_NORMALIZED_TRANSPORT_RETRY__",
  ],
  envKey: "VEJICE_ENABLE_NORMALIZED_TRANSPORT_RETRY",
  defaultValue: false,
});
const ENABLE_OG_COMPAT_RETRY = resolveFeatureFlag({
  windowKeys: ["__VEJICE_ENABLE_OG_COMPAT_RETRY__", "__VEJICE_OG_COMPAT_RETRY__"],
  envKey: "VEJICE_ENABLE_OG_COMPAT_RETRY",
  defaultValue: false,
});

const apiCircuitBreakerState = {
  transientFailureCount: 0,
  openedUntilTs: 0,
};
const RECENT_SERVER_FAILURE_CACHE_MAX_ENTRIES = 300;
const RECENT_SERVER_FAILURE_TTL_MS = 60 * 1000;
const recentServerFailureByRequestKey = new Map();

function nowTimestampMs() {
  return Date.now();
}

function hashStringForRequestKey(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function buildRequestFailureKey(text = "") {
  if (typeof text !== "string") return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return `${normalized.length}:${hashStringForRequestKey(normalized)}`;
}

function pruneRecentServerFailureCache(nowTs = nowTimestampMs()) {
  for (const [key, entry] of recentServerFailureByRequestKey.entries()) {
    if (!entry || !entry.expiresAt || entry.expiresAt <= nowTs) {
      recentServerFailureByRequestKey.delete(key);
    }
  }
  while (recentServerFailureByRequestKey.size > RECENT_SERVER_FAILURE_CACHE_MAX_ENTRIES) {
    const oldestKey = recentServerFailureByRequestKey.keys().next().value;
    if (typeof oldestKey === "undefined") break;
    recentServerFailureByRequestKey.delete(oldestKey);
  }
}

function getRecentServerFailureForRequest(key) {
  if (!key) return null;
  const nowTs = nowTimestampMs();
  pruneRecentServerFailureCache(nowTs);
  const entry = recentServerFailureByRequestKey.get(key);
  if (!entry) return null;
  return entry;
}

function rememberServerFailureForRequest(key, info = {}) {
  if (!key) return;
  const status = Number.isFinite(info?.status) ? Number(info.status) : null;
  if (!(status >= 500 && status < 600)) return;
  const nowTs = nowTimestampMs();
  const existing = recentServerFailureByRequestKey.get(key);
  const failCount = (existing?.failCount || 0) + 1;
  const expiresAt = nowTs + RECENT_SERVER_FAILURE_TTL_MS;
  recentServerFailureByRequestKey.set(key, {
    status,
    code: info?.code || existing?.code || null,
    msg: info?.msg || existing?.msg || null,
    failCount,
    firstSeenAt: existing?.firstSeenAt || nowTs,
    lastSeenAt: nowTs,
    expiresAt,
  });
  log("Failure cache remember", {
    requestKey: key,
    status,
    failCount,
    ttlMs: RECENT_SERVER_FAILURE_TTL_MS,
    expiresInMs: Math.max(0, expiresAt - nowTs),
    snippet: snip(info?.requestSentence || ""),
  });
  pruneRecentServerFailureCache(nowTs);
}

function clearServerFailureForRequest(key) {
  if (!key) return;
  if (recentServerFailureByRequestKey.has(key)) {
    recentServerFailureByRequestKey.delete(key);
  }
}

function getCircuitRetryAfterMs(ts = nowTimestampMs()) {
  return Math.max(0, (apiCircuitBreakerState.openedUntilTs ?? 0) - ts);
}

function isApiCircuitOpen(ts = nowTimestampMs()) {
  return getCircuitRetryAfterMs(ts) > 0;
}

function resetApiCircuitBreakerOnSuccess() {
  apiCircuitBreakerState.transientFailureCount = 0;
  apiCircuitBreakerState.openedUntilTs = 0;
}

function registerApiTransientFailure(info) {
  apiCircuitBreakerState.transientFailureCount += 1;
  if (apiCircuitBreakerState.transientFailureCount < API_CIRCUIT_BREAKER_THRESHOLD) return;
  const ts = nowTimestampMs();
  apiCircuitBreakerState.openedUntilTs = ts + API_CIRCUIT_BREAKER_COOLDOWN_MS;
  log("Circuit breaker opened", {
    cooldownMs: API_CIRCUIT_BREAKER_COOLDOWN_MS,
    failureCount: apiCircuitBreakerState.transientFailureCount,
    status: info?.status,
    code: info?.code,
  });
}

function calculateRetryDelayMs(attempt) {
  const safeAttempt = Math.max(1, attempt);
  const exponential = API_RETRY_BASE_DELAY_MS * Math.pow(2, safeAttempt - 1);
  const capped = Math.min(API_RETRY_MAX_DELAY_MS, exponential);
  const jitter =
    API_RETRY_JITTER_MS > 0 ? Math.floor(Math.random() * (API_RETRY_JITTER_MS + 1)) : 0;
  return capped + jitter;
}

const TRANSPORT_SPACE_LIKE_CHARS = new Set([
  "\u00A0",
  "\u1680",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200A",
  "\u202F",
  "\u205F",
  "\u3000",
]);
const TRANSPORT_DASH_LIKE_CHARS = new Set(["\u2013", "\u2014", "\u2212"]);
const TRANSPORT_QUOTE_LIKE_CHARS = new Set(["\u00AB", "\u00BB"]);
const TRANSPORT_ZERO_WIDTH_OR_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B\u200C\u200D\u2060\uFEFF]/u;
const PRIVATE_USE_CHAR = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/u;
const PRIVATE_USE_CHAR_GLOBAL = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu;
const PRIVATE_USE_BETWEEN_DIGITS =
  /(\d)\s*[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]\s*(\d)/gu;

function hasProblematicDotPattern(text = "") {
  if (typeof text !== "string" || !text) return false;
  for (const pattern of DOT_GUARD_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return true;
  }
  return false;
}

function normalizeKnownProblematicChars(text = "") {
  if (typeof text !== "string" || !text || !PRIVATE_USE_CHAR.test(text)) {
    return { text: typeof text === "string" ? text : "", replacedDateSeparators: 0, replacedPrivateUse: 0 };
  }

  let replacedDateSeparators = 0;
  const withDateSeparators = text.replace(PRIVATE_USE_BETWEEN_DIGITS, (_, left, right) => {
    replacedDateSeparators++;
    return `${left}. ${right}`;
  });

  let replacedPrivateUse = 0;
  const normalized = withDateSeparators.replace(PRIVATE_USE_CHAR_GLOBAL, () => {
    replacedPrivateUse++;
    return " ";
  });

  return { text: normalized, replacedDateSeparators, replacedPrivateUse };
}

function normalizeTransportText(text = "") {
  if (typeof text !== "string" || !text) {
    return { text: typeof text === "string" ? text : "", replacements: [] };
  }
  const chars = Array.from(text);
  const replacements = [];
  for (let i = 0; i < chars.length; i++) {
    const original = chars[i];
    let next = original;
    if (TRANSPORT_SPACE_LIKE_CHARS.has(original)) {
      next = " ";
    } else if (TRANSPORT_DASH_LIKE_CHARS.has(original)) {
      next = "-";
    } else if (TRANSPORT_QUOTE_LIKE_CHARS.has(original)) {
      next = '"';
    } else if (PRIVATE_USE_CHAR.test(original)) {
      next = " ";
    } else if (TRANSPORT_ZERO_WIDTH_OR_CONTROL.test(original)) {
      next = " ";
    }
    if (next !== original) {
      replacements.push({ index: i, from: original, to: next });
      chars[i] = next;
    }
  }
  return { text: chars.join(""), replacements };
}

function buildPrimaryRequestPayload(sentence = "") {
  const problematic = normalizeKnownProblematicChars(sentence);
  const dotProtected = protectProblematicDots(problematic.text);
  return {
    requestSentence: dotProtected,
    canonicalSource: problematic.text,
    transportSource: problematic.text,
    problematicStats: {
      replacedDateSeparators: problematic.replacedDateSeparators,
      replacedPrivateUse: problematic.replacedPrivateUse,
    },
    transportReplacements: 0,
    dotProtected: dotProtected !== problematic.text,
    sanitized:
      problematic.replacedDateSeparators > 0 ||
      problematic.replacedPrivateUse > 0 ||
      dotProtected !== sentence,
  };
}

function hasTransportNormalizationOpportunity(text = "") {
  const normalized = normalizeTransportText(text);
  return normalized.text !== text;
}

function restoreOriginalTypography(originalText = "", normalizedSource = "", correctedText = "") {
  if (
    typeof originalText !== "string" ||
    typeof normalizedSource !== "string" ||
    typeof correctedText !== "string" ||
    !originalText
  ) {
    return { text: correctedText, restoredChars: 0 };
  }
  const correctedChars = Array.from(correctedText);
  const sourceChars = Array.from(normalizedSource);
  const originalChars = Array.from(originalText);
  if (correctedChars.length !== sourceChars.length || originalChars.length !== sourceChars.length) {
    return { text: correctedText, restoredChars: 0 };
  }
  let restoredChars = 0;
  for (let i = 0; i < sourceChars.length; i++) {
    if (sourceChars[i] === originalChars[i]) continue;
    if (correctedChars[i] !== sourceChars[i]) continue;
    correctedChars[i] = originalChars[i];
    restoredChars++;
  }
  return { text: correctedChars.join(""), restoredChars };
}

function protectProblematicDots(text = "") {
  if (typeof text !== "string" || !text) return text;
  let protectedText = text;
  for (const pattern of DOT_GUARD_PATTERNS) {
    protectedText = protectedText.replace(pattern, (match) =>
      match.replace(/\./g, DOT_GUARD_PLACEHOLDER)
    );
  }
  return protectedText;
}

function protectDateDots(text = "") {
  if (typeof text !== "string" || !text) return text;
  return text.replace(DATE_DOT_PATTERN, (match) => match.replace(/\./g, DOT_GUARD_PLACEHOLDER));
}

function unprotectText(text) {
  if (typeof text !== "string" || !text) return text;
  return text.replace(new RegExp(DOT_GUARD_PLACEHOLDER, "g"), ".");
}

function unprotectStringsDeep(value) {
  if (typeof value === "string") return unprotectText(value);
  if (Array.isArray(value)) return value.map((item) => unprotectStringsDeep(item));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = unprotectStringsDeep(val);
  }
  return out;
}

function normalizeResponsePayload(inputSentence, payload) {
  const raw = unprotectStringsDeep({ ...(payload || {}) });
  normalizePayloadTokenArrays(raw);
  const sourceTextFromTokens = tokensToSentenceText(raw.source_tokens);
  const targetTextFromTokens = tokensToSentenceText(raw.target_tokens);
  if (typeof raw.source_text !== "string") raw.source_text = sourceTextFromTokens || inputSentence;
  let correctedText = unprotectText(pickCorrectedText(raw.source_text || inputSentence, raw));
  if (
    (!correctedText || correctedText === raw.source_text) &&
    typeof targetTextFromTokens === "string" &&
    hasNonWhitespaceText(targetTextFromTokens)
  ) {
    correctedText = unprotectText(targetTextFromTokens);
  }
  if (typeof raw.target_text !== "string") raw.target_text = correctedText;
  if (
    (!raw.target_text || raw.target_text === raw.source_text) &&
    hasNonWhitespaceText(targetTextFromTokens)
  ) {
    raw.target_text = unprotectText(targetTextFromTokens);
  }
  return { correctedText: raw.target_text || correctedText, raw };
}

function buildRequestData(sentence) {
  return {
    vhodna_poved: sentence,
    hkratne_napovedi: true,
    "ne_ozna\u010di_imen": false,
    "prepri\u010danost_modela": 0.08,
  };
}

function buildOgCompatPayloads(sentence) {
  return [
    {
      mode: "minimal_underscore",
      data: { vhodna_poved: sentence },
    },
    {
      mode: "minimal_space",
      data: { "vhodna poved": sentence },
    },
    {
      mode: "minimal_no_parallel",
      data: { vhodna_poved: sentence, hkratne_napovedi: false },
    },
  ];
}

async function requestPopravek(poved, options = {}) {
  if (USE_MOCK) {
    log("Mock API ->", snip(poved));
    return mockRequestPopravljenPoved(poved);
  }
  if (!API_URL) {
    throw new VejiceApiError("Missing VEJICE_API_URL configuration");
  }
  if (!API_KEY && requiresApiKey(API_URL)) {
    throw new VejiceApiError("Missing VEJICE_API_KEY configuration");
  }
  const url = API_URL;

  const primaryPayload = buildPrimaryRequestPayload(poved);
  const primaryRequestSentence = primaryPayload.requestSentence;
  const requestFailureKey = buildRequestFailureKey(primaryRequestSentence || poved);
  const recentServerFailure = getRecentServerFailureForRequest(requestFailureKey);
  if (recentServerFailure && recentServerFailure.failCount >= 2) {
    const nowTs = nowTimestampMs();
    log("FAST-FAIL repeated failing payload", {
      requestKey: requestFailureKey,
      status: recentServerFailure.status,
      failCount: recentServerFailure.failCount,
      ageMs: Math.max(0, nowTs - (recentServerFailure.lastSeenAt || nowTs)),
      ttlLeftMs: Math.max(0, (recentServerFailure.expiresAt || nowTs) - nowTs),
      len: primaryRequestSentence?.length ?? 0,
      snippet: snip(primaryRequestSentence),
    });
    throw new VejiceApiError("Vejice API fast-fail for repeated failing payload", {
      fastFail: true,
      status: recentServerFailure.status,
      failCount: recentServerFailure.failCount,
      requestKey: requestFailureKey,
    });
  }
  const data = buildRequestData(primaryRequestSentence);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 15000, // 15s
    // withCredentials: false, // keep default; not needed unless API sets cookies
  };
  const requestSignal = options?.signal;
  if (requestSignal) {
    config.signal = requestSignal;
  }
  if (API_KEY) {
    config.headers["X-API-KEY"] = API_KEY;
  }

  if (isApiCircuitOpen()) {
    const retryAfterMs = getCircuitRetryAfterMs();
    throw new VejiceApiError("Vejice API temporarily unavailable (circuit open)", {
      circuitOpen: true,
      retryAfterMs,
      failureCount: apiCircuitBreakerState.transientFailureCount,
    });
  }

  const attempts = Math.max(1, API_MAX_ATTEMPTS);
  let protectedRetryUsed = false;
  let ogCompatRetryUsed = false;
  let normalizedRetryUsed = false;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const t0 = performance?.now?.() ?? Date.now();
    try {
      if (attempt === 1 && primaryPayload.sanitized) {
        log("Primary payload pre-sanitized", {
          replacedDateSeparators: primaryPayload.problematicStats.replacedDateSeparators,
          replacedPrivateUse: primaryPayload.problematicStats.replacedPrivateUse,
          transportReplacements: primaryPayload.transportReplacements,
          dotProtected: primaryPayload.dotProtected,
        });
      }
      log(
        "POST",
        url,
        "| len:",
        primaryRequestSentence?.length ?? 0,
        "| snippet:",
        snip(primaryRequestSentence),
        "| attempt:",
        attempt
      );
      const r = await axios.post(url, data, config);
      const t1 = performance?.now?.() ?? Date.now();
      const normalizedResult = normalizeResponsePayload(primaryPayload.transportSource, r?.data);
      const restoredTypography =
        primaryPayload.transportReplacements > 0
          ? restoreOriginalTypography(
              primaryPayload.canonicalSource,
              primaryPayload.transportSource,
              normalizedResult.correctedText
            )
          : { text: normalizedResult.correctedText, restoredChars: 0 };
      const correctedText = restoredTypography.text;
      const raw = {
        ...normalizedResult.raw,
        source_text: poved,
        target_text: correctedText,
      };
      if (primaryPayload.sanitized) {
        raw.pre_sanitization = {
          used: true,
          replaced_date_separators: primaryPayload.problematicStats.replacedDateSeparators,
          replaced_private_use: primaryPayload.problematicStats.replacedPrivateUse,
          transport_replacements: primaryPayload.transportReplacements,
          restored_chars: restoredTypography.restoredChars,
          dot_protected: primaryPayload.dotProtected,
        };
      }

      log(
        "OK",
        `${Math.round(t1 - t0)} ms`,
        "| status:",
        r?.status,
        "| changed:",
        correctedText !== poved,
        "| keys:",
        raw && Object.keys(raw),
        "| sourceTokens:",
        Array.isArray(raw?.source_tokens) ? raw.source_tokens.length : 0,
        "| targetTokens:",
        Array.isArray(raw?.target_tokens) ? raw.target_tokens.length : 0,
        "| attempt:",
        attempt
      );

      resetApiCircuitBreakerOnSuccess();
      clearServerFailureForRequest(requestFailureKey);
      return { correctedText, raw };
    } catch (err) {
      if (isAbortLikeError(err, requestSignal)) {
        throw err;
      }
      const t1 = performance?.now?.() ?? Date.now();
      const durationMs = Math.round(t1 - t0);
      const info = describeAxiosError(err);
      const status = typeof info?.status === "number" ? info.status : null;
      const infraRetryStatus =
        status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
      const canTryProtectedDots =
        !protectedRetryUsed &&
        !USE_MOCK &&
        !primaryPayload.dotProtected &&
        infraRetryStatus &&
        hasProblematicDotPattern(poved);
      if (canTryProtectedDots) {
        protectedRetryUsed = true;
        try {
          const protectedSentence = protectProblematicDots(poved);
          if (protectedSentence !== poved) {
            log("Retrying once with dot-protected payload", {
              attempt,
              len: poved?.length ?? 0,
              snippet: snip(poved),
            });
            const protectedData = buildRequestData(protectedSentence);
            const protectedResponse = await axios.post(url, protectedData, config);
            const { correctedText, raw } = normalizeResponsePayload(poved, protectedResponse?.data);
            log(
              "OK (dot-protected)",
              "| status:",
              protectedResponse?.status,
              "| changed:",
              correctedText !== poved
            );
            resetApiCircuitBreakerOnSuccess();
            clearServerFailureForRequest(requestFailureKey);
            return { correctedText, raw };
          }
        } catch (protectedErr) {
          if (isAbortLikeError(protectedErr, requestSignal)) {
            throw protectedErr;
          }
          const protectedInfo = describeAxiosError(protectedErr);
          log("ERROR (dot-protected)", { ...protectedInfo, attempt });
        }
      }
      const canTryOgCompat =
        ENABLE_OG_COMPAT_RETRY &&
        !ogCompatRetryUsed &&
        !USE_MOCK &&
        infraRetryStatus;
      if (canTryOgCompat) {
        ogCompatRetryUsed = true;
        const compatPayloads = buildOgCompatPayloads(poved);
        for (const compat of compatPayloads) {
          try {
            log("Retrying once with OG-compatible payload", {
              attempt,
              mode: compat.mode,
              len: poved?.length ?? 0,
              snippet: snip(poved),
            });
            const compatResponse = await axios.post(url, compat.data, config);
            const { correctedText, raw } = normalizeResponsePayload(poved, compatResponse?.data);
            raw.og_compat = { used: true, mode: compat.mode };
            log("OK (OG-compatible)", {
              status: compatResponse?.status,
              mode: compat.mode,
              changed: correctedText !== poved,
            });
            resetApiCircuitBreakerOnSuccess();
            clearServerFailureForRequest(requestFailureKey);
            return { correctedText, raw };
          } catch (compatErr) {
            if (isAbortLikeError(compatErr, requestSignal)) {
              throw compatErr;
            }
            const compatInfo = describeAxiosError(compatErr);
            log("ERROR (OG-compatible)", { ...compatInfo, attempt, mode: compat.mode });
          }
        }
      }
      const canTryNormalizedTransport =
        ENABLE_NORMALIZED_TRANSPORT_RETRY &&
        !normalizedRetryUsed &&
        !USE_MOCK &&
        infraRetryStatus &&
        hasTransportNormalizationOpportunity(poved);
      if (canTryNormalizedTransport) {
        normalizedRetryUsed = true;
        try {
          const normalized = normalizeTransportText(poved);
          if (normalized.text !== poved) {
            const normalizedSentence = protectDateDots(normalized.text);
            log("Retrying once with normalized transport payload", {
              attempt,
              len: poved?.length ?? 0,
              snippet: snip(poved),
              replacements: normalized.replacements.length,
            });
            const normalizedData = buildRequestData(normalizedSentence);
            const normalizedResponse = await axios.post(url, normalizedData, config);
            const normalizedResult = normalizeResponsePayload(
              normalized.text,
              normalizedResponse?.data
            );
            const restored = restoreOriginalTypography(
              poved,
              normalized.text,
              normalizedResult.correctedText
            );
            const raw = {
              ...normalizedResult.raw,
              source_text: poved,
              target_text: restored.text,
              transport_normalization: {
                used: true,
                replacements: normalized.replacements.length,
                restored_chars: restored.restoredChars,
              },
            };
            log("OK (normalized transport)", {
              status: normalizedResponse?.status,
              changed: restored.text !== poved,
              restoredChars: restored.restoredChars,
            });
            resetApiCircuitBreakerOnSuccess();
            clearServerFailureForRequest(requestFailureKey);
            return { correctedText: restored.text, raw };
          }
        } catch (normalizedErr) {
          if (isAbortLikeError(normalizedErr, requestSignal)) {
            throw normalizedErr;
          }
          const normalizedInfo = describeAxiosError(normalizedErr);
          log("ERROR (normalized transport)", { ...normalizedInfo, attempt });
        }
      }
      const transientError = isTransientError(info);
      const breakerEligibleError = isCircuitBreakerEligibleError(info);
      if (breakerEligibleError) {
        registerApiTransientFailure(info);
      } else {
        // Avoid run-wide starvation: repeated content-specific 500 responses
        // should not open the global breaker and block remaining paragraphs.
        if (transientError) {
          apiCircuitBreakerState.transientFailureCount = 0;
        } else {
          resetApiCircuitBreakerOnSuccess();
        }
      }
      const retryable = attempt < attempts && transientError && !isApiCircuitOpen();
      log("ERROR", `${durationMs} ms`, { ...info, attempt, retryable });
      if (retryable) {
        const delay = calculateRetryDelayMs(attempt);
        log("Retrying Vejice API request in", delay, "ms");
        await delayMs(delay, requestSignal);
        continue;
      }
      rememberServerFailureForRequest(requestFailureKey, {
        ...info,
        requestSentence: primaryRequestSentence,
      });
      throw new VejiceApiError("Vejice API call failed", {
        durationMs,
        info,
        attempt,
        circuitOpen: isApiCircuitOpen(),
        retryAfterMs: getCircuitRetryAfterMs(),
        cause: err,
      });
    }
  }
}

/**
 * Pokliče Vejice API in vrne popravljeno poved.
 * Vrne popravljeno besedilo ali original, če pride do težave.
 */
export async function popraviPoved(poved) {
  const { correctedText } = await requestPopravek(poved);
  return correctedText;
}

export async function popraviPovedDetailed(poved, options = {}) {
  const { correctedText, raw } = await requestPopravek(poved, options);
  const sourceTokens = Array.isArray(raw?.source_tokens) ? raw.source_tokens : [];
  const targetTokens = Array.isArray(raw?.target_tokens) ? raw.target_tokens : [];
  const sourceText =
    typeof raw?.source_text === "string" ? raw.source_text : tokensToSentenceText(sourceTokens) || poved;
  const targetText =
    typeof raw?.target_text === "string"
      ? raw.target_text
      : tokensToSentenceText(targetTokens) || correctedText;
  const corrections = pickCorrectionsPayload(raw);
  const payloadCommaOps = extractCommaOps(raw, sourceText, targetText);
  const commaOps = payloadCommaOps.length
    ? payloadCommaOps
    : synthesizeCommaOpsFallback({
        rawPayload: raw,
        corrections,
        sourceTokens,
        targetTokens,
        sourceText,
        targetText,
      });
  return {
    correctedText,
    raw,
    sourceTokens,
    targetTokens,
    sourceText,
    targetText,
    corrections,
    commaOps,
  };
}
