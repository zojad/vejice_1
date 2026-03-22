import { createSuggestion } from "./Suggestion.js";
import {
  normalizeParagraphWhitespace,
  onlyCommasChanged,
  isNumericComma,
  charAtSafe,
  QUOTES,
  extractTokenBoundaryMetadata,
} from "./textUtils.js";
import {
  tokenizeForAnchoring,
  mapTokensToParagraphText,
  findAnchorsNearChar,
} from "../anchoring/SyntheticAnchorProvider.js";

const MAX_PARAGRAPH_CHARS = 3000;
const PARAGRAPH_FIRST_MAX_CHARS = 1200;
const MIN_CHUNK_MERGE_CHARS = 20;
const LEMMA_CHUNK_TARGET_CHARS = 650;
const LEMMA_CHUNK_SOFT_MAX_CHARS = 900;
const LEMMA_CHUNK_MAX_UNITS = 3;
const LEMMA_SPLIT_WINDOW_CHARS = 180;
const LEMMA_MIN_SEGMENT_CHARS = 120;
const LEMMA_SPLIT_CONFIDENCE_THRESHOLD = 0.9;
const LEMMA_HEURISTIC_MIN_LEN = 700;
const API_RECHUNK_MAX_DEPTH = 2;
const API_RECHUNK_MIN_CHARS = 120;
const SALVAGE_RECHUNK_MIN_DIFF_OPS = 12;
const CHUNK_ANALYZE_CONCURRENCY_DEFAULT = 1;
const LOCAL_CHUNK_ANALYZE_CONCURRENCY_DEFAULT = 1;
const CHUNK_ANALYZE_CONCURRENCY_MAX = 4;
const CHUNK_API_CACHE_MAX_ENTRIES_DEFAULT = 800;
const CHUNK_API_CACHE_TTL_MS_DEFAULT = 10 * 60 * 1000;
const API_FAILURE_COOLDOWN_MS = 90000;
const API_FAILURE_RETRY_COOLDOWN_MS = 12000;
const API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN = 2;
const TRAILING_COMMA_REGEX = /[,\s\u200B-\u200D\uFEFF]+$/;
const BOUNDARY_QUOTE_REGEX = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
const BOUNDARY_CLOSER_REGEX = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A)\]]/u;
const BOUNDARY_OPENER_REGEX = /["'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A(\[]/u;
const BOUNDARY_DASH_REGEX = /[-\u2013\u2014\u2212]/u;
const TRAILING_BOUNDARY_CLOSER_REGEX = BOUNDARY_CLOSER_REGEX;
const INVISIBLE_GAP_REGEX = /[\s\u200B-\u200D\uFEFF]/u;
const LOG_PREFIX = "[Vejice DEBUG DUMP]";
const DEBUG_DUMP_STORAGE_KEY = "vejice:debug:dumps";
const DEBUG_DUMP_LAST_STORAGE_KEY = "vejice:debug:lastDump";
const BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);
const parseQuietBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
};
const QUIET_LOGS_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_QUIET_LOGS__ === "boolean"
    ? window.__VEJICE_QUIET_LOGS__
    : typeof process !== "undefined"
      ? parseQuietBoolean(process.env?.VEJICE_QUIET_LOGS)
      : undefined;
const QUIET_LOGS = typeof QUIET_LOGS_OVERRIDE === "boolean" ? QUIET_LOGS_OVERRIDE : true;

function isAbortLikeError(err, signal) {
  if (signal?.aborted) return true;
  const code = typeof err?.code === "string" ? err.code.toUpperCase() : "";
  const name = typeof err?.name === "string" ? err.name : "";
  return code === "ERR_CANCELED" || name === "AbortError" || name === "CanceledError";
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  const reason = signal.reason;
  if (reason instanceof Error) {
    throw reason;
  }
  throw new Error(typeof reason === "string" ? reason : "Request aborted");
}

async function runWithConcurrency(items, concurrency, worker) {
  if (!Array.isArray(items) || !items.length) return [];
  const safeConcurrency = Math.max(1, Math.min(Number(concurrency) || 1, items.length));
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
  if (QUIET_LOGS) return false;
  if (typeof window === "undefined") return false;
  const isTruthyFlag = (value) =>
    value === true || value === 1 || value === "1" || value === "true";
  if (isTruthyFlag(window.__VEJICE_DEBUG_DUMP__)) return true;
  if (isTruthyFlag(window.__VEJICE_DEBUG__)) return true;
  try {
    const storage = window.localStorage;
    if (storage) {
      const stored = storage.getItem("vejice:debug:dump");
      if (isTruthyFlag(stored)) return true;
    }
  } catch (_err) {
    // Ignore storage access failures.
  }
  return false;
}

function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
}

