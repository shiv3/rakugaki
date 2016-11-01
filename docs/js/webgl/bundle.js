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
/***/ function(module, exports, __webpack_require__) {

	// this is webgl rakguaki
	let canvas = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	// this is webgl rakguaki
	console.log("this is main script!")
	class canvas{
	    constructor(){
	        let parent = document.body;
	        parent.style.backgroundColor = "333377";
	        this.HEIGHT =  400;
	        this.WIDTH =  400;
	        this.canvas = this.createCanvas( parent );
	        this.ctx = this.createCTX( this.canvas );
	    }
	    createCanvas(parent){
	        this.parent = parent;
	        let canvas = document.createElement("canvas");
	        canvas.id = "canvas";
	        canvas.style.width = this.WIDTH;
	        canvas.style.height = this.HEIGHT;
	        parent.appendChild(canvas);
	        return canvas;
	    }
	    createCTX(canvas){
	        let ctx = null;
	        try{
	            ctx = canvas.getContext("experimental-webgl");
	        }catch (e){
	            ex = "Exception: " + e.toString();
	        }
	        if (!ctx){
	            alert(exmsg);
	            throw new Error(ex);
	        }
	        return ctx;
	    }
	}

	window.onload = () =>{
	    canvas = new canvas();
	    console.log(canvas.ctx)
	    let cube = [
	         // Front face
	        -1.0, -1.0,  1.0,
	        1.0, -1.0,  1.0,
	        1.0,  1.0,  1.0,
	        -1.0,  1.0,  1.0,
	        
	        // Back face
	        -1.0, -1.0, -1.0,
	        -1.0,  1.0, -1.0,
	        1.0,  1.0, -1.0,
	        1.0, -1.0, -1.0,
	        
	        // Top face
	        -1.0,  1.0, -1.0,
	        -1.0,  1.0,  1.0,
	        1.0,  1.0,  1.0,
	        1.0,  1.0, -1.0,
	        
	        // Bottom face
	        -1.0, -1.0, -1.0,
	        1.0, -1.0, -1.0,
	        1.0, -1.0,  1.0,
	        -1.0, -1.0,  1.0,
	        
	        // Right face
	        1.0, -1.0, -1.0,
	        1.0,  1.0, -1.0,
	        1.0,  1.0,  1.0,
	        1.0, -1.0,  1.0,
	        
	        // Left face
	        -1.0, -1.0, -1.0,
	        -1.0, -1.0,  1.0,
	        -1.0,  1.0,  1.0,
	        -1.0,  1.0, -1.0
	    ];
	    let colors = [
	        [1.0,  1.0,  1.0,  1.0],    // Front face: white
	        [1.0,  0.0,  0.0,  1.0],    // Back face: red
	        [0.0,  1.0,  0.0,  1.0],    // Top face: green
	        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
	        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
	        [1.0,  0.0,  1.0,  1.0]     // Left face: purple
	    ];
	    var generatedColors = [];
	    for (j=0; j<6; j++) {
	        var c = colors[j];
	        for (var i=0; i<4; i++) {
	            generatedColors = generatedColors.concat(c);
	        }
	    }

	    var cubeVerticesColorBuffer = canvas.ctx.createBuffer();
	    canvas.ctx.bindBuffer(canvas.ctx.ARRAY_BUFFER, cubeVerticesColorBuffer);
	    canvas.ctx.bufferData(canvas.ctx.ARRAY_BUFFER, new Float32Array(generatedColors), canvas.ctx.STATIC_DRAW);

	    var cubeVerticesIndexBuffer = canvas.ctx.createBuffer();
	    canvas.ctx.bindBuffer(canvas.ctx.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

	    // This array defines each face as two triancanvas.ctxes, using the
	    // indices into the vertex array to specify each triancanvas.ctxe's
	    // position.

	    var cubeVertexIndices = [
	    0,  1,  2,      0,  2,  3,    // front
	    4,  5,  6,      4,  6,  7,    // back
	    8,  9,  10,     8,  10, 11,   // top
	    12, 13, 14,     12, 14, 15,   // bottom
	    16, 17, 18,     16, 18, 19,   // right
	    20, 21, 22,     20, 22, 23    // left
	    ];

	    // Now send the element array to canvas.ctx

	    canvas.ctx.bufferData(canvas.ctx.ELEMENT_ARRAY_BUFFER,
	        new Uint16Array(cubeVertexIndices), canvas.ctx.STATIC_DRAW);
	    
	    canvas.ctx.bindBuffer(canvas.ctx.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	    canvas.ctx.drawElements(canvas.ctx.TRIANGLES, 36, canvas.ctx.UNSIGNED_SHORT, 0);

	}

	module.exports = canvas;

/***/ }
/******/ ]);