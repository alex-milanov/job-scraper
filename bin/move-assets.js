'use strict';

const fse = require('fs-extra');
const path = require('path');

const paths = {
  'web/dist/fonts': 'node_modules/font-awesome/fonts',
  'web/dist/css/bootstrap.min.css': 'node_modules/bootstrap/dist/css/bootstrap.min.css'
};

Object.keys(paths).forEach(
  p => fse.copySync(
    path.resolve(__dirname, '..', paths[p]),
    path.resolve(__dirname, '..', p)
  )
);
