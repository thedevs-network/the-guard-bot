'use strict';

const R = require('ramda');

module.exports = R.map(R.eqBy, require('./normalize'));
