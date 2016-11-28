var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var twilio = require('twilio');
var geocoder = require('geocoder');
var tracery = require('tracery-grammar');

// our db model
var Status = require("../models/status.js");
var Meal = require("../models/meal.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
 router.get('/', function(req, res) {

   var jsonData = {
   	'name': 'node-express-api-boilerplate',
   	'api-status':'OK',
     'instructions': "Text (646) 762-0870",
     'format': 'Tell me what\'s on your mind'
   }

// respond with json data
   res.json(jsonData)
 });

// simple route to show an HTML page
router.get('/sample-page', function(req,res){
  res.render('sample.html')
})

// Let's create a some interactions using the node tracery grammar module.
var grammar = tracery.createGrammar({
  'animal': ['panda','fox','capybara','iguana'],
  'emotion': ['sad','happy','angry','jealous'],
  'origin':['I am #emotion.a# #animal#.'],
});

var example = grammar.addModifiers(tracery.baseEngModifiers);

// /**
//  * POST '/api/create'
//  * Receives a POST request of the new animal, saves to db, responds back
//  * @param  {Object} req. An object containing the different attributes of the Animal
//  * @return {Object} JSON
//  */
router.post('/twilio-callback', function(req,res){

  // there's lots contained in the body
  console.log(req.body);

  // the actual message is contained in req.body.Body
  var incomingMsg = req.body.Body;
  // full fields available in the req.body:
// { ToCountry: 'US',
// ToState: 'NY',
// SmsMessageSid: 'SM9115146d8b3d53529e6b83a79448a6a9',
// NumMedia: '0',
// ToCity: '',
// SmsSid: 'SM9115146d8b3d53529e6b83a79448a6a9',
// FromState: 'GA',
// FromZip: '30294',
// SmsStatus: 'received',
// To: '+16468468769',
// FromCity: 'ATLANTA',
// ApiVersion: '2010-04-01'
// NumSegments: '1',
// MessageSid: 'SM9115146d8b3d53529e6b83a79448a6a9',
// From: '+14043230470',
// AccountSid: 'AC7cc044438cf51cbf44b75a095b40bf05',
// ToZip: '',
// Body: 'Just testing this demo!',
// FromCountry: 'US'}

  console.log(incomingMsg);

  var incomingNum = req.body.From;

  // now, let's save it to our Database
  var msgToSave = {
    status: incomingMsg,
    from: incomingNum
  }

  var tokens = incomingMsg.split(/\W+/);

  for (var i = 0; i < tokens.length; i++) {
    var word = tokens[i];
    if(word == 'hello'||'Hello'||'Hi'||'hi'||'hey'||'Hey'){
      var response = "Hi there! This is yourself from the otherside of your black mirror ;). Ask me anything!";
    } else if(word == 'my'||'My'||'me'||'Me'||'I'||'am'){
      var response = example;
    }else{
      var response = "Interesting... Tell me more."
    }
    var result = response;
  }

  var status = new Status(msgToSave)

  status.save(function(err,data){
    // set up the twilio response
    var twilioResp = new twilio.TwimlResponse();
    if(err){
      // respond to user
      twilioResp.sms('Oops! We couldn\'t save status --> ' + incomingMsg);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());
    }
    else {
      // respond to user
      twilioResp.sms(result);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());
    }
  })




})

router.get('/api/get',function(req,res){

  Status.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        statuses: data
      }
      res.json(jsonData);
    }
  })

})

router.get('/api/get/latest',function(req,res){

  Status.find().sort('-dateAdded').exec(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        status: data[0]
      }
      res.send(data[0].status);
    }
  })

})


router.get('/api/get/meals',function(req,res){

  Meal.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        meals: data
      }
      res.json(jsonData);
    }
  })

})



module.exports = router;
