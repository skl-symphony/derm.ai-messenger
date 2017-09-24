const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const doctorSchema = new Schema({
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	firstName: String,
	lastName: String,
	email: String,
	phoneNumber: String,
	liabilityWaiverSigned: Boolean,
	// information for patient recommendations
	city: String,
	state: String,
	zipcode: String,
	reputation: Number, // 0 - 100
});

doctorSchema.pre('update', function(next) {
	this.update({},{ $set: { updatedAt: new Date() } });
	next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
