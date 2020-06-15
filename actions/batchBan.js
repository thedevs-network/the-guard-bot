'use strict';

const { batchBan, ensureExists } = require('../stores/user');
const { displayUser } = require('../utils/tg');
const { TgHtml, lrm } = require('../utils/html');

module.exports = async ({ admin, reason, targets }) => {
	const by_id = admin.id;
	const date = new Date();

	await Promise.all(targets.map(ensureExists));

	const banned = await batchBan(targets, { by_id, date, reason });
	const bannedString = TgHtml.join(', ', banned.map(displayUser));

	return TgHtml.tag`
		${lrm}${admin.first_name} <b>banned</b> ${bannedString}.
		<b>Reason</b>: ${lrm}${reason}
	`;
};
