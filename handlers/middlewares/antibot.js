'use strict';

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin } = require('../../stores/user');

const link = user => '@' + user.username;

const antibotHandler = async (ctx, next) => {
	const msg = ctx.message;

	const bots = msg.new_chat_members.filter(user =>
		user.is_bot && user.username !== ctx.me);

	if (bots.length === 0) {
		return next();
	}

	if (await isAdmin(ctx.from)) {
		return next();
	}

	for (const bot of bots) {
		ctx.telegram.kickChatMember(ctx.chat.id, bot.id);
	}

	ctx.reply(
		`🚫 <b>Kicked bot(s):</b> ${bots.map(link).join(', ')}`,
		replyOptions
	);

	return next();
};

module.exports = antibotHandler;
