'use strict'

var http = require('http');

var cheerio = require('cheerio');

var _ = require('lodash');
var Q = require('q');

// denodified functions
var http_request = function(options){
	var deferred = Q.defer();

	http.request(options, function(response){
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			deferred.resolve(str);
		});
	}).end();

	return deferred.promise;
}

// parsers
var chainParse = function(chain, el){
	if(!chain[0]){
		return el;
	}
	var func = chain[0][0];
	if(chain[0][1]){
		el = el[func](chain[0][1]);
	} else {
		el = el[func]();
	}
	chain.shift();
	return chainParse(chain, el);
}

var jqueryParse = function(field, $){
	if(!field.chain[0])
		return '';
	else 
		return chainParse(_.clone(field.chain), $(field.selector));
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

	return http_request(options);
}

function promiseResults(conf, data){

	var deferred = Q.defer();
	var $ = cheerio.load(data);

	var results = [];

	$("a."+conf.linkId).each(function(){
		results.push({
			title: $(this).html(),
			link: $(this).attr('href')
		})
	})

	deferred.resolve(results);

	return deferred.promise
}

function promiseJobFields(fields, result, data){


	var deferred = Q.defer();
	var $ = cheerio.load(data);

	for(var i in fields){
		if(fields[i].type == 'jquery'){
			result[i] = jqueryParse(fields[i],$);
		}
	}

	deferred.resolve(result);

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
		var fields = conf.fields;
		resultPromises.push(http_request(options)
			.then(function(result){
				return function(data){
					return promiseJobFields(fields, result, data);
				};
			}(result)));
	}

	return Q.all(resultPromises);
}

var promiseListing = function(conf, query, start){

	return promiseHttpResponse(conf, query, start)
		.then(function(data){
			return promiseResults(conf, data);
		})
		.then(function(results){
			return promiseJobInfo(conf, results);
		})
}


exports.promiseListing = promiseListing;