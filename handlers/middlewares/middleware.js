'use strict';

// Utils
const { link } = require('../../utils/tg');
const { print, logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { addUser, isUser } = require('../../stores/user');
const { isBanned } = require('../../stores/user');

const middlewareHandler = async ({ chat, from, message, reply }, next) => {
	process.env.DEBUG === 'true' && message && print(message);
	if (message && message.from && !await isUser(message.from)) {
		try {
			await addUser(message.from);
		} catch (err) {
			logError(process.env.DEBUG)(err);
		}
	}
	if (
		message &&
		message.text &&
		message.text[0] === '/' &&
		message.text[1].match(/\w/)
	) {
		try {
			await bot.telegram.deleteMessage(chat.id, message.message_id);
		} catch (err) {
			logError(process.env.DEBUG)(err);
		}
	}
	const banned = await isBanned(from);
	if (banned) {
		return bot.telegram.kickChatMember(chat.id, from.id)
			.then(() => reply(
				`🚫 ${link(from)} <b>is banned</b>!\n\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError(process.env.DEBUG))
			.then(next);
	}
	return next();
};

module.exports = middlewareHandler;
