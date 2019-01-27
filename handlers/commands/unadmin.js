'use strict';

// Utils
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');
const { parse, strip } = require('../../utils/parse');

// Bot
const { replyOptions } = require('../../bot/options');
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

const unAdminHandler = async ({ from, message, reply }) => {
	if (!isMaster(from)) return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return reply(
			'ℹ️ <b>Specify one user to unadmin.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const userToUnadmin = await getUser(strip(targets[0]));

	if (!userToUnadmin) {
		return reply(
			'❓ <b>User unknown.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	if (userToUnadmin.status !== 'admin') {
		return reply(
			`ℹ️ ${link(userToUnadmin)} <b>is not admin.</b>`,
			replyOptions
		);
	}

	tgUnadmin(userToUnadmin);

	try {
		await unadmin(userToUnadmin);
	} catch (err) {
		logError(err);
	}

	return reply(
		`❗️ ${link(userToUnadmin)} <b>is no longer admin.</b>`,
		replyOptions
	);
};

module.exports = unAdminHandler;
