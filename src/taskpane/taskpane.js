/* global document, Office, Word, console, window, URLSearchParams, navigator, process, __VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS__, __VEJICE_BUILD_QUIET_LOGS__, __VEJICE_BUILD_ONLINE_VERBOSE_LOGS__, __VEJICE_BUILD_ONLINE_DRIFT_LOGS__, __VEJICE_BUILD_DEBUG__ */

import {
  checkDocumentText,
  clearPendingSuggestionHighlightsOnline,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  applySuggestionOnlineById,
  rejectSuggestionOnlineById,
  isDocumentCheckInProgress,
  cancelDocumentCheck,
  forceResetDocumentCheckState,
  getPendingSuggestionsOnline,
  restorePendingSuggestionsOnlineIfNeeded,
  RUNTIME_STATE_EVENT_NAME,
  RUNTIME_STATE_STORAGE_KEY,
} from "../logic/preveriVejice.js";
import { isWordOnline } from "../utils/host.js";
import {
  readTaskpaneNotifications,
  clearTaskpaneNotifications,
  TASKPANE_NOTIFICATION_EVENT_NAME,
  TASKPANE_NOTIFICATION_STORAGE_KEY,
} from "../utils/notifications.js";

const parseBooleanFlag = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};
const getBuildBooleanFlag = (flagName) => {
  try {
    switch (flagName) {
      case "quiet":
        return typeof __VEJICE_BUILD_QUIET_LOGS__ === "boolean" ? __VEJICE_BUILD_QUIET_LOGS__ : undefined;
      case "onlineVerbose":
        return typeof __VEJICE_BUILD_ONLINE_VERBOSE_LOGS__ === "boolean"
          ? __VEJICE_BUILD_ONLINE_VERBOSE_LOGS__
          : undefined;
      case "onlineDrift":
        return typeof __VEJICE_BUILD_ONLINE_DRIFT_LOGS__ === "boolean"
          ? __VEJICE_BUILD_ONLINE_DRIFT_LOGS__
          : undefined;
      case "debug":
        return typeof __VEJICE_BUILD_DEBUG__ === "boolean" ? __VEJICE_BUILD_DEBUG__ : undefined;
      default:
        return undefined;
    }
  } catch (_err) {
    return undefined;
  }
};
const applyBuildDebugFlagsToWindow = () => {
  if (typeof window === "undefined") return;
  const quiet = getBuildBooleanFlag("quiet");
  const onlineVerbose = getBuildBooleanFlag("onlineVerbose");
  const onlineDrift = getBuildBooleanFlag("onlineDrift");
  const debug = getBuildBooleanFlag("debug");
  if (typeof quiet === "boolean" && typeof window.__VEJICE_QUIET_LOGS__ !== "boolean") {
    window.__VEJICE_QUIET_LOGS__ = quiet;
  }
  if (
    typeof onlineVerbose === "boolean" &&
    typeof window.__VEJICE_ONLINE_VERBOSE_LOGS__ !== "boolean"
  ) {
    window.__VEJICE_ONLINE_VERBOSE_LOGS__ = onlineVerbose;
  }
  if (
    typeof onlineDrift === "boolean" &&
    typeof window.__VEJICE_ONLINE_DRIFT_LOGS__ !== "boolean"
  ) {
    window.__VEJICE_ONLINE_DRIFT_LOGS__ = onlineDrift;
  }
  if (typeof debug === "boolean" && typeof window.__VEJICE_DEBUG__ !== "boolean") {
    window.__VEJICE_DEBUG__ = debug;
  }
};
applyBuildDebugFlagsToWindow();
const isTaskpaneDebugEnabled = () => {
  if (typeof window !== "undefined") {
    const onlineVerboseOverride = parseBooleanFlag(window.__VEJICE_ONLINE_VERBOSE_LOGS__);
    if (typeof onlineVerboseOverride === "boolean") return onlineVerboseOverride;
    const debugOverride = parseBooleanFlag(window.__VEJICE_DEBUG__);
    if (typeof debugOverride === "boolean") return debugOverride;
  }
  const buildOnlineVerbose = getBuildBooleanFlag("onlineVerbose");
  if (typeof buildOnlineVerbose === "boolean") return buildOnlineVerbose;
  const buildDebug = getBuildBooleanFlag("debug");
  if (typeof buildDebug === "boolean") return buildDebug;
  if (typeof process !== "undefined") {
    const envOnlineVerbose = parseBooleanFlag(process.env?.VEJICE_ONLINE_VERBOSE_LOGS);
    if (typeof envOnlineVerbose === "boolean") return envOnlineVerbose;
    const envDebug = parseBooleanFlag(process.env?.VEJICE_DEBUG);
    if (typeof envDebug === "boolean") return envDebug;
  }
  return false;
};
const log = (...args) => {
  if (!isTaskpaneDebugEnabled()) return;
  console.log("[Vejice Taskpane]", ...args);
};
const errL = (...args) => {
  if (!isTaskpaneDebugEnabled()) return;
  console.error("[Vejice Taskpane]", ...args);
};
const ENABLE_ONLINE_REVIEW_ACTIONS =
  typeof __VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS__ === "boolean"
    ? __VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS__
    : false;

