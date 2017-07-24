'use strict';

const logError = err =>
	console.error(`${err.name}: ${err.message}`);

const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

module.exports = {
	logError,
	print
};