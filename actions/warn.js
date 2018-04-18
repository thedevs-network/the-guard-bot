'use strict';

const dedent = require('dedent-js');

const { context } = require('../bot');
const { link } = require('../utils/tg');
const { numberOfWarnsToBan } = require('../config');
const { warn } = require('../stores/user');
const ban = require('./ban');


module.exports = async ({ admin, userToWarn, reason }) => {
	const by_id = admin.id;
	const date = new Date();

	const { warns } = await warn(userToWarn, { by_id, date, reason });

	const isLastWarn = ', <b>last warning!</b>'
		.repeat(warns.length === numberOfWarnsToBan - 1);

	const warnMessage = dedent(`
		⚠️ ${link(admin)} <b>warned</b> ${link(userToWarn)} <b>for</b>:

		${reason} (${warns.length}/${numberOfWarnsToBan}${isLastWarn})`);

	if (warns.length >= numberOfWarnsToBan) {
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
