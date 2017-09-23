'use strict';

// Utils
const { loadJSON } = require('../../utils/json');
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const { numberOfWarnsToBan } = loadJSON('config.json');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { warn } = require('../../stores/warn');
const { ban } = require('../../stores/ban');
const { isAdmin } = require('../../stores/admin');

const warnHandler = async ({ message, chat, reply }) => {
	if (!await isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const messageToWarn = message.reply_to_message;
	const userToWarn = messageToWarn.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('Need a reason to warn');
	}

	if (await isAdmin(userToWarn)) {
		return reply('Can\'t warn other admin');
	}

	const warnCount = await warn(userToWarn, reason);
	const promises = [
		bot.telegram.deleteMessage(chat.id, messageToWarn.message_id),
		bot.telegram.deleteMessage(chat.id, message.message_id)
	];

	if (warnCount < numberOfWarnsToBan) {
		promises.push(reply(
			`${link(userToWarn)} <b>got warned!</b> (${warnCount}/3)\n\n` +
			`Reason: ${reason}`,
			replyOptions));
	} else {
		promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
		promises.push(ban(userToWarn, 'Reached max number of warnings'));
		promises.push(reply(
			`${link(userToWarn)} <b>banned</b>! (${warnCount}/3)\n` +
			'Reason: Reached max number of warnings',
			replyOptions));
	}

	return Promise.all(promises).catch(logError(process.env.DEBUG));
};

module.exports = warnHandler;
