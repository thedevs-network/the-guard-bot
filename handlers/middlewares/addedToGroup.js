'use strict';

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

const { admin } = require('../../stores/user');
const { addGroup, managesGroup } = require('../../stores/group');
const { masterID } = require('../../config.json');

const addedToGroupHandler = async (ctx, next) => {
	const msg = ctx.message;

	const wasAdded = msg.new_chat_members.some(user =>
		user.username === ctx.me);
	if (wasAdded && ctx.from.id === masterID) {
		admin(ctx.from);
		if (!await managesGroup(ctx.chat)) {
			const link = await bot.telegram.exportChatInviteLink(ctx.chat.id);
			ctx.chat.link = link ? link : '';
			await addGroup(ctx.chat);
		}
		ctx.reply('🛠 <b>Ok, I\'ll help you manage this group from now.</b>',
			replyOptions);
	}

	return next();
};

module.exports = addedToGroupHandler;
