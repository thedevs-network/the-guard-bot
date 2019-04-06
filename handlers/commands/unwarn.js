'use strict';

const { last } = require('ramda');

// Utils
const { escapeHtml, link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/parse');

// Config
const { numberOfWarnsToBan } = require('../../config');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { listGroups } = require('../../stores/group');
const { getUser, unwarn } = require('../../stores/user');

const noop = Function.prototype;

const unwarnHandler = async ({ from, message, reply, telegram }) => {
	if (!from || from.status !== 'admin') return null;

	const { targets } = parse(message);

	if (targets.length !== 1) {
		return reply(
			'ℹ️ <b>Specify one user to unwarn.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const userToUnwarn = await getUser(strip(targets[0]));

	if (!userToUnwarn) {
		return reply(
			'❓ <b>User unknown</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const allWarns = userToUnwarn.warns;

	if (allWarns.length === 0) {
		return reply(
			`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
			replyOptions
		);
	}

	if (userToUnwarn.status === 'banned') {
		const groups = await listGroups();

		groups.forEach(group =>
			telegram.unbanChatMember(group.id, userToUnwarn.id));
	}

	await unwarn(userToUnwarn);

	if (userToUnwarn.status === 'banned') {
		telegram.sendMessage(
			userToUnwarn.id,
			'♻️ You were unbanned from all of the /groups!'
		).catch(noop);
		// it's likely that the banned person haven't PMed the bot,
		// which will cause the sendMessage to fail,
		// hance .catch(noop)
		// (it's an expected, non-critical failure)
	}

	const lastWarn = last(allWarns);

	return reply(
		`❎ ${link(from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${escapeHtml(lastWarn.reason || lastWarn)}` +
		` (${allWarns.length - 1}/${numberOfWarnsToBan})`,
		replyOptions
	);
};


module.exports = unwarnHandler;
