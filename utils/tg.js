'use strict';

const escapeHtml = s => s
	.replace(/</g, '&lt;');

const link = ({ id, first_name }) =>
	`<a href="tg://user?id=${id}">${escapeHtml(first_name)}</a>`;

const quietLink = (user) =>
	user.username
		? `<a href="t.me/${user.username}">${escapeHtml(user.first_name)}</a>`
		: link(user);

/**
 * @param {number} ms
 * Deletes messages after (ms) milliseconds
 * @returns {undefined}
 */
const deleteAfter = ms => ctx =>
	setTimeout(() =>
		ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id),
	ms);

module.exports = {
	deleteAfter,
	escapeHtml,
	link,
	quietLink,
};
