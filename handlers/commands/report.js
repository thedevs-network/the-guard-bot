'use strict';

// Utils
const {
	escapeHtml,
	link,
	msgLink,
	scheduleDeletion,
} = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

const { chats = {} } = require('../../utils/config').config;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const reportHandler = async ctx => {
	if (!ctx.chat.type.endsWith('group')) return null;
	const msg = ctx.message;
	if (!msg.reply_to_message) {
		return ctx.reply(
			'ℹ️ <b>Reply to message you\'d like to report</b>',
			replyOptions
		).then(scheduleDeletion());
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
	const report = await ctx.replyWithHTML(s, {
		reply_to_message_id: msg.reply_to_message.message_id
	});
	if (chats.report) {
		await ctx.tg.sendMessage(
			chats.report,
			`❗️ Report in <a href="${msgLink(msg.reply_to_message)}">` +
				escapeHtml(msg.chat.title) +
				'</a>!',
			{ ...replyOptions,
				reply_markup: { inline_keyboard: [ [ {
					text: '✔️ Handled',
					// eslint-disable-next-line max-len
					callback_data: `/del -chat_id=${report.chat.id} -msg_id=${report.message_id} Report handled`
				} ] ] } }
		);
	}
	return null;
};

module.exports = reportHandler;
