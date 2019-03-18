'use strict';

process.chdir(__dirname);

// Utils
const { logError } = require('./utils/log');

/**
 * @type {Telegraf}
 * Bot
 */
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
	bot.context.botInfo = botInfo;
}).then(() => {
	bot.startPolling();
});

bot.use(
	require('./handlers/middlewares'),
	require('./handlers/messages'),
	require('./plugins'),
	require('./handlers/commands'),
	require('./handlers/regex'),
	require('./handlers/unmatched'),
);


bot.catch(logError);
