
var express = require('express');


var sites = require('./sites.json');

var app = express();

var listingScraper = require('./listingScraper');



app.get('/', function (req, res) {


	var query = req.query.q || '';
	var start = req.query.start || 0;

	listingScraper.promiseListing(sites['jobs.bg'],query,start).then(function(listing){
		res.jsonp(listing);
	},function(error){
		res.jsonp(error);
	})
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})