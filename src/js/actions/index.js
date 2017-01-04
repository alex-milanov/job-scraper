'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const {Subject} = Rx;

const request = require('iblokz/adapters/request');

const initial = {
	site: 'jobs.bg',
	jobs: []
};

const getJobs = query => request.get('/api/scrape')
	.query(query)
	.set('Retry-After', 3600)
	.set('Accept', 'application/json')
	.observe()
	.map(res => res.body.data)
	.map(jobs => jobs.map((job, index) => Object.assign({}, job, {index, toggled: false})))
	.map(jobs => state => Object.assign({}, state, {jobs}));

const toggle = index => state =>
	Object.assign({}, state, {
		jobs: state.jobs.map(job => (job.index === parseInt(index, 10))
			? Object.assign({}, job, {toggled: !job.toggled})
			: job
		)
	});

const filter = filter => state => Object.assign({}, state, {filter});

const toggleSalary = () => state =>
	Object.assign({}, state, {salary: !state.salary});

module.exports = {
	initial,
	getJobs,
	toggle,
	filter,
	toggleSalary
};
