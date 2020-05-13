'use strict';

// Utils
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { html } = require('../../utils/html');
const { logError } = require('../../utils/log');
const { parse, strip } = require('../../utils/cmd');

// DB
const { listGroups } = require('../../stores/group');
const { getUser, unban } = require('../../stores/user');

const noop = Function.prototype;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const unbanHandler = async ({ from, message, replyWithHTML, telegram }) => {
	if (!from || from.status !== 'admin') return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return replyWithHTML(
			'ℹ️ <b>Specify one user to unban.</b>',
		).then(scheduleDeletion());
	}

	const userToUnban = await getUser(strip(targets[0]));

	if (!userToUnban) {
		return replyWithHTML(
			'❓ <b>User unknown.</b>',
		).then(scheduleDeletion());
	}


	if (userToUnban.status !== 'banned') {
		return replyWithHTML('ℹ️ <b>User is not banned.</b>');
	}

	const groups = await listGroups();

	const unbans = groups.map(group =>
		telegram.unbanChatMember(group.id, userToUnban.id));

	try {
		await Promise.all(unbans);
	} catch (err) {
		logError(err);
	}

	try {
		await unban(userToUnban);
	} catch (err) {
		logError(err);
	}

	telegram.sendMessage(
		userToUnban.id,
		'♻️ You were unbanned from all of the /groups!',
	).catch(noop);
	// it's likely that the banned person haven't PMed the bot,
	// which will cause the sendMessage to fail,
	// hance .catch(noop)
	// (it's an expected, non-critical failure)


	return replyWithHTML(html`
		♻️ ${from.first_name} <b>unbanned</b> ${displayUser(userToUnban)}.
	`);
};

module.exports = unbanHandler;
