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
	let canvas = __webpack_require__(46);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict"

	var makeGameShell = __webpack_require__(3)
	var webglew = __webpack_require__(18)

	function createGLShell(options) {
	  options = options || {}
	  
	  var extensions = options.extensions || []

	  //First create shell
	  var shell = makeGameShell(options)
	  var scale = shell.scale || 1
	  var contextOptions = options.glOptions

	  shell.on("init", function initGLNow() {
	  
	    //Create canvas
	    var canvas = document.createElement("canvas")
	    
	    //Try initializing WebGL
	    var gl = canvas.getContext("webgl", contextOptions) || 
	             canvas.getContext("experimental-webgl", contextOptions)
	    if(!gl) {
	      shell.emit("gl-error", new Error("Unable to initialize WebGL"))
	      return
	    }
	    
	    //Check extensions
	    var ext = webglew(gl)
	    for(var i=0; i<extensions.length; ++i) {
	      if(!(extensions[i] in ext)) {
	        shell.emit("gl-error", new Error("Missing extension: " + extensions[i]))
	        return
	      }
	    }

	    //Set canvas style
	    canvas.style.position = "absolute"
	    canvas.style.left = "0px"
	    canvas.style.top = "0px"
	    shell.element.appendChild(canvas)

	    //Add variables to game-shell
	    shell.canvas = canvas
	    shell.gl = gl

	    //Load width/height
	    resize()

	    //Load default parameters
	    shell.clearFlags = options.clearFlags === undefined ? (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) : options.clearFlags
	    shell.clearColor = options.clearColor || [0,0,0,0]
	    shell.clearDepth = options.clearDepth || 1.0
	    shell.clearStencil = options.clearStencil || 0

	    shell.on("resize", resize)

	    //Hook render event
	    shell.on("render", function renderGLNow(t) {
	    
	      //Bind default framebuffer
	      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	      
	      //Set viewport
	      gl.viewport(0, 0, (shell._width / scale)|0, (shell._height / scale)|0)

	      //Clear buffers
	      if(shell.clearFlags & gl.STENCIL_BUFFER_BIT) {
	        gl.clearStencil(shell.clearStencil)
	      }
	      if(shell.clearFlags & gl.COLOR_BUFFER_BIT) {
	        gl.clearColor(shell.clearColor[0], shell.clearColor[1], shell.clearColor[2], shell.clearColor[3])
	      }
	      if(shell.clearFlags & gl.DEPTH_BUFFER_BIT) {
	        gl.clearDepth(shell.clearDepth)
	      }
	      if(shell.clearFlags) {
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
	      }
	    
	      //Render frame
	      shell.emit("gl-render", t)
	    })
	    
	    //WebGL initialized
	    shell.emit("gl-init")
	  })

	  function resize() {
	    var nw = (shell._width/scale)|0
	    var nh = (shell._height/scale)|0
	    shell.canvas.width = nw
	    shell.canvas.height = nh
	    shell.canvas.style.width = shell._width + 'px'
	    shell.canvas.style.height = shell._height + 'px'
	    shell.emit("gl-resize", nw, nh)
	  }

	  Object.defineProperty(shell, 'scale', {
	    get: function() {
	      return scale
	    },
	    set: function(_scale) {
	      _scale = +_scale
	      if((_scale <= 0) || isNaN(_scale) || (scale === _scale)) {
	        return scale
	      }
	      scale = _scale
	      resize()
	      return scale
	    }
	  })

	  Object.defineProperty(shell, "width", {
	    get: function() {
	      return (shell._width / scale)|0
	    }
	  })

	  Object.defineProperty(shell, "height", {
	    get: function() {
	      return (shell._height / scale)|0
	    }
	  })

	  Object.defineProperty(shell, "mouse", {
	    get: function() {
	      return [shell.mouseX/scale, shell.mouseY/scale]
	    }
	  })

	  Object.defineProperty(shell, "prevMouse", {
	    get: function() {
	      return [shell.prevMouseX/scale, shell.prevMouseY/scale]
	    }
	  })

	  return shell
	}

	module.exports = createGLShell

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict"

	var EventEmitter = __webpack_require__(4).EventEmitter
	  , util         = __webpack_require__(5)
	  , domready     = __webpack_require__(9)
	  , vkey         = __webpack_require__(10)
	  , invert       = __webpack_require__(11)
	  , uniq         = __webpack_require__(12)
	  , bsearch      = __webpack_require__(13)
	  , iota         = __webpack_require__(14)
	  , min          = Math.min

	//Browser compatibility hacks
	__webpack_require__(15)
	var addMouseWheel = __webpack_require__(16)
	var hrtime = __webpack_require__(17)

	//Remove angle braces and other useless crap
	var filtered_vkey = (function() {
	  var result = new Array(256)
	    , i, j, k
	  for(i=0; i<256; ++i) {
	    result[i] = "UNK"
	  }
	  for(i in vkey) {
	    k = vkey[i]
	    if(k.charAt(0) === '<' && k.charAt(k.length-1) === '>') {
	      k = k.substring(1, k.length-1)
	    }
	    k = k.replace(/\s/g, "-")
	    result[parseInt(i)] = k
	  }
	  return result
	})()

	//Compute minimal common set of keyboard functions
	var keyNames = uniq(Object.keys(invert(filtered_vkey)))

	//Translates a virtual keycode to a normalized keycode
	function virtualKeyCode(key) {
	  return bsearch.eq(keyNames, key)
	}

	//Maps a physical keycode to a normalized keycode
	function physicalKeyCode(key) {
	  return virtualKeyCode(filtered_vkey[key])
	}

	//Game shell
	function GameShell() {
	  EventEmitter.call(this)
	  this._curKeyState  = new Array(keyNames.length)
	  this._pressCount   = new Array(keyNames.length)
	  this._releaseCount = new Array(keyNames.length)
	  
	  this._tickInterval = null
	  this._rafHandle = null
	  this._tickRate = 0
	  this._lastTick = hrtime()
	  this._frameTime = 0.0
	  this._paused = true
	  this._width = 0
	  this._height = 0
	  
	  this._wantFullscreen = false
	  this._wantPointerLock = false
	  this._fullscreenActive = false
	  this._pointerLockActive = false
	  
	  this._render = render.bind(undefined, this)

	  this.preventDefaults = true
	  this.stopPropagation = false
	  
	  for(var i=0; i<keyNames.length; ++i) {
	    this._curKeyState[i] = false
	    this._pressCount[i] = this._releaseCount[i] = 0
	  }
	  
	  //Public members
	  this.element = null
	  this.bindings = {}
	  this.frameSkip = 100.0
	  this.tickCount = 0
	  this.frameCount = 0
	  this.startTime = hrtime()
	  this.tickTime = this._tickRate
	  this.frameTime = 10.0
	  this.stickyFullscreen = false
	  this.stickyPointerLock = false
	  
	  //Scroll stuff
	  this.scroll = [0,0,0]
	    
	  //Mouse state
	  this.mouseX = 0
	  this.mouseY = 0
	  this.prevMouseX = 0
	  this.prevMouseY = 0
	}

	util.inherits(GameShell, EventEmitter)

	var proto = GameShell.prototype

	//Bind keynames
	proto.keyNames = keyNames

	//Binds a virtual keyboard event to a physical key
	proto.bind = function(virtual_key) {
	  //Look up previous key bindings
	  var arr
	  if(virtual_key in this.bindings) {
	    arr = this.bindings[virtual_key]
	  } else {
	    arr = []
	  }
	  //Add keys to list
	  var physical_key
	  for(var i=1, n=arguments.length; i<n; ++i) {
	    physical_key = arguments[i]
	    if(virtualKeyCode(physical_key) >= 0) {
	      arr.push(physical_key)
	    } else if(physical_key in this.bindings) {
	      var keybinds = this.bindings[physical_key]
	      for(var j=0; j<keybinds.length; ++j) {
	        arr.push(keybinds[j])
	      }
	    }
	  }
	  //Remove any duplicate keys
	  arr = uniq(arr)
	  if(arr.length > 0) {
	    this.bindings[virtual_key] = arr
	  }
	  this.emit('bind', virtual_key, arr)
	}

	//Unbinds a virtual keyboard event
	proto.unbind = function(virtual_key) {
	  if(virtual_key in this.bindings) {
	    delete this.bindings[virtual_key]
	  }
	  this.emit('unbind', virtual_key)
	}

	//Checks if a key is set in a given state
	function lookupKey(state, bindings, key) {
	  if(key in bindings) {
	    var arr = bindings[key]
	    for(var i=0, n=arr.length; i<n; ++i) {
	      if(state[virtualKeyCode(arr[i])]) {
	        return true
	      }
	    }
	    return false
	  }
	  var kc = virtualKeyCode(key)
	  if(kc >= 0) {
	    return state[kc]
	  }
	  return false
	}

	//Checks if a key is set in a given state
	function lookupCount(state, bindings, key) {
	  if(key in bindings) {
	    var arr = bindings[key], r = 0
	    for(var i=0, n=arr.length; i<n; ++i) {
	      r += state[virtualKeyCode(arr[i])]
	    }
	    return r
	  }
	  var kc = virtualKeyCode(key)
	  if(kc >= 0) {
	    return state[kc]
	  }
	  return 0
	}

	//Checks if a key (either physical or virtual) is currently held down
	proto.down = function(key) {
	  return lookupKey(this._curKeyState, this.bindings, key)
	}

	//Checks if a key was ever down
	proto.wasDown = function(key) {
	  return this.down(key) || !!this.press(key)
	}

	//Opposite of down
	proto.up = function(key) {
	  return !this.down(key)
	}

	//Checks if a key was released during previous frame
	proto.wasUp = function(key) {
	  return this.up(key) || !!this.release(key)
	}

	//Returns the number of times a key was pressed since last tick
	proto.press = function(key) {
	  return lookupCount(this._pressCount, this.bindings, key)
	}

	//Returns the number of times a key was released since last tick
	proto.release = function(key) {
	  return lookupCount(this._releaseCount, this.bindings, key)
	}

	//Pause/unpause the game loop
	Object.defineProperty(proto, "paused", {
	  get: function() {
	    return this._paused
	  },
	  set: function(state) {
	    var ns = !!state
	    if(ns !== this._paused) {
	      if(!this._paused) {
	        this._paused = true
	        this._frameTime = min(1.0, (hrtime() - this._lastTick) / this._tickRate)
	        clearInterval(this._tickInterval)
	        //cancelAnimationFrame(this._rafHandle)
	      } else {
	        this._paused = false
	        this._lastTick = hrtime() - Math.floor(this._frameTime * this._tickRate)
	        this._tickInterval = setInterval(tick, this._tickRate, this)
	        this._rafHandle = requestAnimationFrame(this._render)
	      }
	    }
	  }
	})

	//Fullscreen state toggle

	function tryFullscreen(shell) {
	  //Request full screen
	  var elem = shell.element
	  
	  if(shell._wantFullscreen && !shell._fullscreenActive) {
	    var fs = elem.requestFullscreen ||
	             elem.requestFullScreen ||
	             elem.webkitRequestFullscreen ||
	             elem.webkitRequestFullScreen ||
	             elem.mozRequestFullscreen ||
	             elem.mozRequestFullScreen ||
	             function() {}
	    fs.call(elem)
	  }
	  if(shell._wantPointerLock && !shell._pointerLockActive) {
	    var pl =  elem.requestPointerLock ||
	              elem.webkitRequestPointerLock ||
	              elem.mozRequestPointerLock ||
	              elem.msRequestPointerLock ||
	              elem.oRequestPointerLock ||
	              function() {}
	    pl.call(elem)
	  }
	}

	var cancelFullscreen = document.exitFullscreen ||
	                       document.cancelFullscreen ||  //Why can no one agree on this?
	                       document.cancelFullScreen ||
	                       document.webkitCancelFullscreen ||
	                       document.webkitCancelFullScreen ||
	                       document.mozCancelFullscreen ||
	                       document.mozCancelFullScreen ||
	                       function(){}

	Object.defineProperty(proto, "fullscreen", {
	  get: function() {
	    return this._fullscreenActive
	  },
	  set: function(state) {
	    var ns = !!state
	    if(!ns) {
	      this._wantFullscreen = false
	      cancelFullscreen.call(document)
	    } else {
	      this._wantFullscreen = true
	      tryFullscreen(this)
	    }
	    return this._fullscreenActive
	  }
	})

	function handleFullscreen(shell) {
	  shell._fullscreenActive = document.fullscreen ||
	                            document.mozFullScreen ||
	                            document.webkitIsFullScreen ||
	                            false
	  if(!shell.stickyFullscreen && shell._fullscreenActive) {
	    shell._wantFullscreen = false
	  }
	}

	//Pointer lock state toggle
	var exitPointerLock = document.exitPointerLock ||
	                      document.webkitExitPointerLock ||
	                      document.mozExitPointerLock ||
	                      function() {}

	Object.defineProperty(proto, "pointerLock", {
	  get: function() {
	    return this._pointerLockActive
	  },
	  set: function(state) {
	    var ns = !!state
	    if(!ns) {
	      this._wantPointerLock = false
	      exitPointerLock.call(document)
	    } else {
	      this._wantPointerLock = true
	      tryFullscreen(this)
	    }
	    return this._pointerLockActive
	  }
	})

	function handlePointerLockChange(shell, event) {
	  shell._pointerLockActive = shell.element === (
	      document.pointerLockElement ||
	      document.mozPointerLockElement ||
	      document.webkitPointerLockElement ||
	      null)
	  if(!shell.stickyPointerLock && shell._pointerLockActive) {
	    shell._wantPointerLock = false
	  }
	}

	//Width and height
	Object.defineProperty(proto, "width", {
	  get: function() {
	    return this.element.clientWidth
	  }
	})
	Object.defineProperty(proto, "height", {
	  get: function() {
	    return this.element.clientHeight
	  }
	})

	//Set key state
	function setKeyState(shell, key, state) {
	  var ps = shell._curKeyState[key]
	  if(ps !== state) {
	    if(state) {
	      shell._pressCount[key]++
	    } else {
	      shell._releaseCount[key]++
	    }
	    shell._curKeyState[key] = state
	  }
	}

	//Ticks the game state one update
	function tick(shell) {
	  var skip = hrtime() + shell.frameSkip
	    , pCount = shell._pressCount
	    , rCount = shell._releaseCount
	    , i, s, t
	    , tr = shell._tickRate
	    , n = keyNames.length
	  while(!shell._paused &&
	        hrtime() >= shell._lastTick + tr) {
	    
	    //Skip frames if we are over budget
	    if(hrtime() > skip) {
	      shell._lastTick = hrtime() + tr
	      return
	    }
	    
	    //Tick the game
	    s = hrtime()
	    shell.emit("tick")
	    t = hrtime()
	    shell.tickTime = t - s
	    
	    //Update counters and time
	    ++shell.tickCount
	    shell._lastTick += tr
	    
	    //Shift input state
	    for(i=0; i<n; ++i) {
	      pCount[i] = rCount[i] = 0
	    }
	    if(shell._pointerLockActive) {
	      shell.prevMouseX = shell.mouseX = shell.width>>1
	      shell.prevMouseY = shell.mouseY = shell.height>>1
	    } else {
	      shell.prevMouseX = shell.mouseX
	      shell.prevMouseY = shell.mouseY
	    }
	    shell.scroll[0] = shell.scroll[1] = shell.scroll[2] = 0
	  }
	}

	//Render stuff
	function render(shell) {

	  //Request next frame
	  shell._rafHandle = requestAnimationFrame(shell._render)

	  //Tick the shell
	  tick(shell)
	  
	  //Compute frame time
	  var dt
	  if(shell._paused) {
	    dt = shell._frameTime
	  } else {
	    dt = min(1.0, (hrtime() - shell._lastTick) / shell._tickRate)
	  }
	  
	  //Draw a frame
	  ++shell.frameCount
	  var s = hrtime()
	  shell.emit("render", dt)
	  var t = hrtime()
	  shell.frameTime = t - s
	  
	}

	function isFocused(shell) {
	  return (document.activeElement === document.body) ||
	         (document.activeElement === shell.element)
	}

	function handleEvent(shell, ev) {
	  if(shell.preventDefaults) {
	    ev.preventDefault()
	  }
	  if(shell.stopPropagation) {
	    ev.stopPropagation()
	  }
	}

	//Set key up
	function handleKeyUp(shell, ev) {
	  handleEvent(shell, ev)
	  var kc = physicalKeyCode(ev.keyCode || ev.char || ev.which || ev.charCode)
	  if(kc >= 0) {
	    setKeyState(shell, kc, false)
	  }
	}

	//Set key down
	function handleKeyDown(shell, ev) {
	  if(!isFocused(shell)) {
	    return
	  }
	  handleEvent(shell, ev)
	  if(ev.metaKey) {
	    //Hack: Clear key state when meta gets pressed to prevent keys sticking
	    handleBlur(shell, ev)
	  } else {
	    var kc = physicalKeyCode(ev.keyCode || ev.char || ev.which || ev.charCode)
	    if(kc >= 0) {
	      setKeyState(shell, kc, true)
	    }
	  }
	}

	//Mouse events are really annoying
	var mouseCodes = iota(32).map(function(n) {
	  return virtualKeyCode("mouse-" + (n+1))
	})

	function setMouseButtons(shell, buttons) {
	  for(var i=0; i<32; ++i) {
	    setKeyState(shell, mouseCodes[i], !!(buttons & (1<<i)))
	  }
	}

	function handleMouseMove(shell, ev) {
	  handleEvent(shell, ev)
	  if(shell._pointerLockActive) {
	    var movementX = ev.movementX       ||
	                    ev.mozMovementX    ||
	                    ev.webkitMovementX ||
	                    0,
	        movementY = ev.movementY       ||
	                    ev.mozMovementY    ||
	                    ev.webkitMovementY ||
	                    0
	    shell.mouseX += movementX
	    shell.mouseY += movementY
	  } else {
	    shell.mouseX = ev.clientX - shell.element.offsetLeft
	    shell.mouseY = ev.clientY - shell.element.offsetTop
	  }
	  return false
	}

	function handleMouseDown(shell, ev) {
	  handleEvent(shell, ev)
	  setKeyState(shell, mouseCodes[ev.button], true)
	  return false
	}

	function handleMouseUp(shell, ev) {
	  handleEvent(shell, ev)
	  setKeyState(shell, mouseCodes[ev.button], false)
	  return false
	}

	function handleMouseEnter(shell, ev) {
	  handleEvent(shell, ev)
	  if(shell._pointerLockActive) {
	    shell.prevMouseX = shell.mouseX = shell.width>>1
	    shell.prevMouseY = shell.mouseY = shell.height>>1
	  } else {
	    shell.prevMouseX = shell.mouseX = ev.clientX - shell.element.offsetLeft
	    shell.prevMouseY = shell.mouseY = ev.clientY - shell.element.offsetTop
	  }
	  return false
	}

	function handleMouseLeave(shell, ev) {
	  handleEvent(shell, ev)
	  setMouseButtons(shell, 0)
	  return false
	}

	//Handle mouse wheel events
	function handleMouseWheel(shell, ev) {
	  handleEvent(shell, ev)
	  var scale = 1
	  switch(ev.deltaMode) {
	    case 0: //Pixel
	      scale = 1
	    break
	    case 1: //Line
	      scale = 12
	    break
	    case 2: //Page
	       scale = shell.height
	    break
	  }
	  //Add scroll
	  shell.scroll[0] +=  ev.deltaX * scale
	  shell.scroll[1] +=  ev.deltaY * scale
	  shell.scroll[2] += (ev.deltaZ * scale)||0.0
	  return false
	}

	function handleContexMenu(shell, ev) {
	  handleEvent(shell, ev)
	  return false
	}

	function handleBlur(shell, ev) {
	  var n = keyNames.length
	    , c = shell._curKeyState
	    , r = shell._releaseCount
	    , i
	  for(i=0; i<n; ++i) {
	    if(c[i]) {
	      ++r[i]
	    }
	    c[i] = false
	  }
	  return false
	}

	function handleResizeElement(shell, ev) {
	  var w = shell.element.clientWidth|0
	  var h = shell.element.clientHeight|0
	  if((w !== shell._width) || (h !== shell._height)) {
	    shell._width = w
	    shell._height = h
	    shell.emit("resize", w, h)
	  }
	}

	function makeDefaultContainer() {
	  var container = document.createElement("div")
	  container.tabindex = 1
	  container.style.position = "absolute"
	  container.style.left = "0px"
	  container.style.right = "0px"
	  container.style.top = "0px"
	  container.style.bottom = "0px"
	  container.style.height = "100%"
	  container.style.overflow = "hidden"
	  document.body.appendChild(container)
	  document.body.style.overflow = "hidden" //Prevent bounce
	  document.body.style.height = "100%"
	  return container
	}

	function createShell(options) {
	  options = options || {}
	  
	  //Check fullscreen and pointer lock flags
	  var useFullscreen = !!options.fullscreen
	  var usePointerLock = useFullscreen
	  if(typeof options.pointerLock !== undefined) {
	    usePointerLock = !!options.pointerLock
	  }
	  
	  //Create initial shell
	  var shell = new GameShell()
	  shell._tickRate = options.tickRate || 30
	  shell.frameSkip = options.frameSkip || (shell._tickRate+5) * 5
	  shell.stickyFullscreen = !!options.stickyFullscreen || !!options.sticky
	  shell.stickyPointerLock = !!options.stickyPointerLock || !!options.sticky
	  
	  //Set bindings
	  if(options.bindings) {
	    shell.bindings = options.bindings
	  }
	  
	  //Wait for dom to intiailize
	  setTimeout(function() { domready(function initGameShell() {
	    
	    //Retrieve element
	    var element = options.element
	    if(typeof element === "string") {
	      var e = document.querySelector(element)
	      if(!e) {
	        e = document.getElementById(element)
	      }
	      if(!e) {
	        e = document.getElementByClass(element)[0]
	      }
	      if(!e) {
	        e = makeDefaultContainer()
	      }
	      shell.element = e
	    } else if(typeof element === "object" && !!element) {
	      shell.element = element
	    } else if(typeof element === "function") {
	      shell.element = element()
	    } else {
	      shell.element = makeDefaultContainer()
	    }
	    
	    //Disable user-select
	    if(shell.element.style) {
	      shell.element.style["-webkit-touch-callout"] = "none"
	      shell.element.style["-webkit-user-select"] = "none"
	      shell.element.style["-khtml-user-select"] = "none"
	      shell.element.style["-moz-user-select"] = "none"
	      shell.element.style["-ms-user-select"] = "none"
	      shell.element.style["user-select"] = "none"
	    }
	    
	    //Hook resize handler
	    shell._width = shell.element.clientWidth
	    shell._height = shell.element.clientHeight
	    var handleResize = handleResizeElement.bind(undefined, shell)
	    if(typeof MutationObserver !== "undefined") {
	      var observer = new MutationObserver(handleResize)
	      observer.observe(shell.element, {
	        attributes: true,
	        subtree: true
	      })
	    } else {
	      shell.element.addEventListener("DOMSubtreeModified", handleResize, false)
	    }
	    window.addEventListener("resize", handleResize, false)
	    
	    //Hook keyboard listener
	    window.addEventListener("keydown", handleKeyDown.bind(undefined, shell), false)
	    window.addEventListener("keyup", handleKeyUp.bind(undefined, shell), false)
	    
	    //Disable right click
	    shell.element.oncontextmenu = handleContexMenu.bind(undefined, shell)
	    
	    //Hook mouse listeners
	    shell.element.addEventListener("mousedown", handleMouseDown.bind(undefined, shell), false)
	    shell.element.addEventListener("mouseup", handleMouseUp.bind(undefined, shell), false)
	    shell.element.addEventListener("mousemove", handleMouseMove.bind(undefined, shell), false)
	    shell.element.addEventListener("mouseenter", handleMouseEnter.bind(undefined, shell), false)
	    
	    //Mouse leave
	    var leave = handleMouseLeave.bind(undefined, shell)
	    shell.element.addEventListener("mouseleave", leave, false)
	    shell.element.addEventListener("mouseout", leave, false)
	    window.addEventListener("mouseleave", leave, false)
	    window.addEventListener("mouseout", leave, false)
	    
	    //Blur event 
	    var blur = handleBlur.bind(undefined, shell)
	    shell.element.addEventListener("blur", blur, false)
	    shell.element.addEventListener("focusout", blur, false)
	    shell.element.addEventListener("focus", blur, false)
	    window.addEventListener("blur", blur, false)
	    window.addEventListener("focusout", blur, false)
	    window.addEventListener("focus", blur, false)

	    //Mouse wheel handler
	    addMouseWheel(shell.element, handleMouseWheel.bind(undefined, shell), false)

	    //Fullscreen handler
	    var fullscreenChange = handleFullscreen.bind(undefined, shell)
	    document.addEventListener("fullscreenchange", fullscreenChange, false)
	    document.addEventListener("mozfullscreenchange", fullscreenChange, false)
	    document.addEventListener("webkitfullscreenchange", fullscreenChange, false)

	    //Stupid fullscreen hack
	    shell.element.addEventListener("click", tryFullscreen.bind(undefined, shell), false)

	    //Pointer lock change handler
	    var pointerLockChange = handlePointerLockChange.bind(undefined, shell)
	    document.addEventListener("pointerlockchange", pointerLockChange, false)
	    document.addEventListener("mozpointerlockchange", pointerLockChange, false)
	    document.addEventListener("webkitpointerlockchange", pointerLockChange, false)
	    document.addEventListener("pointerlocklost", pointerLockChange, false)
	    document.addEventListener("webkitpointerlocklost", pointerLockChange, false)
	    document.addEventListener("mozpointerlocklost", pointerLockChange, false)
	    
	    //Update flags
	    shell.fullscreen = useFullscreen
	    shell.pointerLock = usePointerLock
	  
	    //Default mouse button aliases
	    shell.bind("mouse-left",   "mouse-1")
	    shell.bind("mouse-right",  "mouse-3")
	    shell.bind("mouse-middle", "mouse-2")
	    
	    //Initialize tick counter
	    shell._lastTick = hrtime()
	    shell.startTime = hrtime()

	    //Unpause shell
	    shell.paused = false
	    
	    //Emit initialize event
	    shell.emit("init")
	  })}, 0)
	  
	  return shell
	}

	module.exports = createShell


