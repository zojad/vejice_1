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

const pendingSuggestionsOnline = [];
const MAX_PARAGRAPH_CHARS = 3000;
const LONG_PARAGRAPH_MESSAGE =
  "Odstavek je predolg za preverjanje. Razdelite ga na krajše povedi in poskusite znova.";
const LONG_SENTENCE_MESSAGE =
  "Poved je predolga za preverjanje. Razdelite jo na krajše povedi in poskusite znova.";
const CHUNK_API_ERROR_MESSAGE =
  "Nekaterih povedi ni bilo mogoče preveriti zaradi napake strežnika. Ostale povedi so bile preverjene.";
const PARAGRAPH_NON_COMMA_MESSAGE =
  "API je spremenil več kot vejice. Preglejte odstavek ročno.";
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
  showToastNotification(msg);
}

function notifyChunkApiFailure(paragraphIndex, chunkIndex) {
  const paragraphLabel = paragraphIndex + 1;
  const chunkLabel = chunkIndex + 1;
  const msg = `Odstavek ${paragraphLabel}, poved ${chunkLabel}: ${CHUNK_API_ERROR_MESSAGE}`;
  warn("Sentence skipped due to API error", { paragraphIndex, chunkIndex });
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
  const textOccurrences = Object.create(null);
  const trimmedOccurrences = Object.create(null);
  let cursor = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenText = token?.text ?? "";
    const tokenId = token?.id ?? `tok${i + 1}`;
    const tokenLength = tokenText.length;
    const charStart = resolveTokenPosition(safeParagraph, tokenText, cursor);
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
    };
    byId[tokenId] = anchor;
    ordered.push(anchor);
  }

  return { byId, ordered };
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
    const matches = paragraph.getRange().search(snippet, {
      matchCase: true,
      matchWholeWord: false,
      ignoreSpace: false,
      ignorePunct: false,
    });
    matches.load("items");
    await context.sync();
    if (!matches.items.length) {
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
      ops.push({ kind: "insert", pos: j, originalPos: i, correctedPos: j });
      j++;
      continue;
    }
    if (o === "," && c !== ",") {
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

  if (!range && metadata.highlightAnchorTarget?.tokenText) {
    range = await findTokenRangeForAnchor(context, paragraph, metadata.highlightAnchorTarget);
    if (range) {
      try {
        range = range.getRange("Content");
      } catch (err) {
        warn("highlight insert: token anchor getRange failed", err);
      }
      if (range) {
        log("highlight insert: range via token anchor", {
          paragraphIndex,
          tokenId: metadata.highlightAnchorTarget.tokenId,
          tokenText: metadata.highlightAnchorTarget.tokenText,
        });
      }
    }
  }


  // Prefer token-based char spans before fuzzy snippet searches; this keeps
  // repeated words from pointing to the wrong occurrence.
  if (!range && metadata.highlightCharStart >= 0) {
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
      "highlight-insert-anchor",
      metadata.highlightText
    );
    if (range) {
      log("highlight insert: range via char-span metadata", {
        paragraphIndex,
        highlightStart: metadata.highlightCharStart,
        highlightEnd: metaEnd,
        highlightText: metadata.highlightText,
      });
    } else {
      log("highlight insert: char-span metadata lookup failed", {
        paragraphIndex,
        highlightStart: metadata.highlightCharStart,
        highlightEnd: metaEnd,
        highlightText: metadata.highlightText,
        anchorSource: metadata.highlightAnchorTarget,
      });
    }
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
      log("highlight insert: range via lastWord", {
        paragraphIndex,
        lastWord,
        matches: wordSearch.items.length,
      });
    }
  }

  if (!range && leftContext.trim()) {
    const leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
      log("highlight insert: range via leftSnippet", {
        paragraphIndex,
        snippet: leftContext.trim(),
        matches: leftSearch.items.length,
      });
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
        log("highlight insert: range via rightSnippet", {
          paragraphIndex,
          snippet: rightSnippet,
          matches: rightSearch.items.length,
        });
      }
    }
  }

  if (!range) {
    warn("highlight insert: could not locate snippet");
    range = await getRangeForCharacterSpan(
      context,
      paragraph,
      anchorsEntry?.originalText ?? corrected,
      metadata.highlightCharStart,
      metadata.highlightCharEnd,
      "highlight-insert",
      metadata.highlightText
    );
    if (range) {
      log("highlight insert: range via metadata", {
        paragraphIndex,
        highlightStart: metadata.highlightCharStart,
        highlightEnd: metadata.highlightCharEnd,
        highlightText: metadata.highlightText,
      });
    }
    if (!range) return false;
  }

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

  if (!Number.isFinite(meta.charStart) || meta.charStart < 0) return false;
  const entry = getParagraphTokenAnchorsOnline(suggestion.paragraphIndex);
  const range = await getRangeForCharacterSpan(
    context,
    paragraph,
    entry?.originalText ?? paragraph.text,
    meta.charStart,
    meta.charEnd,
    "apply-delete",
    meta.highlightText
  );
  if (!range) return false;
  range.insertText("", Word.InsertLocation.replace);
  return true;
}

