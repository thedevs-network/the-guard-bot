'use strict';

const { addGroup } = require('../stores/groups');
const { masterID } = require('../config.json');

const addedToGroup = (ctx, next) => {
	const msg = ctx.message;

	const wasAdded = msg.new_chat_members.some(user => user.username === ctx.me);
	if (wasAdded && ctx.from.id === masterID) {
		addGroup(ctx.chat);
		ctx.reply('Ok, I\'ll help you manage this group from now.');
	}

	return next();
};

module.exports = addedToGroup;
