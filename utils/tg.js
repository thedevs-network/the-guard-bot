// @ts-check
'use strict';

const millisecond = require('millisecond');
const { telegram } = require('../bot');

const { html, lrm } = require('./html');
const R = require('ramda');

const replyId = R.path([ 'reply_to_message', 'message_id' ]);

const { isCommand } = require('../utils/cmd');

const inlineKeyboard = (...inline_keyboard) =>
	({ reply_markup: { inline_keyboard } });

const msgLink = msg =>
	`https://t.me/c/${msg.chat.id.toString().slice(4)}/${msg.message_id}`;

const link = ({ id, first_name }) =>
	html`${lrm}<a href="tg://user?id=${id}">${first_name}</a> [<code>${id}</code>]`;

const quietLink = (user) =>
	user.username
		? html`<a href="t.me/${user.username}">${user.first_name}</a>`
		: html`<a href="tg://user?id=${user.id}">${user.first_name}</a>`;

const displayUser = user =>
	user.first_name
		? link(user)
		: html`[<code>${user.id}</code>]`;

/** @param {number | string | false} ms */
const deleteAfter = ms => (ctx, next) => {
	if (ms !== false) {
		setTimeout(ctx.deleteMessage, millisecond(ms));
	}
	next();
};

/** @param {number | string | false} ms */
const scheduleDeletion = (ms = 5 * 60 * 1000) => message => {
	const { chat, message_id } = message;

	if (chat.type !== 'private' && ms !== false) {
		message.timeout = setTimeout(
			() => telegram.deleteMessage(chat.id, message_id),
			millisecond(ms),
		);
	}

	return message;
};

module.exports = {
	deleteAfter,
	displayUser,
	inlineKeyboard,
	isCommand,
	link,
	msgLink,
	quietLink,
	replyId,
	scheduleDeletion,
};
