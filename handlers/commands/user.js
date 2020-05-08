// @ts-check
'use strict';

// Utils
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { isMaster, isWarnNotExpired } = require('../../utils/config');
const { parse, strip } = require('../../utils/cmd');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser } = require('../../stores/user');

const html = require('tg-html');

const formatDate = date =>
	date && date.toISOString().slice(0, -5).replace('T', ' ');

const formatEntry = async (entry, defaultVal) => {
	if (!entry || !entry.by_id) return defaultVal;
	const { first_name } = await getUser({ id: entry.by_id }) || {};
	if (!first_name) return html`${entry.reason} (${formatDate(entry.date)})`;
	return html`${entry.reason} (${first_name}, ${formatDate(entry.date)})`;
};

const formatWarn = async (warn, i) =>
	isWarnNotExpired(new Date())(warn)
		? html`${i + 1}. ${await formatEntry(warn, warn)}`
		: html`<del>${i + 1}. ${await formatEntry(warn, warn)}</del>`;

const optional = (header, content) =>
	content
		? header + content + '\n'
		: '';

const title = user => {
	if (isMaster(user)) {
		return html`🕴️ <b>Bot master</b>`;
	} else if (user.status === 'admin') {
		return html`⭐️ <b>Admin</b>`;
	}
	return html`👤 <b>User</b>`;
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const getWarnsHandler = async ({ from, message, reply }) => {
	if (!from) {
		return reply(
			'ℹ️ <b>This command is not available in channels.</b>',
			replyOptions,
		).then(scheduleDeletion());
	}

	const { targets } = parse(message);

	if (targets.length > 1) {
		return reply(
			'ℹ️ <b>Specify one user.</b>',
			replyOptions,
		).then(scheduleDeletion());
	}

	const theUser = targets.length && from.status === 'admin'
		? await getUser(strip(targets[0]))
		: from;

	if (!theUser) {
		return reply(
			'❓ <b>User unknown.</b>',
			replyOptions,
		).then(scheduleDeletion());
	}

	const header = html`${title(theUser)} ${displayUser(theUser)}\n`;
	const banReason = optional(
		'\n🚫 <b>Ban reason:</b> ',
		await formatEntry(theUser.ban_details, theUser.ban_reason),
	);
	const { warns = [] } = theUser;
	const userWarns = optional(
		'\n<b>⚠️ Warns:</b>\n',
		(await Promise.all(warns.map(formatWarn))).join('\n'),
	);

	return reply(
		header +
		userWarns +
		banReason,
		replyOptions,
	).then(scheduleDeletion());
};

module.exports = getWarnsHandler;
