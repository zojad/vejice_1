/* global Word, window, process, performance, console */
import { popraviPoved } from "../api/apiVejice.js";

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
  const { left, right } = makeAnchor(original, atOriginalPos);
  const pr = paragraph.getRange();

  if (left.length > 0) {
    const lm = pr.search(left, { matchCase: false, matchWholeWord: false });
    lm.load("items");
    await context.sync();
    if (!lm.items.length) {
      warn("delete: left anchor not found");
      return;
    }
    const afterLeft = lm.items[0].getRange("After");
    const comma = afterLeft.search(",", { matchCase: false, matchWholeWord: false });
    comma.load("items");
    await context.sync();
    if (!comma.items.length) {
      warn("delete: comma after left anchor not found");
      return;
    }
    comma.items[0].insertText("", Word.InsertLocation.replace);
  } else {
    if (!right) {
      warn("delete: no right anchor at paragraph start");
      return;
    }
    const rm = pr.search(right, { matchCase: false, matchWholeWord: false });
    rm.load("items");
    await context.sync();
    if (!rm.items.length) {
      warn("delete: right anchor not found");
      return;
    }
    const beforeRight = rm.items[0].getRange("Before");
    const comma = beforeRight.search(",", { matchCase: false, matchWholeWord: false });
    comma.load("items");
    await context.sync();
    if (!comma.items.length) {
      warn("delete: comma before right anchor not found");
      return;
    }
    comma.items[0].insertText("", Word.InsertLocation.replace);
  }
}

/** ─────────────────────────────────────────────────────────
 *  MAIN: Preveri vejice – celoten dokument, po odstavkih
 *  ───────────────────────────────────────────────────────── */
export async function checkDocumentText() {
  log("START checkDocumentText()");
  let totalInserted = 0;
  let totalDeleted = 0;
  let paragraphsProcessed = 0;
  let apiErrors = 0;

  try {
    await Word.run(async (context) => {
      // naloži in začasno vključi sledenje spremembam
      const doc = context.document;
      doc.load("trackRevisions");
      await context.sync();

      const prevTrack = doc.trackRevisions;
      doc.trackRevisions = true;
      log("TrackRevisions:", prevTrack, "-> true");

      try {
        // pridobi odstavke
        const paras = context.document.body.paragraphs;
        paras.load("items/text");
        await context.sync();
        log("Paragraphs found:", paras.items.length);

        for (let idx = 0; idx < paras.items.length; idx++) {
          const p = paras.items[idx];
          const original = p.text || "";
          const trimmed = original.trim();
          if (!trimmed) continue;

          const pStart = tnow();
          paragraphsProcessed++;
          log(`P${idx}: len=${original.length} | "${SNIP(trimmed)}"`);

          let corrected;
          try {
            corrected = await popraviPoved(original);
          } catch (apiErr) {
            apiErrors++;
            warn(`P${idx}: API call failed -> skip paragraph`, apiErr);
            continue;
          }
          log(`P${idx}: corrected -> "${SNIP(corrected)}"`);

          if (!onlyCommasChanged(original, corrected)) {
            log(`P${idx}: API changed more than commas -> SKIP`);
            continue;
          }

          const opsAll = diffCommasOnly(original, corrected);
          const ops = filterCommaOps(original, corrected, opsAll);
          log(`P${idx}: ops candidate=${opsAll.length}, after filter=${ops.length}`);

          if (!ops.length) {
            log(`P${idx}: no applicable comma ops`);
            continue;
          }

          for (const op of ops) {
            if (op.kind === "insert") {
              await insertCommaAt(context, p, original, corrected, op.pos);
              await ensureSpaceAfterComma(context, p, corrected, op.pos);
              totalInserted++;
            } else {
              await deleteCommaAt(context, p, original, op.pos);
              totalDeleted++;
            }
          }

          // eslint-disable-next-line office-addins/no-context-sync-in-loop
          await context.sync(); // UI responsive
          log(
            `P${idx}: applied (ins=${totalInserted}, del=${totalDeleted}) | ${Math.round(tnow() - pStart)} ms`
          );
        }
      } finally {
        // povrni sledenje spremembam
        doc.trackRevisions = prevTrack;
        await context.sync();
        log("TrackRevisions restored ->", prevTrack);
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
