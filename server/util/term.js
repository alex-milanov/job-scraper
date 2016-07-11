'use strict';

const log = msg => data => {
	console.log(msg, data);
	return data;
};

module.exports = {
	log
};
