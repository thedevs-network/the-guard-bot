'use strict';

// Utils
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/parse');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser } = require('../../stores/user');

const banHandler = async (ctx) => {
	const { message, reply } = ctx;

	if (!message.chat.type.endsWith('group')) {
		return reply(
			'ℹ️ <b>This command is only available in groups.</b>',
			replyOptions
		);
	}

	if (ctx.from.status !== 'admin') return null;

	const { targets, reason } = parse(message);

	if (targets.length === 0) {
		return reply(
			'ℹ️ <b>Specify at least one user to ban.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to ban.</b>', replyOptions)
			.then(scheduleDeletion());
	}

	if (targets.length > 1) {
		return ctx.batchBan({ admin: ctx.from, reason, targets });
	}

	const userToBan = await getUser(strip(targets[0])) || targets[0];

	if (!userToBan.id) {
		return reply(
			'❓ <b>User unknown.</b>\n' +
			'Please forward their message, then try again.',
			replyOptions
		).then(scheduleDeletion());
	}

	if (userToBan.id === ctx.botInfo.id) return null;

	if (userToBan.status === 'admin') {
		return reply('ℹ️ <b>Can\'t ban other admins.</b>', replyOptions);
	}

	if (message.reply_to_message) {
		ctx.deleteMessage(message.reply_to_message.message_id);
	}

	if (userToBan.status === 'banned') {
		return reply(
			`🚫 ${displayUser(userToBan)} <b>is already banned.</b>`,
			replyOptions
		);
	}

	return ctx.ban({ admin: ctx.from, reason, userToBan });
};

module.exports = banHandler;
