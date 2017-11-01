'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser, getWarns } = require('../../stores/user');

const getWarnsHandler = async ({ message, reply, state }) => {
	const { isAdmin } = state;
	if (!isAdmin) return null;

	const mentionedUser = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;
	if (!mentionedUser) {
		return reply(
			'ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	const theUser = await getUser({ id: mentionedUser.id });

	if (theUser.status === 'admin') {
		return reply(
			`⭐️ ${link(theUser)} <b>is admin.</b>`,
			replyOptions
		).then(scheduleDeletion);
	}

	let i = 0;
	const warns = await getWarns(theUser);
	const warnsMessage = warns
		? '⚠️ <b>Warns:</b>\n' +
		warns
			.map(warn => ++i + '. ' + warn)
			.join('\n')
		: '✅ <b>no warns</b>';

	if (theUser.status === 'banned') {
		return reply(
			`🚫 ${link(theUser)} <b>is banned for:</b>\n` +
			`${theUser.banReason}\n\n` +
			warnsMessage,
			replyOptions
		);
	}

	return reply(
		`ℹ️ ${link(theUser)} <b>is a member of network.</b>\n\n` +
		warnsMessage,
		replyOptions
	);
};

module.exports = getWarnsHandler;
