'use strict';

const { compose, hears } = require('telegraf');

/* eslint-disable global-require */

module.exports = compose([
	hears(/^(?:!report|[@!]admins?)\b/i, require('../commands/report')),
	require('./runCustomCmd'),
	require('./groupLinker'),
]);
