const express = require('express');
const router = express.Router();
const config = require('../../config/config');
const db = require('../models');
const fb = require('../helpers/facebookGraphAPI');
const bodyParser = require('body-parser');
const request = require('request');

const mongoose = require('mongoose');

// import mongoose models
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Image = require('../models/image');

module.exports = function (app) {
  app.use('/', router);
};

const stateMap = {
  'greeting': {
    'yes': 'liabilityFormRequest',
  },
  'liabilityFormRequest': {
    'yes': 'liabilityForm',
    'no': 'liabilityFormRerequest',
  },
  'liabilityFormRerequest': {
    'yes': 'liabilityForm',
    'no': 'liabilityFormRerequest',
  },
  'liabilityForm': {
    'ok': 'processingForm',
    'completed': 'processingForm',
    'i have signed the form': 'processingForm',
  },

  // need to work out the kinks of the async logic here - we send our own static message to update the state
  'requestImage': {
    'image': 'diagnosing', // not a user message - image to our own message
    'no': 'imageRequestRefusal',
  },
  'imageRequestRefusal': {
    'image': 'diagnosing',
    'no': 'imageRequestRefusal',
  },
  'diagnosing': {
    'negative': 'negativeDiagnosticResults',// not a user message
    'inconclusive': 'inconclusiveDiagnosticResults',// not a user message
    'positive': 'positiveDiagnosticResults',// not a user message
  },

  'contactDoctor': {
    'yes': 'requestOrGetCurrentLocation',
    'no': 'refuseContactDoctor',
  },
  'refuseContactDoctor': {
    'yes': 'finalRequest',
    'no': 'contactDoctor',
  },
  
  'requestOrGetCurrentLocation': {
    '*': 'queryDoctors',
  },
  // 'getCurrentLocation': {
  //   'yes': 'queryDoctors',
  //   'no': 'requestLocation',
  // },
  // 'requestLocation': {
  //   'address': '',
  // },
  'queryDoctors': {
    'done': 'finalRequest',
  },
  
  // TODO: clean up this logic
  // 'findNearbyDoctors': {
  //   'address': 'requestCurrentLocation',
  //   'no address': 'requestAnotherAddress'
  // },
  // 'requestCurrentLocation': 'requestUseOfAddress',
  // 'requestAnotherAddress': '',

  // contact people


  'finalRequest': {
    'yes': '', // TODO: fill out branch logic here
    'no': 'goodbye',
  },
};

const stateToMethodCallMap = {
  'liabilityFormRequest': fb.sendLiabilityFormRequest,
  'liabilityFormRerequest': fb.sendLiabilityFormRequestRefusal,
  'liabilityForm': fb.sendLiabilityForm,
  'processingForm': fb.sendProcessingForm,
  'requestImage': fb.sendRequestImage,
  'imageRequestRefusal': fb.sendImageRerequest,
  'diagnosing': fb.sendDiagnosing,
  'contactDoctor': fb.sendContactDoctor,
  'refuseContactDoctor': fb.sendRefuseContactDoctor,
  'requestOrGetCurrentLocation': fb.sendRequestOrGetCurrentLocation,
  'queryDoctors': fb.sendQueryDoctors,
  'finalRequest': fb.sendFinalRequest,
  'goodbye': fb.sendGoodbye,
  'restart': fb.sendRestart,
};

// Facebook verification
router.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === config.verify_token) {
    return res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

router.post('/webhook/', function (req, res) {
  const messaging_events = req.body.entry[0].messaging;
  console.log('messaging events', messaging_events);

  for (i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;

    // Handle opt-in via the Send-to-Messenger Plugin, store user data and greet the user by name
    if (event.optin) {
      const userNamePromise = fb.getUserName(sender);

      userNamePromise.then(function(userName) {
        fb.sendGreeting(sender, userName.first_name);
      });
    }

    // this is to handle the location
    if (event.message && event.message.attachments) {
      console.log('inside attachments');
      const userNamePromise = fb.getUserName(sender);
      userNamePromise.then(function(userName) {
        Patient.findOne({
          firstName: userName.first_name,
          lastName: userName.last_name,
          fbId: userName.id
        }).then(patient => {
          if (patient == null) {
            const newPatient = new Patient({
              firstName: userName.first_name,
              lastName: userName.last_name,
              fbId: userName.id,
              conversationState: 'greeting',
            });
            newPatient.save();
          } else {
            const attachment = event.message.attachments[0];
            const coordinates = attachment.payload.coordinates;
            if (coordinates) {
              const newConversationState = stateMap[patient.conversationState]['*'];
              const returnedState = stateToMethodCallMap[newConversationState](sender, patient, coordinates);
              patient.conversationState = returnedState || newConversationState;
              patient.latitude = coordinates.lat;
              patient.longitude = coordinates.long;
              patient.save();  
              return;
            } else if (attachment.type === 'image' && 
                (['requestImage', 'imageRequestRefusal'].indexOf(patient.conversationState) > -1)) {
              const image = attachment.payload.url;
              stateToMethodCallMap['diagnosing'](sender, patient, image);
              patient.conversationState = 'diagnosing';
              patient.save();
              return;
            }
          }
        }).catch(err => {
          console.error("Error geting patient, err", err);
        });
      });
    }

    // Handle receipt of a message
    if (event.message && event.message.text) {
      const userNamePromise = fb.getUserName(sender);

      // creates patient if does not exist
      // otherwise does nothing
      userNamePromise.then(function(userName) {
        // check if new user
        Patient.findOne({
          firstName: userName.first_name,
          lastName: userName.last_name,
          fbId: userName.id
        }).then(patient => {
          if (patient == null) {
            const newPatient = new Patient({
              firstName: userName.first_name,
              lastName: userName.last_name,
              fbId: userName.id,
              conversationState: 'greeting',
            });
            newPatient.save();
          } else {
            // continue rest of logic here
            const rawText = event.message.text;
            const text = rawText.toLowerCase();
            console.log('coordinates', event.message.attachments);

            // Handle special keyword 'Generic'
            if (text === 'generic') {
              return fb.sendGenericMessage(sender);
            } else if (text === 'restart') {
              return fb.sendRestart(sender, patient);
            }

            // TODO: validate the patient conversation state exists in the map
            const newConversationState = stateMap[patient.conversationState][text];
            console.log('new conversation state', newConversationState);
            if (newConversationState === undefined) {
              return fb.sendLackComprehension(sender);
            }

            // save new conversation state
            console.log('state method to call', stateToMethodCallMap[newConversationState]);
            console.log('attachments', event.message.attachments);
            // const coordinates = event.message.attachments[0].payload.coordinates;
            const returnedState = stateToMethodCallMap[newConversationState](sender, patient);
            patient.conversationState = returnedState || newConversationState;
            patient.save();
            return;  // send out the fb message

            // Catch all for unrecognizable state and message
            return fb.sendLackComprehension(sender);
          }
        })
        .catch(err => {
          console.error("Error fetching single patient", err);
        });
      });
    }

    // Handle receipt of a postback
    if (event.postback) {
      console.log(event.postback, 'event postback');
      text = JSON.stringify(event.postback);
      fb.sendTextMessage(sender, "Postback received: "+ rawText.substring(0, 200));
      continue;
    }

  }
  res.sendStatus(200);

});
