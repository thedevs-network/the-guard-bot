'use strict';

const { last } = require('ramda');
const XRegExp = require('xregexp');

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

const dateRegex = XRegExp.tag('nix')`^
	\d{4}       # year
	-\d{2}      # month
	(-\d{2}     # day
	([T\s]\d{2} # hour
	(:\d{2}     # min
	(:\d{2}     # sec
	(.\d{3}Z?   # ms
	)?)?)?)?)?
$`;

const unwarnHandler = async ({ from, message, reply, telegram }) => {
	if (!from || from.status !== 'admin') return null;

	const { reason, targets } = parse(message);

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

	let lastWarn;
	if (!reason) {
		lastWarn = last(allWarns);
	} else if (dateRegex.test(reason)) {
		const normalized = reason.replace(' ', 'T').toUpperCase();
		lastWarn = allWarns.find(({ date }) =>
			date && date.toISOString().startsWith(normalized));
	} else {
		return reply(
			'⚠ <b>Invalid date</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	if (!lastWarn) {
		return reply(
			'❓ <b>404: Warn not found</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	await unwarn(userToUnwarn, lastWarn);

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

	return reply(
		`❎ ${link(from)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${escapeHtml(lastWarn.reason || lastWarn)}` +
		` (${allWarns.length - 1}/${numberOfWarnsToBan})`,
		replyOptions
	);
};


module.exports = unwarnHandler;
