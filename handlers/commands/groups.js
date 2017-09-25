'use strict';

// Utils
const { escapeHtml } = require('../../utils/tg');

// DB
const { listGroups } = require('../../stores/group');

const config = require('../../config.json');

const entry = group => group.username
	? `- @${group.username}`
	: `- <a href="${group.link}">${escapeHtml(group.title)}</a>`;

const groupsHandler = async ctx => {
	if (config.groupsString) {
		return ctx.replyWithHTML(config.groupsString);
	}

	const groups = await listGroups();

	const entries = groups.map(entry).join('\n');

	return ctx.replyWithHTML(`🛠 <b>Groups I manage</b>:\n\n${entries}`);

};

module.exports = groupsHandler;
