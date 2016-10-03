{
    'use strict';
    const _require = (Browser_module,r_module) => {
        return (typeof require === 'undefined') ? window[Browser_module] : require(r_module);
    }
    let XMLHttpRequest = _require("","./crawler.js")

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