'use strict'

import jQuery from 'jquery';

const showJobs = (result) => {
 	var jobsListing = jQuery('ul#jobsListing');
 	if(result.total > 0){
 		jobsListing.html('');
 		result.listing.forEach(function(jobData){
 			var jobLi = jQuery('<li></li>').addClass('jobBody list-group-item');
 			var toggleInfo = jQuery('<button class="btn btn-default btn-xs pull-right"><i class="fa fa-info">&nbsp; More Info</i></button>');

      if(jobData.info){
 				jobLi.append(toggleInfo);
 			}

      jobLi.append(
 				jQuery('<a class="jobLink list-group-item-heading" target="_blank"></a>')
 					.attr('href',jobData.link)
 					.text(jobData.title)
 			);

      if(jobData.salary && jobData.salary != '') {
 				jobLi.append(jQuery('<div class="jobSalary"></div>').html('salary:'+jobData.salary));
 			}

 			if(jobData.info) {
 				var jobInfo = jQuery('<div class="jobInfo list-group-item-text"></div>').html(jobData.info).hide();
 				toggleInfo.click(function(){
 					jobInfo.slideToggle();
 				})
 				jobLi.append(jobInfo);
 			}

 			jobLi.appendTo(jobsListing);
 		});
 	}
};

export default {
  showJobs
};
