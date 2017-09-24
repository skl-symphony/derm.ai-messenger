const request = require('request');
const rp = require('request-promise');
const base64Img = require('base64-img');

const config = require('../../config/config');
// Models
const Image = require('../models/image');
const Doctor = require('../models/doctor');

const fbFactory = {

  getUserName: function (sender) {
    return rp({
      url: 'https://graph.facebook.com/v2.6/' + sender,
      qs: {
        access_token: config.page_access_token,
        fields: "first_name,last_name"
      },
      method: 'GET'
    })
    .then (function(data) {
      return JSON.parse(data);
    });
  },

  sendGreeting: function (sender, firstName) {
    const GREETING = `Hi ${firstName}. My name is Demi!  May I assist you with diagnosing a skin issue you may have concerns about?`;
    fbFactory.sendTextMessage(sender, GREETING);
  },

  sendLiabilityFormRequest: function (sender) {
    const LIABILITY_FORM = "Awesome! Before we start, are you willing to electronically sign this liability form?";
    // TODO: create card with link to Docusign API
    fbFactory.sendTextMessage(sender, LIABILITY_FORM);
  },

  sendLiabilityFormRequestRefusal: function (sender) {
    const LIABILITY_FORM_REREQUEST = "You will need to sign this liability form before we proceed. Are you willing to electronically sign this liability form?";
    fbFactory.sendTextMessage(sender, LIABILITY_FORM_REREQUEST);
  },

  sendLiabilityForm: function (sender) {
    const FORM_INSTRUCTIONS = "Please follow the link to sign the form and text OK, when you are completed.";
    const payload = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Docusign",
            "subtitle": "Docusign liability waiver",
            "image_url": "http://kokuanetwork.com/wp-content/uploads/2015/06/approval-clipart-1195423550187356949molumen_red_approved_stamp.svg_.med_.png",
            "buttons": [{
              "type": "web_url",
              "url": "https://demo.docusign.net/Signing/?ti=b7535ec3c0784a009c851935cda81d5a",
              "title": "Sign waiver"
            }],
          }]
        }
      }
    };
    fbFactory.sendTextMessage(sender, FORM_INSTRUCTIONS);
    setTimeout(function () {
      fbFactory.sendAttachment(sender, payload)
    }, 500);
  },

  sendProcessingForm: function (sender) {
    const PROCESSING_FORM = "Processing...";
    const PROCESSING_FORM_THANK_YOU = "Thank you for signing the liability waiver!";
    const REQUEST_IMAGE = "Would you please upload an image of the skin area in question for me?";
    // async process here to check if OK
    fbFactory.sendTextMessage(sender, PROCESSING_FORM);
    setTimeout(function () {
      fbFactory.sendTextMessage(sender, PROCESSING_FORM_THANK_YOU);
      setTimeout(function () {
        fbFactory.sendTextMessage(sender, REQUEST_IMAGE);
      }, 500);
    }, 500);
    return 'requestImage';
  },

  sendImageUploadedThankYou: function (sender) {
    const THANK_YOU = "Thank you!"
    const DIAGNOSING = "Please wait while we analyze your image. Diagnosing...";
    fbFactory.sendTextMessage(sender, THANK_YOU);
    fbFactory.sendTextMessage(sender, PLEASE_WAIT_DIAGNOSING);
  },

  sendImageRerequest: function (sender) {
    const IMAGE_REQUEST_REFUSAL = "Sorry, we need an image to diagnose your problem. Would you please upload an image of the skin area in question?";
    fbFactory.sendTextMessage(sender, IMAGE_REQUEST_REFUSAL);
  },

  sendDiagnosing: function (sender, patient, imageUrl) {
    const DIAGNOSING = "Diagnosing...";
    const DERMAI_CLASSIFICATION_SERVER = "http://ec2-54-84-217-198.compute-1.amazonaws.com/predict";
    const HIGH_LIMIT = 0.8;
    fbFactory.sendTextMessage(sender, DIAGNOSING);
    if (imageUrl) {
      base64Img.requestBase64(imageUrl, function(err, res, encodedImage) {
        const image = new Image({
          patientId: patient._id,
          encodedImage: encodedImage,
        });
        image.save();
        // send the encoded image to Mike's server
        const strippedEncodedImage = encodedImage.slice(22, encodedImage.length);
        request({
          url: DERMAI_CLASSIFICATION_SERVER,
          method: 'POST',
          json: true,
          headers: {
            'Content-Type': "application/json",
          },
          body: { image: strippedEncodedImage }
        }, function(error, response, body) {
          console.log(body, 'body');
          if (error) {
            console.log('Error sending message: ', error);
          }
          const score = body.score;
          const klass = body.class;
          if (score > HIGH_LIMIT) {
            fbFactory.sendPositiveDiagnosticResults(sender, patient, (score * 100).toFixed(1), klass);
          } else {
            fbFactory.sendNegativeDiagnosticResults(sender, patient);
          }
        });
      });
    } else { // logic branch for testing
      setTimeout(function () {
        fbFactory.sendInconclusiveDiagnosticResults(sender, patient);
      }, 2000);
    }
  },

  sendNegativeDiagnosticResults: function (sender, patient) {
    const NEGATIVE_DIAGNOSTIC_RESULTS = "It looks like this area should not be much of a concern.";
    fbFactory.sendTextMessage(sender, NEGATIVE_DIAGNOSTIC_RESULTS);
    // set Patient conversation state
    const conversationState = 'negativeDiagnosticResults';
    setTimeout(function () {
      fbFactory.sendContactDoctor(sender, patient, conversationState);
    }, 500);
  },

  sendInconclusiveDiagnosticResults: function (sender, patient) {
    const INCONCLUSIVE_DIAGNOSTIC_RESULTS = "It looks like this area may potential be of concern. You should probably consult a medical professional to validate.";
    fbFactory.sendTextMessage(sender, INCONCLUSIVE_DIAGNOSTIC_RESULTS);
    // set Patient conversation state
    const conversationState = 'inconclusiveDiagnosticResults';
    setTimeout(function () {
      fbFactory.sendContactDoctor(sender, patient, conversationState);
    }, 500);
  },

  sendPositiveDiagnosticResults: function (sender, patient, value, klass) {
    const POSITIVE_DIAGNOSTIC_RESULTS = `It looks like there is a high ${value}% chance this area may potentially be of concern. It looks like ${klass}. You should probably consult a medical professional to validate.`;
    fbFactory.sendTextMessage(sender, POSITIVE_DIAGNOSTIC_RESULTS);
    patient.diagnosed = klass;
    patient.save();
    // set Patient conversation state
    const conversationState = 'positiveDiagnosticResults';
    setTimeout(function () {
      fbFactory.sendContactDoctor(sender, patient, conversationState);
    }, 500);
  },

  sendContactDoctor: function (sender, patient, state) {
    const CONTACT_DOCTOR = `Would you ${state === 'negativeDiagnosticResults' ? 'still ': ''}like for me to connect you with a doctor ${patient.firstName}?`;
    fbFactory.sendTextMessage(sender, CONTACT_DOCTOR);
    patient.conversationState = 'contactDoctor';
    patient.save();
  },

  sendRefuseContactDoctor: function (sender) {
    const REFUSE_CONTACT_DOCTOR = "Are you sure you do not want me to connect you to a doctor?";
    fbFactory.sendTextMessage(sender, REFUSE_CONTACT_DOCTOR);
  },

  sendRequestOrGetCurrentLocation: function (sender, patient) {
    const GET_CURRENT_LOCATION = "Please send your current location.";
    const payload = {
      text: GET_CURRENT_LOCATION,
      "quick_replies": [{ "content_type":"location" }],
    };
    fbFactory.sendAttachment(sender, payload);
  },

  sendQueryDoctors: function (sender, patient) {
    // create list of doctors with postback to doctor's contact info
    // create the proxy phone numbers
    const LIST_DOCTORS = "Here are a list of doctors to talk to around your area.";
    const DOCTOR_CONTACT_RULES = "These phone numbers are proxies to maintain your and the medical professional's personal phone numbers anonymity. Type DONE to continue our conversation.";
    fbFactory.sendTextMessage(sender, LIST_DOCTORS);
    Doctor.find({})
      .then(doctors => {
        const sortedDoctors = doctors
          .sort(function (a, b) {
            return b.reputation - a.reputation; })
          .map(function (doctor) {
            return {
              "title": `Dr. ${doctor.firstName} ${doctor.lastName}`,
              "subtitle": `Reputation - ${doctor.reputation}   |  +1 ${doctor.phoneNumber}`,
              "buttons": [{
                "type": "postback",
                "title": "Contact",
                "payload": JSON.stringify(doctor),
              }]
            };
          })
          .slice(0, 4);
        const payload = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "list",
              "top_element_style": "compact",
              "elements": sortedDoctors,
            }
          }
        };
        fbFactory.sendAttachment(sender, payload);
        setTimeout(function () {
          fbFactory.sendTextMessage(sender, DOCTOR_CONTACT_RULES);
        }, 100);
      })
      .catch(err => console.error("error with querying doctors:", err));
  },

  sendDoctorContactOptions: function (sender, patient, doctor) {
    const payload = {
      "text": "Please select a contact option.",
      "quick_replies": [{
        "content_type": "text",
        "title": "Text",
        "payload": JSON.stringify(doctor),
      }, {
        "content_type": "text",
        "title": "Call",
        "payload": JSON.stringify(doctor),
      }],
    };
    fbFactory.sendAttachment(sender, payload);
  },

  sendFinalRequest: function (sender) {
    const FINAL_REQUEST = "Is there anything else we can do for you?";
    fbFactory.sendTextMessage(sender, FINAL_REQUEST);
  },

  sendGoodbye: function (sender) {
    const GOODBYE = "Thank you for using Derm.ai! We hope we were of help in your journey to a healthier life. " + 
      "Please provide any constructive feedback to help me improve here.";
    fbFactory.sendTextMessage(sender, GOODBYE);
  },

  sendLackComprehension: function (sender) {
    const LACK_COMPREHENSION = "Sorry I do not understand your request.";
    fbFactory.sendTextMessage(sender, LACK_COMPREHENSION);
  },

  sendRestart: function (sender, patient) {
    const RESTART = "Restarting Finite State Machine...";
    fbFactory.sendTextMessage(sender, RESTART);
    patient.conversationState = 'greeting';
    patient.save();
    setTimeout(function () {
      fbFactory.sendGreeting(sender, patient.firstName);
    }, 500);
  },

  sendTextMessage: function (sender, text) {
    const messageData = { text: text };
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:config.page_access_token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: messageData
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  },

  sendGenericMessage: function (sender) {
    const messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "First card",
            "subtitle": "Element #1 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
            "buttons": [{
              "type": "web_url",
              "url": "https://www.messenger.com/",
              "title": "Web url"
            }, {
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for first element in a generic bubble",
            }],
          },{
            "title": "Second card",
            "subtitle": "Element #2 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
            "buttons": [{
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for second element in a generic bubble",
            }],
          }]
        }
      }
    };
    fbFactory.sendAttachment(sender, messageData);
  },

  sendAttachment: function (sender, payload) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:config.page_access_token},
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: payload,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  },

};

module.exports = fbFactory;
