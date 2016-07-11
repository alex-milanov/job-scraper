'use strict'

const request = require('request');
// cheerio for jquery style html page parsing
const cheerio = require('cheerio');

const Rx = require('rx');
const $ = Rx.Observable;

const util = require('../util');

// denodified functions
const getRequest = url =>
	$.just(url)
		.map(util.term.log('url'))
		.flatMap(url =>
			$.fromCallback(request)(url)
				.map(r => r[1].body)
		);

const fieldParse = (field, Selector) =>
	(typeof field.chain[0] !== 'undefined')
		? util.obj.chainMethodCall(Selector(field.selector), [].concat(field.chain))
		: '';

const getJobsListHTML = (conf, query, start) =>
	(typeof query !== 'undefined')
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
						title: util.obj.chainMethodCall(Selector(el), [].concat(conf.list.title)),
						link: util.obj.chainMethodCall(Selector(el), [].concat(conf.list.link))
					})).get()
				: []
		);

const getJobFields = (fields, job, data) =>
	$.just(cheerio.load(data))
		.map(Selector =>
			Object.keys(fields)
				.filter(k => fields[k].type === 'jquery')
				.reduce(
					(job, k) => util.obj.assignKeyValue(job, k, fieldParse(fields[k], Selector)),
					job
				)
		)

const getJobInfo = (conf, jobsList) =>
	// case 1 - http(s)://site-base-url/job/link
	// case 2 - http(s)://another-site/job/link
	// case 3 - no http - /job/link or job/link
	$.concat(jobsList.map(job =>
		$.just(job.link.split(/^((https?)\:\/\/([a-z\.]+))?\/?([a-z0-9\/\.\-\_]+(\.html?)?)/gi))
			.map(m => ({
				baseUrl: (typeof m[1] !== "undefined") ? m[3] : conf.baseUrl,
				protocol: (typeof m[2] !== "undefined") ? m[2] : conf.protocol,
				linkPath: m[4]
			}))
			.map(u => `${u.protocol}://${u.baseUrl}/${u.linkPath}`)
			.flatMap(url =>
				getRequest(url)
					.flatMap(data =>
						getJobFields(conf.fields, Object.assign({}, job, {link: url}), data)
					)
			)
		)
	).reduce((list, job) => [].concat(list, [job]), []);

const getListing = (conf, query, start) =>
	getJobsListHTML(conf, query, start)
		.flatMap(data => getJobsList(conf, data))
		.map(util.term.log('jobList'))
		.flatMap(jobsList => getJobInfo(conf, jobsList))


exports.getListing = getListing;
