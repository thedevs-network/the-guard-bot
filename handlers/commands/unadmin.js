'use strict';

// Utils
const { html } = require('../../utils/html');
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/cmd');

// Bot
const { telegram } = require('../../bot');

// DB
const { getUser, unadmin } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const noop = Function.prototype;

const tgUnadmin = async (userToUnadmin) => {
	for (const group of await listGroups()) {
		telegram.promoteChatMember(group.id, userToUnadmin.id, {
			can_change_info: false,
			can_delete_messages: false,
			can_invite_users: false,
			can_pin_messages: false,
			can_promote_members: false,
			can_restrict_members: false,
		}).catch(noop);
	}
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const unAdminHandler = async ({ from, message, replyWithHTML }) => {
	if (!isMaster(from)) return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return replyWithHTML(
			'ℹ️ <b>Specify one user to unadmin.</b>',
		).then(scheduleDeletion());
	}

	const userToUnadmin = await getUser(strip(targets[0]));

	if (!userToUnadmin) {
		return replyWithHTML(
			'❓ <b>User unknown.</b>',
		).then(scheduleDeletion());
	}

	if (userToUnadmin.status !== 'admin') {
		return replyWithHTML(
			html`ℹ️ ${link(userToUnadmin)} <b>is not admin.</b>`,
		);
	}

	await tgUnadmin(userToUnadmin);

	await unadmin(userToUnadmin);

	return replyWithHTML(
		html`❗️ ${link(userToUnadmin)} <b>is no longer admin.</b>`,
	);
};

module.exports = unAdminHandler;
