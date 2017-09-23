// const config = require('../../config/config');
// const request = require('request');
// const rp = require('request-promise');

// // liability text
// const LIABILITY_FORM_TEMPLATE = `
// We at Derm.ai are not liable for the actions taken by our users based on our recommendations.
// Derm.ai is meant to be used as a tool to . It is not a perfect solution or answer.
// `;

// // Hashmap of criticalness of disease

// // state and message function to output which function to call
// // @param state - previous state
// // returns - next state 

// // Static Bot Response

// // ALl of these are sent

// // These are sent after the async confirmation

// const FIND_NEARBY_DOCTORS = `Would you like me to help you schedule an appointment with a medical professional?`;
// const REQUEST_USE_OF_ADDRESS = "Do you want us to use this address to search for relevant medical care providers.";
// const USE_ANOTHER_ADDRESS = "Do you mind providing an address to search around?";

// const FOUND_DOCTORS = "We have found multiple doctors in your requested area.";
// const CONTACT_DOCTOR = "Would you like us to contact this doctor?"

// // fill in more things


// // create texting masker

// const fbFactory = {

//   sendTextMessage: function (sender, text) {
//     const messageData = {
//       text: text
//     };
//     request({
//       url: 'https://graph.facebook.com/v2.6/me/messages',
//       qs: { access_token:config.page_access_token },
//       method: 'POST',
//       json: {
//         recipient: { id: sender },
//         message: messageData
//       }
//     }, function (error, response, body) {
//       if (error) {
//         console.log('Error sending messages: ', error);
//       } else if (response.body.error) {
//         console.log('Error: ', response.body.error);
//       }
//     });
//   },

//   sendAttachment: function (sender, attachment) {
//     request({
//       url: 'https://graph.facebook.com/v2.6/me/messages',
//       qs: { access_token:config.page_access_token },
//       method: 'POST',
//       json: {
//         recipient: { id: sender },
//         message: messageData,
//       }
//     }, function(error, response, body) {
//       if (error) {
//         console.log('Error sending message: ', error);
//       } else if (response.body.error) {
//         console.log('Error: ', response.body.error);
//       }
//     });
//   },
// };

// const fbActionFactory = {

//   getUserName: function (sender) {
//     return rp({
//       url: 'https://graph.facebook.com/v2.6/' + sender,
//       qs: {
//         access_token: config.page_access_token,
//         fields: "first_name,last_name"
//       },
//       method: 'GET'
//     })
//     .then (function(data) {
//       return JSON.parse(data);
//     });
//   },

//   sendGreeting: function (sender, firstName) {
//     const GREETING = `Hi ${firstName}. My name is Demi!  May I assist you with diagnosing a skin issue you may have concerns about?`;
//     fbFactory.sendTextMessage(sender, GREETING);
//   },

//   sendLiabilityFormRequest: function (sender) {
//     const LIABILITY_FORM = "Awesome! Before we start, do you mind electronically signing this liability form?";
//     fbFactory.sendTextMessage(sender, LIABILITY_FORM);
//   },

//   sendLiabilityFormRequestRefusal: function (sender) {
//     const LIABILITY_FORM_REREQUEST = "Sorry, you need to sign this liability form before we proceed. Do you mind electronically signing this liability form?";
//     fbFactory.sendTextMessage(sender, LIABILITY_FORM_REREQUEST);
//   },

//   sendProcessingForm: function (sender) {
//     fbFactory.sendTextMessage(sender, PROCESSING_FORM);
//   },

//   sendRequestImage: function (sender) {
//     fbFactory.sendTextMessage(sender, REQUEST_IMAGE);
//   },

//   sendImageUploadedThankYou: function (sender) {
//     fbFactory.sendTextMessage(sender, THANK_YOU);
//   },

//   sendImageRerequest: function (sender) {
//     fbFactory.sendTextMessage(sender, IMAGE_REQUEST_REFUSAL);
//   },

//   sendDiagnosing: function (sender) {
//     fbFactory.sendTextMessage(sender, DIAGNOSING);
//   },

//   sendNegativeDiagnosticResults: function (sender) {
//     fbFactory.sendTextMessage(sender, NEGATIVE_DIAGNOSTIC_RESULTS);
//   },

