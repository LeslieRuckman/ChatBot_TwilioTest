var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Twilio
var twilio = require('twilio');

// Geocoder - we may not need this, but it could be cool?
var geocoder = require('geocoder');

// Tracery
var tracery = require('tracery-grammar');

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
    res.json(jsonData)
});

// simple route to show an HTML page
// router.get('/sample-page', function(req,res){
//   res.render('sample.html')
// })

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
    var tokens = incomingMsg.split(/\W+/);

    for (var i = 0; i < tokens.length; i++) {
        var word = tokens[i];
        console.log(word);
        var response;

        if (word === 'hello'||'Hello') {
            response = "Hey! I'm your virtual internet self. You can ask me anything.";
            twilioResp.sms(response);
            res.send(twilioResp.toString());
        } else if (word === 'me'||'I') {
            response = "You really want to know?";
            twilioResp.sms(response);
            res.send(twilioResp.toString());
        } else {
            response = "Interesting... Tell me more.";
            twilioResp.sms(response);
            res.send(twilioResp.toString());
        }
    }




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
