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

app.listen(config.port, listening);

function listening () {
    console.log('listening...');
}

//Holds the Current Value of the stock as a json I dont think this is a great way but...
var currentSec = fs.readFileSync('.data/current.json');
var realCurrentJSON = JSON.parse(currentSec);

//Creates a string as today's DD.MM.YYYY
function getDateStamp(){

    var today = new Date() ;

    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();

    delete today;

    return day + "." + month + "." +year;
}

//creates a string this time as HH.mm.ss
function getTimeStamp(){
    var now = new Date();

    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    if (hour<10 && minute<10)
        var timeStamp = "0"+ hour + ":0" + minute + "." + second;
    else if (hour<10 && minute>10)
        var timeStamp = "0"+ hour + ":" + minute + "." + second;
    else if (hour>10 && minute<10)
        var timeStamp = hour + ":0" + minute + "." + second;
    else
        var timeStamp = hour + ":" + minute + "." + second;

    return timeStamp;
}
//Connect to the BITEXEN API immediately
if(!isAPIconnected){
    getJSON(apiURL,parseJSONFromAPI);
}

createNew();
//If the daily file is not defined yet create a file with the today's name.
schedule.scheduleJob('1 0 0 * * *',createNew);

function createNew(){
    fs.writeFileSync('.data/' + getDateStamp() + '.json',JSON.stringify({

        "data":[
        ]
    
    }, null, 2))
}

var daily = fs.readFileSync('.data/' + getDateStamp() + '.json');

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

schedule.scheduleJob('*/5 * * * * *', addValueWithTimeStamp);

app.get('/api/:time_interval',sendValues);

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
    fs.writeFile('.data/current.json', currentData,finished);

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
    fs.writeFile('.data/'+ getDateStamp() +'.json', currentData, finished);

    function finished(err){
        if(err){
            console.log(err);
            return;
        }
        console.log('Data is set!');
    }
}

function dailyData(){

    var dailyJSON = fs.readFileSync('.data/' + getDateStamp() + '.json');

    var dailyArray = JSON.parse(dailyJSON);

    return dailyArray;
}

