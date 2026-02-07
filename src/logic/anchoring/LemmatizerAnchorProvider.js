import axios from "axios";
import { AnchorProvider } from "./AnchorProvider.js";
import { SyntheticAnchorProvider } from "./SyntheticAnchorProvider.js";

const MAX_LOG_LENGTH = 120;
const LOG_PREFIX = "[LemmatizerAnchorProvider]";
const snip = (value) =>
  typeof value === "string" && value.length > MAX_LOG_LENGTH
    ? `${value.slice(0, MAX_LOG_LENGTH)}…`
    : value;

const logInfo = (...args) => {
  if (typeof console !== "undefined" && typeof console.log === "function") {
    console.log(LOG_PREFIX, ...args);
  }
};

const logWarn = (...args) => {
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(LOG_PREFIX, ...args);
  }
};

function resolveDefaultEndpoint() {
  const windowEndpoint =
    typeof window !== "undefined" && typeof window.__VEJICE_LEMMAS_URL === "string"
      ? window.__VEJICE_LEMMAS_URL.trim()
      : "";
  if (windowEndpoint) return windowEndpoint;

  if (typeof window !== "undefined" && window.location?.origin) {
    const isLocalDevOrigin =
      window.location.origin === "https://127.0.0.1:4001" ||
      window.location.origin === "https://localhost:4001";
    if (isLocalDevOrigin) {
      return `${window.location.origin}/lemmas`;
    }
  }

  const envEndpoint =
    typeof process !== "undefined" && typeof process.env?.VEJICE_LEMMAS_URL === "string"
      ? process.env.VEJICE_LEMMAS_URL.trim()
      : "";
  if (envEndpoint) return envEndpoint;

  return "https://lemmas-vejice.com/lemmas";
}

/**
 * Anchor provider that prefers real offsets from a lemmatizer service.
 * Falls back to SyntheticAnchorProvider when the service is unavailable.
 */
