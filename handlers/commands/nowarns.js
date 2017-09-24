'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getWarns, nowarns } = require('../../stores/warn');
const admins = require('../../stores/admin');

const nowarnsHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	const messageToUnwarn = message.reply_to_message;
	const userToUnwarn = messageToUnwarn.from;
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
