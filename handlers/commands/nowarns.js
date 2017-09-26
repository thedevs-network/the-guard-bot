'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getWarns, nowarns } = require('../../stores/warn');
const { isAdmin } = require('../../stores/user');

const nowarnsHandler = async ({ message, reply }) => {
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

	const warns = await getWarns(userToUnwarn);

	if (warns.length < 1) {
		return reply(`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
			replyOptions);
	}
	try {
		await nowarns(userToUnwarn);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return reply(
		`♻️ ${link(message.from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		'<b>for all of their warnings.</b>',
		replyOptions);
};


module.exports = nowarnsHandler;
