'use strict';

// Utils
const { parse, strip } = require('../../utils/parse');
const { scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser } = require('../../stores/user');

const warnHandler = async (ctx) => {
	const { message, reply } = ctx;

	if (!message.chat.type.endsWith('group')) {
		return reply(
			'ℹ️ <b>This command is only available in groups.</b>',
			replyOptions
		);
	}

	if (ctx.from.status !== 'admin') return null;

	const { flags, reason, targets } = parse(message);

	if (targets.length !== 1) {
		return reply(
			'ℹ️ <b>Specify one user to warn.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const userToWarn = await getUser(strip(targets[0]));

	if (!userToWarn) {
		return reply(
			'❓ <b>User unknown.</b>\n' +
			'Please forward their message, then try again.',
			replyOptions
		).then(scheduleDeletion());
	}

	if (userToWarn.id === ctx.botInfo.id) return null;

	if (userToWarn.status === 'admin') {
		return reply('ℹ️ <b>Can\'t warn other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to warn.</b>', replyOptions)
			.then(scheduleDeletion());
	}

	if (message.reply_to_message) {
		ctx.deleteMessage(message.reply_to_message.message_id);
	}

	return ctx.warn({
		admin: ctx.from,
		amend: flags.has('amend'),
		reason,
		userToWarn,
		mode: 'manual',
	});
};

module.exports = warnHandler;
