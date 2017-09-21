'use strict';

// Utils
const { link, deleteAfter } = require('../utils/tg');
const { logError } = require('../utils/log');

// Bot
const { replyOptions } = require('../bot/options');

const newChatMemberHandler = ctx => {
	if (
		ctx.message.new_chat_member &&
		ctx.message.new_chat_member.username &&
		ctx.message.new_chat_member.username.substr(-3).toLowerCase() === 'bot'
	) {
		return ctx.telegram.kickChatMember(ctx.chat.id,
			ctx.message.new_chat_member.id)
			.then(() =>
				ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id))
			.then(() =>
				ctx.reply(`Kicked bot: ${link(ctx.message.new_chat_member)}`,
					replyOptions))
			.catch(logError(process.env.DEBUG));
	}
	return deleteAfter(10 * 60 * 1000)(ctx);
};

module.exports = newChatMemberHandler;
