// @ts-check
'use strict';

process.chdir(__dirname);
require('ts-node').register({ transpileOnly: true });

const fetch = require('node-fetch').default;

const { config, botStartTime } = require('./utils/config');

// Utils
const { logError } = require('./utils/log');
const { panic, throwError } = require('./utils/errors');

const bot = require('./bot');

bot.use(
	require('./handlers/middlewares'),
	require('./plugins'),
	require('./handlers/commands'),
	require('./handlers/regex'),
	require('./handlers/unmatched'),
);

bot.catch(logError);

fetch(`https://api.telegram.org/bot${config.token}/getMe`)
	.then((res) => res.headers.get('date'))
	.then(date => date
		? botStartTime.set(new Date(date))
		: throwError('Did not receive date header from Telegram on getMe'))
	.then(() => bot.launch())
	.catch((e) => panic(e, 'Could not launch bot; this is a fatal error.'));
