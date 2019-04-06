'use strict';

// Utils
const { parse, strip } = require('../../utils/parse');
const { escapeHtml, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser } = require('../../stores/user');

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
			'ℹ️ <b>Specify one user to promote.</b>',
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

	const { first_name, id, last_name, status, username, warns } = theUser;

	const userName = '<b>Name:</b> ' +
		`<code>${escapeHtml(first_name)} ${escapeHtml(last_name)}</code>\n`;
	const userId = `<b>ID:</b> <code>${id}</code>\n`;
	const userStatus = `<b>Status:</b> <code>${status}</code>\n`;
	const userUsername = username
		? `<b>Username:</b> @${username}\n`
		: '';
	const banReason = theUser.ban_reason
		? '\n🚫 <b>Ban reason:</b>\n' +
			`<code>${escapeHtml(theUser.ban_reason)}</code>`
		: '';
	const userWarns = warns.length
		? '\n<b>⚠️ Warns:</b>\n' + warns
			.map((warn, i) => `${i + 1}. ${escapeHtml(warn.reason || warn)}`)
			.join('\n') + '\n'
		: '';

	return reply(
		userName +
		userStatus +
		userId +
		userUsername +
		userWarns +
		banReason,
		replyOptions
	).then(scheduleDeletion());
};

module.exports = getWarnsHandler;
