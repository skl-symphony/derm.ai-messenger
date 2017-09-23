const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const patientSchema = new Schema({
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	firstName: String,
	lastName: String,
	fbId: String,
	email: String,
	phoneNumber: String,
	passthrough: String,
	conversationState: String,
	doctorId: { type: ObjectId, ref: 'Doctor' }, // for conversation with a single doctor many to one relation
	// TODO - potentially don't need, since we don't need as the security, if they reach a conversation state passed the waiver being signed
	liabilityWaiverSigned: Boolean, 
	latitude: Number,
	longitude: Number,
});

patientSchema.pre('update', function(next) {
	this.update({},{ $set: { updatedAt: new Date() } });
	next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
