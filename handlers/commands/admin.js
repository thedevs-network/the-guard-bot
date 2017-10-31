'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

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

const adminHandler = async ({ message, reply, state }) => {
	const { isMaster, user } = state;
	if (!isMaster) return null;

	const userToAdmin = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: user;

	if (await isBanned(userToAdmin)) {
		return reply('ℹ️ <b>Can\'t admin banned user.</b>', replyOptions);
	}

	if (await isAdmin(userToAdmin)) {
		return reply(
			`⭐️ ${link(userToAdmin)} <b>is already admin.</b>`,
			replyOptions
		);
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

	return reply(`⭐️ ${link(userToAdmin)} <b>is now admin.</b>`, replyOptions);
};

module.exports = adminHandler;
