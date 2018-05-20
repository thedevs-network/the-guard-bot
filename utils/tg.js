'use strict';

const { telegram } = require('../bot');

const R = require('ramda');

const isCommand = R.pipe(
	R.defaultTo({}),
	R.path([ 'entities', 0 ]),
	R.defaultTo({}),
	R.whereEq({ offset: 0, type: 'bot_command' }),
);

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
const deleteAfter = ms => (ctx, next) => {
	setTimeout(ctx.deleteMessage, ms);
	next();
};

const scheduleDeletion = ({ chat, message_id }) => {
	if (chat.type === 'private') {
		return null;
	}
	return setTimeout(
		() => telegram.deleteMessage(chat.id, message_id),
		5 * 60 * 1000
	);
};

module.exports = {
	deleteAfter,
	escapeHtml,
	isCommand,
	link,
	quietLink,
	scheduleDeletion,
};
