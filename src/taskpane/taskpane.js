/* global document, Office, Word, console */

import {
  checkDocumentText,
  applyAllSuggestionsOnline,
  rejectAllSuggestionsOnline,
  isDocumentCheckInProgress,
  getPendingSuggestionsOnline,
} from "../logic/preveriVejice.js";
import { isWordOnline } from "../utils/host.js";

const log = (...args) => console.log("[Vejice Taskpane]", ...args);
const errL = (...args) => console.error("[Vejice Taskpane]", ...args);

let busy = false;
let online = false;

const setStatus = (message) => {
  const statusLine = document.getElementById("status-line");
  if (statusLine) statusLine.textContent = message;
};

const setBusy = (nextBusy) => {
  busy = Boolean(nextBusy);
  const checkBtn = document.getElementById("btn-check");
  const acceptBtn = document.getElementById("btn-accept");
  const rejectBtn = document.getElementById("btn-reject");
  if (checkBtn) checkBtn.disabled = busy;
  if (acceptBtn) acceptBtn.disabled = busy || !online;
  if (rejectBtn) rejectBtn.disabled = busy || !online;
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
  setBusy(true);
  setStatus("Preverjam dokument...");
  try {
    await checkDocumentText();
    refreshPendingStatus();
  } catch (err) {
    errL("check failed", err);
    setStatus("Napaka pri preverjanju.");
  } finally {
    setBusy(false);
  }
};

const runAccept = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Pocakajte, da se preverjanje konca.");
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
  }
};

const runReject = async () => {
  if (!online) return;
  if (busy || isDocumentCheckInProgress()) {
    setStatus("Pocakajte, da se preverjanje konca.");
    return;
  }
  setBusy(true);
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
    setBusy(false);
  }
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
  const rejectBtn = document.getElementById("btn-reject");
  const desktopNote = document.getElementById("desktop-note");

  if (!online) {
    if (acceptBtn) acceptBtn.hidden = true;
    if (rejectBtn) rejectBtn.hidden = true;
    if (desktopNote) desktopNote.hidden = false;
  }

  const checkBtn = document.getElementById("btn-check");
  if (checkBtn) checkBtn.addEventListener("click", () => void runCheck());
  if (acceptBtn) acceptBtn.addEventListener("click", () => void runAccept());
  if (rejectBtn) rejectBtn.addEventListener("click", () => void runReject());

  setBusy(false);
  refreshPendingStatus();
});
