'use strict';

const { inspect } = require('util');

const logError = log => err =>
	log && console.error(`${err.name}: ${err.message}`);

const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

module.exports = {
	logError,
	print
};