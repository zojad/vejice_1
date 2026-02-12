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
const API_MAX_ATTEMPTS = 3;
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
  /\b(?:npr|itd|ipd|oz|tj|dr|mr|ga|gos|prim)\./giu,
];

function hasProblematicDotPattern(text = "") {
  if (typeof text !== "string" || !text) return false;
  for (const pattern of DOT_GUARD_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return true;
  }
  return false;
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

  const primaryRequestSentence = protectDateDots(poved);
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
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const t0 = performance?.now?.() ?? Date.now();
    try {
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
      const { correctedText, raw } = normalizeResponsePayload(poved, r?.data);

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




