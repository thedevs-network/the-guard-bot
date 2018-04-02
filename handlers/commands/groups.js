'use strict';

// Utils
const { escapeHtml, scheduleDeletion } = require('../../utils/tg');

// DB
const { listVisibleGroups } = require('../../stores/group');

const config = require('../../config');

const inline_keyboard = config.groupsInlineKeyboard;

const reply_markup = JSON.stringify({ inline_keyboard });

const entry = group => group.username
	? `- @${group.username}`
	: `- <a href="${group.link}">${escapeHtml(group.title)}</a>`;

const groupsHandler = async ({ replyWithHTML }) => {
	if (config.groupsString) {
		return replyWithHTML(config.groupsString);
	}

	const groups = await listVisibleGroups();

	const entries = groups.map(entry).join('\n');

	return replyWithHTML(`🛠 <b>Groups I manage</b>:\n\n${entries}`, {
		disable_web_page_preview: true,
		reply_markup,
	}).then(scheduleDeletion);
};

module.exports = groupsHandler;
