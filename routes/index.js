var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Twilio
var twilio = require('twilio');

// Geocoder - we may not need this, but it could be cool?
var geocoder = require('geocoder');

// Tracery
var tracery = require('tracery-grammar');

// NLP Compromise
var nlp = require('nlp_compromise')

// our db model
var Status = require("../models/status.js");


/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

    var jsonData = {
        'name': 'node-express-api-boilerplate',
        'api-status': 'OK',
        'instructions': "Send a text to (646) 762-0870",
        'format': 'I\'m your alternate, mirror self, that lives on the other side of the screen. Send me a text to say hello!'
    }

    // respond with json data
    res.render('index.html');
});

// simple route to show an HTML page
// router.get('/sample-page', function(req,res){
//   res.render('sample.html')
// })

// TAKING TRACERY SCRIPT TAG FROM BECCA'S CODE - LINE 67 of index.js
function parseResponse(resp) {
    var who = [];
    var what = [];
    var where = [];
    var when = [];
    var why = [];
    var how = [];
    var other = [];

    //the who is an array of names - add the nouns to a tracery grammar

    var whoSyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": tags
    };
    var whatSyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": tags
    };
    var whereSyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": tags
    };
    var whenSyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": tags
    };
    var whySyntax = {
        "sentence": ["It is a #noun#. I see a #noun#."],
        "noun": tags
    };

    var grammar = createGrammar(syntax);
    grammar.addModifiers(baseEngModifiers);
    var response = grammar.flatten('#sentence#')
    console.log(response)
    return response;
  }

router.post('/twilio-callback', function(req, res) {

    // there's lots contained in the body
    console.log(req.body);

    // the actual message is contained in req.body.Body
    var incomingMsg = req.body.Body;
    // use terminal command - heroku logs --tail
    // to view the full list of attributes available
    console.log(incomingMsg);
    var incomingNum = req.body.From;

    // now, let's save it to our Database
    // var msgToSave = {
    //     status: incomingMsg,
    //     from: incomingNum
    // }
    // var status = new Status(msgToSave)
    var twilioResp = new twilio.TwimlResponse();

    // Now let's craft our response!
    // var tokens = incomingMsg.split(/\W+/);
    var people = nlp.text(incomingMsg).people();
    console.log = people;

    var response = people;

    // for (var i = 0; i < tokens.length; i++) {
    //     var word = tokens[i];
    //     console.log(word);
    //     var response;
    //
    //     // COME BACK WITH NLP for sure
    //     // var sentence = nlp.sentence_type(twilioResp);
    //
    //     if (word === 'Hello') {
    //         response = "Hey! I'm your mirror self. You can ask me anything.";
    //     } else if (word === 'me') {
    //         response = "You really want to know?";
    //     } else if (word === 'I') {
    //         response = "I or we?";
    //     } else if (word === 'we') {
    //         response = "We love to talk.";
    //     } else {
    //         response = "Interesting... Tell me more.";
    //     }
    // }

    twilioResp.sms(response);
    res.send(twilioResp.toString());




    // status.save(function(err, data) {
    //     // set up the twilio response
    //     if (err) {
    //         // respond to user
    //         twilioResp.sms('Oops! We couldn\'t save status --> ' + incomingMsg);
    //         // respond to twilio
    //         res.set('Content-Type', 'text/xml');
    //         res.send(twilioResp.toString());
    //     } else {
    //         // respond to user
    //         twilioResp.sms(result);
    //         // respond to twilio
    //         res.set('Content-Type', 'text/xml');
    //         res.send(twilioResp.toString());
    //     }
    // })




})

router.get('/api/get', function(req, res) {

    Status.find(function(err, data) {
        if (err) {
            var error = {
                status: "ERROR",
                message: err
            }
            res.json(error);
        } else {
            var jsonData = {
                status: "OK",
                statuses: data
            }
            res.json(jsonData);
        }
    })

})

router.get('/api/get/latest', function(req, res) {

    Status.find().sort('-dateAdded').exec(function(err, data) {
        if (err) {
            var error = {
                status: "ERROR",
                message: err
            }
            res.json(error);
        } else {
            var jsonData = {
                status: "OK",
                status: data[0]
            }
            res.send(data[0].status);
        }
    })

})

//
// router.get('/api/get/meals', function(req, res) {
//
//     Meal.find(function(err, data) {
//         if (err) {
//             var error = {
//                 status: "ERROR",
//                 message: err
//             }
//             res.json(error);
//         } else {
//             var jsonData = {
//                 status: "OK",
//                 meals: data
//             }
//             res.json(jsonData);
//         }
//     })
//
// })



module.exports = router;
