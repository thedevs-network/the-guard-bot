'use strict';

// Bot
const bot = require('../../bot');

// DB
const { managesGroup } = require('../../stores/group');

const linkHandler = async ({ chat, replyWithHTML }) => {
	const group = await managesGroup(chat);

	const { message_id } = await replyWithHTML(
		'ℹ️ <b>Group\'s link:</b>\n\n' +
		`<a href="${group.link}">${group.title}</a>`
	);
	return setTimeout(() =>
		bot.telegram.deleteMessage(chat.id, message_id), 5 * 60 * 1000);
};

module.exports = linkHandler;
