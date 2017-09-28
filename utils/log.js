'use strict';

const { inspect } = require('util');

const logError = err => console.error(err);

const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

module.exports = {
	logError,
	print
};
