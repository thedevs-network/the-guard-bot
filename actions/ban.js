'use strict';

const { displayUser } = require('../utils/tg');
const { html, lrm } = require('../utils/html');
const { pMap } = require('../utils/promise');
const { telegram } = require('../bot');

const { listVisibleGroups } = require('../stores/group');
const { ban } = require('../stores/user');

module.exports = async ({ admin, reason, userToBan }) => {
	// move some checks from handler here?

	const by_id = admin.id;
	const date = new Date();

	await ban(userToBan, { by_id, date, reason });

	await pMap(await listVisibleGroups(), group =>
		telegram.kickChatMember(group.id, userToBan.id));

	return html`
		🚫 ${lrm}${admin.first_name} <b>banned</b> ${displayUser(userToBan)}.
		<b>Reason</b>: ${lrm}${reason}
	`;
};
