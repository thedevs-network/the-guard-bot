'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { listGroups } = require('../../stores/group');
const { isAdmin, isBanned, ban } = require('../../stores/user');

const banHandler = async ({ chat, message, reply, telegram, me, state }) => {
	const userToBan = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (!state.isAdmin) return null;

	if (message.chat.type === 'private') {
		return reply(
			'ℹ️ <b>This command is only available in groups.</b>',
			replyOptions
		);
	}

	if (!userToBan) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	if (userToBan.username === me.toLowerCase()) return null;

	if (await isAdmin(userToBan)) {
		return reply('ℹ️ <b>Can\'t ban other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to ban.</b>', replyOptions)
			.then(scheduleDeletion);
	}

	if (message.reply_to_message) {
		bot.telegram.deleteMessage(
			chat.id,
			message.reply_to_message.message_id
		);
	}

	if (await isBanned(userToBan)) {
		return reply(
			`🚫 ${link(userToBan)} <b>is already banned.</b>`,
			replyOptions
		);
	}

	try {
		await ban(userToBan, reason);
	} catch (err) {
		logError(err);
	}

	const groups = await listGroups();

	const bans = groups.map(group =>
		telegram.kickChatMember(group.id, userToBan.id));

	try {
		await Promise.all(bans);
	} catch (err) {
		logError(err);
	}

	if (userToBan.first_name === '') {
		return reply(`🚫 ${link(state.user)} <b>banned an user with id</b> ` +
		`<code>${userToBan.id}</code> <b>for:</b>\n\n${reason}`, replyOptions);
	}

	return reply(`🚫 ${link(state.user)} <b>banned</b> ${link(userToBan)} ` +
		`<b>for:</b>\n\n${reason}`, replyOptions);
};

module.exports = banHandler;
