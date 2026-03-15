import { TextBridge } from "./textBridge.js";

export class OnlineTextBridge extends TextBridge {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    super({
      applyInsertSuggestion,
      applyDeleteSuggestion,
      forceSpacingCleanup: false,
      normalizationProfile: {
        collapseWhitespace: true,
        normalizeQuotes: true,
        normalizeDashes: true,
        normalizeEllipsis: true,
      },
    });
  }
}
