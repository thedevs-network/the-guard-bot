'use strict';

// Utils
const { escapeHtml } = require('../../utils/tg');

// DB
const { listGroups } = require('../../stores/groups');

const config = require('../../config.json');

const entry = group =>
	'» ' + (group.username
		? '@' + group.username
		: escapeHtml(group.title));

const groupsHandler = async ctx => {
	if (config.groupsString) {
		return ctx.replyWithHTML(config.groupsString);
	}

	const groups = await listGroups();

	const entries = groups.map(entry).join('\n');

	return ctx.replyWithHTML(`<b>Groups I manage</b>:\n${entries}`);

	/* TODO: Obtain invite links as well, maybe cache them in db */
};

module.exports = groupsHandler;
