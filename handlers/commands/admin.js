'use strict';

// Utils
const { html } = require('../../utils/html');
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/cmd');

// DB
const {
	admin,
	getUser,
} = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const adminHandler = async (ctx) => {
	if (!isMaster(ctx.from)) return null;

	const { targets } = parse(ctx.message);

	if (targets.length > 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Specify one user to promote.</b>',
		).then(scheduleDeletion());
	}

	const userToAdmin = targets.length
		? await getUser(strip(targets[0]))
		: ctx.from;

	if (!userToAdmin) {
		return ctx.replyWithHTML(
			'❓ <b>User unknown.</b>\n' +
			'Please forward their message, then try again.',
		).then(scheduleDeletion());
	}

	if (userToAdmin.status === 'banned') {
		return ctx.replyWithHTML('ℹ️ <b>Can\'t admin banned user.</b>');
	}

	if (userToAdmin.status === 'admin') {
		return ctx.replyWithHTML(
			html`⭐️ ${link(userToAdmin)} <b>is already admin.</b>`,
		);
	}

	await admin(userToAdmin);

	return ctx.replyWithHTML(html`⭐️ ${link(userToAdmin)} <b>is now admin.</b>`);
};

module.exports = adminHandler;
