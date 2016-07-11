'use strict';

import dom from './dom';

import request from 'superagent';

const functionFromStr = functionName =>
	(window[functionName] && typeof window[functionName] === "function")
		? window[functionName]
		: false;

const links = selector => {
	const container = dom.select(selector);
	dom.on(container, 'click', 'a[method]', ev => {
		const el = ev.target;
		const method = dom.get(el, 'method', 'get').toLowerCase();
		const url = dom.get(el, 'href');
		const success = dom.get(el, 'success', window.location.href);

		request[method](url)
			.set('Accept', 'application/json')
			.end((err, res) => (err)
				? console.log(['failure', err])
				: (window.location.href = success) && console.log(['success', res])
			);

		ev.preventDefault();
	});
};

const form = selector => {
	const formEl = dom.select(selector);
	dom.on(formEl, 'submit', ev => {
		const data = dom.listToArray(ev.target.elements)
			.filter(el => dom.get(el, 'name') !== undefined)
			.reduce((o, el) => (o[dom.get(el, 'name')] = el.value) && o, {});

		const success = dom.get(formEl, 'success').split(',');
		const method = dom.get(formEl, 'method', 'get').toLowerCase();
		const url = dom.get(formEl, 'action');

		request[method](url)
			.query(data)
			.set('Accept', 'application/json')
			.end((err, res) => (err)
				? console.log(['failure', err])
				: (success[0] && success[0] === 'callback' && success[1])
					? functionFromStr(success[1])(res.body)
					: (window.location.href = success)
			);

		ev.preventDefault();

		// var success = jQuery(this).attr('success').split(',');
		// var method = jQuery(this).attr('method');
		// var url = jQuery(this).attr('action');
		// console.log([url,method,data]);
		// jQuery.ajax({
		// 	url: url,
		// 	type: method.toUpperCase(),
		// 	data: data,
    // 		dataType: 'json',
		// 	success: function(result) {
		// 		if(success[0] && success[0]=='callback' && success[1]){
		// 			var successFunc = functionFromStr(success[1]);
		// 			if(successFunc)
		// 				successFunc(result);
		// 		} else {
		// 			window.location.href=success;
		// 		}
		// 	},
		// 	error: function(error) {
		// 		console.log(['failure',error]);
		// 		window.location.href=window.location.href+'?msg+'+error;
		// 	}
		// });
	});
};

export default {
	functionFromStr,
	links,
	form
};
