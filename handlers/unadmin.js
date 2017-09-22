'use strict';

// Utils
const { loadJSON } = require('../utils/json');
const { link } = require('../utils/tg');

// Config
const { masterID } = loadJSON('config.json');

// Bot
const { replyOptions } = require('../bot/options');

// DB
const { isAdmin, unadmin } = require('../stores/admin');

const unAdminHandler = async ({ message, reply }) => {
	if (message.from.id !== masterID) {
		return null;
	}

	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const userToUnadmin = message.reply_to_message.from;

	if (!await isAdmin(userToUnadmin)) {
		return reply(`${link(userToUnadmin)} is not admin.`, replyOptions);
	}

	await unadmin(userToUnadmin);

	return reply(`${link(userToUnadmin)} is no longer admin.`, replyOptions);
};

module.exports = unAdminHandler;
