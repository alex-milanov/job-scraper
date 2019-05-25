
"use strict";

const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
	title: String,
	info: String,
	link: {type: String, unique: true, required: true, dropDups: true},
	salary: String,
	baseUrl: String,
	dateScraped: {type: Date, default: Date.now},
	datePublished: Date
});

module.exports = mongoose.model('Job', jobSchema);
