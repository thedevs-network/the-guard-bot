'use strict';

const { removeGroup } = require('../../stores/group');

const kickedFromGroupHandler = (ctx, next) => {
	if (ctx.message.left_chat_member.username !== ctx.me) {
		return next();
	}
	return removeGroup(ctx.chat);
};

module.exports = kickedFromGroupHandler;
