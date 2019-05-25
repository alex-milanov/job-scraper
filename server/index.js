'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const path = require('path');

const app = express();

const appRoot = path.resolve(__dirname, '..');

var db = mongoose.connect('mongodb://localhost:27017/job-scraper');

// load modules
require('./models/job');

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(appRoot + '/dist'));

require('./routes/scrape')(app, db);
require('./routes/jobs')(app, db);

app.listen(8080);

console.log('Express app started on port ' + 8080);
