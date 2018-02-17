'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');
const { telegram } = require('../../bot');

// DB
const { isAdmin, unadmin } = require('../../stores/user');
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

const unAdminHandler = async ({ message, reply, state }) => {
	const { isMaster } = state;
	if (!isMaster) return null;

	const userToUnadmin = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToUnadmin) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	if (!await isAdmin(userToUnadmin)) {
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
