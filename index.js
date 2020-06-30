// @ts-check
'use strict';

process.chdir(__dirname);
require('ts-node').register({ transpileOnly: true });

const { telegrafThrottler } = require('telegraf-throttler');

// Utils
const { logError } = require('./utils/log');

const bot = require('./bot');

bot.use(
	telegrafThrottler(),
	require('./handlers/middlewares'),
	require('./plugins'),
	require('./handlers/commands'),
	require('./handlers/regex'),
	require('./handlers/unmatched'),
);

bot.catch(logError);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch();
