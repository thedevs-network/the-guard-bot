'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, unadmin } = require('../../stores/user');

const unAdminHandler = async ({ message, reply, state }) => {
	const { isMaster } = state;
	if (!isMaster) return null;

	const userToUnadmin = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToUnadmin) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	if (!await isAdmin(userToUnadmin)) {
		return reply(
			`ℹ️ ${link(userToUnadmin)} <b>is not admin.</b>`,
			replyOptions
		);
	}

	try {
		await unadmin(userToUnadmin);
	} catch (err) {
		logError(err);
	}

	return reply(
		`❗️ ${link(userToUnadmin)} <b>is no longer admin.</b>`,
		replyOptions
	);
};

module.exports = unAdminHandler;
