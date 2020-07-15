'use strict';

// Utils
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { html } = require('../../utils/html');
const { parse, strip, substom } = require('../../utils/cmd');

// Bot

// DB
const { getUser } = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const banHandler = async (ctx) => {
	if (ctx.chat.type === 'private') {
		return ctx.replyWithHTML(
			'ℹ️ <b>This command is only available in groups.</b>',
		);
	}

	if (ctx.from.status !== 'admin') return null;

	const { flags, targets, reason } = parse(ctx.message);

	if (targets.length === 0) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Specify at least one user to ban.</b>',
		).then(scheduleDeletion());
	}

	if (reason.length === 0) {
		return ctx.replyWithHTML('ℹ️ <b>Need a reason to ban.</b>')
			.then(scheduleDeletion());
	}

	if (targets.length > 1) {
		return ctx.batchBan({ admin: ctx.from, reason, targets });
	}

	const userToBan = await getUser(strip(targets[0])) || targets[0];

	if (!userToBan.id) {
		return ctx.replyWithHTML(
			'❓ <b>User unknown.</b>\n' +
			'Please forward their message, then try again.',
		).then(scheduleDeletion());
	}

	if (userToBan.id === ctx.botInfo.id) return null;

	if (userToBan.status === 'admin') {
		return ctx.replyWithHTML('ℹ️ <b>Can\'t ban other admins.</b>');
	}

	if (ctx.message.reply_to_message) {
		ctx.deleteMessage(ctx.message.reply_to_message.message_id)
			.catch(() => null);
	}

	if (!flags.has('amend') && userToBan.status === 'banned') {
		return ctx.replyWithHTML(
			html`🚫 ${displayUser(userToBan)} <b>is already banned.</b>`,
		);
	}

	return ctx.ban({
		admin: ctx.from,
		reason: await substom(reason),
		userToBan,
	});
};

module.exports = banHandler;
