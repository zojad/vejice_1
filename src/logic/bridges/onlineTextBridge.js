import { TextBridge } from "./textBridge.js";

export class OnlineTextBridge extends TextBridge {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    super({
      applyInsertSuggestion,
      applyDeleteSuggestion,
      forceSpacingCleanup: true,
      normalizationProfile: {
        collapseWhitespace: true,
        // Keep quote characters distinct (for boundary intent),
        // but normalize dash variants to stabilize index mapping.
        normalizeQuotes: false,
        normalizeDashes: true,
        normalizeEllipsis: true,
      },
    });
  }
}
