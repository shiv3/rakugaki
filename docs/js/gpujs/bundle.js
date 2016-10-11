/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);