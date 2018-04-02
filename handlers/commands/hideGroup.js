'use strict';

const { hideGroup } = require('../../stores/group');

const noop = Function.prototype;

module.exports = (ctx, next) => {
	if (!ctx.state.isMaster) return next();

	// try to revoke the old link
	ctx.exportChatInviteLink().catch(noop);

	return hideGroup(ctx.chat);
};
