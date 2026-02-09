/* global Office, Word, window, process, performance, console, URLSearchParams */

// Wire your checker and expose globals the manifest calls.
import {
  checkDocumentText as runCheckVejice,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  getPendingSuggestionsOnline,
} from "../logic/preveriVejice.js";
import { isWordOnline } from "../utils/host.js";

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

const revisionsApiSupported = () => {
  try {
    return Boolean(Office?.context?.requirements?.isSetSupported?.("WordApi", "1.3"));
  } catch (err) {
    errL("Failed to check requirement set support", err);
    return false;
  }
};

const boolFromString = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return undefined;
    if (["1", "true", "yes", "on"].includes(trimmed)) return true;
    if (["0", "false", "no", "off"].includes(trimmed)) return false;
  }
  return undefined;
};

let queryMockFlag;
if (typeof window !== "undefined" && typeof URLSearchParams !== "undefined") {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const q = params.get("mock");
    if (q !== null) queryMockFlag = boolFromString(q);
  } catch (err) {
    errL("Failed to parse ?mock query param", err);
  }
}

const envMockFlag =
  typeof process !== "undefined" ? boolFromString(process.env?.VEJICE_USE_MOCK ?? "") : undefined;
let resolvedMock;
if (typeof queryMockFlag === "boolean") {
  resolvedMock = queryMockFlag;
} else if (typeof envMockFlag === "boolean") {
  resolvedMock = envMockFlag;
}

if (typeof window !== "undefined" && typeof resolvedMock === "boolean") {
  window.__VEJICE_USE_MOCK__ = resolvedMock;
  if (resolvedMock) log("Mock API mode is ENABLED");
}

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
    if (isWordOnline()) {
      const pendingBefore = getPendingSuggestionsOnline(true)?.length ?? 0;
      log("Pending online suggestions before apply:", pendingBefore);
      await applyAllSuggestionsOnline();
      const pendingAfter = getPendingSuggestionsOnline(true)?.length ?? 0;
      log("Pending online suggestions after apply:", pendingAfter);
      log("Applied online suggestions |", Math.round(tnow() - t0), "ms");
    } else {
      if (!revisionsApiSupported()) {
        throw new Error("Revisions API is not available on this host");
      }
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
    }
  } catch (err) {
    if (err?.message?.includes("Revisions API is not available")) {
      errL("acceptAllChanges skipped: revisions API is not available on this host");
    } else {
      errL("acceptAllChanges failed:", err);
    }
  } finally {
    done(event, "acceptAllChanges");
    log("event.completed(): acceptAllChanges");
  }
};

window.rejectAllChanges = async (event) => {
  const t0 = tnow();
  log("CLICK: Zavrni spremembe (rejectAllChanges)");
  try {
    if (isWordOnline()) {
      await rejectAllSuggestionsOnline();
      log("Cleared online suggestions |", Math.round(tnow() - t0), "ms");
    } else {
      if (!revisionsApiSupported()) {
        throw new Error("Revisions API is not available on this host");
      }
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
    }
  } catch (err) {
    if (err?.message?.includes("Revisions API is not available")) {
      errL("rejectAllChanges skipped: revisions API is not available on this host");
    } else {
      errL("rejectAllChanges failed:", err);
    }
  } finally {
    done(event, "rejectAllChanges");
    log("event.completed(): rejectAllChanges");
  }
};
