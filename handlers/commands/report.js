'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

const reportHandler = async ctx => {
	const msg = ctx.message;
	if (!msg.reply_to_message) {
		return ctx.reply(
			'ℹ️ <b>Reply to message you\'d like to report</b>',
			replyOptions
		).then(scheduleDeletion);
	}
	const admins = (await ctx.getChatAdministrators())
		.filter(member =>
			member.status === 'creator' ||
			member.can_delete_messages &&
			member.can_restrict_members
		// eslint-disable-next-line function-paren-newline
		).map(member => member.user);
	const adminObjects = admins.map(user => ({
		first_name: '​', // small hack to be able to use link function
		id: user.id,
	}));
	const adminsMention = adminObjects.map(link).join('');
	const s = `❗️${link(ctx.from)} <b>reported the message to the admins.</b>` +
		`${adminsMention}`;
	return ctx.replyWithHTML(s, {
		reply_to_message_id: msg.reply_to_message.message_id
	});
};

module.exports = reportHandler;
