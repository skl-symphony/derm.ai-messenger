const mongoose = require('mongoose');
const config = require('../../config/config');

const mongodbUrl = config.mongo_url;
mongoose.connect(mongodbUrl);

// connection obj
const db = mongoose.connection;
module.exports = db;