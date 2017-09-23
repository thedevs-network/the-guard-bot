'use strict';

// DB
const { isAdmin } = require('../../stores/admin');

const link = user => '@' + user.username;

const antibotHandler = async (ctx, next) => {
	const msg = ctx.message;

	const bots = msg.new_chat_members.filter(user =>
		user.is_bot && user.username !== ctx.me
	);

	if (bots.length === 0) {
		return next();
	}

	if (await isAdmin(ctx.from)) {
		return next();
	}

	for (const bot of bots) {
		ctx.telegram.kickChatMember(ctx.chat.id, bot.id);
	}

	ctx.reply(`Kicked bot(s): ${bots.map(link).join(', ')}`);

	return next();
};

module.exports = antibotHandler;
