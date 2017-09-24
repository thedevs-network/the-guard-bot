'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getWarns } = require('../../stores/warn');
const admins = require('../../stores/admin');

const getWarnsHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}
	let i = 0;
	const theUser = message.reply_to_message.from;
	const warns = await getWarns(theUser);
	if (warns.length < 1) {
		return reply(`✅ <b>no warns for:</b> ${link(theUser)}`, replyOptions);
	}
	return reply(`⚠️ <b>Warns for</b> ${link(theUser)}:\n\n` +
		warns
			.map(warn => ++i + '. ' + warn)
			.join('\n\n'), replyOptions);
};

module.exports = getWarnsHandler;
