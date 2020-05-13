'use strict';

const { Context } = require('telegraf');

/** @type { import('../../typings/context').ContextExtensions } */
const contextCustomizations = require('../../bot/context');

/** @param { import('telegraf').Context } ctx */
module.exports = (ctx, next) => {
	if (!ctx.callbackQuery) return next();
	if (!ctx.callbackQuery.data.startsWith('/')) return next();

	const cbUpdate = {
		message: {
			from: ctx.from,
			chat: ctx.chat,
			text: ctx.callbackQuery.data,
			entities: [ { offset: 0, type: 'bot_command' } ],
		},
	};

	/** @type { import('../../typings/context').ExtendedContext } */
	const cbCtx = new Context(cbUpdate, ctx.tg, ctx.options);
	Object.assign(cbCtx, contextCustomizations);
	cbCtx.botInfo = ctx.botInfo;

	cbCtx.reply = ctx.editMessageText;

	return next(cbCtx);
};
