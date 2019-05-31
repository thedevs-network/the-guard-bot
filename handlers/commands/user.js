'use strict';

// Utils
const { parse, strip } = require('../../utils/parse');
const { scheduleDeletion } = require('../../utils/tg');

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
	html`${i + 1}. ${await formatEntry(warn, warn)}`;

const optional = (header, content) =>
	content
		? header + content + '\n'
		: '';

const getWarnsHandler = async ({ from, message, reply }) => {
	if (!from) {
		return reply(
			'ℹ️ <b>This command is not available in channels.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const { targets } = parse(message);

	if (targets.length > 1) {
		return reply(
			'ℹ️ <b>Specify one user.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const theUser = targets.length && from.status === 'admin'
		? await getUser(strip(targets[0]))
		: from;

	if (!theUser) {
		return reply(
			'❓ <b>User unknown.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const { id, first_name, last_name } = theUser;

	const userName = html`<b>Name:</b> ${first_name} ${last_name}\n`;
	const userId = `<b>ID:</b> <code>${id}</code>\n`;
	const userUsername = optional('<b>Username:</b> @', theUser.username);
	const banReason = optional(
		'\n🚫 <b>Ban reason:</b> ',
		await formatEntry(theUser.ban_details, theUser.ban_reason)
	);
	const userWarns = optional(
		'\n<b>⚠️ Warns:</b>\n',
		(await Promise.all(theUser.warns.map(formatWarn))).join('\n')
	);

	return reply(
		userName +
		userId +
		userUsername +
		userWarns +
		banReason,
		replyOptions
	).then(scheduleDeletion());
};

module.exports = getWarnsHandler;