//   sendInconclusiveDiagnosticResults: function (sender) {
//     fbFactory.sendTextMessage(sender, NEGATIVE_DIAGNOSTIC_RESULTS);
//   },

//   sendPositiveDiagnosticResults: function (sender) {
//     fbFactory.sendTextMessage(sender, POSITIVE_DIAGNOSTIC_RESULTS);
//   },

//   sendFindNearbyDoctors: function (sender) {
//     fbFactory.sendTextMessage(sender, FIND_NEARBY_DOCTORS);
//   },

//   sendContactDoctor: function(sender) {
//     fbFactory.sendTextMessage(sender, CONTACT_DOCTOR);
//   },

//   sendCurrentLocation: function (sender, address) {
//     const CURRENT_LOCATION = `Are you located around ${address}?`;
//     fbFactory.sendTextMessage(sender, NEARBY_ADDRESS);
//   },

//   sendRequestUseOfAddress: function (sender) {
//     fbFactory.sendTextMessage(sender, REQUEST_USE_OF_ADDRESS);
//   },

//   sendUseAnotherAddress: function (sender) {
//     fbFactory.sendTextMessage(sender, USE_ANOTHER_ADDRESS);
//   },

//   sendFoundDoctors: function (sender) {
//     fbFactory.sendTextMessage(sender, FOUND_DOCTORS);
//   },

//   sendFinalRequest: function (sender) {
//     fbFactory.sendTextMessage(sender, FINAL_REQUEST);
//   },

//   sendGoodbye: function (sender) {
//     const GOODBYE = "Thank you for using Derm.ai! We hope we were of help in your journey to a healthier life. " + 
//       "Please provide any constructive feedback to help me improve here.";
//     fbFactory.sendTextMessage(sender, GOODBYE);
//   },

//   // catch all of failed to parse intent from user message string
//   sendLackComprehension: function (sender) {
//     const LACK_COMPREHENSION = "Sorry I do not understand your request";
//     fbFactory.sendTextMessage(sender, LACK_COMPREHENSION);
//   },

//   sendLiabilityForm: function (sender) {
//     const liabilityAttachment = {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [
//             {
//               title: "Liability Form",
//               subtitle: "Sign liability form before diagnosis",
//               image_url: "", // TODO: find approriate image_url, probably just of Docusign 
//               buttons: [
//                 {
//                   type: "web_url",
//                   url: "https://www.messenger.com/",
//                   title: "Liability Form"
//                 }
//               ],
//             }
//           ]
//         }
//       }
//     };
//     fbFactory.sendAttachment(sender, liabilityAttachment);
//   },

//   sendDiagnosis: function (sender, diagnosis) {
//     const messageData = {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "list",
//           top_element_style: "compact",
//           elements: [
//             {
//               title: "Classic T-Shirt Collection",
//               subtitle: "See all our colors",
//             },
//             {
//               title: "Classic White T-Shirt",
//               subtitle: "See all our colors",
//             }
//           ],
//           buttons: [
//             {
//               title: "View More",
//               type: "postback",
//               payload: "payload"
//             }
//           ]  
//         }
//       }
//     };
//     fbFactory.sendAttachment(sender, messageData);
//   },

//   // send list of doctors

//   // send list of diagnostics

//   sendGenericMessage: function (sender) {
//     const messageData = {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [{
//             title: "First card",
//             subtitle: "Element #1 of an hscroll",
//             image_url: "http://messengerdemo.parseapp.com/img/rift.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.messenger.com/",
//               title: "Web url"
//             }, {
//               type: "postback",
//               title: "Postback",
//               payload: "Payload for first element in a generic bubble",
//             }],
//           },{
//             title: "Second card",
//             subtitle: "Element #2 of an hscroll",
//             image_url: "http://messengerdemo.parseapp.com/img/gearvr.png",
//             buttons: [{
//               type: "postback",
//               title: "Postback",
//               payload: "Payload for second element in a generic bubble",
//             }],
//           }]
//         }
//       }
//     };
//     fbFactory.sendAttachment(sender, messageData);
//   },
// };

// module.exports = fbActionFactory;
