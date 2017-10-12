'use strict';

// Utils
const { print, logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');

// DB
const middlewareHandler = async ({ chat, message }, next) => {
	process.env.NODE_ENV === 'development' && message && print(message);
	if (
		message &&
		message.text &&
		message.entities[0].type !== 'code' &&
		/^\/\w+/.test(message.text) &&
		chat.type !== 'private'
	) {
		try {
			await bot.telegram.deleteMessage(chat.id, message.message_id);
		} catch (err) {
			logError(err);
		}
	}
	return next();
};

module.exports = middlewareHandler;
