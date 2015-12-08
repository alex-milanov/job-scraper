'use strict'

var request = require('request');

// cheerio for jquery style html page parsing
var cheerio = require('cheerio');

var _ = require('lodash');
var Q = require('q');

// denodified functions
var promiseRequest = function(url){
	var deferred = Q.defer();

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			deferred.resolve(body);
		} else {
			deferred.reject(error,response);
		}
	});

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


function promiseJobsListHTML(conf, query, start){
	var deferred = Q.defer();

	var listingPath = conf.listingPath;
	if(query){
		listingPath += '?'+conf.queryParam+'='+query;
		if(conf.pageParam && start){
			listingPath += '&'+conf.pageParam+'='+start;
		}
	} else {
		deferred.reject({msg: 'no query sent'});
		return deferred.promise;
	}

	var options = {
		host: conf.baseUrl,
		protocol: conf.protocol,
		path: listingPath
	};

	var url = conf.protocol + "://" + conf.baseUrl + listingPath;

	//console.log(url);

	return promiseRequest(url);
}

function promiseJobsList(conf, jobsListHTML){

	var deferred = Q.defer();
	var $ = cheerio.load(jobsListHTML);

	var jobsList = [];

	if(conf.list){
		$(conf.list.selector).each(function(){
			jobsList.push({
				title: chainParse(_.clone(conf.list.title),$(this)),
				link: chainParse(_.clone(conf.list.link),$(this))
			});
		});
	}
	/*
	$("a."+conf.linkId).each(function(){
		jobsList.push({
			title: $(this).html(),
			link: $(this).attr('href')
		})
	})
*/

	deferred.resolve(jobsList);

	return deferred.promise
}

function promiseJobFields(fields, job, data){


	var deferred = Q.defer();
	var $ = cheerio.load(data);

	for(var i in fields){
		if(fields[i].type == 'jquery'){
			job[i] = jqueryParse(fields[i],$);
		}
	}

	deferred.resolve(job);

	return deferred.promise;
}

function promiseJobInfo(conf, jobsList){

	var jobInfoPromises = [];

	for(var i in jobsList){

		var jobLink = jobsList[i].link;

		// case 1 - http(s)://site-base-url/job/link
		// case 2 - http(s)://another-site/job/link
		// case 3 - no http - /job/link or job/link
		var matches = jobLink.split(/^((https?)\:\/\/([a-z\.]+))?\/?([a-z0-9\/\.\-\_]+(\.html?)?)/gi);
		var baseUrl = (typeof matches[1] !== "undefined") ? matches[3] : conf.baseUrl;
		//baseUrl = baseUrl.replace('www.','');
		var protocol = (typeof matches[2] !== "undefined") ? matches[2] : conf.protocol;
		jobLink = matches[4];

		var url = jobsList[i].link = protocol+'://'+baseUrl+'/'+jobLink;

		var job = jobsList[i];
		var fields = conf.fields;
		jobInfoPromises.push(promiseRequest(url)
			.then(function(job){
				return function(data){
					return promiseJobFields(fields, job, data);
				};
			}(job)));
	}

	return Q.all(jobInfoPromises);
}

var promiseListing = function(conf, query, start){

	return promiseJobsListHTML(conf, query, start)
		.then(function(data){
			return promiseJobsList(conf, data);
		})
		.then(function(jobsList){
			return promiseJobInfo(conf, jobsList);
		})
}


exports.promiseListing = promiseListing;