function isDeterministicMappingV2Enabled() {
  if (typeof window !== "undefined") {
    const windowOverride = parseBooleanFlag(window.__VEJICE_DETERMINISTIC_MAPPING_V2);
    if (typeof windowOverride === "boolean") return windowOverride;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanFlag(process.env?.VEJICE_DETERMINISTIC_MAPPING_V2);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return false;
}

function pushDeepDebugDump(payload) {
  if (!isDeepDebugEnabled() || typeof window === "undefined") return;
  const safePayload = {
    ts: Date.now(),
    ...payload,
  };
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
    const storage = window.localStorage;
    if (!storage) return;
    storage.setItem(DEBUG_DUMP_LAST_STORAGE_KEY, JSON.stringify(safePayload));
    const existingRaw = storage.getItem(DEBUG_DUMP_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const list = Array.isArray(existing) ? existing : [];
    list.push(safePayload);
    while (list.length > 20) {
      list.shift();
    }
    storage.setItem(DEBUG_DUMP_STORAGE_KEY, JSON.stringify(list));
  } catch (_err2) {
    // Ignore storage failures in restricted runtimes.
  }
}

export class CommaSuggestionEngine {
  constructor({ anchorProvider, apiClient, notifiers = {} }) {
    this.anchorProvider = anchorProvider;
    this.apiClient = apiClient;
    this.lastDebugDump = null;
    this.debugDumps = [];
    this.apiChunkFailureCooldownUntil = new Map();
    this.chunkApiCacheMaxEntries = resolveChunkApiCacheMaxEntries();
    this.chunkApiCacheTtlMs = resolveChunkApiCacheTtlMs();
    this.chunkApiResponseCache = new Map();
    this.notifiers = {
      onParagraphTooLong: notifiers.onParagraphTooLong || (() => {}),
      onSentenceTooLong: notifiers.onSentenceTooLong || (() => {}),
      onChunkApiFailure: notifiers.onChunkApiFailure || (() => {}),
      onChunkNonCommaChanges: notifiers.onChunkNonCommaChanges || (() => {}),
    };
  }

  async analyzeParagraph({
    paragraphIndex,
    originalText,
    normalizedOriginalText,
    paragraphDocOffset,
    forceSentenceChunks = false,
    conservativeSentenceFallback = false,
    abortSignal = null,
  }) {
    throwIfAborted(abortSignal);
    const paragraphText = typeof originalText === "string" ? originalText : "";
    pruneExpiredChunkFailureCooldowns(this.apiChunkFailureCooldownUntil);
    this.pruneChunkApiResponseCache(Date.now());
    const forceSentenceByLength = paragraphText.length > PARAGRAPH_FIRST_MAX_CHARS;
    const useSentenceChunks = forceSentenceChunks || forceSentenceByLength;
    const debugEnabled = isDeepDebugEnabled();
    const debugDump = debugEnabled
      ? {
          analysisMode: useSentenceChunks ? "sentence" : "paragraph",
          sentenceModeReason: forceSentenceChunks
            ? "forced"
            : forceSentenceByLength
              ? "paragraph-too-long"
              : "none",
          paragraphIndex,
          paragraphDocOffset,
          originalText,
          normalizedOriginalText:
            typeof normalizedOriginalText === "string"
              ? normalizedOriginalText
              : normalizeParagraphWhitespace(originalText),
          chunks: [],
          skippedChunks: [],
          final: {},
        }
      : null;
    let chunks = null;
    if (useSentenceChunks) {
      chunks = await splitParagraphIntoChunksWithLemmas(
        originalText,
        MAX_PARAGRAPH_CHARS,
        this.anchorProvider
      );
    }
    if (!Array.isArray(chunks) || !chunks.length) {
      chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS, {
        preferWholeParagraph: !useSentenceChunks,
        conservativePack: useSentenceChunks && conservativeSentenceFallback,
      });
    }
    if (!chunks.length) {
      return {
        suggestions: [],
        apiErrors: 0,
        nonCommaSkips: 0,
        nonCommaSalvaged: 0,
        processedAny: false,
        anchorsEntry: await this.anchorProvider.getAnchors({
          paragraphIndex,
          originalText,
          correctedText: originalText,
          sourceTokens: [],
          targetTokens: [],
          documentOffset: paragraphDocOffset,
        }),
      };
    }
    const normalizedSource =
      typeof normalizedOriginalText === "string"
        ? normalizedOriginalText
        : normalizeParagraphWhitespace(originalText);
    chunks.forEach((chunk) => {
      chunk.normalizedText = normalizedSource.slice(chunk.start, chunk.end);
    });

    const makeSnippet = (value, max = 140) =>
      typeof value === "string" ? value.slice(0, max).replace(/\s+/g, " ").trim() : "";
    const logSkippedChunk = (reason, chunk, extra = {}) => {
      if (!debugEnabled) return;
      const payload = {
        reason,
        paragraphIndex,
        chunkIndex: chunk?.index,
        depth: extra.depth ?? 0,
        start: chunk?.start,
        end: chunk?.end,
        length:
          typeof chunk?.length === "number"
            ? chunk.length
            : typeof chunk?.start === "number" && typeof chunk?.end === "number"
              ? Math.max(0, chunk.end - chunk.start)
              : undefined,
        snippet: makeSnippet(chunk?.text || chunk?.normalizedText || ""),
        ...extra,
      };
      if (debugDump) {
        debugDump.skippedChunks.push(payload);
      }
      try {
        console.warn("[Vejice Chunk Skip]", payload);
      } catch (_err) {
        // Ignore logging failures in restricted runtimes.
      }
    };

    const chunkMetaKey = (chunk) => {
      const index = String(chunk?.index ?? "");
      const start = Number.isFinite(chunk?.start) ? chunk.start : "";
      const end = Number.isFinite(chunk?.end) ? chunk.end : "";
      return `${index}|${start}|${end}`;
    };

    const summarizeProcessedMeta = (items = []) => {
      let apiErrorsCount = 0;
      let nonCommaSkipsCount = 0;
      let nonCommaSalvagedCount = 0;
      for (const meta of items) {
        if (!meta) continue;
        if (meta.nonCommaSalvaged) {
          nonCommaSalvagedCount++;
        }
        if (meta.detail) continue;
        if (
          meta.skipReason === "apiError" ||
          meta.skipReason === "apiErrorCooldown" ||
          meta.skipReason === "apiErrorMaxAttempts"
        ) {
          apiErrorsCount++;
        } else if (meta.skipReason === "nonCommaChange") {
          nonCommaSkipsCount++;
        }
      }
      return {
        apiErrors: apiErrorsCount,
        nonCommaSkips: nonCommaSkipsCount,
        nonCommaSalvaged: nonCommaSalvagedCount,
      };
    };

    const mergeRetryArtifacts = (currentMeta, currentChunkDetails, retryMeta, retryChunkDetails) => {
      const metaMap = new Map();
      (currentMeta || []).forEach((meta) => {
        if (!meta?.chunk) return;
        metaMap.set(chunkMetaKey(meta.chunk), meta);
      });
      (retryMeta || []).forEach((meta) => {
        if (!meta?.chunk) return;
        const key = chunkMetaKey(meta.chunk);
        const existing = metaMap.get(key);
        if (!existing || (!existing.detail && meta.detail)) {
          metaMap.set(key, meta);
        }
      });

      const detailMap = new Map();
      (currentChunkDetails || []).forEach((entry) => {
        if (!entry?.chunk) return;
        detailMap.set(chunkMetaKey(entry.chunk), entry);
      });
      (retryChunkDetails || []).forEach((entry) => {
        if (!entry?.chunk) return;
        detailMap.set(chunkMetaKey(entry.chunk), entry);
      });

      return {
        processedMeta: Array.from(metaMap.values()),
        chunkDetails: Array.from(detailMap.values()),
      };
    };

    const mergeChunkProcessResults = (results = []) => {
      const merged = {
        processedMeta: [],
        chunkDetails: [],
        apiErrors: 0,
        nonCommaSkips: 0,
        nonCommaSalvaged: 0,
      };
      for (const entry of results) {
        if (!entry) continue;
        if (Array.isArray(entry.processedMeta) && entry.processedMeta.length) {
          merged.processedMeta.push(...entry.processedMeta);
        }
        if (Array.isArray(entry.chunkDetails) && entry.chunkDetails.length) {
          merged.chunkDetails.push(...entry.chunkDetails);
        }
        merged.apiErrors += entry.apiErrors || 0;
        merged.nonCommaSkips += entry.nonCommaSkips || 0;
        merged.nonCommaSalvaged += entry.nonCommaSalvaged || 0;
      }
      return merged;
    };

    const chunkFailureAttemptsThisRun = new Map();
    const chunkHardFailedThisRun = new Set();

    const processChunk = async (chunk, depth = 0) => {
      throwIfAborted(abortSignal);
      const chunkInputText = chunk.normalizedText || chunk.text || "";
      const meta = {
        chunk,
        correctedText: chunkInputText,
        detail: null,
        syntheticTokens: null,
        forceSyntheticAnchoring: false,
        lowAnchorReliability: Boolean(chunk?.lowAnchorReliability),
        skipReason: null,
        nonCommaSalvaged: false,
      };
      const chunkResult = {
        processedMeta: [meta],
        chunkDetails: [],
        apiErrors: 0,
        nonCommaSkips: 0,
        nonCommaSalvaged: 0,
      };

      if (chunk.tooLong) {
        meta.skipReason = "tooLong";
        logSkippedChunk("tooLong", chunk, { depth });
        this.notifiers.onSentenceTooLong(paragraphIndex, chunk.length);
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        return chunkResult;
      }
      let detail = null;
      const chunkRequestText = chunkInputText;
      const chunkFailureKey = buildChunkFailureKey(paragraphIndex, chunkRequestText);
      const failureAttempts = chunkFailureAttemptsThisRun.get(chunkFailureKey) || 0;
      if (
        chunkHardFailedThisRun.has(chunkFailureKey) ||
        failureAttempts >= API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN
      ) {
        meta.skipReason = "apiErrorMaxAttempts";
        logSkippedChunk("apiErrorMaxAttempts", chunk, {
          depth,
          attempts: failureAttempts,
          maxAttempts: API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN,
        });
        chunkResult.apiErrors++;
        this.notifiers.onChunkApiFailure(
          paragraphIndex,
          chunk.index,
          new Error("Chunk skipped due to retry budget exhaustion")
        );
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        return chunkResult;
      }
      const cooldownUntil = this.apiChunkFailureCooldownUntil.get(chunkFailureKey) || 0;
      if (cooldownUntil > Date.now()) {
        meta.skipReason = "apiErrorCooldown";
        logSkippedChunk("apiErrorCooldown", chunk, {
          depth,
          cooldownMsRemaining: Math.max(0, cooldownUntil - Date.now()),
        });
        chunkResult.apiErrors++;
        this.notifiers.onChunkApiFailure(
          paragraphIndex,
          chunk.index,
          new Error("Chunk skipped due to recent API failure cooldown")
        );
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        return chunkResult;
      }
      const cachedDetail = this.getChunkApiCachedDetail(chunkRequestText);
      if (cachedDetail) {
        detail = cachedDetail;
        this.apiChunkFailureCooldownUntil.delete(chunkFailureKey);
      } else {
        try {
          detail = await this.apiClient.popraviPovedDetailed(chunkRequestText, {
            signal: abortSignal,
          });
          this.apiChunkFailureCooldownUntil.delete(chunkFailureKey);
          this.setChunkApiCachedDetail(chunkRequestText, detail);
        } catch (apiErr) {
          if (isAbortLikeError(apiErr, abortSignal)) {
            throw apiErr;
          }
          const updatedFailureAttempts = failureAttempts + 1;
          chunkFailureAttemptsThisRun.set(chunkFailureKey, updatedFailureAttempts);
          const exhaustedRetryBudget =
            updatedFailureAttempts >= API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN;
          if (exhaustedRetryBudget) {
            chunkHardFailedThisRun.add(chunkFailureKey);
          }
          const cooldownMs = exhaustedRetryBudget
            ? API_FAILURE_COOLDOWN_MS
            : API_FAILURE_RETRY_COOLDOWN_MS;
          this.apiChunkFailureCooldownUntil.set(chunkFailureKey, Date.now() + cooldownMs);

          const retryChunks = exhaustedRetryBudget ? null : splitFailedChunkForRetry(chunk, depth);
          if (Array.isArray(retryChunks) && retryChunks.length > 1) {
            const retryResults = [];
            for (const retryChunk of retryChunks) {
              retryResults.push(await processChunk(retryChunk, depth + 1));
            }
            return mergeChunkProcessResults(retryResults);
          }
          meta.skipReason = exhaustedRetryBudget ? "apiErrorMaxAttempts" : "apiError";
          logSkippedChunk(meta.skipReason, chunk, {
            depth,
            apiError: apiErr?.message || String(apiErr || "API error"),
            attempts: updatedFailureAttempts,
            maxAttempts: API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN,
            cooldownMs,
          });
          chunkResult.apiErrors++;
          this.notifiers.onChunkApiFailure(paragraphIndex, chunk.index, apiErr);
          meta.syntheticTokens = tokenizeForAnchoring(
            chunk.text,
            `p${paragraphIndex}_c${chunk.index}_syn_`
          );
          return chunkResult;
        }
      }
      const correctedChunk = detail.correctedText;
      const baseForDiff = chunk.text || chunkInputText || "";
      const apiCommaOps = normalizeApiCommaOps(detail?.commaOps, baseForDiff, correctedChunk);
      const hasApiCommaOps = apiCommaOps.length > 0;
      const commaDiffOps = collapseDuplicateDiffOps(
        filterCommaOps(baseForDiff, correctedChunk, diffCommasOnly(baseForDiff, correctedChunk))
      );
      const hasCommaDiffOps = commaDiffOps.length > 0;
      const onlyCommaTextChange = onlyCommasChanged(chunkInputText, correctedChunk);
      const hasNonCommaDrift = !onlyCommaTextChange;
      if (debugEnabled && debugDump) {
        debugDump.chunks.push({
          index: chunk.index,
          start: chunk.start,
          end: chunk.end,
          normalizedInput: chunkInputText,
          correctedChunk,
          hasNonCommaDrift,
          hasApiCommaOps,
          apiCommaOpsCount: apiCommaOps.length,
          fallbackCommaOpsCount: commaDiffOps.length,
          lowAnchorReliability: meta.lowAnchorReliability,
          rawSourceText: detail?.raw?.source_text,
          rawTargetText: detail?.raw?.target_text,
          rawCorrections: detail?.corrections,
          rawCommaOps: Array.isArray(detail?.commaOps) ? detail.commaOps : [],
          rawSourceTokensCount: Array.isArray(detail?.sourceTokens) ? detail.sourceTokens.length : 0,
          rawTargetTokensCount: Array.isArray(detail?.targetTokens) ? detail.targetTokens.length : 0,
        });
      }
      if (!hasApiCommaOps && hasNonCommaDrift && !hasCommaDiffOps) {
        meta.skipReason = "nonCommaChange";
        logSkippedChunk("nonCommaChange", chunk, {
          depth,
          correctedSnippet: makeSnippet(correctedChunk),
        });
        this.notifiers.onChunkNonCommaChanges(
          paragraphIndex,
          chunk.index,
          chunk.text,
          correctedChunk
        );
        chunkResult.nonCommaSkips++;
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        return chunkResult;
      }
      if (!hasApiCommaOps && hasNonCommaDrift && hasCommaDiffOps) {
        const salvageRetryChunks = splitFailedChunkForRetry(chunk, depth);
        if (
          commaDiffOps.length >= SALVAGE_RECHUNK_MIN_DIFF_OPS &&
          Array.isArray(salvageRetryChunks) &&
          salvageRetryChunks.length > 1
        ) {
          const salvageResults = [];
          for (const retryChunk of salvageRetryChunks) {
            salvageResults.push(await processChunk(retryChunk, depth + 1));
          }
          return mergeChunkProcessResults(salvageResults);
        }
        chunkResult.nonCommaSalvaged++;
        meta.nonCommaSalvaged = true;
        logSkippedChunk("nonCommaChangeSalvaged", chunk, {
          depth,
          correctedSnippet: makeSnippet(correctedChunk),
          fallbackCommaOps: commaDiffOps.length,
        });
      }
      meta.detail = detail;
      const shouldForceSyntheticAnchoring = hasNonCommaDrift && !hasApiCommaOps;
      meta.forceSyntheticAnchoring = shouldForceSyntheticAnchoring;
      meta.lowAnchorReliability = meta.lowAnchorReliability || shouldForceSyntheticAnchoring;
      const commaOnlyOps = hasApiCommaOps ? apiCommaOps : commaDiffOps;
      const useCommaOnlyCorrectedChunk = hasNonCommaDrift && !hasApiCommaOps && commaOnlyOps.length > 0;
      meta.correctedText = useCommaOnlyCorrectedChunk
        ? buildCommaOnlyCorrectedText(baseForDiff, commaOnlyOps)
        : correctedChunk;

      const diffOps = hasApiCommaOps ? [] : commaDiffOps;
      if (!meta.detail && !diffOps.length && !apiCommaOps.length) {
        return chunkResult;
      }
      chunkResult.chunkDetails.push({
        chunk,
        metaRef: meta,
        baseForDiff,
        correctedChunk,
        diffOps,
        apiCommaOps,
      });
      return chunkResult;
    };

    const chunkAnalyzeConcurrency = resolveChunkAnalyzeConcurrency();
    const chunkResults = await runWithConcurrency(
      chunks,
      chunkAnalyzeConcurrency,
      async (chunk) => {
        throwIfAborted(abortSignal);
        return processChunk(chunk, 0);
      }
    );

    const mergedChunkResults = mergeChunkProcessResults(chunkResults);
    let processedMeta = mergedChunkResults.processedMeta;
    let chunkDetails = mergedChunkResults.chunkDetails;
    let apiErrors = mergedChunkResults.apiErrors;
    let nonCommaChunkSkips = mergedChunkResults.nonCommaSkips;
    let nonCommaChunkSalvaged = mergedChunkResults.nonCommaSalvaged;

    const compareChunks = (aChunk, bChunk) => {
      const aStart = Number.isFinite(aChunk?.start) ? aChunk.start : 0;
      const bStart = Number.isFinite(bChunk?.start) ? bChunk.start : 0;
      if (aStart !== bStart) return aStart - bStart;
      const aEnd = Number.isFinite(aChunk?.end) ? aChunk.end : aStart;
      const bEnd = Number.isFinite(bChunk?.end) ? bChunk.end : bStart;
      if (aEnd !== bEnd) return aEnd - bEnd;
      const aIndex = String(aChunk?.index ?? "");
      const bIndex = String(bChunk?.index ?? "");
      return aIndex.localeCompare(bIndex, undefined, { numeric: true, sensitivity: "base" });
    };
    processedMeta.sort((a, b) => compareChunks(a?.chunk, b?.chunk));
    chunkDetails.sort((a, b) => compareChunks(a?.chunk, b?.chunk));

    const failedChunksForFinalRetry = processedMeta
      .filter(
        (meta) =>
          meta &&
          !meta.detail &&
          (meta.skipReason === "apiError" || meta.skipReason === "apiErrorCooldown")
      )
      .map((meta) => meta.chunk)
      .filter(Boolean);
    if (failedChunksForFinalRetry.length > 0) {
      const retryResults = [];
      for (const failedChunk of failedChunksForFinalRetry) {
        throwIfAborted(abortSignal);
        const failedChunkText = failedChunk.normalizedText || failedChunk.text || "";
        const failedChunkKey = buildChunkFailureKey(paragraphIndex, failedChunkText);
        const attempts = chunkFailureAttemptsThisRun.get(failedChunkKey) || 0;
        if (
          chunkHardFailedThisRun.has(failedChunkKey) ||
          attempts >= API_FAILURE_MAX_ATTEMPTS_PER_CHUNK_PER_RUN
        ) {
          continue;
        }
        retryResults.push(await processChunk(failedChunk, 0));
      }
      if (retryResults.length > 0) {
        const retryMerged = mergeChunkProcessResults(retryResults);
        const mergedAfterRetry = mergeRetryArtifacts(
          processedMeta,
          chunkDetails,
          retryMerged.processedMeta,
          retryMerged.chunkDetails
        );
        processedMeta = mergedAfterRetry.processedMeta;
        chunkDetails = mergedAfterRetry.chunkDetails;
        const recomputedStats = summarizeProcessedMeta(processedMeta);
        apiErrors = recomputedStats.apiErrors;
        nonCommaChunkSkips = recomputedStats.nonCommaSkips;
        nonCommaChunkSalvaged = recomputedStats.nonCommaSalvaged;
        processedMeta.sort((a, b) => compareChunks(a?.chunk, b?.chunk));
        chunkDetails.sort((a, b) => compareChunks(a?.chunk, b?.chunk));
      }
    }

    const hasDetailedChunk = processedMeta.some((meta) => meta.detail);
    const canFallbackToSentences = !forceSentenceChunks && chunks.length === 1;
    if (!hasDetailedChunk && canFallbackToSentences && (apiErrors > 0 || nonCommaChunkSkips > 0)) {
      return this.analyzeParagraph({
        paragraphIndex,
        originalText,
        normalizedOriginalText,
        paragraphDocOffset,
        forceSentenceChunks: true,
        conservativeSentenceFallback,
        abortSignal,
      });
    }

    if (!hasDetailedChunk) {
      const anchorsEntry = await this.anchorProvider.getAnchors({
        paragraphIndex,
        originalText,
        correctedText: originalText,
        sourceTokens: [],
        targetTokens: [],
        documentOffset: paragraphDocOffset,
      });
      return {
        suggestions: [],
        apiErrors,
        nonCommaSkips: nonCommaChunkSkips,
        nonCommaSalvaged: nonCommaChunkSalvaged,
        processedAny: false,
        anchorsEntry,
      };
    }

    const correctedParagraph = processedMeta
      .map((meta) => meta.correctedText + (meta.chunk.trailing ?? ""))
      .join("");
    const sourceTokens = [];
    const targetTokens = [];

    processedMeta.forEach((meta) => {
      const basePrefix = `p${paragraphIndex}_c${meta.chunk.index}_`;
      if (meta.detail && !meta.forceSyntheticAnchoring) {
        const { tokens: rekeyedSource, map: sourceMap } = rekeyTokensWithMap(
          meta.detail.sourceTokens,
          `${basePrefix}s`
        );
        sourceTokens.push(...rekeyedSource);
        const { tokens: rekeyedTarget } = rekeyTokensWithMap(meta.detail.targetTokens, `${basePrefix}t`);
        targetTokens.push(...rekeyedTarget);
        meta.remappedCorrections = remapCorrections(meta.detail.corrections, sourceMap);
      } else if (meta.detail && meta.forceSyntheticAnchoring) {
        // In salvage mode keep API source token ids (for correction ops),
        // but anchor target side against comma-only corrected text.
        const { tokens: rekeyedSource, map: sourceMap } = rekeyTokensWithMap(
          meta.detail.sourceTokens,
          `${basePrefix}s`
        );
        sourceTokens.push(...rekeyedSource);
        const sourceSeed = meta.chunk.normalizedText || meta.chunk.text || "";
        const targetSeed = typeof meta.correctedText === "string" ? meta.correctedText : sourceSeed;
        targetTokens.push(...tokenizeForAnchoring(targetSeed, `${basePrefix}synt_`));
        meta.remappedCorrections = remapCorrections(meta.detail.corrections, sourceMap);
      } else {
        const sourceSeed = meta.chunk.normalizedText || meta.chunk.text || "";
        const targetSeed = typeof meta.correctedText === "string" ? meta.correctedText : sourceSeed;
        sourceTokens.push(...tokenizeForAnchoring(sourceSeed, `${basePrefix}syns_`));
        targetTokens.push(...tokenizeForAnchoring(targetSeed, `${basePrefix}synt_`));
      }
    });

    const anchorsEntry = await this.anchorProvider.getAnchors({
      paragraphIndex,
      originalText,
      correctedText: correctedParagraph,
      sourceTokens,
      targetTokens,
      documentOffset: paragraphDocOffset,
    });

    const suggestions = [];
    const suggestionDedupKeys = new Set();
    const debugOpFlow = debugEnabled ? [] : null;

    for (const entry of chunkDetails) {
      const detailRef = entry.metaRef?.detail
        ? {
            ...entry.metaRef.detail,
            corrections: entry.metaRef.remappedCorrections ?? entry.metaRef.detail.corrections,
          }
        : null;
      const apiOpsPresent = Array.isArray(entry.apiCommaOps) && entry.apiCommaOps.length > 0;
      let ops = apiOpsPresent ? entry.apiCommaOps.map((op) => ({ ...op })) : [];
      let fallbackOps = [];
      let correctionOps = [];
      if (!apiOpsPresent) {
        const correctionTracking = detailRef?.corrections ? createCorrectionTracking() : null;
        const correctionsPresent = correctionsHaveEntries(detailRef?.corrections);
        if (correctionsPresent) {
          correctionOps = collectCommaOpsFromCorrections(
            detailRef,
            anchorsEntry,
            paragraphIndex,
            correctionTracking
          );
          ops = correctionOps;
        }
        fallbackOps = entry.diffOps || [];
        if (fallbackOps.length) {
          if (!correctionsPresent || ops.length) {
            fallbackOps = filterDiffOpsAgainstCorrections(fallbackOps, correctionTracking);
          }
          const hasCorrectionInsertOps =
            correctionsPresent && Array.isArray(ops) && ops.some((candidate) => candidate?.kind === "insert");
          if (hasCorrectionInsertOps) {
            fallbackOps = fallbackOps.filter((candidate) => candidate?.kind !== "insert");
          }
          if (entry.metaRef?.forceSyntheticAnchoring && correctionsPresent && ops.length) {
            // In salvage mode prefer correction-derived comma ops when available;
            // diff ops are often position-noisy after non-comma drift.
            fallbackOps = [];
          }
          if (!correctionsPresent && detailRef && !ops.length) {
            ops = fallbackOps.map((op) => ({ ...op, fromCorrections: true, viaDiffFallback: true }));
            fallbackOps = [];
          } else if (correctionsPresent) {
            fallbackOps = fallbackOps.map((op) => ({
              ...op,
              fromCorrections: true,
              viaDiffFallback: true,
            }));
          }
        }
      }
      const usingFallbackOnly = !ops.length;
      const allOps = mergePreferredCommaOps(ops, fallbackOps);
      if (!allOps.length) continue;
      const opFlow = debugEnabled
        ? {
            chunkIndex: entry.chunk.index,
            fromApiCommaOps: apiOpsPresent ? ops.map((op) => ({ ...op })) : [],
            fromCorrections: correctionOps.map((op) => ({ ...op })),
            fallbackOps: fallbackOps.map((op) => ({ ...op })),
            usingApiCommaOps: apiOpsPresent,
            usingFallbackOnly,
            keptOps: [],
            droppedOps: [],
          }
        : null;
      for (const op of allOps) {
        const offset = entry.chunk.start;
        const baseOp = op;
        const adjustedOp = {
          ...baseOp,
          pos: baseOp.pos + offset,
          originalPos:
            (typeof baseOp.originalPos === "number" ? baseOp.originalPos : baseOp.pos) + offset,
          correctedPos:
            (typeof baseOp.correctedPos === "number" ? baseOp.correctedPos : baseOp.pos) + offset,
        };
        if (!isOpConsistentWithTexts(adjustedOp, originalText, correctedParagraph)) {
          if (opFlow) opFlow.droppedOps.push({ reason: "inconsistent_with_texts", op: adjustedOp });
          continue;
        }
        if (shouldSuppressDueToRepeatedToken(anchorsEntry, adjustedOp)) {
          if (opFlow) opFlow.droppedOps.push({ reason: "repeated_token_suppression", op: adjustedOp });
          continue;
        }
        const suggestion = buildSuggestionFromOp({
          op: adjustedOp,
          paragraphIndex,
          anchorsEntry,
          originalText,
          correctedParagraph,
          lowAnchorReliability: Boolean(entry.metaRef?.lowAnchorReliability),
        });
        if (suggestion) {
          const dedupKey = buildSuggestionDedupKey(suggestion);
          if (dedupKey && suggestionDedupKeys.has(dedupKey)) {
            if (opFlow) {
              opFlow.droppedOps.push({
                reason: "duplicate_suggestion",
                op: adjustedOp,
                suggestionId: suggestion.id,
                dedupKey,
              });
            }
            continue;
          }
          if (dedupKey) {
            suggestionDedupKeys.add(dedupKey);
          }
          suggestions.push(suggestion);
          if (opFlow) opFlow.keptOps.push({ op: adjustedOp, suggestionId: suggestion.id, dedupKey });
        }
      }
      if (opFlow && debugOpFlow) {
        debugOpFlow.push(opFlow);
      }
    }

    if (debugEnabled && debugDump) {
      debugDump.final = {
        correctedParagraph,
        suggestionsCount: suggestions.length,
        nonCommaSkips: nonCommaChunkSkips,
        nonCommaSalvaged: nonCommaChunkSalvaged,
        suggestions: suggestions.map((s) => ({
          id: s.id,
          kind: s.kind,
          paragraphIndex: s.paragraphIndex,
          charHint: s.charHint,
          op: s?.meta?.op,
          deterministicConfidence: s?.meta?.deterministicConfidence,
          sourceTokenBefore: s?.meta?.anchor?.sourceTokenBefore?.tokenText,
          sourceTokenAfter: s?.meta?.anchor?.sourceTokenAfter?.tokenText,
          targetTokenBefore: s?.meta?.anchor?.targetTokenBefore?.tokenText,
          targetTokenAfter: s?.meta?.anchor?.targetTokenAfter?.tokenText,
        })),
        opFlow: debugOpFlow || [],
      };
      this.lastDebugDump = debugDump;
      this.debugDumps.push(debugDump);
      if (this.debugDumps.length > 20) {
        this.debugDumps.shift();
      }
      pushDeepDebugDump(debugDump);
    }

    if (!suggestions.length && canFallbackToSentences && nonCommaChunkSkips > 0) {
      return this.analyzeParagraph({
        paragraphIndex,
        originalText,
        normalizedOriginalText,
        paragraphDocOffset,
        forceSentenceChunks: true,
        conservativeSentenceFallback,
        abortSignal,
      });
    }

    return {
      suggestions,
      apiErrors,
      nonCommaSkips: nonCommaChunkSkips,
      nonCommaSalvaged: nonCommaChunkSalvaged,
      processedAny: Boolean(suggestions.length),
      anchorsEntry,
      correctedParagraph,
    };
  }

  getChunkApiCachedDetail(chunkText) {
    if (!this.isChunkApiCacheEnabled()) return null;
    const safeText = typeof chunkText === "string" ? chunkText : "";
    if (!safeText) return null;
    const key = buildChunkApiCacheKey(safeText);
    const nowTs = Date.now();
    const entry = this.chunkApiResponseCache.get(key);
    if (!entry) return null;
    if (!entry.expiresAt || entry.expiresAt <= nowTs || entry.chunkText !== safeText) {
      this.chunkApiResponseCache.delete(key);
      return null;
    }
    // Refresh entry recency to approximate LRU behavior.
    this.chunkApiResponseCache.delete(key);
    this.chunkApiResponseCache.set(key, entry);
    return cloneChunkApiDetail(entry.detail);
  }

  setChunkApiCachedDetail(chunkText, detail) {
    if (!this.isChunkApiCacheEnabled()) return;
    const safeText = typeof chunkText === "string" ? chunkText : "";
    if (!safeText || !detail || typeof detail !== "object") return;
    const key = buildChunkApiCacheKey(safeText);
    const nowTs = Date.now();
    this.chunkApiResponseCache.set(key, {
      chunkText: safeText,
      expiresAt: nowTs + this.chunkApiCacheTtlMs,
      detail: cloneChunkApiDetail(detail),
    });
    this.pruneChunkApiResponseCache(nowTs);
  }

  isChunkApiCacheEnabled() {
    return this.chunkApiCacheMaxEntries > 0 && this.chunkApiCacheTtlMs > 0;
  }

  pruneChunkApiResponseCache(nowTs = Date.now()) {
    if (!this.chunkApiResponseCache || typeof this.chunkApiResponseCache.entries !== "function") return;
    if (!this.isChunkApiCacheEnabled()) {
      this.chunkApiResponseCache.clear();
      return;
    }
    for (const [key, entry] of this.chunkApiResponseCache.entries()) {
      if (!entry || !entry.expiresAt || entry.expiresAt <= nowTs) {
        this.chunkApiResponseCache.delete(key);
      }
    }
    while (this.chunkApiResponseCache.size > this.chunkApiCacheMaxEntries) {
      const oldestKey = this.chunkApiResponseCache.keys().next().value;
      if (typeof oldestKey === "undefined") break;
      this.chunkApiResponseCache.delete(oldestKey);
    }
  }
}

