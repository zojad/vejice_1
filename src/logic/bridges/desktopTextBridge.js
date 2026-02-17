import { TextBridge } from "./textBridge.js";

export class DesktopTextBridge extends TextBridge {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    super({
      applyInsertSuggestion,
      applyDeleteSuggestion,
      forceSpacingCleanup: false,
      normalizationProfile: {
        // Keep canonical mapping profile aligned with Word Online to reduce
        // cross-host index drift during snapshot remapping.
        collapseWhitespace: true,
        normalizeQuotes: true,
        normalizeDashes: true,
        normalizeEllipsis: true,
      },
    });
  }
}
