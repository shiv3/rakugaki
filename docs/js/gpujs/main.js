var gpu = new GPU();
var opt = {
    dimensions: [100]
};
var myFunc = gpu.createKernel(function() {
    return this.thread.x;
}, opt);


console.log(myFunc());

var render = gpu.createKernel(function() {
    this.color(0, 0, 0, 1);
}).dimensions([20, 20]).graphical(true);

render();

var canvas = render.getCanvas();

window.onload = () => {
    document.getElementsByTagName('body')[0].appendChild(canvas);
}


function bench(mode) {
	var run = GPU(function(a, b) {
		var res = 0.0;
		var i = 0.0;
		for(i = 0.0; i < 500000; ++i) {
			res += Math.sqrt( a[this.thread.x] * b[this.thread.x] );
		}
		 
		return res;
	}, {
		dimensions : [2048],
		mode : mode
	});
	
}

let starttime = new Date();
console.log(starttime);
bench(function(){
	console.log(setupBenchCode('gpu'));
}, 10000, [], this);

let stoptime = new Date();
console.log(stoptime - starttime);