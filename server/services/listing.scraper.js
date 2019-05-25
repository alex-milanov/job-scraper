'use strict';

const request = require('request');
// cheerio for jquery style html page parsing
const cheerio = require('cheerio');
const unfluff = require('unfluff');

const Rx = require('rx');
const $ = Rx.Observable;
const moment = require('moment');
// require('moment/locale/bg');

const util = require('../util');
const obj = require('iblokz/common/obj');

const parseDate = (dateStr, format) => {
	let today = moment();
	let baseDate = moment(dateStr, format);
	return (((today.get('year') - baseDate.get('year')) > 2)
		? (today.get('month') < 6 && baseDate.get('month') > 9)
			? baseDate.set('year', today.get('year') - 1)
			: baseDate.set('year', today.get('year'))
		: baseDate).format();
};

// denodified functions
const getRequest = url =>
	util.term.log('url')(url)
	&& $.fromCallback(request)(url).map(r => r[1].body);

const fieldParse = (field, selector) => field.chain[0]
	&& obj.chainCall(selector(field.selector), [].concat(field.chain))
	|| '';

const getJobsListHTML = (conf, query, start) => query
	&& getRequest(
			`${conf.protocol}://${conf.baseUrl}` +
			`${conf.listingPath}`.replace('%query%', query) +
			((conf.pageParam && start)
				? `&${conf.pageParam}=${start}`
				: '')
		)
	|| $.throw(new Error('no query sent'));

const getJobsList = (conf, jobsListHTML) =>
	$.just(cheerio.load(jobsListHTML))
		.map(selector => (conf.list)
			? selector(conf.list.selector)
				.map((i, el) => ({
					title: obj.chainCall(selector(el), [].concat(conf.list.title)),
					link: obj.chainCall(selector(el), [].concat(conf.list.link)),
					date: conf.list.date
						? obj.chainCall(selector(el), [].concat(conf.list.date))
						: undefined
				})).get()
			: []
		);

const getJobFields = (fields, job, data) =>
	$.just(cheerio.load(data))
		.map(selector => Object.keys(fields)
			.filter(k => fields[k].type === 'jquery')
			.reduce((job, k) => {
				job[k] = fieldParse(fields[k], selector);
				if (job[k] === '' && fields[k]['backup'] === 'unfluff') {
					job[k] = unfluff(data).text;
				}
				return job;
			}, job)
		);

const urlRegExp = /^((https?):\/\/([a-z\.]+))?\/?([a-z0-9\/\.\-_]+(\.html?)?)/gi;

const getJobInfo = (conf, jobsList) =>
	// case 1 - http(s)://site-base-url/job/link
	// case 2 - http(s)://another-site/job/link
	// case 3 - no http - /job/link or job/link
	$.concat(jobsList.map(job =>
		$.just(job.link.split(urlRegExp))
			.map(m => ({
				baseUrl: (typeof m[1] === "undefined") ? conf.baseUrl : m[3],
				protocol: (typeof m[2] === "undefined") ? conf.protocol : m[2],
				linkPath: m[4]
			}))
			.map(u => `${u.protocol}://${u.baseUrl}/${u.linkPath}`)
			.flatMap(url => getRequest(url)
				.flatMap(data =>
					getJobFields(
						conf.fields,
						Object.assign({}, job, {link: url, baseUrl: conf.baseUrl}),
						data
					)
				)
			)
		)
	).reduce((list, job) => [].concat(list, [job]), []);

const getListing = (conf, query, start) =>
	getJobsListHTML(conf, query, start)
		.flatMap(data => getJobsList(conf, data))
		.map(util.term.log('jobList'))
		.flatMap(jobsList => getJobInfo(conf, jobsList))
		.map(list =>
			list.map(item => item.date
				? Object.assign({}, item, {date: parseDate(item.date, conf.dateFormat)})
				: item)
		);

exports.getListing = getListing;
