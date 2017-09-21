'use strict';

const link = ({ id, username, first_name }) =>
	`<a href="tg://user?id=${id}">${username ? username : first_name}</a>`;

const deleteAfter = ms => ctx =>
	setTimeout(() =>
		ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id),
	ms);

module.exports = {
	deleteAfter,
	link
};
