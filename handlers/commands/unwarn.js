// @ts-check
'use strict';

const { last } = require('ramda');
const XRegExp = require('xregexp');

// Utils
const { html, lrm } = require('../../utils/html');
const { link, scheduleDeletion } = require('../../utils/tg');
const { isWarnNotExpired } = require('../../utils/config');
const { parse, strip } = require('../../utils/cmd');
const { pMap } = require('../../utils/promise');

// Config
const { numberOfWarnsToBan } = require('../../utils/config').config;

// DB
const { listGroups } = require('../../stores/group');
const { getUser, unwarn } = require('../../stores/user');

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

/** @param { import('../../typings/context').ExtendedContext } ctx */
const unwarnHandler = async (ctx) => {
	if (ctx.from?.status !== 'admin') return null;

	const { reason, targets } = parse(ctx.message);

	if (targets.length !== 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Specify one user to unwarn.</b>',
		).then(scheduleDeletion());
	}

	const userToUnwarn = await getUser(strip(targets[0]));

	if (!userToUnwarn) {
		return ctx.replyWithHTML(
			'❓ <b>User unknown</b>',
		).then(scheduleDeletion());
	}

	const allWarns = userToUnwarn.warns.filter(isWarnNotExpired(new Date()));

	if (allWarns.length === 0) {
		return ctx.replyWithHTML(
			html`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
		);
	}

	if (userToUnwarn.status === 'banned') {
		await pMap(await listGroups({ type: 'supergroup' }), group =>
			ctx.tg.unbanChatMember(group.id, userToUnwarn.id));
	}

	let lastWarn;
	if (!reason) {
		lastWarn = last(allWarns);
	} else if (dateRegex.test(reason)) {
		const normalized = reason.replace(' ', 'T').toUpperCase();
		lastWarn = allWarns.find(({ date }) =>
			date && date.toISOString().startsWith(normalized));
	} else {
		return ctx.replyWithHTML(
			'⚠ <b>Invalid date</b>',
		).then(scheduleDeletion());
	}

	if (!lastWarn) {
		return ctx.replyWithHTML(
			'❓ <b>404: Warn not found</b>',
		).then(scheduleDeletion());
	}

	await unwarn(userToUnwarn, lastWarn);

	if (userToUnwarn.status === 'banned') {
		ctx.tg.sendMessage(
			userToUnwarn.id,
			'♻️ You were unbanned from all of the /groups!',
		).catch(() => null);
		// it's likely that the banned person haven't PMed the bot,
		// which will cause the sendMessage to fail,
		// hance .catch(noop)
		// (it's an expected, non-critical failure)
	}

	const count = html`<b>${allWarns.length}</b>/${numberOfWarnsToBan}`;

	return ctx.loggedReply(html`
		❎ ${lrm}${ctx.from.first_name} <b>pardoned</b> ${link(userToUnwarn)} for
		${count}: ${lrm}${lastWarn.reason || lastWarn}
	`);
};


module.exports = unwarnHandler;
