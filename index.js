//import System.IO;
//import * as fs from 'fs';

'use strict';
//const fs = require('fs');
//var output = fs.readFileSync('someData.txt')
//var NAMES = fs.readFileSync("namelist.txt");
//var SYMBOL = fs.readFileSync("csv");
var csvString = d3.csv("companylist.csv").text().trim();
var csvArray = csvToArray(csvString);




const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))
// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
  res.send("stock-bot is now working.")
})


let bloomberg = "https://www.bloomberg.com/quote/";

// Facebook 
let token = "EAAFVjMKnArMBAEaTFASFCBm5EIveojRpYRmE3ozYJiVSiHBNbt6laylsp2c33CniQZBawfkjYfLkWMSBqd7F9lzelV741AYEirQK11hevSykFlgj5ApEh3nh8YoAzhjvi9ZCGzYI7lK9NFC6yKOF9WxCmsWqvvZBWJiQ58MowZDZD";

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === "KV029F7g3mn62qe3L3") {
    res.send(req.query['hub.challenge'])
  }
  res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i]
    let sender = event.sender.id

    if (event.message && event.message.text) {
      let text = event.message.text
      decideMessage(sender, text)
      // sendText(sender, "Text echo: " + text.substring(0, 100))
    }

    if(event.web_url){
      let text = JSON.stringify(event.web_url)
      decideMessage(sender, text)
      continue
         }
     if(event.postback){
      let text = JSON.stringify(event.web_url)
      decideMessage(sender, text)
      continue
      }

    }
  
  res.sendStatus(200)
})



function decideMessage(sender, text1){
  let text = text1.toLowerCase();
  for (var x = 0; i < csvArray.length; ++i) {
    if(text.includes(csvArray[x])){
        sendPrices(sender,csvArray[x])
     }
  }else if(text.includes("prices")){
  	sendGenericMessage2(sender)
  }else if (text.includes("news")){
    sendGenericMessage(sender)
  }else if (text.includes("help")){
      sendButtonMessage(sender)
  }else{
      sendTextMessage("Type help to get all options")
   }

}

function sendGenericMessage(sender){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Yahoo Finance",
            "image_url":"https://www.timothysykes.com/wp-content/uploads/2016/07/yf.jpg",
            "subtitle":"Check for daily stock news.",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://finance.yahoo.com/",
                "title":"View Yahoo Finance"
              
              }        
            ]      
          }
         ]
        }
      }
    }
      sendRequest(sender, messageData) 
  }

  function sendGenericMessage2(sender){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Yahoo Finance",
            "image_url":"https://www.timothysykes.com/wp-content/uploads/2016/07/yf.jpg",
            "subtitle":"Check for daily stock news.",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://finance.yahoo.com/most-active",
                "title":"Stock Prices"
              
              }              
            ]      
          }
         ]
        }
      }
    }
      sendRequest(sender, messageData)
      
  }


function sendButtonMessage(sender){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Yahoo Finances",
            "image_url":"https://www.timothysykes.com/wp-content/uploads/2016/07/yf.jpg",
            "subtitle":"Price or News?",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://finance.yahoo.com/most-active",
                "title":"Stock Prices"
              
              },
              {
               "type":"web_url",
               "url":"https://finance.yahoo.com/",
               "title":"News"  
               }            
            ]      
          }
         ]
        }
      }
    }
      sendRequest(sender, messageData)
      
  }  


function sendPrices(sender, companyname){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Stock Price",
            "image_url":"https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ivUxvlPidC3M/v0/-1x-1.jpg",
            "subtitle":"Check for daily stock news.",
            "buttons":[
              {
                "type":"web_url",
                "url": bloomberg + companyname + ":US"
                "title":"Company Price"
              
              }              
            ]      
          }
         ]
        }
      }
    }
      sendRequest(sender, messageData)
      
  }

function sendRequest(sender, messageData){
request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs : {access_token: token},
    method: "POST",
    json: {
      recipient: {id: sender},
      message : messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("sending error")
    } else if (response.body.error) {
      console.log("response body error")
    }
  })
}

function sendText(sender, text) {

  let messageData = {text: text}
  sendRequest(sender, messageData) 
  
}

app.listen(app.get('port'), function() {
  console.log("running: port")
})


//csv file to arrays
function csvToArray(csvString){
  // The array we're going to build
  var csvArray   = [];
  // Break it into rows to start
  var csvRows    = csvString.split(/\n/);
  // Take off the first line to get the headers, then split that into an array
  var csvHeaders = csvRows.shift().split(';');

  // Loop through remaining rows
  for(var rowIndex = 0; rowIndex < csvRows.length; ++rowIndex){
    var rowArray  = csvRows[rowIndex].split(';');

    // Create a new row object to store our data.
    var rowObject = csvArray[rowIndex] = {};
    
    // Then iterate through the remaining properties and use the headers as keys
    for(var propIndex = 0; propIndex < rowArray.length; ++propIndex){
      // Grab the value from the row array we're looping through...
      var propValue =   rowArray[propIndex].replace(/^"|"$/g,'');
      // ...also grab the relevant header (the RegExp in both of these removes quotes)
      var propLabel = csvHeaders[propIndex].replace(/^"|"$/g,'');;

      rowObject[propLabel] = propValue;
    }
  }

  return csvArray;
}

//dashbot



