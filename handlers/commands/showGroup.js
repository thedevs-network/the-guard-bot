'use strict';

const { updateGroup } = require('../../stores/group');

module.exports = async (ctx, next) => {
	if (!ctx.state.isMaster) return next();

	const { id, username, title } = ctx.chat;

	try {
		const link = username
			? `t.me/${username}`
			: await ctx.exportChatInviteLink();

		return updateGroup({ id, link, title });
	} catch (err) {
		return ctx.reply(String(err));
	}
};
