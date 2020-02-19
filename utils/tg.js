'use strict';

const millisecond = require('millisecond');
const { telegram } = require('../bot');

const html = require('tg-html');
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

const inlineKeyboard = (...inline_keyboard) =>
	({ reply_markup: { inline_keyboard } });

const msgLink = msg =>
	`https://t.me/c/${msg.chat.id.toString().slice(4)}/${msg.message_id}`;

const link = ({ id, first_name }) =>
	html`<a href="tg://user?id=${id}">${first_name}</a>`;

const quietLink = (user) =>
	user.username
		? html`<a href="t.me/${user.username}">${user.first_name}</a>`
		: link(user);

const displayUser = user =>
	user.first_name
		? link(user)
		: html`an user with id <code>${user.id}</code>`;

/**
 * @param {number} ms
 * Deletes messages after (ms) milliseconds
 * @returns {undefined}
 */
const deleteAfter = ms => (ctx, next) => {
	if (ms !== false) {
		setTimeout(ctx.deleteMessage, millisecond(ms));
	}
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
	inlineKeyboard,
	isCommand,
	link,
	msgLink,
	quietLink,
	scheduleDeletion,
};