const isLikelyAddinRuntimeError = (eventOrReason) => {
  try {
    const filename = String(eventOrReason?.filename || "").toLowerCase();
    const stack = String(eventOrReason?.stack || eventOrReason?.reason?.stack || "").toLowerCase();
    if (filename.includes("localhost:4001")) return true;
    if (stack.includes("localhost:4001")) return true;
    if (stack.includes("taskpane.js") || stack.includes("preverivejice.js")) return true;
  } catch (_err) {
    // ignore inspection failures
  }
  return false;
};

const reportStartupError = (label, payload) => {
  errL(label, payload);
  try {
    const rawMessage =
      payload?.message ||
      payload?.reason?.message ||
      payload?.reason ||
      payload?.error?.message ||
      payload?.error ||
      payload;
    const message = String(rawMessage || "Neznana napaka");
    const statusLine = document.getElementById("status-line");
    if (statusLine) {
      statusLine.textContent = `Napaka ob zagonu: ${message}`;
    }
  } catch (_err) {
    // ignore UI reporting failures
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (!isLikelyAddinRuntimeError(event)) return;
    reportStartupError("window.error", event?.error || event?.message || event);
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason ?? event;
    if (!isLikelyAddinRuntimeError(reason)) return;
    reportStartupError("window.unhandledrejection", reason);
  });
}

let busy = false;
let online = false;
let checkRunInFlight = false;
let currentSuggestionIndex = 0;
let lastCheckClickAt = 0;
const CHECK_CLICK_DEBOUNCE_MS = 800;
const MAX_VISIBLE_NOTIFICATIONS = 30;
let lastNotificationSignature = "";
const CHECK_RUN_WATCHDOG_MS = 120000;
const CHECK_GENERIC_ERROR_MESSAGE = "Napaka. Poskusite \u0161e enkrat.";
const CHECK_OFFLINE_HINT_MESSAGE = "Preverite internetno povezavo.";
const UI_REFRESH_DEBOUNCE_MS = 120;
let uiRefreshTimerId = null;
let pendingUiRefresh = {
  forceNotifications: false,
  includePendingStatus: false,
};

const isOffline = () => {
  try {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  } catch (_err) {
    return false;
  }
};

