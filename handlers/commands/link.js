'use strict';

// Utils
const { scheduleDeletion } = require('../../utils/tg');

// DB
const { managesGroup } = require('../../stores/group');

const linkHandler = async ({ chat, replyWithHTML }) => {
	const group = await managesGroup({ id: chat.id });

	return replyWithHTML(
		'ℹ️ <b>Group\'s link:</b>\n\n' +
		`<a href="${group.link}">${group.title}</a>`
	).then(scheduleDeletion);
};

module.exports = linkHandler;
