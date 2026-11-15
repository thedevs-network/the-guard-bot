// @ts-check
'use strict';

/* eslint-disable no-console */

const { inspect } = require('util');

const logError = err => console.error(err);

const logFatalError = err => {
	logError(err);
	// Flush the error before terminating
	process.stderr.write('', () => {
		// eslint-disable-next-line no-process-exit
		process.exit(1);
	});
};

const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

module.exports = {
	logError,
	logFatalError,
	print,
};
