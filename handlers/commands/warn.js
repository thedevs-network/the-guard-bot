'use strict';

// Utils
const { parse, strip, substom } = require('../../utils/cmd');
const { scheduleDeletion } = require('../../utils/tg');

// DB
const { getUser } = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const warnHandler = async (ctx) => {
	if (!ctx.message.chat.type.endsWith('group')) {
		return ctx.replyWithHTML(
			'ℹ️ <b>This command is only available in groups.</b>',
		);
	}

	if (ctx.from.status !== 'admin') return null;

	const { flags, reason, targets } = parse(ctx.message);

	if (targets.length !== 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Specify one user to warn.</b>',
		).then(scheduleDeletion());
	}

	const userToWarn = await getUser(strip(targets[0]));

	if (!userToWarn) {
		return ctx.replyWithHTML(
			'❓ <b>User unknown.</b>\n' +
			'Please forward their message, then try again.',
		).then(scheduleDeletion());
	}

	if (userToWarn.id === ctx.botInfo.id) return null;

	if (userToWarn.status === 'admin') {
		return ctx.replyWithHTML('ℹ️ <b>Can\'t warn other admins.</b>');
	}

	if (reason.length === 0) {
		return ctx.replyWithHTML('ℹ️ <b>Need a reason to warn.</b>')
			.then(scheduleDeletion());
	}

	if (ctx.message.reply_to_message) {
		ctx.deleteMessage(ctx.message.reply_to_message.message_id)
			.catch(() => null);
	}

	return ctx.warn({
		admin: ctx.from,
		amend: flags.has('amend'),
		reason: await substom(reason),
		userToWarn,
		mode: 'manual',
	});
};

module.exports = warnHandler;
