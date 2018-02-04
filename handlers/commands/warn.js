'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const {
	warnInlineKeyboard,
} = require('../../config');
const reply_markup = { inline_keyboard: warnInlineKeyboard };

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin } = require('../../stores/user');
const warn = require('../../actions/warn');

const warnHandler = async (ctx) => {
	const { message, reply, me } = ctx;
	const userToWarn = message.reply_to_message
		? Object.assign({ username: '' }, message.reply_to_message.from)
		: message.commandMention
			? Object.assign({ username: '' }, message.commandMention)
			: null;

	if (ctx.from.status !== 'admin') return null;

	if (message.chat.type === 'private') {
		return reply(
			'ℹ️ <b>This command is only available in groups.</b>',
			replyOptions
		);
	}


	if (!userToWarn) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	if (userToWarn.username.toLowerCase() === me.toLowerCase()) return null;

	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (await isAdmin(userToWarn)) {
		return reply('ℹ️ <b>Can\'t warn other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to warn.</b>', replyOptions)
			.then(scheduleDeletion);
	}

	if (message.reply_to_message) {
		ctx.deleteMessage(message.reply_to_message.message_id);
	}

	const warnMessage = await warn({ admin: ctx.from, reason, userToWarn });

	return ctx.replyWithHTML(warnMessage, { reply_markup });
};

module.exports = warnHandler;