function buildSuggestionFromOp({
  op,
  paragraphIndex,
  anchorsEntry,
  originalText,
  correctedText,
  lowAnchorReliability = false,
}) {
  if (!op) return null;
  if (op.kind === "delete") {
    const metadata = buildDeleteSuggestionMetadata(anchorsEntry, op.originalPos ?? op.pos);
    if (!metadata) return null;
    const confidence = computeSuggestionConfidence({
      kind: "delete",
      op,
      metadata,
    });
    const deterministicConfidence = computeDeterministicSuggestionConfidence({
      kind: "delete",
      op,
      metadata,
      confidence,
      lowAnchorReliability,
      anchorsEntry,
    });
    return createSuggestion({
      id: `delete-${paragraphIndex}-${op.pos}`,
      paragraphIndex,
      kind: "delete",
      charHint: {
        start: metadata.charStart,
        end: metadata.charEnd,
        documentStart: metadata.documentCharStart,
        documentEnd: metadata.documentCharEnd,
      },
      tokenHint: buildTokenHint(metadata),
      snippets: buildSnippetsFromMetadata(metadata, originalText, correctedText),
      meta: {
        op,
        confidence,
        deterministicConfidence,
        lowAnchorReliability: Boolean(lowAnchorReliability),
        lemmaAnchorAuthoritative: Boolean(anchorsEntry?.lemmaOffsetsAuthoritative),
        highlightText: metadata.highlightText,
        anchor: metadata,
        originalText,
        correctedText,
      },
    });
  }
  const metadata = buildInsertSuggestionMetadata(anchorsEntry, {
    originalCharIndex: op.originalPos ?? op.pos,
    targetCharIndex: op.correctedPos ?? op.pos,
  });
  if (!metadata) return null;
  const confidence = computeSuggestionConfidence({
    kind: "insert",
    op,
    metadata,
  });
  const deterministicConfidence = computeDeterministicSuggestionConfidence({
    kind: "insert",
    op,
    metadata,
    confidence,
    lowAnchorReliability,
    anchorsEntry,
  });
  return createSuggestion({
    id: `insert-${paragraphIndex}-${op.pos}`,
    paragraphIndex,
    kind: "insert",
    charHint: {
      start: metadata.targetCharStart,
      end: metadata.targetCharEnd,
      documentStart: metadata.targetDocumentCharStart,
      documentEnd: metadata.targetDocumentCharEnd,
    },
    tokenHint: buildTokenHint(metadata),
    snippets: buildSnippetsFromMetadata(metadata, originalText, correctedText),
    meta: {
      op,
      confidence,
      deterministicConfidence,
      lowAnchorReliability: Boolean(lowAnchorReliability),
      lemmaAnchorAuthoritative: Boolean(anchorsEntry?.lemmaOffsetsAuthoritative),
      highlightText: metadata.highlightText,
      anchor: metadata,
      originalText,
      correctedText,
    },
  });
}

function buildSuggestionDedupKey(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return null;
  const paragraphIndex = Number.isFinite(suggestion.paragraphIndex)
    ? suggestion.paragraphIndex
    : "p";
  const kind = typeof suggestion.kind === "string" ? suggestion.kind : "k";
  const op = suggestion?.meta?.op || {};
  const opOriginalPos = Number.isFinite(op.originalPos)
    ? op.originalPos
    : Number.isFinite(op.pos)
      ? op.pos
      : null;
  const opCorrectedPos = Number.isFinite(op.correctedPos)
    ? op.correctedPos
    : Number.isFinite(op.pos)
      ? op.pos
      : null;
  if (Number.isFinite(opOriginalPos) || Number.isFinite(opCorrectedPos)) {
    return [
      paragraphIndex,
      kind,
      "op",
      Number.isFinite(opOriginalPos) ? opOriginalPos : "na",
      Number.isFinite(opCorrectedPos) ? opCorrectedPos : "na",
    ].join("|");
  }

  const visualBounds = resolveSuggestionVisualBounds(suggestion);
  if (Number.isFinite(visualBounds.start) && visualBounds.start >= 0) {
    return [paragraphIndex, visualBounds.start, visualBounds.end].join("|");
  }

  const anchor = suggestion?.meta?.anchor || {};
  const tokenId =
    anchor?.sourceTokenAt?.tokenId ??
    anchor?.targetTokenAt?.tokenId ??
    anchor?.sourceTokenBefore?.tokenId ??
    anchor?.targetTokenBefore?.tokenId ??
    anchor?.highlightAnchorTarget?.tokenId ??
    "na";

  return [
    paragraphIndex,
    kind,
    "na",
    `t${tokenId}`,
    Number.isFinite(opOriginalPos) ? opOriginalPos : "na",
    Number.isFinite(opCorrectedPos) ? opCorrectedPos : "na",
  ].join("|");
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

function computeSuggestionConfidence({ kind, op, metadata }) {
  let score = 0.5;
  const reasons = [];

  if (op?.fromCorrections) {
    score += 0.12;
    reasons.push("from_corrections");
  } else {
    score -= 0.08;
    reasons.push("not_from_corrections");
  }

  if (op?.viaDiffFallback) {
    score -= 0.14;
    reasons.push("diff_fallback");
  } else {
    score += 0.08;
    reasons.push("direct_corrections_alignment");
  }

  const hasPrimaryCharHint =
    kind === "insert"
      ? Number.isFinite(metadata?.targetCharStart) && metadata.targetCharStart >= 0
      : Number.isFinite(metadata?.charStart) && metadata.charStart >= 0;
  if (hasPrimaryCharHint) {
    score += 0.14;
    reasons.push("char_hint_present");
  } else {
    score -= 0.2;
    reasons.push("char_hint_missing");
  }

  const hasTokenBefore = Boolean(metadata?.sourceTokenBefore || metadata?.targetTokenBefore);
  const hasTokenAfter = Boolean(metadata?.sourceTokenAfter || metadata?.targetTokenAfter);
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

  if (metadata?.highlightAnchorTarget || metadata?.sourceTokenAt || metadata?.targetTokenAt) {
    score += 0.08;
    reasons.push("highlight_anchor_present");
  } else {
    score -= 0.04;
    reasons.push("highlight_anchor_missing");
  }

  const nearestGap = [
    metadata?.sourceTokenBefore?.repeatKeyNearestGap,
    metadata?.sourceTokenAfter?.repeatKeyNearestGap,
    metadata?.targetTokenBefore?.repeatKeyNearestGap,
    metadata?.targetTokenAfter?.repeatKeyNearestGap,
    metadata?.highlightAnchorTarget?.repeatKeyNearestGap,
  ].filter((value) => Number.isFinite(value) && value >= 0);
  const minNearestGap = nearestGap.length ? Math.min(...nearestGap) : null;
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

  const clamped = Math.max(0, Math.min(1, score));
  const level = clamped >= 0.75 ? "high" : clamped >= 0.55 ? "medium" : "low";
  return {
    score: Number(clamped.toFixed(3)),
    level,
    reasons,
  };
}

function computeDeterministicSuggestionConfidence({
  kind,
  op,
  metadata,
  confidence,
  lowAnchorReliability = false,
  anchorsEntry,
}) {
  let score = 0;
  const reasons = [];

  if (op?.fromApiCommaOps) {
    score += 3;
    reasons.push("api_comma_ops");
  } else if (op?.fromCorrections) {
    score += 1;
    reasons.push("corrections_derived");
  } else {
    score -= 2;
    reasons.push("non_api_fallback");
  }

  if (op?.viaDiffFallback) {
    score -= 3;
    reasons.push("diff_fallback");
  }

  if (lowAnchorReliability) {
    score -= 2;
    reasons.push("low_anchor_reliability");
  }

  const hasTokenBefore = Boolean(metadata?.sourceTokenBefore || metadata?.targetTokenBefore);
  const hasTokenAfter = Boolean(metadata?.sourceTokenAfter || metadata?.targetTokenAfter);
  if (hasTokenBefore && hasTokenAfter) {
    score += 2;
    reasons.push("token_context_both_sides");
  } else if (hasTokenBefore || hasTokenAfter) {
    score += 1;
    reasons.push("token_context_one_side");
  } else {
    score -= 2;
    reasons.push("token_context_missing");
  }

  const hasPrimaryCharHint =
    kind === "insert"
      ? Number.isFinite(metadata?.targetCharStart) && metadata.targetCharStart >= 0
      : Number.isFinite(metadata?.charStart) && metadata.charStart >= 0;
  if (hasPrimaryCharHint) {
    score += 1;
    reasons.push("char_hint_present");
  } else {
    score -= 2;
    reasons.push("char_hint_missing");
  }

  if (anchorsEntry?.lemmaOffsetsAuthoritative) {
    score += 1;
    reasons.push("lemma_offsets_authoritative");
  }

  if (confidence?.level === "high") {
    score += 1;
    reasons.push("base_confidence_high");
  } else if (confidence?.level === "low") {
    score -= 1;
    reasons.push("base_confidence_low");
  }

  const level = score >= 2 ? "high" : "low";
  return {
    level,
    score,
    reasons,
    deterministicModeActive: isDeterministicMappingV2Enabled(),
  };
}

function buildSnippetsFromMetadata(metadata, originalText, correctedText) {
  const snippets = {};
  if (metadata.highlightText) {
    snippets.focusWord = metadata.highlightText;
  }
  if (originalText) {
    snippets.leftSnippet = originalText
      .slice(Math.max(0, metadata.charStart - 24), metadata.charStart)
      .trim();
    snippets.rightSnippet = originalText.slice(metadata.charEnd, metadata.charEnd + 24).trim();
  } else if (correctedText) {
    const start = metadata.targetCharStart ?? metadata.charStart ?? 0;
    const end = metadata.targetCharEnd ?? metadata.charEnd ?? start;
    snippets.leftSnippet = correctedText.slice(Math.max(0, start - 24), start).trim();
    snippets.rightSnippet = correctedText.slice(end, end + 24).trim();
  }
  return snippets;
}

function buildTokenHint(meta) {
  if (!meta) return null;
  return {
    leftToken: meta.sourceTokenBefore?.tokenText || meta.targetTokenBefore?.tokenText || null,
    rightToken: meta.sourceTokenAfter?.tokenText || meta.targetTokenAfter?.tokenText || null,
    tokenId: meta.sourceTokenAt?.tokenId || meta.targetTokenAt?.tokenId || null,
  };
}

function splitFailedChunkForRetry(chunk, depth = 0) {
  if (!chunk || typeof chunk.text !== "string") return null;
  if (depth >= API_RECHUNK_MAX_DEPTH) return null;
  const chunkLen = chunk.length || chunk.text.length || 0;
  if (chunkLen < API_RECHUNK_MIN_CHARS) return null;

  // Retry by sentence units only so failures skip at sentence granularity.
  // We intentionally avoid word/length slicing because it loses context.
  let splitChunks = splitParagraphIntoChunks(chunk.text, MAX_PARAGRAPH_CHARS, {
    preferWholeParagraph: false,
    conservativePack: false,
  });
  if (!Array.isArray(splitChunks) || splitChunks.length <= 1) {
    splitChunks = splitChunkByLength(chunk.text, API_RECHUNK_MIN_CHARS);
  }
  if (!Array.isArray(splitChunks) || splitChunks.length <= 1) return null;

  const parentNormalized = chunk.normalizedText || chunk.text;
  return splitChunks.map((subChunk, index) => {
    const subTextWithTrailing =
      (subChunk.text || "") + (typeof subChunk.trailing === "string" ? subChunk.trailing : "");
    const relativeStart = subChunk.start || 0;
    const absoluteStart = chunk.start + relativeStart;
    const normalizedText = parentNormalized.substr(relativeStart, subTextWithTrailing.length);
    return {
      index: `${chunk.index}.${index + 1}`,
      start: absoluteStart,
      end: absoluteStart + subTextWithTrailing.length,
      length: subTextWithTrailing.length,
      text: subTextWithTrailing,
      trailing: "",
      tooLong: subTextWithTrailing.length > MAX_PARAGRAPH_CHARS,
      normalizedText,
    };
  });
}

function splitChunkByLength(text = "", maxLen = API_RECHUNK_MIN_CHARS) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  const hardMax = Math.max(120, Number(maxLen) || API_RECHUNK_MIN_CHARS);
  const chunks = [];
  let cursor = 0;

  while (cursor < safeText.length) {
    let end = Math.min(cursor + hardMax, safeText.length);
    if (end < safeText.length) {
      const windowStart = Math.max(cursor + 80, cursor);
      const windowText = safeText.slice(windowStart, end);
      const breakMatch = /([.!?;:]\s+|,\s+|\s+)(?!.*([.!?;:]\s+|,\s+|\s+))/u.exec(windowText);
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
      end,
      length: end - cursor,
      text: safeText.slice(cursor, end),
      trailing: "",
      tooLong: end - cursor > MAX_PARAGRAPH_CHARS,
    });
    cursor = end;
  }
  return chunks;
}

