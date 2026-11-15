// @ts-check
'use strict';

const helpHandler = require('./help');
const staffHandler = require('./staff');

/** @param { import('../../typings/context').ExtendedContext } ctx */
module.exports = ctx => {
	if (ctx.chat?.type === 'private' && ctx.message?.text?.trim().split(/\s+/)[1] === 'staff') {
		return staffHandler(ctx);
	}

	return helpHandler(ctx);
};