async function tryApplyDeleteUsingHighlight(suggestion) {
  if (!suggestion?.highlightRange) return false;
  try {
    suggestion.highlightRange.insertText("", Word.InsertLocation.replace);
    return true;
  } catch (err) {
    warn("apply delete: highlight range removal failed", err);
    return false;
  }
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
  if (await tryApplyDeleteUsingMetadata(context, paragraph, suggestion)) return;
  if (await tryApplyDeleteUsingHighlight(suggestion)) return;
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

    for (const sug of pendingSuggestionsOnline) {
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
    // Flush any pending highlight removals before running formatting cleanup.
    await context.sync();
    await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes);
    resetParagraphsTouchedOnline();
    await clearOnlineSuggestionMarkers(context, processedSuggestions);
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
        const trimmed = original.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += original.length + 1;
        let paragraphAnchors = null;
        if (!trimmed) {
          paragraphAnchors = createParagraphTokenAnchors({
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
        if (trimmed.length > MAX_PARAGRAPH_CHARS) {
          const chunkResult = await processLongParagraphOnline({
            context,
            paragraph: p,
            paragraphIndex: idx,
            originalText: original,
            paragraphDocOffset,
          });
          suggestions += chunkResult.suggestionsAdded;
          apiErrors += chunkResult.apiErrors;
          if (chunkResult.processedAny) {
            paragraphsProcessed++;
          } else {
            notifyParagraphTooLong(idx, trimmed.length);
          }
          continue;
        }

        paragraphsProcessed++;

        let detail;
        try {
          detail = await popraviPovedDetailed(original);
        } catch (apiErr) {
          apiErrors++;
          warn(`P${idx}: API call failed -> fallback to chunking`, apiErr);
          const chunkResult = await processLongParagraphOnline({
            context,
            paragraph: p,
            paragraphIndex: idx,
            originalText: original,
            paragraphDocOffset,
          });
          suggestions += chunkResult.suggestionsAdded;
          apiErrors += chunkResult.apiErrors;
          if (chunkResult.processedAny) {
            continue;
          }
          paragraphAnchors = createParagraphTokenAnchors({
            paragraphIndex: idx,
            originalText: original,
            correctedText: original,
            sourceTokens: [],
            targetTokens: [],
            documentOffset: paragraphDocOffset,
          });
          continue;
        }
        const corrected = detail.correctedText;

        paragraphAnchors = createParagraphTokenAnchors({
          paragraphIndex: idx,
          originalText: original,
          correctedText: corrected,
          sourceTokens: detail.sourceTokens,
          targetTokens: detail.targetTokens,
          documentOffset: paragraphDocOffset,
        });

        if (!onlyCommasChanged(original, corrected)) {
          notifyParagraphNonCommaChanges(idx, original, corrected);
          continue;
        }

        const ops = filterCommaOps(original, corrected, diffCommasOnly(original, corrected));
        if (!ops.length) continue;

        for (const op of ops) {
          const marked = await highlightSuggestionOnline(
            context,
            p,
            original,
            corrected,
            op,
            idx,
            paragraphAnchors
          );
          if (marked) suggestions++;
        }
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
  const sentences = [];
  let start = 0;

  const pushSentence = (end) => {
    if (end <= start) return;
    sentences.push({ start, end });
    start = end;
  };

  for (let i = 0; i < safeText.length; i++) {
    const ch = safeText[i];
    if (ch === "\n") {
      pushSentence(i + 1);
      continue;
    }
    if (/[.!?]/.test(ch)) {
      let end = i + 1;
      while (end < safeText.length && /[\])"'»”’]+/.test(safeText[end])) end++;
      while (end < safeText.length && /\s/.test(safeText[end])) end++;
      pushSentence(end);
      i = end - 1;
    }
  }
  if (start < safeText.length) {
    sentences.push({ start, end: safeText.length });
  }

  const chunks = [];
  let current = null;
  let chunkIndex = 0;

  const finalizeCurrent = () => {
    if (!current) return;
    chunks.push({
      index: current.index,
      start: current.start,
      end: current.end,
      length: current.end - current.start,
      text: safeText.slice(current.start, current.end),
      tooLong: false,
    });
    current = null;
  };

  sentences.forEach((sentence) => {
    const sentenceLength = sentence.end - sentence.start;
    if (sentenceLength > maxLen) {
      finalizeCurrent();
      chunks.push({
        index: chunkIndex++,
        start: sentence.start,
        end: sentence.end,
        length: sentenceLength,
        text: safeText.slice(sentence.start, sentence.end),
        tooLong: true,
      });
      return;
    }
    if (!current) {
      current = { start: sentence.start, end: sentence.end, index: chunkIndex++ };
      return;
    }
    if (sentence.end - current.start <= maxLen) {
      current.end = sentence.end;
      return;
    }
    finalizeCurrent();
    current = { start: sentence.start, end: sentence.end, index: chunkIndex++ };
  });

  finalizeCurrent();
  return chunks;
}

function rekeyTokens(tokens, prefix) {
  if (!Array.isArray(tokens)) return [];
  return tokens.map((token, idx) => {
    if (token && typeof token === "object") {
      return { ...token, token_id: `${prefix}${idx + 1}` };
    }
    return {
      token_id: `${prefix}${idx + 1}`,
      token: typeof token === "string" ? token : "",
    };
  });
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
  paragraphDocOffset,
}) {
  const chunks = splitParagraphIntoChunks(originalText, MAX_PARAGRAPH_CHARS);
  if (!chunks.length) {
    return { suggestionsAdded: 0, apiErrors: 0, processedAny: false };
  }

  const chunkDetails = [];
  const processedMeta = [];
  let suggestionsAdded = 0;
  let apiErrors = 0;

  for (const chunk of chunks) {
    const meta = {
      chunk,
      correctedText: chunk.text,
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
      detail = await popraviPovedDetailed(chunk.text);
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
    if (!onlyCommasChanged(chunk.text, correctedChunk)) {
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

    const ops = filterCommaOps(chunk.text, correctedChunk, diffCommasOnly(chunk.text, correctedChunk));
    if (!ops.length) continue;
    chunkDetails.push({
      chunk,
      ops,
    });
  }

  if (!processedMeta.some((meta) => meta.detail)) {
    return { suggestionsAdded: 0, apiErrors, processedAny: false };
  }

  const correctedParagraph = processedMeta.map((meta) => meta.correctedText).join("");
  const sourceTokens = [];
  const targetTokens = [];

  processedMeta.forEach((meta) => {
    const basePrefix = `p${paragraphIndex}_c${meta.chunk.index}_`;
    if (meta.detail) {
      sourceTokens.push(...rekeyTokens(meta.detail.sourceTokens, `${basePrefix}s`));
      targetTokens.push(...rekeyTokens(meta.detail.targetTokens, `${basePrefix}t`));
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
    for (const op of entry.ops) {
      const offset = entry.chunk.start;
      const adjustedOp = {
        ...op,
        pos: op.pos + offset,
        originalPos: (typeof op.originalPos === "number" ? op.originalPos : op.pos) + offset,
        correctedPos: (typeof op.correctedPos === "number" ? op.correctedPos : op.pos) + offset,
      };
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

  return {
    suggestionsAdded,
    apiErrors,
    processedAny: true,
  };
}
