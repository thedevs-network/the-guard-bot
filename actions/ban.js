'use strict';

const dedent = require('dedent-js');

const { escapeHtml, displayUser, link } = require('../utils/tg');
const { telegram } = require('../bot');

const { listGroups } = require('../stores/group');
const { ban } = require('../stores/user');

module.exports = async ({ admin, reason, userToBan }) => {
	// move some checks from handler here?

	const by_id = admin.id;
	const date = new Date();

	await ban(userToBan, { by_id, date, reason });

	const groups = await listGroups();

	groups.forEach(group =>
		telegram.kickChatMember(group.id, userToBan.id));

	return dedent(`
		🚫 ${link(admin)} <b>banned</b> ${displayUser(userToBan)} <b>for:</b>

		${escapeHtml(reason)}`);
};
