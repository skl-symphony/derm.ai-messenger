const express = require('express');
const config = require('./config/config');
const db = require('./app/models');
const telesign = require('./app/helpers/telesign');

const app = express();

require('./config/express')(app, config);

// event handlers for mongodb connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('MongoDB connection Open:'));

app.listen(config.port || 9000, function () {
  console.log('Express server started and listening on ' + this.address().port + ".");
});

// initialize telesign client
telesign.initializeTelesignClient();
