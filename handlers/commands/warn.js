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
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	const messageToWarn = message.reply_to_message;
	const userToWarn = messageToWarn.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to warn.</b>', replyOptions);
	}

	if (await isAdmin(userToWarn)) {
		return reply('ℹ️ <b>Can\'t warn other admins.</b>', replyOptions);
	}

	const warnCount = await warn(userToWarn, reason);
	const promises = [
		bot.telegram.deleteMessage(chat.id, messageToWarn.message_id),
		bot.telegram.deleteMessage(chat.id, message.message_id)
	];

	if (warnCount < numberOfWarnsToBan) {
		promises.push(reply(
			`⚠️ ${link(userToWarn)} <b>got warned!</b> (${warnCount}/3)\n\n` +
			`Reason: ${reason}`,
			replyOptions));
	} else {
		promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
		promises.push(ban(userToWarn, 'Reached max number of warnings'));
		promises.push(reply(
			`🚫 ${link(userToWarn)} <b>got banned!</b> (${warnCount}/3)\n\n` +
			'Reason: Reached max number of warnings',
			replyOptions));
	}

	return Promise.all(promises).catch(logError(process.env.DEBUG));
};

module.exports = warnHandler;
