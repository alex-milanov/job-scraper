'use strict';

const {
	section, header, div, span, h1, i, ul, li, a,
	form, label, input, button, select, option
} = require('iblokz/adapters/vdom');

const moment = require('moment');
// require('moment/locale/bg');

const formToData = form => Array.prototype.slice.call(form.elements)
	// .map(el => (console.log(el.name), el))
	.filter(el => el.name !== undefined)
	.reduce((o, el) => ((o[el.name] = el.value), o), {});

const sites = [
	{
		name: 'Jobs.bg',
		uri: 'jobs.bg'
	},
	// {
	// 	name: 'JobTiger.bg',
	// 	uri: 'jobtiger.bg'
	// },
	{
		name: 'WeWorkRemotely.com',
		uri: 'weworkremotely.com'
	},
	{
		name: 'RemoteOK.io',
		uri: 'remoteok.io'
	}
];

module.exports = ({state, actions}) => section('#ui', [
	header([
		h1('Job Scraper'),
		form('.search', [
			label('keywords:'),
			input({props: {type: 'text', name: 'q'}}),
			select({
				props: {name: 'site'},
				on: {change: ev => actions.selectSite(ev.target.value)}
			}, [{uri: null, name: 'All'}].concat(sites).map(site =>
				option({
					attrs: {
						value: site.uri,
						selected: (state.site === site.uri)
					}
				}, site.name)
			))
		]),
		form('.filter', [
			label('filter:'),
			input({
				props: {type: 'text', name: 'filter'},
				on: {input: ev => actions.filter(ev.target.value)}
			}),
			input({
				props: {type: 'checkbox', name: 'salary'},
				on: {click: ev => actions.toggleSalary()}
			}),
			span('salary')
		]),
		button('.btn-search', {on: {
			click: ev => actions.getJobs(formToData(document.querySelector('.search')))
		}}, [
			i('.fa.fa-search'),
			'Search'
		])
	]),
	section('#content', [
		ul('#jobs-listing',
			state.jobs
				.sort((a, b) => -(moment(a.date).toDate() - moment(b.date).toDate()))
				.filter(job => state.site
					? job.baseUrl.match(state.site)
					: true)
				.filter(job => state.filter
					? job.title.match(state.filter) || job.info.match(state.filter)
					: true)
				.filter(job => state.salary
					? job.salary !== ''
					: true)
				.map(job =>
					li('.job-body', [
						button('.toggle-info',
							{on: {click: () => actions.toggle(job.index)}},
							[i('.fa.fa-info'), 'More Info']
						),
						a('.job-link', {props: {target: '_blank', href: job.link}},
							[moment(job.date).format('D MMM'), job.company, job.title].join(' ')
						),
						(job.salary) ? div('.job-salary', job.salary) : '',
						div('.job-info', {
							props: {innerHTML: job.info},
							class: {toggled: (job.toggled === true)}
						})
					])
				))
	])
]);
