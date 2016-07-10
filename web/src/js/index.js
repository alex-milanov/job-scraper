
import scraper from './services/scraper';
import domRestify from './util/dom-restify';

window.showJobs = scraper.showJobs;

domRestify.form('form.restify');
domRestify.links('#jobs-listing');
