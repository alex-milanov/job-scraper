'use strict'

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var consolidate = require('consolidate');

var app = express();

var appRoot = __dirname + '/..';

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(appRoot + '/web/dist'));

require(appRoot + '/api/routes/scrape')(app);

app.listen(8080);

console.log('Express app started on port ' + 8080);
