/******/ (function() { // webpackBootstrap
/*!**********************************!*\
  !*** ./src/taskpane/taskpane.js ***!
  \**********************************/
/* global document, Office */

Office.onReady(function (info) {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
  }
});
/******/ })()
;
//# sourceMappingURL=taskpane.js.map