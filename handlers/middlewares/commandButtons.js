'use strict';

const TelegrafContext = require('telegraf/core/context');
const contextCustomizations = require('../../bot/context');

module.exports = (ctx, next) => {
	if (!ctx.callbackQuery) return next();
	if (!ctx.callbackQuery.data.startsWith('/')) return next();

	const cbUpdate = {
		message: {
			from: ctx.from,
			chat: ctx.chat,
			text: ctx.callbackQuery.data,
			entities: [ { offset: 0, type: 'bot_command' } ],
		}
	};

	const cbCtx = new TelegrafContext(cbUpdate, ctx.tg, ctx.options);
	Object.assign(cbCtx, contextCustomizations);
	cbCtx.botInfo = ctx.botInfo;

	cbCtx.reply = (text, options = {}) => {
		ctx.deleteMessage();
		return ctx.reply(text, options);
	};

	return next(cbCtx);
};
