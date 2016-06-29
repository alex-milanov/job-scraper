
import scraper from './util/scraper';
import simpleRest from './util/simple-rest';

import jQuery from 'jquery';

window.showJobs = scraper.showJobs;

jQuery(document).ready(function(){
  simpleRest.resitifyForm('form.restify');
  simpleRest.resitifyLinks('#jobsListing');
});
