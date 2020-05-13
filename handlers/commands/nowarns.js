'use strict';

// Utils
const { html } = require('../../utils/html');
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');
const { parse, strip } = require('../../utils/cmd');

// DB
const { getUser, nowarns } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const noop = Function.prototype;

// This handler is very similiar to commands/unban.
// When adding a feature here, please consider adding it there too.

/** @param { import('../../typings/context').ExtendedContext } ctx */
const nowarnsHandler = async ({ from, message, replyWithHTML, telegram }) => {
	if (!from || from.status !== 'admin') return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return replyWithHTML(
			'ℹ️ <b>Specify one user to pardon.</b>',
		).then(scheduleDeletion());
	}

	const userToUnwarn = await getUser(strip(targets[0]));

	if (!userToUnwarn) {
		return replyWithHTML(
			'❓ <b>User unknown.</b>',
		).then(scheduleDeletion());
	}

	const { warns } = userToUnwarn;

	if (warns.length === 0) {
		return replyWithHTML(
			html`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
		);
	}

	if (userToUnwarn.status === 'banned') {
		const groups = await listGroups();

		groups.forEach(group =>
			telegram.unbanChatMember(group.id, userToUnwarn.id));
	}

	try {
		await nowarns(userToUnwarn);
	} catch (err) {
		logError(err);
	}

	if (userToUnwarn.status === 'banned') {
		telegram.sendMessage(
			userToUnwarn.id,
			'♻️ You were unbanned from all of the /groups!',
		).catch(noop);
		// it's likely that the banned person haven't PMed the bot,
		// which will cause the sendMessage to fail,
		// hance .catch(noop)
		// (it's an expected, non-critical failure)
	}

	return replyWithHTML(html`
		♻️ ${from.first_name} <b>pardoned</b> ${link(userToUnwarn)}
		for all of their warnings.
	`);
};


module.exports = nowarnsHandler;
