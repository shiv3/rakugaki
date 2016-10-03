
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