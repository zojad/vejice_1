import { AnchorProvider } from "./AnchorProvider.js";
import {
  normalizeParagraphWhitespace,
  normalizeTokenRepeatKey,
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
    return {
      id: `${prefix}${index + 1}`,
      text: rawToken,
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
    return {
      id: typeof idCandidate === "string" ? idCandidate : `${prefix}${index + 1}`,
      text: typeof textCandidate === "string" ? textCandidate : "",
      trailingWhitespace: typeof trailing === "string" ? trailing : "",
      leadingWhitespace: typeof leading === "string" ? leading : "",
      raw: rawToken,
    };
  }
  return null;
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
    const charStart = resolveTokenPosition(searchableParagraph, tokenText, cursor);
    const charEnd = charStart >= 0 ? charStart + tokenLength : -1;

    if (charStart >= 0) {
      cursor = charEnd;
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
