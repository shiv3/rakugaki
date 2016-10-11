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

	
	'use strict';

	if("Crawler" in this){

	}else{
	    var Crawler = __webpack_require__(1);
	}
	// let Crawler = require("./crawler.js");



	const get_glow_color = (username,date=(new Date())) => {
	    let c = new Crawler(username);
	    let callback = (data) => {
	        if(data != undefined){
	            let gen_not_push_time = (created_at) =>{
	                return new Date(date - new Date(created_at)).getUTCDate()-1
	            }
	            let latestPush = data.filter((q)=>{return q.type=="PushEvent"})[0];
	            let todayspush = data.filter((q)=>{return q.type=="PushEvent"&&(gen_not_push_time(q.created_at))==0})


	            
	            let glowcolor = "濃い緑";
	            switch (todayspush.length) {
	                case 0:
	                    glowcolor = "白(" + gen_not_push_time(latestPush.created_at) + "日間 GitHubにpushしていない)";
	                    break;
	                case 1:
	                    glowcolor = "薄い緑"
	                    break;
	                case 2:
	                    glowcolor = "普通の緑"
	                    break;
	                default:
	                    break;
	            }
	            console.log("pushの数は" + todayspush.length);
	            console.log(date.toLocaleString().split(" ")[0] + "の芝の色は" + glowcolor + "色です!!");
	            
	        }

	        if(data != undefined){
	            data.forEach((d)=>{
	                // console.log(d["created_at"]);
	                // console.log(d["type"]);
	            })
	        }
	    }
	    c.getevents().then(callback)
	}
	get_glow_color("shiv3",new Date())


/***/ },
/* 1 */
/***/ function(module, exports) {

	
	'use strict';

	const _require = (Browser_module,r_module) => {
	    return (typeof require === 'undefined') ? window[Browser_module] : require(r_module);
	}
	const _exports = (r_module) => {
	     (typeof module === 'undefined') ? window[r_module] = r_module : module.exports = r_module;
	}
	let XMLHttpRequest = _require("XMLHttpRequest","xhr2")

	class Crawler{
	    constructor(targetName) {
	        this.name = targetName;
	        this.url = "http://api.github.com/users/";
	    }
	    get(method = "following",url = this.url ,name = this.name){
	        let uri = url + name + "/" + method
	        return new Promise((resolve,reject)=>{
	            let xhr = new XMLHttpRequest;
	                xhr.open('GET', uri);
	                xhr.onload =  () =>  {
	                    if (xhr.status == 200) {
	                        resolve(xhr.response);
	                    } else {
	                        reject(new Error(xhr.statusText));
	                    } 
	                }
	                xhr.onerror = reject;
	                xhr.send();
	        })
	    }
	    getfollowing(){
	        return this.get().then((d)=>{return JSON.parse(d)});
	    }
	    getfollower(){
	        return this.get("followers").then((d)=>{return JSON.parse(d)});
	    }
	    getevents(){
	        return this.get("events").then((d)=>{return JSON.parse(d)});
	    }
	}
	_exports(Crawler);

/***/ }
/******/ ]);