'use strict';

const link = user =>
	user.username
		? `<a href="https://t.me/${user.username}">${user.username}</a>`
		: `<code>${user.first_name}</code>`;

const deleteAfter = ms => ctx =>
	setTimeout(() =>
		ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id),
	ms);

module.exports = {
	deleteAfter,
	link
};
