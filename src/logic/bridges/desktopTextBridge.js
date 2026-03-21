import { TextBridge } from "./textBridge.js";

export class DesktopTextBridge extends TextBridge {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    super({
      applyInsertSuggestion,
      applyDeleteSuggestion,
      forceSpacingCleanup: false,
      normalizationProfile: {
        // Keep canonical mapping profile aligned with Word Online.
        // Preserve quote/dash distinction to reduce ambiguous remapping.
        collapseWhitespace: true,
        normalizeQuotes: false,
        normalizeDashes: false,
        normalizeEllipsis: true,
      },
    });
  }
}
