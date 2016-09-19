'use strict';

const $ = require('rx').Observable;
const superagent = require('superagent');

superagent.Request.prototype.observe = function() {
	return $.fromNodeCallback(this.end, this)();
};

module.exports = superagent;
