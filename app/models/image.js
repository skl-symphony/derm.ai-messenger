const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const imageSchema = new Schema({
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, deafult: Date. now},
	patientId: { type: ObjectId, ref: 'Patient' },
	encodedImage: String,
	classification: String,
	labelledData: [{
		createdAt: { type: Date, default: Date.now },
		doctorId: { type: ObjectId, ref: 'Doctor' },
		label: String,
	}],
});

imageSchema.pre('update', function (next) {
	this.update({}, { $set: { updatedAt: new Date() } });
	next();
});

imageSchema.post('update', function (next) {
  next();
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
