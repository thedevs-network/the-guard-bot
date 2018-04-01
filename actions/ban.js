'use strict';

const dedent = require('dedent-js');

const { telegram } = require('../bot');
const { link } = require('../utils/tg');

const { listGroups } = require('../stores/group');
const { ban } = require('../stores/user');

const displayUser = user =>
	user.first_name
		? link(user)
		: `a user with id <code>${user.id}</code>`;

module.exports = async ({ admin, userToBan, reason }) => {
	// move some checks from handler here?

	await ban(userToBan, reason);

	const groups = await listGroups();

	groups.forEach(group =>
		telegram.kickChatMember(group.id, userToBan.id));

	return dedent(`
		🚫 ${link(admin)} <b>banned</b> ${displayUser(userToBan)} <b>for:</b>

		${reason}`);
};
