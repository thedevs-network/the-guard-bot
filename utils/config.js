// @ts-check
'use strict';

/** @type { import('../typings/config').Config } */
// @ts-ignore
const config = require('../config');
const eq = require('./eq');

const stringOrNumber = x => [ 'string', 'number' ].includes(typeof x);

// @ts-ignore
const masters = [].concat(config.master);

if (!masters.every(x => stringOrNumber(x) && /^@?\w+$/.test(x))) {
	throw new Error('Invalid value for `master` in config file: ' +
		config.master);
}

const isMaster = user =>
	user && masters.some(x =>
		user.id === Number(x) ||
		user.username && eq.username(user.username, String(x)));

module.exports = {
	config,
	isMaster,
};
