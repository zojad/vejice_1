const SUGGESTION_KINDS = new Set(["insert", "delete"]);

export class Suggestion {
  constructor({
    id,
    paragraphIndex,
    kind,
    charHint = null,
    tokenHint = null,
    snippets = null,
    meta = null,
    debug = null,
  }) {
    if (!SUGGESTION_KINDS.has(kind)) {
      throw new Error(`Unsupported suggestion kind "${kind}"`);
    }
    this.id = id ?? `${kind}-${paragraphIndex}-${Date.now()}`;
    this.paragraphIndex = typeof paragraphIndex === "number" ? paragraphIndex : -1;
    this.kind = kind;
    this.charHint = charHint;
    this.tokenHint = tokenHint;
    this.snippets = snippets || {};
    this.meta = meta || {};
    this.debug = debug || {};
  }

  hasCharHint() {
    return Boolean(this.charHint && Number.isFinite(this.charHint.start));
  }

  hasTokenHint() {
    return Boolean(this.tokenHint && (this.tokenHint.leftToken || this.tokenHint.rightToken));
  }

  getPreferredAnchor() {
    if (this.hasCharHint()) return { type: "char", hint: this.charHint };
    if (this.hasTokenHint()) return { type: "token", hint: this.tokenHint };
    return this.snippets?.leftSnippet || this.snippets?.rightSnippet || this.snippets?.focusWord
      ? { type: "snippet", hint: this.snippets }
      : null;
  }
}

export function createSuggestion(data) {
  return new Suggestion(data);
}

export function normalizeSuggestion(raw) {
  if (raw instanceof Suggestion) return raw;
  return new Suggestion(raw);
}
