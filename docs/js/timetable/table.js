const $ = require("jquery");
jQuery = $;
const JapaneseHolidays = require('japanese-holidays');
const DateWithOffset = require("date-with-offset");
// let timetable = require("./timetable.json");
let timetable =  require("json!./timetable.json");


const defaultTimezoneOffset = new Date().getTimezoneOffset()*-1; // => 540(tokyo)
new DateWithOffset(new Date(),defaultTimezoneOffset);

const dayparse = (days) =>{
    let today = new Date();
    return days.map((d)=>{
        let hours = d.split(":")
        return today.setHours(hours[0],hours[1],"00","00");
    })
}

const nextTime = (time) =>{
    let timetables;
    if(JapaneseHolidays.isHoliday(time)){
        timetables = dayparse (timetable.holiday);
    }else{
        timetables = dayparse (timetable.weekday);
    }

    let recenttime = timetables.filter((d)=>{ return time < d   });
    return recenttime;
}



window.onload = () =>{
    const display = (d,dbg) => {
        document.body.innerHTML += "<p>" + d + "</p>";
        if(dbg){
            console.log(d);
        }
    }
    let vehicle = "バス"; //電車
    const elapsed = (dbg=false) =>{
        document.body.innerHTML = "";
        now = new Date();
        nexts = nextTime(now);
        display("現在時刻:" + now);
        display("次の" + vehicle + "は" + new Date(nexts[0]));

        let next = nexts[0];
        if(next){
            display("次の" + vehicle + "まであと " + new Date( nexts[0] - now).getMinutes() + " 分です");
        
            if(nexts[1]){
                display("その次の" + vehicle + "まであと " + new Date( nexts[1] - now ).getMinutes() + " 分です");
            }else{
                display("その次の" + vehicle + "はもうありません");
            }
        }else{
            display("次の" + vehicle + "はもうありません");
        }   
    }
    Promise.resolve(0).then(function loop(i) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                elapsed();
                resolve(i+1);
            }, 100);
        })
        .then(loop);
    });

}

