'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { listGroups } = require('../../stores/groups');
const { isBanned, ban } = require('../../stores/ban');
const { isAdmin } = require('../../stores/admin');

const banHandler = async ({ chat, message, reply, telegram }) => {
	if (!await isAdmin(message.from)) {
		return null;
	}

	const userToBan = message.reply_to_message.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to ban.</b>', replyOptions);
	}

	if (!message.reply_to_message) {
		return reply('ℹ️ <b>Reply to a message.</b>', replyOptions);
	}

	bot.telegram.deleteMessage(chat.id, message.reply_to_message.message_id);

	if (await isAdmin(userToBan)) {
		return reply('ℹ️ <b>Can\'t ban other admins.</b>', replyOptions);
	}

	if (await isBanned(userToBan)) {
		return reply(`🚫 ${link(userToBan)} <b>is already banned.</b>`,
			replyOptions);
	}

	try {
		await ban(userToBan, reason);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	const groups = await listGroups();

	const bans = groups.map(group =>
		telegram.kickChatMember(group.id, userToBan.id));

	try {
		await Promise.all(bans);
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return reply(`🚫 ${link(userToBan)} <b>got banned</b>.\n\n` +
		`Reason: ${reason}`, replyOptions);
};

module.exports = banHandler;
