/* global document, Office, Word, console, window, URLSearchParams */

import {
  checkDocumentText,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  applySuggestionOnlineById,
  rejectSuggestionOnlineById,
  isDocumentCheckInProgress,
  getPendingSuggestionsOnline,
  restorePendingSuggestionsOnlineIfNeeded,
} from "../logic/preveriVejice.js";
import { isWordOnline } from "../utils/host.js";
import {
  readTaskpaneNotifications,
  clearTaskpaneNotifications,
  TASKPANE_NOTIFICATION_EVENT_NAME,
  TASKPANE_NOTIFICATION_STORAGE_KEY,
} from "../utils/notifications.js";

const log = (...args) => console.log("[Vejice Taskpane]", ...args);
const errL = (...args) => console.error("[Vejice Taskpane]", ...args);

let busy = false;
let online = false;
let checkRunInFlight = false;
let currentSuggestionIndex = 0;
let lastCheckClickAt = 0;
const CHECK_CLICK_DEBOUNCE_MS = 800;
const MAX_VISIBLE_NOTIFICATIONS = 30;
let lastNotificationSignature = "";

const resolveManifestMode = () => {
  if (typeof window === "undefined" || typeof URLSearchParams === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search || "");
    const mode = (params.get("mode") || "").trim().toLowerCase();
    if (mode === "web") return "web";
    if (mode === "desktop") return "desktop";
  } catch (err) {
    errL("Failed to resolve taskpane mode from query", err);
  }
  return null;
};

const setStatus = (message) => {
  const statusLine = document.getElementById("status-line");
  if (statusLine) statusLine.textContent = message;
};

const buildNotificationSignature = (items) => {
  if (!Array.isArray(items) || !items.length) return "empty";
  return items.map((item) => `${item.id}:${item.timestamp}`).join("|");
};

const renderNotifications = ({ force = false } = {}) => {
  const listEl = document.getElementById("notification-list");
  const emptyEl = document.getElementById("notification-empty");
  const clearBtn = document.getElementById("btn-clear-notifications");
  if (!listEl || !emptyEl) return;
  const previousListScrollTop = listEl.scrollTop;
  const previousDocScrollTop =
    document.documentElement?.scrollTop ?? document.body?.scrollTop ?? 0;

  const allItems = readTaskpaneNotifications();
  const visibleItems = allItems.slice(-MAX_VISIBLE_NOTIFICATIONS).reverse();
  const signature = buildNotificationSignature(visibleItems);
  if (!force && signature === lastNotificationSignature) return;
  lastNotificationSignature = signature;

  listEl.innerHTML = "";
  if (!visibleItems.length) {
    emptyEl.hidden = false;
    if (clearBtn) clearBtn.disabled = true;
    return;
  }
  emptyEl.hidden = true;
  if (clearBtn) clearBtn.disabled = false;

  for (const item of visibleItems) {
    const li = document.createElement("li");
    const level = typeof item?.level === "string" ? item.level.toLowerCase() : "info";
    const normalizedLevel = level === "error" || level === "warn" ? level : "info";
    li.className = `notification-item notification-item-${normalizedLevel}`;
    const when = Number.isFinite(item?.timestamp)
      ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";
    const source = typeof item?.source === "string" ? item.source : "system";
    li.textContent = `${item?.message || ""}`;
    li.title = [when, source].filter(Boolean).join(" | ");
    listEl.appendChild(li);
  }
  listEl.scrollTop = previousListScrollTop;
  if (document.documentElement) {
    document.documentElement.scrollTop = previousDocScrollTop;
  }
  if (document.body) {
    document.body.scrollTop = previousDocScrollTop;
  }
};

const syncActionButtons = () => {
  const checkBtn = document.getElementById("btn-check");
  const acceptOneBtn = document.getElementById("btn-accept-one");
  const rejectOneBtn = document.getElementById("btn-reject-one");
  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const checkInProgress = isDocumentCheckInProgress();
  const pendingCount = online ? getPendingSuggestionsOnline().length : 0;
  const hasPending = pendingCount > 0;

  if (checkBtn) checkBtn.disabled = busy || checkInProgress;
  if (acceptOneBtn) acceptOneBtn.disabled = busy || !online || checkInProgress || !hasPending;
  if (rejectOneBtn) rejectOneBtn.disabled = busy || !online || checkInProgress || !hasPending;
  if (acceptBtn) acceptBtn.disabled = busy || !online || checkInProgress || !hasPending;
  if (rejectBtn) rejectBtn.disabled = busy || !online || checkInProgress || !hasPending;
};

const setBusy = (nextBusy) => {
  busy = Boolean(nextBusy);
  syncActionButtons();
};

