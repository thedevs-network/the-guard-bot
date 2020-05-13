'use strict';

const { pMap } = require('../../utils/promise');

const link = user => '@' + user.username;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const antibotHandler = async (ctx, next) => {
	const msg = ctx.message;

	const bots = msg.new_chat_members.filter(user =>
		user.is_bot && user.username !== ctx.me);

	if (bots.length === 0) {
		return next();
	}

	if (ctx.from.status === 'admin') {
		return next();
	}

	await pMap(bots, bot =>
		ctx.kickChatMember(bot.id));

	await ctx.replyWithHTML(
		`🚫 <b>Kicked bot(s):</b> ${bots.map(link).join(', ')}`,
	);

	return next();
};

module.exports = antibotHandler;