/***/ },
/* 4 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(7);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(8);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	  * domready (c) Dustin Diaz 2014 - License MIT
	  */
	!function (name, definition) {

	  if (true) module.exports = definition()
	  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
	  else this[name] = definition()

	}('domready', function () {

	  var fns = [], listener
	    , doc = document
	    , hack = doc.documentElement.doScroll
	    , domContentLoaded = 'DOMContentLoaded'
	    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


	  if (!loaded)
	  doc.addEventListener(domContentLoaded, listener = function () {
	    doc.removeEventListener(domContentLoaded, listener)
	    loaded = 1
	    while (listener = fns.shift()) listener()
	  })

	  return function (fn) {
	    loaded ? setTimeout(fn, 0) : fns.push(fn)
	  }

	});


/***/ },
/* 10 */
/***/ function(module, exports) {

	var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
	  , isOSX = /OS X/.test(ua)
	  , isOpera = /Opera/.test(ua)
	  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

	var i, output = module.exports = {
	  0:  isOSX ? '<menu>' : '<UNK>'
	, 1:  '<mouse 1>'
	, 2:  '<mouse 2>'
	, 3:  '<break>'
	, 4:  '<mouse 3>'
	, 5:  '<mouse 4>'
	, 6:  '<mouse 5>'
	, 8:  '<backspace>'
	, 9:  '<tab>'
	, 12: '<clear>'
	, 13: '<enter>'
	, 16: '<shift>'
	, 17: '<control>'
	, 18: '<alt>'
	, 19: '<pause>'
	, 20: '<caps-lock>'
	, 21: '<ime-hangul>'
	, 23: '<ime-junja>'
	, 24: '<ime-final>'
	, 25: '<ime-kanji>'
	, 27: '<escape>'
	, 28: '<ime-convert>'
	, 29: '<ime-nonconvert>'
	, 30: '<ime-accept>'
	, 31: '<ime-mode-change>'
	, 27: '<escape>'
	, 32: '<space>'
	, 33: '<page-up>'
	, 34: '<page-down>'
	, 35: '<end>'
	, 36: '<home>'
	, 37: '<left>'
	, 38: '<up>'
	, 39: '<right>'
	, 40: '<down>'
	, 41: '<select>'
	, 42: '<print>'
	, 43: '<execute>'
	, 44: '<snapshot>'
	, 45: '<insert>'
	, 46: '<delete>'
	, 47: '<help>'
	, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
	, 92: '<meta>'  // meta-right
	, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
	, 95: '<sleep>'
	, 106: '<num-*>'
	, 107: '<num-+>'
	, 108: '<num-enter>'
	, 109: '<num-->'
	, 110: '<num-.>'
	, 111: '<num-/>'
	, 144: '<num-lock>'
	, 145: '<scroll-lock>'
	, 160: '<shift-left>'
	, 161: '<shift-right>'
	, 162: '<control-left>'
	, 163: '<control-right>'
	, 164: '<alt-left>'
	, 165: '<alt-right>'
	, 166: '<browser-back>'
	, 167: '<browser-forward>'
	, 168: '<browser-refresh>'
	, 169: '<browser-stop>'
	, 170: '<browser-search>'
	, 171: '<browser-favorites>'
	, 172: '<browser-home>'

	  // ff/osx reports '<volume-mute>' for '-'
	, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
	, 174: '<volume-down>'
	, 175: '<volume-up>'
	, 176: '<next-track>'
	, 177: '<prev-track>'
	, 178: '<stop>'
	, 179: '<play-pause>'
	, 180: '<launch-mail>'
	, 181: '<launch-media-select>'
	, 182: '<launch-app 1>'
	, 183: '<launch-app 2>'
	, 186: ';'
	, 187: '='
	, 188: ','
	, 189: '-'
	, 190: '.'
	, 191: '/'
	, 192: '`'
	, 219: '['
	, 220: '\\'
	, 221: ']'
	, 222: "'"
	, 223: '<meta>'
	, 224: '<meta>'       // firefox reports meta here.
	, 226: '<alt-gr>'
	, 229: '<ime-process>'
	, 231: isOpera ? '`' : '<unicode>'
	, 246: '<attention>'
	, 247: '<crsel>'
	, 248: '<exsel>'
	, 249: '<erase-eof>'
	, 250: '<play>'
	, 251: '<zoom>'
	, 252: '<no-name>'
	, 253: '<pa-1>'
	, 254: '<clear>'
	}

	for(i = 58; i < 65; ++i) {
	  output[i] = String.fromCharCode(i)
	}

	// 0-9
	for(i = 48; i < 58; ++i) {
	  output[i] = (i - 48)+''
	}

	// A-Z
	for(i = 65; i < 91; ++i) {
	  output[i] = String.fromCharCode(i)
	}

	// num0-9
	for(i = 96; i < 106; ++i) {
	  output[i] = '<num-'+(i - 96)+'>'
	}

	// F1-F24
	for(i = 112; i < 136; ++i) {
	  output[i] = 'F'+(i-111)
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict"

	function invert(hash) {
	  var result = {}
	  for(var i in hash) {
	    if(hash.hasOwnProperty(i)) {
	      result[hash[i]] = i
	    }
	  }
	  return result
	}

	module.exports = invert

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict"

	function unique_pred(list, compare) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b=list[0]
	  for(var i=1; i<len; ++i) {
	    b = a
	    a = list[i]
	    if(compare(a, b)) {
	      if(i === ptr) {
	        ptr++
	        continue
	      }
	      list[ptr++] = a
	    }
	  }
	  list.length = ptr
	  return list
	}

	function unique_eq(list) {
	  var ptr = 1
	    , len = list.length
	    , a=list[0], b = list[0]
	  for(var i=1; i<len; ++i, b=a) {
	    b = a
	    a = list[i]
	    if(a !== b) {
	      if(i === ptr) {
	        ptr++
	        continue
	      }
	      list[ptr++] = a
	    }
	  }
	  list.length = ptr
	  return list
	}

	function unique(list, compare, sorted) {
	  if(list.length === 0) {
	    return list
	  }
	  if(compare) {
	    if(!sorted) {
	      list.sort(compare)
	    }
	    return unique_pred(list, compare)
	  }
	  if(!sorted) {
	    list.sort()
	  }
	  return unique_eq(list)
	}

	module.exports = unique


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict"

	function compileSearch(funcName, predicate, reversed, extraArgs, useNdarray, earlyOut) {
	  var code = [
	    "function ", funcName, "(a,l,h,", extraArgs.join(","),  "){",
	earlyOut ? "" : "var i=", (reversed ? "l-1" : "h+1"),
	";while(l<=h){\
	var m=(l+h)>>>1,x=a", useNdarray ? ".get(m)" : "[m]"]
	  if(earlyOut) {
	    if(predicate.indexOf("c") < 0) {
	      code.push(";if(x===y){return m}else if(x<=y){")
	    } else {
	      code.push(";var p=c(x,y);if(p===0){return m}else if(p<=0){")
	    }
	  } else {
	    code.push(";if(", predicate, "){i=m;")
	  }
	  if(reversed) {
	    code.push("l=m+1}else{h=m-1}")
	  } else {
	    code.push("h=m-1}else{l=m+1}")
	  }
	  code.push("}")
	  if(earlyOut) {
	    code.push("return -1};")
	  } else {
	    code.push("return i};")
	  }
	  return code.join("")
	}

	function compileBoundsSearch(predicate, reversed, suffix, earlyOut) {
	  var result = new Function([
	  compileSearch("A", "x" + predicate + "y", reversed, ["y"], false, earlyOut),
	  compileSearch("B", "x" + predicate + "y", reversed, ["y"], true, earlyOut),
	  compileSearch("P", "c(x,y)" + predicate + "0", reversed, ["y", "c"], false, earlyOut),
	  compileSearch("Q", "c(x,y)" + predicate + "0", reversed, ["y", "c"], true, earlyOut),
	"function dispatchBsearch", suffix, "(a,y,c,l,h){\
	if(a.shape){\
	if(typeof(c)==='function'){\
	return Q(a,(l===undefined)?0:l|0,(h===undefined)?a.shape[0]-1:h|0,y,c)\
	}else{\
	return B(a,(c===undefined)?0:c|0,(l===undefined)?a.shape[0]-1:l|0,y)\
	}}else{\
	if(typeof(c)==='function'){\
	return P(a,(l===undefined)?0:l|0,(h===undefined)?a.length-1:h|0,y,c)\
	}else{\
	return A(a,(c===undefined)?0:c|0,(l===undefined)?a.length-1:l|0,y)\
	}}}\
	return dispatchBsearch", suffix].join(""))
	  return result()
	}

	module.exports = {
	  ge: compileBoundsSearch(">=", false, "GE"),
	  gt: compileBoundsSearch(">", false, "GT"),
	  lt: compileBoundsSearch("<", true, "LT"),
	  le: compileBoundsSearch("<=", true, "LE"),
	  eq: compileBoundsSearch("-", true, "EQ", true)
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict"

	function iota(n) {
	  var result = new Array(n)
	  for(var i=0; i<n; ++i) {
	    result[i] = i
	  }
	  return result
	}

	module.exports = iota

/***/ },
/* 15 */
/***/ function(module, exports) {

	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	 
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	 
	// MIT license
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
	                               || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
	    window.requestAnimationFrame = function(callback, element) {
	        var currTime = new Date().getTime();
	        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	          timeToCall);
	        lastTime = currTime + timeToCall;
	        return id;
	    };

	if (!window.cancelAnimationFrame)
	    window.cancelAnimationFrame = function(id) {
	        clearTimeout(id);
	    };


/***/ },
/* 16 */
/***/ function(module, exports) {

	//Adapted from here: https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel?redirectlocale=en-US&redirectslug=DOM%2FMozilla_event_reference%2Fwheel

	var prefix = "", _addEventListener, onwheel, support;

	// detect event model
	if ( window.addEventListener ) {
	  _addEventListener = "addEventListener";
	} else {
	  _addEventListener = "attachEvent";
	  prefix = "on";
	}

	// detect available wheel event
	support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
	          document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
	          "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

	function _addWheelListener( elem, eventName, callback, useCapture ) {
	  elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
	    !originalEvent && ( originalEvent = window.event );

	    // create a normalized event object
	    var event = {
	      // keep a ref to the original event object
	      originalEvent: originalEvent,
	      target: originalEvent.target || originalEvent.srcElement,
	      type: "wheel",
	      deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
	      deltaX: 0,
	      delatZ: 0,
	      preventDefault: function() {
	        originalEvent.preventDefault ?
	          originalEvent.preventDefault() :
	          originalEvent.returnValue = false;
	      }
	    };
	    
	    // calculate deltaY (and deltaX) according to the event
	    if ( support == "mousewheel" ) {
	      event.deltaY = - 1/40 * originalEvent.wheelDelta;
	      // Webkit also support wheelDeltaX
	      originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
	    } else {
	      event.deltaY = originalEvent.detail;
	    }

	    // it's time to fire the callback
	    return callback( event );
	  }, useCapture || false );
	}

	module.exports = function( elem, callback, useCapture ) {
	  _addWheelListener( elem, support, callback, useCapture );

	  // handle MozMousePixelScroll in older Firefox
	  if( support == "DOMMouseScroll" ) {
	    _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
	  }
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	if(typeof window.performance === "object") {
	  if(window.performance.now) {
	    module.exports = function() { return window.performance.now() }
	  } else if(window.performance.webkitNow) {
	    module.exports = function() { return window.performance.webkitNow() }
	  }
	} else if(Date.now) {
	  module.exports = Date.now
	} else {
	  module.exports = function() { return (new Date()).getTime() }
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var weakMap = typeof WeakMap === 'undefined' ? __webpack_require__(19) : WeakMap

	var WebGLEWStruct = new weakMap()

	function baseName(ext_name) {
	  return ext_name.replace(/^[A-Z]+_/, '')
	}

	function initWebGLEW(gl) {
	  var struct = WebGLEWStruct.get(gl)
	  if(struct) {
	    return struct
	  }
	  var extensions = {}
	  var supported = gl.getSupportedExtensions()
	  for(var i=0; i<supported.length; ++i) {
	    var extName = supported[i]

	    //Skip MOZ_ extensions
	    if(extName.indexOf('MOZ_') === 0) {
	      continue
	    }
	    var ext = gl.getExtension(supported[i])
	    if(!ext) {
	      continue
	    }
	    while(true) {
	      extensions[extName] = ext
	      var base = baseName(extName)
	      if(base === extName) {
	        break
	      }
	      extName = base
	    }
	  }
	  WebGLEWStruct.set(gl, extensions)
	  return extensions
	}
	module.exports = initWebGLEW

/***/ },
/* 19 */
/***/ function(module, exports) {

	// Copyright (C) 2011 Google Inc.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/**
	 * @fileoverview Install a leaky WeakMap emulation on platforms that
	 * don't provide a built-in one.
	 *
	 * <p>Assumes that an ES5 platform where, if {@code WeakMap} is
	 * already present, then it conforms to the anticipated ES6
	 * specification. To run this file on an ES5 or almost ES5
	 * implementation where the {@code WeakMap} specification does not
	 * quite conform, run <code>repairES5.js</code> first.
	 *
	 * <p>Even though WeakMapModule is not global, the linter thinks it
	 * is, which is why it is in the overrides list below.
	 *
	 * <p>NOTE: Before using this WeakMap emulation in a non-SES
	 * environment, see the note below about hiddenRecord.
	 *
	 * @author Mark S. Miller
	 * @requires crypto, ArrayBuffer, Uint8Array, navigator, console
	 * @overrides WeakMap, ses, Proxy
	 * @overrides WeakMapModule
	 */

	/**
	 * This {@code WeakMap} emulation is observably equivalent to the
	 * ES-Harmony WeakMap, but with leakier garbage collection properties.
	 *
	 * <p>As with true WeakMaps, in this emulation, a key does not
	 * retain maps indexed by that key and (crucially) a map does not
	 * retain the keys it indexes. A map by itself also does not retain
	 * the values associated with that map.
	 *
	 * <p>However, the values associated with a key in some map are
	 * retained so long as that key is retained and those associations are
	 * not overridden. For example, when used to support membranes, all
	 * values exported from a given membrane will live for the lifetime
	 * they would have had in the absence of an interposed membrane. Even
	 * when the membrane is revoked, all objects that would have been
	 * reachable in the absence of revocation will still be reachable, as
	 * far as the GC can tell, even though they will no longer be relevant
	 * to ongoing computation.
	 *
	 * <p>The API implemented here is approximately the API as implemented
	 * in FF6.0a1 and agreed to by MarkM, Andreas Gal, and Dave Herman,
	 * rather than the offially approved proposal page. TODO(erights):
	 * upgrade the ecmascript WeakMap proposal page to explain this API
	 * change and present to EcmaScript committee for their approval.
	 *
	 * <p>The first difference between the emulation here and that in
	 * FF6.0a1 is the presence of non enumerable {@code get___, has___,
	 * set___, and delete___} methods on WeakMap instances to represent
	 * what would be the hidden internal properties of a primitive
	 * implementation. Whereas the FF6.0a1 WeakMap.prototype methods
	 * require their {@code this} to be a genuine WeakMap instance (i.e.,
	 * an object of {@code [[Class]]} "WeakMap}), since there is nothing
	 * unforgeable about the pseudo-internal method names used here,
	 * nothing prevents these emulated prototype methods from being
	 * applied to non-WeakMaps with pseudo-internal methods of the same
	 * names.
	 *
	 * <p>Another difference is that our emulated {@code
	 * WeakMap.prototype} is not itself a WeakMap. A problem with the
	 * current FF6.0a1 API is that WeakMap.prototype is itself a WeakMap
	 * providing ambient mutability and an ambient communications
	 * channel. Thus, if a WeakMap is already present and has this
	 * problem, repairES5.js wraps it in a safe wrappper in order to
	 * prevent access to this channel. (See
	 * PATCH_MUTABLE_FROZEN_WEAKMAP_PROTO in repairES5.js).
	 */

	/**
	 * If this is a full <a href=
	 * "http://code.google.com/p/es-lab/wiki/SecureableES5"
	 * >secureable ES5</a> platform and the ES-Harmony {@code WeakMap} is
	 * absent, install an approximate emulation.
	 *
	 * <p>If WeakMap is present but cannot store some objects, use our approximate
	 * emulation as a wrapper.
	 *
	 * <p>If this is almost a secureable ES5 platform, then WeakMap.js
	 * should be run after repairES5.js.
	 *
	 * <p>See {@code WeakMap} for documentation of the garbage collection
	 * properties of this WeakMap emulation.
	 */
	(function WeakMapModule() {
	  "use strict";

	  if (typeof ses !== 'undefined' && ses.ok && !ses.ok()) {
	    // already too broken, so give up
	    return;
	  }

	  /**
	   * In some cases (current Firefox), we must make a choice betweeen a
	   * WeakMap which is capable of using all varieties of host objects as
	   * keys and one which is capable of safely using proxies as keys. See
	   * comments below about HostWeakMap and DoubleWeakMap for details.
	   *
	   * This function (which is a global, not exposed to guests) marks a
	   * WeakMap as permitted to do what is necessary to index all host
	   * objects, at the cost of making it unsafe for proxies.
	   *
	   * Do not apply this function to anything which is not a genuine
	   * fresh WeakMap.
	   */
	  function weakMapPermitHostObjects(map) {
	    // identity of function used as a secret -- good enough and cheap
	    if (map.permitHostObjects___) {
	      map.permitHostObjects___(weakMapPermitHostObjects);
	    }
	  }
	  if (typeof ses !== 'undefined') {
	    ses.weakMapPermitHostObjects = weakMapPermitHostObjects;
	  }

	  // IE 11 has no Proxy but has a broken WeakMap such that we need to patch
	  // it using DoubleWeakMap; this flag tells DoubleWeakMap so.
	  var doubleWeakMapCheckSilentFailure = false;

	  // Check if there is already a good-enough WeakMap implementation, and if so
	  // exit without replacing it.
	  if (typeof WeakMap === 'function') {
	    var HostWeakMap = WeakMap;
	    // There is a WeakMap -- is it good enough?
	    if (typeof navigator !== 'undefined' &&
	        /Firefox/.test(navigator.userAgent)) {
	      // We're now *assuming not*, because as of this writing (2013-05-06)
	      // Firefox's WeakMaps have a miscellany of objects they won't accept, and
	      // we don't want to make an exhaustive list, and testing for just one
	      // will be a problem if that one is fixed alone (as they did for Event).

	      // If there is a platform that we *can* reliably test on, here's how to
	      // do it:
	      //  var problematic = ... ;
	      //  var testHostMap = new HostWeakMap();
	      //  try {
	      //    testHostMap.set(problematic, 1);  // Firefox 20 will throw here
	      //    if (testHostMap.get(problematic) === 1) {
	      //      return;
	      //    }
	      //  } catch (e) {}

	    } else {
	      // IE 11 bug: WeakMaps silently fail to store frozen objects.
	      var testMap = new HostWeakMap();
	      var testObject = Object.freeze({});
	      testMap.set(testObject, 1);
	      if (testMap.get(testObject) !== 1) {
	        doubleWeakMapCheckSilentFailure = true;
	        // Fall through to installing our WeakMap.
	      } else {
	        module.exports = WeakMap;
	        return;
	      }
	    }
	  }

	  var hop = Object.prototype.hasOwnProperty;
	  var gopn = Object.getOwnPropertyNames;
	  var defProp = Object.defineProperty;
	  var isExtensible = Object.isExtensible;

	  /**
	   * Security depends on HIDDEN_NAME being both <i>unguessable</i> and
	   * <i>undiscoverable</i> by untrusted code.
	   *
	   * <p>Given the known weaknesses of Math.random() on existing
	   * browsers, it does not generate unguessability we can be confident
	   * of.
	   *
	   * <p>It is the monkey patching logic in this file that is intended
	   * to ensure undiscoverability. The basic idea is that there are
	   * three fundamental means of discovering properties of an object:
	   * The for/in loop, Object.keys(), and Object.getOwnPropertyNames(),
	   * as well as some proposed ES6 extensions that appear on our
	   * whitelist. The first two only discover enumerable properties, and
	   * we only use HIDDEN_NAME to name a non-enumerable property, so the
	   * only remaining threat should be getOwnPropertyNames and some
	   * proposed ES6 extensions that appear on our whitelist. We monkey
	   * patch them to remove HIDDEN_NAME from the list of properties they
	   * returns.
	   *
	   * <p>TODO(erights): On a platform with built-in Proxies, proxies
	   * could be used to trap and thereby discover the HIDDEN_NAME, so we
	   * need to monkey patch Proxy.create, Proxy.createFunction, etc, in
	   * order to wrap the provided handler with the real handler which
	   * filters out all traps using HIDDEN_NAME.
	   *
	   * <p>TODO(erights): Revisit Mike Stay's suggestion that we use an
	   * encapsulated function at a not-necessarily-secret name, which
	   * uses the Stiegler shared-state rights amplification pattern to
	   * reveal the associated value only to the WeakMap in which this key
	   * is associated with that value. Since only the key retains the
	   * function, the function can also remember the key without causing
	   * leakage of the key, so this doesn't violate our general gc
	   * goals. In addition, because the name need not be a guarded
	   * secret, we could efficiently handle cross-frame frozen keys.
	   */
	  var HIDDEN_NAME_PREFIX = 'weakmap:';
	  var HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'ident:' + Math.random() + '___';

	  if (typeof crypto !== 'undefined' &&
	      typeof crypto.getRandomValues === 'function' &&
	      typeof ArrayBuffer === 'function' &&
	      typeof Uint8Array === 'function') {
	    var ab = new ArrayBuffer(25);
	    var u8s = new Uint8Array(ab);
	    crypto.getRandomValues(u8s);
	    HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'rand:' +
	      Array.prototype.map.call(u8s, function(u8) {
	        return (u8 % 36).toString(36);
	      }).join('') + '___';
	  }

	  function isNotHiddenName(name) {
	    return !(
	        name.substr(0, HIDDEN_NAME_PREFIX.length) == HIDDEN_NAME_PREFIX &&
	        name.substr(name.length - 3) === '___');
	  }

	  /**
	   * Monkey patch getOwnPropertyNames to avoid revealing the
	   * HIDDEN_NAME.
	   *
	   * <p>The ES5.1 spec requires each name to appear only once, but as
	   * of this writing, this requirement is controversial for ES6, so we
	   * made this code robust against this case. If the resulting extra
	   * search turns out to be expensive, we can probably relax this once
	   * ES6 is adequately supported on all major browsers, iff no browser
	   * versions we support at that time have relaxed this constraint
	   * without providing built-in ES6 WeakMaps.
	   */
	  defProp(Object, 'getOwnPropertyNames', {
	    value: function fakeGetOwnPropertyNames(obj) {
	      return gopn(obj).filter(isNotHiddenName);
	    }
	  });

	  /**
	   * getPropertyNames is not in ES5 but it is proposed for ES6 and
	   * does appear in our whitelist, so we need to clean it too.
	   */
	  if ('getPropertyNames' in Object) {
	    var originalGetPropertyNames = Object.getPropertyNames;
	    defProp(Object, 'getPropertyNames', {
	      value: function fakeGetPropertyNames(obj) {
	        return originalGetPropertyNames(obj).filter(isNotHiddenName);
	      }
	    });
	  }

	  /**
	   * <p>To treat objects as identity-keys with reasonable efficiency
	   * on ES5 by itself (i.e., without any object-keyed collections), we
	   * need to add a hidden property to such key objects when we
	   * can. This raises several issues:
	   * <ul>
	   * <li>Arranging to add this property to objects before we lose the
	   *     chance, and
	   * <li>Hiding the existence of this new property from most
	   *     JavaScript code.
	   * <li>Preventing <i>certification theft</i>, where one object is
	   *     created falsely claiming to be the key of an association
	   *     actually keyed by another object.
	   * <li>Preventing <i>value theft</i>, where untrusted code with
	   *     access to a key object but not a weak map nevertheless
	   *     obtains access to the value associated with that key in that
	   *     weak map.
	   * </ul>
	   * We do so by
	   * <ul>
	   * <li>Making the name of the hidden property unguessable, so "[]"
	   *     indexing, which we cannot intercept, cannot be used to access
	   *     a property without knowing the name.
	   * <li>Making the hidden property non-enumerable, so we need not
	   *     worry about for-in loops or {@code Object.keys},
	   * <li>monkey patching those reflective methods that would
	   *     prevent extensions, to add this hidden property first,
	   * <li>monkey patching those methods that would reveal this
	   *     hidden property.
	   * </ul>
	   * Unfortunately, because of same-origin iframes, we cannot reliably
	   * add this hidden property before an object becomes
	   * non-extensible. Instead, if we encounter a non-extensible object
	   * without a hidden record that we can detect (whether or not it has
	   * a hidden record stored under a name secret to us), then we just
	   * use the key object itself to represent its identity in a brute
	   * force leaky map stored in the weak map, losing all the advantages
	   * of weakness for these.
	   */
	  function getHiddenRecord(key) {
	    if (key !== Object(key)) {
	      throw new TypeError('Not an object: ' + key);
	    }
	    var hiddenRecord = key[HIDDEN_NAME];
	    if (hiddenRecord && hiddenRecord.key === key) { return hiddenRecord; }
	    if (!isExtensible(key)) {
	      // Weak map must brute force, as explained in doc-comment above.
	      return void 0;
	    }

	    // The hiddenRecord and the key point directly at each other, via
	    // the "key" and HIDDEN_NAME properties respectively. The key
	    // field is for quickly verifying that this hidden record is an
	    // own property, not a hidden record from up the prototype chain.
	    //
	    // NOTE: Because this WeakMap emulation is meant only for systems like
	    // SES where Object.prototype is frozen without any numeric
	    // properties, it is ok to use an object literal for the hiddenRecord.
	    // This has two advantages:
	    // * It is much faster in a performance critical place
	    // * It avoids relying on Object.create(null), which had been
	    //   problematic on Chrome 28.0.1480.0. See
	    //   https://code.google.com/p/google-caja/issues/detail?id=1687
	    hiddenRecord = { key: key };

	    // When using this WeakMap emulation on platforms where
	    // Object.prototype might not be frozen and Object.create(null) is
	    // reliable, use the following two commented out lines instead.
	    // hiddenRecord = Object.create(null);
	    // hiddenRecord.key = key;

	    // Please contact us if you need this to work on platforms where
	    // Object.prototype might not be frozen and
	    // Object.create(null) might not be reliable.

	    try {
	      defProp(key, HIDDEN_NAME, {
	        value: hiddenRecord,
	        writable: false,
	        enumerable: false,
	        configurable: false
	      });
	      return hiddenRecord;
	    } catch (error) {
	      // Under some circumstances, isExtensible seems to misreport whether
	      // the HIDDEN_NAME can be defined.
	      // The circumstances have not been isolated, but at least affect
	      // Node.js v0.10.26 on TravisCI / Linux, but not the same version of
	      // Node.js on OS X.
	      return void 0;
	    }
	  }

	  /**
	   * Monkey patch operations that would make their argument
	   * non-extensible.
	   *
	   * <p>The monkey patched versions throw a TypeError if their
	   * argument is not an object, so it should only be done to functions
	   * that should throw a TypeError anyway if their argument is not an
	   * object.
	   */
	  (function(){
	    var oldFreeze = Object.freeze;
	    defProp(Object, 'freeze', {
	      value: function identifyingFreeze(obj) {
	        getHiddenRecord(obj);
	        return oldFreeze(obj);
	      }
	    });
	    var oldSeal = Object.seal;
	    defProp(Object, 'seal', {
	      value: function identifyingSeal(obj) {
	        getHiddenRecord(obj);
	        return oldSeal(obj);
	      }
	    });
	    var oldPreventExtensions = Object.preventExtensions;
	    defProp(Object, 'preventExtensions', {
	      value: function identifyingPreventExtensions(obj) {
	        getHiddenRecord(obj);
	        return oldPreventExtensions(obj);
	      }
	    });
	  })();

	  function constFunc(func) {
	    func.prototype = null;
	    return Object.freeze(func);
	  }

	  var calledAsFunctionWarningDone = false;
	  function calledAsFunctionWarning() {
	    // Future ES6 WeakMap is currently (2013-09-10) expected to reject WeakMap()
	    // but we used to permit it and do it ourselves, so warn only.
	    if (!calledAsFunctionWarningDone && typeof console !== 'undefined') {
	      calledAsFunctionWarningDone = true;
	      console.warn('WeakMap should be invoked as new WeakMap(), not ' +
	          'WeakMap(). This will be an error in the future.');
	    }
	  }

	  var nextId = 0;

	  var OurWeakMap = function() {
	    if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
	      calledAsFunctionWarning();
	    }

	    // We are currently (12/25/2012) never encountering any prematurely
	    // non-extensible keys.
	    var keys = []; // brute force for prematurely non-extensible keys.
	    var values = []; // brute force for corresponding values.
	    var id = nextId++;

	    function get___(key, opt_default) {
	      var index;
	      var hiddenRecord = getHiddenRecord(key);
	      if (hiddenRecord) {
	        return id in hiddenRecord ? hiddenRecord[id] : opt_default;
	      } else {
	        index = keys.indexOf(key);
	        return index >= 0 ? values[index] : opt_default;
	      }
	    }

	    function has___(key) {
	      var hiddenRecord = getHiddenRecord(key);
	      if (hiddenRecord) {
	        return id in hiddenRecord;
	      } else {
	        return keys.indexOf(key) >= 0;
	      }
	    }

	    function set___(key, value) {
	      var index;
	      var hiddenRecord = getHiddenRecord(key);
	      if (hiddenRecord) {
	        hiddenRecord[id] = value;
	      } else {
	        index = keys.indexOf(key);
	        if (index >= 0) {
	          values[index] = value;
	        } else {
	          // Since some browsers preemptively terminate slow turns but
	          // then continue computing with presumably corrupted heap
	          // state, we here defensively get keys.length first and then
	          // use it to update both the values and keys arrays, keeping
	          // them in sync.
	          index = keys.length;
	          values[index] = value;
	          // If we crash here, values will be one longer than keys.
	          keys[index] = key;
	        }
	      }
	      return this;
	    }

	    function delete___(key) {
	      var hiddenRecord = getHiddenRecord(key);
	      var index, lastIndex;
	      if (hiddenRecord) {
	        return id in hiddenRecord && delete hiddenRecord[id];
	      } else {
	        index = keys.indexOf(key);
	        if (index < 0) {
	          return false;
	        }
	        // Since some browsers preemptively terminate slow turns but
	        // then continue computing with potentially corrupted heap
	        // state, we here defensively get keys.length first and then use
	        // it to update both the keys and the values array, keeping
	        // them in sync. We update the two with an order of assignments,
	        // such that any prefix of these assignments will preserve the
	        // key/value correspondence, either before or after the delete.
	        // Note that this needs to work correctly when index === lastIndex.
	        lastIndex = keys.length - 1;
	        keys[index] = void 0;
	        // If we crash here, there's a void 0 in the keys array, but
	        // no operation will cause a "keys.indexOf(void 0)", since
	        // getHiddenRecord(void 0) will always throw an error first.
	        values[index] = values[lastIndex];
	        // If we crash here, values[index] cannot be found here,
	        // because keys[index] is void 0.
	        keys[index] = keys[lastIndex];
	        // If index === lastIndex and we crash here, then keys[index]
	        // is still void 0, since the aliasing killed the previous key.
	        keys.length = lastIndex;
	        // If we crash here, keys will be one shorter than values.
	        values.length = lastIndex;
	        return true;
	      }
	    }

	    return Object.create(OurWeakMap.prototype, {
	      get___:    { value: constFunc(get___) },
	      has___:    { value: constFunc(has___) },
	      set___:    { value: constFunc(set___) },
	      delete___: { value: constFunc(delete___) }
	    });
	  };

	  OurWeakMap.prototype = Object.create(Object.prototype, {
	    get: {
	      /**
	       * Return the value most recently associated with key, or
	       * opt_default if none.
	       */
	      value: function get(key, opt_default) {
	        return this.get___(key, opt_default);
	      },
	      writable: true,
	      configurable: true
	    },

	    has: {
	      /**
	       * Is there a value associated with key in this WeakMap?
	       */
	      value: function has(key) {
	        return this.has___(key);
	      },
	      writable: true,
	      configurable: true
	    },

	    set: {
	      /**
	       * Associate value with key in this WeakMap, overwriting any
	       * previous association if present.
	       */
	      value: function set(key, value) {
	        return this.set___(key, value);
	      },
	      writable: true,
	      configurable: true
	    },

	    'delete': {
	      /**
	       * Remove any association for key in this WeakMap, returning
	       * whether there was one.
	       *
	       * <p>Note that the boolean return here does not work like the
	       * {@code delete} operator. The {@code delete} operator returns
	       * whether the deletion succeeds at bringing about a state in
	       * which the deleted property is absent. The {@code delete}
	       * operator therefore returns true if the property was already
	       * absent, whereas this {@code delete} method returns false if
	       * the association was already absent.
	       */
	      value: function remove(key) {
	        return this.delete___(key);
	      },
	      writable: true,
	      configurable: true
	    }
	  });

	  if (typeof HostWeakMap === 'function') {
	    (function() {
	      // If we got here, then the platform has a WeakMap but we are concerned
	      // that it may refuse to store some key types. Therefore, make a map
	      // implementation which makes use of both as possible.

	      // In this mode we are always using double maps, so we are not proxy-safe.
	      // This combination does not occur in any known browser, but we had best
	      // be safe.
	      if (doubleWeakMapCheckSilentFailure && typeof Proxy !== 'undefined') {
	        Proxy = undefined;
	      }

	      function DoubleWeakMap() {
	        if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
	          calledAsFunctionWarning();
	        }

	        // Preferable, truly weak map.
	        var hmap = new HostWeakMap();

	        // Our hidden-property-based pseudo-weak-map. Lazily initialized in the
	        // 'set' implementation; thus we can avoid performing extra lookups if
	        // we know all entries actually stored are entered in 'hmap'.
	        var omap = undefined;

	        // Hidden-property maps are not compatible with proxies because proxies
	        // can observe the hidden name and either accidentally expose it or fail
	        // to allow the hidden property to be set. Therefore, we do not allow
	        // arbitrary WeakMaps to switch to using hidden properties, but only
	        // those which need the ability, and unprivileged code is not allowed
	        // to set the flag.
	        //
	        // (Except in doubleWeakMapCheckSilentFailure mode in which case we
	        // disable proxies.)
	        var enableSwitching = false;

	        function dget(key, opt_default) {
	          if (omap) {
	            return hmap.has(key) ? hmap.get(key)
	                : omap.get___(key, opt_default);
	          } else {
	            return hmap.get(key, opt_default);
	          }
	        }

	        function dhas(key) {
	          return hmap.has(key) || (omap ? omap.has___(key) : false);
	        }

	        var dset;
	        if (doubleWeakMapCheckSilentFailure) {
	          dset = function(key, value) {
	            hmap.set(key, value);
	            if (!hmap.has(key)) {
	              if (!omap) { omap = new OurWeakMap(); }
	              omap.set(key, value);
	            }
	            return this;
	          };
	        } else {
	          dset = function(key, value) {
	            if (enableSwitching) {
	              try {
	                hmap.set(key, value);
	              } catch (e) {
	                if (!omap) { omap = new OurWeakMap(); }
	                omap.set___(key, value);
	              }
	            } else {
	              hmap.set(key, value);
	            }
	            return this;
	          };
	        }

	        function ddelete(key) {
	          var result = !!hmap['delete'](key);
	          if (omap) { return omap.delete___(key) || result; }
	          return result;
	        }

	        return Object.create(OurWeakMap.prototype, {
	          get___:    { value: constFunc(dget) },
	          has___:    { value: constFunc(dhas) },
	          set___:    { value: constFunc(dset) },
	          delete___: { value: constFunc(ddelete) },
	          permitHostObjects___: { value: constFunc(function(token) {
	            if (token === weakMapPermitHostObjects) {
	              enableSwitching = true;
	            } else {
	              throw new Error('bogus call to permitHostObjects___');
	            }
	          })}
	        });
	      }
	      DoubleWeakMap.prototype = OurWeakMap.prototype;
	      module.exports = DoubleWeakMap;

	      // define .constructor to hide OurWeakMap ctor
	      Object.defineProperty(WeakMap.prototype, 'constructor', {
	        value: WeakMap,
	        enumerable: false,  // as default .constructor is
	        configurable: true,
	        writable: true
	      });
	    })();
	  } else {
	    // There is no host WeakMap, so we must use the emulation.

	    // Emulated WeakMaps are incompatible with native proxies (because proxies
	    // can observe the hidden name), so we must disable Proxy usage (in
	    // ArrayLike and Domado, currently).
	    if (typeof Proxy !== 'undefined') {
	      Proxy = undefined;
	    }

	    module.exports = OurWeakMap;
	  }
	})();


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var createUniformWrapper   = __webpack_require__(21)
	var createAttributeWrapper = __webpack_require__(24)
	var makeReflect            = __webpack_require__(22)
	var shaderCache            = __webpack_require__(25)
	var runtime                = __webpack_require__(45)
	var GLError                = __webpack_require__(23)

	//Shader object
	function Shader(gl) {
	  this.gl         = gl
	  this.gl.lastAttribCount = 0  // fixme where else should we store info, safe but not nice on the gl object

	  //Default initialize these to null
	  this._vref      =
	  this._fref      =
	  this._relink    =
	  this.vertShader =
	  this.fragShader =
	  this.program    =
	  this.attributes =
	  this.uniforms   =
	  this.types      = null
	}

	var proto = Shader.prototype

	proto.bind = function() {
	  if(!this.program) {
	    this._relink()
	  }

	  // ensuring that we have the right number of enabled vertex attributes
	  var i
	  var newAttribCount = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES) // more robust approach
	  //var newAttribCount = Object.keys(this.attributes).length // avoids the probably immaterial introspection slowdown
	  var oldAttribCount = this.gl.lastAttribCount
	  if(newAttribCount > oldAttribCount) {
	    for(i = oldAttribCount; i < newAttribCount; i++) {
	      this.gl.enableVertexAttribArray(i)
	    }
	  } else if(oldAttribCount > newAttribCount) {
	    for(i = newAttribCount; i < oldAttribCount; i++) {
	      this.gl.disableVertexAttribArray(i)
	    }
	  }

	  this.gl.lastAttribCount = newAttribCount

	  this.gl.useProgram(this.program)
	}

	proto.dispose = function() {

	  // disabling vertex attributes so new shader starts with zero
	  // and it's also useful if all shaders are disposed but the
	  // gl context is reused for subsequent replotting
	  var oldAttribCount = this.gl.lastAttribCount
	  for (var i = 0; i < oldAttribCount; i++) {
	    this.gl.disableVertexAttribArray(i)
	  }
	  this.gl.lastAttribCount = 0

	  if(this._fref) {
	    this._fref.dispose()
	  }
	  if(this._vref) {
	    this._vref.dispose()
	  }
	  this.attributes =
	  this.types      =
	  this.vertShader =
	  this.fragShader =
	  this.program    =
	  this._relink    =
	  this._fref      =
	  this._vref      = null
	}

	function compareAttributes(a, b) {
	  if(a.name < b.name) {
	    return -1
	  }
	  return 1
	}

	//Update export hook for glslify-live
	proto.update = function(
	    vertSource
	  , fragSource
	  , uniforms
	  , attributes) {

	  //If only one object passed, assume glslify style output
	  if(!fragSource || arguments.length === 1) {
	    var obj = vertSource
	    vertSource = obj.vertex
	    fragSource = obj.fragment
	    uniforms   = obj.uniforms
	    attributes = obj.attributes
	  }

	  var wrapper = this
	  var gl      = wrapper.gl

	  //Compile vertex and fragment shaders
	  var pvref = wrapper._vref
	  wrapper._vref = shaderCache.shader(gl, gl.VERTEX_SHADER, vertSource)
	  if(pvref) {
	    pvref.dispose()
	  }
	  wrapper.vertShader = wrapper._vref.shader
	  var pfref = this._fref
	  wrapper._fref = shaderCache.shader(gl, gl.FRAGMENT_SHADER, fragSource)
	  if(pfref) {
	    pfref.dispose()
	  }
	  wrapper.fragShader = wrapper._fref.shader

	  //If uniforms/attributes is not specified, use RT reflection
	  if(!uniforms || !attributes) {

	    //Create initial test program
	    var testProgram = gl.createProgram()
	    gl.attachShader(testProgram, wrapper.fragShader)
	    gl.attachShader(testProgram, wrapper.vertShader)
	    gl.linkProgram(testProgram)
	    if(!gl.getProgramParameter(testProgram, gl.LINK_STATUS)) {
	      var errLog = gl.getProgramInfoLog(testProgram)
	      throw new GLError(errLog, 'Error linking program:' + errLog)
	    }

	    //Load data from runtime
	    uniforms   = uniforms   || runtime.uniforms(gl, testProgram)
	    attributes = attributes || runtime.attributes(gl, testProgram)

	    //Release test program
	    gl.deleteProgram(testProgram)
	  }

	  //Sort attributes lexicographically
	  // overrides undefined WebGL behavior for attribute locations
	  attributes = attributes.slice()
	  attributes.sort(compareAttributes)

	  //Convert attribute types, read out locations
	  var attributeUnpacked  = []
	  var attributeNames     = []
	  var attributeLocations = []
	  var i
	  for(i=0; i<attributes.length; ++i) {
	    var attr = attributes[i]
	    if(attr.type.indexOf('mat') >= 0) {
	      var size = attr.type.charAt(attr.type.length-1)|0
	      var locVector = new Array(size)
	      for(var j=0; j<size; ++j) {
	        locVector[j] = attributeLocations.length
	        attributeNames.push(attr.name + '[' + j + ']')
	        if(typeof attr.location === 'number') {
	          attributeLocations.push(attr.location + j)
	        } else if(Array.isArray(attr.location) &&
	                  attr.location.length === size &&
	                  typeof attr.location[j] === 'number') {
	          attributeLocations.push(attr.location[j]|0)
	        } else {
	          attributeLocations.push(-1)
	        }
	      }
	      attributeUnpacked.push({
	        name: attr.name,
	        type: attr.type,
	        locations: locVector
	      })
	    } else {
	      attributeUnpacked.push({
	        name: attr.name,
	        type: attr.type,
	        locations: [ attributeLocations.length ]
	      })
	      attributeNames.push(attr.name)
	      if(typeof attr.location === 'number') {
	        attributeLocations.push(attr.location|0)
	      } else {
	        attributeLocations.push(-1)
	      }
	    }
	  }

	  //For all unspecified attributes, assign them lexicographically min attribute
	  var curLocation = 0
	  for(i=0; i<attributeLocations.length; ++i) {
	    if(attributeLocations[i] < 0) {
	      while(attributeLocations.indexOf(curLocation) >= 0) {
	        curLocation += 1
	      }
	      attributeLocations[i] = curLocation
	    }
	  }

	  //Rebuild program and recompute all uniform locations
	  var uniformLocations = new Array(uniforms.length)
	  function relink() {
	    wrapper.program = shaderCache.program(
	        gl
	      , wrapper._vref
	      , wrapper._fref
	      , attributeNames
	      , attributeLocations)

	    for(var i=0; i<uniforms.length; ++i) {
	      uniformLocations[i] = gl.getUniformLocation(
	          wrapper.program
	        , uniforms[i].name)
	    }
	  }

	  //Perform initial linking, reuse program used for reflection
	  relink()

	  //Save relinking procedure, defer until runtime
	  wrapper._relink = relink

	  //Generate type info
	  wrapper.types = {
	    uniforms:   makeReflect(uniforms),
	    attributes: makeReflect(attributes)
	  }

	  //Generate attribute wrappers
	  wrapper.attributes = createAttributeWrapper(
	      gl
	    , wrapper
	    , attributeUnpacked
	    , attributeLocations)

	  //Generate uniform wrappers
	  Object.defineProperty(wrapper, 'uniforms', createUniformWrapper(
	      gl
	    , wrapper
	    , uniforms
	    , uniformLocations))
	}

	//Compiles and links a shader program with the given attribute and vertex list
	function createShader(
	    gl
	  , vertSource
	  , fragSource
	  , uniforms
	  , attributes) {

	  var shader = new Shader(gl)

	  shader.update(
	      vertSource
	    , fragSource
	    , uniforms
	    , attributes)

	  return shader
	}

	module.exports = createShader


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var coallesceUniforms = __webpack_require__(22)
	var GLError = __webpack_require__(23)

	module.exports = createUniformWrapper

	//Binds a function and returns a value
	function identity(x) {
	  var c = new Function('y', 'return function(){return y}')
	  return c(x)
	}

	function makeVector(length, fill) {
	  var result = new Array(length)
	  for(var i=0; i<length; ++i) {
	    result[i] = fill
	  }
	  return result
	}

	//Create shims for uniforms
	function createUniformWrapper(gl, wrapper, uniforms, locations) {

	  function makeGetter(index) {
	    var proc = new Function(
	        'gl'
	      , 'wrapper'
	      , 'locations'
	      , 'return function(){return gl.getUniform(wrapper.program,locations[' + index + '])}')
	    return proc(gl, wrapper, locations)
	  }

	  function makePropSetter(path, index, type) {
	    switch(type) {
	      case 'bool':
	      case 'int':
	      case 'sampler2D':
	      case 'samplerCube':
	        return 'gl.uniform1i(locations[' + index + '],obj' + path + ')'
	      case 'float':
	        return 'gl.uniform1f(locations[' + index + '],obj' + path + ')'
	      default:
	        var vidx = type.indexOf('vec')
	        if(0 <= vidx && vidx <= 1 && type.length === 4 + vidx) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid data type')
	          }
	          switch(type.charAt(0)) {
	            case 'b':
	            case 'i':
	              return 'gl.uniform' + d + 'iv(locations[' + index + '],obj' + path + ')'
	            case 'v':
	              return 'gl.uniform' + d + 'fv(locations[' + index + '],obj' + path + ')'
	            default:
	              throw new GLError('', 'Unrecognized data type for vector ' + name + ': ' + type)
	          }
	        } else if(type.indexOf('mat') === 0 && type.length === 4) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid uniform dimension type for matrix ' + name + ': ' + type)
	          }
	          return 'gl.uniformMatrix' + d + 'fv(locations[' + index + '],false,obj' + path + ')'
	        } else {
	          throw new GLError('', 'Unknown uniform data type for ' + name + ': ' + type)
	        }
	      break
	    }
	  }

	  function enumerateIndices(prefix, type) {
	    if(typeof type !== 'object') {
	      return [ [prefix, type] ]
	    }
	    var indices = []
	    for(var id in type) {
	      var prop = type[id]
	      var tprefix = prefix
	      if(parseInt(id) + '' === id) {
	        tprefix += '[' + id + ']'
	      } else {
	        tprefix += '.' + id
	      }
	      if(typeof prop === 'object') {
	        indices.push.apply(indices, enumerateIndices(tprefix, prop))
	      } else {
	        indices.push([tprefix, prop])
	      }
	    }
	    return indices
	  }

	  function makeSetter(type) {
	    var code = [ 'return function updateProperty(obj){' ]
	    var indices = enumerateIndices('', type)
	    for(var i=0; i<indices.length; ++i) {
	      var item = indices[i]
	      var path = item[0]
	      var idx  = item[1]
	      if(locations[idx]) {
	        code.push(makePropSetter(path, idx, uniforms[idx].type))
	      }
	    }
	    code.push('return obj}')
	    var proc = new Function('gl', 'locations', code.join('\n'))
	    return proc(gl, locations)
	  }

	  function defaultValue(type) {
	    switch(type) {
	      case 'bool':
	        return false
	      case 'int':
	      case 'sampler2D':
	      case 'samplerCube':
	        return 0
	      case 'float':
	        return 0.0
	      default:
	        var vidx = type.indexOf('vec')
	        if(0 <= vidx && vidx <= 1 && type.length === 4 + vidx) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid data type')
	          }
	          if(type.charAt(0) === 'b') {
	            return makeVector(d, false)
	          }
	          return makeVector(d, 0)
	        } else if(type.indexOf('mat') === 0 && type.length === 4) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid uniform dimension type for matrix ' + name + ': ' + type)
	          }
	          return makeVector(d*d, 0)
	        } else {
	          throw new GLError('', 'Unknown uniform data type for ' + name + ': ' + type)
	        }
	      break
	    }
	  }

	  function storeProperty(obj, prop, type) {
	    if(typeof type === 'object') {
	      var child = processObject(type)
	      Object.defineProperty(obj, prop, {
	        get: identity(child),
	        set: makeSetter(type),
	        enumerable: true,
	        configurable: false
	      })
	    } else {
	      if(locations[type]) {
	        Object.defineProperty(obj, prop, {
	          get: makeGetter(type),
	          set: makeSetter(type),
	          enumerable: true,
	          configurable: false
	        })
	      } else {
	        obj[prop] = defaultValue(uniforms[type].type)
	      }
	    }
	  }

	  function processObject(obj) {
	    var result
	    if(Array.isArray(obj)) {
	      result = new Array(obj.length)
	      for(var i=0; i<obj.length; ++i) {
	        storeProperty(result, i, obj[i])
	      }
	    } else {
	      result = {}
	      for(var id in obj) {
	        storeProperty(result, id, obj[id])
	      }
	    }
	    return result
	  }

	  //Return data
	  var coallesced = coallesceUniforms(uniforms, true)
	  return {
	    get: identity(processObject(coallesced)),
	    set: makeSetter(coallesced),
	    enumerable: true,
	    configurable: true
	  }
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict'

	module.exports = makeReflectTypes

	//Construct type info for reflection.
	//
	// This iterates over the flattened list of uniform type values and smashes them into a JSON object.
	//
	// The leaves of the resulting object are either indices or type strings representing primitive glslify types
	function makeReflectTypes(uniforms, useIndex) {
	  var obj = {}
	  for(var i=0; i<uniforms.length; ++i) {
	    var n = uniforms[i].name
	    var parts = n.split(".")
	    var o = obj
	    for(var j=0; j<parts.length; ++j) {
	      var x = parts[j].split("[")
	      if(x.length > 1) {
	        if(!(x[0] in o)) {
	          o[x[0]] = []
	        }
	        o = o[x[0]]
	        for(var k=1; k<x.length; ++k) {
	          var y = parseInt(x[k])
	          if(k<x.length-1 || j<parts.length-1) {
	            if(!(y in o)) {
	              if(k < x.length-1) {
	                o[y] = []
	              } else {
	                o[y] = {}
	              }
	            }
	            o = o[y]
	          } else {
	            if(useIndex) {
	              o[y] = i
	            } else {
	              o[y] = uniforms[i].type
	            }
	          }
	        }
	      } else if(j < parts.length-1) {
	        if(!(x[0] in o)) {
	          o[x[0]] = {}
	        }
	        o = o[x[0]]
	      } else {
	        if(useIndex) {
	          o[x[0]] = i
	        } else {
	          o[x[0]] = uniforms[i].type
	        }
	      }
	    }
	  }
	  return obj
	}

