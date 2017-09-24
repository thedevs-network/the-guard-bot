'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { listGroups } = require('../../stores/groups');
const { isBanned, unban } = require('../../stores/ban');
const admins = require('../../stores/admin');

const unbanHandler = async ({ message, reply, telegram }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}

	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	const userToUnban = message.reply_to_message.from;

	if (!await isBanned(userToUnban)) {
		return reply('ℹ️ <b>User is not banned.</b>', replyOptions);
	}

	const groups = await listGroups();

	const unbans = groups.map(group =>
		telegram.unbanChatMember(group.id, userToUnban.id));

	try {
		await Promise.all(unbans);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	try {
		await unban(userToUnban);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return reply(`♻️ ${link(userToUnban)} <b>is unbanned.</b>`,
		replyOptions);
};

module.exports = unbanHandler;
