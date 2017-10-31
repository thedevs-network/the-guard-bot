'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getWarns } = require('../../stores/user');

const getWarnsHandler = async ({ message, reply, state }) => {
	const { isAdmin } = state;
	if (!isAdmin) return null;

	const theUser = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;
	if (!theUser) {
		return reply('ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions).then(scheduleDeletion);
	}
	let i = 0;
	const warns = await getWarns(theUser);
	if (!warns) {
		return reply(`✅ <b>no warns for:</b> ${link(theUser)}`, replyOptions);
	}
	return reply(`⚠️ <b>Warns for</b> ${link(theUser)}:\n\n` +
		warns
			.map(warn => ++i + '. ' + warn)
			.join('\n'), replyOptions);
};

module.exports = getWarnsHandler;
