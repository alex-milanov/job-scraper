'use strict'

var functionFromStr = function(functionName){
	if (window[functionName] && typeof window[functionName] == "function") {
		return window[functionName];
	} else {
		return false;
	}
}


$(document).ready(function(){
	$('a[method]').click(function(event){
		var method = $(this).attr('method');
		var url = $(this).attr('href');
		var success = $(this).attr('success') || window.location.href;
		$.ajax({
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

	$('form.restify').submit(function(event){
		var map = $.map($(this).serializeArray(),function(v) { var n = {}; n[v.name] = v.value; return n;});
		
		var data = {};

		map.forEach(function(formEl){
			for(var key in formEl){
				data[key] = formEl[key];
			}
		});
		var success = $(this).attr('success').split(',');
		var method = $(this).attr('method');
		var url = $(this).attr('action');
		console.log([url,method,data]);
		$.ajax({
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
	})
})