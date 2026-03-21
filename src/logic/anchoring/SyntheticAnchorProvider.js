import { AnchorProvider } from "./AnchorProvider.js";
import {
  normalizeParagraphWhitespace,
  normalizeTokenRepeatKey,
  stripTokenBoundaryPunctuation,
  extractTokenBoundaryMetadata,
} from "../engine/textUtils.js";

export class SyntheticAnchorProvider extends AnchorProvider {
  constructor() {
    super("SyntheticAnchorProvider");
    this.paragraphAnchors = [];
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

  async getAnchors({
    paragraphIndex,
    originalText = "",
    correctedText = "",
    sourceTokens = [],
    targetTokens = [],
    documentOffset = 0,
  }) {
    const safeOriginal = typeof originalText === "string" ? originalText : "";
    const safeCorrected = typeof correctedText === "string" ? correctedText : "";
    const normalizedSource = normalizeTokenList(sourceTokens, "s");
    const normalizedTarget = normalizeTokenList(targetTokens, "t");
    const entry = {
      paragraphIndex,
      documentOffset,
      originalText: safeOriginal,
      correctedText: safeCorrected,
      sourceTokens: normalizedSource,
      targetTokens: normalizedTarget,
      sourceAnchors: mapTokensToParagraphText(
        paragraphIndex,
        safeOriginal,
        normalizedSource,
        documentOffset
      ),
      targetAnchors: mapTokensToParagraphText(
        paragraphIndex,
        safeCorrected,
        normalizedTarget,
        documentOffset
      ),
    };
    this.setAnchors(paragraphIndex, entry);
    return entry;
  }
}

export function normalizeTokenList(tokens, prefix) {
  if (!Array.isArray(tokens)) return [];
  const normalized = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = normalizeToken(tokens[i], prefix, i);
    if (token) normalized.push(token);
  }
  return normalized;
}

export function normalizeToken(rawToken, prefix, index) {
  if (rawToken === null || typeof rawToken === "undefined") return null;
  if (typeof rawToken === "string") {
    // Extract boundary metadata while stripping quotes from string tokens
    const { leadingBoundary, trailingBoundary, cleanText } = extractTokenBoundaryMetadata(rawToken);
    return {
      id: `${prefix}${index + 1}`,
      text: cleanText,
      leadingBoundary,
      trailingBoundary,
      raw: rawToken,
    };
  }
  if (typeof rawToken === "object") {
    const idCandidate =
      rawToken.token_id ??
      rawToken.tokenId ??
      rawToken.id ??
      rawToken.ID ??
      rawToken.name ??
      rawToken.key;
    const textCandidate =
      rawToken.token ??
      rawToken.text ??
      rawToken.form ??
      rawToken.value ??
      rawToken.surface ??
      rawToken.word;
    const trailing =
      rawToken.whitespace ??
      rawToken.trailing_ws ??
      rawToken.trailingWhitespace ??
      rawToken.after ??
      rawToken.space ??
      "";
    const leading =
      rawToken.leading_ws ?? rawToken.leadingWhitespace ?? rawToken.before ?? rawToken.prefix ?? "";
    const startCharRaw = pickTokenOffset([
      rawToken.start_char,
      rawToken.startChar,
      rawToken.start,
      rawToken.charStart,
      rawToken.begin,
      rawToken.offset,
      rawToken.position,
    ]);
    const endCharRaw = pickTokenOffset([
      rawToken.end_char,
      rawToken.endChar,
      rawToken.end,
      rawToken.charEnd,
      rawToken.finish,
    ]);
    // CRITICAL FIX: Extract and preserve quote boundary metadata
    // API returns tokens like "word" or "word", but paragraph text is just word
    // We strip quotes from text for paragraph matching BUT preserve boundary info separately
    // This allows comma placement logic to know: "this word had a trailing quote" -> "comma after quote"
    const { leadingBoundary, trailingBoundary, cleanText } = extractTokenBoundaryMetadata(
      typeof textCandidate === "string" ? textCandidate : ""
    );
    const { charStart, charEnd } = rebaseTokenOffsetsForCleanText({
      rawText: typeof textCandidate === "string" ? textCandidate : "",
      cleanText,
      leadingBoundary,
      trailingBoundary,
      startChar: startCharRaw,
      endChar: endCharRaw,
    });
    return {
      id: typeof idCandidate === "string" ? idCandidate : `${prefix}${index + 1}`,
      text: cleanText,
      leadingBoundary,
      trailingBoundary,
      trailingWhitespace: typeof trailing === "string" ? trailing : "",
      leadingWhitespace: typeof leading === "string" ? leading : "",
      charStart,
      charEnd,
      raw: rawToken,
    };
  }
  return null;
}

