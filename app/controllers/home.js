const express = require('express');
const basicAuth = require('express-basic-auth');

const router = express.Router();
const db = require('../models');
const config = require('../../config/config');

// Models
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Image = require('../models/image');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {
      fb_app_id: config.fb_app_id,
      fb_page_id: config.fb_page_id
    });
});

router.get('/admin', function (req, res, next) {
	return Patient.find({})
		.then(patients => {
			return Doctor.find({})
				.then(doctors => {
					return Image.find({})
						.then(images => {
							return res.render('dashboard', {
								patients: patients,
								doctors: doctors,
								images: images,
							});
						})
						.catch(err => console.error("error with images fetching"));
				})
				.catch(err => console.error("Error with doctors fetching"));
		})
		.catch(err => console.error("Error with patients fetching"));
});

// basic auth for admin map dashboard
router.post('/admin/auth', function (req, res, next) {
	const username = req.body.username;
	const password = req.boyd.password;
	const message = config.adminUsername === username && config.adminPassword === password ?
		'OK' : 'NOT OK';
	return res.send(message);
});


// doctor endpoints
router.post('/doctors', function (req, res, next) {
	const body = req.body;
	const newDoctor = new Doctor({
		firstName: body.firstName,
		lastName: body.lastName,
		email: body.email,
		phoneNumber: body.phoneNumber,
		city: body.city,
		state: body.state,
		zipcode: body.zipcode,
		reputation: 0,
	});
	return newDoctor
		.save()
		.then(doctor => {
			return res.status(200).json(doctor);
		})
		.catch(err => console.error("Error saving new doctor"));
});

// doctor classifies images endpoints
router.post('/doctors/:id/images', function (req, res, next) {
	const body = req.body;
	const newImageLabel = new ImageLabel({
		imageId: body.imageId,
		patientId: body.patientId,
		doctorId: req.params.id,
		classification: body.classification,
	});
	Doctor.findOneAndUpdate({ _id: req.params.id }, { $set: { reputation: 5 } })
		.then(doctor => console.log('doctor updated'))
		.catch(err => console.error("error updating doctor"))
	return newImageLabel
		.save()
		.then(imageLabel => {
			return res.status(200).json(imageLabel);
		})
		.catch(err => console.error("Error saving new image label"));
});
