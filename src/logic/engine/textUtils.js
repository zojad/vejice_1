const SPACE_EQUIVALENTS_REGEX = /[\u00A0\u202F\u2007]/g;
const TOKEN_REPEAT_LEADING_REGEX = /^[\s"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+/gu;
const TOKEN_REPEAT_TRAILING_REGEX = /[\s,.;:!?"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+$/gu;

// Helper to strip leading/trailing quotes and punctuation from API tokens
// so they can be found in paragraph text (critical fix for quote-containing tokens)
// Includes all quote types: straight ("), curly (""), guillemets («»), and single quotes ('')
export function stripTokenBoundaryPunctuation(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/^[\s"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+/gu, "")
    .replace(/[\s,.;:!?"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+$/gu, "")
    .trim();
}

// Extract leading/trailing quotes and punctuation for metadata preservation
// This preserves quote boundary info even though we strip it from token text for matching
export function extractTokenBoundaryMetadata(text) {
  if (typeof text !== "string") return { leadingBoundary: "", trailingBoundary: "", cleanText: "" };
  
  // Extract leading boundary
  const leadingMatch = text.match(/^[\s"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+/u);
  const leadingBoundary = leadingMatch ? leadingMatch[0] : "";
  
  // Extract trailing boundary
  const trailingMatch = text.match(/[\s,.;:!?"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+$/u);
  const trailingBoundary = trailingMatch ? trailingMatch[0] : "";
  
  // Get clean text
  const cleanText = text
    .replace(/^[\s"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+/u, "")
    .replace(/[\s,.;:!?"'`\u2018\u2019\u201C\u201D\u201E()\u00AB\u00BB]+$/u, "")
    .trim();
  
  return { leadingBoundary, trailingBoundary, cleanText };
}

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

export const QUOTES = new Set([
  '"',
  "'",
  "`",
  "\u2018",
  "\u2019",
  "\u201C",
  "\u201D",
  "\u201E",
  "\u00AB",
  "\u00BB",
]);

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
  let normalized = text;
  // Tolerate encoding-related drift (e.g. diacritic loss / mojibake) in comma-only checks.
  try {
    normalized = normalized.normalize("NFKD");
  } catch (_err) {
    // Ignore runtimes without full Unicode normalization support.
  }
  return normalized
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/\u00EF\u00BF\u00BD/g, "")
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
