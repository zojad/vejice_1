/* global window, process, performance, console, setTimeout */
// src/api/apiVejice.js
import axios from "axios";

const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const log = (...a) => DEBUG && console.log("[Vejice API]", ...a);
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

const API_KEY =
  (typeof window !== "undefined" && window.__VEJICE_API_KEY) ||
  "";
const DEFAULT_API_MAX_ATTEMPTS = 2;
const API_RETRY_DELAY_MS = 400;

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

const delayMs = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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
  const regex = /[^\s]+/g;
  let match;
  let idx = 1;
  while ((match = regex.exec(text))) {
    tokens.push({
      token_id: `${prefix}${idx++}`,
      token: match[0],
      start_char: match.index,
      end_char: match.index + match[0].length,
    });
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
  const candidateTexts = [
    payload.popravljeno_besedilo,
    payload.target_text,
    payload.popravki?.[0]?.predlog,
    Array.isArray(payload.corrections) ? payload.corrections[0]?.suggested_text : undefined,
    Array.isArray(payload.apply_corrections)
      ? payload.apply_corrections[0]?.suggested_text
      : undefined,
  ];
  return (
    candidateTexts.map((txt) => (typeof txt === "string" ? txt.trim() : "")).find((txt) => txt) ||
    fallback
  );
}

function isRetryableError(info) {
  const status = info?.status;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  const code = typeof info?.code === "string" ? info.code.toUpperCase() : "";
  if (!code) return false;
  return ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(code);
}

function requiresApiKey(url) {
  return typeof url === "string" && /gpu-proc1\.cjvt\.si/i.test(url);
}

const DOT_GUARD_PLACEHOLDER = "\uE000";
const DATE_DOT_PATTERN = /\b(\d{1,2})\.\s*(\d{1,2})(?:\.\s*(\d{2,4}))?\b/g;
const INITIALS_DOT_PATTERN = /\b(?:[\p{L}]\.\s*){2,}/gu;
const DOT_GUARD_PATTERNS = [
  INITIALS_DOT_PATTERN,
  /\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g,
  /\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|gos|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|sep|okt|nov|dec)\./giu,
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
  const resolved = winValue ?? envValue ?? DEFAULT_API_MAX_ATTEMPTS;
  return Math.max(1, Math.min(5, Math.round(resolved)));
}

const API_MAX_ATTEMPTS = resolveApiMaxAttempts();
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
const PRIVATE_USE_CHAR = /[\uE000-\uF8FF]/u;
const PRIVATE_USE_CHAR_GLOBAL = /[\uE000-\uF8FF]/gu;
const PRIVATE_USE_BETWEEN_DIGITS = /(\d)\s*[\uE000-\uF8FF]\s*(\d)/gu;

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
  const correctedText = unprotectText(pickCorrectedText(inputSentence, raw));
  if (typeof raw.source_text !== "string") raw.source_text = inputSentence;
  if (typeof raw.target_text !== "string") raw.target_text = correctedText;
  return { correctedText, raw };
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

async function requestPopravek(poved) {
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
  const data = buildRequestData(primaryRequestSentence);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 15000, // 15s
    // withCredentials: false, // keep default; not needed unless API sets cookies
  };
  if (API_KEY) {
    config.headers["X-API-KEY"] = API_KEY;
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

      return { correctedText, raw };
    } catch (err) {
      const t1 = performance?.now?.() ?? Date.now();
      const durationMs = Math.round(t1 - t0);
      const info = describeAxiosError(err);
      const canTryProtectedDots =
        !protectedRetryUsed &&
        !USE_MOCK &&
        typeof info?.status === "number" &&
        info.status >= 500 &&
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
            return { correctedText, raw };
          }
        } catch (protectedErr) {
          const protectedInfo = describeAxiosError(protectedErr);
          log("ERROR (dot-protected)", { ...protectedInfo, attempt });
        }
      }
      const canTryOgCompat =
        ENABLE_OG_COMPAT_RETRY &&
        !ogCompatRetryUsed &&
        !USE_MOCK &&
        typeof info?.status === "number" &&
        info.status >= 500;
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
            return { correctedText, raw };
          } catch (compatErr) {
            const compatInfo = describeAxiosError(compatErr);
            log("ERROR (OG-compatible)", { ...compatInfo, attempt, mode: compat.mode });
          }
        }
      }
      const canTryNormalizedTransport =
        ENABLE_NORMALIZED_TRANSPORT_RETRY &&
        !normalizedRetryUsed &&
        !USE_MOCK &&
        typeof info?.status === "number" &&
        info.status >= 500 &&
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
            return { correctedText: restored.text, raw };
          }
        } catch (normalizedErr) {
          const normalizedInfo = describeAxiosError(normalizedErr);
          log("ERROR (normalized transport)", { ...normalizedInfo, attempt });
        }
      }
      const retryable = attempt < attempts && isRetryableError(info);
      log("ERROR", `${durationMs} ms`, { ...info, attempt, retryable });
      if (retryable) {
        const delay = API_RETRY_DELAY_MS * attempt;
        log("Retrying Vejice API request in", delay, "ms");
        await delayMs(delay);
        continue;
      }
      throw new VejiceApiError("Vejice API call failed", {
        durationMs,
        info,
        attempt,
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

export async function popraviPovedDetailed(poved) {
  const { correctedText, raw } = await requestPopravek(poved);
  return {
    correctedText,
    raw,
    sourceTokens: Array.isArray(raw?.source_tokens) ? raw.source_tokens : [],
    targetTokens: Array.isArray(raw?.target_tokens) ? raw.target_tokens : [],
    sourceText: typeof raw?.source_text === "string" ? raw.source_text : poved,
    targetText: typeof raw?.target_text === "string" ? raw.target_text : correctedText,
  };
}




