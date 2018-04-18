'use strict';

// Utils
const { scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { getUser } = require('../../stores/user');

const getWarnsHandler = async ({ message, reply, state }) => {
	const { isAdmin } = state;

	const mentionedUser = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: state.user;

	if (!isAdmin && mentionedUser.id !== state.user.id) return null;

	const theUser = await getUser({ id: mentionedUser.id });
	const { first_name, id, last_name, status, username, warns } = theUser;

	const userName = `<b>Name:</b> <code>${first_name} ${last_name}</code>\n`;
	const userId = `<b>ID:</b> <code>${id}</code>\n`;
	const userStatus = `<b>Status:</b> <code>${status}</code>\n`;
	const userUsername = username
		? `<b>Username:</b> @${username}\n`
		: '';
	const banReason = theUser.ban_reason
		? `\n🚫 <b>Ban reason:</b>\n<code>${theUser.ban_reason}</code>`
		: '';
	const userWarns = warns.length
		? '\n<b>⚠️ Warns:</b>\n' + warns
			.map((warn, i) => `${i + 1}. ${warn.reason || warn}`)
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
	).then(scheduleDeletion);
};

module.exports = getWarnsHandler;