function rebaseTokenOffsetsForCleanText({
  rawText = "",
  cleanText = "",
  leadingBoundary = "",
  trailingBoundary = "",
  startChar,
  endChar,
}) {
  const hasStart = Number.isFinite(startChar);
  const hasEnd = Number.isFinite(endChar);
  if (!hasStart && !hasEnd) {
    return { charStart: startChar, charEnd: endChar };
  }

  const raw = typeof rawText === "string" ? rawText : "";
  const clean = typeof cleanText === "string" ? cleanText : "";
  const leadingLen = typeof leadingBoundary === "string" ? leadingBoundary.length : 0;
  const trailingLen = typeof trailingBoundary === "string" ? trailingBoundary.length : 0;
  const hasBoundaryTrim = raw !== clean && (leadingLen > 0 || trailingLen > 0);
  if (!hasBoundaryTrim) {
    return { charStart: startChar, charEnd: endChar };
  }

  const rawLen = raw.length;
  const cleanLen = clean.length;
  const spanLen = hasStart && hasEnd ? Math.max(0, endChar - startChar) : null;
  let shouldRebase = false;
  if (spanLen === null) {
    shouldRebase = true;
  } else if (spanLen === cleanLen && cleanLen <= rawLen) {
    shouldRebase = false;
  } else if (spanLen === rawLen) {
    shouldRebase = true;
  } else {
    shouldRebase = spanLen > cleanLen;
  }

  if (!shouldRebase) {
    return { charStart: startChar, charEnd: endChar };
  }

  const rebasedStart = hasStart ? startChar + leadingLen : startChar;
  let rebasedEnd = hasEnd ? endChar - trailingLen : endChar;

  if (Number.isFinite(rebasedStart) && Number.isFinite(rebasedEnd) && rebasedEnd < rebasedStart) {
    rebasedEnd = rebasedStart;
  }
  if (Number.isFinite(rebasedStart) && (!Number.isFinite(rebasedEnd) || rebasedEnd < rebasedStart)) {
    rebasedEnd = rebasedStart + cleanLen;
  }

  return { charStart: rebasedStart, charEnd: rebasedEnd };
}

export function mapTokensToParagraphText(paragraphIndex, paragraphText, tokens, documentOffset = 0) {
  const byId = Object.create(null);
  const ordered = [];
  if (!Array.isArray(tokens) || !tokens.length) {
    return { byId, ordered };
  }
  const safeParagraph = typeof paragraphText === "string" ? paragraphText : "";
  const searchableParagraph = normalizeParagraphWhitespace(safeParagraph);
  const textOccurrences = Object.create(null);
  const trimmedOccurrences = Object.create(null);
  let cursor = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenText = token?.text ?? "";
    const tokenId = token?.id ?? `tok${i + 1}`;
    const tokenLength = tokenText.length;
    const explicitStart = toBoundedOffset(token?.charStart, searchableParagraph.length);
    const explicitEnd = toBoundedOffset(token?.charEnd, searchableParagraph.length);
    let charStart = -1;
    let charEnd = -1;
    if (typeof explicitStart === "number" && explicitStart >= 0) {
      charStart = explicitStart;
      if (
        typeof explicitEnd === "number" &&
        explicitEnd > explicitStart &&
        explicitEnd <= searchableParagraph.length
      ) {
        charEnd = explicitEnd;
      } else if (tokenLength >= 0 && explicitStart + tokenLength <= searchableParagraph.length) {
        charEnd = explicitStart + tokenLength;
      }
    } else {
      charStart = resolveTokenPosition(searchableParagraph, tokenText, cursor);
      charEnd = charStart >= 0 ? charStart + tokenLength : -1;
    }

    if (charStart >= 0) {
      cursor = Math.max(cursor, charEnd >= 0 ? charEnd : charStart);
    }

    const textKey = tokenText || "";
    const trimmedKey = textKey.trim();
    const occurrence = textOccurrences[textKey] ?? 0;
    textOccurrences[textKey] = occurrence + 1;
    const trimmedOccurrence =
      trimmedKey && trimmedKey !== textKey ? (trimmedOccurrences[trimmedKey] ?? 0) : occurrence;
    if (trimmedKey && trimmedKey !== textKey) {
      trimmedOccurrences[trimmedKey] = trimmedOccurrence + 1;
    }

    const anchor = {
      paragraphIndex,
      tokenId,
      tokenIndex: i,
      tokenText,
      leadingBoundary: token?.leadingBoundary ?? "",
      trailingBoundary: token?.trailingBoundary ?? "",
      length: tokenLength,
      textOccurrence: occurrence,
      trimmedTextOccurrence: trimmedKey ? trimmedOccurrence : occurrence,
      charStart,
      charEnd,
      documentCharStart: charStart >= 0 ? documentOffset + charStart : -1,
      documentCharEnd: charEnd >= 0 ? documentOffset + charEnd : -1,
      matched: charStart >= 0,
      repeatKey: normalizeTokenRepeatKey(tokenText),
    };
    byId[tokenId] = anchor;
    ordered.push(anchor);
  }

  annotateRepeatKeyTotals(ordered);
  return { byId, ordered };
}

