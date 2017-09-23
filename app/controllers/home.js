const express = require('express');
const router = express.Router();
const db = require('../models');
const config = require('../../config/config');

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
	return res.render('dashboard');
});

// basic auth for admin map dashboard
router.post('/admin/auth', function (req, res, next) {
	const username = req.body.username;
	const password = req.boyd.password;
	const message = config.adminUsername === username && config.adminPassword === password ?
		'OK' : 'NOT OK';
	return res.send(message);
});
