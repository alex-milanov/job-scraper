var http = require('http');
var express = require('express');

var cheerio = require('cheerio');

var _ = require('lodash');
var Q = require('q');

var sites = require('./sites.json');

var app = express();


function promiseHttpResponse(response){
	var deferred = Q.defer();
	var str = ''
	response.on('data', function (chunk) {
		str += chunk;
	});

	response.on('end', function () {
		deferred.resolve(str);
	});
	return deferred.promise
}

function promiseResults(conf, data){

	//console.log(conf,data);

	var deferred = Q.defer();
	var $ = cheerio.load(data);

	var results = [];

	$("a."+conf.linkId).each(function(){
		results.push({
			title: $(this).html(),
			link: conf.baseUrl+'/'+$(this).attr('href')
		})
		console.log($(this).html());
	})


	console.log('done listing');
	deferred.resolve(results);

	return deferred.promise
}

function promiseListing(conf, query, start){
	var deferred = Q.defer();

	var listingPath = conf.listingPath;
	if(query){
		listingPath += '?'+conf.queryParam+'='+query;
		if(start){
			listingPath += '&'+conf.pageParam+'='+start;
		}
	} else {
		deferred.reject({msg: 'no query sent'});
		return deferred.promise;
	}

	var options = {
		host: conf.baseUrl,
		path: listingPath
	};

	console.log(options);

	http.request(options, function(response){
		promiseHttpResponse(response).then(function(data){
			return promiseResults(conf, data);
		}).then(function(listing){
			deferred.resolve(listing);
		}, function(error){
			deferred.reject(error);
		})
	}).end();


	return deferred.promise;
}


app.get('/', function (req, res) {


	var query = req.query.q || '';
	var start = req.query.start || 0;

	promiseListing(sites['jobs.bg'],query,start).then(function(listing){
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