// var express = require('express');
// var https = require('https');
// var http = require('http');
// var bodyParser = require('body-parser');
// var request = require('request');
// var app = express();

// // The dashbot Bot Key you created above goes here:
// var dashbotKey = 'EygNprCRzCkSAAUb3pugnLQITW1WEIOOn7NS05bA'

// // Initialize dashbot.io
// var dashbot = require('dashbot')(dashbotKey).facebook;

// // Facebook Required Variables

// // The validation_token is a string you create.
// // You will enter this string on the Facebook bot setup page later.
// // It's used to validate your bot with Facebook.
// var validation_token = '375538026218163';

// // The page_token is from Facebook.
// // It's the token of your Facebook Page your bot is associated with.
// // If you don't already know it, leave it blank for now - you can find it when setting up on Facebook next.
// // Remember to put it in here after the Facebook setup
// var page_token = 'EAAFVjMKnArMBAEdNgdwdMZALM1mQcOCCcXjZBfLUAqI0Sg5ZCJHmZBlv4jZB2oMxe0cEbg8ECfRDGMT8mf0maBUZACqnfjSqt8adRX7cc9ZC3ZCtFatIZAOQ7gIWYUOjw3ZBakLMC0RGQXbF3aQOXFychsDtZCr9RZAtq4ztDZBBZC02c8bgZDZD';

// // The following are needed to enable parsing of the body sent to the webhook
// var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({extended:false})

// // A place holder for the root of your app
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// // Webhook handling

// // Handle the bot validation step from Facebook
// // FB will send the validation_token you created to validate the bot
// app.get('/webhook/', function (req, res) {
//   if (req.query['hub.verify_token'] === validation_token) {
//     res.send(req.query['hub.challenge']);
//   }
//   res.send('Error, wrong validation token');
// })

// // Handle messages posted to the bot
// app.post('/webhook/', jsonParser, function (req, res) {
//   if(req.body) {

//     // Log incoming message to dashbot.io
//     dashbot.logIncoming(req.body);

//     if(req.body.entry){
//       // loop through entries - a post can have multiple
//       req.body.entry.forEach(function(entry){

//       if(entry.messaging){
//         // loop through messages - an entry can have multiple
//         entry.messaging.forEach(function(event){
//           // Get sender id to be able to message back
//           let sender = event.sender.id;

//           // Handle messages

//           if(event.postback){
//             // Handle postback type messages
//             let text = JSON.stringify(event.postback);
//             sendTextMessage(sender, 'Postback received: ' + text.substring(0,200), page_token);
//           }
//           else if(event.message && event.message.text){
//             // Handle text messages sent in
//             let text = event.message.text;
//             if(text === 'Template'){
//               // Send a template response when user messages "Template"
//               sendTemplateMessage(sender);
//             }
//             else {
//               // Echo text message received back to the user
//               sendTextMessage(sender, 'Text received: ' + text.substring(0,200));
//             }
//           }
//         })
//       }
//       })
//     }
//   }
//   res.sendStatus(200);
// });


// // Method to send text messages to the user
// function sendTextMessage(sender, text) {

//   // The message to be sent
//   messageData = {
//     text:text
//   }

//   // Build the request object to send the message to the user
//   const requestData = {
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token:page_token},
//     method: 'POST',
//     json: {
//       recipient: {id:sender},
//       message: messageData,
//     }
//   }


//   // Send message
//   request(requestData, function(error, response, body) {

//     // Log outgoing message to dashbot.io
//     dashbot.logOutgoing(requestData, response.body);

//     // Handle error
//     if (error) {
//       console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//       console.log('Error: ', response.body.error);
//     }
//   });
// }

// // Method to send a sample template message
// function sendTemplateMessage(sender) {

//   // The message to be sent - see Facebook messegner API docs for template fields
//   messageData = {
//     'attachment': {
//       'type': 'template',
//       'payload': {
//         'template_type': 'generic',
//         'elements': [{
//           'title': 'First card',
//           'subtitle': 'Element #1 of an hscroll',
//           'image_url': 'http://messengerdemo.parseapp.com/img/rift.png',
//           'buttons': [{
//             'type': 'web_url',
//             'url': 'https://www.messenger.com/',
//             'title': 'Web url'
//           }, {
//             'type': 'postback',
//             'title': 'Postback',
//             'payload': 'Payload for first element in a generic bubble',
//           }],
//         },{
//           'title': 'Second card',
//           'subtitle': 'Element #2 of an hscroll',
//           'image_url': 'http://messengerdemo.parseapp.com/img/gearvr.png',
//           'buttons': [{
//             'type': 'postback',
//             'title': 'Postback',
//             'payload': 'Payload for second element in a generic bubble',
//           }],
//         }]
//       }
//     }
//   };

//   // Build the request object to send the template message to the user
//   const requestData = {
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token:page_token},
//     method: 'POST',
//     json: {
//       recipient: {id:sender},
//       message: messageData,
//     }
//   }


//   // Send message
//   request(requestData, function(error, response, body) {

//     // Log outgoing message to dashbot.io
//     dashbot.logOutgoing(requestData, response.body);

//     // Handle error
//     if (error) {
//       console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//       console.log('Error: ', response.body.error);
//     }
//   });
// }

// // Enable bot to listen on http and https
// http.createServer(app).listen(80);
// https.createServer(app).listen(443)
