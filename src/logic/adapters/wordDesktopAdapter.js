export class WordDesktopAdapter {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    this.applyInsertSuggestionImpl = applyInsertSuggestion;
    this.applyDeleteSuggestionImpl = applyDeleteSuggestion;
  }

  async getParagraphs(context) {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    return paras;
  }

  async applySuggestion(context, paragraph, suggestion) {
    if (suggestion.kind === "insert") {
      return this.applyInsertSuggestionImpl(context, paragraph, suggestion);
    }
    return this.applyDeleteSuggestionImpl(context, paragraph, suggestion);
  }
}
