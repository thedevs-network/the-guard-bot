'use strict';

const dedent = require('dedent-js');

// Utils
const { link } = require('../../utils/tg');

const { replyOptions } = require('../../bot/options');

const kickBannedHandler = async (ctx, next) => {
	if (ctx.chat.type === 'private') {
		return next();
	}
	if (ctx.from.status === 'banned') {
		ctx.deleteMessage();
		await ctx.kickChatMember(ctx.from.id);
		return ctx.replyWithHTML(
			dedent(`
			🚫 ${link(ctx.from)} <b>is banned</b>!

			Reason: ${ctx.from.ban_reason}`),
			replyOptions
		);
	}
	return next();
};

module.exports = kickBannedHandler;
