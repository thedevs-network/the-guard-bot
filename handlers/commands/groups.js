'use strict';

// Utils
const { escapeHtml } = require('../../utils/tg');

// Bot
const bot = require('../../bot');

// DB
const { listGroups } = require('../../stores/group');

const config = require('../../config.json');

const inline_keyboard = config.groupsInlineKeyboard;

const reply_markup = JSON.stringify({ inline_keyboard });

const entry = group => group.username
	? `- @${group.username}`
	: `- <a href="${group.link}">${escapeHtml(group.title)}</a>`;

const groupsHandler = async ({ chat, replyWithHTML }) => {
	if (config.groupsString) {
		return replyWithHTML(config.groupsString);
	}

	const groups = await listGroups();

	const entries = groups.map(entry).join('\n');

	const { message_id } = await replyWithHTML(
		`🛠 <b>Groups I manage</b>:\n\n${entries}`, {
			disable_web_page_preview: true,
			reply_markup,
		});

	return setTimeout(() =>
		bot.telegram.deleteMessage(chat.id, message_id), 5 * 60 * 1000);

};

module.exports = groupsHandler;
