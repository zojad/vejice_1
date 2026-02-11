export class WordDesktopAdapter {
  constructor({ textBridge, trace = () => {} }) {
    this.textBridge = textBridge;
    this.trace = trace;
  }

  async getParagraphs(context) {
    // Win32 Word can fail on direct body.paragraphs in some document states.
    // Using body range first is more stable across builds.
    const paras = context.document.body.getRange().paragraphs;
    // Desktop Word can throw on shorthand nested loads (e.g. "items/text"),
    // so load items first, then load each paragraph text explicitly.
    this.trace("DesktopAdapter:getParagraphs load(items) -> sync:start");
    paras.load("items");
    await context.sync();
    this.trace("DesktopAdapter:getParagraphs load(items) -> sync:done", paras.items.length);
    this.trace("DesktopAdapter:getParagraphs load(item.text) -> sync:start");
    paras.items.forEach((p) => p.load("text"));
    await context.sync();
    this.trace("DesktopAdapter:getParagraphs load(item.text) -> sync:done");
    return paras;
  }

  async applySuggestion(context, paragraph, suggestion) {
    return this.textBridge.applySuggestion(context, paragraph, suggestion);
  }
}