/***/ },
/* 23 */
/***/ function(module, exports) {

	function GLError (rawError, shortMessage, longMessage) {
	    this.shortMessage = shortMessage || ''
	    this.longMessage = longMessage || ''
	    this.rawError = rawError || ''
	    this.message =
	      'gl-shader: ' + (shortMessage || rawError || '') +
	      (longMessage ? '\n'+longMessage : '')
	    this.stack = (new Error()).stack
	}
	GLError.prototype = new Error
	GLError.prototype.name = 'GLError'
	GLError.prototype.constructor = GLError
	module.exports = GLError


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = createAttributeWrapper

	var GLError = __webpack_require__(23)

	function ShaderAttribute(
	    gl
	  , wrapper
	  , index
	  , locations
	  , dimension
	  , constFunc) {
	  this._gl        = gl
	  this._wrapper   = wrapper
	  this._index     = index
	  this._locations = locations
	  this._dimension = dimension
	  this._constFunc = constFunc
	}

	var proto = ShaderAttribute.prototype

	proto.pointer = function setAttribPointer(
	    type
	  , normalized
	  , stride
	  , offset) {

	  var self      = this
	  var gl        = self._gl
	  var location  = self._locations[self._index]

	  gl.vertexAttribPointer(
	      location
	    , self._dimension
	    , type || gl.FLOAT
	    , !!normalized
	    , stride || 0
	    , offset || 0)
	  gl.enableVertexAttribArray(location)
	}

	proto.set = function(x0, x1, x2, x3) {
	  return this._constFunc(this._locations[this._index], x0, x1, x2, x3)
	}

	Object.defineProperty(proto, 'location', {
	  get: function() {
	    return this._locations[this._index]
	  }
	  , set: function(v) {
	    if(v !== this._locations[this._index]) {
	      this._locations[this._index] = v|0
	      this._wrapper.program = null
	    }
	    return v|0
	  }
	})

	//Adds a vector attribute to obj
	function addVectorAttribute(
	    gl
	  , wrapper
	  , index
	  , locations
	  , dimension
	  , obj
	  , name) {

	  //Construct constant function
	  var constFuncArgs = [ 'gl', 'v' ]
	  var varNames = []
	  for(var i=0; i<dimension; ++i) {
	    constFuncArgs.push('x'+i)
	    varNames.push('x'+i)
	  }
	  constFuncArgs.push(
	    'if(x0.length===void 0){return gl.vertexAttrib' +
	    dimension + 'f(v,' +
	    varNames.join() +
	    ')}else{return gl.vertexAttrib' +
	    dimension +
	    'fv(v,x0)}')
	  var constFunc = Function.apply(null, constFuncArgs)

	  //Create attribute wrapper
	  var attr = new ShaderAttribute(
	      gl
	    , wrapper
	    , index
	    , locations
	    , dimension
	    , constFunc)

	  //Create accessor
	  Object.defineProperty(obj, name, {
	    set: function(x) {
	      gl.disableVertexAttribArray(locations[index])
	      constFunc(gl, locations[index], x)
	      return x
	    }
	    , get: function() {
	      return attr
	    }
	    , enumerable: true
	  })
	}

	function addMatrixAttribute(
	    gl
	  , wrapper
	  , index
	  , locations
	  , dimension
	  , obj
	  , name) {

	  var parts = new Array(dimension)
	  var attrs = new Array(dimension)
	  for(var i=0; i<dimension; ++i) {
	    addVectorAttribute(
	        gl
	      , wrapper
	      , index[i]
	      , locations
	      , dimension
	      , parts
	      , i)
	    attrs[i] = parts[i]
	  }

	  Object.defineProperty(parts, 'location', {
	    set: function(v) {
	      if(Array.isArray(v)) {
	        for(var i=0; i<dimension; ++i) {
	          attrs[i].location = v[i]
	        }
	      } else {
	        for(var i=0; i<dimension; ++i) {
	          attrs[i].location = v + i
	        }
	      }
	      return v
	    }
	    , get: function() {
	      var result = new Array(dimension)
	      for(var i=0; i<dimension; ++i) {
	        result[i] = locations[index[i]]
	      }
	      return result
	    }
	    , enumerable: true
	  })

	  parts.pointer = function(type, normalized, stride, offset) {
	    type       = type || gl.FLOAT
	    normalized = !!normalized
	    stride     = stride || (dimension * dimension)
	    offset     = offset || 0
	    for(var i=0; i<dimension; ++i) {
	      var location = locations[index[i]]
	      gl.vertexAttribPointer(
	            location
	          , dimension
	          , type
	          , normalized
	          , stride
	          , offset + i * dimension)
	      gl.enableVertexAttribArray(location)
	    }
	  }

	  var scratch = new Array(dimension)
	  var vertexAttrib = gl['vertexAttrib' + dimension + 'fv']

	  Object.defineProperty(obj, name, {
	    set: function(x) {
	      for(var i=0; i<dimension; ++i) {
	        var loc = locations[index[i]]
	        gl.disableVertexAttribArray(loc)
	        if(Array.isArray(x[0])) {
	          vertexAttrib.call(gl, loc, x[i])
	        } else {
	          for(var j=0; j<dimension; ++j) {
	            scratch[j] = x[dimension*i + j]
	          }
	          vertexAttrib.call(gl, loc, scratch)
	        }
	      }
	      return x
	    }
	    , get: function() {
	      return parts
	    }
	    , enumerable: true
	  })
	}

	//Create shims for attributes
	function createAttributeWrapper(
	    gl
	  , wrapper
	  , attributes
	  , locations) {

	  var obj = {}
	  for(var i=0, n=attributes.length; i<n; ++i) {

	    var a = attributes[i]
	    var name = a.name
	    var type = a.type
	    var locs = a.locations

	    switch(type) {
	      case 'bool':
	      case 'int':
	      case 'float':
	        addVectorAttribute(
	            gl
	          , wrapper
	          , locs[0]
	          , locations
	          , 1
	          , obj
	          , name)
	      break

	      default:
	        if(type.indexOf('vec') >= 0) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid data type for attribute ' + name + ': ' + type)
	          }
	          addVectorAttribute(
	              gl
	            , wrapper
	            , locs[0]
	            , locations
	            , d
	            , obj
	            , name)
	        } else if(type.indexOf('mat') >= 0) {
	          var d = type.charCodeAt(type.length-1) - 48
	          if(d < 2 || d > 4) {
	            throw new GLError('', 'Invalid data type for attribute ' + name + ': ' + type)
	          }
	          addMatrixAttribute(
	              gl
	            , wrapper
	            , locs
	            , locations
	            , d
	            , obj
	            , name)
	        } else {
	          throw new GLError('', 'Unknown data type for attribute ' + name + ': ' + type)
	        }
	      break
	    }
	  }
	  return obj
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	exports.shader   = getShaderReference
	exports.program  = createProgram

	var GLError = __webpack_require__(23)
	var formatCompilerError = __webpack_require__(26);

	var weakMap = typeof WeakMap === 'undefined' ? __webpack_require__(42) : WeakMap
	var CACHE = new weakMap()

	var SHADER_COUNTER = 0

	function ShaderReference(id, src, type, shader, programs, count, cache) {
	  this.id       = id
	  this.src      = src
	  this.type     = type
	  this.shader   = shader
	  this.count    = count
	  this.programs = []
	  this.cache    = cache
	}

	ShaderReference.prototype.dispose = function() {
	  if(--this.count === 0) {
	    var cache    = this.cache
	    var gl       = cache.gl

	    //Remove program references
	    var programs = this.programs
	    for(var i=0, n=programs.length; i<n; ++i) {
	      var p = cache.programs[programs[i]]
	      if(p) {
	        delete cache.programs[i]
	        gl.deleteProgram(p)
	      }
	    }

	    //Remove shader reference
	    gl.deleteShader(this.shader)
	    delete cache.shaders[(this.type === gl.FRAGMENT_SHADER)|0][this.src]
	  }
	}

	function ContextCache(gl) {
	  this.gl       = gl
	  this.shaders  = [{}, {}]
	  this.programs = {}
	}

	var proto = ContextCache.prototype

	function compileShader(gl, type, src) {
	  var shader = gl.createShader(type)
	  gl.shaderSource(shader, src)
	  gl.compileShader(shader)
	  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    var errLog = gl.getShaderInfoLog(shader)
	    try {
	        var fmt = formatCompilerError(errLog, src, type);
	    } catch (e){
	        console.warn('Failed to format compiler error: ' + e);
	        throw new GLError(errLog, 'Error compiling shader:\n' + errLog)
	    }
	    throw new GLError(errLog, fmt.short, fmt.long)
	  }
	  return shader
	}

	proto.getShaderReference = function(type, src) {
	  var gl      = this.gl
	  var shaders = this.shaders[(type === gl.FRAGMENT_SHADER)|0]
	  var shader  = shaders[src]
	  if(!shader || !gl.isShader(shader.shader)) {
	    var shaderObj = compileShader(gl, type, src)
	    shader = shaders[src] = new ShaderReference(
	      SHADER_COUNTER++,
	      src,
	      type,
	      shaderObj,
	      [],
	      1,
	      this)
	  } else {
	    shader.count += 1
	  }
	  return shader
	}

	function linkProgram(gl, vshader, fshader, attribs, locations) {
	  var program = gl.createProgram()
	  gl.attachShader(program, vshader)
	  gl.attachShader(program, fshader)
	  for(var i=0; i<attribs.length; ++i) {
	    gl.bindAttribLocation(program, locations[i], attribs[i])
	  }
	  gl.linkProgram(program)
	  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	    var errLog = gl.getProgramInfoLog(program)
	    throw new GLError(errLog, 'Error linking program: ' + errLog)
	  }
	  return program
	}

	proto.getProgram = function(vref, fref, attribs, locations) {
	  var token = [vref.id, fref.id, attribs.join(':'), locations.join(':')].join('@')
	  var prog  = this.programs[token]
	  if(!prog || !this.gl.isProgram(prog)) {
	    this.programs[token] = prog = linkProgram(
	      this.gl,
	      vref.shader,
	      fref.shader,
	      attribs,
	      locations)
	    vref.programs.push(token)
	    fref.programs.push(token)
	  }
	  return prog
	}

	function getCache(gl) {
	  var ctxCache = CACHE.get(gl)
	  if(!ctxCache) {
	    ctxCache = new ContextCache(gl)
	    CACHE.set(gl, ctxCache)
	  }
	  return ctxCache
	}

	function getShaderReference(gl, type, src) {
	  return getCache(gl).getShaderReference(type, src)
	}

	function createProgram(gl, vref, fref, attribs, locations) {
	  return getCache(gl).getProgram(vref, fref, attribs, locations)
	}


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	var sprintf = __webpack_require__(27).sprintf;
	var glConstants = __webpack_require__(28);
	var shaderName = __webpack_require__(30);
	var addLineNumbers = __webpack_require__(39);

	module.exports = formatCompilerError;

	function formatCompilerError(errLog, src, type) {
	    "use strict";

	    var name = shaderName(src) || 'of unknown name (see npm glsl-shader-name)';

	    var typeName = 'unknown type';
	    if (type !== undefined) {
	        typeName = type === glConstants.FRAGMENT_SHADER ? 'fragment' : 'vertex'
	    }

	    var longForm = sprintf('Error compiling %s shader %s:\n', typeName, name);
	    var shortForm = sprintf("%s%s", longForm, errLog);

	    var errorStrings = errLog.split('\n');
	    var errors = {};

	    for (var i = 0; i < errorStrings.length; i++) {
	        var errorString = errorStrings[i];
	        if (errorString === '') continue;
	        var lineNo = parseInt(errorString.split(':')[2]);
	        if (isNaN(lineNo)) {
	            throw new Error(sprintf('Could not parse error: %s', errorString));
	        }
	        errors[lineNo] = errorString;
	    }

	    var lines = addLineNumbers(src).split('\n');

	    for (var i = 0; i < lines.length; i++) {
	        if (!errors[i+3] && !errors[i+2] && !errors[i+1]) continue;
	        var line = lines[i];
	        longForm += line + '\n';
	        if (errors[i+1]) {
	            var e = errors[i+1];
	            e = e.substr(e.split(':', 3).join(':').length + 1).trim();
	            longForm += sprintf('^^^ %s\n\n', e);
	        }
	    }

	    return {
	        long: longForm.trim(),
	        short: shortForm.trim()
	    };
	}



