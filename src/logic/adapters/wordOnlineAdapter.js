export class WordOnlineAdapter {
  constructor({
    highlightSuggestion,
    textBridge,
    clearSuggestionMarkers,
  }) {
    this.highlightSuggestionImpl = highlightSuggestion;
    this.textBridge = textBridge;
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
    return this.textBridge.applySuggestion(context, paragraph, suggestion);
  }

  clearHighlights(context, suggestionsOverride, paragraphs) {
    return this.clearSuggestionMarkersImpl(context, suggestionsOverride, paragraphs);
  }

  shouldForceSpacingCleanup() {
    return this.textBridge?.shouldForceSpacingCleanup?.() ?? false;
  }
}
