/* global document, window, Office */

const STORAGE_KEY = "__VEJICE_SKIPPED_PARAGRAPHS__";

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    bindUI();
    renderSkipped();
  }
});

function bindUI() {
  const refresh = document.getElementById("refresh-skipped");
  if (refresh) {
    refresh.onclick = renderSkipped;
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      renderSkipped();
    }
  });
}

function readSkipped() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    console.error("[Vejice TASKPANE] Failed to read skipped paragraphs", err);
    return [];
  }
}

function renderSkipped() {
  const list = document.getElementById("skipped-list");
  const empty = document.getElementById("skipped-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  const data = readSkipped();
  if (!data.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  data.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "skipped-card";

    const meta = document.createElement("div");
    meta.className = "skipped-card__meta";
    const paraLabel = typeof entry.paragraphIndex === "number" ? entry.paragraphIndex + 1 : "?";
    const chunkLabel =
      typeof entry.chunkIndex === "number" ? `, poved ${entry.chunkIndex + 1}` : "";
    meta.textContent = `Odstavek ${paraLabel}${chunkLabel}`;
    card.appendChild(meta);

    const originalLabel = document.createElement("label");
    originalLabel.textContent = "Original:";
    card.appendChild(originalLabel);

    const originalBox = document.createElement("textarea");
    originalBox.readOnly = true;
    originalBox.value = entry.originalText || "";
    card.appendChild(originalBox);

    const correctedLabel = document.createElement("label");
    correctedLabel.textContent = "Predlagano (API):";
    card.appendChild(correctedLabel);

    const correctedBox = document.createElement("textarea");
    correctedBox.readOnly = true;
    correctedBox.value = entry.correctedText || "";
    card.appendChild(correctedBox);

    const copyBtn = document.createElement("button");
    copyBtn.className = "ms-Button";
    copyBtn.innerHTML = '<span class="ms-Button-label">Kopiraj predlog</span>';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(entry.correctedText || "");
      } catch (err) {
        console.error("[Vejice TASKPANE] Failed to copy corrected text", err);
      }
    };
    card.appendChild(copyBtn);

    list.appendChild(card);
  });
}
