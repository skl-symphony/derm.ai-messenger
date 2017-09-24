const TeleSignSDK = require('telesignsdk');
const config = require('../../config/config');

let telesign;

const telesignFactory = {
	initializeTelesignClient: () => {
		const customerId = config.telesignCustomerId; // find in portal.telesign.com
		const apiKey = config.telesignApiKey;
		const restEndpoint = config.telesignRestEndpoint;
		const TIMEOUT = 10000; // 10 secs
		// assign telesign client
		telesign = new TeleSignSDK(
			customerId,
		  apiKey,
			restEndpoint,
			TIMEOUT // optional
		);
		return telesign;
	},

	contactDoctor: (patient, doctor, type) => {
		const message = `${patient.firstName} ${patient.lastName} would like to schedule an appointment with you to speak about a potential issue with ${patient.diagnosed}, Dr. ${doctor.lastName}. You may reach ${patient.firstName} at ${patient.phoneNumber}. Thank you.`;
		if (type === 'text') {
			telesignFactory.sendSMSMessage(doctor.phoneNumber, message);
		} else if (type === 'call') {
			telesignFactory.sendVoiceMessage(doctor.phoneNumber, message);
		} else {
			console.error("What do?");
		}
	},

	contactFamily: (patient, customMessage, phoneNumber) => {
		const defaultMessage = ``;
		const message = customMessage || defaultMessage;
		telesignFactory.sendSMSMessage(phoneNumber, message);
	},

	sendSMSMessage: (toPhoneNumber, message) => {
    const phoneNumber = "1" + toPhoneNumber; // Your end user’s phone number, as a string of digits without spaces or
    // const strippedPhoneNumber = phoneNumber.replace(/\D/g,'');
    const strippedPhoneNumber = "17605835578";
    const messageType = "ARN"; // ARN = Alerts, Reminders, and Notifications; OTP = One time password; MKT = Marketing
    let referenceId = Math.round((new Date()).getTime() / 1000);; // need this to check status later
    console.log(strippedPhoneNumber, 'stripped phone number');

    telesign.sms.message(
    	(err, reply) => {
    		console.log(reply, 'inside telesign callback');
	      if (err) {
	        console.log("Error: Could not reach TeleSign's servers");
	        console.error(err); // network failure likely cause for error
	      } else {
	        console.log("YAY!, the SMS message is being sent now by TeleSign!");
	        console.log(reply);
	        referenceId = reply.reference_id; // save the reference_id to check status of the message
	      }
	    },
	    strippedPhoneNumber,
	    message,
	    messageType
		);
	},

	sendVoiceMessage: (toPhoneNumber, message) => {
		const phoneNumber = "1" + toPhoneNumber;
		// const strippedPhoneNumber = phoneNumber.replace(/\D/g,'');
    const strippedPhoneNumber = "17605835578";
		const messageType = "ARN";
		console.log("## VoiceClient.call ##");
		function voiceCallback(error, responseBody) {
	    if (error === null) {
        console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
          ` => code: ${responseBody['status']['code']}` +
          `, description: ${responseBody['status']['description']}`);
	    } else {
        console.error("Unable to send message. " + error);
	    }
		}
		telesign.voice.call(voiceCallback, strippedPhoneNumber, message, messageType);
	},

};

module.exports = telesignFactory;