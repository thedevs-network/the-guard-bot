'use strict';

// Utils
const { link } = require('../utils/tg');
const { print, logError } = require('../utils/log');

// Bot
const bot = require('../bot');
const { replyOptions } = require('../bot/options');

// DB
const bans = require('../stores/bans');

const middlewareHandler = async (ctx, next) => {
	process.env.DEBUG && ctx.message && print(ctx.message);
	const banned = await bans.isBanned(ctx.from);
	if (banned) {
		return bot.telegram.kickChatMember(ctx.chat.id, ctx.from.id)
			.then(() => ctx.reply(
				`${link(ctx.from)} <b>banned</b>!\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError(process.env.DEBUG))
			.then(next);
	}
	return next();
};

module.exports = middlewareHandler;
