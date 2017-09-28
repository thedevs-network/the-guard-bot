'use strict';

const { masterID } = require('../../config.json');

const { removeGroup } = require('../../stores/group');

const leaveCommandHandler = async ctx => {
	if (ctx.from.id !== masterID) {
		return null;
	}
	await removeGroup(ctx.chat);
	return ctx.telegram.leaveChat(ctx.chat.id);
};

module.exports = leaveCommandHandler;
