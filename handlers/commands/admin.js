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
const { isAdmin, admin } = require('../../stores/admin');
const { isBanned } = require('../../stores/ban');
const { getWarns, nowarns } = require('../../stores/warn');

const adminHandler = async ({ message, reply }) => {
	if (message.from.id !== masterID) {
		return null;
	}
	const userToAdmin = message.reply_to_message
		? message.reply_to_message.from
		: message.from;

	if (await isBanned(userToAdmin)) {
		return reply('Can\'t admin banned user');
	}

	if (await isAdmin(userToAdmin)) {
		return reply('Already admin');
	}

	if (await getWarns(userToAdmin)) {
		try {
			await nowarns(userToAdmin);
		} catch (err) {
			logError(process.env.DEBUG)(err);
		}
	}

	try {
		await admin(userToAdmin);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return reply(`${link(userToAdmin)} is now <b>admin</b>.`, replyOptions);
};

module.exports = adminHandler;
