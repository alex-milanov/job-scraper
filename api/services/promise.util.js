'use strict'

	// iterates a promise with a step param whereby concatinating all the results until empty

	const iterateUntilEmpty = (index, step, iteratedPromise) =>
		iteratedPromise(index)
			.then(result => (result.length == 0 )
				? [] // if empty stop iterating
				: iterateUntilEmpty(index + step, step, iteratedPromise) // perform next iteration
					.then(nextResult => [].concat(result, nextResult))
			);

	module.exports = {
		iterateUntilEmpty
	};
