'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser, nowarns } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const nowarnsHandler = async ({ message, reply, state, telegram }) => {
	const { isAdmin, user } = state;
	if (!isAdmin) return null;

	const userToUnwarn = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToUnwarn) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	const dbUser = await getUser({ id: userToUnwarn.id });

	const { warns } = dbUser;

	if (warns.length === 0) {
		return reply(
			`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
			replyOptions
		);
	}

	if (dbUser.status === 'banned') {
		const groups = await listGroups();

		groups.forEach(group =>
			telegram.unbanChatMember(group.id, userToUnwarn.id));
	}

	try {
		await nowarns(userToUnwarn);
	} catch (err) {
		logError(err);
	}

	return reply(
		`♻️ ${link(user)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		'<b>for all of their warnings.</b>',
		replyOptions
	);
};


module.exports = nowarnsHandler;
