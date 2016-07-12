'use strict';

import dom from '../util/dom';

const showJobs = result => {
	var jobsListing = dom.select('ul#jobs-listing');
	if (result.total > 0) {
		jobsListing.opacity = 0;
		dom.clear(jobsListing);
		result.listing.forEach(function(jobData) {
			const jobLi = dom.create('li.job-body');
			jobsListing.appendChild(jobLi);

			const toggleInfo = dom.create('button.toggle-info: i.fa.fa-info');
			toggleInfo.appendChild(dom.create('span More Info'));

			if (jobData.info) jobLi.appendChild(toggleInfo);

			const jobLink = dom.create(
				`a.job-link(target='_blank',href='${jobData.link}').\n	${jobData.title}`
			);

			jobLi.appendChild(jobLink);

			if (jobData.salary && jobData.salary !== '') jobLi.appendChild(
				dom.create(`div.job-salary.\n	salary: ${jobData.salary}`)
			);

			if (jobData.info) {
				const jobInfo = dom.create('div.job-info');
				jobInfo.innerHTML = jobData.info;
				jobLi.appendChild(jobInfo);
				const jobInfoHeight = jobInfo.offsetHeight;
				jobInfo.style.height = 0;

				toggleInfo.addEventListener('click', ev => {
					if (jobInfo.style.height === '0px') {
						jobInfo.style.height = jobInfoHeight + 'px';
					} else if (jobInfo.style.height === jobInfoHeight + 'px') {
						jobInfo.style.height = 0;
					} else {
						return false;
					}
				});
			}
		});
		jobsListing.opacity = 1;
	}
};

export default {
	showJobs
};
