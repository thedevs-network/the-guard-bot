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

	const userToUnwarn = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToUnwarn) {
		return reply('ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions);
	}

	const allWarns = await Warn.getWarns(userToUnwarn);
	const warn = await Warn.unwarn(userToUnwarn);

	return reply(
		`❎ ${link(message.from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${warn} (${allWarns.length}/3)`,
		replyOptions);
};


module.exports = unwarnHandler;
