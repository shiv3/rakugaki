{
    'use strict';

    const _require = (Browser_module,r_module) => {
        return (typeof require === 'undefined') ? window[Browser_module] : require(r_module);
    }
    let Crawler = _require("","./crawler.js")

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
                console.log(date.toLocaleString() + "の芝の色は" + glowcolor + "色です!!");
                
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
    get_glow_color("shiv3")     
}