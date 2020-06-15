// @ts-check
'use strict';

const { context } = require('../bot');
const { html, lrm } = require('../utils/html');
const { link } = require('../utils/tg');
const { isWarnNotExpired } = require('../utils/config');
const { numberOfWarnsToBan } = require('../utils/config').config;
const { warn } = require('../stores/user');
const ban = require('./ban');


const cmp = (a, b) => Math.sign(a - b);

module.exports = async ({ admin, amend, reason, userToWarn }) => {
	const by_id = admin.id;
	const date = new Date();

	const { warns } = await warn(
		userToWarn,
		{ by_id, date, reason },
		{ amend },
	);

	const recentWarns = warns.filter(isWarnNotExpired(date));

	const count = {
		'-1': html`<b>${recentWarns.length}</b>/${numberOfWarnsToBan}`,
		0: html`<b>Final warning</b>`,
		// eslint-disable-next-line max-len
		1: html`<b>${recentWarns.length}</b>/${numberOfWarnsToBan} (🚫 <b>banned</b>)`,
	}[cmp(recentWarns.length + 1, numberOfWarnsToBan)];

	const warnMessage = html`
		⚠️ ${lrm}${admin.first_name} <b>warned</b> ${link(userToWarn)}.
		${count}: ${lrm}${reason}
	`;

	if (recentWarns.length >= numberOfWarnsToBan) {
		await ban({
			admin: context.botInfo,
			reason: 'Reached max number of warnings',
			userToBan: userToWarn,
		});
	}

	return warnMessage;
};
