	'use strict'

	var listingScraper = require('../services/listing.scraper');
	var promiseUtil = require('../services/promise.util');
	var sitesConf = require('../../config/sites.json');


	module.exports = function(app){

		app.get('/scrape', function (req, res) {
			
			var query = req.query.q || '';
			var site = req.query.site || 'jobs.bg';

			var siteConf = sitesConf[site];
			var start = siteConf.incStart || 0;
			var step = siteConf.incStep || 15;

			// promise job listing, page by page
			var iteratedPromise = function(index){
				console.log(index);
				return listingScraper.promiseListing(siteConf,query,index);
			}

			var handleSuccess = function(listing){
				res.jsonp({
					total: listing.length,
					listing: listing
				});
			}

			var handleError = function(error){
				res.jsonp({error:error});
			}

			// iteratively scrape, modify and concat the job listings
			promiseUtil.iterateUntilEmpty(start,step,iteratedPromise).then(handleSuccess,handleError)
		})


	}