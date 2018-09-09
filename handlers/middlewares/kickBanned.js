'use strict';

const kickBannedHandler = (ctx, next) => {
	if (ctx.chat.type === 'private') {
		return next();
	}
	if (ctx.from.status === 'banned') {
		ctx.deleteMessage();
		return ctx.kickChatMember(ctx.from.id);
	}
	return next();
};

module.exports = kickBannedHandler;
