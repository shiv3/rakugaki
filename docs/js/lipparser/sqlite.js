
var SQL = require('sql.js');


function bufferToBase64(buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    console.log(binstr)
    return btoa(binstr);
}

window.onload = () =>{
  var xhr = new XMLHttpRequest();
  xhr.open('GET', './test.lip', true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(e) {
    var uInt8Array = new Uint8Array(this.response);
    var db = new SQL.Database(uInt8Array);
    var contents = db.exec("SELECT ImageData FROM CanvasPreview");
    let imagedata = contents[0].values[0];
    var b64encoded = bufferToBase64(imagedata);
    console.log(imagedata)
    console.log(b64encoded);
    // contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
  };
  xhr.send();
}