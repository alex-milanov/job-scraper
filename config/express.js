	'use strict'

	var path = require('path');

	var express = require('express');
	var bodyParser = require('body-parser');
	var methodOverride = require('method-override');
	
	var consolidate = require('consolidate');

	module.exports = function(){
		var app = express();

		var appRoot = __dirname + '/..';

		app.engine('html', consolidate["ejs"]);
		app.engine('jade', consolidate["jade"]);

		// Set views path and view engine
		app.set('view engine', 'jade');
		app.set('views', appRoot + '/app/views');

		// Request body parsing middleware should be above methodOverride
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());
		app.use(methodOverride());


  		app.use(express.static(appRoot + '/public'));


		// routes
		app.get('/', function(req, res){
			res.render('index.jade');
		});

		require(appRoot + '/app/routes/scrape')(app);

		return app;
	}