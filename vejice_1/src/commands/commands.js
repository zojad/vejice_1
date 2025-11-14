/* global Office, Word, window, process, performance, console */

// Wire your checker and expose globals the manifest calls.
import { checkDocumentText as runCheckVejice } from "../logic/preveriVejice.js";

const envIsProd = () =>
  (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
  (typeof window !== "undefined" && window.__VEJICE_ENV__ === "production");
const DEBUG_OVERRIDE =
  typeof window !== "undefined" && typeof window.__VEJICE_DEBUG__ === "boolean"
    ? window.__VEJICE_DEBUG__
    : undefined;
const DEBUG = typeof DEBUG_OVERRIDE === "boolean" ? DEBUG_OVERRIDE : !envIsProd();
const log = (...a) => DEBUG && console.log("[Vejice CMD]", ...a);
const errL = (...a) => console.error("[Vejice CMD]", ...a);
const tnow = () => performance?.now?.() ?? Date.now();
const done = (event, tag) => {
  try {
    event && event.completed && event.completed();
  } catch (e) {
    errL(`${tag}: event.completed() threw`, e);
  }
};

Office.onReady(() => {
  log("Office ready | Host:", Office?.context?.host, "| Platform:", Office?.platform);
});

// —————————————————————————————————————————————
// Ribbon commands (must be globals)
// —————————————————————————————————————————————
window.checkDocumentText = async (event) => {
  const t0 = tnow();
  log("CLICK: Preveri vejice (checkDocumentText)");
  try {
    await runCheckVejice();
    log("DONE: checkDocumentText |", Math.round(tnow() - t0), "ms");
  } catch (err) {
    errL("checkDocumentText failed:", err);
  } finally {
    done(event, "checkDocumentText");
    log("event.completed(): checkDocumentText");
  }
};

window.acceptAllChanges = async (event) => {
  const t0 = tnow();
  log("CLICK: Sprejmi spremembe (acceptAllChanges)");
  try {
    await Word.run(async (context) => {
      const revisions = context.document.revisions;
      revisions.load("items");
      await context.sync();

      const count = revisions.items.length;
      log("Revisions to accept:", count);

      revisions.items.forEach((rev) => rev.accept());
      await context.sync();

      log("Accepted revisions:", count, "|", Math.round(tnow() - t0), "ms");
    });
  } catch (err) {
    errL("acceptAllChanges failed:", err);
  } finally {
    done(event, "acceptAllChanges");
    log("event.completed(): acceptAllChanges");
  }
};

window.rejectAllChanges = async (event) => {
  const t0 = tnow();
  log("CLICK: Zavrni spremembe (rejectAllChanges)");
  try {
    await Word.run(async (context) => {
      const revisions = context.document.revisions;
      revisions.load("items");
      await context.sync();

      const count = revisions.items.length;
      log("Revisions to reject:", count);

      revisions.items.forEach((rev) => rev.reject());
      await context.sync();

      log("Rejected revisions:", count, "|", Math.round(tnow() - t0), "ms");
    });
  } catch (err) {
    errL("rejectAllChanges failed:", err);
  } finally {
    done(event, "rejectAllChanges");
    log("event.completed(): rejectAllChanges");
  }
};
