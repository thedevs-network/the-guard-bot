'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { isBanned } = require('../../stores/user');

const kickbanned = async ({ chat, from, reply }, next) => {
	const banned = await isBanned(from);
	if (banned) {
		return bot.telegram.kickChatMember(chat.id, from.id)
			.then(() => reply(
				`🚫 ${link(from)} <b>is banned</b>!\n\n` +
				`Reason: ${banned}`,
				replyOptions
			))
			.catch(logError)
			.then(next);
	}
	return next();
};

module.exports = kickbanned;
