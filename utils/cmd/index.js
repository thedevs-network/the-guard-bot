'use strict';

module.exports = {
	...require('./parse'), // eslint-disable-line global-require
	...require('./stringify'), // eslint-disable-line global-require
	...require('./substom'), // eslint-disable-line global-require
};
