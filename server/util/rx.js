'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const iterateUntilEmpty = (index, step, getIterated$) =>
		getIterated$(index)
			.flatMap(result => (result.length === 0)
				? $.just([]) // if empty stop iterating
				: iterateUntilEmpty(index + step, step, getIterated$) // perform next iteration
					.map(nextResult => [].concat(result, nextResult))
			);

module.exports = {
	iterateUntilEmpty
};
