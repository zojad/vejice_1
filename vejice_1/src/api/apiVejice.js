/* global window, process, performance, console */
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

/**
 * Pokliče Vejice API in vrne popravljeno poved.
 * Vrne popravljeno besedilo ali original, če pride do težave.
 */
export async function popraviPoved(poved) {
  if (!API_KEY) {
    throw new VejiceApiError("Missing VEJICE_API_KEY configuration");
  }
  const url = "https://gpu-proc1.cjvt.si/popravljalnik-api/popravi_crkovanje";

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
    const out = d.popravljeno_besedilo?.trim() || d.popravki?.[0]?.predlog?.trim() || poved;

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