const clampCurrentSuggestionIndex = (total) => {
  if (!Number.isFinite(total) || total <= 0) {
    currentSuggestionIndex = 0;
    return;
  }
  if (currentSuggestionIndex < 0) {
    currentSuggestionIndex = 0;
    return;
  }
  if (currentSuggestionIndex >= total) {
    currentSuggestionIndex = total - 1;
  }
};

const refreshPendingStatus = () => {
  if (!online) return;
  const pending = getPendingSuggestionsOnline();
  clampCurrentSuggestionIndex(pending.length);
  if (!pending.length) {
    setStatus("Pripravljeno. Predlogi: 0.");
    return;
  }
  const ordinal = currentSuggestionIndex + 1;
  setStatus(`Pripravljeno. Predlogi: ${pending.length}. Trenutni: ${ordinal}/${pending.length}.`);
};

const runCheck = async () => {
  const now = Date.now();
  if (now - lastCheckClickAt < CHECK_CLICK_DEBOUNCE_MS) {
    return;
  }
  if (checkRunInFlight || busy || isDocumentCheckInProgress()) {
    setStatus("Preverjanje \u017ee poteka.");
    return;
  }
  lastCheckClickAt = now;
  checkRunInFlight = true;
  setBusy(true);
  clearTaskpaneNotifications();
  renderNotifications({ force: true });
  setStatus("Preverjam dokument...");
  try {
    const summary = await checkDocumentText();
    if (summary?.status === "deferred") {
      setStatus("Po\u010dakajte, da se trenutno opravilo zaklju\u010di.");
    } else if (online) {
      refreshPendingStatus();
    } else if (summary?.status === "blocked") {
      setStatus("Preverjanje ustavljeno. Poglejte obvestila.");
    } else if (summary?.status === "error") {
      setStatus("Napaka pri preverjanju.");
    } else {
      const inserted = Number(summary?.inserted ?? 0);
      const deleted = Number(summary?.deleted ?? 0);
      const totalFixed = inserted + deleted;
      if (totalFixed > 0) {
        setStatus(`Kon\u010dano. Popravki: ${totalFixed} (dodane: ${inserted}, odstranjene: ${deleted}).`);
      } else {
        setStatus("Kon\u010dano.");
      }
    }
  } catch (err) {
    errL("check failed", err);
    setStatus("Napaka pri preverjanju.");
  } finally {
    checkRunInFlight = false;
    setBusy(false);
    syncActionButtons();
  }
};

const runAccept = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Po\u010dakajte, da se preverjanje kon\u010da.");
    return;
  }
  setBusy(true);
  setStatus("Sprejemam vse predloge...");
  try {
    const summary = await applyAllSuggestionsOnline();
    const applied = Number(summary?.appliedSuggestions ?? 0);
    const pending = Number(summary?.pendingAfter ?? 0);
    setStatus(`Sprejeto: ${applied}. Preostalo: ${pending}.`);
    log("accept summary", summary);
  } catch (err) {
    errL("accept failed", err);
    setStatus("Napaka pri sprejemanju.");
  } finally {
    setBusy(false);
    syncActionButtons();
  }
};

const runReject = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Po\u010dakajte, da se preverjanje kon\u010da.");
    return;
  }
  setBusy(true);
  setStatus("Zavra\u010dam vse predloge...");
  try {
    const summary = await rejectAllSuggestionsOnline();
    const rejected = Number(summary?.clearedMarkers ?? 0);
    const reverted = Number(summary?.revertedAppliedSuggestions ?? 0);
    const pending = Number(summary?.pendingAfter ?? 0);
    if (reverted > 0) {
      setStatus(`Zavrnjeno: ${rejected}. Razveljavljeno: ${reverted}. Preostalo: ${pending}.`);
    } else {
      setStatus(`Zavrnjeno: ${rejected}. Preostalo: ${pending}.`);
    }
    log("reject summary", summary);
  } catch (err) {
    errL("reject failed", err);
    setStatus("Napaka pri zavračanju.");
  } finally {
    setBusy(false);
    syncActionButtons();
  }
};

