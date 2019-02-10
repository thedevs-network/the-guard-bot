'use strict';

const noop = Function.prototype;

const kickBannedHandler = (ctx, next) => {
	if (!ctx.chat.type.endsWith('group')) {
		return next();
	}
	if (ctx.from.status === 'banned') {
		ctx.deleteMessage().catch(noop);
		return ctx.kickChatMember(ctx.from.id)
			.catch(err => ctx.reply(`⚠️ kickBanned: ${err}`));
	}
	return next();
};

module.exports = kickBannedHandler;
