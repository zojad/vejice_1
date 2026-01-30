const SPACE_EQUIVALENTS_REGEX = /[\u00A0\u202F\u2007]/g;
const TOKEN_REPEAT_LEADING_REGEX = /^[\s"'“”„()«»]+/g;
const TOKEN_REPEAT_TRAILING_REGEX = /[\s,.;:!?'"“”„()«»]+$/g;

export function normalizeParagraphWhitespace(text) {
  if (typeof text !== "string" || !text.length) return typeof text === "string" ? text : "";
  return text.replace(SPACE_EQUIVALENTS_REGEX, " ");
}

export function normalizeParagraphForEquality(text) {
  if (typeof text !== "string") return "";
  let normalized = normalizeParagraphWhitespace(text);
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(/\s+,/g, ",");
  normalized = normalized.replace(/,\s*(?=\S)/g, ", ");
  return normalized.trim();
}

export function normalizeTokenRepeatKey(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(TOKEN_REPEAT_LEADING_REGEX, "")
    .replace(TOKEN_REPEAT_TRAILING_REGEX, "")
    .trim()
    .toLowerCase();
}

export const QUOTES = new Set(['"', "'", "“", "”", "„", "«", "»"]);

export const isDigit = (ch) => ch >= "0" && ch <= "9";
export const charAtSafe = (s, i) => (i >= 0 && i < s.length ? s[i] : "");

export function isNumericComma(original, corrected, kind, pos) {
  const s = kind === "delete" ? original : corrected;
  const prev = charAtSafe(s, pos - 1);
  const next = charAtSafe(s, pos + 1);
  return isDigit(prev) && isDigit(next);
}

export function normalizeForComparison(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "");
}

export function onlyCommasChanged(original, corrected) {
  return normalizeForComparison(original) === normalizeForComparison(corrected);
}

export function findCommaAfterWhitespace(text, startIndex) {
  if (typeof text !== "string" || startIndex < 0 || startIndex >= text.length) {
    return -1;
  }
  let idx = startIndex;
  let sawWhitespace = false;
  while (idx < text.length && /\s/.test(text[idx])) {
    sawWhitespace = true;
    idx++;
  }
  if (!sawWhitespace || idx >= text.length) {
    return -1;
  }
  if (text[idx] === ",") {
    return idx;
  }
  return -1;
}

export function makeAnchor(text, idx, span = 16) {
  const left = text.slice(Math.max(0, idx - span), idx);
  const right = text.slice(idx, Math.min(text.length, idx + span));
  return { left, right };
}
