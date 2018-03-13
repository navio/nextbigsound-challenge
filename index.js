const express = require('express')
const app = express();

const fetch = require("node-fetch");
const weekdata = require("weeknumber");
const initialDate = new Date('1970-01-01');

const nDays = (theNewDate) => { let tnd = new Date(theNewDate); 
return ( Date.UTC(tnd.getFullYear(), tnd.getMonth(), tnd.getDate()) - Date.UTC(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate())) / 86400000; 
};

const eventsCount = (new_events,found_events) => {
    Object.keys(new_events).forEach(currentType => {
        if(found_events[currentType]){
            found_events[currentType]++;
        }else{
            found_events[currentType] = 1;
        }
    });
    return found_events;
}

const daysToWeeks = (data) => {
    let fin = {};
    Object.keys(data).forEach((el)=>{
                let evdate = new Date(data[el].date_short);
                let week = weekdata.weekNumber(evdate);
                week = week < 10 ? '0'+week : ''+week;
                week = evdate.getFullYear()+'-W'+ week;
                if(fin[week]){
                    fin[week] = eventsCount(data[el].event_types,fin[week]);
                }else{
                    fin[week] = eventsCount(data[el].event_types,{});
                }
    });
    return fin;
}

const eventsInWeeks = function(artistID,startdate,enddate){
      let nextURL = `https://api.nextbigsound.com/events/v1/entity/${artistID}?start=${nDays(startdate)}&end=${nDays(enddate)}&access_token=8c089170d31ea3b11f1ea65dbfc8ea46`;
       
       return fetch(nextURL)
      .then(raw=>raw.json())
      .then(data=>Promise.resolve({"counts":daysToWeeks(data)}))
      .catch(x=>console.log(x))
}

// CORS Configuration.
app.use(function(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Expose-Headers", "runkit-rate-limit-remaining");
        res.header("Access-Control-Expose-Headers", "tonic-rate-limit-remaining");
        
        var reqHeaders = req.get("Access-Control-Request-Headers")
        if (reqHeaders) res.header("Access-Control-Allow-Headers", reqHeaders);
        
        var reqMethods = req.get("Access-Control-Request-Methods")
        if (reqMethods) res.header("Access-Control-Allow-Methods", reqMethods);

        next()
    });
    
app.get("/events/:ARTISTID/stats", async (req, res) => { 
            let artist = req.params.name || 365;
            let startd = req.query.startDate || "2017-01-01";
            let starte = req.query.endDate || "2017-03-19";
            
            let djson = await eventsInWeeks(artist,startd,starte); 
            res.send(djson);
    });
app.get("*",(req,res)=>res.send("try: /events/ARTIST_ID/stats?startDate=START_DATE&endDate=END_DATE"));
app.listen(3000, () => console.log('Example app listening on port 3000!'))
