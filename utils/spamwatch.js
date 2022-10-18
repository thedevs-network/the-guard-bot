// @ts-check
'use strict';

const { Client } = require('spamwatch');

const { config } = require('./config');

// eslint-disable-next-line func-names
exports.shouldKick = (function () {
	if (!config.spamwatch) {
		return () => false;
	}

	const client = new Client(config.spamwatch.token, config.spamwatch.host);
	return ({ id }) => client.getBan(id);
}());
