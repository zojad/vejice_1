import axios from "axios";
import { AnchorProvider } from "./AnchorProvider.js";
import { SyntheticAnchorProvider } from "./SyntheticAnchorProvider.js";

const MAX_LOG_LENGTH = 120;
const LOG_PREFIX = "[LemmatizerAnchorProvider]";
const LEMMA_AUTHORITATIVE_MIN_TOKENS = 6;
const LEMMA_AUTHORITATIVE_MIN_COVERAGE = 0.9;
const LEMMA_INDEX_WINDOW = 14;
const LEMMA_CHAR_WINDOW = 140;
const LEMMA_CACHE_MAX_ENTRIES = 1200;
const LEMMA_CACHE_TTL_MS = 10 * 60 * 1000;
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

function isWordOnlineHost() {
  if (typeof Office === "undefined" || !Office?.context) return false;
  const platform = Office.context.platform;
  const onlineConst = Office?.PlatformType?.OfficeOnline;
  return platform === onlineConst || platform === "OfficeOnline";
}

function hashLemmaCacheText(text = "") {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
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
    this._didLogLemmaShapeThisRun = false;
    this.lemmaTokenCache = new Map();
  }

  supportsCharHints() {
    return true;
  }

  reset() {
    this.paragraphAnchors.length = 0;
    this._didLogLemmaShapeThisRun = false;
  }

  isLemmaTokenCacheEnabled() {
    if (isWordOnlineHost()) return false;
    return LEMMA_CACHE_MAX_ENTRIES > 0 && LEMMA_CACHE_TTL_MS > 0;
  }

  buildLemmaCacheKey(text = "") {
    return `${text.length}:${hashLemmaCacheText(text)}`;
  }

  getCachedLemmaTokens(text = "") {
    if (!this.isLemmaTokenCacheEnabled()) return null;
    const key = this.buildLemmaCacheKey(text);
    const entry = this.lemmaTokenCache.get(key);
    if (!entry) return null;
    if (entry.text !== text || Date.now() - entry.cachedAt > LEMMA_CACHE_TTL_MS) {
      this.lemmaTokenCache.delete(key);
      return null;
    }
    this.lemmaTokenCache.delete(key);
    this.lemmaTokenCache.set(key, entry);
    return entry.tokens;
  }

  setCachedLemmaTokens(text = "", tokens = []) {
    if (!this.isLemmaTokenCacheEnabled()) return;
    const key = this.buildLemmaCacheKey(text);
    this.lemmaTokenCache.set(key, {
      text,
      tokens,
      cachedAt: Date.now(),
    });
    while (this.lemmaTokenCache.size > LEMMA_CACHE_MAX_ENTRIES) {
      const oldestKey = this.lemmaTokenCache.keys().next().value;
      if (typeof oldestKey === "undefined") break;
      this.lemmaTokenCache.delete(oldestKey);
    }
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
    fallbackEntry.lemmaOffsetsAuthoritative = false;
    fallbackEntry.lemmaQuality = {
      authoritative: false,
      source: null,
      target: null,
    };
    try {
      const [sourceLemmaTokens, targetLemmaTokens] = await Promise.all([
        this.fetchLemmaTokens(originalText),
        this.fetchLemmaTokens(correctedText),
      ]);
      const sourceQuality = this.applyLemmaOffsets({
        collection: fallbackEntry.sourceAnchors,
        lemmas: sourceLemmaTokens,
        documentOffset,
      });
      const targetQuality = this.applyLemmaOffsets({
        collection: fallbackEntry.targetAnchors,
        lemmas: targetLemmaTokens,
        documentOffset,
      });
      const authoritative = Boolean(sourceQuality.authoritative && targetQuality.authoritative);
      fallbackEntry.lemmaOffsetsAuthoritative = authoritative;
      fallbackEntry.lemmaQuality = {
        authoritative,
        source: sourceQuality,
        target: targetQuality,
      };
      logInfo(
        "Lemma offsets applied",
        "| paragraph:",
        paragraphIndex,
        "| source tokens:",
        sourceLemmaTokens.length,
        "| target tokens:",
        targetLemmaTokens.length,
        "| source coverage:",
        sourceQuality.coverage,
        "| target coverage:",
        targetQuality.coverage,
        "| authoritative:",
        authoritative
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
    const cachedTokens = this.getCachedLemmaTokens(safeText);
    if (cachedTokens) {
      logInfo("Lemma cache hit", "| tokens:", cachedTokens.length);
      return cachedTokens;
    }
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
    this.setCachedLemmaTokens(safeText, lemmaTokens);
    this.logLemmaPayloadShapeOnce(response?.data, lemmaTokens);
    return lemmaTokens;
  }

  logLemmaPayloadShapeOnce(rawPayload, normalizedTokens = []) {
    if (this._didLogLemmaShapeThisRun) return;
    this._didLogLemmaShapeThisRun = true;
    const shape = summarizeLemmaPayloadShape(rawPayload, normalizedTokens);
    logInfo("Lemma payload shape", shape);
  }

  applyLemmaOffsets({ collection, lemmas, documentOffset = 0 }) {
    const quality = {
      totalAnchors: 0,
      matchedAnchors: 0,
      unmatchedAnchors: 0,
      coverage: 0,
      avgCharDrift: null,
      avgIndexDrift: null,
      authoritative: false,
    };
    if (!collection?.ordered?.length || !Array.isArray(lemmas) || !lemmas.length) {
      applyLemmaReliabilityFlags(collection, false);
      return quality;
    }
    let lemmaIndex = 0;
    const charDrifts = [];
    const indexDrifts = [];
    for (let orderedIndex = 0; orderedIndex < collection.ordered.length; orderedIndex++) {
      const anchor = collection.ordered[orderedIndex];
      if (!anchor) continue;
      const tokenText = anchor.tokenText ?? "";
      if (!tokenText.trim()) continue;
      quality.totalAnchors++;
      const expectedStart = Number.isFinite(anchor.charStart) ? anchor.charStart : undefined;
      const expectedIndex = resolveAnchorExpectedLemmaIndex(anchor, orderedIndex, lemmaIndex);
      const match = findLemmaMatch({
        tokenText,
        lemmas,
        startIndex: lemmaIndex,
        expectedIndex,
        expectedStart,
      });
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
        anchor.lemmaMatched = Boolean(anchor.matched);
        anchor.lemmaMatchType = match.matchType;
        anchor.lemmaMatchScore = match.score;
        if (Number.isFinite(match.charDistance)) {
          anchor.lemmaCharDrift = match.charDistance;
          charDrifts.push(match.charDistance);
        } else {
          anchor.lemmaCharDrift = undefined;
        }
        if (Number.isFinite(match.indexDistance)) {
          anchor.lemmaIndexDrift = match.indexDistance;
          indexDrifts.push(match.indexDistance);
        } else {
          anchor.lemmaIndexDrift = undefined;
        }
        quality.matchedAnchors++;
        lemmaIndex = match.index + 1;
      } else {
        anchor.lemmaMatched = false;
        anchor.lemmaMatchType = undefined;
        anchor.lemmaMatchScore = undefined;
        anchor.lemmaCharDrift = undefined;
        anchor.lemmaIndexDrift = undefined;
      }
    }
    quality.unmatchedAnchors = Math.max(0, quality.totalAnchors - quality.matchedAnchors);
    quality.coverage =
      quality.totalAnchors > 0 ? Number((quality.matchedAnchors / quality.totalAnchors).toFixed(3)) : 0;
    quality.avgCharDrift = summarizeAverage(charDrifts);
    quality.avgIndexDrift = summarizeAverage(indexDrifts);
    quality.authoritative =
      quality.totalAnchors >= LEMMA_AUTHORITATIVE_MIN_TOKENS &&
      quality.coverage >= LEMMA_AUTHORITATIVE_MIN_COVERAGE;
    applyLemmaReliabilityFlags(collection, quality.authoritative);
    return quality;
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
  const posRaw =
    raw.pos ?? raw.upos ?? raw.xpos ?? raw.tag ?? raw.posTag ?? raw.partOfSpeech ?? raw.part_of_speech;
  const pos = typeof posRaw === "string" ? posRaw.trim().toUpperCase() : "";
  return {
    text,
    normalized: normalizeForMatch(text),
    pos: pos || undefined,
    start: typeof start === "number" ? start : undefined,
    end: typeof end === "number" ? end : undefined,
    index: typeof raw.index === "number" ? raw.index : index ?? 0,
  };
}

function summarizeLemmaPayloadShape(payload, normalizedTokens = []) {
  const topType = Array.isArray(payload) ? "array" : typeof payload;
  const topKeys =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? Object.keys(payload)
      : [];
  const firstTokenMeta = extractFirstTokenWithPath(payload);
  const rawFirstToken = firstTokenMeta?.token;
  const rawFirstTokenKeys =
    rawFirstToken && typeof rawFirstToken === "object" ? Object.keys(rawFirstToken) : [];
  const rawOffsetFields = collectOffsetFields(rawFirstToken);
  const normalizedFirst = Array.isArray(normalizedTokens) ? normalizedTokens[0] : null;
  return {
    endpointPayloadType: topType,
    endpointTopKeys: topKeys,
    tokenPath: firstTokenMeta?.path || null,
    rawTokenCountHint: firstTokenMeta?.countHint ?? null,
    rawFirstTokenKeys,
    rawFirstTokenOffsetFields: rawOffsetFields,
    normalizedTokenCount: Array.isArray(normalizedTokens) ? normalizedTokens.length : 0,
    normalizedFirstTokenOffsets:
      normalizedFirst && typeof normalizedFirst === "object"
        ? {
            start: normalizedFirst.start,
            end: normalizedFirst.end,
          }
        : null,
  };
}

function extractFirstTokenWithPath(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return {
      path: "[0]",
      token: payload[0],
      countHint: payload.length,
    };
  }
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.tokens)) {
      return { path: "tokens[0]", token: payload.tokens[0], countHint: payload.tokens.length };
    }
    if (Array.isArray(payload.result)) {
      return { path: "result[0]", token: payload.result[0], countHint: payload.result.length };
    }
    if (Array.isArray(payload.words)) {
      return { path: "words[0]", token: payload.words[0], countHint: payload.words.length };
    }
    if (Array.isArray(payload.sentences)) {
      const firstSentence = payload.sentences[0];
      if (Array.isArray(firstSentence?.tokens)) {
        return {
          path: "sentences[0].tokens[0]",
          token: firstSentence.tokens[0],
          countHint: firstSentence.tokens.length,
        };
      }
      if (Array.isArray(firstSentence)) {
        return {
          path: "sentences[0][0]",
          token: firstSentence[0],
          countHint: firstSentence.length,
        };
      }
    }
  }
  return null;
}

