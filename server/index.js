'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const path = require('path');

const app = express();

const appRoot = path.resolve(__dirname, '..');

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(appRoot + '/web/dist'));

require('./routes/scrape')(app);

app.listen(8080);

console.log('Express app started on port ' + 8080);
