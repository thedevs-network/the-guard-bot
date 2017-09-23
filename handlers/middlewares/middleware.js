'use strict';

// Utils
const { link } = require('../../utils/tg');
const { print, logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { addUser, isUser } = require('../../stores/user');
const { isBanned } = require('../../stores/ban');

const middlewareHandler = async ({ chat, from, message, reply }, next) => {
	process.env.DEBUG === 'true' && message && print(message);
	if (message && message.from && !await isUser(message.from)) {
		await addUser(message.from);
	}
	if (
		message &&
		message.text &&
		message.text[0] === '/' &&
		message.text[1].match(/\w/)
	) {
		await bot.telegram.deleteMessage(chat.id, message.message_id);
	}
	const banned = await isBanned(from);
	if (banned) {
		return bot.telegram.kickChatMember(chat.id, from.id)
			.then(() => reply(
				`${link(from)} <b>banned</b>!\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError(process.env.DEBUG))
			.then(next);
	}
	return next();
};

module.exports = middlewareHandler;
