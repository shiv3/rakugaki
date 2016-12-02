window.onload = () => {
  var canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  // キャンバス全体のピクセル情報を取得
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var width = imageData.width, height = imageData.height;
  var pixels = imageData.data;  // ピクセル配列：RGBA4要素で1ピクセル


  // // ピクセル単位で操作できる
  // for (var y = 0; y < height; ++y) {
  //   for (var x = 0; x < width; ++x) {
  //     var base = (y * width + x) * 4;
  //     // なんかピクセルに書き込む
  //     pixels[base + 0] = x;  // Red
  //     pixels[base + 1] = y;  // Green
  //     pixels[base + 2] = Math.max(255 - x - y, 0);  // Blue
  //     pixels[base + 3] = 255;  // Alpha
  //   }
  // }
  drawPixel = (context, x, y, color) => {
    context.save();
    context.translate(x, y);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    context.restore();
    // pixels[( y * width + x ) * 4 ] = color[0];
    // pixels[( y * width + x ) * 4 ] = color[1];
    // pixels[( y * width + x ) * 4 ] = color[2];
    // pixels[( y * width + x ) * 4 ] = color[3];
  }
  let line = (x0,x1,y0,y1) => {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;
    let error = 0
    let deltaErr = Math.abs(deltaY/deltaX);
    y = y0
    for(var x=x0;x < x1 ; x++){
       drawPixel(context, x, y, [255, 0, 0, 1]);
       error = error + deltaErr;
       if(error>=0.5){
         y++;
         error -= 1;
       }
    } 
  }
  line(0,2,0,2);
  for(let y = 0 ; y < height;y ++ ){
    for(let x = 0; x < width; x ++ ){
      // console.log(x,y)
      drawPixel(context,x,y, [255, 0, 0, 1])    
    }
  }
  
  // 変更した内容をキャンバスに書き戻す
  context.putImageData(imageData, 0, 0);
}