export class LemmatizerAnchorProvider extends AnchorProvider {
  constructor({ client, endpoint, timeoutMs } = {}) {
    super("LemmatizerAnchorProvider");
    const defaultEndpoint = resolveDefaultEndpoint();
    const resolvedTimeout =
      typeof timeoutMs === "number" && Number.isFinite(timeoutMs)
        ? timeoutMs
        : parseInt(
            (typeof process !== "undefined" && process.env?.VEJICE_LEMMAS_TIMEOUT_MS) ||
              (typeof window !== "undefined" && window.__VEJICE_LEMMAS_TIMEOUT_MS) ||
              "8000",
            10
          ) || 8000;
    this.endpoint = endpoint || defaultEndpoint;
    this.client =
      client ||
      axios.create({
        timeout: resolvedTimeout,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    this.paragraphAnchors = [];
    this.fallbackProvider = new SyntheticAnchorProvider();
  }

  supportsCharHints() {
    return true;
  }

  reset() {
    this.paragraphAnchors.length = 0;
  }

  setAnchors(paragraphIndex, anchors) {
    this.paragraphAnchors[paragraphIndex] = anchors;
  }

  getAnchorsForParagraph(paragraphIndex) {
    return this.paragraphAnchors[paragraphIndex];
  }

  deleteAnchors(paragraphIndex) {
    if (typeof paragraphIndex === "number" && paragraphIndex >= 0) {
      delete this.paragraphAnchors[paragraphIndex];
    }
  }

  /**
   * @param {object} params
   * @returns {Promise<object>} entry describing source/target anchors
   */
  async getAnchors(params) {
    const {
      paragraphIndex,
      originalText = "",
      correctedText = "",
      documentOffset = 0,
    } = params;
    logInfo(
      "getAnchors -> paragraph",
      paragraphIndex,
      "| original len:",
      originalText.length,
      "| corrected len:",
      correctedText.length
    );
    const timerLabel = `${LOG_PREFIX} anchor-${paragraphIndex}-${Date.now()}`;
    console.time?.(timerLabel);
    const fallbackEntry = await this.fallbackProvider.getAnchors(params);
    try {
      const [sourceLemmaTokens, targetLemmaTokens] = await Promise.all([
        this.fetchLemmaTokens(originalText),
        this.fetchLemmaTokens(correctedText),
      ]);
      this.applyLemmaOffsets({
        collection: fallbackEntry.sourceAnchors,
        lemmas: sourceLemmaTokens,
        documentOffset,
      });
      this.applyLemmaOffsets({
        collection: fallbackEntry.targetAnchors,
        lemmas: targetLemmaTokens,
        documentOffset,
      });
      logInfo(
        "Lemma offsets applied",
        "| paragraph:",
        paragraphIndex,
        "| source tokens:",
        sourceLemmaTokens.length,
        "| target tokens:",
        targetLemmaTokens.length
      );
    } catch (error) {
      logWarn("Falling back to synthetic anchors for paragraph", paragraphIndex, error);
    }
    console.timeEnd?.(timerLabel);
    this.setAnchors(paragraphIndex, fallbackEntry);
    return fallbackEntry;
  }

  async fetchLemmaTokens(text = "") {
    const safeText = typeof text === "string" ? text : "";
    if (!safeText.trim()) return [];
    if (!this.endpoint) throw new Error("Lemmatizer endpoint URL is not configured");
    const timerLabel = `${LOG_PREFIX} fetch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    logInfo("Fetching lemmas", "| url:", this.endpoint, "| snippet:", snip(safeText));
    console.time?.(timerLabel);
    const response = await this.client.post(
      this.endpoint,
      {
        lang: "sl",
        text: safeText,
      },
      {
        timeout: this.client.defaults?.timeout,
      }
    );
    console.timeEnd?.(timerLabel);
    const lemmaTokens = normalizeLemmaPayload(response?.data);
    logInfo("Lemma response", "| tokens:", lemmaTokens.length);
    return lemmaTokens;
  }

  applyLemmaOffsets({ collection, lemmas, documentOffset = 0 }) {
    if (!collection?.ordered?.length || !Array.isArray(lemmas) || !lemmas.length) return;
    let lemmaIndex = 0;
    for (const anchor of collection.ordered) {
      if (!anchor) continue;
      const tokenText = anchor.tokenText ?? "";
      if (!tokenText.trim()) continue;
      const match = findLemmaMatch(tokenText, lemmas, lemmaIndex);
      if (match) {
        const charStart = match.start;
        const charEnd =
          typeof match.end === "number" ? match.end : typeof charStart === "number" ? charStart + tokenText.length : -1;
        anchor.charStart = charStart ?? anchor.charStart;
        anchor.charEnd = charEnd ?? anchor.charEnd;
        anchor.documentCharStart =
          typeof charStart === "number" && charStart >= 0 ? documentOffset + charStart : anchor.documentCharStart;
        anchor.documentCharEnd =
          typeof charEnd === "number" && charEnd >= 0 ? documentOffset + charEnd : anchor.documentCharEnd;
        anchor.matched = typeof charStart === "number" && charStart >= 0;
        lemmaIndex = match.index + 1;
      }
    }
  }
}

function normalizeLemmaPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.tokens)) {
    return payload.tokens.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.result)) {
    return payload.result.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.sentences)) {
    return payload.sentences
      .flatMap((sentence) => {
        if (Array.isArray(sentence?.tokens)) return sentence.tokens;
        return sentence;
      })
      .map(normalizeLemmaToken)
      .filter(Boolean);
  }
  if (Array.isArray(payload)) {
    return payload.map(normalizeLemmaToken).filter(Boolean);
  }
  if (Array.isArray(payload.words)) {
    return payload.words.map(normalizeLemmaToken).filter(Boolean);
  }
  return [];
}

function normalizeLemmaToken(raw, index) {
  if (!raw || typeof raw !== "object") return null;
  const text =
    raw.token ?? raw.text ?? raw.word ?? raw.form ?? raw.surface ?? raw.lemma ?? raw.value ?? "";
  const start = pickNumber([
    raw.start_char,
    raw.start,
    raw.begin,
    raw.position,
    raw.offset,
    raw.charStart,
  ]);
  const end = pickNumber([raw.end_char, raw.end, raw.finish, raw.charEnd]);
  return {
    text,
    normalized: normalizeForMatch(text),
    start: typeof start === "number" ? start : undefined,
    end: typeof end === "number" ? end : undefined,
    index: typeof raw.index === "number" ? raw.index : index ?? 0,
  };
}

function pickNumber(candidates) {
  if (!Array.isArray(candidates)) return undefined;
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  }
  return undefined;
}

function normalizeForMatch(value) {
  return typeof value === "string"
    ? value
        .replace(/\s+/g, "")
        .replace(/[.,!?;:“”„'"«»]/g, "")
        .toLowerCase()
    : "";
}

function findLemmaMatch(tokenText, lemmas, startIndex = 0) {
  const normalizedToken = normalizeForMatch(tokenText);
  for (let i = startIndex; i < lemmas.length; i++) {
    const lemma = lemmas[i];
    if (!lemma?.text) continue;
    const lemmaNorm = lemma.normalized || normalizeForMatch(lemma.text);
    if (lemma.text === tokenText || (lemmaNorm && lemmaNorm === normalizedToken)) {
      return { ...lemma, index: i };
    }
  }
  return null;
}
