'use strict';

// Utils
const { link } = require('../utils/tg');

// Bot
const { replyOptions } = require('../bot/options');

// DB
const { nowarns } = require('../stores/warn');
const admins = require('../stores/admins');

const nowarnsHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const messageToUnwarn = message.reply_to_message;
	const userToUnwarn = messageToUnwarn.from;

  await nowarns(userToUnwarn);
  
	return reply(
		`${link(userToUnwarn)} was pardoned for all of their warnings.`,
		replyOptions);
};


module.exports = nowarnsHandler;
