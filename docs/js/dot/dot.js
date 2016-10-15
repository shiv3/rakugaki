class Dot{
    constructor(){
        this.c = this.init();
        this.canvas = this.c.canvas;
        this.ctx = this.c.ctx;
        this.draw();
    }
    init(){
        this.canvas = document.createElement("canvas");
        this.canvas.id = "canvas";
        this.canvas.height = 400; 
        this.canvas.width  = 500; 
        document.body.appendChild(this.canvas);
        let ctx = this.canvas.getContext('2d');
        return {canvas:canvas,ctx:ctx};
    }

    draw(){
        // ctx.font = "12px 'Times New Roman'";
        // ctx.fillText("Times New Roman", 10, 15);
        this.ctx.font = "italic bold 42px 'ＭＳ Ｐゴシック'";
        this.ctx.fillText("てすと", 100, 100);
    }
    parse( denominator = 10 ){
        let width = this.canvas.width;
        let height = this.canvas.height;
        let dots = []
        for(    var x = 0;  x < width  ; x += width/denominator ){
            for(var y = 0;  y < height ; y += height/denominator ){
                dots.push(this.ctx.getImageData(x,y,1,1).data);
            }
        }      
        return dots;  
    }
}

window.onload = () => {
    Dot = new Dot();
    dots = Dot.parse();
}