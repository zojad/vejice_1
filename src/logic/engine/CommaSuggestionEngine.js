import { createSuggestion } from "./Suggestion.js";
import {
  normalizeParagraphWhitespace,
  onlyCommasChanged,
  isNumericComma,
  charAtSafe,
  QUOTES,
} from "./textUtils.js";
import {
  tokenizeForAnchoring,
  mapTokensToParagraphText,
  findAnchorsNearChar,
} from "../anchoring/SyntheticAnchorProvider.js";

const MAX_PARAGRAPH_CHARS = 3000;
const TRAILING_COMMA_REGEX = /[,\s]+$/;

export class CommaSuggestionEngine {
  constructor({ anchorProvider, apiClient, notifiers = {} }) {
    this.anchorProvider = anchorProvider;
    this.apiClient = apiClient;
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
  }) {
    const chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS);
    if (!chunks.length) {
      return {
        suggestions: [],
        apiErrors: 0,
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

    const processedMeta = [];
    const chunkDetails = [];
    let apiErrors = 0;

    for (const chunk of chunks) {
      const meta = {
        chunk,
        correctedText: chunk.normalizedText,
        detail: null,
        syntheticTokens: null,
      };
      processedMeta.push(meta);

      if (chunk.tooLong) {
        this.notifiers.onSentenceTooLong(paragraphIndex, chunk.length);
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        continue;
      }
      let detail = null;
      try {
        detail = await this.apiClient.popraviPovedDetailed(chunk.normalizedText || chunk.text);
      } catch (apiErr) {
        apiErrors++;
        this.notifiers.onChunkApiFailure(paragraphIndex, chunk.index, apiErr);
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        continue;
      }
      const correctedChunk = detail.correctedText;
      if (!onlyCommasChanged(chunk.normalizedText || chunk.text, correctedChunk)) {
        this.notifiers.onChunkNonCommaChanges(
          paragraphIndex,
          chunk.index,
          chunk.text,
          correctedChunk
        );
        meta.syntheticTokens = tokenizeForAnchoring(
          chunk.text,
          `p${paragraphIndex}_c${chunk.index}_syn_`
        );
        continue;
      }
      meta.detail = detail;
      meta.correctedText = correctedChunk;

      const baseForDiff = chunk.text || chunk.normalizedText || "";
      const diffOps = correctionsHaveEntries(detail?.corrections)
        ? []
        : collapseDuplicateDiffOps(
            filterCommaOps(baseForDiff, correctedChunk, diffCommasOnly(baseForDiff, correctedChunk))
          );
      if (!meta.detail && !diffOps.length) continue;
      chunkDetails.push({
        chunk,
        metaRef: meta,
        baseForDiff,
        correctedChunk,
        diffOps,
      });
    }

    if (!processedMeta.some((meta) => meta.detail)) {
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
      if (meta.detail) {
        const { tokens: rekeyedSource, map: sourceMap } = rekeyTokensWithMap(
          meta.detail.sourceTokens,
          `${basePrefix}s`
        );
        sourceTokens.push(...rekeyedSource);
        const { tokens: rekeyedTarget } = rekeyTokensWithMap(meta.detail.targetTokens, `${basePrefix}t`);
        targetTokens.push(...rekeyedTarget);
        meta.remappedCorrections = remapCorrections(meta.detail.corrections, sourceMap);
      } else if (meta.syntheticTokens && meta.syntheticTokens.length) {
        const rekeyed = rekeyTokens(meta.syntheticTokens, `${basePrefix}syn_`);
        sourceTokens.push(...rekeyed);
        targetTokens.push(...rekeyed);
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

    for (const entry of chunkDetails) {
      const detailRef = entry.metaRef?.detail
        ? {
            ...entry.metaRef.detail,
            corrections: entry.metaRef.remappedCorrections ?? entry.metaRef.detail.corrections,
          }
        : null;
      let ops = [];
      const correctionTracking = detailRef?.corrections ? createCorrectionTracking() : null;
      const correctionsPresent = correctionsHaveEntries(detailRef?.corrections);
      if (correctionsPresent) {
        ops = collectCommaOpsFromCorrections(
          detailRef,
          anchorsEntry,
          paragraphIndex,
          correctionTracking
        );
      }
      let fallbackOps = entry.diffOps || [];
      if (fallbackOps.length) {
        if (!correctionsPresent || ops.length) {
          fallbackOps = filterDiffOpsAgainstCorrections(fallbackOps, correctionTracking);
        }
        if (!correctionsPresent && detailRef && !ops.length) {
          ops = fallbackOps.map((op) => ({ ...op, fromCorrections: true, viaDiffFallback: true }));
          fallbackOps = [];
        } else if (!ops.length && correctionsPresent) {
          fallbackOps = fallbackOps.map((op) => ({ ...op, fromCorrections: true }));
        }
      }
      const usingFallbackOnly = !ops.length;
      const allOps = usingFallbackOnly ? fallbackOps : ops;
      if (!allOps.length) continue;
      for (const op of allOps) {
        if (!ops.includes(op) && op.kind === "insert") {
          const seenInsert = ops.some(
            (existing) => existing.kind === "insert" && existing.pos === op.pos
          );
          if (seenInsert) continue;
        }
        const opSource = ops.includes(op) ? op : null;
        const offset = entry.chunk.start;
        const baseOp = opSource || op;
        const adjustedOp = {
          ...baseOp,
          pos: baseOp.pos + offset,
          originalPos:
            (typeof baseOp.originalPos === "number" ? baseOp.originalPos : baseOp.pos) + offset,
          correctedPos:
            (typeof baseOp.correctedPos === "number" ? baseOp.correctedPos : baseOp.pos) + offset,
        };
        if (shouldSuppressDueToRepeatedToken(anchorsEntry, adjustedOp)) {
          continue;
        }
        const suggestion = buildSuggestionFromOp({
          op: adjustedOp,
          paragraphIndex,
          anchorsEntry,
          originalText,
          correctedParagraph,
        });
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
      if (!ops.length && fallbackOps.length) {
        for (const op of fallbackOps) {
          const offset = entry.chunk.start;
          const adjustedOp = {
            ...op,
            pos: op.pos + offset,
            originalPos: (typeof op.originalPos === "number" ? op.originalPos : op.pos) + offset,
            correctedPos: (typeof op.correctedPos === "number" ? op.correctedPos : op.pos) + offset,
          };
          if (shouldSuppressDueToRepeatedToken(anchorsEntry, adjustedOp)) {
            continue;
          }
          const suggestion = buildSuggestionFromOp({
            op: adjustedOp,
            paragraphIndex,
            anchorsEntry,
            originalText,
            correctedParagraph,
          });
          if (suggestion) {
            suggestions.push(suggestion);
          }
        }
      }
    }

    return {
      suggestions,
      apiErrors,
      processedAny: Boolean(suggestions.length),
      anchorsEntry,
      correctedParagraph,
    };
  }
}

function buildSuggestionFromOp({ op, paragraphIndex, anchorsEntry, originalText, correctedText }) {
  if (!op) return null;
  if (op.kind === "delete") {
    const metadata = buildDeleteSuggestionMetadata(anchorsEntry, op.originalPos ?? op.pos);
    if (!metadata) return null;
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
      highlightText: metadata.highlightText,
      anchor: metadata,
      originalText,
      correctedText,
    },
  });
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

function splitParagraphIntoChunks(text = "", maxLen = MAX_PARAGRAPH_CHARS) {
  const safeText = typeof text === "string" ? text : "";
  if (!safeText) return [];
  const placeholder = "\uE000";
  const protectedText = safeText;
  const sentences = [];
  let start = 0;

  const pushSentence = (contentEnd, gapEnd = contentEnd) => {
    if (typeof contentEnd !== "number" || contentEnd <= start) {
      start = Math.max(start, gapEnd ?? contentEnd ?? start);
      return;
    }
    sentences.push({ start, end: contentEnd, gapEnd: gapEnd ?? contentEnd });
    start = gapEnd ?? contentEnd;
  };

  for (let i = 0; i < protectedText.length; i++) {
    const ch = protectedText[i];
    if (ch === "\n") {
      pushSentence(i + 1, i + 1);
      continue;
    }
    if (/[.!?]/.test(ch)) {
      let contentEnd = i + 1;
      while (contentEnd < protectedText.length && /[\])"'»”’]+/.test(protectedText[contentEnd])) {
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

  return sentences.map((sentence, index) => {
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
  const remapGroup = (group) => {
    if (!group) return group;
    const remapped = { ...group };
    const mappedStart = idMap.get(group.source_start) ?? group.source_start;
    remapped.source_start = mappedStart;
    if (Array.isArray(group.corrections)) {
      remapped.corrections = group.corrections.map((corr) => {
        if (!corr) return corr;
        const mappedId = idMap.get(corr.source_id) ?? corr.source_id;
        return { ...corr, source_id: mappedId };
      });
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
  if (Array.isArray(corrections)) {
    return corrections.some((group) => Array.isArray(group?.corrections) && group.corrections.length);
  }
  if (typeof corrections === "object") {
    return Object.values(corrections).some(
      (group) => Array.isArray(group?.corrections) && group.corrections.length
    );
  }
  return false;
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
  while (idx < text.length && /\s/.test(text[idx])) {
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

function analyzeCommaChangeFromCorrections(originalSegment = "", correctedSegment = "") {
  const orig = stripTrailingCommaAndSpace(originalSegment);
  const corr = stripTrailingCommaAndSpace(correctedSegment);
  if (orig.hasComma === corr.hasComma) return null;
  return {
    removeComma: orig.hasComma && !corr.hasComma,
    addComma: !orig.hasComma && corr.hasComma,
    originalSegment,
    correctedSegment,
    baseText: orig.base || corr.base,
  };
}

function normalizeTokenForComparison(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[.,!?;:“”„'"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
    const entries = Array.isArray(group?.corrections) ? group.corrections : [];
    for (const entry of entries) {
      const analysis = analyzeCommaChangeFromCorrections(entry?.source_text, entry?.text);
      if (!analysis) continue;
      const tokenId = entry?.source_id ?? group?.source_start;
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
      const entrySource = typeof entry?.source_text === "string" ? entry.source_text : "";

      let placementAnchor = anchor;
      if (entrySource && tokenText) {
        const normEntry = normalizeTokenForComparison(entrySource);
        const normToken = normalizeTokenForComparison(tokenText);
        if (normEntry !== normToken) {
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
        const localIndex = baseText.lastIndexOf(",");
        if (localIndex < 0) {
          if (tracking?.unmatchedTokenIds) {
            tracking.unmatchedTokenIds.add(tokenId);
          }
          continue;
        }
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
        const analysisBase =
          typeof analysis.baseText === "string" && normalizeTokenForComparison(analysis.baseText)
            ? analysis.baseText
            : null;
        const effectiveBase = analysisBase ?? baseText;
        const insertBase = effectiveBase.replace(TRAILING_COMMA_REGEX, "");
        const relative = insertBase.length;
        const absolutePos = placementAnchor.charStart + relative;
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
      const deleteIndex = baseText.lastIndexOf(",");
      if (deleteIndex >= 0) {
        tracking.blockedOriginalPositions.add(charStart + deleteIndex);
      }
      const insertBaseLen = baseText.replace(TRAILING_COMMA_REGEX, "").length;
      tracking.blockedCorrectedPositions.add(charStart + insertBaseLen);
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

function shouldSuppressDueToRepeatedToken(anchorsEntry, op) {
  if (op?.fromCorrections) return false;
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

function buildInsertSuggestionMetadata(entry, { originalCharIndex, targetCharIndex }) {
  if (!entry) return null;
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
  let highlightCharEnd = highlightAnchor?.charEnd;
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

function snapshotAnchor(anchor) {
  if (!anchor) return undefined;
  return {
    tokenId: anchor.tokenId,
    tokenIndex: anchor.tokenIndex,
    tokenText: anchor.tokenText,
    textOccurrence: anchor.textOccurrence,
    trimmedTextOccurrence: anchor.trimmedTextOccurrence,
    charStart: anchor.charStart,
    charEnd: anchor.charEnd,
    documentCharStart: anchor.documentCharStart,
    documentCharEnd: anchor.documentCharEnd,
    length: anchor.length,
    matched: anchor.matched,
    repeatKey: anchor.repeatKey,
    repeatKeyTotal: anchor.repeatKeyTotal,
    repeatKeyNearestGap: anchor.repeatKeyNearestGap,
  };
}