function hashTextForCooldownKey(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function buildChunkFailureKey(paragraphIndex, text = "") {
  const safeParagraph = Number.isFinite(paragraphIndex) ? paragraphIndex : -1;
  const safeText = typeof text === "string" ? text : "";
  return `${safeParagraph}:${safeText.length}:${hashTextForCooldownKey(safeText)}`;
}

function buildChunkApiCacheKey(text = "") {
  const safeText = typeof text === "string" ? text : "";
  return `${safeText.length}:${hashTextForCooldownKey(safeText)}`;
}

function pruneExpiredChunkFailureCooldowns(cooldownMap) {
  if (!cooldownMap || typeof cooldownMap.forEach !== "function") return;
  const now = Date.now();
  for (const [key, until] of cooldownMap.entries()) {
    if (!Number.isFinite(until) || until <= now) {
      cooldownMap.delete(key);
    }
  }
}

function splitParagraphIntoChunks(
  text = "",
  maxLen = MAX_PARAGRAPH_CHARS,
  { preferWholeParagraph = true, conservativePack = false } = {}
) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  // For normal-sized paragraphs, keep full context in a single API call.
  // This avoids sentence splitter artifacts around abbreviations like "K. M.".
  if (preferWholeParagraph && safeText.length <= maxLen) {
    return [
      {
        index: 0,
        start: 0,
        end: safeText.length,
        length: safeText.length,
        text: safeText,
        trailing: "",
        tooLong: false,
      },
    ];
  }
  const placeholder = "\uE000";
  const protectDots = (input, regex) =>
    input.replace(regex, (match) => match.replace(/\./g, placeholder));
  // Protect dots in common abbreviation/date forms so sentence splitting
  // doesn't break chunks like "K. M." or "25. 3. 2008".
  let protectedText = safeText;
  protectedText = protectDots(protectedText, /\b(?:[\p{L}]\.\s*){2,}/gu);
  protectedText = protectDots(protectedText, /\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g);
  protectedText = protectDots(
    protectedText,
    /\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|gos|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|sep|okt|nov|dec)\./giu
  );
  protectedText = protectDots(
    protectedText,
    /\b(?:d\.\s*o\.\s*o\.|d\.\s*d\.|s\.\s*p\.|d\.\s*n\.\s*o\.|k\.\s*d\.)/giu
  );
  const sentences = [];
  let start = 0;
  const sentenceLeadClosers = /[\])"'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
  const lowerLetter = /\p{Ll}/u;
  const upperLetter = /\p{Lu}/u;
  const letterOrDigit = /[\p{L}\d]/u;

  const pushSentence = (contentEnd, gapEnd = contentEnd) => {
    if (typeof contentEnd !== "number" || contentEnd <= start) {
      start = Math.max(start, gapEnd ?? contentEnd ?? start);
      return;
    }
    sentences.push({ start, end: contentEnd, gapEnd: gapEnd ?? contentEnd });
    start = gapEnd ?? contentEnd;
  };

  const readPrevToken = (dotIndex) => {
    let end = dotIndex;
    while (end > 0 && /\s/.test(protectedText[end - 1])) end--;
    let tokenStart = end;
    while (tokenStart > 0 && letterOrDigit.test(protectedText[tokenStart - 1])) tokenStart--;
    return protectedText.slice(tokenStart, end);
  };

  const nextNonSpaceIndex = (fromIndex) => {
    let idx = fromIndex;
    while (idx < protectedText.length && /\s/.test(protectedText[idx])) idx++;
    return idx;
  };

  const shouldSplitOnDot = (dotIndex) => {
    const prevToken = readPrevToken(dotIndex);
    const isShortLowerAbbrev =
      prevToken.length > 0 &&
      prevToken.length <= 3 &&
      !upperLetter.test(prevToken) &&
      lowerLetter.test(prevToken);
    if (isShortLowerAbbrev) return false;

    let idx = nextNonSpaceIndex(dotIndex + 1);
    while (idx < protectedText.length && sentenceLeadClosers.test(protectedText[idx])) idx++;
    if (idx >= protectedText.length) return true;
    return upperLetter.test(protectedText[idx]);
  };

  for (let i = 0; i < protectedText.length; i++) {
    const ch = protectedText[i];
    if (ch === "\n") {
      pushSentence(i + 1, i + 1);
      continue;
    }
    if (/[.!?]/.test(ch)) {
      if (ch === "." && !shouldSplitOnDot(i)) {
        continue;
      }
      let contentEnd = i + 1;
      while (
        contentEnd < protectedText.length &&
        /[\])"'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]+/u.test(protectedText[contentEnd])
      ) {
        contentEnd++;
      }
      let gapEnd = contentEnd;
      while (gapEnd < protectedText.length && /\s/.test(protectedText[gapEnd])) {
        gapEnd++;
      }
      pushSentence(contentEnd, gapEnd);
      i = gapEnd - 1;
    }
  }
  if (start < protectedText.length) {
    sentences.push({
      start,
      end: protectedText.length,
      gapEnd: protectedText.length,
    });
  }

  const mergedSentences = [];
  for (const sentence of sentences) {
    const sentenceLen = Math.max(0, (sentence.end ?? 0) - (sentence.start ?? 0));
    const previous = mergedSentences[mergedSentences.length - 1];
    // Merge tiny fragments like "3." / "M." into previous chunk to avoid extra API calls.
    if (
      previous &&
      sentenceLen > 0 &&
      sentenceLen < MIN_CHUNK_MERGE_CHARS &&
      sentence.end > previous.end &&
      sentence.end - previous.start <= maxLen
    ) {
      previous.end = sentence.end;
      previous.gapEnd = sentence.gapEnd ?? sentence.end;
      continue;
    }
    mergedSentences.push({ ...sentence });
  }

  const sentenceUnits = conservativePack ? packLemmaSentenceUnits(mergedSentences, maxLen) : mergedSentences;

  return sentenceUnits.map((sentence, index) => {
    const gapEnd = sentence.gapEnd ?? sentence.end;
    const length = sentence.end - sentence.start;
    return {
      index,
      start: sentence.start,
      end: sentence.end,
      length,
      text: safeText
        .slice(sentence.start, sentence.end)
        .replace(new RegExp(placeholder, "g"), "."),
      trailing: safeText.slice(sentence.end, gapEnd),
      tooLong: length > maxLen,
    };
  });
}

async function splitParagraphIntoChunksWithLemmas(text = "", maxLen = MAX_PARAGRAPH_CHARS, anchorProvider) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText) return null;
  if (!anchorProvider || typeof anchorProvider.fetchLemmaTokens !== "function") {
    return null;
  }
  const mode = resolveLemmaSplitMode();
  if (mode === "off") return null;
  if (mode !== "force" && !shouldUseLemmaSplitHeuristic(safeText, maxLen)) {
    if (isDeepDebugEnabled()) {
      console.log("[Vejice Split]", "lemma split skipped by heuristic", {
        mode,
        length: safeText.length,
      });
    }
    return null;
  }
  try {
    const lemmaTokens = await anchorProvider.fetchLemmaTokens(safeText);
    let splitTokens = lemmaTokens;
    let reconstructedConfidence = 1;
    let usedReconstructedOffsets = false;
    const nativeQuality = evaluateLemmaOffsetsQuality(safeText, lemmaTokens);
    const useNativeOffsetsAuthoritatively =
      nativeQuality.coverage >= LEMMA_SPLIT_CONFIDENCE_THRESHOLD;
    if (!useNativeOffsetsAuthoritatively) {
      const reconstructed = reconstructLemmaOffsets(safeText, lemmaTokens);
      reconstructedConfidence = reconstructed.confidence;
      if (mode === "safe" && reconstructed.confidence < LEMMA_SPLIT_CONFIDENCE_THRESHOLD) {
        if (isDeepDebugEnabled()) {
          console.log(
            "[Vejice Split]",
            "lemma split fallback -> low reconstruction confidence",
            reconstructed
          );
        }
        return null;
      }
      if (reconstructed.tokens.length) {
        splitTokens = reconstructed.tokens;
        usedReconstructedOffsets = true;
      }
      if (isDeepDebugEnabled()) {
        console.log("[Vejice Split]", "reconstructed lemma offsets", {
          mode,
          nativeCoverage: nativeQuality.coverage,
          reconstructedConfidence: reconstructed.confidence,
          tokenCount: splitTokens.length,
        });
      }
    } else if (isDeepDebugEnabled()) {
      console.log("[Vejice Split]", "native lemma offsets authoritative", nativeQuality);
    }
    const chunks = buildChunksFromLemmaTokens(safeText, splitTokens, maxLen);
    if (!Array.isArray(chunks) || !chunks.length) return null;
    const lowAnchorReliability =
      !useNativeOffsetsAuthoritatively || usedReconstructedOffsets;
    return chunks.map((chunk) => ({
      ...chunk,
      lowAnchorReliability,
      lemmaNativeCoverage: nativeQuality.coverage,
      lemmaReconstructedConfidence: reconstructedConfidence,
      lemmaNativeAuthoritative: useNativeOffsetsAuthoritatively,
    }));
  } catch (_err) {
    return null;
  }
}

function resolveLemmaSplitMode() {
  const windowMode =
    typeof window !== "undefined" && typeof window.__VEJICE_LEMMA_SPLIT_MODE === "string"
      ? window.__VEJICE_LEMMA_SPLIT_MODE.trim().toLowerCase()
      : "";
  if (windowMode === "off" || windowMode === "safe" || windowMode === "force") {
    return windowMode;
  }
  const envMode =
    typeof process !== "undefined" && typeof process.env?.VEJICE_LEMMA_SPLIT_MODE === "string"
      ? process.env.VEJICE_LEMMA_SPLIT_MODE.trim().toLowerCase()
      : "";
  if (envMode === "off" || envMode === "safe" || envMode === "force") {
    return envMode;
  }
  return "safe";
}

function resolveChunkAnalyzeConcurrency() {
  let override = null;
  if (typeof window !== "undefined") {
    override = window.__VEJICE_CHUNK_ANALYZE_CONCURRENCY;
  }
  if (override == null && typeof process !== "undefined") {
    override = process.env?.VEJICE_CHUNK_ANALYZE_CONCURRENCY;
  }
  const parsed = Number(override);
  const defaultValue = isLocalSpeedProfileEnabled()
    ? LOCAL_CHUNK_ANALYZE_CONCURRENCY_DEFAULT
    : CHUNK_ANALYZE_CONCURRENCY_DEFAULT;
  const value = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : defaultValue;
  return Math.max(1, Math.min(value, CHUNK_ANALYZE_CONCURRENCY_MAX));
}

function parseBooleanLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function isLocalhostRuntime() {
  if (typeof window === "undefined") return false;
  const host = typeof window.location?.hostname === "string"
    ? window.location.hostname.trim().toLowerCase()
    : "";
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isLocalSpeedProfileEnabled() {
  if (typeof window !== "undefined") {
    const override = parseBooleanLike(window.__VEJICE_LOCAL_SPEED_PROFILE__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envOverride = parseBooleanLike(process.env?.VEJICE_LOCAL_SPEED_PROFILE);
    if (typeof envOverride === "boolean") return envOverride;
  }
  return isLocalhostRuntime();
}

function resolveChunkApiCacheMaxEntries() {
  let override = null;
  if (typeof window !== "undefined") {
    override = window.__VEJICE_CHUNK_API_CACHE_MAX_ENTRIES;
  }
  if (override == null && typeof process !== "undefined") {
    override = process.env?.VEJICE_CHUNK_API_CACHE_MAX_ENTRIES;
  }
  const parsed = Number(override);
  const value =
    Number.isFinite(parsed) && parsed >= 0
      ? Math.floor(parsed)
      : CHUNK_API_CACHE_MAX_ENTRIES_DEFAULT;
  return Math.max(0, Math.min(value, 5000));
}

function resolveChunkApiCacheTtlMs() {
  let override = null;
  if (typeof window !== "undefined") {
    override = window.__VEJICE_CHUNK_API_CACHE_TTL_MS;
  }
  if (override == null && typeof process !== "undefined") {
    override = process.env?.VEJICE_CHUNK_API_CACHE_TTL_MS;
  }
  const parsed = Number(override);
  const value =
    Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : CHUNK_API_CACHE_TTL_MS_DEFAULT;
  return Math.max(0, Math.min(value, 60 * 60 * 1000));
}

function cloneChunkApiDetail(detail) {
  if (!detail || typeof detail !== "object") return detail;
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(detail);
    }
  } catch (_err) {
    // Fall back to JSON clone.
  }
  try {
    return JSON.parse(JSON.stringify(detail));
  } catch (_err) {
    // As a last resort, shallow-clone top-level fields.
  }
  return {
    ...detail,
    raw: detail.raw && typeof detail.raw === "object" ? { ...detail.raw } : detail.raw,
    sourceTokens: Array.isArray(detail.sourceTokens) ? detail.sourceTokens.map((t) => ({ ...t })) : [],
    targetTokens: Array.isArray(detail.targetTokens) ? detail.targetTokens.map((t) => ({ ...t })) : [],
    corrections: Array.isArray(detail.corrections)
      ? detail.corrections.map((c) => ({ ...c }))
      : detail.corrections,
    commaOps: Array.isArray(detail.commaOps) ? detail.commaOps.map((op) => ({ ...op })) : detail.commaOps,
  };
}

