'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// Connect to database
mongoose.Promise = global.Promise;
mongoose.connect(config.connectionString, {
  useMongoClient: true
});

// Load Models
const Customer = require('./models/customer');

// Load routes
const customerRoute = require('./routes/customer-route');

app.use(bodyParser.json({
  limit: '1mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Habilita o CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use('/customer', customerRoute);

module.exports = app;
