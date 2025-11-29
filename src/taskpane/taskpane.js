/* global document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  return Word.run(async (context) => {
    const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);
    paragraph.font.color = "blue";
    await context.sync();
  });
}