const runAcceptOne = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Počakajte, da se preverjanje konča.");
    return;
  }
  const pendingList = getPendingSuggestionsOnline();
  if (!pendingList.length) {
    setStatus("Ni predlogov za sprejem.");
    return;
  }
  clampCurrentSuggestionIndex(pendingList.length);
  const current = pendingList[currentSuggestionIndex];
  if (!current) {
    setStatus("Predlog ni več na voljo.");
    return;
  }
  setBusy(true);
  setStatus("Sprejemam trenutni predlog...");
  try {
    const summary = await applySuggestionOnlineById(current.id);
    const pendingAfter = Number(summary?.pendingAfter ?? 0);
    const accepted = Number(summary?.appliedSuggestions ?? 0);
    clampCurrentSuggestionIndex(pendingAfter);
    if (summary?.status === "applied" || summary?.status === "partial") {
      if (summary?.reason === "suggestion-skipped-unresolvable") {
        setStatus(`Predloga ni bilo mogoče sprejeti, zato je bil preskočen. Preostalo: ${pendingAfter}.`);
      } else {
        setStatus(`Sprejeto: ${accepted > 0 ? accepted : 1}. Preostalo: ${pendingAfter}.`);
      }
    } else if (summary?.reason === "already-applied") {
      setStatus(`Predlog je bil že upoštevan. Preostalo: ${pendingAfter}.`);
    } else if (summary?.reason === "suggestion-skipped-unresolvable") {
      setStatus(`Predloga ni bilo mogoče sprejeti, zato je bil preskočen. Preostalo: ${pendingAfter}.`);
    } else {
      setStatus("Predloga ni bilo mogoče sprejeti.");
    }
    log("accept one summary", summary);
  } catch (err) {
    errL("accept one failed", err);
    setStatus("Napaka pri sprejemanju predloga.");
  } finally {
    setBusy(false);
    syncActionButtons();
  }
};
const runRejectOne = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Počakajte, da se preverjanje konča.");
    return;
  }
  const pendingList = getPendingSuggestionsOnline();
  if (!pendingList.length) {
    setStatus("Ni predlogov za zavrnitev.");
    return;
  }
  clampCurrentSuggestionIndex(pendingList.length);
  const current = pendingList[currentSuggestionIndex];
  if (!current) {
    setStatus("Predlog ni več na voljo.");
    return;
  }
  setBusy(true);
  setStatus("Zavračam trenutni predlog...");
  try {
    const summary = await rejectSuggestionOnlineById(current.id);
    const pendingAfter = Number(summary?.pendingAfter ?? 0);
    const rejected = Number(summary?.rejectedSuggestions ?? 0);
    const reverted = Number(summary?.revertedAppliedSuggestions ?? 0);
    clampCurrentSuggestionIndex(pendingAfter);
    if (summary?.status === "rejected" || summary?.status === "partial") {
      if (reverted > 0) {
        setStatus(
          `Zavrnjeno: ${rejected > 0 ? rejected : 1}. Razveljavljeno: ${reverted}. Preostalo: ${pendingAfter}.`
        );
      } else {
        setStatus(`Zavrnjeno: ${rejected > 0 ? rejected : 1}. Preostalo: ${pendingAfter}.`);
      }
    } else {
      setStatus("Predloga ni bilo mogoče zavrniti.");
    }
    log("reject one summary", summary);
  } catch (err) {
    errL("reject one failed", err);
    setStatus("Napaka pri zavračanju predloga.");
  } finally {
    setBusy(false);
    syncActionButtons();
  }
};
Office.onReady((info) => {
  if (info.host !== Office.HostType.Word) return;

  const sideload = document.getElementById("sideload-msg");
  const appBody = document.getElementById("app-body");
  if (sideload) sideload.style.display = "none";
  if (appBody) appBody.style.display = "flex";

  const mode = resolveManifestMode();
  online = mode ? mode === "web" : isWordOnline();
  if (online) {
    const restored = restorePendingSuggestionsOnlineIfNeeded();
    if (restored > 0) {
      log("Restored pending suggestions after taskpane load:", restored);
    }
  }

  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const acceptOneBtn = document.getElementById("btn-accept-one");
  const rejectOneBtn = document.getElementById("btn-reject-one");
  const secondaryActions = document.getElementById("secondary-actions");
  const desktopNote = document.getElementById("desktop-note");

  if (!online) {
    if (secondaryActions) secondaryActions.hidden = true;
    if (acceptOneBtn) acceptOneBtn.hidden = true;
    if (rejectOneBtn) rejectOneBtn.hidden = true;
    if (acceptBtn) acceptBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }

  const checkBtn = document.getElementById("btn-check");
  const clearNotificationsBtn = document.getElementById("btn-clear-notifications");
  if (checkBtn) checkBtn.addEventListener("click", () => void runCheck());
  if (acceptOneBtn) acceptOneBtn.addEventListener("click", () => void runAcceptOne());
  if (rejectOneBtn) rejectOneBtn.addEventListener("click", () => void runRejectOne());
  if (acceptBtn) acceptBtn.addEventListener("click", () => void runAccept());
  if (rejectBtn) rejectBtn.addEventListener("click", () => void runReject());
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener("click", () => {
      clearTaskpaneNotifications();
      renderNotifications({ force: true });
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (evt) => {
      if (!evt || evt.key !== TASKPANE_NOTIFICATION_STORAGE_KEY) return;
      renderNotifications({ force: true });
    });
    window.addEventListener(TASKPANE_NOTIFICATION_EVENT_NAME, () => {
      renderNotifications({ force: true });
    });
  }

  setBusy(false);
  syncActionButtons();
  setInterval(syncActionButtons, 500);
  setInterval(() => renderNotifications(), 1000);
  renderNotifications({ force: true });
  refreshPendingStatus();
});