function pickTokenOffset(candidates) {
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

function toBoundedOffset(value, maxLength) {
  const numeric = pickTokenOffset([value]);
  if (!Number.isFinite(numeric)) return undefined;
  const upperBound = Number.isFinite(maxLength) ? Math.max(0, Math.floor(maxLength)) : 0;
  const floored = Math.floor(numeric);
  return Math.max(0, Math.min(floored, upperBound));
}

function annotateRepeatKeyTotals(list) {
  if (!Array.isArray(list) || !list.length) return;
  const totals = Object.create(null);
  const positions = Object.create(null);
  for (const anchor of list) {
    const key = anchor?.repeatKey;
    if (!key) continue;
    totals[key] = (totals[key] ?? 0) + 1;
    positions[key] = positions[key] || [];
    if (typeof anchor.charStart === "number" && anchor.charStart >= 0) {
      positions[key].push(anchor.charStart);
    }
  }
  const nearestGap = Object.create(null);
  for (const [key, coords] of Object.entries(positions)) {
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const sorted = coords.slice().sort((a, b) => a - b);
    const gaps = new Map();
    for (let i = 0; i < sorted.length; i++) {
      let gap = Infinity;
      if (i > 0) gap = Math.min(gap, sorted[i] - sorted[i - 1]);
      if (i < sorted.length - 1) gap = Math.min(gap, sorted[i + 1] - sorted[i]);
      gaps.set(sorted[i], gap);
    }
    nearestGap[key] = gaps;
  }
  for (const anchor of list) {
    if (!anchor) continue;
    const key = anchor.repeatKey;
    anchor.repeatKeyTotal = key ? totals[key] ?? 0 : 0;
    if (key && nearestGap[key] && typeof anchor.charStart === "number") {
      const gap = nearestGap[key].get(anchor.charStart);
      anchor.repeatKeyNearestGap = typeof gap === "number" ? gap : Infinity;
    } else {
      anchor.repeatKeyNearestGap = Infinity;
    }
  }
}

export function resolveTokenPosition(text, tokenText, fromIndex) {
  if (!tokenText || typeof text !== "string") return -1;
  const textLength = text.length;
  if (!textLength) return -1;
  let searchStart = fromIndex;
  if (searchStart < 0) searchStart = 0;
  if (searchStart > textLength) searchStart = textLength;

  let idx = text.indexOf(tokenText, searchStart);
  if (idx !== -1) return idx;

  const trimmed = tokenText.trim();
  if (trimmed && trimmed !== tokenText) {
    idx = text.indexOf(trimmed, searchStart);
    if (idx !== -1) return idx;
  }

  if (searchStart > 0) {
    const retryStart = Math.max(0, searchStart - tokenText.length - 1);
    idx = text.indexOf(tokenText, retryStart);
    if (idx !== -1) return idx;
  }
  return text.indexOf(tokenText);
}

export function findAnchorsNearChar(entry, type, charIndex) {
  const collection = type === "target" ? entry?.targetAnchors : entry?.sourceAnchors;
  if (!collection?.ordered?.length || typeof charIndex !== "number" || charIndex < 0) {
    return { before: null, at: null, after: null };
  }
  let before = null;
  for (let i = 0; i < collection.ordered.length; i++) {
    const anchor = collection.ordered[i];
    if (!anchor || anchor.charStart < 0) continue;
    const anchorEnd =
      typeof anchor.charEnd === "number"
        ? anchor.charEnd
        : anchor.charStart + Math.max(1, anchor.length ?? anchor.tokenText?.length ?? 1);
    // Treat token end as exclusive so boundary positions resolve to the previous token.
    if (charIndex >= anchor.charStart && charIndex < anchorEnd) {
      return {
        before: before ?? anchor,
        at: anchor,
        after: findNextAnchorWithPosition(collection.ordered, i + 1),
      };
    }
    if (anchor.charStart > charIndex) {
      return {
        before,
        at: null,
        after: anchor,
      };
    }
    before = anchor;
  }
  return { before, at: null, after: null };
}

function findNextAnchorWithPosition(list, startIndex) {
  if (!Array.isArray(list)) return null;
  for (let i = startIndex; i < list.length; i++) {
    const anchor = list[i];
    if (anchor && anchor.charStart >= 0) return anchor;
  }
  return null;
}

export function tokenizeForAnchoring(text = "", prefix = "syn") {
  if (typeof text !== "string" || !text.length) return [];
  const tokens = [];
  const isSkippableGapChar = (char) => /[\s\u200B-\u200D\uFEFF]/u.test(char || "");
  const isWordChar = (char) => /[\p{L}\p{N}]/u.test(char || "");
  const isInnerWordJoiner = (char) => /['\u2019`-]/u.test(char || "");
  // Define ONLY true quotation marks - NOT apostrophes which are inner word joiners
  // Include: straight double quotes ("), curly quotes (""), guillemets («»)
  // Exclude: apostrophes (') and right single quote (\u2019) which are word joiners
  const isQuoteChar = (char) => /["\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/u.test(char || "");
  let idx = 1;
  let cursor = 0;
  while (cursor < text.length) {
    while (cursor < text.length && isSkippableGapChar(text[cursor])) cursor++;
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

