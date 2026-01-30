import { AnchorProvider } from "./AnchorProvider.js";

export class LemmatizerAnchorProvider extends AnchorProvider {
  constructor(resolver) {
    super("LemmatizerAnchorProvider");
    this.resolver = resolver;
  }

  supportsCharHints() {
    return true;
  }

  async getAnchors(options) {
    if (!this.resolver) {
      throw new Error("Lemmatizer resolver not configured yet");
    }
    return this.resolver(options);
  }
}
