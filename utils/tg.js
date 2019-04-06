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
	.replace(/&/g, '&amp;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;')
	.replace(/</g, '&lt;');

const msgLink = msg =>
	`https://t.me/c/${msg.chat.id.toString().slice(4)}/${msg.message_id}`;

const link = ({ id, first_name }) =>
	`<a href="tg://user?id=${id}">${escapeHtml(first_name)}</a>`;

const quietLink = (user) =>
	user.username
		? `<a href="t.me/${user.username}">${escapeHtml(user.first_name)}</a>`
		: link(user);

const displayUser = user =>
	user.first_name
		? link(user)
		: `an user with id <code>${user.id}</code>`;

/**
 * @param {number} ms
 * Deletes messages after (ms) milliseconds
 * @returns {undefined}
 */
const deleteAfter = ms => (ctx, next) => {
	setTimeout(ctx.deleteMessage, ms);
	next();
};

const scheduleDeletion = (ms = 5 * 60 * 1000) => message => {
	const { chat, message_id } = message;

	if (chat.type !== 'private' && ms !== false) {
		message.timeout = setTimeout(
			() => telegram.deleteMessage(chat.id, message_id),
			millisecond(ms)
		);
	}

	return message;
};

module.exports = {
	deleteAfter,
	displayUser,
	escapeHtml,
	isCommand,
	link,
	msgLink,
	quietLink,
	scheduleDeletion,
};
