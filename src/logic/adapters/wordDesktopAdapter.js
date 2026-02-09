export class WordDesktopAdapter {
  constructor({ textBridge }) {
    this.textBridge = textBridge;
  }

  async getParagraphs(context) {
    const paras = context.document.body.paragraphs;
    paras.load("items/text");
    await context.sync();
    return paras;
  }

  async applySuggestion(context, paragraph, suggestion) {
    return this.textBridge.applySuggestion(context, paragraph, suggestion);
  }
}
