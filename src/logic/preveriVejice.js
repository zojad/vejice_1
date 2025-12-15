/* global Word, window, process, performance, console, Office, URL */
import { popraviPoved, popraviPovedDetailed } from "../api/apiVejice.js";
import { isWordOnline } from "../utils/host.js";

/** ─────────────────────────────────────────────────────────
 *  DEBUG helpers (flip DEBUG=false to silence logs)
 *  ───────────────────────────────────────────────────────── */
const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const log = (...a) => DEBUG && console.log("[Vejice CHECK]", ...a);
const warn = (...a) => DEBUG && console.warn("[Vejice CHECK]", ...a);
const errL = (...a) => console.error("[Vejice CHECK]", ...a);
const tnow = () => performance?.now?.() ?? Date.now();
const SNIP = (s, n = 80) => (typeof s === "string" ? s.slice(0, n) : s);
const MAX_AUTOFIX_PASSES =
  typeof Office !== "undefined" && Office?.context?.platform === "PC" ? 3 : 2;

const HIGHLIGHT_INSERT = "#FFF9C4"; // light yellow
const HIGHLIGHT_DELETE = "#FFCDD2"; // light red
const SPACE_EQUIVALENTS_REGEX = /[\u00A0\u202F\u2007]/g;
const TRAILING_COMMA_REGEX = /[,\s]+$/;
const TOKEN_REPEAT_LEADING_REGEX = /^[\s"'“”„()«»]+/g;
const TOKEN_REPEAT_TRAILING_REGEX = /[\s,.;:!?'"“”„()«»]+$/g;
const REPEAT_SUPPRESSION_MAX_DISTANCE = 80;

function normalizeParagraphWhitespace(text) {
  if (typeof text !== "string" || !text.length) return typeof text === "string" ? text : "";
  return text.replace(SPACE_EQUIVALENTS_REGEX, " ");
}

function normalizeTokenRepeatKey(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(TOKEN_REPEAT_LEADING_REGEX, "")
    .replace(TOKEN_REPEAT_TRAILING_REGEX, "")
    .trim()
    .toLowerCase();
}

const pendingSuggestionsOnline = [];
const MAX_PARAGRAPH_CHARS = 3000; //???
const LONG_PARAGRAPH_MESSAGE =
  "Odstavek je predolg za preverjanje. Razdelite ga na krajše povedi in poskusite znova.";
const LONG_SENTENCE_MESSAGE =
  "Poved je predolga za preverjanje. Razdelite jo na krajše povedi in poskusite znova.";
const CHUNK_API_ERROR_MESSAGE =
  "Nekaterih povedi ni bilo mogoče preveriti zaradi napake strežnika. Ostale povedi so bile preverjene.";
const PARAGRAPH_NON_COMMA_MESSAGE =
  "API je spremenil več kot vejice. Preglejte odstavek.";
const TRACKED_CHANGES_PRESENT_MESSAGE =
  "Najprej sprejmite ali zavrnite obstoječe spremembe (Track Changes), nato ponovno zaženite preverjanje.";
const API_UNAVAILABLE_MESSAGE =
  "Storitev CJVT Vejice trenutno ni na voljo. Znova poskusite kasneje.";
let longSentenceNotified = false;
let chunkApiFailureNotified = false;
function resetPendingSuggestionsOnline() {
  pendingSuggestionsOnline.length = 0;
}
function addPendingSuggestionOnline(suggestion) {
  pendingSuggestionsOnline.push(suggestion);
}
export function getPendingSuggestionsOnline(debugSnapshot = false) {
  if (!debugSnapshot) return pendingSuggestionsOnline;
  return pendingSuggestionsOnline.map((sug) => ({
    id: sug?.id,
    kind: sug?.kind,
    paragraphIndex: sug?.paragraphIndex,
    metadata: sug?.metadata,
    originalPos: sug?.originalPos,
    leftWord: sug?.leftWord,
    leftSnippet: sug?.leftSnippet,
    rightSnippet: sug?.rightSnippet,
  }));
}

if (typeof window !== "undefined") {
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.__VEJICE_DEBUG_STATE__.getParagraphAnchorsOnline = () => paragraphTokenAnchorsOnline;
  window.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.getPendingSuggestionsSnapshot = () => getPendingSuggestionsOnline(true);
}

const paragraphsTouchedOnline = new Set();
function resetParagraphsTouchedOnline() {
  paragraphsTouchedOnline.clear();
}
function markParagraphTouched(paragraphIndex) {
  if (typeof paragraphIndex === "number" && paragraphIndex >= 0) {
    paragraphsTouchedOnline.add(paragraphIndex);
  }
}

let toastDialog = null;
function showToastNotification(message) {
  if (!message) return;
  if (typeof Office === "undefined" || !Office.context?.ui?.displayDialogAsync) {
    warn("Toast notification unavailable", message);
    return;
  }
  const origin =
    (typeof window !== "undefined" && window.location && window.location.origin) || null;
  if (!origin) {
    warn("Toast notification: origin unavailable");
    return;
  }
  const toastUrl = new URL("toast.html", origin);
  toastUrl.searchParams.set("message", message);
  Office.context.ui.displayDialogAsync(
    toastUrl.toString(),
    { height: 20, width: 30, displayInIframe: true },
    (asyncResult) => {
      if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
        warn("Toast notification failed", asyncResult.error);
        return;
      }
      if (toastDialog) {
        try {
          toastDialog.close();
        } catch (err) {
          warn("Toast notification: failed to close previous dialog", err);
        }
      }
      toastDialog = asyncResult.value;
      const closeDialog = () => {
        if (!toastDialog) return;
        try {
          toastDialog.close();
        } catch (err) {
          warn("Toast notification: failed to close dialog", err);
        } finally {
          toastDialog = null;
        }
      };
      toastDialog.addEventHandler(Office.EventType.DialogMessageReceived, closeDialog);
      toastDialog.addEventHandler(Office.EventType.DialogEventReceived, closeDialog);
    }
  );
}

function notifyParagraphTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_PARAGRAPH_MESSAGE} (${length} znakov).`;
  warn("Paragraph too long – skipped", { paragraphIndex, length });
  showToastNotification(msg);
}

function notifySentenceTooLong(paragraphIndex, length) {
  const label = paragraphIndex + 1;
  const msg = `Odstavek ${label}: ${LONG_SENTENCE_MESSAGE} (${length} znakov).`;
  warn("Sentence too long – skipped", { paragraphIndex, length });
  if (longSentenceNotified) return;
  longSentenceNotified = true;
  showToastNotification(msg);
}

function notifyChunkApiFailure(paragraphIndex, chunkIndex) {
  const paragraphLabel = paragraphIndex + 1;
  const chunkLabel = chunkIndex + 1;
  const msg = `Odstavek ${paragraphLabel}, poved ${chunkLabel}: ${CHUNK_API_ERROR_MESSAGE}`;
  warn("Sentence skipped due to API error", { paragraphIndex, chunkIndex });
  if (chunkApiFailureNotified) return;
  chunkApiFailureNotified = true;
  showToastNotification(msg);
}

function notifyChunkNonCommaChanges(paragraphIndex, chunkIndex, original, corrected) {
  const paragraphLabel = paragraphIndex + 1;
  const chunkLabel = chunkIndex + 1;
  const msg = `Odstavek ${paragraphLabel}, poved ${chunkLabel}: API je spremenil več kot vejice. Preglejte poved ročno.`;
  warn("Sentence skipped due to non-comma changes", { paragraphIndex, chunkIndex, original, corrected });
  showToastNotification(msg);
}

function notifyParagraphNonCommaChanges(paragraphIndex, original, corrected) {
  const label = paragraphIndex + 1;
  warn("Paragraph skipped due to non-comma changes", { paragraphIndex, original, corrected });
  showToastNotification(`Odstavek ${label}: ${PARAGRAPH_NON_COMMA_MESSAGE}`);
}

function notifyTrackedChangesPresent() {
  warn("Tracked changes present – aborting check");
  showToastNotification(TRACKED_CHANGES_PRESENT_MESSAGE);
}

let apiFailureNotified = false;
function notifyApiUnavailable() {
  if (apiFailureNotified) return;
  apiFailureNotified = true;
  warn("API unavailable – notifying toast");
  showToastNotification(API_UNAVAILABLE_MESSAGE);
}

function resetNotificationFlags() {
  apiFailureNotified = false;
  longSentenceNotified = false;
  chunkApiFailureNotified = false;
}

async function documentHasTrackedChanges(context) {
  if (!context?.document) return false;
  if (isWordOnline()) {
    // Word Online does not expose revisions; assume no tracked changes to avoid ApiNotFound.
    return false;
  }
  const revisions = context.document.revisions;
  if (!revisions || typeof revisions.load !== "function") {
    return false;
  }
  try {
    revisions.load("items");
    await context.sync();
    return revisions.items.length > 0;
  } catch (err) {
    if (err?.code === "ApiNotFound") {
      warn("Revisions API unavailable on this host – skipping tracked changes guard");
      return false;
    }
    throw err;
  }
}

const paragraphTokenAnchorsOnline = [];
function resetParagraphTokenAnchorsOnline() {
  paragraphTokenAnchorsOnline.length = 0;
}
function setParagraphTokenAnchorsOnline(paragraphIndex, anchors) {
  paragraphTokenAnchorsOnline[paragraphIndex] = anchors;
}
function getParagraphTokenAnchorsOnline(paragraphIndex) {
  return paragraphTokenAnchorsOnline[paragraphIndex];
}

function createParagraphTokenAnchors({
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
  setParagraphTokenAnchorsOnline(paragraphIndex, entry);
  return entry;
}

function normalizeTokenList(tokens, prefix) {
  if (!Array.isArray(tokens)) return [];
  const normalized = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = normalizeToken(tokens[i], prefix, i);
    if (token) normalized.push(token);
  }
  return normalized;
}

function normalizeToken(rawToken, prefix, index) {
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

function mapTokensToParagraphText(paragraphIndex, paragraphText, tokens, documentOffset = 0) {
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
    } else if (tokenText) {
      warn("Token mapping failed", { paragraphIndex, tokenId, tokenText, cursor });
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

function resolveTokenPosition(text, tokenText, fromIndex) {
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

function selectTokenAnchors(entry, type) {
  if (!entry) return null;
  return type === "target" ? entry.targetAnchors : entry.sourceAnchors;
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

function findAnchorsNearChar(entry, type, charIndex) {
  const collection = selectTokenAnchors(entry, type);
  if (!collection?.ordered?.length || typeof charIndex !== "number" || charIndex < 0) {
    return { before: null, at: null, after: null };
  }
  let before = null;
  for (let i = 0; i < collection.ordered.length; i++) {
    const anchor = collection.ordered[i];
    if (!anchor || anchor.charStart < 0) continue;
    if (charIndex >= anchor.charStart && charIndex <= anchor.charEnd) {
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

function countSnippetOccurrencesBefore(text, snippet, limit) {
  if (!snippet) return 0;
  const safeText = typeof text === "string" ? text : "";
  const hop = Math.max(1, snippet.length);
  let count = 0;
  let idx = safeText.indexOf(snippet);
  while (idx !== -1 && idx < limit) {
    count++;
    idx = safeText.indexOf(snippet, idx + hop);
  }
  return count;
}

async function getRangeForCharacterSpan(
  context,
  paragraph,
  paragraphText,
  charStart,
  charEnd,
  reason = "span",
  fallbackSnippet
) {
  if (!paragraph || typeof paragraph.getRange !== "function") return null;
  if (!Number.isFinite(charStart) || charStart < 0) return null;
  const text = typeof paragraphText === "string" ? paragraphText : paragraph.text || "";
  if (!text) return null;
  const safeStart = Math.max(0, Math.min(Math.floor(charStart), text.length ? text.length - 1 : 0));
  const computedEnd = Math.max(safeStart + 1, Math.floor(charEnd ?? safeStart + 1));
  const safeEnd = Math.min(computedEnd, text.length);
  let snippet = text.slice(safeStart, safeEnd);
  if (!snippet && typeof fallbackSnippet === "string" && fallbackSnippet.length) {
    snippet = fallbackSnippet;
  }
  if (!snippet) return null;

  try {
    let searchSnippet = snippet;
    let matches = await searchParagraphForSnippet(context, paragraph, searchSnippet);
    if ((!matches?.items?.length) && snippet.trim() && snippet.trim() !== snippet) {
      searchSnippet = snippet.trim();
      matches = await searchParagraphForSnippet(context, paragraph, searchSnippet);
    }
    if (!matches?.items?.length) {
      warn(`getRangeForCharacterSpan(${reason}): snippet not found`, { snippet, safeStart });
      return null;
    }
    const occurrence = countSnippetOccurrencesBefore(text, snippet, safeStart);
    const idx = Math.min(occurrence, matches.items.length - 1);
    return matches.items[idx];
  } catch (err) {
    warn(`getRangeForCharacterSpan(${reason}) failed`, err);
  }
  return null;
}

async function searchParagraphForSnippet(context, paragraph, snippet) {
  const range = paragraph.getRange();
  const matches = range.search(snippet, {
    matchCase: true,
    matchWholeWord: false,
    ignoreSpace: false,
    ignorePunct: false,
  });
  matches.load("items");
  await context.sync();
  return matches;
}

function buildDeleteSuggestionMetadata(entry, charIndex) {
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
  const highlightCharEnd = highlightAnchor?.charEnd ?? srcIndex;
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

function buildDeleteRangeCandidates(meta) {
  const ranges = [];
  if (!meta) return ranges;
  const addRange = (start, end, snippet) => {
    if (!Number.isFinite(start) || start < 0) return;
    const safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({ start, end: safeEnd, snippet });
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  if (meta.highlightAnchorTarget) {
    addRange(
      meta.highlightAnchorTarget.charStart,
      meta.highlightAnchorTarget.charEnd,
      meta.highlightAnchorTarget.tokenText
    );
  }
  return ranges;
}

function buildInsertRangeCandidates(meta) {
  const ranges = [];
  if (!meta) return ranges;
  const addRange = (start, end, snippet) => {
    if (!Number.isFinite(start) || start < 0) return;
    const safeEnd = Number.isFinite(end) && end > start ? end : start + 1;
    ranges.push({ start, end: safeEnd, snippet });
  };
  const addAnchor = (anchor) => {
    if (!anchor) return;
    addRange(anchor.charStart, anchor.charEnd, anchor.tokenText);
  };
  addRange(meta.highlightCharStart, meta.highlightCharEnd, meta.highlightText);
  addRange(meta.targetCharStart, meta.targetCharEnd, meta.highlightText);
  addRange(meta.charStart, meta.charEnd, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.targetTokenBefore);
  return ranges;
}

/** ─────────────────────────────────────────────────────────
 *  Helpers: znaki & pravila
 *  ───────────────────────────────────────────────────────── */
const QUOTES = new Set(['"', "'", "“", "”", "„", "«", "»"]);
const isDigit = (ch) => ch >= "0" && ch <= "9";
const charAtSafe = (s, i) => (i >= 0 && i < s.length ? s[i] : "");

/** Številčni vejici (decimalna ali tisočiška) */
function isNumericComma(original, corrected, kind, pos) {
  const s = kind === "delete" ? original : corrected;
  const prev = charAtSafe(s, pos - 1);
  const next = charAtSafe(s, pos + 1);
  return isDigit(prev) && isDigit(next);
}

/**
 * Guard: ali so se spremenile samo vejice (in presledki okoli njih).
 * Nekateri API odzivi spreminjajo razmike, zato jih ignoriramo, da ne
 * preskočimo veljavnih predlogov.
 */
function normalizeForComparison(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "");
}

function onlyCommasChanged(original, corrected) {
  return normalizeForComparison(original) === normalizeForComparison(corrected);
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

function createCorrectionTracking() {
  return {
    tokenIds: new Set(),
    unmatchedTokenIds: new Set(),
    intents: [],
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

function operationKey(op) {
  const idx = typeof op?.originalPos === "number" ? op.originalPos : op?.pos;
  return `${op?.kind ?? "op"}-${idx}`;
}

/** Minimalni diff: samo operacije z vejicami */
function diffCommasOnly(original, corrected) {
  const ops = [];
  let i = 0,
    j = 0;
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

/** Filtriraj operacije (izloči številčne vejice, dodaj presledek kasneje, če treba) */
function filterCommaOps(original, corrected, ops) {
  return ops.filter((op) => {
    if (isNumericComma(original, corrected, op.kind, op.pos)) return false;
    if (op.kind === "insert") {
      const next = charAtSafe(corrected, op.pos + 1);
      const noSpaceAfter = next && !/\s/.test(next);
      if (noSpaceAfter && !QUOTES.has(next)) {
        // dovolimo; presledek dodamo naknadno
        return true;
      }
    }
    return true;
  });
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

function filterDiffOpsForRepeatedTokens(ops, anchorsEntry) {
  if (!Array.isArray(ops) || !ops.length) return ops;
  return ops.filter((op) => !shouldSuppressDueToRepeatedToken(anchorsEntry, op));
}

function findAnchorForDiffOp(anchorsEntry, op) {
  if (!anchorsEntry || !op) return null;
  const isDelete = op.kind === "delete";
  const charIndex = isDelete ? op.originalPos ?? op.pos : op.correctedPos ?? op.pos;
  if (typeof charIndex !== "number" || charIndex < 0) return null;
  const around = findAnchorsNearChar(anchorsEntry, isDelete ? "source" : "target", charIndex);
  return around?.at ?? null;
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
  if (gap > REPEAT_SUPPRESSION_MAX_DISTANCE) return false;
  return true;
}

/** Anchor-based mikro urejanje (ohrani formatiranje) */
function makeAnchor(text, idx, span = 16) {
  const left = text.slice(Math.max(0, idx - span), idx);
  const right = text.slice(idx, Math.min(text.length, idx + span));
  return { left, right };
}

// Vstavi vejico na podlagi sidra
async function insertCommaAt(context, paragraph, original, corrected, atCorrectedPos) {
  const { left, right } = makeAnchor(corrected, atCorrectedPos);
  const pr = paragraph.getRange();

  if (left.length > 0) {
    const m = pr.search(left, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("insert: left anchor not found");
      return;
    }
    const after = m.items[0].getRange("After");
    after.insertText(",", Word.InsertLocation.before);
  } else {
    if (!right) {
      warn("insert: no right anchor at paragraph start");
      return;
    }
    const m = pr.search(right, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("insert: right anchor not found");
      return;
    }
    const before = m.items[0].getRange("Before");
    before.insertText(",", Word.InsertLocation.before);
  }
}

// Po potrebi dodaj presledek po vejici (razen pred narekovaji ali števkami)
async function ensureSpaceAfterComma(context, paragraph, corrected, atCorrectedPos) {
  const next = charAtSafe(corrected, atCorrectedPos + 1);
  if (!next || /\s/.test(next) || QUOTES.has(next) || isDigit(next)) return;

  const { left, right } = makeAnchor(corrected, atCorrectedPos + 1);
  const pr = paragraph.getRange();

  if (left.length > 0) {
    const m = pr.search(left, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("space-after: left anchor not found");
      return;
    }
    const beforeRight = m.items[0].getRange("Before");
    beforeRight.insertText(" ", Word.InsertLocation.before);
  } else if (right.length > 0) {
    const m = pr.search(right, { matchCase: false, matchWholeWord: false });
    m.load("items");
    await context.sync();
    if (!m.items.length) {
      warn("space-after: right anchor not found");
      return;
    }
    const before = m.items[0].getRange("Before");
    before.insertText(" ", Word.InsertLocation.before);
  }
}

// Briši samo znak vejice
async function deleteCommaAt(context, paragraph, original, atOriginalPos) {
  const pr = paragraph.getRange();
  let ordinal = 0;
  for (let i = 0; i <= atOriginalPos && i < original.length; i++) {
    if (original[i] === ",") ordinal++;
  }
  if (ordinal === 0) {
    warn("delete: no comma found in original at pos", atOriginalPos);
    return;
  }
  const matches = pr.search(",", { matchCase: false, matchWholeWord: false });
  matches.load("items");
  await context.sync();
  const idx = ordinal - 1;
  if (idx >= matches.items.length) {
    warn("delete: comma ordinal out of range", ordinal, "/", matches.items.length);
    return;
  }
  matches.items[idx].insertText("", Word.InsertLocation.replace);
}

function createSuggestionId(kind, paragraphIndex, pos) {
  return `${kind}-${paragraphIndex}-${pos}-${pendingSuggestionsOnline.length}`;
}

async function highlightSuggestionOnline(
  context,
  paragraph,
  original,
  corrected,
  op,
  paragraphIndex,
  paragraphAnchors
) {
  if (op.kind === "delete") {
    return highlightDeleteSuggestion(
      context,
      paragraph,
      original,
      op,
      paragraphIndex,
      paragraphAnchors
    );
  }
  return highlightInsertSuggestion(
    context,
    paragraph,
    corrected,
    op,
    paragraphIndex,
    paragraphAnchors
  );
}

function countCommasUpTo(text, pos) {
  let count = 0;
  for (let i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}

async function highlightDeleteSuggestion(
  context,
  paragraph,
  original,
  op,
  paragraphIndex,
  anchorsEntry
) {
  const metadata = buildDeleteSuggestionMetadata(anchorsEntry, op.originalPos ?? op.pos);
  let targetRange = await getRangeForCharacterSpan(
    context,
    paragraph,
    original,
    metadata.charStart,
    metadata.charEnd,
    "highlight-delete",
    metadata.highlightText
  );

  if (!targetRange) {
    targetRange = await findCommaRangeByOrdinal(context, paragraph, original, op);
    if (!targetRange) return false;
  }

  targetRange.font.highlightColor = HIGHLIGHT_DELETE;
  context.trackedObjects.add(targetRange);
  addPendingSuggestionOnline({
    id: createSuggestionId("del", paragraphIndex, op.pos),
    kind: "delete",
    paragraphIndex,
    originalPos: op.pos,
    highlightRange: targetRange,
    metadata,
  });
  markParagraphTouched(paragraphIndex);
  return true;
}

async function highlightInsertSuggestion(
  context,
  paragraph,
  corrected,
  op,
  paragraphIndex,
  anchorsEntry
) {
  const metadata = buildInsertSuggestionMetadata(anchorsEntry, {
    originalCharIndex: op.originalPos ?? op.pos,
    targetCharIndex: op.correctedPos ?? op.pos,
  });

  const anchor = makeAnchor(corrected, op.pos);
  const rawLeft = anchor.left || "";
  const rawRight = anchor.right || corrected.slice(op.pos, op.pos + 24);
  const leftSnippetStored = rawLeft.slice(-40);
  const rightSnippetStored = rawRight.slice(0, 40);

  const lastWord = extractLastWord(rawLeft);
  let leftContext = rawLeft.slice(-20).replace(/[\r\n]+/g, " ");
  const searchOpts = { matchCase: false, matchWholeWord: false };
  let range = null;

  if (metadata.highlightCharStart >= 0) {
    const metaEnd =
      metadata.highlightCharEnd > metadata.highlightCharStart
        ? metadata.highlightCharEnd
        : metadata.highlightCharStart + 1;
    range = await getRangeForCharacterSpan(
      context,
      paragraph,
      anchorsEntry?.originalText ?? paragraph.text ?? corrected,
      metadata.highlightCharStart,
      metaEnd,
      "highlight-insert-meta",
      metadata.highlightText
    );
  }

  if (!range && lastWord) {
    const wordSearch = paragraph.getRange().search(lastWord, {
      matchCase: false,
      matchWholeWord: true,
    });
    wordSearch.load("items");
    await context.sync();
    if (wordSearch.items.length) {
      range = wordSearch.items[wordSearch.items.length - 1];
    }
  }

  if (!range && leftContext.trim()) {
    const leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightSnippet = rightSnippetStored.replace(/,/g, "").trim();
    rightSnippet = rightSnippet.slice(0, 8);
    if (rightSnippet) {
      const rightSearch = paragraph.getRange().search(rightSnippet, searchOpts);
      rightSearch.load("items");
      await context.sync();
      if (rightSearch.items.length) {
        range = rightSearch.items[0];
      }
    }
  }

  if (!range) return false;

  try {
    range = range.getRange("Content");
  } catch (err) {
    warn("highlight insert: failed to focus range", err);
  }

  range.font.highlightColor = HIGHLIGHT_INSERT;
  context.trackedObjects.add(range);
  addPendingSuggestionOnline({
    id: createSuggestionId("ins", paragraphIndex, op.pos),
    kind: "insert",
    paragraphIndex,
    leftWord: lastWord,
    leftSnippet: leftSnippetStored,
    rightSnippet: rightSnippetStored,
    highlightRange: range,
    metadata,
  });
  markParagraphTouched(paragraphIndex);
  return true;
}

async function findCommaRangeByOrdinal(context, paragraph, original, op) {
  const ordinal = countCommasUpTo(original, op.pos);
  if (ordinal <= 0) {
    warn("highlight delete: no comma ordinal", op);
    return null;
  }
  const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
  commaSearch.load("items");
  await context.sync();
  if (!commaSearch.items.length || ordinal > commaSearch.items.length) {
    warn("highlight delete: comma search out of range");
    return null;
  }
  return commaSearch.items[ordinal - 1];
}

function extractLastWord(text) {
  const match = text.match(/([\p{L}\d]+)[^\p{L}\d]*$/u);
  return match ? match[1] : "";
}

async function tryApplyDeleteUsingMetadata(context, paragraph, suggestion) {
  const meta = suggestion?.metadata;
  if (!meta) return false;
  const entry = getParagraphTokenAnchorsOnline(suggestion.paragraphIndex);

  if (Number.isFinite(meta.charStart) && meta.charStart >= 0) {
    const range = await getRangeForCharacterSpan(
      context,
      paragraph,
      entry?.originalText ?? paragraph.text,
      meta.charStart,
      Number.isFinite(meta.charEnd) && meta.charEnd > meta.charStart
        ? meta.charEnd
        : meta.charStart + 1,
      "apply-delete-char",
      meta.highlightText
    );
    if (range) {
      range.insertText("", Word.InsertLocation.replace);
      return true;
    }
  }

  const commaAnchor =
    (meta.sourceTokenAt?.tokenText?.includes(",") && meta.sourceTokenAt) ||
    (meta.sourceTokenAfter?.tokenText?.includes(",") && meta.sourceTokenAfter) ||
    (meta.sourceTokenBefore?.tokenText?.includes(",") && meta.sourceTokenBefore);
  if (commaAnchor) {
    const tokenRange = await findTokenRangeForAnchor(context, paragraph, commaAnchor);
    if (tokenRange) {
      tokenRange.load("text");
      await context.sync();
      const text = tokenRange.text || "";
      const commaIndex = text.indexOf(",");
      if (commaIndex >= 0) {
        const newText = text.slice(0, commaIndex) + text.slice(commaIndex + 1);
        tokenRange.insertText(newText, Word.InsertLocation.replace);
        return true;
      }
      const commaSearch = tokenRange.search(",", { matchCase: false, matchWholeWord: false });
      commaSearch.load("items");
      await context.sync();
      if (commaSearch.items.length) {
        commaSearch.items[0].insertText("", Word.InsertLocation.replace);
        return true;
      }
    }
  }

  return false;
}

async function tryApplyDeleteUsingHighlight(context, paragraph, suggestion) {
  const meta = suggestion?.metadata;
  const entry = getParagraphTokenAnchorsOnline(suggestion?.paragraphIndex);
  const paragraphText = entry?.originalText ?? paragraph?.text ?? "";
  const tryByRange = async (range) => {
    if (!range) return false;
    try {
      range.insertText("", Word.InsertLocation.replace);
      return true;
    } catch (err) {
      warn("apply delete: highlight span removal failed", err);
      return false;
    }
  };

  if (suggestion?.highlightRange) {
    if (await tryByRange(suggestion.highlightRange)) {
      return true;
    }
  }

  const candidates = buildDeleteRangeCandidates(meta);
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!Number.isFinite(candidate.start) || candidate.start < 0) {
      continue;
    }
    const safeEnd =
      Number.isFinite(candidate.end) && candidate.end > candidate.start
        ? candidate.end
        : candidate.start + 1;
    const span = await getRangeForCharacterSpan(
      context,
      paragraph,
      paragraphText,
      candidate.start,
      safeEnd,
      `apply-delete-highlight-${i}`,
      candidate.snippet
    );
    if (await tryByRange(span)) {
      return true;
    }
  }

  return false;
}

async function applyDeleteSuggestionLegacy(context, paragraph, suggestion) {
  const ordinal = countCommasUpTo(paragraph.text || "", suggestion.originalPos);
  if (ordinal <= 0) {
    warn("apply delete: no ordinal");
    return;
  }
  const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
  commaSearch.load("items");
  await context.sync();
  const idx = ordinal - 1;
  if (!commaSearch.items.length || idx >= commaSearch.items.length) {
    warn("apply delete: ordinal out of range");
    return;
  }
  commaSearch.items[idx].insertText("", Word.InsertLocation.replace);
}

async function applyDeleteSuggestion(context, paragraph, suggestion) {
  if (await tryApplyDeleteUsingHighlight(context, paragraph, suggestion)) return;
  if (await tryApplyDeleteUsingMetadata(context, paragraph, suggestion)) return;
  await applyDeleteSuggestionLegacy(context, paragraph, suggestion);
}

async function findTokenRangeForAnchor(context, paragraph, anchorSnapshot) {
  if (!anchorSnapshot?.tokenText) return null;
  const fallbackOrdinal =
    typeof anchorSnapshot.textOccurrence === "number"
      ? anchorSnapshot.textOccurrence
      : typeof anchorSnapshot.tokenIndex === "number"
        ? anchorSnapshot.tokenIndex
        : 0;
  const tryFind = async (text, ordinalHint) => {
    if (!text) return null;
    const matches = paragraph.getRange().search(text, {
      matchCase: false,
      matchWholeWord: false,
    });
    matches.load("items");
    await context.sync();
    if (!matches.items.length) return null;
    const ordinal =
      typeof ordinalHint === "number"
        ? ordinalHint
        : typeof anchorSnapshot.tokenIndex === "number"
          ? anchorSnapshot.tokenIndex
          : fallbackOrdinal;
    const targetIndex = Math.max(0, Math.min(ordinal, matches.items.length - 1));
    return matches.items[targetIndex];
  };

  let range = await tryFind(anchorSnapshot.tokenText, anchorSnapshot.textOccurrence);
  if (range) return range;
  const trimmed = anchorSnapshot.tokenText.trim();
  if (trimmed && trimmed !== anchorSnapshot.tokenText) {
    range = await tryFind(trimmed, anchorSnapshot.trimmedTextOccurrence);
    if (range) return range;
  }
  return null;
}

function selectInsertAnchor(meta) {
  if (!meta) return null;
  const candidates = [
    meta.sourceTokenAfter
      ? { anchor: meta.sourceTokenAfter, location: Word.InsertLocation.before }
      : null,
    meta.sourceTokenAt ? { anchor: meta.sourceTokenAt, location: Word.InsertLocation.after } : null,
    meta.sourceTokenBefore
      ? { anchor: meta.sourceTokenBefore, location: Word.InsertLocation.after }
      : null,
    meta.targetTokenBefore
      ? { anchor: meta.targetTokenBefore, location: Word.InsertLocation.before }
      : null,
    meta.targetTokenAt ? { anchor: meta.targetTokenAt, location: Word.InsertLocation.after } : null,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (
      candidate?.anchor?.matched &&
      Number.isFinite(candidate.anchor.charStart) &&
      candidate.anchor.charStart >= 0
    ) {
      return candidate;
    }
  }
  return null;
}

async function tryApplyInsertUsingMetadata(context, paragraph, suggestion) {
  const meta = suggestion?.metadata;
  if (!meta) return false;
  const anchorInfo = selectInsertAnchor(meta);
  if (!anchorInfo) return false;
  const entry = getParagraphTokenAnchorsOnline(suggestion.paragraphIndex);
  const range = await getRangeForCharacterSpan(
    context,
    paragraph,
    entry?.originalText ?? paragraph.text,
    anchorInfo.anchor.charStart,
    anchorInfo.anchor.charEnd,
    "apply-insert-anchor",
    anchorInfo.anchor.tokenText || meta.highlightText
  );
  if (!range) return false;
  try {
    if (anchorInfo.location === Word.InsertLocation.before) {
      range.insertText(",", Word.InsertLocation.before);
    } else {
      range.getRange("After").insertText(",", Word.InsertLocation.before);
    }
  } catch (err) {
    warn("apply insert metadata: failed to insert via anchor", err);
    return false;
  }
  return true;
}

async function tryApplyInsertUsingHighlight(context, paragraph, suggestion) {
  const meta = suggestion?.metadata;
  const entry = getParagraphTokenAnchorsOnline(suggestion?.paragraphIndex);
  const paragraphText = entry?.originalText ?? paragraph?.text ?? "";
  const useRange = async (range) => {
    if (!range) return false;
    try {
      const insertionPoint = range.getRange("After");
      insertionPoint.insertText(",", Word.InsertLocation.before);
      return true;
    } catch (err) {
      warn("apply insert highlight: failed to reuse range", err);
      return false;
    }
  };

  if (suggestion?.highlightRange) {
    if (await useRange(suggestion.highlightRange)) {
      return true;
    }
  }

  const candidates = buildInsertRangeCandidates(meta);
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!Number.isFinite(candidate.start) || candidate.start < 0) continue;
    const safeEnd =
      Number.isFinite(candidate.end) && candidate.end > candidate.start
        ? candidate.end
        : candidate.start + 1;
    const span = await getRangeForCharacterSpan(
      context,
      paragraph,
      paragraphText,
      candidate.start,
      safeEnd,
      `apply-insert-highlight-${i}`,
      candidate.snippet
    );
    if (await useRange(span)) {
      return true;
    }
  }

  return false;
}

async function applyInsertSuggestionLegacy(context, paragraph, suggestion) {
  const range = await findRangeForInsert(context, paragraph, suggestion);
  if (!range) {
    warn("apply insert: unable to locate range");
    return;
  }
  const after = range.getRange("After");
  after.insertText(",", Word.InsertLocation.before);
}

async function applyInsertSuggestion(context, paragraph, suggestion) {
  if (await tryApplyInsertUsingHighlight(context, paragraph, suggestion)) return;
  if (await tryApplyInsertUsingMetadata(context, paragraph, suggestion)) return;
  await applyInsertSuggestionLegacy(context, paragraph, suggestion);
}

async function normalizeCommaSpacingInParagraph(context, paragraph) {
  paragraph.load("text");
  await context.sync();
  const text = paragraph.text || "";
  if (!text.includes(",")) return;

  for (let idx = text.length - 1; idx >= 0; idx--) {
    if (text[idx] !== ",") continue;
    if (idx > 0 && /\s/.test(text[idx - 1])) {
      const toTrim = await getRangeForCharacterSpan(
        context,
        paragraph,
        text,
        idx - 1,
        idx,
        "trim-space-before-comma",
        " "
      );
      if (toTrim) {
        toTrim.insertText("", Word.InsertLocation.replace);
      }
    }

    const nextChar = text[idx + 1] ?? "";
    if (!nextChar) continue;
    if (!/\s/.test(nextChar) && !QUOTES.has(nextChar) && !isDigit(nextChar)) {
      const afterRange = await getRangeForCharacterSpan(
        context,
        paragraph,
        text,
        idx + 1,
        idx + 2,
        "space-after-comma",
        nextChar
      );
      if (afterRange) {
        afterRange.insertText(" ", Word.InsertLocation.before);
      }
    }
  }
}

async function cleanupCommaSpacingForParagraphs(context, paragraphs, indexes) {
  if (!indexes?.size) return;
  for (const idx of indexes) {
    const paragraph = paragraphs.items[idx];
    if (!paragraph) continue;
    try {
      await normalizeCommaSpacingInParagraph(context, paragraph);
    } catch (err) {
      warn("Failed to normalize comma spacing", err);
    }
  }
}

async function findRangeForInsert(context, paragraph, suggestion) {
  const searchOpts = { matchCase: false, matchWholeWord: false };
  let range = null;

  if (suggestion.leftWord) {
    const wordSearch = paragraph.getRange().search(suggestion.leftWord, {
      matchCase: false,
      matchWholeWord: true,
    });
    wordSearch.load("items");
    await context.sync();
    if (wordSearch.items.length) {
      range = wordSearch.items[wordSearch.items.length - 1];
    }
  }

  let leftFrag = (suggestion.leftSnippet || "").slice(-20).replace(/[\r\n]+/g, " ");

  if (!range && leftFrag.trim()) {
    const leftSearch = paragraph.getRange().search(leftFrag.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightFrag = (suggestion.rightSnippet || "").replace(/,/g, "").trim();
    rightFrag = rightFrag.slice(0, 8);
    if (rightFrag) {
      const rightSearch = paragraph.getRange().search(rightFrag, searchOpts);
      rightSearch.load("items");
      await context.sync();
      if (rightSearch.items.length) {
        range = rightSearch.items[0];
      }
    }
  }

  return range;
}

async function clearHighlightForSuggestion(context, paragraph, suggestion) {
  if (!suggestion) return;
  if (suggestion.highlightRange) {
    try {
      suggestion.highlightRange.font.highlightColor = null;
      context.trackedObjects.remove(suggestion.highlightRange);
    } catch (err) {
      warn("clearHighlightForSuggestion: failed via highlightRange", err);
    } finally {
      suggestion.highlightRange = null;
    }
    return;
  }
  const meta = suggestion.metadata;
  if (!meta) return;
  const entry = paragraphTokenAnchorsOnline[suggestion.paragraphIndex];
  const paragraphText = entry?.originalText ?? paragraph?.text ?? "";
  const charStart =
    typeof meta.highlightCharStart === "number" ? meta.highlightCharStart : meta.charStart;
  const charEnd = typeof meta.highlightCharEnd === "number" ? meta.highlightCharEnd : meta.charEnd;
  if (!paragraph || !paragraphText || !Number.isFinite(charStart)) return;
  const range = await getRangeForCharacterSpan(
    context,
    paragraph,
    paragraphText,
    charStart,
    charEnd,
    "clear-highlight",
    meta.highlightText || meta.highlightAnchorTarget?.tokenText
  );
  if (range) {
    range.font.highlightColor = null;
  }
}
async function clearOnlineSuggestionMarkers(context, suggestionsOverride, paragraphs) {
  const source =
    Array.isArray(suggestionsOverride) && suggestionsOverride.length
      ? suggestionsOverride
      : pendingSuggestionsOnline;
  const clearHighlight = (sug) => {
    if (!sug?.highlightRange) return;
    try {
      sug.highlightRange.font.highlightColor = null;
      context.trackedObjects.remove(sug.highlightRange);
    } catch (err) {
      warn("Failed to clear highlight", err);
    } finally {
      sug.highlightRange = null;
    }
  };

  if (!source.length) {
    context.document.body.font.highlightColor = null;
    await context.sync();
    return;
  }
  for (const item of source) {
    const suggestion = item?.suggestion ?? item;
    if (!suggestion) continue;
    const paragraph = item?.paragraph ?? paragraphs?.items?.[suggestion.paragraphIndex];
    if (paragraph) {
      await clearHighlightForSuggestion(context, paragraph, suggestion);
    } else {
      clearHighlight(suggestion);
    }
  }
  await context.sync();
  if (!suggestionsOverride) {
    resetPendingSuggestionsOnline();
  }
}

export async function applyAllSuggestionsOnline() {
  if (!pendingSuggestionsOnline.length) return;
  await Word.run(async (context) => {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    const touchedIndexes = new Set(paragraphsTouchedOnline);
    const processedSuggestions = [];

    const sortable = (sug) => {
      if (!sug) return -1;
      if (Number.isFinite(sug.originalPos)) return sug.originalPos;
      if (Number.isFinite(sug.metadata?.originalPos)) return sug.metadata.originalPos;
      if (Number.isFinite(sug.metadata?.charStart)) return sug.metadata.charStart;
      if (Number.isFinite(sug.metadata?.targetCharStart)) return sug.metadata.targetCharStart;
      if (Number.isFinite(sug.metadata?.highlightCharStart)) return sug.metadata.highlightCharStart;
      return -1;
    };
    const suggestionsToApply = pendingSuggestionsOnline
      .slice()
      .sort((a, b) => {
        if ((a?.paragraphIndex ?? 0) !== (b?.paragraphIndex ?? 0)) {
          return (a?.paragraphIndex ?? 0) - (b?.paragraphIndex ?? 0);
        }
        return (sortable(b) ?? -1) - (sortable(a) ?? -1);
      });

    for (const sug of suggestionsToApply) {
      const p = paras.items[sug.paragraphIndex];
      if (!p) continue;
      try {
        if (sug.kind === "delete") {
          await applyDeleteSuggestion(context, p, sug);
        } else {
          await applyInsertSuggestion(context, p, sug);
        }
        p.load("text");
        // Keep paragraph.text up-to-date for subsequent metadata lookups.
        // eslint-disable-next-line office-addins/no-context-sync-in-loop
        await context.sync();
        processedSuggestions.push({ suggestion: sug, paragraph: p });
      } catch (err) {
        warn("applyAllSuggestionsOnline: failed to apply suggestion", err);
      }
    }
    await context.sync();
    await clearOnlineSuggestionMarkers(context, processedSuggestions);
    await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes);
    resetParagraphsTouchedOnline();
    resetParagraphTokenAnchorsOnline();
    resetPendingSuggestionsOnline();
    context.document.body.font.highlightColor = null;
    await context.sync();
  });
}

export async function rejectAllSuggestionsOnline() {
  await Word.run(async (context) => {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    await clearOnlineSuggestionMarkers(context, null, paras);
    context.document.body.font.highlightColor = null;
    await context.sync();
  });
}
/** ─────────────────────────────────────────────────────────
 *  MAIN: Preveri vejice – celoten dokument, po odstavkih
 *  ───────────────────────────────────────────────────────── */
export async function checkDocumentText() {
  resetNotificationFlags();
  if (isWordOnline()) {
    return checkDocumentTextOnline();
  }
  return checkDocumentTextDesktop();
}

async function checkDocumentTextDesktop() {
  log("START checkDocumentText()");
  let totalInserted = 0;
  let totalDeleted = 0;
  let paragraphsProcessed = 0;
  let apiErrors = 0;

  try {
    await Word.run(async (context) => {
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        return;
      }
      // naloži in začasno vključi sledenje spremembam
      const doc = context.document;
      let trackToggleSupported = false;
      let prevTrack = false;
      try {
        doc.load("trackRevisions");
        await context.sync();
        prevTrack = doc.trackRevisions;
        doc.trackRevisions = true;
        trackToggleSupported = true;
        log("TrackRevisions:", prevTrack, "-> true");
      } catch (trackErr) {
        warn("trackRevisions not available -> skip toggling", trackErr);
      }

      try {
        // pridobi odstavke
        const paras = context.document.body.paragraphs;
        paras.load("items/text");
        await context.sync();
        log("Paragraphs found:", paras.items.length);

        for (let idx = 0; idx < paras.items.length; idx++) {
          const p = paras.items[idx];
          let sourceText = p.text || "";
          const trimmed = sourceText.trim();
          if (!trimmed) continue;
          if (trimmed.length > MAX_PARAGRAPH_CHARS) {
            notifyParagraphTooLong(idx, trimmed.length);
            continue;
          }

          const pStart = tnow();
          paragraphsProcessed++;
          log(`P${idx}: len=${sourceText.length} | "${SNIP(trimmed)}"`);
          let passText = sourceText;

          for (let pass = 0; pass < MAX_AUTOFIX_PASSES; pass++) {
            let corrected;
            try {
              corrected = await popraviPoved(passText);
            } catch (apiErr) {
              apiErrors++;
              warn(`P${idx} pass ${pass}: API call failed -> stop paragraph`, apiErr);
              notifyApiUnavailable();
              break;
            }
            log(`P${idx} pass ${pass}: corrected -> "${SNIP(corrected)}"`);

            const opsAll = diffCommasOnly(passText, corrected);
            const ops = filterCommaOps(passText, corrected, opsAll);
            log(`P${idx} pass ${pass}: ops candidate=${opsAll.length}, after filter=${ops.length}`);

            if (!ops.length) {
              if (pass === 0) log(`P${idx}: no applicable comma ops`);
              break;
            }

            for (const op of ops) {
              if (op.kind === "insert") {
                await insertCommaAt(context, p, passText, corrected, op.pos);
                await ensureSpaceAfterComma(context, p, corrected, op.pos);
                totalInserted++;
              } else {
                await deleteCommaAt(context, p, passText, op.pos);
                totalDeleted++;
              }
            }

            // eslint-disable-next-line office-addins/no-context-sync-in-loop
            await context.sync();
            p.load("text");
            // eslint-disable-next-line office-addins/no-context-sync-in-loop
            await context.sync();
            const updated = p.text || "";
            if (!updated || updated === passText) break;
            passText = updated;
          }

          log(
            `P${idx}: applied (ins=${totalInserted}, del=${totalDeleted}) | ${Math.round(
              tnow() - pStart
            )} ms`
          );
        }
      } finally {
        // povrni sledenje spremembam
        if (trackToggleSupported) {
          doc.trackRevisions = prevTrack;
          await context.sync();
          log("TrackRevisions restored ->", prevTrack);
        }
      }
    });

    log(
      "DONE checkDocumentText() | paragraphs:",
      paragraphsProcessed,
      "| inserted:",
      totalInserted,
      "| deleted:",
      totalDeleted,
      "| apiErrors:",
      apiErrors
    );
  } catch (e) {
    errL("ERROR in checkDocumentText:", e);
  }
}

async function checkDocumentTextOnline() {
  log("START checkDocumentTextOnline()");
  let paragraphsProcessed = 0;
  let suggestions = 0;
  let apiErrors = 0;

  try {
    await Word.run(async (context) => {
      if (await documentHasTrackedChanges(context)) {
        notifyTrackedChangesPresent();
        return;
      }
      const paras = context.document.body.paragraphs;
      paras.load("items/text");
      await context.sync();
      await clearOnlineSuggestionMarkers(context, null, paras);
      resetPendingSuggestionsOnline();
      resetParagraphsTouchedOnline();
      resetParagraphTokenAnchorsOnline();

      let documentCharOffset = 0;

      for (let idx = 0; idx < paras.items.length; idx++) {
        const p = paras.items[idx];
        const original = p.text || "";
        const normalizedOriginal = normalizeParagraphWhitespace(original);
        const trimmed = normalizedOriginal.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += original.length + 1;
        if (!trimmed) {
          createParagraphTokenAnchors({
            paragraphIndex: idx,
            originalText: original,
            correctedText: original,
            sourceTokens: [],
            targetTokens: [],
            documentOffset: paragraphDocOffset,
          });
          continue;
        }

        log(`P${idx} ONLINE: len=${original.length} | "${SNIP(trimmed)}"`);
        paragraphsProcessed++;

        const chunkResult = await processLongParagraphOnline({
          context,
          paragraph: p,
          paragraphIndex: idx,
          originalText: original,
          normalizedOriginalText: normalizedOriginal,
          paragraphDocOffset,
        });
        suggestions += chunkResult.suggestionsAdded;
        apiErrors += chunkResult.apiErrors;
      }

      await context.sync();
    });

    log(
      "DONE checkDocumentTextOnline() | paragraphs:",
      paragraphsProcessed,
      "| suggestions:",
      suggestions,
      "| apiErrors:",
      apiErrors
    );
  } catch (e) {
    errL("ERROR in checkDocumentTextOnline:", e);
  }
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

function tokenizeForAnchoring(text = "", prefix = "syn") {
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

async function processLongParagraphOnline({
  context,
  paragraph,
  paragraphIndex,
  originalText,
  normalizedOriginalText,
  paragraphDocOffset,
}) {
  const chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS);
  if (!chunks.length) {
    return { suggestionsAdded: 0, apiErrors: 0, processedAny: false };
  }
  const normalizedSource =
    typeof normalizedOriginalText === "string"
      ? normalizedOriginalText
      : normalizeParagraphWhitespace(originalText);
  chunks.forEach((chunk) => {
    chunk.normalizedText = normalizedSource.slice(chunk.start, chunk.end);
  });

  const chunkDetails = [];
  const processedMeta = [];
  let suggestionsAdded = 0;
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
      notifySentenceTooLong(paragraphIndex, chunk.length);
      meta.syntheticTokens = tokenizeForAnchoring(
        chunk.text,
        `p${paragraphIndex}_c${chunk.index}_syn_`
      );
      continue;
    }
    let detail = null;
    try {
      detail = await popraviPovedDetailed(chunk.normalizedText || chunk.text);
      if (typeof window !== "undefined") {
        window.__LAST_DETAIL__ = detail;
      }
    } catch (apiErr) {
      apiErrors++;
      warn(`P${paragraphIndex} chunk ${chunk.index}: API call failed`, apiErr);
      notifyChunkApiFailure(paragraphIndex, chunk.index);
      meta.syntheticTokens = tokenizeForAnchoring(
        chunk.text,
        `p${paragraphIndex}_c${chunk.index}_syn_`
      );
      continue;
    }
    const correctedChunk = detail.correctedText;
    if (!onlyCommasChanged(chunk.normalizedText || chunk.text, correctedChunk)) {
      notifyChunkNonCommaChanges(paragraphIndex, chunk.index, chunk.text, correctedChunk);
      log(`P${paragraphIndex} chunk ${chunk.index}: API changed more than commas -> SKIP`, {
        original: chunk.text,
        corrected: correctedChunk,
      });
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
    return { suggestionsAdded: 0, apiErrors, processedAny: false };
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

  const paragraphAnchors = createParagraphTokenAnchors({
    paragraphIndex,
    originalText,
    correctedText: correctedParagraph,
    sourceTokens,
    targetTokens,
    documentOffset: paragraphDocOffset,
  });

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
        paragraphAnchors,
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
      if (opSource) {
        const marked = await highlightSuggestionOnline(
          context,
          paragraph,
          originalText,
          correctedParagraph,
          adjustedOp,
          paragraphIndex,
          paragraphAnchors
        );
        if (marked) suggestionsAdded++;
      } else {
        if (shouldSuppressDueToRepeatedToken(paragraphAnchors, adjustedOp)) {
          continue;
        }
        const marked = await highlightSuggestionOnline(
          context,
          paragraph,
          originalText,
          correctedParagraph,
          adjustedOp,
          paragraphIndex,
          paragraphAnchors
        );
        if (marked) suggestionsAdded++;
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
        if (shouldSuppressDueToRepeatedToken(paragraphAnchors, adjustedOp)) {
          continue;
        }
        const marked = await highlightSuggestionOnline(
          context,
          paragraph,
          originalText,
          correctedParagraph,
          adjustedOp,
          paragraphIndex,
          paragraphAnchors
        );
        if (marked) suggestionsAdded++;
      }
    }
  }

  return {
    suggestionsAdded,
    apiErrors,
    processedAny: true,
  };
}
