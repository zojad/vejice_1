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
const API_KEY =
  (typeof process !== "undefined" && process.env?.VEJICE_API_KEY) ||
  (typeof window !== "undefined" && window.__VEJICE_API_KEY) ||
  "";

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

async function mockPopraviPoved(poved = "") {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCorrectSentence(poved)), MOCK_LATENCY_MS);
  });
}

/**
 * Pokliče Vejice API in vrne popravljeno poved.
 * Vrne popravljeno besedilo ali original, če pride do težave.
 */
export async function popraviPoved(poved) {
  if (USE_MOCK) {
    log("Mock API ->", snip(poved));
    return mockPopraviPoved(poved);
  }
  if (!API_KEY) {
    throw new VejiceApiError("Missing VEJICE_API_KEY configuration");
  }
  const url = "https://gpu-proc1.cjvt.si/popravljalnik-api/postavi_vejice";

  const data = {
    vhodna_poved: poved,
    hkratne_napovedi: true,
    ne_označi_imen: false,
    prepričanost_modela: 0.08,
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": API_KEY,
    },
    timeout: 15000, // 15s
    // withCredentials: false, // keep default; not needed unless API sets cookies
  };

  const t0 = performance?.now?.() ?? Date.now();
  try {
    log("POST", url, "| len:", poved?.length ?? 0, "| snippet:", snip(poved));
    const r = await axios.post(url, data, config);
    const t1 = performance?.now?.() ?? Date.now();

    const d = r?.data || {};
    const candidateTexts = [
      d.popravljeno_besedilo,
      d.target_text,
      d.popravki?.[0]?.predlog,
      Array.isArray(d.corrections) ? d.corrections[0]?.suggested_text : undefined,
      Array.isArray(d.apply_corrections) ? d.apply_corrections[0]?.suggested_text : undefined,
    ];
    const out =
      candidateTexts.map((txt) => (typeof txt === "string" ? txt.trim() : "")).find((txt) => txt) ||
      poved;

    log(
      "OK",
      `${Math.round(t1 - t0)} ms`,
      "| status:",
      r?.status,
      "| changed:",
      out !== poved,
      "| keys:",
      d && Object.keys(d)
    );

    return out;
  } catch (err) {
    const t1 = performance?.now?.() ?? Date.now();
    const info = describeAxiosError(err);
    log("ERROR", `${Math.round(t1 - t0)} ms`, info);
    throw new VejiceApiError("Vejice API call failed", {
      durationMs: Math.round(t1 - t0),
      info,
      cause: err,
    });
  }
}
