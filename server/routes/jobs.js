'use strict';

const ObjectID = require('mongodb').ObjectID;

module.exports = (app, db) => {
	const Store = db.model('Job');
	app.route('/api/jobs')
		.get((req, res) => Store.find().then(
			data => res.jsonp({
				meta: {
					total: data.length
				},
				data
			}),
			err => res.jsonp(err)
		))
		// create document
		.post((req, res) => (new Store(req.body)).save()
			.then(
				() => res.jsonp({success: true}),
				err => res.jsonp(err)
		));

	app.param('jobId', (req, res, next, id) =>
		Store.findById(id).then(job => (Object.assign(req, {job}), next()), err => next(err))
	);
};
