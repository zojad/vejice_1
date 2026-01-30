export class WordOnlineAdapter {
  constructor({
    highlightSuggestion,
    applyInsertSuggestion,
    applyDeleteSuggestion,
    clearSuggestionMarkers,
  }) {
    this.highlightSuggestionImpl = highlightSuggestion;
    this.applyInsertSuggestionImpl = applyInsertSuggestion;
    this.applyDeleteSuggestionImpl = applyDeleteSuggestion;
    this.clearSuggestionMarkersImpl = clearSuggestionMarkers;
  }

  async getParagraphs(context) {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    return paras;
  }

  highlightSuggestion(context, paragraph, suggestion) {
    return this.highlightSuggestionImpl(context, paragraph, suggestion);
  }

  applySuggestion(context, paragraph, suggestion) {
    if (suggestion.kind === "insert") {
      return this.applyInsertSuggestionImpl(context, paragraph, suggestion);
    }
    return this.applyDeleteSuggestionImpl(context, paragraph, suggestion);
  }

  clearHighlights(context, suggestionsOverride, paragraphs) {
    return this.clearSuggestionMarkersImpl(context, suggestionsOverride, paragraphs);
  }
}
