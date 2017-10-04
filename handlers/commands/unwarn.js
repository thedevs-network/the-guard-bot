'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, getWarns, unwarn } = require('../../stores/user');

const unwarnHandler = async ({ message, reply }) => {
	if (!await isAdmin(message.from)) {
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

	const allWarns = await getWarns(userToUnwarn);

	if (!allWarns) {
		return reply(`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
			replyOptions);
	}

	await unwarn(userToUnwarn);

	return reply(
		`❎ ${link(message.from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${allWarns[allWarns.length - 1]}` +
		`(${allWarns.length - 1}/3)`,
		replyOptions);
};


module.exports = unwarnHandler;
