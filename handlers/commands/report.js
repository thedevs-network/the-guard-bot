'use strict';

// Utils
const Cmd = require('../../utils/cmd');
const { TgHtml } = require('../../utils/html');
const {
	link,
	msgLink,
	scheduleDeletion,
} = require('../../utils/tg');

const { chats = {} } = require('../../utils/config').config;

const isQualified = member => member.status === 'creator' ||
	member.can_delete_messages &&
	member.can_restrict_members;

const adminMention = ({ user }) =>
	TgHtml.tag`<a href="tg://user?id=${user.id}">&#8203;</a>`;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const reportHandler = async ctx => {
	if (!ctx.chat.type.endsWith('group')) return null;
	if (!ctx.message.reply_to_message) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Reply to message you\'d like to report</b>',
		).then(scheduleDeletion());
	}
	const admins = (await ctx.getChatAdministrators())
		.filter(isQualified)
		.map(adminMention);
	// eslint-disable-next-line max-len
	const s = TgHtml.tag`❗️ ${link(ctx.from)} <b>reported the message to the admins</b>.${TgHtml.join('', admins)}`;
	const report = await ctx.replyWithHTML(s, {
		reply_to_message_id: ctx.message.reply_to_message.message_id,
	});
	if (chats.report) {
		await ctx.tg.sendMessage(
			chats.report,
			TgHtml.tag`❗️ ${link(ctx.from)} reported <a href="${msgLink(
				ctx.message.reply_to_message,
			)}">a message</a> in ${ctx.chat.title}!`,
			{
				parse_mode: 'HTML',
				reply_markup: { inline_keyboard: [ [ {
					text: '✔️ Handled',
					callback_data: Cmd.stringify({
						command: 'del',
						flags: {
							chat_id: report.chat.id,
							msg_id: report.message_id,
						},
						reason: 'Report handled',
					}),
				} ] ] } },
		);
	}
	return null;
};

module.exports = reportHandler;
