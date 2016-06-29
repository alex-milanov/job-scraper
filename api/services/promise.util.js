'use strict'

	// iterates a promise with a step param whereby concatinating all the results until empty
	
	var iterateUntilEmpty = function(index, step, iteratedPromise){
		return iteratedPromise(index).then(function(result){
			
			if(result.length == 0 ){
				// if empty stop iterating
				return [];
			} else {
				// perform next iteration
				index = index + step;
				return iterateUntilEmpty(index, step, iteratedPromise).then(function(nextResult){

					// concat the result from the next iteration 
					result = result.concat(nextResult);

					return result;
				})
			}
		});
	}

	exports.iterateUntilEmpty = iterateUntilEmpty;
