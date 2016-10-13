const $ = require("jquery");
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

let now = new Date();
let timetables;
if(JapaneseHolidays.isHoliday(now)){
    timetables = dayparse (timetable.holiday);
}else{
    timetables = dayparse (timetable.weekday);
}

let vehicle = "バス"; //電車


let recenttime = timetables.filter((d)=>{ return now < d   });
console.log("現在時刻:" + now);
console.log("次の" + vehicle + "は" + new Date(recenttime[0]));
let next = recenttime[0];
if(next){
    console.log("次の" + vehicle + "まであと " + new Date( recenttime[0] - now ).getMinutes() + " 分です");
    document.write("次の" + vehicle + "まであと " + new Date( recenttime[0] - now ).getMinutes() + " 分です");
    if(recenttime[1]){
        console.log("その次の" + vehicle + "まであと " + new Date( recenttime[1] - now ).getMinutes() + " 分です");
    }else{
        console.log("その次の" + vehicle + "はもうありません");
    }
}else{
    console.log("次の" + vehicle + "はもうありません");
}

