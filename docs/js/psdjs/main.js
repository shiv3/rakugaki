var PSD = require('psd');
var psd = PSD.fromFile("./test.psd");
psd.parse();

console.log(psd.tree().export());
// console.log(psd.tree().childrenAtPath('A/B/C')[0].export());

// PSD.open("./test.psd").then(function (psd) {
//   return psd.image.saveAsPng('./output.png');
// }).then(function () {
//   console.log("Finished!");
// });