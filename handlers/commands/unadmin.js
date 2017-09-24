'use strict';

// Utils
const { loadJSON } = require('../../utils/json');
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const { masterID } = loadJSON('config.json');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, unadmin } = require('../../stores/admin');

const unAdminHandler = async ({ message, reply }) => {
	if (message.from.id !== masterID) {
		return null;
	}

	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	const userToUnadmin = message.reply_to_message.from;

	if (!await isAdmin(userToUnadmin)) {
		return reply(`ℹ️ ${link(userToUnadmin)} <b>is not admin.</b>`,
			replyOptions);
	}

	try {
		await unadmin(userToUnadmin);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return reply(`❗️ ${link(userToUnadmin)} <b>is no longer admin.</b>`,
		replyOptions);
};

module.exports = unAdminHandler;
