'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const Warn = require('../../stores/warn');
const admins = require('../../stores/admin');

const unwarnHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	const messageToUnwarn = message.reply_to_message;
	const userToUnwarn = messageToUnwarn.from;

	const allWarns = await Warn.getWarns(userToUnwarn);
	const warn = await Warn.unwarn(userToUnwarn);

	return reply(
		`❎ ${link(message.from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${warn} (${allWarns.length}/3)`,
		replyOptions);
};


module.exports = unwarnHandler;
