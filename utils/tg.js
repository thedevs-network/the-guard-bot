'use strict';

const escapeHtml = s => s
	.replace(/</g, '&lt;');

const link = ({ id, first_name }) =>
	`<a href="tg://user?id=${id}">${escapeHtml(first_name)}</a>`;

const deleteAfter = ms => ctx =>
	setTimeout(() =>
		ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id),
	ms);

module.exports = {
	deleteAfter,
	link
};
