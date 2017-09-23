'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const Warn = require('../../stores/warn');
const admins = require('../../stores/admin');

const getWarnsHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}
	let i = 0;
	const theUser = message.reply_to_message.from;
	return reply('Warns for ' + link(theUser) + ':\n\n' +
		(await Warn.getWarns(theUser))
			.map(x => ++i + '. ' + x)
			.join('\n\n'), replyOptions);
};

module.exports = getWarnsHandler;