function shouldUseLemmaSplitHeuristic(text = "", maxLen = MAX_PARAGRAPH_CHARS) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText) return false;
  if (safeText.length >= Math.min(maxLen, LEMMA_HEURISTIC_MIN_LEN)) return true;

  const initialAbbrevHits = countMatches(/\b(?:[\p{L}]\.\s*){2,}/gu, safeText);
  if (initialAbbrevHits >= 1) return true;

  const dateHits = countMatches(/\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\b/g, safeText);
  if (dateHits >= 1) return true;

  const commonAbbrevHits = countMatches(
    /\b(?:npr|itd|itn|ipd|idr|oz|tj|dr|mr|ga|gos|prim|prof|doc|mag|jan|feb|mar|apr|jun|jul|avg|sep|okt|nov|dec)\./giu,
    safeText
  );
  if (commonAbbrevHits >= 2) return true;

  return false;
}

function countMatches(regex, text) {
  if (!(regex instanceof RegExp) || typeof text !== "string" || !text) return 0;
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const pattern = new RegExp(regex.source, flags);
  let count = 0;
  while (pattern.exec(text)) {
    count++;
    if (count > 1000) break;
  }
  return count;
}

function evaluateLemmaOffsetsQuality(text, tokens) {
  const safeText = typeof text === "string" ? text : "";
  const eligible = Array.isArray(tokens)
    ? tokens.filter((token) => typeof token?.text === "string" && token.text.trim()).length
    : 0;
  const valid = Array.isArray(tokens)
    ? tokens.filter(
        (token) =>
          typeof token?.start === "number" &&
          typeof token?.end === "number" &&
          token.start >= 0 &&
          token.end > token.start &&
          token.end <= safeText.length
      ).length
    : 0;
  return {
    eligible,
    valid,
    coverage: eligible > 0 ? valid / eligible : 0,
  };
}

function reconstructLemmaOffsets(text = "", tokens = []) {
  const safeText = typeof text === "string" ? text : "";
  if (!Array.isArray(tokens) || !tokens.length || !safeText) {
    return { tokens: [], confidence: 0, mapped: 0, eligible: 0 };
  }

  let cursor = 0;
  let mapped = 0;
  let eligible = 0;
  const reconstructed = tokens.map((token) => {
    if (!token || typeof token !== "object") return token;
    const tokenText = typeof token.text === "string" ? token.text : "";
    if (!tokenText.trim()) return token;
    eligible++;

    const hasNativeOffsets =
      typeof token.start === "number" &&
      typeof token.end === "number" &&
      token.start >= 0 &&
      token.end > token.start &&
      token.end <= safeText.length;
    if (hasNativeOffsets && token.start >= cursor) {
      cursor = token.end;
      mapped++;
      return token;
    }

    const exactIndex = safeText.indexOf(tokenText, cursor);
    if (exactIndex >= 0) {
      mapped++;
      cursor = exactIndex + tokenText.length;
      return {
        ...token,
        start: exactIndex,
        end: exactIndex + tokenText.length,
      };
    }

    const normalized = tokenText.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "");
    if (!normalized) return token;
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^\\p{L}\\d])(${escaped})(?=$|[^\\p{L}\\d])`, "giu");
    const slice = safeText.slice(cursor);
    const match = regex.exec(slice);
    if (!match) return token;
    const relIndex = match.index + (match[1] ? match[1].length : 0);
    const start = cursor + relIndex;
    const end = start + match[2].length;
    mapped++;
    cursor = end;
    return {
      ...token,
      start,
      end,
    };
  });

  const confidence = eligible > 0 ? mapped / eligible : 0;
  return { tokens: reconstructed, confidence, mapped, eligible };
}

function buildChunksFromLemmaTokens(text = "", lemmaTokens = [], maxLen = MAX_PARAGRAPH_CHARS) {
  if (!Array.isArray(lemmaTokens) || !lemmaTokens.length) return null;
  const tokens = lemmaTokens
    .filter(
      (token) =>
        token &&
        typeof token.start === "number" &&
        typeof token.end === "number" &&
        token.start >= 0 &&
        token.end > token.start &&
        token.end <= text.length
    )
    .sort((a, b) => a.start - b.start);
  if (!tokens.length) return null;

  const sentences = [];
  let sentenceStart = 0;
  const closerRegex = /[\])"'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u;
  const pushSentence = (contentEnd, gapEnd = contentEnd) => {
    if (typeof contentEnd !== "number" || contentEnd <= sentenceStart) {
      sentenceStart = Math.max(sentenceStart, gapEnd ?? contentEnd ?? sentenceStart);
      return;
    }
    sentences.push({ start: sentenceStart, end: contentEnd, gapEnd: gapEnd ?? contentEnd });
    sentenceStart = gapEnd ?? contentEnd;
  };

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const next = tokens[i + 1] || null;
    if (!isSentenceBoundaryToken(current, next)) continue;

    let contentEnd = current.end;
    while (contentEnd < text.length && closerRegex.test(text[contentEnd])) contentEnd++;
    let gapEnd = contentEnd;
    while (gapEnd < text.length && /\s/.test(text[gapEnd])) gapEnd++;
    pushSentence(contentEnd, gapEnd);
  }
  if (sentenceStart < text.length) {
    sentences.push({
      start: sentenceStart,
      end: text.length,
      gapEnd: text.length,
    });
  }

  const mergedSentences = [];
  for (const sentence of sentences) {
    const sentenceLen = Math.max(0, (sentence.end ?? 0) - (sentence.start ?? 0));
    const previous = mergedSentences[mergedSentences.length - 1];
    if (
      previous &&
      sentenceLen > 0 &&
      sentenceLen < MIN_CHUNK_MERGE_CHARS &&
      sentence.end > previous.end &&
      sentence.end - previous.start <= maxLen
    ) {
      previous.end = sentence.end;
      previous.gapEnd = sentence.gapEnd ?? sentence.end;
      continue;
    }
    mergedSentences.push({ ...sentence });
  }

  const expandedUnits = [];
  for (const unit of mergedSentences) {
    const parts = splitLargeLemmaUnit(text, unit, maxLen);
    if (parts && parts.length) {
      expandedUnits.push(...parts);
    } else {
      expandedUnits.push(unit);
    }
  }
  const packedUnits = packLemmaSentenceUnits(expandedUnits, maxLen);

  return packedUnits.map((sentence, index) => {
    const gapEnd = sentence.gapEnd ?? sentence.end;
    const length = sentence.end - sentence.start;
    return {
      index,
      start: sentence.start,
      end: sentence.end,
      length,
      text: text.slice(sentence.start, sentence.end),
      trailing: text.slice(sentence.end, gapEnd),
      tooLong: length > maxLen,
    };
  });
}

function splitLargeLemmaUnit(text, unit, maxLen) {
  if (!unit) return null;
  const hardCap = Math.max(LEMMA_CHUNK_TARGET_CHARS, Math.min(maxLen, LEMMA_CHUNK_SOFT_MAX_CHARS));
  const unitLength = Math.max(0, (unit.end ?? 0) - (unit.start ?? 0));
  if (unitLength <= hardCap) return [unit];

  const segments = [];
  let cursor = unit.start;
  const absoluteEnd = unit.end;
  while (absoluteEnd - cursor > hardCap) {
    const target = cursor + hardCap;
    const minSplit = Math.min(absoluteEnd - 1, cursor + LEMMA_MIN_SEGMENT_CHARS);
    const maxSplit = Math.min(absoluteEnd - 1, target + LEMMA_SPLIT_WINDOW_CHARS);
    let splitAt = -1;

    for (let i = target; i <= maxSplit; i++) {
      const ch = text[i];
      if (ch === "," || ch === ";" || ch === ":") {
        splitAt = i + 1;
        break;
      }
    }
    if (splitAt < 0) {
      for (let i = Math.max(minSplit, target - LEMMA_SPLIT_WINDOW_CHARS); i >= minSplit; i--) {
        const ch = text[i];
        if (ch === "," || ch === ";" || ch === ":") {
          splitAt = i + 1;
          break;
        }
      }
    }
    if (splitAt < 0) {
      for (let i = target; i <= maxSplit; i++) {
        if (/\s/.test(text[i] || "")) {
          splitAt = i + 1;
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

    let gapEnd = splitAt;
    while (gapEnd < absoluteEnd && /\s/.test(text[gapEnd] || "")) gapEnd++;
    segments.push({ start: cursor, end: splitAt, gapEnd });
    cursor = gapEnd;
    if (cursor >= absoluteEnd) break;
  }
  if (cursor < absoluteEnd) {
    segments.push({
      start: cursor,
      end: absoluteEnd,
      gapEnd: unit.gapEnd ?? absoluteEnd,
    });
  }
  return segments.filter((seg) => seg.end > seg.start);
}

function packLemmaSentenceUnits(units, maxLen) {
  if (!Array.isArray(units) || !units.length) return [];
  const hardCap = Math.max(LEMMA_CHUNK_TARGET_CHARS, Math.min(maxLen, LEMMA_CHUNK_SOFT_MAX_CHARS));
  const packed = [];
  let current = null;
  let unitCount = 0;

  const pushCurrent = () => {
    if (!current) return;
    packed.push(current);
    current = null;
    unitCount = 0;
  };

  for (const unit of units) {
    if (!current) {
      current = { ...unit };
      unitCount = 1;
      continue;
    }
    const candidateLen = (unit.end ?? 0) - (current.start ?? 0);
    const currentLen = (current.end ?? 0) - (current.start ?? 0);
    const unitLen = (unit.end ?? 0) - (unit.start ?? 0);
    const canMerge =
      unitCount < LEMMA_CHUNK_MAX_UNITS &&
      candidateLen <= maxLen &&
      candidateLen <= hardCap &&
      (currentLen < LEMMA_CHUNK_TARGET_CHARS || unitLen < 180);
    if (canMerge) {
      current.end = unit.end;
      current.gapEnd = unit.gapEnd ?? unit.end;
      unitCount++;
      continue;
    }
    pushCurrent();
    current = { ...unit };
    unitCount = 1;
  }
  pushCurrent();
  return packed;
}

function isSentenceBoundaryToken(currentToken, nextToken) {
  const raw = typeof currentToken?.text === "string" ? currentToken.text : "";
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const pos = typeof currentToken?.pos === "string" ? currentToken.pos.toUpperCase() : "";

  // Prefer explicit punctuation tokens when the lemmatizer provides POS tags.
  if (pos === "PUNC" || pos === "PUNCT") {
    if (trimmed === "?" || trimmed === "!") return true;
    if (trimmed === ".") {
      if (!nextToken || typeof nextToken.text !== "string") return true;
      const nextText = nextToken.text.trim();
      const first = nextText ? nextText[0] : "";
      if (!first) return true;
      return /\p{Lu}/u.test(first);
    }
  }
  const withoutClosers = trimmed.replace(
    /[\])"'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]+$/gu,
    ""
  );
  const endChar = withoutClosers.slice(-1);
  if (!/[.!?]/.test(endChar)) return false;
  if (endChar === "?" || endChar === "!") return true;

  const base = withoutClosers.replace(/[.!?]+$/g, "").trim();
  const shortLowerAbbrev =
    base.length > 0 &&
    base.length <= 3 &&
    /\p{Ll}/u.test(base) &&
    !/\p{Lu}/u.test(base);
  if (shortLowerAbbrev) return false;
  if (!nextToken || typeof nextToken.text !== "string") return true;
  const nextText = nextToken.text.trim();
  const first = nextText ? nextText[0] : "";
  if (!first) return true;
  return /\p{Lu}/u.test(first);
}

function rekeyTokensInternal(tokens, prefix) {
  if (!Array.isArray(tokens)) {
    return { tokens: [], map: new Map() };
  }
  const idMap = new Map();
  const rekeyed = tokens.map((token, idx) => {
    if (token && typeof token === "object") {
      const newToken = { ...token, token_id: `${prefix}${idx + 1}` };
      if (typeof token.token_id === "string") {
        idMap.set(token.token_id, newToken.token_id);
      }
      return newToken;
    }
    return {
      token_id: `${prefix}${idx + 1}`,
      token: typeof token === "string" ? token : "",
    };
  });
  return { tokens: rekeyed, map: idMap };
}

function rekeyTokens(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix).tokens;
}

function rekeyTokensWithMap(tokens, prefix) {
  return rekeyTokensInternal(tokens, prefix);
}

function remapCorrections(corrections, idMap) {
  if (!corrections || !idMap?.size) return corrections;
  const remapCorrectionEntry = (entry) => {
    if (Array.isArray(entry)) {
      return entry.map((nested) => remapCorrectionEntry(nested));
    }
    if (!entry || typeof entry !== "object") return entry;
    const mappedId = idMap.get(entry.source_id) ?? entry.source_id;
    if (mappedId === entry.source_id) return entry;
    return { ...entry, source_id: mappedId };
  };
  const remapGroup = (group) => {
    if (!group) return group;
    const remapped = { ...group };
    const mappedStart = idMap.get(group.source_start) ?? group.source_start;
    remapped.source_start = mappedStart;
    if (Array.isArray(group.corrections)) {
      remapped.corrections = group.corrections.map((corr) => remapCorrectionEntry(corr));
    }
    return remapped;
  };
  if (Array.isArray(corrections)) {
    return corrections.map(remapGroup);
  }
  if (typeof corrections === "object") {
    const remapped = {};
    for (const [key, group] of Object.entries(corrections)) {
      remapped[key] = remapGroup(group);
    }
    return remapped;
  }
  return corrections;
}

function correctionsHaveEntries(corrections) {
  if (!corrections) return false;
  const groups = Array.isArray(corrections)
    ? corrections
    : typeof corrections === "object"
      ? Object.values(corrections)
      : [];
  if (!groups.length) return false;
  return groups.some((group) => {
    if (!group || typeof group !== "object") return false;
    const entries = flattenCorrectionEntries(group.corrections);
    if (entries.length) return true;
    return Boolean(normalizeCorrectionOperationKind(group.operation ?? group.type ?? group.op));
  });
}

function flattenCorrectionEntries(rawEntries, out = []) {
  if (Array.isArray(rawEntries)) {
    for (const entry of rawEntries) {
      flattenCorrectionEntries(entry, out);
    }
    return out;
  }
  if (rawEntries && typeof rawEntries === "object") {
    out.push(rawEntries);
  }
  return out;
}

function normalizeCorrectionOperationKind(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "add" || normalized === "insert") return "insert";
  if (normalized === "remove" || normalized === "delete") return "delete";
  return null;
}

function looksLikeCommaCorrectionGroup(group, anchorsEntry) {
  if (!group || typeof group !== "object") return false;
  const sourceTokenId = group.source_start ?? group.sourceStart ?? group.source_id ?? group.sourceId;
  const targetTokenId =
    group.target_start ??
    group.targetStart ??
    group.target_pos ??
    group.targetPos ??
    group.target_id ??
    group.targetId;
  const sourceTokenText =
    sourceTokenId && anchorsEntry?.sourceAnchors?.byId?.[sourceTokenId]
      ? anchorsEntry.sourceAnchors.byId[sourceTokenId].tokenText
      : "";
  const targetTokenText =
    targetTokenId && anchorsEntry?.targetAnchors?.byId?.[targetTokenId]
      ? anchorsEntry.targetAnchors.byId[targetTokenId].tokenText
      : "";
  if (
    (typeof sourceTokenText === "string" && sourceTokenText.includes(",")) ||
    (typeof targetTokenText === "string" && targetTokenText.includes(","))
  ) {
    return true;
  }
  const label = typeof group.label === "string" ? group.label.toLowerCase() : "";
  return /comma|vejic/.test(label);
}

function resolveCorrectionSourceTokenId(entry, group, anchorsEntry) {
  const entryTokenId = entry?.source_id ?? entry?.sourceId ?? entry?.token_id ?? entry?.tokenId;
  if (entryTokenId && anchorsEntry?.sourceAnchors?.byId?.[entryTokenId]) return entryTokenId;
  return (
    group?.source_start ??
    group?.sourceStart ??
    group?.source_id ??
    group?.sourceId ??
    entryTokenId ??
    null
  );
}

function pickCorrectionEntryText(entry, keys = []) {
  if (!entry || typeof entry !== "object") return "";
  for (const key of keys) {
    const value = entry[key];
    if (typeof value === "string" && value.length) return value;
  }
  return "";
}

function collapseDuplicateDiffOps(ops) {
  if (!Array.isArray(ops) || ops.length < 2) return ops;
  const deletePositions = ops
    .filter((op) => op?.kind === "delete")
    .map((op) => (typeof op.originalPos === "number" ? op.originalPos : op.pos))
    .filter((pos) => typeof pos === "number");
  if (!deletePositions.length) return ops;
  const shouldDropInsert = (pos) =>
    deletePositions.some((delPos) => typeof delPos === "number" && Math.abs(delPos - pos) <= 0);
  return ops.filter((op) => {
    if (op?.kind !== "insert") return true;
    const pos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    if (typeof pos !== "number") return true;
    return !shouldDropInsert(pos);
  });
}

function isOpConsistentWithTexts(op, originalText, correctedText) {
  if (!op || typeof op !== "object") return false;
  const boundaryTolerance = op?.fromCorrections ? 3 : 0;
  if (op.kind === "delete") {
    const originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    const correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid delete must have comma in original and no comma in corrected at this boundary.
    return (
      hasCommaAtOrNearBoundary(originalText, originalPos, boundaryTolerance) &&
      !hasCommaAtOrNearBoundary(correctedText, correctedPos, boundaryTolerance)
    );
  }
  if (op.kind === "insert") {
    const originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    const correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    // Valid insert must have comma in corrected and no comma in original at this boundary.
    return (
      !hasCommaAtOrNearBoundary(originalText, originalPos, boundaryTolerance) &&
      hasCommaAtOrNearBoundary(correctedText, correctedPos, boundaryTolerance)
    );
  }
  return true;
}

function hasCommaAtOrNearBoundary(text, pos, tolerance = 0) {
  const safeTolerance = Math.max(0, Number.isFinite(tolerance) ? Math.floor(tolerance) : 0);
  for (let delta = -safeTolerance; delta <= safeTolerance; delta++) {
    if (hasCommaAtBoundary(text, pos + delta)) {
      return true;
    }
  }
  return false;
}

function hasCommaAtBoundary(text, pos) {
  if (typeof text !== "string" || !text.length) return false;
  const safePos = Number.isFinite(pos) ? Math.max(0, Math.min(Math.floor(pos), text.length)) : 0;
  const direct = [safePos - 1, safePos, safePos + 1];
  for (const idx of direct) {
    if (idx >= 0 && idx < text.length && text[idx] === ",") {
      return true;
    }
  }
  const isBoundary = (ch) =>
    /[\s"'`\u00AB\u00BB\u2039\u203A\u2018\u2019\u201A\u201C\u201D\u201E()\[\]]/u.test(ch || "");
  let left = safePos - 1;
  while (left >= 0 && isBoundary(text[left])) left--;
  if (left >= 0 && text[left] === ",") return true;
  let right = safePos;
  while (right < text.length && isBoundary(text[right])) right++;
  if (right < text.length && text[right] === ",") return true;
  return false;
}

