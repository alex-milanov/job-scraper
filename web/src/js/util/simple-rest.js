'use strict'

import jQuery from 'jquery';

const functionFromStr = functionName => {
	if (window[functionName] && typeof window[functionName] == "function") {
		return window[functionName];
	} else {
		return false;
	}
};

const resitifyLinks = container => {
	jQuery(container).on('click', 'a[method]', function(event){
		var method = jQuery(this).attr('method');
		var url = jQuery(this).attr('href');
		var success = jQuery(this).attr('success') || window.location.href;
		jQuery.ajax({
			url: url,
			type: method.toUpperCase(),
			success: function(result) {
				console.log(['success',result]);
				window.location.href=success;
			},
			error: function(error) {
				console.log(['failure',error]);
			}
		});
		event.preventDefault();
	})
};

const resitifyForm = container => {
	jQuery(container).submit(function(event){
		var map = jQuery.map(jQuery(this).serializeArray(),function(v) { var n = {}; n[v.name] = v.value; return n;});

		var data = {};

		map.forEach(function(formEl){
			for(var key in formEl){
				data[key] = formEl[key];
			}
		});
		var success = jQuery(this).attr('success').split(',');
		var method = jQuery(this).attr('method');
		var url = jQuery(this).attr('action');
		console.log([url,method,data]);
		jQuery.ajax({
			url: url,
			type: method.toUpperCase(),
			data: data,
    		dataType: 'json',
			success: function(result) {
				if(success[0] && success[0]=='callback' && success[1]){
					var successFunc = functionFromStr(success[1]);
					if(successFunc)
						successFunc(result);
				} else {
					window.location.href=success;
				}
			},
			error: function(error) {
				console.log(['failure',error]);
				window.location.href=window.location.href+'?msg+'+error;
			}
		});
		event.preventDefault();
	});
};

export default {
	functionFromStr,
	resitifyLinks,
	resitifyForm
};
