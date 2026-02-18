/* global document, Office, Word, console */

import {
  checkDocumentText,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  isDocumentCheckInProgress,
  cancelDocumentCheck,
  getPendingSuggestionsOnline,
} from "../logic/preveriVejice.js";
import { isWordOnline } from "../utils/host.js";

const log = (...args) => console.log("[Vejice Taskpane]", ...args);
const errL = (...args) => console.error("[Vejice Taskpane]", ...args);

let busy = false;
let online = false;
let currentAction = null;

const setStatus = (message) => {
  const statusLine = document.getElementById("status-line");
  if (statusLine) statusLine.textContent = message;
};

const syncActionButtons = () => {
  const checkBtn = document.getElementById("btn-check");
  const cancelBtn = document.getElementById("btn-cancel");
  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  const checkInProgress = isDocumentCheckInProgress();
  const allowCancel = online && (currentAction === "check" || (!busy && checkInProgress));

  if (checkBtn) checkBtn.disabled = busy || checkInProgress;
  if (cancelBtn) cancelBtn.disabled = !allowCancel;
  if (acceptBtn) acceptBtn.disabled = busy || !online || checkInProgress;
  if (rejectBtn) rejectBtn.disabled = busy || !online || checkInProgress;
};

const setBusy = (nextBusy, action = null) => {
  busy = Boolean(nextBusy);
  currentAction = busy ? action : null;
  syncActionButtons();
};

const refreshPendingStatus = () => {
  if (!online) return;
  const pending = getPendingSuggestionsOnline();
  setStatus(`Pripravljeno. Predlogi: ${pending.length}.`);
};

const runCheck = async () => {
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Preverjanje ze poteka.");
    return;
  }
  setBusy(true, "check");
  setStatus("Preverjam dokument...");
  try {
    const summary = await checkDocumentText();
    if (summary?.status === "deferred") {
      setStatus("Počakajte, da se trenutno opravilo zaključi.");
    } else {
      refreshPendingStatus();
    }
  } catch (err) {
    errL("check failed", err);
    setStatus("Napaka pri preverjanju.");
  } finally {
    setBusy(false, null);
    syncActionButtons();
  }
};

const runAccept = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Pocakajte, da se preverjanje konca.");
    return;
  }
  setBusy(true, "apply");
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
    setBusy(false, null);
    syncActionButtons();
  }
};

const runReject = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Pocakajte, da se preverjanje konca.");
    return;
  }
  setBusy(true, "reject");
  setStatus("Zavracam predloge...");
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
    setBusy(false, null);
    syncActionButtons();
  }
};

const runCancel = () => {
  if (!online) return;
  const cancelled = cancelDocumentCheck();
  if (cancelled) {
    setStatus("Prekinjam pregled...");
  } else {
    setStatus("Ni aktivnega pregleda za prekinitev.");
  }
  syncActionButtons();
};

Office.onReady((info) => {
  if (info.host !== Office.HostType.Word) return;

  const sideload = document.getElementById("sideload-msg");
  const appBody = document.getElementById("app-body");
  if (sideload) sideload.style.display = "none";
  if (appBody) appBody.style.display = "flex";

  online = isWordOnline();

  const hostLine = document.getElementById("host-line");
  if (hostLine) {
    hostLine.textContent = online ? "Word Online" : "Word Desktop";
  }

  const acceptBtn = document.getElementById("btn-accept");
  const cancelBtn = document.getElementById("btn-cancel");
  const rejectBtn = document.getElementById("btn-reject");
  const desktopNote = document.getElementById("desktop-note");

  if (!online) {
    if (acceptBtn) acceptBtn.hidden = true;
    if (cancelBtn) cancelBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }

  const checkBtn = document.getElementById("btn-check");
  if (checkBtn) checkBtn.addEventListener("click", () => void runCheck());
  if (cancelBtn) cancelBtn.addEventListener("click", () => runCancel());
  if (acceptBtn) acceptBtn.addEventListener("click", () => void runAccept());
  if (rejectBtn) rejectBtn.addEventListener("click", () => void runReject());

  setBusy(false, null);
  syncActionButtons();
  setInterval(syncActionButtons, 500);
  refreshPendingStatus();
});