function filterCommaOps(original, corrected, ops) {
  return ops.filter((op) => {
    if (isNumericComma(original, corrected, op.kind, op.pos)) return false;
    if (op.kind === "insert") {
      const next = charAtSafe(corrected, op.pos + 1);
      const noSpaceAfter = next && !/\s/.test(next);
      if (noSpaceAfter && !QUOTES.has(next)) {
        return true;
      }
    }
    return true;
  });
}

function toBoundedIndex(value, maxLen) {
  if (!Number.isFinite(value)) return undefined;
  const max = Math.max(0, Number.isFinite(maxLen) ? Math.floor(maxLen) : 0);
  const floored = Math.floor(value);
  return Math.max(0, Math.min(floored, max));
}

function normalizeApiCommaOps(rawOps, originalText = "", correctedText = "") {
  if (!Array.isArray(rawOps) || !rawOps.length) return [];
  const sourceLen = typeof originalText === "string" ? originalText.length : 0;
  const targetLen = typeof correctedText === "string" ? correctedText.length : 0;
  const normalized = [];
  const seen = new Set();

  for (const raw of rawOps) {
    if (!raw || typeof raw !== "object") continue;
    const kind = raw.kind === "delete" || raw.kind === "insert" ? raw.kind : null;
    if (!kind) continue;
    let originalPos = toBoundedIndex(
      Number.isFinite(raw.originalPos) ? raw.originalPos : kind === "delete" ? raw.pos : undefined,
      sourceLen
    );
    let correctedPos = toBoundedIndex(
      Number.isFinite(raw.correctedPos) ? raw.correctedPos : kind === "insert" ? raw.pos : undefined,
      targetLen
    );
    if (!Number.isFinite(originalPos) && !Number.isFinite(correctedPos)) continue;
    if (!Number.isFinite(originalPos)) originalPos = correctedPos;
    if (!Number.isFinite(correctedPos)) correctedPos = originalPos;
    const pos = kind === "delete" ? originalPos : correctedPos;
    const identity = `${kind}:${originalPos}:${correctedPos}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    normalized.push({
      ...raw,
      kind,
      pos,
      originalPos,
      correctedPos,
      fromApiCommaOps: true,
      fromCorrections: false,
      viaDiffFallback: false,
    });
  }

  return collapseDuplicateDiffOps(filterCommaOps(originalText, correctedText, normalized));
}

function findCommaIndexAtBoundary(text, pos) {
  if (typeof text !== "string" || !text.length) return -1;
  const safePos = Number.isFinite(pos) ? Math.max(0, Math.min(Math.floor(pos), text.length)) : 0;
  const direct = [safePos - 1, safePos, safePos + 1];
  for (const idx of direct) {
    if (idx >= 0 && idx < text.length && text[idx] === ",") {
      return idx;
    }
  }
  const isBoundary = (ch) =>
    /[\s\u200B-\u200D\uFEFF"'`\u00AB\u00BB\u2039\u203A\u2018\u2019\u201A\u201C\u201D\u201E()\[\]]/u.test(ch || "");
  let left = safePos - 1;
  while (left >= 0 && isBoundary(text[left])) left--;
  if (left >= 0 && text[left] === ",") return left;
  let right = safePos;
  while (right < text.length && isBoundary(text[right])) right++;
  if (right < text.length && text[right] === ",") return right;
  return -1;
}

function buildCommaOnlyCorrectedText(originalText = "", ops = []) {
  const base = typeof originalText === "string" ? originalText : "";
  if (!Array.isArray(ops) || !ops.length) return base;
  const normalized = ops
    .map((op) => {
      if (!op || typeof op !== "object") return null;
      const kind = op.kind === "insert" || op.kind === "delete" ? op.kind : null;
      if (!kind) return null;
      const originalPos = toBoundedIndex(
        Number.isFinite(op.originalPos) ? op.originalPos : op.pos,
        base.length
      );
      if (!Number.isFinite(originalPos)) return null;
      return { kind, originalPos };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.originalPos !== b.originalPos) return a.originalPos - b.originalPos;
      // Prefer deletions first so comma moves can be represented as delete+insert at same boundary.
      if (a.kind === b.kind) return 0;
      return a.kind === "delete" ? -1 : 1;
    });
  if (!normalized.length) return base;

  let working = base;
  let delta = 0;
  for (const op of normalized) {
    const targetPos = Math.max(0, Math.min(op.originalPos + delta, working.length));
    if (op.kind === "delete") {
      const commaIndex = findCommaIndexAtBoundary(working, targetPos);
      if (commaIndex < 0) continue;
      working = `${working.slice(0, commaIndex)}${working.slice(commaIndex + 1)}`;
      delta -= 1;
      continue;
    }
    if (!hasCommaAtBoundary(working, targetPos)) {
      working = `${working.slice(0, targetPos)},${working.slice(targetPos)}`;
      delta += 1;
    }
  }
  return working;
}

