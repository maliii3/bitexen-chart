console.log('Server is starting...');

var getJSON = require('get-json');

var express = require('express');

var fs = require('fs');

var schedule = require('node-schedule');

var apiURL = 'https://www.bitexen.com/api/v1/ticker/EXENTRY/';

//This holds the data for the BITEXEN/TRY value
var bitData;

var daily;

var realValues;

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

    now.setHours(now.getHours()+3); //Server is in Europe, need to add 3 hours to fix the Timezone difference.

    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    var realHour,realMinute;

    if (hour<10){ //getHours() and getMinutes() functions return 1 digit char if it is less than 10. Example: If current time is 01:09  getHours() => 1 , getMinutes() => 9
        realHour = "0" + hour; //So I label it as 2 digits.
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

    return  realHour + ":" + realMinute + "." + second; //Create a String formatted as HH:mm.ss
}
//Connect to the BITEXEN API immediately
if(!isAPIconnected){
    getJSON(apiURL,parseJSONFromAPI);
}

//If the daily file is not defined yet create a file with the today's name.
if(!fs.existsSync('data/' +getDateStamp()+ '.json')){
    createNew();
}

schedule.scheduleJob('1 0 22 * * *', createNew);//Every 21:00.01 time during the day create a new JSON file. 21:00.01 because server is 3 hour early than Turkey.

function createNew(){

    //Creates an empty JSON file named "DD.MM.YYYY" in the data directory in the server. 

    //This part might be the worst piece of code you'll ever see.
    fs.writeFileSync('data/' + getDateStamp() + '.json',JSON.stringify({

        "data":[
        ]
    
    }, null, 2));
    console.log('Created a new file as: ' + getDateStamp());

    daily = fs.readFileSync('data/' + getDateStamp() + '.json');// Reading the today's file 
    realValues = JSON.parse(daily);// Parsing today's file as a JSON.
}

app.use(express.static('website'));

//Connecting to the BITEXEN API. Fetch the current value of the BITEXEN/TRY.
function parseJSONFromAPI(err,response){

    if(err){//If some error happens
        
        console.log('Something happened!: ' + err);
        return;
    }

    if(response.status=="success"){//If API is connected

        if(!isAPIconnected){
        console.log('BITEXEN API connected!');
        isAPIconnected=true;
        }

        bitData = response.data.ticker.last_price; //Initialize bitData and update it.

    } else {
        console.log('Could not connect BITEXEN API!');
    }

}

schedule.scheduleJob('30 * * * * *', addValueWithTimeStamp);// Scheduling addValueWithTimeStamp for every 30 seconds.

app.get('/api/:time_interval',sendValues);// Get request for time intervals.

app.get('/api/:day/:month/:year',sendSpecificDateData);// Get request for specific date.


// This function parses the specified date through parameters of the request and sends user a JSON.
function sendSpecificDateData(request,response){

    var link = request.params;

    var willControlledDate = new Date(link.year,link.month,link.day);//Create a new Date with a parameters.

    if(willControlledDate.isValid()){// If the date is valid...

        var fileDay = willControlledDate.getDate();
        var fileMonth = willControlledDate.getMonth();
        var fileYear = willControlledDate.getFullYear();


        if(fs.existsSync('data/' + fileDay + '.' + fileMonth + '.' + fileYear + '.json')){// Find the expected file.

            var dailyJSON = fs.readFileSync('data/' + fileDay + '.' + fileMonth + '.' + fileYear + '.json');// Read it.
            var dailyArray = JSON.parse(dailyJSON);// Parse it a JSON.
            response.send(dailyArray);// Send it to the user.
        
        } else {// If file does not exist...

            response.send("Sorry... We don't have that file :(");// Give feedback to the user.
        }

    } else {// If the given date is invalid...

        response.send('Sorry... Your requested '+link.day+'/'+link.month+'/'+link.year+' day is not valid!');// Give proper massage to the user.
    }
}


function sendValues(request, response){

    var data = request.params;

    if (data.time_interval==='Weekly' || data.time_interval==='weekly'){// If wanted data is "Weekly".

        response.send("Trying to implement this but I suck at node and js :("); // Working on...
    }
    else if (data.time_interval==='Daily' || data.time_interval==='daily'){// If wanted data is "Daily".

        response.send(dailyData());// Send daily data to user.
    }
    else if (data.time_interval==='seconds'){// If wanted data is for now.

        response.send(currentData());// Send current data to user.

    }
    else{
        response.send('Could not find the '+ data.time_interval +' data');
        return;
    }
}

function currentData(){// Sends current data to the user.

    var timeStamp = getTimeStamp();// Today's file name.

    getJSON(apiURL,parseJSONFromAPI);// Connect to the api and fetch the current value for BITEXEN.

    if ( timeStamp!=undefined && bitData !=undefined){//If bitData (BITEXEN value) or timeStamp is defined...
    realCurrentJSON["data"].x = timeStamp; // ...assign these values to JSON file.
    realCurrentJSON["data"].y = bitData;
    }
    var currentData = JSON.stringify(realCurrentJSON, null, 2);// Stringfy the JSON file structured like JSON (looks like JSON but it is string)
    
    fs.writeFile('data/current.json', currentData,finished);// Write the stringfied JSON into "current.json" file for consistency.

    var realJ = JSON.parse(currentData);// Parse it as Json.
    
    function finished(err){

        if(err){
            console.log("Something went wrong: " + err);
            return;
        }

        console.log("Added Current Data!");
    }

    return realJ["data"];// Send it to the user.
}

// This function pushes data to the current day's JSON file.
// Graph's data points need 2 parameters to initialize.
// Pushed data type:
// One of them is "x" => timeStamp (as HH:mm.ss).
// One of them is "y" => price of the BITEXEN.

function addValueWithTimeStamp() {

    var timeStamp = getTimeStamp();// Creates a String as current time HH:mm.ss .

    getJSON(apiURL, parseJSONFromAPI);// Connect to the BITEXEN API

    if ( timeStamp!=undefined && bitData !=undefined){// If bitData fetched from API

        realValues["data"].push({"x":timeStamp,"y":bitData});// Push it with the timeStamp.
    }
    var currentData = JSON.stringify(realValues, null, 2); // Stringfy the JSON file structured like JSON (looks like JSON but it is string).

    fs.writeFile('data/'+ getDateStamp() +'.json', currentData, finished);// Write it to current day's file in order to save the data (Consistency?).

    function finished(err){
        if(err){
            console.log('Something is not good :' + err);
            return;
        }
        console.log('Data is set!');
    }
}

function dailyData(){ // Returns the data of today as JSON.

    var dailyJSON = fs.readFileSync('data/' + getDateStamp() + '.json'); // Reads todays file.

    var dailyArray = JSON.parse(dailyJSON); // Parses it as JSON.

    return dailyArray;
}

function weeklyData(){ // Still working on this one I can't even understand my code.

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
