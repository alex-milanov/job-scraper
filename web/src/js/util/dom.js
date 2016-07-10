'use strict';

import pug from 'pug';

const listToArray = data => Array.prototype.slice.call(data);

const clear = parent => {
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

const create = (code, options) => {
  const tc = document.createElement('div');
  tc.innerHTML = pug.render(code, options);
  const el = tc.firstChild;
  tc.removeChild(el);
  return el
};

const on = (el, eventName, selector, cb) =>
  el.addEventListener(eventName, ev =>
    (typeof selector === 'string' && typeof cb !== 'undefined')
      ? (listToArray(el.querySelectorAll(selector)).indexOf(ev.target) > -1)
        ? cb(ev)
        : false
      : (cb = selector) && cb(ev)
  );

const get = (el, attr, defaultValue) => el.getAttribute(attr) || defaultValue;
const set = (el, attr, value) => el.setAttribute(attr, value);

module.exports = {
  listToArray,
  clear,
  select,
  create,
  on,
  get,
  set
};
