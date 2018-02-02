'use strict';

const { compose } = require('telegraf');

/* eslint-disable global-require */

module.exports = compose([
	require('./runCustomCmd'),
	require('./groupLinker'),
]);
