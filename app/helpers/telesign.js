const TeleSignSDK = require('telesignsdk');
const config = require('../../config/config');

let telesign;

module.exports = {
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

	contactDoctor: (patient, doctor) => {
		const message = `${patient.firstName} ${patient.lastName} would like to schedule an appointment with you, Dr. ${doctor.firstName}.`;
		this.sendSMSMessage(doctor.phoneNumber, message);
	},

	contactFamily: (patient, customMessage, phoneNumber) => {
		const defaultMessage = ``;
		const message = customMessage || defaultMessage;
		this.sendSMSMessage(phoneNumber, message);
	},

	sendSMSMessage: (toPhoneNumber, message) => {
    const phoneNumber = "1" + toPhoneNumber; // Your end user’s phone number, as a string of digits without spaces or
    const messageType = "ARN"; // ARN = Alerts, Reminders, and Notifications; OTP = One time password; MKT = Marketing
    const referenceId = null; // need this to check status later
    telesign.sms.message(
    	(err, reply) => {
	      if (err) {
	        console.log("Error: Could not reach TeleSign's servers");
	        console.error(err); // network failure likely cause for error
	      } else {
	        console.log("YAY!, the SMS message is being sent now by TeleSign!");
	        console.log(reply);
	        referenceId=reply.reference_id; // save the reference_id to check status of the message
	      }
	    },
	    phoneNumber,
	    message,
	    messageType
		);
	},

};