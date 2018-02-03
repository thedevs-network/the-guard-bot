'use strict';

const dedent = require('dedent-js');

const { context } = require('../bot');
const { link } = require('../utils/tg');
const { numberOfWarnsToBan } = require('../config');
const { warn } = require('../stores/user');
const ban = require('./ban');


module.exports = async (admin, userToWarn, reason) => {
	const { warns } = await warn(userToWarn, reason);


	const warnMessage =
		dedent(`⚠️ ${link(admin)} <b>warned</b> ${link(userToWarn)} <b>for</b>:

		${reason} (${warns.length}/${numberOfWarnsToBan})`);

	if (warns.length >= numberOfWarnsToBan) {
		await ban(
			context.botInfo,
			userToWarn,
			'Reached max number of warnings'
		);
		return warnMessage +
			'\n\n' +
			'🚫 The user was <b>banned</b> ' +
			`for receiving ${numberOfWarnsToBan} warnings!`;
	}

	return warnMessage;
};
