export class AnchorProvider {
  constructor(name = "AnchorProvider") {
    this.name = name;
  }

  // eslint-disable-next-line class-methods-use-this
  supportsCharHints() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAnchors() {
    throw new Error("getAnchors() not implemented");
  }

  // eslint-disable-next-line class-methods-use-this
  tokenize() {
    return [];
  }
}
