'use strict';

const { updateGroup } = require('../../stores/group');

module.exports = (ctx, next) => {
	const { id, title } = ctx.chat;
	updateGroup({ id, title });
	return next(); // just in case there's a plugin listening for the same event
};