const withCheckWatchdog = async (promiseFactory, timeoutMs = CHECK_RUN_WATCHDOG_MS) => {
  let timeoutId = null;
  try {
    return await Promise.race([
      Promise.resolve().then(() => promiseFactory()),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const watchdogError = new Error("check-watchdog-timeout");
          watchdogError.code = "CHECK_WATCHDOG_TIMEOUT";
          reject(watchdogError);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const canUseOnlineReviewActions = () => online && ENABLE_ONLINE_REVIEW_ACTIONS;

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

const syncStatusLoadingIndicator = () => {
  const statusRoot = document.querySelector(".taskpane-status");
  if (!statusRoot) return;
  const loading = busy || checkRunInFlight || isDocumentCheckInProgress();
  statusRoot.classList.toggle("taskpane-status-loading", loading);
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
  const clearHighlightsBtn = document.getElementById("btn-clear-highlights");
  const acceptOneBtn = document.getElementById("btn-accept-one");
  const rejectOneBtn = document.getElementById("btn-reject-one");
  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const checkInProgress = isDocumentCheckInProgress();
  const reviewActionsEnabled = canUseOnlineReviewActions();
  const pendingCount = online ? getPendingSuggestionsOnline().length : 0;
  const hasPending = pendingCount > 0;

  syncStatusLoadingIndicator();
  if (checkBtn) checkBtn.disabled = busy || checkInProgress;
  if (clearHighlightsBtn) clearHighlightsBtn.disabled = busy || !online || checkInProgress || !hasPending;
  if (acceptOneBtn) acceptOneBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (rejectOneBtn) rejectOneBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (acceptBtn) acceptBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
  if (rejectBtn) rejectBtn.disabled = busy || !reviewActionsEnabled || checkInProgress || !hasPending;
};

const setBusy = (nextBusy) => {
  busy = Boolean(nextBusy);
  scheduleUiRefresh({ immediate: true });
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
    setStatus("Končano. Predlogi: 0.");
    return;
  }
  setStatus(`Končano. Predlogi: ${pending.length}.`);
};

const flushUiRefresh = ({ forceNotifications = false, includePendingStatus = false } = {}) => {
  syncActionButtons();
  renderNotifications({ force: forceNotifications });
  if (includePendingStatus && !busy && !checkRunInFlight && !isDocumentCheckInProgress()) {
    refreshPendingStatus();
  }
};

const scheduleUiRefresh = ({ forceNotifications = false, includePendingStatus = false, immediate = false } = {}) => {
  if (immediate) {
    if (uiRefreshTimerId) {
      clearTimeout(uiRefreshTimerId);
      uiRefreshTimerId = null;
    }
    pendingUiRefresh = {
      forceNotifications: false,
      includePendingStatus: false,
    };
    flushUiRefresh({ forceNotifications, includePendingStatus });
    return;
  }
  pendingUiRefresh.forceNotifications = pendingUiRefresh.forceNotifications || forceNotifications;
  pendingUiRefresh.includePendingStatus = pendingUiRefresh.includePendingStatus || includePendingStatus;
  if (uiRefreshTimerId) return;
  uiRefreshTimerId = setTimeout(() => {
    const refreshPayload = pendingUiRefresh;
    pendingUiRefresh = {
      forceNotifications: false,
      includePendingStatus: false,
    };
    uiRefreshTimerId = null;
    flushUiRefresh(refreshPayload);
  }, UI_REFRESH_DEBOUNCE_MS);
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
  scheduleUiRefresh({ forceNotifications: true, immediate: true });
  if (isOffline()) {
    setStatus(`${CHECK_GENERIC_ERROR_MESSAGE} ${CHECK_OFFLINE_HINT_MESSAGE}`);
    checkRunInFlight = false;
    setBusy(false);
    return;
  }
  setStatus("Preverjam dokument ...");
  log("runCheck:start", {
    online,
    busy,
    checkRunInFlight,
    checkInProgress: isDocumentCheckInProgress(),
  });
  try {
    const summary = await withCheckWatchdog(() => checkDocumentText());
    log("runCheck:summary", summary);
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
      const detected = Number(summary?.detected ?? 0);
      const apiErrors = Number(summary?.apiErrors ?? 0);
      const nonCommaSkips = Number(summary?.nonCommaSkips ?? 0);
      const totalFixed = inserted + deleted;
      if (totalFixed === 0 && detected === 0 && apiErrors === 0 && nonCommaSkips === 0) {
        setStatus("Kon\u010dano. Ni bilo najdenih manjkajo\u010dih ali napa\u010dnih vejic.");
      } else if (totalFixed > 0) {
        setStatus(`Kon\u010dano. Popravki: ${totalFixed} (dodane: ${inserted}, odstranjene: ${deleted}).`);
      } else {
        setStatus("Kon\u010dano.");
      }
    }
  } catch (err) {
    errL("check failed", err);
    const timedOut = String(err?.code || err?.message || "").includes("CHECK_WATCHDOG_TIMEOUT");
    if (timedOut) {
      try {
        cancelDocumentCheck("ui-watchdog-timeout");
      } catch (_cancelErr) {
        // ignore cancellation failures
      }
      try {
        forceResetDocumentCheckState("ui-watchdog-timeout");
      } catch (_resetErr) {
        // ignore forced reset failures
      }
    }
    if (isOffline()) {
      setStatus(`${CHECK_GENERIC_ERROR_MESSAGE} ${CHECK_OFFLINE_HINT_MESSAGE}`);
    } else {
      setStatus(CHECK_GENERIC_ERROR_MESSAGE);
    }
  } finally {
    log("runCheck:finally", {
      online,
      busy,
      checkRunInFlight,
      checkInProgress: isDocumentCheckInProgress(),
    });
    checkRunInFlight = false;
    setBusy(false);
  }
};

const runClearHighlights = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Po\u010dakajte, da se preverjanje kon\u010da.");
    return;
  }
  setBusy(true);
  setStatus("Bri\u0161em ozna\u010dbe ...");
  try {
    const summary = await clearPendingSuggestionHighlightsOnline();
    const cleared = Number(summary?.clearedMarkers ?? 0);
    const pending = Number(summary?.pendingAfter ?? 0);
    if (summary?.status === "deferred") {
      setStatus("Po\u010dakajte, da se trenutno opravilo zaklju\u010di.");
    } else if (cleared > 0) {
      setStatus(`Ozna\u010dbe pobrisane: ${cleared}. Predlogi: ${pending}.`);
    } else {
      setStatus("Ni ozna\u010db za pobrisati.");
    }
    log("clear highlights summary", summary);
  } catch (err) {
    errL("clear highlights failed", err);
    setStatus("Napaka pri brisanju ozna\u010db.");
  } finally {
    setBusy(false);
  }
};

