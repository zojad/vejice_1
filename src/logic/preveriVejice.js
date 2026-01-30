/* global Word, window, process, performance, console, Office, URL */
import { popraviPoved, popraviPovedDetailed } from "../api/apiVejice.js";
import { isWordOnline } from "../utils/host.js";
import { CommaSuggestionEngine } from "./engine/CommaSuggestionEngine.js";
import { SyntheticAnchorProvider } from "./anchoring/SyntheticAnchorProvider.js";
import { LemmatizerAnchorProvider } from "./anchoring/LemmatizerAnchorProvider.js";
import { WordOnlineAdapter } from "./adapters/wordOnlineAdapter.js";
import { WordDesktopAdapter } from "./adapters/wordDesktopAdapter.js";
import {
  normalizeParagraphWhitespace,
  normalizeParagraphForEquality,
  QUOTES,
  charAtSafe,
  isDigit,
  makeAnchor,
  normalizeTokenRepeatKey,
} from "./engine/textUtils.js";

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
const TRAILING_COMMA_REGEX = /[,\s]+$/;

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
const BOOLEAN_TRUE = new Set(["1", "true", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["0", "false", "no", "off"]);

function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (BOOLEAN_TRUE.has(normalized)) return true;
  if (BOOLEAN_FALSE.has(normalized)) return false;
  return undefined;
}

function shouldUseLemmatizerAnchors() {
  if (typeof window !== "undefined") {
    if (typeof window.__VEJICE_LEMMAS_URL === "string" && window.__VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via window:", window.__VEJICE_LEMMAS_URL);
    }
    if (
      typeof window.__VEJICE_LEMMAS_TIMEOUT_MS !== "undefined" &&
      window.__VEJICE_LEMMAS_TIMEOUT_MS !== null
    ) {
      log("Lemmas timeout override via window:", window.__VEJICE_LEMMAS_TIMEOUT_MS);
    }
    const override = parseBooleanFlag(window.__VEJICE_USE_LEMMATIZER__);
    if (typeof override === "boolean") return override;
  }
  if (typeof process !== "undefined") {
    const envValue =
      parseBooleanFlag(process.env?.VEJICE_USE_LEMMATIZER) ??
      parseBooleanFlag(process.env?.VEJICE_LEMMATIZER_ANCHORS);
    if (typeof envValue === "boolean") return envValue;
    if (process.env?.VEJICE_LEMMAS_URL) {
      log("Lemmas endpoint override via env:", process.env.VEJICE_LEMMAS_URL);
    }
    if (process.env?.VEJICE_LEMMAS_TIMEOUT_MS) {
      log("Lemmas timeout override via env:", process.env.VEJICE_LEMMAS_TIMEOUT_MS);
    }
  }
  return true;
}

function createAnchorProvider() {
  if (shouldUseLemmatizerAnchors()) {
    try {
      log("Lemmatizer anchor provider enabled");
      return new LemmatizerAnchorProvider();
    } catch (error) {
      errL("Failed to initialize LemmatizerAnchorProvider, falling back to synthetic", error);
    }
  }
  return new SyntheticAnchorProvider();
}
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
    meta: sug?.meta,
    originalPos: sug?.originalPos,
    snippets: sug?.snippets,
  }));
}

