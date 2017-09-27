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
const {
	isAdmin,
	admin,
	isBanned,
	getWarns,
	nowarns
} = require('../../stores/user');

const adminHandler = async ({ message, reply }) => {
	if (message.from.id !== masterID) {
		return null;
	}

	const userToAdmin = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: message.from;

	if (await isBanned(userToAdmin)) {
		return reply('ℹ️ <b>Can\'t admin banned user.</b>', replyOptions);
	}

	if (await isAdmin(userToAdmin)) {
		return reply(`⭐️ ${link(userToAdmin)} <b>is already admin.</b>.`,
			replyOptions);
	}

	if (await getWarns(userToAdmin)) {
		try {
			await nowarns(userToAdmin);
		} catch (err) {
			logError(err);
		}
	}

	try {
		await admin(userToAdmin);
	} catch (err) {
		logError(err);
	}

	return reply(`⭐️ ${link(userToAdmin)} <b>is now admin.</b>.`, replyOptions);
};

module.exports = adminHandler;
