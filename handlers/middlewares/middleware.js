'use strict';

// Utils
const { link } = require('../../utils/tg');
const { print, logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { isBanned } = require('../../stores/user');

const middlewareHandler = async ({ chat, from, message, reply }, next) => {
	process.env.NODE_ENV === 'development' && message && print(message);
	if (
		message &&
		message.text &&
		message.text[0] === '/' &&
		message.text[1].match(/\w/) &&
		chat.type !== 'private'
	) {
		try {
			await bot.telegram.deleteMessage(chat.id, message.message_id);
		} catch (err) {
			logError(err);
		}
	}
	const banned = await isBanned(from);
	if (banned) {
		return bot.telegram.kickChatMember(chat.id, from.id)
			.then(() => reply(
				`🚫 ${link(from)} <b>is banned</b>!\n\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError)
			.then(next);
	}
	return next();
};

module.exports = middlewareHandler;
