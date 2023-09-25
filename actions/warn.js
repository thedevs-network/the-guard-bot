// @ts-check
'use strict';

const { context } = require('../bot');
const { html, lrm } = require('../utils/html');
const { link } = require('../utils/tg');
const { isWarnNotExpired, expireWarnsAfter } = require('../utils/config');
const { numberOfWarnsToBan } = require('../utils/config').config;
const { warn } = require('../stores/user');
const ban = require('./ban');
const ms = require('millisecond');

/** @type {(n: number, d?: number) => string} */
const z = (n, d = 2) => String(n).padStart(d, '0');

/** @type {(d: Date) => string} */
const yyyymmdd = d => `${z(d.getFullYear(), 4)}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;

/** @type {(a: number, b: number) => number} */
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
		<i>${typeof expireWarnsAfter === 'undefined' || expireWarnsAfter === Infinity ? '' : `This warning expires on ${yyyymmdd(new Date(date.getTime() + ms(expireWarnsAfter)))}`}</i>
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
