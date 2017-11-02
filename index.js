'use strict';

// Utils
const { logError } = require('./utils/log');

/**
 * @type {Telegraf}
 * Bot
 */
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
});

bot.use(
	require('./handlers/middlewares'),
	require('./handlers/messages'),
	require('./plugins'),
	require('./handlers/commands'),
);


bot.catch(logError);

bot.startPolling();
