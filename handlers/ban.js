'use strict';

// Utils
const { link } = require('../utils/tg');

// Bot
const bot = require('../bot');
const { replyOptions } = require('../bot/options');

// DB
const { isBanned, ban } = require('../stores/ban');
const { isAdmin } = require('../stores/admin');

const banHandler = async ({ chat, message, reply }) => {
	if (!await isAdmin(message.from)) {
		return null;
	}

	const userToBan = message.reply_to_message.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('Need a reason to ban');
	}

	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	bot.telegram.deleteMessage(chat.id, message.reply_to_message.message_id);

	if (await isAdmin(userToBan)) {
		return reply('Can\'t ban other admin');
	}
	
	if (await isBanned(userToBan)) {
		return reply('User is already banned.');
	}

	await ban(userToBan, reason);

	return reply(`${link(userToBan)} has been <b>banned</b>.\n\n` +
		`Reason: ${reason}`, replyOptions);
};

module.exports = banHandler;
