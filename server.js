
var express = require('express');
var _ = require('lodash');
var Q = require('q');


var sites = require('./sites.json');

var app = express();

var listingScraper = require('./listingScraper');

var iterateUntilEmpty = function(index, step, promiseResource){
	return promiseResource(index).then(function(resource){
		console.log(index,step,(resource));
		if(resource.length == 0){
			return [];
		} else {
			return iterateUntilEmpty((index+step), step, promiseResource).then(function(nextResource){

				var newResource = resource.concat(nextResource);
				console.log('merge',resource.length, nextResource.length, newResource.length)
				return newResource;
			})
		}
	});
}

app.get('/', function (req, res) {

	var query = req.query.q || '';

	iterateUntilEmpty(0,15,function(start){
		return listingScraper.promiseListing(sites['jobs.bg'],query,start)
	}).then(function(listing){
		res.jsonp({
			total: listing.length,
			listing: listing
		});
	},function(error){
		res.jsonp({error:error});
	})
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})