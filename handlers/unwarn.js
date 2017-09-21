'use strict';

// Utils
const { link } = require('../utils/tg');

// Bot
const { replyOptions } = require('../bot/options');

// DB
const Warn = require('../stores/warn');
const admins = require('../stores/admins');

const unwarnHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const messageToUnwarn = message.reply_to_message;
	const userToUnwarn = messageToUnwarn.from;

	const warnCount = await Warn.getWarns(userToUnwarn);
	const warn = await Warn.unwarn(userToUnwarn);

	return reply(
		`${link(userToUnwarn)} pardoned for: ${warn}\n(${warnCount}/3)`,
		replyOptions);
};


module.exports = unwarnHandler;
