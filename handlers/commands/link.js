'use strict';

// DB
const { managesGroup } = require('../../stores/group');

const linkHandler = async ({ chat, replyWithHTML }) => {
	const group = await managesGroup(chat);

	return replyWithHTML(
		'ℹ️ <b>Group\'s link:</b>\n\n' +
		`<a href="${group.link}">${group.title}</a>`
	);
};

module.exports = linkHandler;
