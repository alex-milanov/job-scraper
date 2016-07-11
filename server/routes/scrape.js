	'use strict';

	var listingScraper = require('../services/listing.scraper');
	var util = require('../util');
	var sitesConf = require('../config/sites.json');

	const handleSuccess = (req, res) => listing =>
		res.jsonp({
			total: listing.length,
			listing: listing
		});

	const handleError = (req, res) => error =>
		res.jsonp({error});

	module.exports = function(app) {
		app.get('/api/scrape', function(req, res) {
			var searchQuery = req.query.q || '';
			var site = req.query.site || 'jobs.bg';

			var siteConf = sitesConf[site];
			var start = siteConf.incStart || 0;
			var step = siteConf.incStep || 15;

			// iterate job listing, page by page
			const getIterated$ = pageIndex =>
				listingScraper.getListing(siteConf, searchQuery, pageIndex);

			if (siteConf.pageParam === false) {
				listingScraper.getListing(siteConf, searchQuery, 0)
					.subscribe(
						handleSuccess(req, res),
						handleError(req, res)
					);
			} else {
				// iteratively scrape, modify and concat the job listings
				util.rx.iterateUntilEmpty(start, step, getIterated$)
					.subscribe(
						handleSuccess(req, res),
						handleError(req, res)
					);
			}
		});
	};
