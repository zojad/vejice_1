export class TextBridge {
  constructor({
    applyInsertSuggestion,
    applyDeleteSuggestion,
    forceSpacingCleanup = false,
    normalizationProfile = null,
  }) {
    this.applyInsertSuggestionImpl = applyInsertSuggestion;
    this.applyDeleteSuggestionImpl = applyDeleteSuggestion;
    this.forceSpacingCleanup = forceSpacingCleanup;
    this.normalizationProfile = normalizationProfile || {
      collapseWhitespace: true,
      normalizeQuotes: false,
      normalizeDashes: false,
      normalizeEllipsis: false,
    };
  }

  async applyInsert(context, paragraph, suggestion) {
    return this.applyInsertSuggestionImpl(context, paragraph, suggestion);
  }

  async applyDelete(context, paragraph, suggestion) {
    return this.applyDeleteSuggestionImpl(context, paragraph, suggestion);
  }

  async applySuggestion(context, paragraph, suggestion) {
    if (suggestion?.kind === "insert") {
      return this.applyInsert(context, paragraph, suggestion);
    }
    return this.applyDelete(context, paragraph, suggestion);
  }

  shouldForceSpacingCleanup() {
    return this.forceSpacingCleanup;
  }

  getNormalizationProfile() {
    return this.normalizationProfile;
  }
}
