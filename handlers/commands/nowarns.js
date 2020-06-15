// @ts-check
'use strict';

// Utils
const { html, lrm } = require('../../utils/html');
const { link, scheduleDeletion } = require('../../utils/tg');
const { parse, strip } = require('../../utils/cmd');
const { pMap } = require('../../utils/promise');

// DB
const { getUser, nowarns } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

// This handler is very similiar to commands/unban.
// When adding a feature here, please consider adding it there too.

/** @param { import('../../typings/context').ExtendedContext } ctx */
const nowarnsHandler = async (ctx) => {
	if (ctx.from?.status !== 'admin') return null;

	const { targets } = parse(ctx.message);

	if (targets.length !== 1) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Specify one user to pardon.</b>',
		).then(scheduleDeletion());
	}

	const userToUnwarn = await getUser(strip(targets[0]));

	if (!userToUnwarn) {
		return ctx.replyWithHTML(
			'❓ <b>User unknown.</b>',
		).then(scheduleDeletion());
	}

	const { warns } = userToUnwarn;

	if (warns.length === 0) {
		return ctx.replyWithHTML(
			html`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
		);
	}

	if (userToUnwarn.status === 'banned') {
		await pMap(await listGroups({ type: 'supergroup' }), (group) =>
			ctx.tg.unbanChatMember(group.id, userToUnwarn.id));
	}

	await nowarns(userToUnwarn);

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

	return ctx.loggedReply(html`
		♻️ ${lrm}${ctx.from.first_name} <b>pardoned</b> ${link(userToUnwarn)}
		for all of their warnings.
	`);
};


module.exports = nowarnsHandler;
