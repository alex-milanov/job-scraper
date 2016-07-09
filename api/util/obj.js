'use strict';

const assignKeyValue = (o, k, v) => (o[k] = v) && o;

const chainMethodCall = (o, chain) =>
	chain.reduce(
		(o, link) => (typeof link[1] !== 'undefined')
			? o[link[0]](link[1])
			: o[link[0]](),
		o
	);

module.exports = {
  assignKeyValue,
  chainMethodCall
};