const runAccept = async () => {
  if (!canUseOnlineReviewActions()) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Po\u010dakajte, da se preverjanje kon\u010da.");
    return;
  }
  setBusy(true);
  setStatus("Sprejemam vse predloge ...");
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
  }
};

const runReject = async () => {
  if (!canUseOnlineReviewActions()) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Po\u010dakajte, da se preverjanje kon\u010da.");
    return;
  }
  setBusy(true);
  setStatus("Zavra\u010dam vse predloge ...");
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
  }
};

const runAcceptOne = async () => {
  if (!canUseOnlineReviewActions()) return;
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
  setStatus("Sprejemam trenutni predlog ...");
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
  }
};
const runRejectOne = async () => {
  if (!canUseOnlineReviewActions()) return;
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
  setStatus("Zavračam trenutni predlog ...");
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
  log("taskpane:ready", {
    host: info.host,
    platform: Office?.context?.platform,
    mode,
    online,
    href: typeof window !== "undefined" ? window.location.href : "",
  });
  // Notifications are persisted in localStorage and can leak across documents.
  // Start each taskpane session clean to avoid showing stale messages in new docs.
  clearTaskpaneNotifications();
  lastNotificationSignature = "";
  if (online) {
    const restored = restorePendingSuggestionsOnlineIfNeeded();
    if (restored > 0) {
      log("Restored pending suggestions after taskpane load:", restored);
    }
  }

  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const clearHighlightsBtn = document.getElementById("btn-clear-highlights");
  const acceptOneBtn = document.getElementById("btn-accept-one");
  const rejectOneBtn = document.getElementById("btn-reject-one");
  const secondaryActions = document.getElementById("secondary-actions");
  const desktopNote = document.getElementById("desktop-note");
  const showOnlineReviewActions = canUseOnlineReviewActions();

  if (!showOnlineReviewActions) {
    if (secondaryActions) secondaryActions.hidden = true;
    if (acceptOneBtn) acceptOneBtn.hidden = true;
    if (rejectOneBtn) rejectOneBtn.hidden = true;
    if (acceptBtn) acceptBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
  }
  if (!online) {
    if (clearHighlightsBtn) clearHighlightsBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }

  const checkBtn = document.getElementById("btn-check");
  const clearHighlightsActionBtn = document.getElementById("btn-clear-highlights");
  const clearNotificationsBtn = document.getElementById("btn-clear-notifications");
  if (checkBtn) checkBtn.addEventListener("click", () => void runCheck());
  if (clearHighlightsActionBtn) clearHighlightsActionBtn.addEventListener("click", () => void runClearHighlights());
  if (showOnlineReviewActions && acceptOneBtn) acceptOneBtn.addEventListener("click", () => void runAcceptOne());
  if (showOnlineReviewActions && rejectOneBtn) rejectOneBtn.addEventListener("click", () => void runRejectOne());
  if (showOnlineReviewActions && acceptBtn) acceptBtn.addEventListener("click", () => void runAccept());
  if (showOnlineReviewActions && rejectBtn) rejectBtn.addEventListener("click", () => void runReject());
  if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener("click", () => {
      clearTaskpaneNotifications();
      scheduleUiRefresh({ forceNotifications: true, immediate: true });
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (evt) => {
      if (!evt) return;
      if (evt.key === TASKPANE_NOTIFICATION_STORAGE_KEY) {
        scheduleUiRefresh({ forceNotifications: true });
        return;
      }
      if (evt.key === RUNTIME_STATE_STORAGE_KEY) {
        scheduleUiRefresh({ includePendingStatus: true });
      }
    });
    window.addEventListener(TASKPANE_NOTIFICATION_EVENT_NAME, () => {
      scheduleUiRefresh({ forceNotifications: true });
    });
    window.addEventListener(RUNTIME_STATE_EVENT_NAME, () => {
      scheduleUiRefresh();
    });
    window.addEventListener("focus", () => {
      scheduleUiRefresh({ includePendingStatus: true });
    });
    window.addEventListener("online", () => {
      scheduleUiRefresh({ includePendingStatus: true });
    });
    window.addEventListener("offline", () => {
      scheduleUiRefresh();
    });
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      scheduleUiRefresh({ includePendingStatus: true });
    });
  }

  busy = false;
  scheduleUiRefresh({
    forceNotifications: true,
    includePendingStatus: true,
    immediate: true,
  });
});
