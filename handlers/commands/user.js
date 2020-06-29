// @ts-check
'use strict';

// Utils
const { inspect } = require('util');
const { displayUser, scheduleDeletion } = require('../../utils/tg');
const { html, lrm, TgHtml } = require('../../utils/html');
const { isMaster, isWarnNotExpired } = require('../../utils/config');
const { parse, strip } = require('../../utils/cmd');

// DB
const { getUser, permit } = require('../../stores/user');

/** @param {Date} date */
const formatDate = date =>
	date && date.toISOString().slice(0, -5).replace('T', ' ');

/**
 * @param {string} defaultVal
 */
const formatEntry = async (entry, defaultVal) => {
	if (!entry || !entry.by_id) return html`${defaultVal}`;
	const { first_name } = await getUser({ id: entry.by_id }) || {};
	if (!first_name) return html`${lrm}${entry.reason} (${formatDate(entry.date)})`;
	return html`${lrm}${entry.reason} (${first_name}, ${formatDate(entry.date)})`;
};

const formatWarn = async (warn, i) =>
	isWarnNotExpired(new Date())(warn)
		? html`${i + 1}. ${await formatEntry(warn, warn)}`
		: html`<del>${i + 1}. ${await formatEntry(warn, warn)}</del>`;

/**
 * @param {string | TgHtml | undefined } content
 */
const isNotEmpty = content => content?.length;

const optional = (header, sep, content) =>
	isNotEmpty(content)
		? html`${header}${sep}${content}`
		: html``;

const title = user => {
	if (isMaster(user)) {
		return html`🕴️ <b>Bot master</b>`;
	} else if (user.status === 'admin') {
		return html`⭐️ <b>Admin</b>`;
	}
	return html`👤 <b>User</b>`;
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const getWarnsHandler = async ({ from, message, replyWithHTML }) => {
	if (!from) {
		return replyWithHTML(
			'ℹ️ <b>This command is not available in channels.</b>',
		).then(scheduleDeletion());
	}

	const { flags, targets } = parse(message);

	if (targets.length > 1) {
		return replyWithHTML(
			'ℹ️ <b>Specify one user.</b>',
		).then(scheduleDeletion());
	}

	const theUser = targets.length && from.status === 'admin'
		? await getUser(strip(targets[0]))
		: from;

	if (!theUser) {
		return replyWithHTML(
			'❓ <b>User unknown.</b>',
		).then(scheduleDeletion());
	}

	if (flags.has('raw') && from.status === 'admin') {
		return replyWithHTML(
			TgHtml.pre(inspect(theUser)),
		).then(scheduleDeletion());
	}

	const header = html`${title(theUser)} ${displayUser(theUser)}`;
	const banReason = optional(
		html`🚫 <b>Ban reason:</b>`,
		' ',
		await formatEntry(theUser.ban_details, theUser.ban_reason || ''),
	);
	const { warns = [] } = theUser;
	const userWarns = optional(
		html`<b>⚠️ Warns:</b>`,
		'\n',
		TgHtml.join('\n', await Promise.all(warns.map(formatWarn))),
	);

	const firstSeen = optional(
		html`👀 <b>First seen:</b>`,
		' ',
		formatDate(theUser.createdAt),
	);

	const permitS = permit.isValid(theUser.permit)
		// eslint-disable-next-line max-len
		? `🎟 ${(await getUser({ id: theUser.permit.by_id })).first_name}, ${formatDate(theUser.permit.date)}`
		: '';

	const oneliners = TgHtml.join('\n', [
		header,
		firstSeen,
		permitS,
	].filter(isNotEmpty));

	return replyWithHTML(TgHtml.join('\n\n', [
		oneliners,
		userWarns,
		banReason,
	].filter(isNotEmpty))).then(scheduleDeletion());
};

module.exports = getWarnsHandler;