function collectOffsetFields(token) {
  if (!token || typeof token !== "object") return [];
  const keys = Object.keys(token);
  const matches = [];
  for (const key of keys) {
    if (!/start|end|char|offset|begin|finish/i.test(key)) continue;
    matches.push({ key, value: token[key] });
  }
  return matches;
}

function pickNumber(candidates) {
  if (!Array.isArray(candidates)) return undefined;
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function normalizeForMatch(value) {
  return typeof value === "string"
    ? value
        .replace(/\s+/g, "")
        .replace(/[.,!?;:"'\u201C\u201D\u201E\u00AB\u00BB]/gu, "")
        .toLowerCase()
    : "";
}

function findLemmaMatch({
  tokenText,
  lemmas,
  startIndex = 0,
  expectedIndex = null,
  expectedStart = undefined,
}) {
  if (!Array.isArray(lemmas) || !lemmas.length) return null;
  const normalizedToken = normalizeForMatch(tokenText);
  if (!normalizedToken) return null;
  const safeStart = Math.max(0, Math.min(Math.floor(startIndex || 0), lemmas.length - 1));
  const safeExpectedIndex = Number.isFinite(expectedIndex)
    ? Math.max(0, Math.min(Math.floor(expectedIndex), lemmas.length - 1))
    : safeStart;
  const lowerWindow = Math.max(0, safeExpectedIndex - LEMMA_INDEX_WINDOW);
  const upperWindow = Math.min(lemmas.length - 1, safeExpectedIndex + LEMMA_INDEX_WINDOW);
  let best = null;
  for (let i = 0; i < lemmas.length; i++) {
    const lemma = lemmas[i];
    if (!lemma?.text) continue;
    const lemmaNorm = lemma.normalized || normalizeForMatch(lemma.text);
    const exactTextMatch = lemma.text === tokenText;
    const normalizedMatch = Boolean(lemmaNorm && lemmaNorm === normalizedToken);
    if (!exactTextMatch && !normalizedMatch) continue;

    const indexDistance = Math.abs(i - safeExpectedIndex);
    const hasStart = Number.isFinite(lemma.start);
    const charDistance =
      hasStart && Number.isFinite(expectedStart) ? Math.abs(lemma.start - expectedStart) : undefined;

    let score = 0;
    if (!exactTextMatch) score += 1.5;
    score += indexDistance * 0.9;
    if (i < safeStart) {
      // Strongly discourage regressions to earlier lemmas.
      score += (safeStart - i) * 2.5;
    }
    if (i < lowerWindow || i > upperWindow) {
      score += 6 + Math.abs(i - safeExpectedIndex);
    }
    if (Number.isFinite(charDistance)) {
      score += Math.min(12, charDistance / 24);
      if (charDistance > LEMMA_CHAR_WINDOW) {
        score += 8;
      }
    } else {
      score += 2;
    }

    if (
      !best ||
      score < best.score ||
      (score === best.score && indexDistance < best.indexDistance)
    ) {
      best = {
        ...lemma,
        index: i,
        score: Number(score.toFixed(3)),
        indexDistance,
        charDistance,
        matchType: exactTextMatch ? "exact" : "normalized",
      };
    }
  }
  if (!best) return null;
  const extremeCharDrift = Number.isFinite(best.charDistance) && best.charDistance > LEMMA_CHAR_WINDOW * 2;
  const extremeIndexDrift = best.indexDistance > LEMMA_INDEX_WINDOW * 2;
  if (extremeCharDrift && extremeIndexDrift) {
    return null;
  }
  if (best.index < safeStart - 4) {
    return null;
  }
  return best;
}

function parseTokenIdToIndex(tokenId) {
  if (typeof tokenId !== "string" || !tokenId.trim()) return null;
  const match = tokenId.match(/(\d+)(?!.*\d)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed - 1);
}

function resolveAnchorExpectedLemmaIndex(anchor, fallbackIndex = 0, floorIndex = 0) {
  const tokenIndex = Number.isFinite(anchor?.tokenIndex) ? Math.max(0, Math.floor(anchor.tokenIndex)) : null;
  const tokenIdIndex = parseTokenIdToIndex(anchor?.tokenId);
  if (Number.isFinite(tokenIndex)) {
    return Math.max(floorIndex, tokenIndex);
  }
  if (Number.isFinite(tokenIdIndex)) {
    return Math.max(floorIndex, tokenIdIndex);
  }
  return Math.max(floorIndex, Number.isFinite(fallbackIndex) ? Math.floor(fallbackIndex) : 0);
}

function summarizeAverage(values = []) {
  if (!Array.isArray(values) || !values.length) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / values.length).toFixed(3));
}

function applyLemmaReliabilityFlags(collection, authoritative) {
  if (!collection?.ordered?.length) return;
  for (const anchor of collection.ordered) {
    if (!anchor || typeof anchor !== "object") continue;
    anchor.lemmaAuthoritative = Boolean(authoritative && anchor.lemmaMatched);
  }
}
