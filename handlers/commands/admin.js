'use strict';

// Utils
const { loadJSON } = require('../../utils/json');
const { link } = require('../../utils/tg');

// Config
const { masterID } = loadJSON('config.json');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, admin } = require('../../stores/admin');

const adminHandler = async ({ message, reply }) => {
	if (message.from.id !== masterID) {
		return null;
	}
	const userToAdmin = message.reply_to_message
		? message.reply_to_message.from
		: message.from;

	if (await isAdmin(userToAdmin)) {
		return reply('Already admin');
	}

	await admin(userToAdmin);

	return reply(`${link(userToAdmin)} is now <b>admin</b>.`, replyOptions);
};

module.exports = adminHandler;
