// @ts-check
'use strict';

const XRegExp = require('xregexp');

// Utils
const { scheduleDeletion } = require('../../utils/tg');
const { TgHtml } = require('../../utils/html');

// DB
const { listVisibleGroups } = require('../../stores/group');

const { config } = require('../../utils/config');

const inline_keyboard = config.groupsInlineKeyboard;

const reply_markup = inline_keyboard && { inline_keyboard };

const entry = group => group.username
	? `- @${group.username}`
	: TgHtml.tag`- <a href="${group.link}">${group.title}</a>`;

const emojiRegex = XRegExp.tag('gx')`
	[\uE000-\uF8FF]|
	\uD83C[\uDC00-\uDFFF]|
	\uD83D[\uDC00-\uDFFF]|
	[\u2011-\u26FF]|
	\uD83E[\uDD10-\uDDFF]`;

const stripEmoji = s => s.replace(emojiRegex, '');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const groupsHandler = async ({ replyWithHTML }) => {
	const groups = await listVisibleGroups();

	groups.sort((a, b) =>
		stripEmoji(a.title).localeCompare(stripEmoji(b.title)));

	const entries = TgHtml.join('\n', groups.map(entry));

	return replyWithHTML(TgHtml.tag`🛠 <b>Groups I manage</b>:\n\n${entries}`, {
		disable_web_page_preview: true,
		reply_markup,
	}).then(scheduleDeletion());
};

module.exports = groupsHandler;
