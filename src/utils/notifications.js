/* global window, process */

const DEFAULT_STORAGE_KEY = "vejice.ui.notifications.v1";
const DEFAULT_EVENT_NAME = "vejice:notifications-updated";
const DEFAULT_MAX_ITEMS = 120;
const VALID_LEVELS = new Set(["info", "warn", "error"]);

export const TASKPANE_NOTIFICATION_STORAGE_KEY = DEFAULT_STORAGE_KEY;
export const TASKPANE_NOTIFICATION_EVENT_NAME = DEFAULT_EVENT_NAME;

const toBool = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
};

function safeGetStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage || null;
  } catch (_err) {
    return null;
  }
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  if (!message) return null;
  const timestamp = Number.isFinite(raw.timestamp) ? raw.timestamp : Date.now();
  const source = typeof raw.source === "string" && raw.source ? raw.source : "system";
  const requestedLevel = typeof raw.level === "string" ? raw.level.trim().toLowerCase() : "";
  const level = VALID_LEVELS.has(requestedLevel) ? requestedLevel : "info";
  const id =
    typeof raw.id === "string" && raw.id
      ? raw.id
      : `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    message,
    timestamp,
    source,
    level,
  };
}

function parseStoredEntries(storage, key) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeEntry(item)).filter(Boolean);
  } catch (_err) {
    return [];
  }
}

function writeStoredEntries(storage, key, entries) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(entries));
    return true;
  } catch (_err) {
    return false;
  }
}

function emitNotificationEvent() {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  try {
    if (typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent(DEFAULT_EVENT_NAME));
      return;
    }
  } catch (_err) {
    // fall back to basic Event
  }
  try {
    if (typeof Event === "function") {
      window.dispatchEvent(new Event(DEFAULT_EVENT_NAME));
    }
  } catch (_err) {
    // ignore
  }
}

export function shouldUseToastFallback() {
  if (typeof window !== "undefined") {
    const fromWindow = toBool(window.__VEJICE_USE_TOAST_NOTIFICATIONS__);
    if (typeof fromWindow === "boolean") return fromWindow;
  }
  if (typeof process !== "undefined") {
    const fromEnv = toBool(process.env?.VEJICE_USE_TOAST_NOTIFICATIONS);
    if (typeof fromEnv === "boolean") return fromEnv;
  }
  return false;
}

export function readTaskpaneNotifications() {
  const storage = safeGetStorage();
  return parseStoredEntries(storage, DEFAULT_STORAGE_KEY);
}

export function clearTaskpaneNotifications() {
  const storage = safeGetStorage();
  if (!storage) return false;
  try {
    storage.removeItem(DEFAULT_STORAGE_KEY);
    emitNotificationEvent();
    return true;
  } catch (_err) {
    return false;
  }
}

export function publishTaskpaneNotifications(messages, options = {}) {
  const source = typeof options.source === "string" && options.source ? options.source : "system";
  const requestedLevel =
    typeof options.level === "string" ? options.level.trim().toLowerCase() : "";
  const level = VALID_LEVELS.has(requestedLevel) ? requestedLevel : "info";
  const normalizedMessages = [];
  for (const item of Array.isArray(messages) ? messages : [messages]) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (!trimmed) continue;
      normalizedMessages.push({
        message: trimmed,
        source,
        level,
      });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const message = typeof item.message === "string" ? item.message.trim() : "";
    if (!message) continue;
    const itemSource = typeof item.source === "string" && item.source ? item.source : source;
    const itemRequestedLevel = typeof item.level === "string" ? item.level.trim().toLowerCase() : "";
    const itemLevel = VALID_LEVELS.has(itemRequestedLevel) ? itemRequestedLevel : level;
    normalizedMessages.push({
      message,
      source: itemSource,
      level: itemLevel,
    });
  }
  if (!normalizedMessages.length) return 0;

  const limit = Number.isFinite(options.limit) ? Math.max(1, Math.floor(options.limit)) : DEFAULT_MAX_ITEMS;
  const storage = safeGetStorage();
  if (!storage) return 0;

  const existing = parseStoredEntries(storage, DEFAULT_STORAGE_KEY);
  const next = [...existing];
  const now = Date.now();
  for (let i = 0; i < normalizedMessages.length; i++) {
    next.push(
      normalizeEntry({
        message: normalizedMessages[i].message,
        source: normalizedMessages[i].source,
        level: normalizedMessages[i].level,
        timestamp: now + i,
      })
    );
  }
  const trimmed = next.slice(-limit);
  const written = writeStoredEntries(storage, DEFAULT_STORAGE_KEY, trimmed);
  if (written) emitNotificationEvent();
  return written ? normalizedMessages.length : 0;
}
