'use strict'

const removeChildren = parent => {
  while (parent.firstChild) parent.removeChild(parent.firstChild)
};

const htmlTags = [
		"div","span","p","ul","li","a","img",
		"table","tbody","tr","td","thead","th","tfoot",
		"form","input","select","button","textarea","label",
		"header","section","canvas"
	];

const select = selector =>
  (typeof selector === 'object')
    ? (selector instanceof HTMLElement)
      ? selector
      : null
    : (typeof selector === 'string')
      ? (htmlTags.indexOf(selector) > -1)
        ? document.createElement(selector)
        : document.querySelector(selector) || null
      : null;

const showJobs = (result) => {
 	var jobsListing = select('ul#jobsListing');
 	if(result.total > 0){
    jobsListing.opacity = 0;
 		removeChildren(jobsListing);
 		result.listing.forEach(function(jobData){
 			var jobLi = select('li');
      jobsListing.appendChild(jobLi);
      jobLi.classList.add('jobBody','list-group-item');

 			var toggleInfo = select('button');
      toggleInfo.classList.add('btn', 'btn-default', 'btn-xs', 'pull-right', 'fa', 'fa-info');
      toggleInfo.textContent = 'More Info';

      if(jobData.info){
 				jobLi.appendChild(toggleInfo);
 			}

      var jobLink = select('a');
      jobLink.classList.add('jobLink', 'list-group-item-heading');
      jobLink.setAttribute('target', '_blank');
      jobLink.setAttribute('href', jobData.link);
      jobLink.textContent = jobData.title;

      jobLi.appendChild(jobLink);

      if(jobData.salary && jobData.salary != '') {
        var jobSalary = select('div');
        jobSalary.classList.add('jobSalary');
        jobSalary.textContent = 'salary:'+jobData.salary
        jobLi.appendChild(jobSalary);
 			}

 			if(jobData.info) {
 				var jobInfo = select('div');
 				jobLi.appendChild(jobInfo);
        jobInfo.classList.add('jobInfo','list-group-item-text')
        jobInfo.textContent = jobData.info;
        var jobInfoHeight = jobInfo.offsetHeight;
        jobInfo.style.height = 0;
 				toggleInfo.addEventListener('click', ev => {
          // console.log(
          //   jobLink.textContent,
          //   jobInfoHeight,
          //   jobInfo.style.height,
          //   (jobInfo.style.height == '0px'),
          //   (jobInfo.style.height == jobInfoHeight+'px')
          // );
          if(jobInfo.style.height == '0px') jobInfo.style.height = jobInfoHeight+'px';
          else if(jobInfo.style.height == jobInfoHeight+'px') jobInfo.style.height = 0;
          else return false;
        })
 			}

 		});
    jobsListing.opacity = 1;
 	}
};

export default {
  showJobs
};
