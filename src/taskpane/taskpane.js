/* global document, Office, Word, console, window, URLSearchParams */

import {
  checkDocumentText,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  isDocumentCheckInProgress,
  getPendingSuggestionsOnline,
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
};

const syncActionButtons = () => {
  const checkBtn = document.getElementById("btn-check");
  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const checkInProgress = isDocumentCheckInProgress();

  if (checkBtn) checkBtn.disabled = busy || checkInProgress;
  if (acceptBtn) acceptBtn.disabled = busy || !online || checkInProgress;
  if (rejectBtn) rejectBtn.disabled = busy || !online || checkInProgress;
};

const setBusy = (nextBusy) => {
  busy = Boolean(nextBusy);
  syncActionButtons();
};

const refreshPendingStatus = () => {
  if (!online) return;
  const pending = getPendingSuggestionsOnline();
  setStatus(`Pripravljeno. Predlogi: ${pending.length}.`);
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
  setStatus("Sprejemam predloge...");
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
  setStatus("Zavra\u010dam predloge...");
  try {
    const summary = await rejectAllSuggestionsOnline();
    const rejected = Number(summary?.clearedMarkers ?? 0);
    const pending = Number(summary?.pendingAfter ?? 0);
    setStatus(`Zavrnjeno: ${rejected}. Preostalo: ${pending}.`);
    log("reject summary", summary);
  } catch (err) {
    errL("reject failed", err);
    setStatus("Napaka pri zavracanju.");
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

  const hostLine = document.getElementById("host-line");
  if (hostLine) {
    hostLine.textContent = online ? "Word Online" : "Word Desktop";
  }

  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const desktopNote = document.getElementById("desktop-note");

  if (!online) {
    if (acceptBtn) acceptBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }

  const checkBtn = document.getElementById("btn-check");
  const clearNotificationsBtn = document.getElementById("btn-clear-notifications");
  if (checkBtn) checkBtn.addEventListener("click", () => void runCheck());
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
