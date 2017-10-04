'use strict';

const { inspect } = require('util');

/**
 * @param {Error} err
 * Logs errors to console
 */
const logError = err => console.error(err);

/**
 * @param {Object} value
 * Echos the value of a value.
 */
const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

module.exports = {
	logError,
	print
};
