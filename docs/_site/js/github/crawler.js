{
    'use strict';
    const _require = (Browser_module,r_module) => {
        return (typeof require === 'undefined') ? window[Browser_module] : require(r_module);
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
    }

    c = new Crawler("shiv3");

    const getFollow_Wers_name = () => [
        ()=>{
            return c.getfollowing().then((d)=>{return d.map((s)=>{return s.login})});
        },
        ()=>{
            return c.getfollower().then((d)=>{return d.map((s)=>{return s.login})});;
        }
    ]

    Promise.race(getFollow_Wers_name()).then(function (d) {
        console.log(d())
        // getFollow_Wers_name(d()).then(console.log)
    })

    // Promise.race(getFollow_Wers_name("shiv3")).then().then(function (d) {
    //     console.log(d())
    // })


    // let username = "shiv3";
    // let c = new Crawler(username);
    // c.getfollowing().then((d)=>{
    //     // console.log(d);
    //     d.forEach((q)=>{
    //         console.log(q.login);
    //     })
    // })
    

}