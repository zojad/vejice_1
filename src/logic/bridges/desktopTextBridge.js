import { TextBridge } from "./textBridge.js";

export class DesktopTextBridge extends TextBridge {
  constructor({ applyInsertSuggestion, applyDeleteSuggestion }) {
    super({
      applyInsertSuggestion,
      applyDeleteSuggestion,
      forceSpacingCleanup: false,
      normalizationProfile: {
        // Keep desktop mapping as literal as possible; Win32 text offsets are
        // sensitive to canonical rewrites and can drift with aggressive normalization.
        collapseWhitespace: false,
        normalizeQuotes: false,
        normalizeDashes: false,
        normalizeEllipsis: false,
      },
    });
  }
}
