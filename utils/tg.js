'use strict';

const millisecond = require('millisecond');
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

const scheduleDeletion = (ms = 5 * 60 * 1000) => chatObject => {
	const { chat, message_id } = chatObject;

	chatObject.timeout = chat.type === 'private' || ms !== 0 && !ms
		? {}
		: setTimeout(
			() => telegram.deleteMessage(chat.id, message_id),
			millisecond(ms)
		);

	return chatObject;
};

module.exports = {
	deleteAfter,
	escapeHtml,
	isCommand,
	link,
	quietLink,
	scheduleDeletion,
};
