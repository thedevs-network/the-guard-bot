'use strict';

// Utils
const { loadJSON } = require('../utils/json');
const { link } = require('../utils/tg');

// Config
const config = loadJSON('config.json');

// Bot
const { replyOptions } = require('../bot/options');

// DB
const admins = require('../stores/admins');

const adminHandler = async ({ message, reply }) => {
	if (message.from.id !== config.masterID) {
		return null;
	}
	const userToAdmin = message.reply_to_message
		? message.reply_to_message.from
		: message.from;

	if (await admins.isAdmin(userToAdmin)) {
		return reply('Already admin');
	}
	return admins.admin(userToAdmin).then(() =>
		reply('Admined ' + link(userToAdmin), replyOptions));
};

module.exports = adminHandler;
