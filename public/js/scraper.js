'use strict'

 function showJobs(result){
 	var jobsListing = $('ul#jobsListing');
 	if(result.total > 0){
 		jobsListing.html('');
 		result.listing.forEach(function(jobData){
 			var jobLi = $('<li></li>').addClass('jobBody list-group-item');
 			var toggleInfo = $('<button class="btn btn-default btn-xs pull-right"><i class="fa fa-info">&nbsp; More Info</i></button>');
 			if(jobData.info){
 				jobLi.append(toggleInfo);
 			}
 			jobLi.append(
 				$('<a class="jobLink list-group-item-heading" target="_blank"></a>')
 					.attr('href',jobData.link)
 					.text(jobData.title)
 			);
 			if(jobData.salary && jobData.salary != '') {
 				jobLi.append($('<div class="jobSalary"></div>').html('salary:'+jobData.salary));
 			}
 			if(jobData.info) {
 				var jobInfo = $('<div class="jobInfo list-group-item-text"></div>').html(jobData.info).hide();
 				toggleInfo.click(function(){
 					jobInfo.slideToggle();
 				})
 				jobLi.append(jobInfo);
 			}

 			jobLi.appendTo(jobsListing);
 		});
 	}
 }