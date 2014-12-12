'use strict'

var http = require('http');

var cheerio = require('cheerio');

var _ = require('lodash');
var Q = require('q');

// denodified functions
var http_request = function(options){
	var deferred = Q.defer();

	http.request(options, function(response, error){
		deferred.resolve(response);
	}).end();

	return deferred.promise;
}


function promiseHttpResponse(conf, query, start){
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

	console.log('pre request',options);
	return http_request(options);
}

function promiseResponseData(response){
	var deferred = Q.defer();
	var str = ''
	response.on('data', function (chunk) {
		str += chunk;
	});

	response.on('end', function () {

		console.log('response end');
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
			link: $(this).attr('href')
		})
		console.log($(this).html());
	})

	deferred.resolve(results);

	return deferred.promise
}

function promiseJobInfoParsed(conf, result, data){

	console.log(result,data);

	var deferred = Q.defer();
	var $ = cheerio.load(data);

	result.info = $('td.jobTitleViewBold').eq(1).next('td').text();

	$('td.jobTitleViewBold').each(function(){
		if($(this).text() == 'Заплата:'){
			result.salary = $(this).next('td').text();
		}
	})

	deferred.resolve(result);

	console.log(result);

	return deferred.promise;
}

function promiseJobInfo(conf, results){

	var resultPromises = [];

	for(var i in results){
		var options = {
			host: conf.baseUrl,
			path: '/'+results[i].link
		};
		var result = results[i];
		resultPromises.push(function(conf, result){
			return http_request(options)
				.then(promiseResponseData)
				.then(function(data){
					return promiseJobInfoParsed(conf, result, data);
				})
		}(conf, result));
	}

	return Q.all(resultPromises);
}

var promiseListing = function(conf, query, start){

	return promiseHttpResponse(conf, query, start)
		.then(promiseResponseData)
		.then(function(data){
			return promiseResults(conf, data);
		})
		.then(function(results){
			return promiseJobInfo(conf, results);
		})
}


exports.promiseListing = promiseListing;