'use strict';

// Utils
const { loadJSON } = require('../utils/json');
const { link } = require('../utils/tg');
const { logError } = require('../utils/log');

// Config
const { 
	excludedChannels,
	excludedGroups,
	numberOfWarnsToBan 
} = loadJSON('config.json');

// Bot
const bot = require('../bot');
const { replyOptions } = require('../bot/options');

// DB
const { warn } = require('../stores/warn');
const { ban } = require('../stores/bans');
const { isAdmin } = require('../stores/admins');

const messageHandler = async ({ message, chat, reply }) => {
	if (
		message.forward_from_chat &&
			message.forward_from_chat.type !== 'private' &&
			!excludedChannels.includes(message.forward_from_chat.username) ||
		message.text &&
			(message.text.includes('t.me') ||
			message.text.includes('telegram.me')) &&
			!(excludedChannels.includes(message.text) ||
			excludedGroups.includes(message.text.split('/joinchat/')[1]))
	) {
		const userToWarn = message.from;
		if (await isAdmin(userToWarn)) {
			return null;
		}
		const reason = 'Sent a message which was forwarded ' +
			'from other channels or included their link';
		const warnCount = await warn(userToWarn, reason);
		const promises = [
			bot.telegram.deleteMessage(chat.id, message.message_id)
		];
		if (warnCount < numberOfWarnsToBan) {
			promises.push(reply(
				`${link(userToWarn)} warned! (${warnCount}/3)\n` +
				`Reason: ${reason}`,
				replyOptions));
		} else {
			promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
			promises.push(ban(userToWarn,
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