function diffCommasOnly(original, corrected) {
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < original.length || j < corrected.length) {
    const o = original[i] ?? "";
    const c = corrected[j] ?? "";
    if (o === c) {
      i++;
      j++;
      continue;
    }
    if (c === "," && o !== ",") {
      if (/\s/.test(o)) {
        const relocateIdx = findCommaAfterWhitespace(original, i);
        if (relocateIdx >= 0) {
          i = relocateIdx;
          continue;
        }
      }
      ops.push({ kind: "insert", pos: j, originalPos: i, correctedPos: j });
      j++;
      continue;
    }
    if (o === "," && c !== ",") {
      if (/\s/.test(c)) {
        const relocateIdx = findCommaAfterWhitespace(corrected, j);
        if (relocateIdx >= 0) {
          j = relocateIdx;
          continue;
        }
      }
      ops.push({ kind: "delete", pos: i, originalPos: i, correctedPos: j });
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
  let idx = startIndex;
  let sawWhitespace = false;
  while (idx < text.length && INVISIBLE_GAP_REGEX.test(text[idx] || "")) {
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
    intents: [],
  };
}

function stripTrailingCommaAndSpace(text) {
  const safe = typeof text === "string" ? text : "";
  const match = safe.match(TRAILING_COMMA_REGEX);
  const trailing = match ? match[0] : "";
  const base = trailing ? safe.slice(0, -trailing.length) : safe;
  return {
    base,
    trailing,
    hasComma: trailing.includes(","),
  };
}

function findTrailingCommaBoundaryIndex(text) {
  const safe = typeof text === "string" ? text : "";
  let end = safe.length;
  while (end > 0 && INVISIBLE_GAP_REGEX.test(safe[end - 1] || "")) end--;
  while (end > 0 && TRAILING_BOUNDARY_CLOSER_REGEX.test(safe[end - 1])) end--;
  while (end > 0 && INVISIBLE_GAP_REGEX.test(safe[end - 1] || "")) end--;
  const commaIndex = end - 1;
  return commaIndex >= 0 && safe[commaIndex] === "," ? commaIndex : -1;
}

function resolveCommaInsertBoundaryInSegment(text) {
  const safe = typeof text === "string" ? text : "";
  let end = safe.length;
  while (end > 0 && INVISIBLE_GAP_REGEX.test(safe[end - 1] || "")) end--;
  while (end > 0 && TRAILING_BOUNDARY_CLOSER_REGEX.test(safe[end - 1])) end--;
  while (end > 0 && INVISIBLE_GAP_REGEX.test(safe[end - 1] || "")) end--;
  return Math.max(0, end);
}

function analyzeCommaChangeFromCorrections(originalSegment = "", correctedSegment = "") {
  const orig = stripTrailingCommaAndSpace(originalSegment);
  const corr = stripTrailingCommaAndSpace(correctedSegment);
  const origHasBoundaryComma = findTrailingCommaBoundaryIndex(originalSegment) >= 0;
  const corrHasBoundaryComma = findTrailingCommaBoundaryIndex(correctedSegment) >= 0;
  if (orig.hasComma === corr.hasComma && origHasBoundaryComma === corrHasBoundaryComma) return null;
  return {
    removeComma: (orig.hasComma || origHasBoundaryComma) && !(corr.hasComma || corrHasBoundaryComma),
    addComma: !(orig.hasComma || origHasBoundaryComma) && (corr.hasComma || corrHasBoundaryComma),
    originalSegment,
    correctedSegment,
    baseText: orig.base || corr.base,
  };
}

function normalizeTokenForComparison(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[.,!?;:"'`\u2018\u2019\u201A\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveAnchorRelativeBoundaryIndex(segmentText, relativeIndex) {
  const safeSegment = typeof segmentText === "string" ? segmentText : "";
  const boundedRelative = Number.isFinite(relativeIndex)
    ? Math.max(0, Math.min(Math.floor(relativeIndex), safeSegment.length))
    : 0;
  if (!safeSegment) return boundedRelative;
  const { leadingBoundary } = extractTokenBoundaryMetadata(safeSegment);
  if (!leadingBoundary) return boundedRelative;
  // Anchors are mapped to clean token text (without leading quotes/punctuation),
  // so correction-segment offsets must be rebased to that clean-token coordinate.
  return Math.max(0, boundedRelative - leadingBoundary.length);
}

function collapseWhitespaceWithSpanMap(text = "") {
  const safeText = typeof text === "string" ? text : "";
  const spans = [];
  const chars = [];
  let cursor = 0;
  while (cursor < safeText.length) {
    const current = safeText[cursor] || "";
    if (INVISIBLE_GAP_REGEX.test(current)) {
      let end = cursor + 1;
      while (end < safeText.length && INVISIBLE_GAP_REGEX.test(safeText[end] || "")) end++;
      chars.push(" ");
      spans.push({ start: cursor, end });
      cursor = end;
      continue;
    }
    chars.push(current);
    spans.push({ start: cursor, end: cursor + 1 });
    cursor++;
  }
  return {
    canonical: chars.join(""),
    spans,
  };
}

function findAllSubstringIndices(text = "", needle = "") {
  const out = [];
  if (!text || !needle) return out;
  let fromIndex = 0;
  while (fromIndex <= text.length - needle.length) {
    const idx = text.indexOf(needle, fromIndex);
    if (idx < 0) break;
    out.push(idx);
    fromIndex = idx + 1;
  }
  return out;
}

function findSourceTextSpanInParagraph(paragraphText, entrySource, hintPos = -1) {
  const safeParagraph = typeof paragraphText === "string" ? paragraphText : "";
  const safeSource = typeof entrySource === "string" ? entrySource : "";
  if (!safeParagraph || !safeSource) return null;
  const candidates = [];
  const addCandidate = (start, end, label, matchedText) => {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
    candidates.push({
      start,
      end,
      text: typeof matchedText === "string" && matchedText.length ? matchedText : safeParagraph.slice(start, end),
      label,
    });
  };

  for (const idx of findAllSubstringIndices(safeParagraph, safeSource)) {
    addCandidate(idx, idx + safeSource.length, "exact", safeSource);
  }

  const trimmedSource = safeSource.trim();
  if (trimmedSource && trimmedSource !== safeSource) {
    for (const idx of findAllSubstringIndices(safeParagraph, trimmedSource)) {
      addCandidate(idx, idx + trimmedSource.length, "trim", trimmedSource);
    }
  }

  const paragraphCollapsed = collapseWhitespaceWithSpanMap(safeParagraph);
  const sourceCollapsed = collapseWhitespaceWithSpanMap(safeSource);
  const sourceCanonicalTrimmed = sourceCollapsed.canonical.trim();
  if (sourceCanonicalTrimmed) {
    for (const canonStart of findAllSubstringIndices(paragraphCollapsed.canonical, sourceCanonicalTrimmed)) {
      const canonEnd = canonStart + sourceCanonicalTrimmed.length;
      const startSpan = paragraphCollapsed.spans[canonStart];
      const endSpan = paragraphCollapsed.spans[canonEnd - 1];
      if (!startSpan || !endSpan) continue;
      addCandidate(
        startSpan.start,
        endSpan.end,
        "whitespace_normalized",
        safeParagraph.slice(startSpan.start, endSpan.end)
      );
    }
  }

  if (!candidates.length) return null;
  const hint = Number.isFinite(hintPos) ? Math.max(0, hintPos) : null;
  const labelPenalty = {
    exact: 0,
    trim: 1,
    whitespace_normalized: 2,
  };
  candidates.sort((left, right) => {
    const leftPenalty = labelPenalty[left.label] ?? 3;
    const rightPenalty = labelPenalty[right.label] ?? 3;
    if (leftPenalty !== rightPenalty) return leftPenalty - rightPenalty;
    if (hint !== null) {
      const leftDist = Math.abs(left.start - hint);
      const rightDist = Math.abs(right.start - hint);
      if (leftDist !== rightDist) return leftDist - rightDist;
    }
    const leftLen = left.end - left.start;
    const rightLen = right.end - right.start;
    if (leftLen !== rightLen) return leftLen - rightLen;
    return left.start - right.start;
  });
  return candidates[0];
}

function resolveAnchorEndForBoundary(anchor) {
  if (!anchor || !Number.isFinite(anchor.charStart) || anchor.charStart < 0) return -1;
  if (Number.isFinite(anchor.charEnd) && anchor.charEnd > anchor.charStart) {
    return anchor.charEnd;
  }
  if (typeof anchor.tokenText === "string" && anchor.tokenText.length > 0) {
    return anchor.charStart + anchor.tokenText.length;
  }
  return anchor.charStart + 1;
}

function findNextBoundaryAnchor(orderedAnchors, fromTokenIndex) {
  if (!Array.isArray(orderedAnchors) || !Number.isFinite(fromTokenIndex)) return null;
  for (let i = fromTokenIndex + 1; i < orderedAnchors.length; i++) {
    const candidate = orderedAnchors[i];
    if (!candidate || !Number.isFinite(candidate.charStart) || candidate.charStart < 0) continue;
    if (typeof candidate.tokenText === "string" && !candidate.tokenText.trim()) continue;
    return candidate;
  }
  return null;
}

function resolveInsertBoundaryFromAnchorPair(anchor, orderedAnchors) {
  const anchorEnd = resolveAnchorEndForBoundary(anchor);
  if (!Number.isFinite(anchorEnd) || anchorEnd < 0) return null;
  const nextAnchor = findNextBoundaryAnchor(orderedAnchors, anchor?.tokenIndex);
  if (!nextAnchor || !Number.isFinite(nextAnchor.charStart) || nextAnchor.charStart < 0) {
    return {
      pos: anchorEnd,
      anchorEnd,
      nextStart: null,
      nextTokenId: null,
      nextTokenText: null,
    };
  }
  const nextStart = nextAnchor.charStart;
  return {
    pos: Math.min(anchorEnd, nextStart),
    anchorEnd,
    nextStart,
    nextTokenId: nextAnchor.tokenId ?? null,
    nextTokenText: nextAnchor.tokenText ?? null,
  };
}

function collectCommaOpsFromCorrections(detail, anchorsEntry, paragraphIndex, tracking) {
  if (!detail?.corrections || !anchorsEntry) return [];
  const groups = Array.isArray(detail.corrections)
    ? detail.corrections
    : typeof detail.corrections === "object"
      ? Object.values(detail.corrections)
      : [];
  if (!groups.length) return [];
  const ops = [];
  const seen = new Set();
  for (const group of groups) {
    const entries = flattenCorrectionEntries(group?.corrections);
    const operationKind = normalizeCorrectionOperationKind(group?.operation ?? group?.type ?? group?.op);
    for (const entry of entries) {
      const entrySource = pickCorrectionEntryText(entry, [
        "source_text",
        "sourceText",
        "source",
        "original_text",
        "originalText",
      ]);
      const correctedSegment = pickCorrectionEntryText(entry, [
        "text",
        "target_text",
        "targetText",
        "corrected_text",
        "correctedText",
        "suggested_text",
        "suggestedText",
      ]);
      const analysis = analyzeCommaChangeFromCorrections(entrySource, correctedSegment);
      if (!analysis) continue;
      const tokenId = resolveCorrectionSourceTokenId(entry, group, anchorsEntry);
      if (!tokenId) continue;
      if (tracking?.tokenIds) {
        tracking.tokenIds.add(tokenId);
      }
      const anchor = anchorsEntry?.sourceAnchors?.byId?.[tokenId];
      if (!anchor || !anchor.matched || anchor.charStart < 0) {
        if (tracking?.unmatchedTokenIds) {
          tracking.unmatchedTokenIds.add(tokenId);
        }
        continue;
      }
      const tokenText = anchor.tokenText ?? "";

      let placementAnchor = anchor;
      if (entrySource && tokenText) {
        const rawEntry = entrySource.replace(/\s+/g, " ").trim();
        const rawToken = tokenText.replace(/\s+/g, " ").trim();
        const normEntry = normalizeTokenForComparison(entrySource);
        const normToken = normalizeTokenForComparison(tokenText);
        if (rawEntry !== rawToken || normEntry !== normToken) {
          const merged = mergeAnchorsToMatchSourceText(
            entrySource,
            anchor,
            anchorsEntry?.sourceAnchors?.ordered
          );
          if (merged) {
            placementAnchor = merged;
          } else {
            continue;
          }
        }
      }
      let baseText = (entrySource && entrySource.length ? entrySource : tokenText) || "";
      if (
        analysis.addComma &&
        (!baseText || !baseText.trim()) &&
        anchorsEntry?.sourceAnchors?.ordered?.length
      ) {
        const coerced = findPreviousNonWhitespaceAnchor(
          anchorsEntry.sourceAnchors.ordered,
          anchor.tokenId
        );
        if (coerced) {
          placementAnchor = coerced;
          baseText = coerced.tokenText ?? baseText;
        }
      }
      if (!baseText) {
        if (tracking?.unmatchedTokenIds) {
          tracking.unmatchedTokenIds.add(tokenId);
        }
        continue;
      }
      if (tracking?.intents) {
        tracking.intents.push({ tokenId, anchor: placementAnchor, analysis, baseText });
      }
      if (analysis.removeComma) {
        const rawLocalIndex = baseText.lastIndexOf(",");
        if (rawLocalIndex < 0) {
          if (tracking?.unmatchedTokenIds) {
            tracking.unmatchedTokenIds.add(tokenId);
          }
          continue;
        }
        const localIndex = resolveAnchorRelativeBoundaryIndex(baseText, rawLocalIndex);
        const absolutePos = placementAnchor.charStart + localIndex;
        const key = `del-${absolutePos}`;
        if (seen.has(key)) continue;
        seen.add(key);
        ops.push({
          kind: "delete",
          pos: absolutePos,
          originalPos: absolutePos,
          correctedPos: absolutePos,
          paragraphIndex,
          fromCorrections: true,
        });
      } else if (analysis.addComma) {
        const correctedSegment = typeof entry?.text === "string" ? entry.text : "";
        const analysisBase =
          typeof analysis.baseText === "string" && normalizeTokenForComparison(analysis.baseText)
            ? analysis.baseText
            : null;
        const effectiveBase = analysisBase ?? baseText;
        const paragraphOriginalText =
          typeof anchorsEntry?.originalText === "string" ? anchorsEntry.originalText : "";
        const sourceSpan = paragraphOriginalText
          ? findSourceTextSpanInParagraph(
              paragraphOriginalText,
              entrySource || effectiveBase,
              Number.isFinite(anchor?.charStart) ? anchor.charStart : -1
            )
          : null;
        const relativeFromCorrected = findTrailingCommaBoundaryIndex(correctedSegment);
        const orderedAnchors = anchorsEntry?.sourceAnchors?.ordered;
        const pairBoundary = resolveInsertBoundaryFromAnchorPair(anchor, orderedAnchors);
        let rawRelative = relativeFromCorrected;
        let relativeSource = correctedSegment;
        let relative = -1;
        let absolutePos = -1;
        if (sourceSpan && relativeFromCorrected >= 0) {
          const safeRelative = Math.max(
            0,
            Math.min(Math.floor(relativeFromCorrected), sourceSpan.text.length)
          );
          relative = safeRelative;
          absolutePos = sourceSpan.start + safeRelative;
        } else if (sourceSpan) {
          const spanRelative = resolveCommaInsertBoundaryInSegment(sourceSpan.text);
          rawRelative = spanRelative;
          relativeSource = sourceSpan.text;
          relative = spanRelative;
          absolutePos = sourceSpan.start + spanRelative;
        } else if (relativeFromCorrected >= 0) {
          relative = resolveAnchorRelativeBoundaryIndex(relativeSource, rawRelative);
          absolutePos = placementAnchor.charStart + relative;
        } else if (pairBoundary && Number.isFinite(pairBoundary.pos) && pairBoundary.pos >= 0) {
          absolutePos = pairBoundary.pos;
        } else {
          rawRelative = resolveCommaInsertBoundaryInSegment(effectiveBase);
          relativeSource = effectiveBase;
          relative = resolveAnchorRelativeBoundaryIndex(relativeSource, rawRelative);
          absolutePos = placementAnchor.charStart + relative;
        }
        if (!Number.isFinite(absolutePos) || absolutePos < 0) {
          if (tracking?.unmatchedTokenIds) {
            tracking.unmatchedTokenIds.add(tokenId);
          }
          continue;
        }
        // Correction entries can be token-local and miss trailing quote context.
        // If the full paragraph already has a comma at this boundary (e.g. ",«"),
        // suppress a duplicate insert op.
        if (paragraphOriginalText && hasCommaAtBoundary(paragraphOriginalText, absolutePos)) {
          continue;
        }
        const key = `ins-${absolutePos}`;
        if (seen.has(key)) continue;
        seen.add(key);
        ops.push({
          kind: "insert",
          pos: absolutePos,
          originalPos: absolutePos,
          correctedPos: absolutePos,
          paragraphIndex,
          fromCorrections: true,
        });
      }
    }
    if (entries.length || !operationKind || !looksLikeCommaCorrectionGroup(group, anchorsEntry)) continue;
    const tokenId = resolveCorrectionSourceTokenId(null, group, anchorsEntry);
    if (!tokenId) continue;
    if (tracking?.tokenIds) {
      tracking.tokenIds.add(tokenId);
    }
    const anchor = anchorsEntry?.sourceAnchors?.byId?.[tokenId];
    if (!anchor || !anchor.matched || anchor.charStart < 0) {
      if (tracking?.unmatchedTokenIds) {
        tracking.unmatchedTokenIds.add(tokenId);
      }
      continue;
    }
    const baseText = typeof anchor.tokenText === "string" ? anchor.tokenText : "";
    if (tracking?.intents) {
      tracking.intents.push({
        tokenId,
        anchor,
        analysis: {
          addComma: operationKind === "insert",
          removeComma: operationKind === "delete",
          baseText,
        },
        baseText,
      });
    }
    if (operationKind === "delete") {
      const rawLocalIndex = baseText.lastIndexOf(",");
      if (rawLocalIndex < 0) continue;
      const localIndex = resolveAnchorRelativeBoundaryIndex(baseText, rawLocalIndex);
      const absolutePos = anchor.charStart + localIndex;
      const key = `del-${absolutePos}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ops.push({
        kind: "delete",
        pos: absolutePos,
        originalPos: absolutePos,
        correctedPos: absolutePos,
        paragraphIndex,
        fromCorrections: true,
      });
      continue;
    }
    const orderedAnchors = anchorsEntry?.sourceAnchors?.ordered;
    const pairBoundary = resolveInsertBoundaryFromAnchorPair(anchor, orderedAnchors);
    const fallbackRelative = resolveCommaInsertBoundaryInSegment(baseText);
    const absolutePos =
      pairBoundary && Number.isFinite(pairBoundary.pos) && pairBoundary.pos >= 0
        ? pairBoundary.pos
        : anchor.charStart + fallbackRelative;
    if (!Number.isFinite(absolutePos) || absolutePos < 0) continue;
    const paragraphOriginalText =
      typeof anchorsEntry?.originalText === "string" ? anchorsEntry.originalText : "";
    if (paragraphOriginalText && hasCommaAtBoundary(paragraphOriginalText, absolutePos)) {
      continue;
    }
    const key = `ins-${absolutePos}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ops.push({
      kind: "insert",
      pos: absolutePos,
      originalPos: absolutePos,
      correctedPos: absolutePos,
      paragraphIndex,
      fromCorrections: true,
    });
  }

  if (tracking && tracking.intents?.length) {
    tracking.blockedOriginalPositions = new Set(tracking.blockedOriginalPositions || []);
    tracking.blockedCorrectedPositions = new Set(tracking.blockedCorrectedPositions || []);
    for (const intent of tracking.intents) {
      const anchor = intent?.anchor;
      if (!anchor) continue;
      const baseText = intent.baseText ?? intent.analysis?.baseText ?? anchor.tokenText ?? "";
      const charStart = anchor.charStart;
      if (typeof charStart !== "number" || charStart < 0 || !baseText) continue;
      if (intent.analysis?.removeComma) {
        const rawDeleteIndex = baseText.lastIndexOf(",");
        if (rawDeleteIndex >= 0) {
          const deleteIndex = resolveAnchorRelativeBoundaryIndex(baseText, rawDeleteIndex);
          tracking.blockedOriginalPositions.add(charStart + deleteIndex);
        }
      }
      if (intent.analysis?.addComma) {
        const rawInsertBoundary = baseText.replace(TRAILING_COMMA_REGEX, "").length;
        const insertBoundary = resolveAnchorRelativeBoundaryIndex(baseText, rawInsertBoundary);
        tracking.blockedCorrectedPositions.add(charStart + insertBoundary);
      }
    }
  }
  return ops;
}

function findPreviousNonWhitespaceAnchor(list, tokenId) {
  if (!Array.isArray(list) || !tokenId) return null;
  const startIndex = list.findIndex((anchor) => anchor?.tokenId === tokenId);
  if (startIndex <= 0) return null;
  for (let i = startIndex - 1; i >= 0; i--) {
    const anchor = list[i];
    if (anchor?.tokenText && anchor.tokenText.trim()) {
      return anchor;
    }
  }
  return null;
}

function mergeAnchorsToMatchSourceText(entrySource, baseAnchor, orderedAnchors) {
  if (!entrySource || !baseAnchor || !orderedAnchors?.length) return null;
  const targetNormalized = normalizeTokenForComparison(entrySource);
  if (!targetNormalized) return null;
  let combinedText = baseAnchor.tokenText ?? "";
  let normalizedCombined = normalizeTokenForComparison(combinedText);
  if (normalizedCombined === targetNormalized) return baseAnchor;

  let leftIndex = baseAnchor.tokenIndex - 1;
  let rightIndex = baseAnchor.tokenIndex + 1;
  let leftAnchor = baseAnchor;
  let rightAnchor = baseAnchor;
  const maxLength = entrySource.length + 20;

  while (combinedText.length <= maxLength) {
    let expanded = false;
    if (leftIndex >= 0) {
      const candidate = orderedAnchors[leftIndex];
      leftIndex--;
      if (candidate?.tokenText != null) {
        combinedText = (candidate.tokenText ?? "") + combinedText;
        leftAnchor = candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (normalizedCombined === targetNormalized) break;
    if (rightIndex < orderedAnchors.length) {
      const candidate = orderedAnchors[rightIndex];
      rightIndex++;
      if (candidate?.tokenText != null) {
        combinedText += candidate.tokenText ?? "";
        rightAnchor = candidate;
        normalizedCombined = normalizeTokenForComparison(combinedText);
        expanded = true;
        if (normalizedCombined === targetNormalized) break;
      }
    }
    if (!expanded) break;
  }

  if (normalizedCombined !== targetNormalized) return null;
  if (typeof leftAnchor?.charStart !== "number" || leftAnchor.charStart < 0) return null;

  return {
    ...baseAnchor,
    charStart: leftAnchor.charStart,
    tokenIndex: leftAnchor.tokenIndex,
    tokenText: combinedText,
  };
}

function filterDiffOpsAgainstCorrections(ops, tracking) {
  if (!tracking || !Array.isArray(ops) || !ops.length) return ops;
  const blockedOriginal = tracking.blockedOriginalPositions;
  const blockedCorrected = tracking.blockedCorrectedPositions;
  if (!blockedOriginal?.size && !blockedCorrected?.size) return ops;
  return ops.filter((op) => {
    const originalPos = typeof op.originalPos === "number" ? op.originalPos : op.pos;
    const correctedPos = typeof op.correctedPos === "number" ? op.correctedPos : op.pos;
    if (op.kind === "delete" && blockedOriginal?.has(originalPos)) return false;
    if (op.kind === "insert" && blockedCorrected?.has(correctedPos)) return false;
    return true;
  });
}

function getCommaOpIdentity(op) {
  const originalPos = typeof op?.originalPos === "number" ? op.originalPos : op?.pos;
  const correctedPos = typeof op?.correctedPos === "number" ? op.correctedPos : op?.pos;
  return `${op?.kind || "unknown"}:${originalPos}:${correctedPos}`;
}

function mergePreferredCommaOps(primaryOps, secondaryOps) {
  const merged = [];
  const seen = new Set();
  const pushUnique = (op) => {
    if (!op) return;
    const key = getCommaOpIdentity(op);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(op);
  };
  (Array.isArray(primaryOps) ? primaryOps : []).forEach(pushUnique);
  (Array.isArray(secondaryOps) ? secondaryOps : []).forEach(pushUnique);
  return merged;
}

function shouldSuppressDueToRepeatedToken(anchorsEntry, op) {
  if (op?.fromCorrections || op?.fromApiCommaOps) return false;
  const anchor = findAnchorForDiffOp(anchorsEntry, op);
  if (!anchor) return false;
  const repeatKey = anchor.repeatKey;
  const repeatTotal = anchor.repeatKeyTotal ?? 0;
  if (!repeatKey || repeatTotal <= 1) return false;
  if (!/[\p{L}\d]+/u.test(repeatKey)) return false;
  const gap = anchor.repeatKeyNearestGap ?? Infinity;
  return gap <= 80;
}

function findAnchorForDiffOp(anchorsEntry, op) {
  if (!anchorsEntry || !op) return null;
  const isDelete = op.kind === "delete";
  const charIndex = isDelete ? op.originalPos ?? op.pos : op.correctedPos ?? op.pos;
  if (typeof charIndex !== "number" || charIndex < 0) return null;
  const around = findAnchorsNearChar(anchorsEntry, isDelete ? "source" : "target", charIndex);
  return around?.at ?? null;
}

function buildDeleteSuggestionMetadata(entry, charIndex) {
  if (!entry) return null;
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
  if (!entry) return null;
  const srcIndex = typeof originalCharIndex === "number" ? originalCharIndex : -1;
  const targetIndex = typeof targetCharIndex === "number" ? targetCharIndex : srcIndex;
  const sourceAround = findAnchorsNearChar(entry, "source", srcIndex);
  const targetAround = findAnchorsNearChar(entry, "target", targetIndex);
  const documentOffset = entry?.documentOffset ?? 0;
  const originalText = typeof entry?.originalText === "string" ? entry.originalText : "";
  const correctedText = typeof entry?.correctedText === "string" ? entry.correctedText : "";
  // Extract quote intent classification EARLY so we can use it for anchor selection
  const quoteCharsClosing = BOUNDARY_CLOSER_REGEX;
  const quoteCharsOpening = BOUNDARY_OPENER_REGEX;
  // Match whitespace AND zero-width characters (Format category: \u200B, \u200C, \u200D, etc)
  const invisibleCharRegex = /[\s\u200B-\u200D\uFEFF]/u;
  const nearestNonSpaceLeft = (startIndex) => {
    let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : -1;
    while (idx >= 0 && invisibleCharRegex.test(correctedText[idx] || "")) idx--;
    return idx >= 0 ? correctedText[idx] || "" : "";
  };
  const nearestNonSpaceRight = (startIndex) => {
    let idx = Number.isFinite(startIndex) ? Math.floor(startIndex) : 0;
    while (idx < correctedText.length && invisibleCharRegex.test(correctedText[idx] || "")) idx++;
    return idx < correctedText.length ? correctedText[idx] || "" : "";
  };
  const resolveCommaIndex = () => {
    if (!correctedText || !Number.isFinite(targetIndex) || targetIndex < 0) return -1;
    return findCommaIndexAtBoundary(correctedText, targetIndex);
  };
  const resolvedCommaIndex = resolveCommaIndex();
  const resolvedInsertBoundaryIndex =
    resolvedCommaIndex >= 0 ? resolvedCommaIndex : Number.isFinite(targetIndex) ? targetIndex : -1;
  const classifyIntent = () => {
    // For INSERT operations, comma doesn't exist yet - use targetIndex directly
    // For DELETE operations, search for existing comma
    let checkPos = -1;
    const existingComma = resolvedCommaIndex;
    
    if (existingComma >= 0) {
      // Comma exists (DELETE case)
      checkPos = existingComma;
    } else if (Number.isFinite(targetIndex) && targetIndex >= 0) {
      // Comma doesn't exist (INSERT case) - use targetIndex
      checkPos = targetIndex;
    } else {
      return "unknown";
    }
    
    if (checkPos < 0 || checkPos >= correctedText.length) return "unknown";
    const leftChar = nearestNonSpaceLeft(checkPos - 1);
    const rightChar = nearestNonSpaceRight(checkPos + 1);
    
    
    if (quoteCharsClosing.test(rightChar)) return "before_closing_quote";
    if (quoteCharsClosing.test(leftChar)) return "after_closing_quote";
    if (quoteCharsOpening.test(rightChar)) return "before_opening_quote";
    if (quoteCharsOpening.test(leftChar)) return "after_opening_quote";
    return "none";
  };
  
  const explicitQuoteIntent = classifyIntent();
  const resolveDashBoundaryInfo = () => {
    if (!correctedText || !Number.isFinite(resolvedInsertBoundaryIndex) || resolvedInsertBoundaryIndex < 0) {
      return { isDashBoundary: false, dashChar: null };
    }
    const boundaryPos = Math.max(0, Math.min(correctedText.length, Math.floor(resolvedInsertBoundaryIndex)));
    const leftChar = nearestNonSpaceLeft(boundaryPos - 1);
    const atChar = boundaryPos < correctedText.length ? correctedText[boundaryPos] || "" : "";
    const rightChar = nearestNonSpaceRight(boundaryPos);
    const dashChar = [atChar, leftChar, rightChar].find((ch) => BOUNDARY_DASH_REGEX.test(ch || "")) || "";
    return { isDashBoundary: Boolean(dashChar), dashChar: dashChar || null };
  };
  const dashBoundaryInfo = resolveDashBoundaryInfo();
  
  const buildBoundaryMeta = () => {
    const commaIndex = resolvedCommaIndex;
    const beforeAnchor = targetAround.before ?? sourceAround.before ?? null;
    const afterAnchor = targetAround.after ?? sourceAround.after ?? null;
    const preferredSide =
      Number.isFinite(afterAnchor?.charStart) && Number.isFinite(targetIndex) && targetIndex >= afterAnchor.charStart
        ? "before_after_token"
        : "after_before_token";
    return {
      sourceBoundaryPos: Number.isFinite(srcIndex) && srcIndex >= 0 ? srcIndex : null,
      targetBoundaryPos:
        Number.isFinite(resolvedInsertBoundaryIndex) && resolvedInsertBoundaryIndex >= 0
          ? resolvedInsertBoundaryIndex
          : null,
      targetCommaPos: commaIndex >= 0 ? commaIndex : null,
      beforeToken: snapshotAnchor(beforeAnchor),
      afterToken: snapshotAnchor(afterAnchor),
      preferredSide,
      explicitQuoteIntent,
      forcePunctuationHighlight: dashBoundaryInfo.isDashBoundary,
      punctuationBoundaryChar: dashBoundaryInfo.dashChar,
      leftContext: correctedText.slice(
        Math.max(0, resolvedInsertBoundaryIndex - 12),
        Math.max(0, resolvedInsertBoundaryIndex)
      ),
      rightContext: correctedText.slice(
        resolvedInsertBoundaryIndex + 1,
        Math.min(correctedText.length, resolvedInsertBoundaryIndex + 13)
      ),
      exactApplyWindow: buildExactApplyWindowMeta(originalText, correctedText, srcIndex, targetIndex),
    };
  };
  const isLexicalAnchor = (anchor) =>
    Number.isFinite(anchor?.charStart) && anchor.charStart >= 0 && /[\p{L}\p{N}]/u.test(anchor?.tokenText || "");
  const pickFirstLexicalAnchor = (candidates) => {
    if (!Array.isArray(candidates)) return null;
    for (const candidate of candidates) {
      if (isLexicalAnchor(candidate)) return candidate;
    }
    return null;
  };
  const isDashAnchor = (anchor) =>
    Number.isFinite(anchor?.charStart) &&
    anchor.charStart >= 0 &&
    BOUNDARY_DASH_REGEX.test(anchor?.tokenText || "");
  const pickFirstDashAnchor = (candidates) => {
    if (!Array.isArray(candidates)) return null;
    for (const candidate of candidates) {
      if (isDashAnchor(candidate)) return candidate;
    }
    return null;
  };

  const defaultHighlightAnchor =
    sourceAround.at ??
    sourceAround.before ??
    sourceAround.after ??
    targetAround.at ??
    targetAround.before ??
    targetAround.after;

  const boundaryDashAnchor = dashBoundaryInfo.isDashBoundary
    ? pickFirstDashAnchor([
        sourceAround.at,
        targetAround.at,
        sourceAround.before,
        targetAround.before,
        sourceAround.after,
        targetAround.after,
      ])
    : null;
  const preferAfterLexical =
    explicitQuoteIntent === "before_opening_quote" || explicitQuoteIntent === "after_opening_quote";
  let highlightAnchor = boundaryDashAnchor;
  if (!highlightAnchor) {
    highlightAnchor = preferAfterLexical
      ? pickFirstLexicalAnchor([
          sourceAround.after,
          targetAround.after,
          sourceAround.at,
          targetAround.at,
          sourceAround.before,
          targetAround.before,
        ])
      : pickFirstLexicalAnchor([
          sourceAround.before,
          targetAround.before,
          sourceAround.at,
          targetAround.at,
          sourceAround.after,
          targetAround.after,
        ]);
  }

  if (!highlightAnchor) {
    highlightAnchor =
      pickFirstLexicalAnchor([
        sourceAround.at,
        sourceAround.before,
        sourceAround.after,
        targetAround.at,
        targetAround.before,
        targetAround.after,
      ]) || defaultHighlightAnchor;
  }

  let highlightCharStart = highlightAnchor?.charStart ?? srcIndex;
  let highlightCharEnd = highlightAnchor?.charEnd;
  const shouldHighlightQuoteOnly =
    explicitQuoteIntent === "after_closing_quote" || explicitQuoteIntent === "after_opening_quote";
  if (
    shouldHighlightQuoteOnly &&
    Number.isFinite(resolvedInsertBoundaryIndex) &&
    resolvedInsertBoundaryIndex >= 0
  ) {
    const quoteSearchText = typeof originalText === "string" && originalText.length ? originalText : correctedText;
    const boundaryHint = Number.isFinite(srcIndex) && srcIndex >= 0 ? srcIndex : resolvedInsertBoundaryIndex;
    let quotePos = -1;
    let left = Math.min(quoteSearchText.length - 1, Math.floor(boundaryHint) - 1);
    while (left >= 0 && invisibleCharRegex.test(quoteSearchText[left] || "")) left--;
    if (left >= 0 && BOUNDARY_QUOTE_REGEX.test(quoteSearchText[left] || "")) {
      quotePos = left;
    }
    if (quotePos < 0) {
      let right = Math.max(0, Math.floor(boundaryHint));
      while (right < quoteSearchText.length && invisibleCharRegex.test(quoteSearchText[right] || "")) right++;
      if (right < quoteSearchText.length && BOUNDARY_QUOTE_REGEX.test(quoteSearchText[right] || "")) {
        quotePos = right;
      }
    }
    if (quotePos >= 0) {
      highlightCharStart = quotePos;
      highlightCharEnd = quotePos + 1;
    }
  }
  if (
    !(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart) &&
    typeof highlightCharStart === "number" &&
    highlightCharStart >= 0 &&
    typeof highlightAnchor?.tokenText === "string" &&
    highlightAnchor.tokenText.length > 0
  ) {
    highlightCharEnd = highlightCharStart + highlightAnchor.tokenText.length;
  }
  if (!(typeof highlightCharEnd === "number" && highlightCharEnd > highlightCharStart)) {
    highlightCharEnd = highlightCharStart;
  }
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
    targetCharStart: resolvedInsertBoundaryIndex,
    targetCharEnd:
      resolvedInsertBoundaryIndex >= 0 ? resolvedInsertBoundaryIndex + 1 : resolvedInsertBoundaryIndex,
    targetDocumentCharStart:
      resolvedInsertBoundaryIndex >= 0
        ? documentOffset + resolvedInsertBoundaryIndex
        : resolvedInsertBoundaryIndex,
    targetDocumentCharEnd:
      resolvedInsertBoundaryIndex >= 0
        ? documentOffset + resolvedInsertBoundaryIndex + 1
        : resolvedInsertBoundaryIndex,
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

function snapshotAnchor(anchor) {
  if (!anchor) return undefined;
  return {
    tokenId: anchor.tokenId,
    tokenIndex: anchor.tokenIndex,
    tokenText: anchor.tokenText,
    leadingBoundary: anchor.leadingBoundary,
    trailingBoundary: anchor.trailingBoundary,
    textOccurrence: anchor.textOccurrence,
    trimmedTextOccurrence: anchor.trimmedTextOccurrence,
    charStart: anchor.charStart,
    charEnd: anchor.charEnd,
    documentCharStart: anchor.documentCharStart,
    documentCharEnd: anchor.documentCharEnd,
    length: anchor.length,
    matched: anchor.matched,
    lemmaMatched: anchor.lemmaMatched,
    lemmaAuthoritative: anchor.lemmaAuthoritative,
    lemmaMatchType: anchor.lemmaMatchType,
    lemmaMatchScore: anchor.lemmaMatchScore,
    lemmaCharDrift: anchor.lemmaCharDrift,
    lemmaIndexDrift: anchor.lemmaIndexDrift,
    repeatKey: anchor.repeatKey,
    repeatKeyTotal: anchor.repeatKeyTotal,
    repeatKeyNearestGap: anchor.repeatKeyNearestGap,
  };
}
