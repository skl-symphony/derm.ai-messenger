const express = require('express');
const mongoose = require('mongoose');
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


router.get('/doctors/seed', function (req, res, next) {
	const doctors = [
	  {'firstName': 'Robert', 'lastName': 'Lowen', 'phoneNumber': '(650) 965-7888', 'reputation': 20},
	  {'firstName': 'Kirk', 'lastName': 'Churukian', 'phoneNumber': '(408) 358-7000', 'reputation': 80},
	  {'firstName': 'Anthony', 'lastName': 'Badame', 'phoneNumber': '(408) 297-4200', 'reputation': 60},
	  {'firstName': 'Sandra', 'lastName': 'Yeh', 'phoneNumber': '(408) 246-8900', 'reputation': 60},
	  {'firstName': 'Jennifer', 'lastName': 'Baron', 'phoneNumber': '(408) 418-8780', 'reputation': 20},
	  {'firstName': 'Joe', 'lastName': 'Gorelick', 'phoneNumber': '(408) 369-5600', 'reputation': 40},
	  {'firstName': 'Christopher', 'lastName': 'Schmidt', 'phoneNumber': '(408) 356-2147', 'reputation': 60},
	  {'firstName': 'Kent', 'lastName': 'Carson', 'phoneNumber': '(408) 281-9606', 'reputation': 20},
	  {'firstName': 'Howard', 'lastName': 'Sutkin', 'phoneNumber': '(408) 866-5433', 'reputation': 0},
	  {'firstName': 'Lavanya', 'lastName': 'Krishnan', 'phoneNumber': '(415) 329-5100', 'reputation': 20},
	  {'firstName': 'Andrea', 'lastName': 'Hui', 'phoneNumber': '(415) 292-6350', 'reputation': 40},
	  {'firstName': 'Lawrence', 'lastName': 'Cheung', 'phoneNumber': '(415) 333-0348', 'reputation': 80},
	  {'firstName': 'Diana', 'lastName': 'Camarillo', 'phoneNumber': '(415) 441-1670', 'reputation': 50},
	  {'firstName': 'Richard', 'lastName': 'Glogau', 'phoneNumber': '(415) 564-1261', 'reputation': 40},
	  {'firstName': 'Alice', 'lastName': 'Do', 'phoneNumber': '(415) 422-0000', 'reputation': 40},
	  {'firstName': 'David', 'lastName': 'MacGregor', 'phoneNumber': '(415) 989-9400', 'reputation': 60},
	  {'firstName': 'Debi', 'lastName': 'Layton', 'phoneNumber': '(415) 956-8686', 'reputation': 60},
	  {'firstName': 'Kathy', 'lastName': 'Fields', 'phoneNumber': '(415) 923-3377', 'reputation': 80},
	  {'firstName': 'Jacqueline', 'lastName': 'Dolev', 'phoneNumber': '(415) 923-3970', 'reputation': 80},
	  {'firstName': 'Sinae', 'lastName': 'Kane ', 'phoneNumber': '(415) 564-1261', 'reputation': 60},
	  {'firstName': 'Judy', 'lastName': 'Ng', 'phoneNumber': '(415) 781-4083', 'reputation': 100},
	  {'firstName': 'Helen', 'lastName': 'Manber', 'phoneNumber': '(415) 668-4100', 'reputation': 100},
	  {'firstName': 'Anne', 'lastName': 'Zhuang', 'phoneNumber': '(415) 393-9550', 'reputation': 80},
	  {'firstName': 'JoEllen', 'lastName': 'VanZander', 'phoneNumber': '(650) 736-5772', 'reputation': 40},
	  {'firstName': 'Elizabeth', 'lastName': 'Gould', 'phoneNumber': '(650) 327-5783', 'reputation': 20},
	  {'firstName': 'Divya', 'lastName': 'Railan', 'phoneNumber': '(650) 322-1100', 'reputation': 20},
	  {'firstName': 'Rita', 'lastName': 'Khodosh', 'phoneNumber': '(650) 323-0276', 'reputation': 20},
	  {'firstName': 'Kathleen', 'lastName': 'Kramer', 'phoneNumber': '(650) 853-2982', 'reputation': 60},
	  {'firstName': 'Shaheen', 'lastName': 'Khosla', 'phoneNumber': '(650) 344-1121', 'reputation': 40},
	  {'firstName': 'Scott', 'lastName': 'Herron', 'phoneNumber': '(650) 853-2982', 'reputation': 60},
	  {'firstName': 'Lynn', 'lastName': 'Chang', 'phoneNumber': '(650) 498-6000', 'reputation': 80},
	  {'firstName': 'Joyce', 'lastName': 'Teng', 'phoneNumber': '(650) 721-1227', 'reputation': 60},
	  {'firstName': 'Molly', 'lastName': 'Johnson', 'phoneNumber': '(650) 299-2111', 'reputation': 60},
	  {'firstName': 'David', 'lastName': 'Fiorentino', 'phoneNumber': '(650) 723-6961', 'reputation': 40},
	  {'firstName': 'Denise', 'lastName': 'Woo', 'phoneNumber': '(650) 299-4056', 'reputation': 20},
	  {'firstName': 'Peter', 'lastName': 'Marinkovich', 'phoneNumber': '(650) 498-6000', 'reputation': 40},
	  {'firstName': 'Jhin', 'lastName': 'Marie', 'phoneNumber': '(650) 551-9700', 'reputation': 100},
	  {'firstName': 'Michelle', 'lastName': 'Fiore', 'phoneNumber': '(650) 591-8501', 'reputation': 60},
	  {'firstName': 'Jennifer', 'lastName': 'Boldrick', 'phoneNumber': '(650) 596-4160', 'reputation': 60},
	  {'firstName': 'David', 'lastName': 'Berman', 'phoneNumber': '(650) 325-6000', 'reputation': 60},
	  {'firstName': 'Lyle', 'lastName': 'Rausch', 'phoneNumber': '(650) 361-1177', 'reputation': 20}
	];

	doctors.forEach(function (doctor) {
	  console.log(doctor, 'doctor');
	  const newDoctor = new Doctor(doctor);
	  newDoctor.save();
	});
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

