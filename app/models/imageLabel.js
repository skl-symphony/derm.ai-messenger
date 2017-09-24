const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const imageLabelSchema = new Schema({
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, deafult: Date. now},
	imageId: { type: ObjectId, ref: 'Image' },
	patientId: { type: ObjectId, ref: 'Patient' },
	doctorId: { type: ObjectId, ref: 'Doctor' },
	classification: String,
});

imageLabelSchema.pre('update', function (next) {
	this.update({}, { $set: { updatedAt: new Date() } });
	next();
});

const ImageLabel = mongoose.model('ImageLabel', imageLabelSchema);

module.exports = ImageLabel;