if (typeof window !== "undefined") {
  window.__VEJICE_DEBUG_STATE__ = window.__VEJICE_DEBUG_STATE__ || {};
  window.__VEJICE_DEBUG_STATE__.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.__VEJICE_DEBUG_STATE__.getParagraphAnchorsOnline = () => anchorProvider.paragraphAnchors;
  window.getPendingSuggestionsOnline = getPendingSuggestionsOnline;
  window.getPendingSuggestionsSnapshot = () => getPendingSuggestionsOnline(true);
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

const anchorProvider = createAnchorProvider();
const anchorProviderSupportsCharHints =
  typeof anchorProvider.supportsCharHints === "function" ? anchorProvider.supportsCharHints() : false;
if (anchorProviderSupportsCharHints) {
  log("Anchor provider supports char hints; snippet fallback cleanup disabled");
}
const commaEngine = new CommaSuggestionEngine({
  anchorProvider,
  apiClient: {
    popraviPoved,
    popraviPovedDetailed,
  },
  notifiers: {
    onParagraphTooLong: notifyParagraphTooLong,
    onSentenceTooLong: notifySentenceTooLong,
    onChunkApiFailure: notifyChunkApiFailure,
    onChunkNonCommaChanges: notifyChunkNonCommaChanges,
  },
});

const wordOnlineAdapter = new WordOnlineAdapter({
  highlightSuggestion: highlightSuggestionOnline,
  applyInsertSuggestion,
  applyDeleteSuggestion,
  clearSuggestionMarkers: clearOnlineSuggestionMarkers,
});

const wordDesktopAdapter = new WordDesktopAdapter({
  applyInsertSuggestion,
  applyDeleteSuggestion,
});

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

async function getRangeForAnchorSpan(
  context,
  paragraph,
  anchorsEntry,
  charStart,
  charEnd,
  reason = "span",
  fallbackSnippet
) {
  const candidates = [];
  if (anchorsEntry?.originalText) {
    candidates.push({ text: anchorsEntry.originalText, label: "orig" });
  }
  const liveText = paragraph?.text;
  if (liveText && (!candidates.length || liveText !== candidates[0].text)) {
    candidates.push({ text: liveText, label: "live" });
  }
  if (!candidates.length) {
    candidates.push({ text: "", label: "empty" });
  }

  for (const candidate of candidates) {
    if (!candidate.text) continue;
    const range = await getRangeForCharacterSpan(
      context,
      paragraph,
      candidate.text,
      charStart,
      charEnd,
      `${reason}-${candidate.label}`,
      fallbackSnippet
    );
    if (range) {
      return range;
    }
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

function buildDeleteRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
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
  const charHint = suggestion?.charHint;
  addRange(charHint?.start, charHint?.end, meta.highlightText);
  return ranges;
}

function buildInsertRangeCandidates(suggestion) {
  const ranges = [];
  const meta = suggestion?.meta?.anchor;
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
  const charHint = suggestion?.charHint;
  addRange(charHint?.start, charHint?.end, meta.highlightText);
  addAnchor(meta.highlightAnchorTarget);
  addAnchor(meta.sourceTokenAt);
  addAnchor(meta.targetTokenAt);
  addAnchor(meta.sourceTokenBefore);
  addAnchor(meta.targetTokenBefore);
  return ranges;
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

async function highlightSuggestionOnline(context, paragraph, suggestion) {
  if (!suggestion) return false;
  if (suggestion.kind === "delete") {
    return highlightDeleteSuggestion(context, paragraph, suggestion);
  }
  return highlightInsertSuggestion(context, paragraph, suggestion);
}

function countCommasUpTo(text, pos) {
  let count = 0;
  for (let i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}

async function highlightDeleteSuggestion(context, paragraph, suggestion) {
  const paragraphText = suggestion.meta?.originalText ?? paragraph.text ?? "";
  const meta = suggestion.meta?.anchor || {};
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const charStart =
    suggestion.charHint?.start ?? meta.charStart ?? suggestion.meta?.op?.originalPos ?? -1;
  const charEnd =
    suggestion.charHint?.end ??
    meta.charEnd ??
    (typeof charStart === "number" && charStart >= 0 ? charStart + 1 : charStart);
  const highlightText = meta.highlightText ?? suggestion.meta?.highlightText ?? ",";
  let targetRange = null;

  if (Number.isFinite(charStart) && charStart >= 0) {
    targetRange = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      charStart,
      charEnd,
      "highlight-delete",
      highlightText
    );
  }

  if (!targetRange) {
    targetRange = await findCommaRangeByOrdinal(context, paragraph, paragraphText, suggestion.meta?.op);
    if (!targetRange) return false;
  }

  targetRange.font.highlightColor = HIGHLIGHT_DELETE;
  context.trackedObjects.add(targetRange);
  suggestion.highlightRange = targetRange;
  addPendingSuggestionOnline(suggestion);
  return true;
}

async function highlightInsertSuggestion(context, paragraph, suggestion) {
  const corrected = suggestion.meta?.correctedText ?? paragraph.text ?? "";
  const anchor = suggestion.meta?.anchor || {};
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const rawLeft = suggestion.snippets?.leftSnippet ?? corrected.slice(0, suggestion.meta?.op?.pos ?? 0);
  const rawRight = suggestion.snippets?.rightSnippet ?? corrected.slice(suggestion.meta?.op?.pos ?? 0);
  const lastWord = extractLastWord(rawLeft || "");
  let leftContext = (rawLeft || "").slice(-20).replace(/[\r\n]+/g, " ");
  const searchOpts = { matchCase: false, matchWholeWord: false };
  let range = null;

  if (Number.isFinite(anchor.highlightCharStart) && anchor.highlightCharStart >= 0) {
    const metaEnd =
      anchor.highlightCharEnd > anchor.highlightCharStart
        ? anchor.highlightCharEnd
        : anchor.highlightCharStart + 1;
    range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      anchor.highlightCharStart,
      metaEnd,
      "highlight-insert-meta",
      anchor.highlightText
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

  if (!range && leftContext && leftContext.trim()) {
    const leftSearch = paragraph.getRange().search(leftContext.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightSnippet = (rawRight || "").replace(/,/g, "").trim();
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
  suggestion.highlightRange = range;
  addPendingSuggestionOnline(suggestion);
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
  const meta = suggestion?.meta?.anchor;
  if (!meta) return false;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);

  const charStart =
    suggestion.charHint?.start ?? meta.charStart ?? suggestion.meta?.op?.originalPos ?? -1;
  const charEnd =
    suggestion.charHint?.end ??
    meta.charEnd ??
    (typeof charStart === "number" && charStart >= 0 ? charStart + 1 : charStart);

  if (Number.isFinite(charStart) && charStart >= 0) {
    const range = await getRangeForAnchorSpan(
      context,
      paragraph,
      entry,
      charStart,
      Number.isFinite(charEnd) && charEnd > charStart ? charEnd : charStart + 1,
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
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
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

  const candidates = buildDeleteRangeCandidates(suggestion);
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!Number.isFinite(candidate.start) || candidate.start < 0) {
      continue;
    }
    const safeEnd =
      Number.isFinite(candidate.end) && candidate.end > candidate.start
        ? candidate.end
        : candidate.start + 1;
    let span = null;
    try {
      span = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        candidate.start,
        safeEnd,
        `apply-delete-highlight-${i}`,
        candidate.snippet
      );
    } catch (err) {
      warn("apply delete: candidate span lookup failed", err);
      continue;
    }
    if (await tryByRange(span)) {
      return true;
    }
  }

  return false;
}

async function applyDeleteSuggestionLegacy(context, paragraph, suggestion) {
  const pos =
    suggestion.meta?.op?.originalPos ??
    suggestion.meta?.op?.pos ??
    suggestion.charHint?.start ??
    0;
  const ordinal = countCommasUpTo(paragraph.text || "", pos);
  if (ordinal <= 0) {
    warn("apply delete: no ordinal");
    return false;
  }
  const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
  commaSearch.load("items");
  await context.sync();
  const idx = ordinal - 1;
  if (!commaSearch.items.length || idx >= commaSearch.items.length) {
    warn("apply delete: ordinal out of range");
    return false;
  }
  commaSearch.items[idx].insertText("", Word.InsertLocation.replace);
  return true;
}

async function applyDeleteSuggestion(context, paragraph, suggestion) {
  if (await tryApplyDeleteUsingHighlight(context, paragraph, suggestion)) return true;
  if (await tryApplyDeleteUsingMetadata(context, paragraph, suggestion)) return true;
  return await applyDeleteSuggestionLegacy(context, paragraph, suggestion);
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
  const meta = suggestion?.meta?.anchor;
  if (!meta) return false;
  const anchorInfo = selectInsertAnchor(meta);
  if (!anchorInfo) return false;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const range = await getRangeForAnchorSpan(
    context,
    paragraph,
    entry,
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
  const meta = suggestion?.meta?.anchor;
  const entry = anchorProvider.getAnchorsForParagraph(suggestion?.paragraphIndex);
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
    let span = null;
    try {
      span = await getRangeForAnchorSpan(
        context,
        paragraph,
        entry,
        candidate.start,
        safeEnd,
        `apply-insert-highlight-${i}`,
        candidate.snippet
      );
    } catch (err) {
      warn("apply insert: candidate span lookup failed", err);
      continue;
    }
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
    return false;
  }
  const after = range.getRange("After");
  after.insertText(",", Word.InsertLocation.before);
  return true;
}

async function applyInsertSuggestion(context, paragraph, suggestion) {
  if (await tryApplyInsertUsingHighlight(context, paragraph, suggestion)) return true;
  if (await tryApplyInsertUsingMetadata(context, paragraph, suggestion)) return true;
  return await applyInsertSuggestionLegacy(context, paragraph, suggestion);
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
  if (anchorProviderSupportsCharHints) {
    log("Skipping comma spacing cleanup – lemmatizer anchors already normalized.");
    return;
  }
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

  const focusWord = suggestion.snippets?.focusWord;
  if (focusWord) {
    const wordSearch = paragraph.getRange().search(focusWord, {
      matchCase: false,
      matchWholeWord: true,
    });
    wordSearch.load("items");
    await context.sync();
    if (wordSearch.items.length) {
      range = wordSearch.items[wordSearch.items.length - 1];
    }
  }

  let leftFrag = (suggestion.snippets?.leftSnippet || "").slice(-20).replace(/[\r\n]+/g, " ");

  if (!range && leftFrag.trim()) {
    const leftSearch = paragraph.getRange().search(leftFrag.trim(), searchOpts);
    leftSearch.load("items");
    await context.sync();
    if (leftSearch.items.length) {
      range = leftSearch.items[leftSearch.items.length - 1];
    }
  }

  if (!range) {
    let rightFrag = (suggestion.snippets?.rightSnippet || "").replace(/,/g, "").trim();
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
  const entry = anchorProvider.getAnchorsForParagraph(suggestion.paragraphIndex);
  const metaAnchor = suggestion.meta?.anchor;
  if (!metaAnchor) return;
  const charStart =
    suggestion.charHint?.start ??
    (typeof metaAnchor.highlightCharStart === "number"
      ? metaAnchor.highlightCharStart
      : metaAnchor.charStart);
  const charEnd =
    suggestion.charHint?.end ??
    (typeof metaAnchor.highlightCharEnd === "number" ? metaAnchor.highlightCharEnd : metaAnchor.charEnd);
  if (!paragraph || !Number.isFinite(charStart)) return;
  const range = await getRangeForAnchorSpan(
    context,
    paragraph,
    entry,
    charStart,
    charEnd,
    "clear-highlight",
    metaAnchor.highlightText || metaAnchor.highlightAnchorTarget?.tokenText
  );
  if (range) {
    range.font.highlightColor = null;
  }
}
async function clearOnlineSuggestionMarkers(context, suggestionsOverride, paragraphs) {
  const usingOverride = Array.isArray(suggestionsOverride);
  const source = usingOverride ? suggestionsOverride : pendingSuggestionsOnline;
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
    if (!usingOverride) {
      context.document.body.font.highlightColor = null;
      await context.sync();
    }
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
  const suggestionsByParagraph = new Map();
  for (const sug of pendingSuggestionsOnline) {
    if (typeof sug?.paragraphIndex !== "number" || sug.paragraphIndex < 0) continue;
    if (!suggestionsByParagraph.has(sug.paragraphIndex)) {
      suggestionsByParagraph.set(sug.paragraphIndex, []);
    }
    suggestionsByParagraph.get(sug.paragraphIndex).push(sug);
  }
  if (!suggestionsByParagraph.size) return;
  await Word.run(async (context) => {
    const paras = await wordOnlineAdapter.getParagraphs(context);
    const touchedIndexes = new Set();
    const processedSuggestions = [];
    const failedSuggestions = [];

    for (const [paragraphIndex, suggestions] of suggestionsByParagraph.entries()) {
      const paragraph = paras.items[paragraphIndex];
      if (!paragraph) {
        failedSuggestions.push(...suggestions);
        continue;
      }
      const entry = anchorProvider.getAnchorsForParagraph(paragraphIndex);
      let anyApplied = false;
      for (const suggestion of suggestions) {
        let applied = false;
        try {
          applied = await wordOnlineAdapter.applySuggestion(context, paragraph, suggestion);
        } catch (err) {
          warn("applyAllSuggestionsOnline: failed to apply suggestion", err);
          applied = false;
        }
        if (applied) {
          anyApplied = true;
          processedSuggestions.push({ suggestion, paragraph });
        } else {
          failedSuggestions.push(suggestion);
        }
      }
      if (anyApplied) {
        touchedIndexes.add(paragraphIndex);
      }
    }
    await wordOnlineAdapter.clearHighlights(context, processedSuggestions);
    await cleanupCommaSpacingForParagraphs(context, paras, touchedIndexes);
    for (const idx of touchedIndexes) {
      anchorProvider.deleteAnchors(idx);
    }
    pendingSuggestionsOnline.length = 0;
    if (failedSuggestions.length) {
      pendingSuggestionsOnline.push(...failedSuggestions);
    } else {
      context.document.body.font.highlightColor = null;
    }
    await context.sync();
  });
}

export async function rejectAllSuggestionsOnline() {
  await Word.run(async (context) => {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    await wordOnlineAdapter.clearHighlights(context, null, paras);
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
        const paras = await wordDesktopAdapter.getParagraphs(context);
        log("Paragraphs found:", paras.items.length);
        anchorProvider.reset();
        let documentCharOffset = 0;

        for (let idx = 0; idx < paras.items.length; idx++) {
          const paragraph = paras.items[idx];
          const sourceText = paragraph.text || "";
          const normalizedSource = normalizeParagraphWhitespace(sourceText);
          const trimmed = normalizedSource.trim();
          const paragraphDocOffset = documentCharOffset;
          documentCharOffset += sourceText.length + 1;
          if (!trimmed) {
            await anchorProvider.getAnchors({
              paragraphIndex: idx,
              originalText: sourceText,
              correctedText: sourceText,
              sourceTokens: [],
              targetTokens: [],
              documentOffset: paragraphDocOffset,
            });
            continue;
          }
          if (trimmed.length > MAX_PARAGRAPH_CHARS) {
            notifyParagraphTooLong(idx, trimmed.length);
            continue;
          }

          const pStart = tnow();
          paragraphsProcessed++;
          log(`P${idx}: len=${sourceText.length} | "${SNIP(trimmed)}"`);

          let result;
          try {
            result = await commaEngine.analyzeParagraph({
              paragraphIndex: idx,
              originalText: sourceText,
              normalizedOriginalText: normalizedSource,
              paragraphDocOffset,
            });
          } catch (err) {
            apiErrors++;
            warn(`P${idx}: engine failed`, err);
            notifyApiUnavailable();
            continue;
          }
          apiErrors += result.apiErrors;
          const suggestions = result.suggestions || [];
          if (!suggestions.length) continue;

          let appliedInParagraph = 0;
          for (const suggestion of suggestions) {
            let applied = false;
            try {
              applied = await wordDesktopAdapter.applySuggestion(context, paragraph, suggestion);
            } catch (err) {
              warn("Desktop adapter failed to apply suggestion", err);
            }
            if (!applied) continue;
            appliedInParagraph++;
            if (suggestion.kind === "insert") {
              totalInserted++;
            } else if (suggestion.kind === "delete") {
              totalDeleted++;
            }
          }
          if (appliedInParagraph) {
            await normalizeCommaSpacingInParagraph(context, paragraph);
            log(
              `P${idx}: applied (ins=${totalInserted}, del=${totalDeleted}) | ${Math.round(
                tnow() - pStart
              )} ms`
            );
          }
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
      const paras = await wordOnlineAdapter.getParagraphs(context);
      await wordOnlineAdapter.clearHighlights(context, null, paras);
      resetPendingSuggestionsOnline();
      anchorProvider.reset();

      let documentCharOffset = 0;

      for (let idx = 0; idx < paras.items.length; idx++) {
        const p = paras.items[idx];
        const original = p.text || "";
        const normalizedOriginal = normalizeParagraphWhitespace(original);
        const trimmed = normalizedOriginal.trim();
        const paragraphDocOffset = documentCharOffset;
        documentCharOffset += original.length + 1;
        if (!trimmed) {
          await anchorProvider.getAnchors({
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

        const result = await commaEngine.analyzeParagraph({
          paragraphIndex: idx,
          originalText: original,
          normalizedOriginalText: normalizedOriginal,
          paragraphDocOffset,
        });
        apiErrors += result.apiErrors;
        if (!result.suggestions?.length) continue;
        for (const suggestionObj of result.suggestions) {
          const highlighted = await wordOnlineAdapter.highlightSuggestion(context, p, suggestionObj);
          if (highlighted) {
            suggestions++;
          }
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
