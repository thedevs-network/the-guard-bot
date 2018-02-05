'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, isBanned } = require('../../stores/user');

// Actions
const ban = require('../../actions/ban');

const banHandler = async (ctx) => {
	const { message, reply, me } = ctx;

	const userToBan = message.reply_to_message
		? Object.assign({ username: '' }, message.reply_to_message.from)
		: message.commandMention
			? Object.assign({ username: '' }, message.commandMention)
			: null;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (ctx.from.status !== 'admin') return null;

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

	if (userToBan.username.toLowerCase() === me.toLowerCase()) return null;

	if (await isAdmin(userToBan)) {
		return reply('ℹ️ <b>Can\'t ban other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to ban.</b>', replyOptions)
			.then(scheduleDeletion);
	}

	if (message.reply_to_message) {
		ctx.deleteMessage(message.reply_to_message.message_id);
	}

	if (await isBanned(userToBan)) {
		return reply(
			`🚫 ${link(userToBan)} <b>is already banned.</b>`,
			replyOptions
		);
	}

	return ban({ admin: ctx.from, reason, userToBan }).then(ctx.replyWithHTML);
};

module.exports = banHandler;
