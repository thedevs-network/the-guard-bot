'use strict';

const dedent = require('dedent-js');
const ms = require('millisecond');

const { context } = require('../bot');
const { escapeHtml, link } = require('../utils/tg');
const {
	expireWarnsAfter = Infinity,
	numberOfWarnsToBan,
} = require('../config');
const { warn } = require('../stores/user');
const ban = require('./ban');

const isNewerThan = date => warning => warning.date >= date;

module.exports = async ({ admin, amend, reason, userToWarn }) => {
	const by_id = admin.id;
	const date = new Date();

	const { warns } = await warn(
		userToWarn,
		{ by_id, date, reason },
		{ amend }
	);

	const recentWarns = warns.filter(isNewerThan(date - ms(expireWarnsAfter)));

	const isLastWarn = ', <b>last warning!</b>'
		.repeat(recentWarns.length === numberOfWarnsToBan - 1);

	const count = `${recentWarns.length}/${numberOfWarnsToBan}${isLastWarn}`;

	const warnMessage = dedent(`
		⚠️ ${link(admin)} <b>warned</b> ${link(userToWarn)} <b>for</b>:

		${escapeHtml(reason)} (${count})`);

	if (recentWarns.length >= numberOfWarnsToBan) {
		await ban({
			admin: context.botInfo,
			reason: 'Reached max number of warnings',
			userToBan: userToWarn,
		});
		return warnMessage +
			'\n\n' +
			'🚫 The user was <b>banned</b> ' +
			`for receiving ${numberOfWarnsToBan} warnings!`;
	}

	return warnMessage;
};
