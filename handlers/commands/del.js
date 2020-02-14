'use strict';

const html = require('tg-html');
const R = require('ramda');

const { parse } = require('../../utils/parse');
const { link, scheduleDeletion } = require('../../utils/tg');

module.exports = async (ctx) => {
	if (ctx.from.status !== 'admin') return;

	const { flags, reason } = parse(ctx.message);

	if (!(flags.has('msg_id') || ctx.message.reply_to_message)) {
		// eslint-disable-next-line max-len
		await ctx.replyWithHTML('ℹ️ <b>Reply to a message you\'d like to delete</b>').then(scheduleDeletion());
		return;
	}

	await ctx.tg.deleteMessage(
		flags.get('chat_id') || ctx.chat.id,
		flags.get('msg_id') || ctx.message.reply_to_message.message_id
	);

	if (reason) {
		const emoji = link({
			id: R.path([ 'message', 'reply_to_message', 'from', 'id' ], ctx),
			first_name: '🗑',
		});
		await ctx.replyWithHTML(html`${emoji} ${reason}`)
			.then(scheduleDeletion());
	}
};
