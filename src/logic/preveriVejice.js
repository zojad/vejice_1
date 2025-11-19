/* global Word, window, process, performance, console, Office */
import { popraviPoved } from "../api/apiVejice.js";
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
function resetPendingSuggestionsOnline() {
  pendingSuggestionsOnline.length = 0;
}
function addPendingSuggestionOnline(suggestion) {
  pendingSuggestionsOnline.push(suggestion);
}
export function getPendingSuggestionsOnline() {
  return pendingSuggestionsOnline;
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

/** Guard: ali so se spremenile samo vejice */
function onlyCommasChanged(original, corrected) {
  const strip = (x) => x.replace(/,/g, "");
  return strip(original) === strip(corrected);
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
      ops.push({ kind: "insert", pos: j });
      j++;
      continue;
    }
    if (o === "," && c !== ",") {
      ops.push({ kind: "delete", pos: i });
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
  paragraphIndex
) {
  if (op.kind === "delete") {
    return highlightDeleteSuggestion(context, paragraph, original, op, paragraphIndex);
  }
  return highlightInsertSuggestion(context, paragraph, corrected, op, paragraphIndex);
}

function countCommasUpTo(text, pos) {
  let count = 0;
  for (let i = 0; i <= pos && i < text.length; i++) {
    if (text[i] === ",") count++;
  }
  return count;
}

async function highlightDeleteSuggestion(context, paragraph, original, op, paragraphIndex) {
  const ordinal = countCommasUpTo(original, op.pos);
  if (ordinal <= 0) {
    warn("highlight delete: no comma ordinal", op);
    return false;
  }

  const commaSearch = paragraph.getRange().search(",", { matchCase: false, matchWholeWord: false });
  commaSearch.load("items");
  await context.sync();

  if (!commaSearch.items.length || ordinal > commaSearch.items.length) {
    warn("highlight delete: comma search out of range");
    return false;
  }

  const targetRange = commaSearch.items[ordinal - 1];
  targetRange.font.highlightColor = HIGHLIGHT_DELETE;
  context.trackedObjects.add(targetRange);
  addPendingSuggestionOnline({
    id: createSuggestionId("del", paragraphIndex, op.pos),
    kind: "delete",
    paragraphIndex,
    commaOrdinal: ordinal,
    highlightRange: targetRange,
  });
  return true;
}

async function highlightInsertSuggestion(context, paragraph, corrected, op, paragraphIndex) {
  const anchor = makeAnchor(corrected, op.pos);
  const rawLeft = anchor.left || "";
  const rawRight = anchor.right || corrected.slice(op.pos, op.pos + 16);
  const leftSnippetStored = rawLeft.slice(-20);
  const rightSnippetStored = rawRight.slice(0, 20);

  let leftContext = rawLeft.slice(-12).replace(/[\r\n]+/g, " ");
  let range = null;
  const searchOpts = { matchCase: false, matchWholeWord: false };

  if (leftContext) {
    const leftSearch = paragraph.getRange().search(leftContext, searchOpts);
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

  if (!range) {
    warn("highlight insert: could not locate snippet");
    return false;
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
    leftSnippet: leftSnippetStored,
    rightSnippet: rightSnippetStored,
    highlightRange: range,
  });
  return true;
}

async function applyDeleteSuggestion(context, paragraph, suggestion) {
  const ordinal = suggestion.commaOrdinal;
  if (!ordinal || ordinal <= 0) return;
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

async function applyInsertSuggestion(context, paragraph, suggestion) {
  const range = await findRangeForInsert(context, paragraph, suggestion);
  if (!range) {
    warn("apply insert: unable to locate range");
    return;
  }
  const after = range.getRange("After");
  after.insertText(",", Word.InsertLocation.before);
}

async function findRangeForInsert(context, paragraph, suggestion) {
  const searchOpts = { matchCase: false, matchWholeWord: false };
  let leftFrag = (suggestion.leftSnippet || "").slice(-12).replace(/[\r\n]+/g, " ");
  let range = null;

  if (leftFrag) {
    const leftSearch = paragraph.getRange().search(leftFrag, searchOpts);
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

async function clearOnlineSuggestionMarkers(context) {
  if (!pendingSuggestionsOnline.length) {
    context.document.body.font.highlightColor = null;
    return;
  }
  for (const sug of pendingSuggestionsOnline) {
    try {
      if (sug.highlightRange) {
        sug.highlightRange.font.highlightColor = null;
        context.trackedObjects.remove(sug.highlightRange);
      }
    } catch (err) {
      warn("Failed to clear highlight", err);
    }
  }
  await context.sync();
  resetPendingSuggestionsOnline();
}

export async function applyAllSuggestionsOnline() {
  if (!pendingSuggestionsOnline.length) return;
  await Word.run(async (context) => {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();

    for (const sug of pendingSuggestionsOnline) {
      const p = paras.items[sug.paragraphIndex];
      if (!p) continue;
      try {
        if (sug.kind === "delete") {
          await applyDeleteSuggestion(context, p, sug);
        } else {
          await applyInsertSuggestion(context, p, sug);
        }
      } catch (err) {
        warn("applyAllSuggestionsOnline: failed to apply suggestion", err);
      }
    }
    await clearOnlineSuggestionMarkers(context);
  });
}

export async function rejectAllSuggestionsOnline() {
  await Word.run(async (context) => {
    await clearOnlineSuggestionMarkers(context);
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

            if (!onlyCommasChanged(passText, corrected)) {
              log(`P${idx} pass ${pass}: API changed more than commas -> SKIP`);
              break;
            }

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
      await clearOnlineSuggestionMarkers(context);
      resetPendingSuggestionsOnline();

      const paras = context.document.body.paragraphs;
      paras.load("items/text");
      await context.sync();

      for (let idx = 0; idx < paras.items.length; idx++) {
        const p = paras.items[idx];
        const original = p.text || "";
        const trimmed = original.trim();
        if (!trimmed) continue;

        paragraphsProcessed++;
        log(`P${idx} ONLINE: len=${original.length} | "${SNIP(trimmed)}"`);

        let corrected;
        try {
          corrected = await popraviPoved(original);
        } catch (apiErr) {
          apiErrors++;
          warn(`P${idx}: API call failed -> skip paragraph`, apiErr);
          continue;
        }

        if (!onlyCommasChanged(original, corrected)) {
          log(`P${idx}: API changed more than commas -> SKIP`);
          continue;
        }

        const ops = filterCommaOps(original, corrected, diffCommasOnly(original, corrected));
        if (!ops.length) continue;

        for (const op of ops) {
          const marked = await highlightSuggestionOnline(context, p, original, corrected, op, idx);
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
