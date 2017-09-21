'use strict';

// Utils
const { link } = require('../utils/tg');
const { logError } = require('../utils/log');

// Bot
const bot = require('../bot');
const { replyOptions } = require('../bot/options');

// DB
const Warn = require('../stores/warn');
const bans = require('../stores/bans');
const admins = require('../stores/admins');

const messageHandler = async ({ message, chat, reply }) => {
	if (
		message.forward_from_chat &&
		message.forward_from_chat.type !== 'private' &&
		message.forward_from_chat.username !== 'thedevs'
	) {
		const userToWarn = message.from;
		if (await admins.isAdmin(userToWarn)) {
			return null;
		}
		const reason = 'Forward from ' +
			message.forward_from_chat.type +
			': ' + link(message.forward_from_chat);
		const warnCount = await Warn.warn(userToWarn, reason);
		const promises = [
			bot.telegram.deleteMessage(chat.id, message.message_id)
		];
		if (warnCount < 3) {
			promises.push(reply(
				`${link(userToWarn)} warned! (${warnCount}/3)\n` +
				`Reason: ${reason}`,
				replyOptions));
		} else {
			promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
			promises.push(bans.ban(userToWarn,
				'Reached max number of warnings'));
			promises.push(reply(
				`${link(userToWarn)} <b>banned</b>! (${warnCount}/3)\n` +
				'Reason: Reached max number of warnings',
				replyOptions));
		}
		return Promise.all(promises).catch(logError(process.env.DEBUG));
	}
	return null;
};

module.exports = messageHandler;
