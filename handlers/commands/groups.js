'use strict';

const XRegExp = require('xregexp');

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

const emojiRegex = XRegExp.tag('gx')`
	[\uE000-\uF8FF]|
	\uD83C[\uDC00-\uDFFF]|
	\uD83D[\uDC00-\uDFFF]|
	[\u2011-\u26FF]|
	\uD83E[\uDD10-\uDDFF]`;

const stripEmoji = s => s.replace(emojiRegex, '');

const groupsHandler = async ({ replyWithHTML }) => {
	if (config.groupsString) {
		return replyWithHTML(config.groupsString);
	}

	const groups = await listVisibleGroups();

	groups.sort((a, b) =>
		stripEmoji(a.title).localeCompare(stripEmoji(b.title)));

	const entries = groups.map(entry).join('\n');

	return replyWithHTML(`🛠 <b>Groups I manage</b>:\n\n${entries}`, {
		disable_web_page_preview: true,
		reply_markup,
	}).then(scheduleDeletion());
};

module.exports = groupsHandler;
