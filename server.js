console.log('Server is starting...');

var getJSON = require('get-json');

var express = require('express');

var fs = require('fs');

var schedule = require('node-schedule');

var apiURL = 'https://www.bitexen.com/api/v1/ticker/EXENTRY/';

//This holds the data for the BITEXEN/TRY value
var bitData;

var isAPIconnected = false;

var app = express();

app.listen(process.env.PORT, listening);

function listening () {
    console.log('listening.');
}


// DATE EXTENSION

Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};  


//Holds the Current Value of the stock as a json I dont think this is a great way but...
var currentSec = fs.readFileSync('data/current.json');
var realCurrentJSON = JSON.parse(currentSec);

//Creates a string as today's DD.MM.YYYY
function getDateStamp(){

    var today = new Date();

    today.setHours(today.getHours()+3);

    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();

    delete today;

    return day + "." + month + "." +year;
}

//creates a string this time as HH.mm.ss
function getTimeStamp(){

    var now = new Date();

    now.setHours(now.getHours()+3);

    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    var realHour,realMinute;

    if (hour<10){
        realHour = "0" + hour;
    }
    else {
        realHour = hour;
    }

    if (minute<10){
        realMinute = "0" + minute;
    }
    else{
        realMinute = minute;
    }

    return  realHour + ":" + realMinute + "." + second;
}
//Connect to the BITEXEN API immediately
if(!isAPIconnected){
    getJSON(apiURL,parseJSONFromAPI);
}

createNew();
//If the daily file is not defined yet create a file with the today's name.
schedule.scheduleJob('5 0 21 * * *',createNew);

function createNew(){
    fs.writeFileSync('data/' + getDateStamp() + '.json',JSON.stringify({

        "data":[
        ]
    
    }, null, 2))
}

var daily = fs.readFileSync('data/' + getDateStamp() + '.json');

var realValues = JSON.parse(daily);

app.use(express.static('website'));

var daily;

function parseJSONFromAPI(err,response){

    if(err){
        console.log('Someshit happened!');
        return;
    }

    if(response.status=="success"){
        if(!isAPIconnected){
        console.log('BITEXEN API connected!');
        isAPIconnected=true;
        }

        bitData = response.data.ticker.last_price;
    } else {
        console.log('Could not connect BITEXEN API!');
    }

}

schedule.scheduleJob('30 * * * * *', addValueWithTimeStamp);

app.get('/api/:time_interval',sendValues);

app.get('/api/:day/:month/:year',sendSpecificDateData);


function sendSpecificDateData(request,response){

    var link = request.params;

    var willControlledDate = new Date(link.year,link.month,link.day);

    if(willControlledDate.isValid()){

        var fileDay = willControlledDate.getDate();
        var fileMonth = willControlledDate.getMonth();
        var fileYear = willControlledDate.getFullYear();

        
        if(fs.existsSync('data/' + fileDay + '.' + fileMonth + '.' + fileYear + '.json')){

            var dailyJSON = fs.readFileSync('data/' + fileDay + '.' + fileMonth + '.' + fileYear + '.json');
            var dailyArray = JSON.parse(dailyJSON);
            response.send(dailyArray);
        
        } else {

            response.send("Sorry... We don't have that file :(");
        }

    } else {

        response.send('Sorry... Your requested '+link.day+'/'+link.month+'/'+link.year+' day is not valid!');
    }
}
1
function sendValues(request, response){

    var data = request.params;

    if (data.time_interval==='Weekly' || data.time_interval==='weekly'){

        response.send("Trying to implement this but I suck at node and js :(");
    }
    else if (data.time_interval==='Daily' || data.time_interval==='daily'){
        response.send(dailyData());
    }
    else if (data.time_interval==='seconds'){

        response.send(get15SecData());

    }
    else{
        response.send('Could not find the '+ data.time_interval +' data');
        return;
    }
}

function get15SecData(){

    var timeStamp = getTimeStamp();

    getJSON(apiURL,parseJSONFromAPI);

    if ( timeStamp!=undefined && bitData !=undefined){
    realCurrentJSON["data"].x = timeStamp;
    realCurrentJSON["data"].y = bitData;
    }
    var currentData = JSON.stringify(realCurrentJSON, null, 2);
    fs.writeFile('data/current.json', currentData,finished);

    var realJ = JSON.parse(currentData);
    
    function finished(err){
        console.log("finally");
    }

    return realJ["data"];
}

function addValueWithTimeStamp() {

    var timeStamp = getTimeStamp(); 

    getJSON(apiURL, parseJSONFromAPI);

    if ( timeStamp!=undefined && bitData !=undefined){

        realValues["data"].push({"x":timeStamp,"y":bitData});
    }
    var currentData = JSON.stringify(realValues, null, 2);
    fs.writeFile('data/'+ getDateStamp() +'.json', currentData, finished);

    function finished(err){
        if(err){
            console.log(err);
            return;
        }
        console.log('Data is set!');
    }
}

function dailyData(){

    var dailyJSON = fs.readFileSync('data/' + getDateStamp() + '.json');

    var dailyArray = JSON.parse(dailyJSON);

    // console.log(dailyArray.data.length);

    return dailyArray;
}

function weeklyData(){

    var lastWeek = new Date();

    var weeklyJson = new JSON();

    lastWeek.setDate(lastWeek.getDate()-7);

    var weekDate = lastWeek.getDate();
    var weekMonth = lastWeek.getMonth();
    var weekYear = lastWeek.getFullYear();

    if(fs.existsSync('data/' + weekDate + '.' + weekMonth + '.' + weekYear + '.json')){

        for(var day = 0; day<6; day++ ){

            lastWeek.setDate(lastWeek.getDate() + day);

            weekDate = lastWeek.getDate();
            weekMonth = lastWeek.getMonth();
            weekYear = lastWeek.getFullYear();

            var dailyJSON = fs.readFileSync('data/' + weekDate + '.' + weekMonth + '.' + weekYear + '.json');

            var dailyArray = JSON.parse(dailyJSON);

            for (var j = 0 ; j<dailyArray.data.length; j+=30){

                



            }
    

        }
        
    } else {

        response.send("Sorry... We can't access weekly data :'( ");
    }




}