/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	(function(window) {
	    var re = {
	        not_string: /[^s]/,
	        number: /[diefg]/,
	        json: /[j]/,
	        not_json: /[^j]/,
	        text: /^[^\x25]+/,
	        modulo: /^\x25{2}/,
	        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
	        key: /^([a-z_][a-z_\d]*)/i,
	        key_access: /^\.([a-z_][a-z_\d]*)/i,
	        index_access: /^\[(\d+)\]/,
	        sign: /^[\+\-]/
	    }

	    function sprintf() {
	        var key = arguments[0], cache = sprintf.cache
	        if (!(cache[key] && cache.hasOwnProperty(key))) {
	            cache[key] = sprintf.parse(key)
	        }
	        return sprintf.format.call(null, cache[key], arguments)
	    }

	    sprintf.format = function(parse_tree, argv) {
	        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
	        for (i = 0; i < tree_length; i++) {
	            node_type = get_type(parse_tree[i])
	            if (node_type === "string") {
	                output[output.length] = parse_tree[i]
	            }
	            else if (node_type === "array") {
	                match = parse_tree[i] // convenience purposes only
	                if (match[2]) { // keyword argument
	                    arg = argv[cursor]
	                    for (k = 0; k < match[2].length; k++) {
	                        if (!arg.hasOwnProperty(match[2][k])) {
	                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
	                        }
	                        arg = arg[match[2][k]]
	                    }
	                }
	                else if (match[1]) { // positional argument (explicit)
	                    arg = argv[match[1]]
	                }
	                else { // positional argument (implicit)
	                    arg = argv[cursor++]
	                }

	                if (get_type(arg) == "function") {
	                    arg = arg()
	                }

	                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
	                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
	                }

	                if (re.number.test(match[8])) {
	                    is_positive = arg >= 0
	                }

	                switch (match[8]) {
	                    case "b":
	                        arg = arg.toString(2)
	                    break
	                    case "c":
	                        arg = String.fromCharCode(arg)
	                    break
	                    case "d":
	                    case "i":
	                        arg = parseInt(arg, 10)
	                    break
	                    case "j":
	                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
	                    break
	                    case "e":
	                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
	                    break
	                    case "f":
	                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
	                    break
	                    case "g":
	                        arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
	                    break
	                    case "o":
	                        arg = arg.toString(8)
	                    break
	                    case "s":
	                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
	                    break
	                    case "u":
	                        arg = arg >>> 0
	                    break
	                    case "x":
	                        arg = arg.toString(16)
	                    break
	                    case "X":
	                        arg = arg.toString(16).toUpperCase()
	                    break
	                }
	                if (re.json.test(match[8])) {
	                    output[output.length] = arg
	                }
	                else {
	                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
	                        sign = is_positive ? "+" : "-"
	                        arg = arg.toString().replace(re.sign, "")
	                    }
	                    else {
	                        sign = ""
	                    }
	                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
	                    pad_length = match[6] - (sign + arg).length
	                    pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
	                    output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
	                }
	            }
	        }
	        return output.join("")
	    }

	    sprintf.cache = {}

	    sprintf.parse = function(fmt) {
	        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
	        while (_fmt) {
	            if ((match = re.text.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = match[0]
	            }
	            else if ((match = re.modulo.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = "%"
	            }
	            else if ((match = re.placeholder.exec(_fmt)) !== null) {
	                if (match[2]) {
	                    arg_names |= 1
	                    var field_list = [], replacement_field = match[2], field_match = []
	                    if ((field_match = re.key.exec(replacement_field)) !== null) {
	                        field_list[field_list.length] = field_match[1]
	                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
	                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else {
	                                throw new SyntaxError("[sprintf] failed to parse named argument key")
	                            }
	                        }
	                    }
	                    else {
	                        throw new SyntaxError("[sprintf] failed to parse named argument key")
	                    }
	                    match[2] = field_list
	                }
	                else {
	                    arg_names |= 2
	                }
	                if (arg_names === 3) {
	                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
	                }
	                parse_tree[parse_tree.length] = match
	            }
	            else {
	                throw new SyntaxError("[sprintf] unexpected placeholder")
	            }
	            _fmt = _fmt.substring(match[0].length)
	        }
	        return parse_tree
	    }

	    var vsprintf = function(fmt, argv, _argv) {
	        _argv = (argv || []).slice(0)
	        _argv.splice(0, 0, fmt)
	        return sprintf.apply(null, _argv)
	    }

	    /**
	     * helpers
	     */
	    function get_type(variable) {
	        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	    }

	    function str_repeat(input, multiplier) {
	        return Array(multiplier + 1).join(input)
	    }

	    /**
	     * export to either browser or node.js
	     */
	    if (true) {
	        exports.sprintf = sprintf
	        exports.vsprintf = vsprintf
	    }
	    else {
	        window.sprintf = sprintf
	        window.vsprintf = vsprintf

	        if (typeof define === "function" && define.amd) {
	            define(function() {
	                return {
	                    sprintf: sprintf,
	                    vsprintf: vsprintf
	                }
	            })
	        }
	    }
	})(typeof window === "undefined" ? this : window);


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var gl10 = __webpack_require__(29)

	module.exports = function lookupConstant (number) {
	  return gl10[number]
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = {
	  0: 'NONE',
	  1: 'ONE',
	  2: 'LINE_LOOP',
	  3: 'LINE_STRIP',
	  4: 'TRIANGLES',
	  5: 'TRIANGLE_STRIP',
	  6: 'TRIANGLE_FAN',
	  256: 'DEPTH_BUFFER_BIT',
	  512: 'NEVER',
	  513: 'LESS',
	  514: 'EQUAL',
	  515: 'LEQUAL',
	  516: 'GREATER',
	  517: 'NOTEQUAL',
	  518: 'GEQUAL',
	  519: 'ALWAYS',
	  768: 'SRC_COLOR',
	  769: 'ONE_MINUS_SRC_COLOR',
	  770: 'SRC_ALPHA',
	  771: 'ONE_MINUS_SRC_ALPHA',
	  772: 'DST_ALPHA',
	  773: 'ONE_MINUS_DST_ALPHA',
	  774: 'DST_COLOR',
	  775: 'ONE_MINUS_DST_COLOR',
	  776: 'SRC_ALPHA_SATURATE',
	  1024: 'STENCIL_BUFFER_BIT',
	  1028: 'FRONT',
	  1029: 'BACK',
	  1032: 'FRONT_AND_BACK',
	  1280: 'INVALID_ENUM',
	  1281: 'INVALID_VALUE',
	  1282: 'INVALID_OPERATION',
	  1285: 'OUT_OF_MEMORY',
	  1286: 'INVALID_FRAMEBUFFER_OPERATION',
	  2304: 'CW',
	  2305: 'CCW',
	  2849: 'LINE_WIDTH',
	  2884: 'CULL_FACE',
	  2885: 'CULL_FACE_MODE',
	  2886: 'FRONT_FACE',
	  2928: 'DEPTH_RANGE',
	  2929: 'DEPTH_TEST',
	  2930: 'DEPTH_WRITEMASK',
	  2931: 'DEPTH_CLEAR_VALUE',
	  2932: 'DEPTH_FUNC',
	  2960: 'STENCIL_TEST',
	  2961: 'STENCIL_CLEAR_VALUE',
	  2962: 'STENCIL_FUNC',
	  2963: 'STENCIL_VALUE_MASK',
	  2964: 'STENCIL_FAIL',
	  2965: 'STENCIL_PASS_DEPTH_FAIL',
	  2966: 'STENCIL_PASS_DEPTH_PASS',
	  2967: 'STENCIL_REF',
	  2968: 'STENCIL_WRITEMASK',
	  2978: 'VIEWPORT',
	  3024: 'DITHER',
	  3042: 'BLEND',
	  3088: 'SCISSOR_BOX',
	  3089: 'SCISSOR_TEST',
	  3106: 'COLOR_CLEAR_VALUE',
	  3107: 'COLOR_WRITEMASK',
	  3317: 'UNPACK_ALIGNMENT',
	  3333: 'PACK_ALIGNMENT',
	  3379: 'MAX_TEXTURE_SIZE',
	  3386: 'MAX_VIEWPORT_DIMS',
	  3408: 'SUBPIXEL_BITS',
	  3410: 'RED_BITS',
	  3411: 'GREEN_BITS',
	  3412: 'BLUE_BITS',
	  3413: 'ALPHA_BITS',
	  3414: 'DEPTH_BITS',
	  3415: 'STENCIL_BITS',
	  3553: 'TEXTURE_2D',
	  4352: 'DONT_CARE',
	  4353: 'FASTEST',
	  4354: 'NICEST',
	  5120: 'BYTE',
	  5121: 'UNSIGNED_BYTE',
	  5122: 'SHORT',
	  5123: 'UNSIGNED_SHORT',
	  5124: 'INT',
	  5125: 'UNSIGNED_INT',
	  5126: 'FLOAT',
	  5386: 'INVERT',
	  5890: 'TEXTURE',
	  6401: 'STENCIL_INDEX',
	  6402: 'DEPTH_COMPONENT',
	  6406: 'ALPHA',
	  6407: 'RGB',
	  6408: 'RGBA',
	  6409: 'LUMINANCE',
	  6410: 'LUMINANCE_ALPHA',
	  7680: 'KEEP',
	  7681: 'REPLACE',
	  7682: 'INCR',
	  7683: 'DECR',
	  7936: 'VENDOR',
	  7937: 'RENDERER',
	  7938: 'VERSION',
	  9728: 'NEAREST',
	  9729: 'LINEAR',
	  9984: 'NEAREST_MIPMAP_NEAREST',
	  9985: 'LINEAR_MIPMAP_NEAREST',
	  9986: 'NEAREST_MIPMAP_LINEAR',
	  9987: 'LINEAR_MIPMAP_LINEAR',
	  10240: 'TEXTURE_MAG_FILTER',
	  10241: 'TEXTURE_MIN_FILTER',
	  10242: 'TEXTURE_WRAP_S',
	  10243: 'TEXTURE_WRAP_T',
	  10497: 'REPEAT',
	  10752: 'POLYGON_OFFSET_UNITS',
	  16384: 'COLOR_BUFFER_BIT',
	  32769: 'CONSTANT_COLOR',
	  32770: 'ONE_MINUS_CONSTANT_COLOR',
	  32771: 'CONSTANT_ALPHA',
	  32772: 'ONE_MINUS_CONSTANT_ALPHA',
	  32773: 'BLEND_COLOR',
	  32774: 'FUNC_ADD',
	  32777: 'BLEND_EQUATION_RGB',
	  32778: 'FUNC_SUBTRACT',
	  32779: 'FUNC_REVERSE_SUBTRACT',
	  32819: 'UNSIGNED_SHORT_4_4_4_4',
	  32820: 'UNSIGNED_SHORT_5_5_5_1',
	  32823: 'POLYGON_OFFSET_FILL',
	  32824: 'POLYGON_OFFSET_FACTOR',
	  32854: 'RGBA4',
	  32855: 'RGB5_A1',
	  32873: 'TEXTURE_BINDING_2D',
	  32926: 'SAMPLE_ALPHA_TO_COVERAGE',
	  32928: 'SAMPLE_COVERAGE',
	  32936: 'SAMPLE_BUFFERS',
	  32937: 'SAMPLES',
	  32938: 'SAMPLE_COVERAGE_VALUE',
	  32939: 'SAMPLE_COVERAGE_INVERT',
	  32968: 'BLEND_DST_RGB',
	  32969: 'BLEND_SRC_RGB',
	  32970: 'BLEND_DST_ALPHA',
	  32971: 'BLEND_SRC_ALPHA',
	  33071: 'CLAMP_TO_EDGE',
	  33170: 'GENERATE_MIPMAP_HINT',
	  33189: 'DEPTH_COMPONENT16',
	  33306: 'DEPTH_STENCIL_ATTACHMENT',
	  33635: 'UNSIGNED_SHORT_5_6_5',
	  33648: 'MIRRORED_REPEAT',
	  33901: 'ALIASED_POINT_SIZE_RANGE',
	  33902: 'ALIASED_LINE_WIDTH_RANGE',
	  33984: 'TEXTURE0',
	  33985: 'TEXTURE1',
	  33986: 'TEXTURE2',
	  33987: 'TEXTURE3',
	  33988: 'TEXTURE4',
	  33989: 'TEXTURE5',
	  33990: 'TEXTURE6',
	  33991: 'TEXTURE7',
	  33992: 'TEXTURE8',
	  33993: 'TEXTURE9',
	  33994: 'TEXTURE10',
	  33995: 'TEXTURE11',
	  33996: 'TEXTURE12',
	  33997: 'TEXTURE13',
	  33998: 'TEXTURE14',
	  33999: 'TEXTURE15',
	  34000: 'TEXTURE16',
	  34001: 'TEXTURE17',
	  34002: 'TEXTURE18',
	  34003: 'TEXTURE19',
	  34004: 'TEXTURE20',
	  34005: 'TEXTURE21',
	  34006: 'TEXTURE22',
	  34007: 'TEXTURE23',
	  34008: 'TEXTURE24',
	  34009: 'TEXTURE25',
	  34010: 'TEXTURE26',
	  34011: 'TEXTURE27',
	  34012: 'TEXTURE28',
	  34013: 'TEXTURE29',
	  34014: 'TEXTURE30',
	  34015: 'TEXTURE31',
	  34016: 'ACTIVE_TEXTURE',
	  34024: 'MAX_RENDERBUFFER_SIZE',
	  34041: 'DEPTH_STENCIL',
	  34055: 'INCR_WRAP',
	  34056: 'DECR_WRAP',
	  34067: 'TEXTURE_CUBE_MAP',
	  34068: 'TEXTURE_BINDING_CUBE_MAP',
	  34069: 'TEXTURE_CUBE_MAP_POSITIVE_X',
	  34070: 'TEXTURE_CUBE_MAP_NEGATIVE_X',
	  34071: 'TEXTURE_CUBE_MAP_POSITIVE_Y',
	  34072: 'TEXTURE_CUBE_MAP_NEGATIVE_Y',
	  34073: 'TEXTURE_CUBE_MAP_POSITIVE_Z',
	  34074: 'TEXTURE_CUBE_MAP_NEGATIVE_Z',
	  34076: 'MAX_CUBE_MAP_TEXTURE_SIZE',
	  34338: 'VERTEX_ATTRIB_ARRAY_ENABLED',
	  34339: 'VERTEX_ATTRIB_ARRAY_SIZE',
	  34340: 'VERTEX_ATTRIB_ARRAY_STRIDE',
	  34341: 'VERTEX_ATTRIB_ARRAY_TYPE',
	  34342: 'CURRENT_VERTEX_ATTRIB',
	  34373: 'VERTEX_ATTRIB_ARRAY_POINTER',
	  34466: 'NUM_COMPRESSED_TEXTURE_FORMATS',
	  34467: 'COMPRESSED_TEXTURE_FORMATS',
	  34660: 'BUFFER_SIZE',
	  34661: 'BUFFER_USAGE',
	  34816: 'STENCIL_BACK_FUNC',
	  34817: 'STENCIL_BACK_FAIL',
	  34818: 'STENCIL_BACK_PASS_DEPTH_FAIL',
	  34819: 'STENCIL_BACK_PASS_DEPTH_PASS',
	  34877: 'BLEND_EQUATION_ALPHA',
	  34921: 'MAX_VERTEX_ATTRIBS',
	  34922: 'VERTEX_ATTRIB_ARRAY_NORMALIZED',
	  34930: 'MAX_TEXTURE_IMAGE_UNITS',
	  34962: 'ARRAY_BUFFER',
	  34963: 'ELEMENT_ARRAY_BUFFER',
	  34964: 'ARRAY_BUFFER_BINDING',
	  34965: 'ELEMENT_ARRAY_BUFFER_BINDING',
	  34975: 'VERTEX_ATTRIB_ARRAY_BUFFER_BINDING',
	  35040: 'STREAM_DRAW',
	  35044: 'STATIC_DRAW',
	  35048: 'DYNAMIC_DRAW',
	  35632: 'FRAGMENT_SHADER',
	  35633: 'VERTEX_SHADER',
	  35660: 'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
	  35661: 'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
	  35663: 'SHADER_TYPE',
	  35664: 'FLOAT_VEC2',
	  35665: 'FLOAT_VEC3',
	  35666: 'FLOAT_VEC4',
	  35667: 'INT_VEC2',
	  35668: 'INT_VEC3',
	  35669: 'INT_VEC4',
	  35670: 'BOOL',
	  35671: 'BOOL_VEC2',
	  35672: 'BOOL_VEC3',
	  35673: 'BOOL_VEC4',
	  35674: 'FLOAT_MAT2',
	  35675: 'FLOAT_MAT3',
	  35676: 'FLOAT_MAT4',
	  35678: 'SAMPLER_2D',
	  35680: 'SAMPLER_CUBE',
	  35712: 'DELETE_STATUS',
	  35713: 'COMPILE_STATUS',
	  35714: 'LINK_STATUS',
	  35715: 'VALIDATE_STATUS',
	  35716: 'INFO_LOG_LENGTH',
	  35717: 'ATTACHED_SHADERS',
	  35718: 'ACTIVE_UNIFORMS',
	  35719: 'ACTIVE_UNIFORM_MAX_LENGTH',
	  35720: 'SHADER_SOURCE_LENGTH',
	  35721: 'ACTIVE_ATTRIBUTES',
	  35722: 'ACTIVE_ATTRIBUTE_MAX_LENGTH',
	  35724: 'SHADING_LANGUAGE_VERSION',
	  35725: 'CURRENT_PROGRAM',
	  36003: 'STENCIL_BACK_REF',
	  36004: 'STENCIL_BACK_VALUE_MASK',
	  36005: 'STENCIL_BACK_WRITEMASK',
	  36006: 'FRAMEBUFFER_BINDING',
	  36007: 'RENDERBUFFER_BINDING',
	  36048: 'FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE',
	  36049: 'FRAMEBUFFER_ATTACHMENT_OBJECT_NAME',
	  36050: 'FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL',
	  36051: 'FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE',
	  36053: 'FRAMEBUFFER_COMPLETE',
	  36054: 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
	  36055: 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT',
	  36057: 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS',
	  36061: 'FRAMEBUFFER_UNSUPPORTED',
	  36064: 'COLOR_ATTACHMENT0',
	  36096: 'DEPTH_ATTACHMENT',
	  36128: 'STENCIL_ATTACHMENT',
	  36160: 'FRAMEBUFFER',
	  36161: 'RENDERBUFFER',
	  36162: 'RENDERBUFFER_WIDTH',
	  36163: 'RENDERBUFFER_HEIGHT',
	  36164: 'RENDERBUFFER_INTERNAL_FORMAT',
	  36168: 'STENCIL_INDEX8',
	  36176: 'RENDERBUFFER_RED_SIZE',
	  36177: 'RENDERBUFFER_GREEN_SIZE',
	  36178: 'RENDERBUFFER_BLUE_SIZE',
	  36179: 'RENDERBUFFER_ALPHA_SIZE',
	  36180: 'RENDERBUFFER_DEPTH_SIZE',
	  36181: 'RENDERBUFFER_STENCIL_SIZE',
	  36194: 'RGB565',
	  36336: 'LOW_FLOAT',
	  36337: 'MEDIUM_FLOAT',
	  36338: 'HIGH_FLOAT',
	  36339: 'LOW_INT',
	  36340: 'MEDIUM_INT',
	  36341: 'HIGH_INT',
	  36346: 'SHADER_COMPILER',
	  36347: 'MAX_VERTEX_UNIFORM_VECTORS',
	  36348: 'MAX_VARYING_VECTORS',
	  36349: 'MAX_FRAGMENT_UNIFORM_VECTORS',
	  37440: 'UNPACK_FLIP_Y_WEBGL',
	  37441: 'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
	  37442: 'CONTEXT_LOST_WEBGL',
	  37443: 'UNPACK_COLORSPACE_CONVERSION_WEBGL',
	  37444: 'BROWSER_DEFAULT_WEBGL'
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var tokenize = __webpack_require__(31)
	var atob     = __webpack_require__(38)

	module.exports = getName

	function getName(src) {
	  var tokens = Array.isArray(src)
	    ? src
	    : tokenize(src)

	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]
	    if (token.type !== 'preprocessor') continue
	    var match = token.data.match(/\#define\s+SHADER_NAME(_B64)?\s+(.+)$/)
	    if (!match) continue
	    if (!match[2]) continue

	    var b64  = match[1]
	    var name = match[2]

	    return (b64 ? atob(name) : name).trim()
	  }
	}


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var tokenize = __webpack_require__(32)

	module.exports = tokenizeString

	function tokenizeString(str, opt) {
	  var generator = tokenize(opt)
	  var tokens = []

	  tokens = tokens.concat(generator(str))
	  tokens = tokens.concat(generator(null))

	  return tokens
	}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = tokenize

	var literals100 = __webpack_require__(33)
	  , operators = __webpack_require__(34)
	  , builtins100 = __webpack_require__(35)
	  , literals300es = __webpack_require__(36)
	  , builtins300es = __webpack_require__(37)

	var NORMAL = 999          // <-- never emitted
	  , TOKEN = 9999          // <-- never emitted
	  , BLOCK_COMMENT = 0
	  , LINE_COMMENT = 1
	  , PREPROCESSOR = 2
	  , OPERATOR = 3
	  , INTEGER = 4
	  , FLOAT = 5
	  , IDENT = 6
	  , BUILTIN = 7
	  , KEYWORD = 8
	  , WHITESPACE = 9
	  , EOF = 10
	  , HEX = 11

	var map = [
	    'block-comment'
	  , 'line-comment'
	  , 'preprocessor'
	  , 'operator'
	  , 'integer'
	  , 'float'
	  , 'ident'
	  , 'builtin'
	  , 'keyword'
	  , 'whitespace'
	  , 'eof'
	  , 'integer'
	]

	function tokenize(opt) {
	  var i = 0
	    , total = 0
	    , mode = NORMAL
	    , c
	    , last
	    , content = []
	    , tokens = []
	    , token_idx = 0
	    , token_offs = 0
	    , line = 1
	    , col = 0
	    , start = 0
	    , isnum = false
	    , isoperator = false
	    , input = ''
	    , len

	  opt = opt || {}
	  var allBuiltins = builtins100
	  var allLiterals = literals100
	  if (opt.version === '300 es') {
	    allBuiltins = builtins300es
	    allLiterals = literals300es
	  }

	  return function(data) {
	    tokens = []
	    if (data !== null) return write(data.replace ? data.replace(/\r\n/g, '\n') : data)
	    return end()
	  }

	  function token(data) {
	    if (data.length) {
	      tokens.push({
	        type: map[mode]
	      , data: data
	      , position: start
	      , line: line
	      , column: col
	      })
	    }
	  }

	  function write(chunk) {
	    i = 0
	    input += chunk
	    len = input.length

	    var last

	    while(c = input[i], i < len) {
	      last = i

	      switch(mode) {
	        case BLOCK_COMMENT: i = block_comment(); break
	        case LINE_COMMENT: i = line_comment(); break
	        case PREPROCESSOR: i = preprocessor(); break
	        case OPERATOR: i = operator(); break
	        case INTEGER: i = integer(); break
	        case HEX: i = hex(); break
	        case FLOAT: i = decimal(); break
	        case TOKEN: i = readtoken(); break
	        case WHITESPACE: i = whitespace(); break
	        case NORMAL: i = normal(); break
	      }

	      if(last !== i) {
	        switch(input[last]) {
	          case '\n': col = 0; ++line; break
	          default: ++col; break
	        }
	      }
	    }

	    total += i
	    input = input.slice(i)
	    return tokens
	  }

	  function end(chunk) {
	    if(content.length) {
	      token(content.join(''))
	    }

	    mode = EOF
	    token('(eof)')
	    return tokens
	  }

	  function normal() {
	    content = content.length ? [] : content

	    if(last === '/' && c === '*') {
	      start = total + i - 1
	      mode = BLOCK_COMMENT
	      last = c
	      return i + 1
	    }

	    if(last === '/' && c === '/') {
	      start = total + i - 1
	      mode = LINE_COMMENT
	      last = c
	      return i + 1
	    }

	    if(c === '#') {
	      mode = PREPROCESSOR
	      start = total + i
	      return i
	    }

	    if(/\s/.test(c)) {
	      mode = WHITESPACE
	      start = total + i
	      return i
	    }

	    isnum = /\d/.test(c)
	    isoperator = /[^\w_]/.test(c)

	    start = total + i
	    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
	    return i
	  }

	  function whitespace() {
	    if(/[^\s]/g.test(c)) {
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }
	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function preprocessor() {
	    if((c === '\r' || c === '\n') && last !== '\\') {
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }
	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function line_comment() {
	    return preprocessor()
	  }

	  function block_comment() {
	    if(c === '/' && last === '*') {
	      content.push(c)
	      token(content.join(''))
	      mode = NORMAL
	      return i + 1
	    }

	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function operator() {
	    if(last === '.' && /\d/.test(c)) {
	      mode = FLOAT
	      return i
	    }

	    if(last === '/' && c === '*') {
	      mode = BLOCK_COMMENT
	      return i
	    }

	    if(last === '/' && c === '/') {
	      mode = LINE_COMMENT
	      return i
	    }

	    if(c === '.' && content.length) {
	      while(determine_operator(content));

	      mode = FLOAT
	      return i
	    }

	    if(c === ';' || c === ')' || c === '(') {
	      if(content.length) while(determine_operator(content));
	      token(c)
	      mode = NORMAL
	      return i + 1
	    }

	    var is_composite_operator = content.length === 2 && c !== '='
	    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
	      while(determine_operator(content));
	      mode = NORMAL
	      return i
	    }

	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function determine_operator(buf) {
	    var j = 0
	      , idx
	      , res

	    do {
	      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
	      res = operators[idx]

	      if(idx === -1) {
	        if(j-- + buf.length > 0) continue
	        res = buf.slice(0, 1).join('')
	      }

	      token(res)

	      start += res.length
	      content = content.slice(res.length)
	      return content.length
	    } while(1)
	  }

	  function hex() {
	    if(/[^a-fA-F0-9]/.test(c)) {
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }

	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function integer() {
	    if(c === '.') {
	      content.push(c)
	      mode = FLOAT
	      last = c
	      return i + 1
	    }

	    if(/[eE]/.test(c)) {
	      content.push(c)
	      mode = FLOAT
	      last = c
	      return i + 1
	    }

	    if(c === 'x' && content.length === 1 && content[0] === '0') {
	      mode = HEX
	      content.push(c)
	      last = c
	      return i + 1
	    }

	    if(/[^\d]/.test(c)) {
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }

	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function decimal() {
	    if(c === 'f') {
	      content.push(c)
	      last = c
	      i += 1
	    }

	    if(/[eE]/.test(c)) {
	      content.push(c)
	      last = c
	      return i + 1
	    }

	    if (c === '-' && /[eE]/.test(last)) {
	      content.push(c)
	      last = c
	      return i + 1
	    }

	    if(/[^\d]/.test(c)) {
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }

	    content.push(c)
	    last = c
	    return i + 1
	  }

	  function readtoken() {
	    if(/[^\d\w_]/.test(c)) {
	      var contentstr = content.join('')
	      if(allLiterals.indexOf(contentstr) > -1) {
	        mode = KEYWORD
	      } else if(allBuiltins.indexOf(contentstr) > -1) {
	        mode = BUILTIN
	      } else {
	        mode = IDENT
	      }
	      token(content.join(''))
	      mode = NORMAL
	      return i
	    }
	    content.push(c)
	    last = c
	    return i + 1
	  }
	}


/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = [
	  // current
	    'precision'
	  , 'highp'
	  , 'mediump'
	  , 'lowp'
	  , 'attribute'
	  , 'const'
	  , 'uniform'
	  , 'varying'
	  , 'break'
	  , 'continue'
	  , 'do'
	  , 'for'
	  , 'while'
	  , 'if'
	  , 'else'
	  , 'in'
	  , 'out'
	  , 'inout'
	  , 'float'
	  , 'int'
	  , 'void'
	  , 'bool'
	  , 'true'
	  , 'false'
	  , 'discard'
	  , 'return'
	  , 'mat2'
	  , 'mat3'
	  , 'mat4'
	  , 'vec2'
	  , 'vec3'
	  , 'vec4'
	  , 'ivec2'
	  , 'ivec3'
	  , 'ivec4'
	  , 'bvec2'
	  , 'bvec3'
	  , 'bvec4'
	  , 'sampler1D'
	  , 'sampler2D'
	  , 'sampler3D'
	  , 'samplerCube'
	  , 'sampler1DShadow'
	  , 'sampler2DShadow'
	  , 'struct'

	  // future
	  , 'asm'
	  , 'class'
	  , 'union'
	  , 'enum'
	  , 'typedef'
	  , 'template'
	  , 'this'
	  , 'packed'
	  , 'goto'
	  , 'switch'
	  , 'default'
	  , 'inline'
	  , 'noinline'
	  , 'volatile'
	  , 'public'
	  , 'static'
	  , 'extern'
	  , 'external'
	  , 'interface'
	  , 'long'
	  , 'short'
	  , 'double'
	  , 'half'
	  , 'fixed'
	  , 'unsigned'
	  , 'input'
	  , 'output'
	  , 'hvec2'
	  , 'hvec3'
	  , 'hvec4'
	  , 'dvec2'
	  , 'dvec3'
	  , 'dvec4'
	  , 'fvec2'
	  , 'fvec3'
	  , 'fvec4'
	  , 'sampler2DRect'
	  , 'sampler3DRect'
	  , 'sampler2DRectShadow'
	  , 'sizeof'
	  , 'cast'
	  , 'namespace'
	  , 'using'
	]


/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = [
	    '<<='
	  , '>>='
	  , '++'
	  , '--'
	  , '<<'
	  , '>>'
	  , '<='
	  , '>='
	  , '=='
	  , '!='
	  , '&&'
	  , '||'
	  , '+='
	  , '-='
	  , '*='
	  , '/='
	  , '%='
	  , '&='
	  , '^^'
	  , '^='
	  , '|='
	  , '('
	  , ')'
	  , '['
	  , ']'
	  , '.'
	  , '!'
	  , '~'
	  , '*'
	  , '/'
	  , '%'
	  , '+'
	  , '-'
	  , '<'
	  , '>'
	  , '&'
	  , '^'
	  , '|'
	  , '?'
	  , ':'
	  , '='
	  , ','
	  , ';'
	  , '{'
	  , '}'
	]


/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = [
	  // Keep this list sorted
	  'abs'
	  , 'acos'
	  , 'all'
	  , 'any'
	  , 'asin'
	  , 'atan'
	  , 'ceil'
	  , 'clamp'
	  , 'cos'
	  , 'cross'
	  , 'dFdx'
	  , 'dFdy'
	  , 'degrees'
	  , 'distance'
	  , 'dot'
	  , 'equal'
	  , 'exp'
	  , 'exp2'
	  , 'faceforward'
	  , 'floor'
	  , 'fract'
	  , 'gl_BackColor'
	  , 'gl_BackLightModelProduct'
	  , 'gl_BackLightProduct'
	  , 'gl_BackMaterial'
	  , 'gl_BackSecondaryColor'
	  , 'gl_ClipPlane'
	  , 'gl_ClipVertex'
	  , 'gl_Color'
	  , 'gl_DepthRange'
	  , 'gl_DepthRangeParameters'
	  , 'gl_EyePlaneQ'
	  , 'gl_EyePlaneR'
	  , 'gl_EyePlaneS'
	  , 'gl_EyePlaneT'
	  , 'gl_Fog'
	  , 'gl_FogCoord'
	  , 'gl_FogFragCoord'
	  , 'gl_FogParameters'
	  , 'gl_FragColor'
	  , 'gl_FragCoord'
	  , 'gl_FragData'
	  , 'gl_FragDepth'
	  , 'gl_FragDepthEXT'
	  , 'gl_FrontColor'
	  , 'gl_FrontFacing'
	  , 'gl_FrontLightModelProduct'
	  , 'gl_FrontLightProduct'
	  , 'gl_FrontMaterial'
	  , 'gl_FrontSecondaryColor'
	  , 'gl_LightModel'
	  , 'gl_LightModelParameters'
	  , 'gl_LightModelProducts'
	  , 'gl_LightProducts'
	  , 'gl_LightSource'
	  , 'gl_LightSourceParameters'
	  , 'gl_MaterialParameters'
	  , 'gl_MaxClipPlanes'
	  , 'gl_MaxCombinedTextureImageUnits'
	  , 'gl_MaxDrawBuffers'
	  , 'gl_MaxFragmentUniformComponents'
	  , 'gl_MaxLights'
	  , 'gl_MaxTextureCoords'
	  , 'gl_MaxTextureImageUnits'
	  , 'gl_MaxTextureUnits'
	  , 'gl_MaxVaryingFloats'
	  , 'gl_MaxVertexAttribs'
	  , 'gl_MaxVertexTextureImageUnits'
	  , 'gl_MaxVertexUniformComponents'
	  , 'gl_ModelViewMatrix'
	  , 'gl_ModelViewMatrixInverse'
	  , 'gl_ModelViewMatrixInverseTranspose'
	  , 'gl_ModelViewMatrixTranspose'
	  , 'gl_ModelViewProjectionMatrix'
	  , 'gl_ModelViewProjectionMatrixInverse'
	  , 'gl_ModelViewProjectionMatrixInverseTranspose'
	  , 'gl_ModelViewProjectionMatrixTranspose'
	  , 'gl_MultiTexCoord0'
	  , 'gl_MultiTexCoord1'
	  , 'gl_MultiTexCoord2'
	  , 'gl_MultiTexCoord3'
	  , 'gl_MultiTexCoord4'
	  , 'gl_MultiTexCoord5'
	  , 'gl_MultiTexCoord6'
	  , 'gl_MultiTexCoord7'
	  , 'gl_Normal'
	  , 'gl_NormalMatrix'
	  , 'gl_NormalScale'
	  , 'gl_ObjectPlaneQ'
	  , 'gl_ObjectPlaneR'
	  , 'gl_ObjectPlaneS'
	  , 'gl_ObjectPlaneT'
	  , 'gl_Point'
	  , 'gl_PointCoord'
	  , 'gl_PointParameters'
	  , 'gl_PointSize'
	  , 'gl_Position'
	  , 'gl_ProjectionMatrix'
	  , 'gl_ProjectionMatrixInverse'
	  , 'gl_ProjectionMatrixInverseTranspose'
	  , 'gl_ProjectionMatrixTranspose'
	  , 'gl_SecondaryColor'
	  , 'gl_TexCoord'
	  , 'gl_TextureEnvColor'
	  , 'gl_TextureMatrix'
	  , 'gl_TextureMatrixInverse'
	  , 'gl_TextureMatrixInverseTranspose'
	  , 'gl_TextureMatrixTranspose'
	  , 'gl_Vertex'
	  , 'greaterThan'
	  , 'greaterThanEqual'
	  , 'inversesqrt'
	  , 'length'
	  , 'lessThan'
	  , 'lessThanEqual'
	  , 'log'
	  , 'log2'
	  , 'matrixCompMult'
	  , 'max'
	  , 'min'
	  , 'mix'
	  , 'mod'
	  , 'normalize'
	  , 'not'
	  , 'notEqual'
	  , 'pow'
	  , 'radians'
	  , 'reflect'
	  , 'refract'
	  , 'sign'
	  , 'sin'
	  , 'smoothstep'
	  , 'sqrt'
	  , 'step'
	  , 'tan'
	  , 'texture2D'
	  , 'texture2DLod'
	  , 'texture2DProj'
	  , 'texture2DProjLod'
	  , 'textureCube'
	  , 'textureCubeLod'
	  , 'texture2DLodEXT'
	  , 'texture2DProjLodEXT'
	  , 'textureCubeLodEXT'
	  , 'texture2DGradEXT'
	  , 'texture2DProjGradEXT'
	  , 'textureCubeGradEXT'
	]


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var v100 = __webpack_require__(33)

	module.exports = v100.slice().concat([
	   'layout'
	  , 'centroid'
	  , 'smooth'
	  , 'case'
	  , 'mat2x2'
	  , 'mat2x3'
	  , 'mat2x4'
	  , 'mat3x2'
	  , 'mat3x3'
	  , 'mat3x4'
	  , 'mat4x2'
	  , 'mat4x3'
	  , 'mat4x4'
	  , 'uint'
	  , 'uvec2'
	  , 'uvec3'
	  , 'uvec4'
	  , 'samplerCubeShadow'
	  , 'sampler2DArray'
	  , 'sampler2DArrayShadow'
	  , 'isampler2D'
	  , 'isampler3D'
	  , 'isamplerCube'
	  , 'isampler2DArray'
	  , 'usampler2D'
	  , 'usampler3D'
	  , 'usamplerCube'
	  , 'usampler2DArray'
	  , 'coherent'
	  , 'restrict'
	  , 'readonly'
	  , 'writeonly'
	  , 'resource'
	  , 'atomic_uint'
	  , 'noperspective'
	  , 'patch'
	  , 'sample'
	  , 'subroutine'
	  , 'common'
	  , 'partition'
	  , 'active'
	  , 'filter'
	  , 'image1D'
	  , 'image2D'
	  , 'image3D'
	  , 'imageCube'
	  , 'iimage1D'
	  , 'iimage2D'
	  , 'iimage3D'
	  , 'iimageCube'
	  , 'uimage1D'
	  , 'uimage2D'
	  , 'uimage3D'
	  , 'uimageCube'
	  , 'image1DArray'
	  , 'image2DArray'
	  , 'iimage1DArray'
	  , 'iimage2DArray'
	  , 'uimage1DArray'
	  , 'uimage2DArray'
	  , 'image1DShadow'
	  , 'image2DShadow'
	  , 'image1DArrayShadow'
	  , 'image2DArrayShadow'
	  , 'imageBuffer'
	  , 'iimageBuffer'
	  , 'uimageBuffer'
	  , 'sampler1DArray'
	  , 'sampler1DArrayShadow'
	  , 'isampler1D'
	  , 'isampler1DArray'
	  , 'usampler1D'
	  , 'usampler1DArray'
	  , 'isampler2DRect'
	  , 'usampler2DRect'
	  , 'samplerBuffer'
	  , 'isamplerBuffer'
	  , 'usamplerBuffer'
	  , 'sampler2DMS'
	  , 'isampler2DMS'
	  , 'usampler2DMS'
	  , 'sampler2DMSArray'
	  , 'isampler2DMSArray'
	  , 'usampler2DMSArray'
	])


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// 300es builtins/reserved words that were previously valid in v100
	var v100 = __webpack_require__(35)

	// The texture2D|Cube functions have been removed
	// And the gl_ features are updated
	v100 = v100.slice().filter(function (b) {
	  return !/^(gl\_|texture)/.test(b)
	})

	module.exports = v100.concat([
	  // the updated gl_ constants
	    'gl_VertexID'
	  , 'gl_InstanceID'
	  , 'gl_Position'
	  , 'gl_PointSize'
	  , 'gl_FragCoord'
	  , 'gl_FrontFacing'
	  , 'gl_FragDepth'
	  , 'gl_PointCoord'
	  , 'gl_MaxVertexAttribs'
	  , 'gl_MaxVertexUniformVectors'
	  , 'gl_MaxVertexOutputVectors'
	  , 'gl_MaxFragmentInputVectors'
	  , 'gl_MaxVertexTextureImageUnits'
	  , 'gl_MaxCombinedTextureImageUnits'
	  , 'gl_MaxTextureImageUnits'
	  , 'gl_MaxFragmentUniformVectors'
	  , 'gl_MaxDrawBuffers'
	  , 'gl_MinProgramTexelOffset'
	  , 'gl_MaxProgramTexelOffset'
	  , 'gl_DepthRangeParameters'
	  , 'gl_DepthRange'

	  // other builtins
	  , 'trunc'
	  , 'round'
	  , 'roundEven'
	  , 'isnan'
	  , 'isinf'
	  , 'floatBitsToInt'
	  , 'floatBitsToUint'
	  , 'intBitsToFloat'
	  , 'uintBitsToFloat'
	  , 'packSnorm2x16'
	  , 'unpackSnorm2x16'
	  , 'packUnorm2x16'
	  , 'unpackUnorm2x16'
	  , 'packHalf2x16'
	  , 'unpackHalf2x16'
	  , 'outerProduct'
	  , 'transpose'
	  , 'determinant'
	  , 'inverse'
	  , 'texture'
	  , 'textureSize'
	  , 'textureProj'
	  , 'textureLod'
	  , 'textureOffset'
	  , 'texelFetch'
	  , 'texelFetchOffset'
	  , 'textureProjOffset'
	  , 'textureLodOffset'
	  , 'textureProjLod'
	  , 'textureProjLodOffset'
	  , 'textureGrad'
	  , 'textureGradOffset'
	  , 'textureProjGrad'
	  , 'textureProjGradOffset'
	])


/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = function _atob(str) {
	  return atob(str)
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var padLeft = __webpack_require__(40)

	module.exports = addLineNumbers
	function addLineNumbers (string, start, delim) {
	  start = typeof start === 'number' ? start : 1
	  delim = delim || ': '

	  var lines = string.split(/\r?\n/)
	  var totalDigits = String(lines.length + start - 1).length
	  return lines.map(function (line, i) {
	    var c = i + start
	    var digits = String(c).length
	    var prefix = padLeft(c, totalDigits - digits)
	    return prefix + delim + line
	  }).join('\n')
	}


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * pad-left <https://github.com/jonschlinkert/pad-left>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT license.
	 */

	'use strict';

	var repeat = __webpack_require__(41);

	module.exports = function padLeft(str, num, ch) {
	  ch = typeof ch !== 'undefined' ? (ch + '') : ' ';
	  return repeat(ch, num) + str;
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	/*!
	 * repeat-string <https://github.com/jonschlinkert/repeat-string>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	/**
	 * Results cache
	 */

	var res = '';
	var cache;

	/**
	 * Expose `repeat`
	 */

	module.exports = repeat;

	/**
	 * Repeat the given `string` the specified `number`
	 * of times.
	 *
	 * **Example:**
	 *
	 * ```js
	 * var repeat = require('repeat-string');
	 * repeat('A', 5);
	 * //=> AAAAA
	 * ```
	 *
	 * @param {String} `string` The string to repeat
	 * @param {Number} `number` The number of times to repeat the string
	 * @return {String} Repeated string
	 * @api public
	 */

	function repeat(str, num) {
	  if (typeof str !== 'string') {
	    throw new TypeError('expected a string');
	  }

	  // cover common, quick use cases
	  if (num === 1) return str;
	  if (num === 2) return str + str;

	  var max = str.length * num;
	  if (cache !== str || typeof cache === 'undefined') {
	    cache = str;
	    res = '';
	  } else if (res.length >= max) {
	    return res.substr(0, max);
	  }

	  while (max > res.length && num > 1) {
	    if (num & 1) {
	      res += str;
	    }

	    num >>= 1;
	    str += str;
	  }

	  res += str;
	  res = res.substr(0, max);
	  return res;
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Original - @Gozola. 
	// https://gist.github.com/Gozala/1269991
	// This is a reimplemented version (with a few bug fixes).

	var createStore = __webpack_require__(43);

	module.exports = weakMap;

	function weakMap() {
	    var privates = createStore();

	    return {
	        'get': function (key, fallback) {
	            var store = privates(key)
	            return store.hasOwnProperty('value') ?
	                store.value : fallback
	        },
	        'set': function (key, value) {
	            privates(key).value = value;
	        },
	        'has': function(key) {
	            return 'value' in privates(key);
	        },
	        'delete': function (key) {
	            return delete privates(key).value;
	        }
	    }
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var hiddenStore = __webpack_require__(44);

	module.exports = createStore;

	function createStore() {
	    var key = {};

	    return function (obj) {
	        if ((typeof obj !== 'object' || obj === null) &&
	            typeof obj !== 'function'
	        ) {
	            throw new Error('Weakmap-shim: Key must be object')
	        }

	        var store = obj.valueOf(key);
	        return store && store.identity === key ?
	            store : hiddenStore(obj, key);
	    };
	}


/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = hiddenStore;

	function hiddenStore(obj, key) {
	    var store = { identity: key };
	    var valueOf = obj.valueOf;

	    Object.defineProperty(obj, "valueOf", {
	        value: function (value) {
	            return value !== key ?
	                valueOf.apply(this, arguments) : store;
	        },
	        writable: true
	    });

	    return store;
	}


/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict'

	exports.uniforms    = runtimeUniforms
	exports.attributes  = runtimeAttributes

	var GL_TO_GLSL_TYPES = {
	  'FLOAT':       'float',
	  'FLOAT_VEC2':  'vec2',
	  'FLOAT_VEC3':  'vec3',
	  'FLOAT_VEC4':  'vec4',
	  'INT':         'int',
	  'INT_VEC2':    'ivec2',
	  'INT_VEC3':    'ivec3',
	  'INT_VEC4':    'ivec4',
	  'BOOL':        'bool',
	  'BOOL_VEC2':   'bvec2',
	  'BOOL_VEC3':   'bvec3',
	  'BOOL_VEC4':   'bvec4',
	  'FLOAT_MAT2':  'mat2',
	  'FLOAT_MAT3':  'mat3',
	  'FLOAT_MAT4':  'mat4',
	  'SAMPLER_2D':  'sampler2D',
	  'SAMPLER_CUBE':'samplerCube'
	}

	var GL_TABLE = null

	function getType(gl, type) {
	  if(!GL_TABLE) {
	    var typeNames = Object.keys(GL_TO_GLSL_TYPES)
	    GL_TABLE = {}
	    for(var i=0; i<typeNames.length; ++i) {
	      var tn = typeNames[i]
	      GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn]
	    }
	  }
	  return GL_TABLE[type]
	}

	function runtimeUniforms(gl, program) {
	  var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
	  var result = []
	  for(var i=0; i<numUniforms; ++i) {
	    var info = gl.getActiveUniform(program, i)
	    if(info) {
	      var type = getType(gl, info.type)
	      if(info.size > 1) {
	        for(var j=0; j<info.size; ++j) {
	          result.push({
	            name: info.name.replace('[0]', '[' + j + ']'),
	            type: type
	          })
	        }
	      } else {
	        result.push({
	          name: info.name,
	          type: type
	        })
	      }
	    }
	  }
	  return result
	}

	function runtimeAttributes(gl, program) {
	  var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
	  var result = []
	  for(var i=0; i<numAttributes; ++i) {
	    var info = gl.getActiveAttrib(program, i)
	    if(info) {
	      result.push({
	        name: info.name,
	        type: getType(gl, info.type)
	      })
	    }
	  }
	  return result
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var shell = __webpack_require__(2)()
	var createShader = __webpack_require__(20)
	var shader, buffer
	 
	shell.on('gl-init', function() {
	  var gl = shell.gl
	 
	  //Create shader 
	  shader = createShader(gl,
	    'attribute vec3 position;\
	    varying vec2 uv;\
	    void main() {\
	      gl_Position = vec4(position, 1.0);\
	      uv = position.xy;\
	    }',
	    'precision highp float;\
	    uniform float t;\
	    varying vec2 uv;\
	    void main() {\
	      gl_FragColor = vec4(0.5*(uv+1.0), 0.5*(cos(t)+1.0), 1.0);\
	    }')
	 
	  //Create vertex buffer 
	  buffer = gl.createBuffer()
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	    -1, 0, 0,
	    0, -1, 0,
	    1, 1, 0
	  ]), gl.STATIC_DRAW)
	})
	 
	shell.on('gl-render', function(t) {
	  var gl = shell.gl
	 
	  //Bind shader 
	  shader.bind()
	  
	  //Set attributes 
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	  shader.attributes.position.pointer()
	 
	  //Set uniforms 
	  shader.uniforms.t += 0.01
	 
	  //Draw 
	  gl.drawArrays(gl.TRIANGLES, 0, 3)
	})

/***/ }
/******/ ]);