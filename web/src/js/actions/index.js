'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const {Subject} = Rx;

const request = require('../util/request');

const stream = new Subject();

const init = () => stream.onNext(state => ({
	site: 'jobs.bg',
	jobs: []
}));

const getJobs = query => request.get('/api/scrape')
	.query(query)
	.set('Accept', 'application/json')
	.observe()
	.map(res => res.body.data)
	.map(jobs => jobs.map((job, index) => Object.assign({}, job, {index, toggled: false})))
	.subscribe(jobs => stream.onNext(state => Object.assign({}, state, {jobs})));

const toggle = index => stream.onNext(state =>
	Object.assign({}, state, {
		jobs: state.jobs.map(job => (job.index === parseInt(index, 10))
			? Object.assign({}, job, {toggled: !job.toggled})
			: job
		)
	})
);

const filter = filter => stream.onNext(state => Object.assign({}, state, {filter}));

const toggleSalary = () => stream.onNext(state =>
	Object.assign({}, state, {salary: !state.salary})
);

module.exports = {
	stream,
	init,
	getJobs,
	toggle,
	filter,
	toggleSalary
};
