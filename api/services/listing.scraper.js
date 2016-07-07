'use strict'

const request = require('request');
// cheerio for jquery style html page parsing
const cheerio = require('cheerio');

const Rx = require('rx-lite');
const $ = Rx.Observable;

// util functions
const assignKeyValue = (o, k, v) => {
	o[k] = v;
	return o;
};

const log = msg => data => {
	console.log(msg, data);
	return data;
}

// denodified functions
const getRequest = url =>
	$.fromCallback(request)(url)
		.map(r => r[1].body);

// parsers
const chainParse = (chain, el) => chain.reduce(
		(el, link) => (typeof link[1] !== 'undefined')
			? el[link[0]](link[1])
			: el[link[0]](),
		el
);

const jqueryParse = (field, Selector) =>
	(typeof field.chain[0] !== 'undefined')
		? chainParse([].concat(field.chain), Selector(field.selector))
		: '';

const getJobsListHTML = (conf, query, start) =>
	(query)
		? getRequest(
				`${conf.protocol}://${conf.baseUrl}` +
				`${conf.listingPath}?${conf.queryParam}=${query}` +
				((conf.pageParam && start)
					? `&${conf.pageParam}=${start}`
					: '')
			)
		: $.throw(new Error('no query sent'));

const getJobsList = (conf, jobsListHTML) =>
	$.just(cheerio.load(jobsListHTML))
		.map(Selector =>
			(conf.list)
				? Selector(conf.list.selector)
					.map((i, el) => ({
						title: chainParse([].concat(conf.list.title), Selector(el)),
						link: chainParse([].concat(conf.list.link), Selector(el))
					})).get()
				: []
		);

const getJobFields = (fields, job, data) =>
	$.just(cheerio.load(data))
		.map(Selector =>
			Object.keys(fields)
				.filter(k => fields[k].type === 'jquery')
				.reduce(
					(job, k) => assignKeyValue(job, k, jqueryParse(fields[k], Selector)),
					job
				)
		)

const getJobInfo = (conf, jobsList) =>
	$.concat(
		jobsList.map(job => {
			// case 1 - http(s)://site-base-url/job/link
			// case 2 - http(s)://another-site/job/link
			// case 3 - no http - /job/link or job/link
			var matches = job.link.split(/^((https?)\:\/\/([a-z\.]+))?\/?([a-z0-9\/\.\-\_]+(\.html?)?)/gi);

			var baseUrl = (typeof matches[1] !== "undefined") ? matches[3] : conf.baseUrl;
			//baseUrl = baseUrl.replace('www.','');
			var protocol = (typeof matches[2] !== "undefined") ? matches[2] : conf.protocol;

			var url = protocol+'://'+baseUrl+'/'+matches[4];

			var fields = conf.fields;

			return getRequest(url)
				.flatMap(data => getJobFields(fields, job, data));
		})
	).scan((list, job) => [].concat(list, [job]), []);

const getListing = (conf, query, start) =>
	getJobsListHTML(conf, query, start)
		.flatMap(data => getJobsList(conf, data))
		.map(log('jobList'))
		.flatMap(jobsList => getJobInfo(conf, jobsList))
		.map(log('jobInfo'));


exports.getListing = getListing;
