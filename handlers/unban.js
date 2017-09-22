'use strict';

// Utils
const { link } = require('../utils/tg');

// Bot
const { replyOptions } = require('../bot/options');

// DB
const { isBanned, unban } = require('../stores/ban');
const admins = require('../stores/admin');

const unbanHandler = async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}

	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const userToUnban = message.reply_to_message.from;

	if (!await isBanned(userToUnban)) {
		return reply('User is not banned.');
	}

	await unban(userToUnban);

	return reply(`${link(userToUnban)} has been unbanned.`, replyOptions);
};

module.exports = unbanHandler;
