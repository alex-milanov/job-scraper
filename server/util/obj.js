'use strict';

const assignKeyValue = (o, k, v) => {
	if (typeof k === 'undefined' || typeof v === 'undefined') return o;
	o[k] = v;
	return o;
};

const chainMethodCall = (o, chain) => chain.reduce(
	(o, link) => (typeof link[1] === 'undefined')
		? o[link[0]]()
		: o[link[0]](link[1]),
	o
);

module.exports = {
	assignKeyValue,
	chainMethodCall
};
