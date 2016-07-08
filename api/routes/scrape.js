	'use strict'

	var listingScraper = require('../services/listing.scraper');
	var promiseUtil = require('../services/promise.util');
	var sitesConf = require('../config/sites.json');

	const handleSuccess = (req, res) => listing =>
		res.jsonp({
			total: listing.length,
			listing: listing
		});

	const handleError = (req, res) => error =>
		res.jsonp({error:error});

	module.exports = function(app){
		app.get('/api/scrape', function (req, res) {

			var searchQuery = req.query.q || '';
			var site = req.query.site || 'jobs.bg';

			var siteConf = sitesConf[site];
			var start = siteConf.incStart || 0;
			var step = siteConf.incStep || 15;

			// promise job listing, page by page
			const iteratedPromise = pageIndex =>
				listingScraper.getListing(siteConf, searchQuery, pageIndex)
					.toPromise();

			if(siteConf.pageParam === false){
				listingScraper.getListing(siteConf, searchQuery, 0).toPromise()
					.then(handleSuccess(req, res), handleError(req, res));
			} else {
				// iteratively scrape, modify and concat the job listings
				promiseUtil.iterateUntilEmpty(start,step,iteratedPromise)
					.then(handleSuccess(req, res), handleError(req, res))
			}
		})

	}
