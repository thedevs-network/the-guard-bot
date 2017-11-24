'use strict';

// Bot
const { replyOptions } = require('../../bot/options');

const { admin } = require('../../stores/user');
const { addGroup, managesGroup } = require('../../stores/group');
const { master } = require('../../config');

const addedToGroupHandler = async (ctx, next) => {
	const msg = ctx.message;
	const { telegram } = ctx;
	const isMaster = ctx.from.id === Number(master) ||
		ctx.from.username &&
		ctx.from.username.toLowerCase() ===
		String(master).replace('@', '').toLowerCase();

	const wasAdded = msg.new_chat_members.some(user =>
		user.username === ctx.me);
	if (wasAdded && isMaster) {
		await admin(ctx.from);
		if (!await managesGroup({ id: ctx.chat.id })) {
			try {
				const link = await telegram.exportChatInviteLink(ctx.chat.id);
				ctx.chat.link = link ? link : '';
			} catch (err) {
				// eslint-disable-next-line function-paren-newline
				await ctx.replyWithHTML(
					'⚠️ <b>Please re-add me with admin permissions.</b>' +
					'\n\n' +
					`<code>${err}</code>`
				// eslint-disable-next-line function-paren-newline
				);
				return telegram.leaveChat(ctx.chat.id);
			}
			await addGroup(ctx.chat);
		}
		ctx.reply(
			'🛠 <b>Ok, I\'ll help you manage this group from now.</b>',
			replyOptions
		);
	}

	return next();
};

module.exports = addedToGroupHandler;
