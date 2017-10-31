'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { listGroups } = require('../../stores/group');
const { getWarns, unwarn } = require('../../stores/user');

const unwarnHandler = async ({ message, reply, state, telegram }) => {
	const { isAdmin, user } = state;
	if (!isAdmin) return null;

	const userToUnwarn = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToUnwarn) {
		return reply('ℹ️ <b>Reply to a message or mention a user.</b>',
			replyOptions).then(scheduleDeletion);
	}

	const allWarns = await getWarns(userToUnwarn);

	if (!allWarns) {
		return reply(`ℹ️ ${link(userToUnwarn)} <b>already has no warnings.</b>`,
			replyOptions);
	}

	const groups = await listGroups();

	groups.forEach(group =>
		telegram.unbanChatMember(group.id, userToUnwarn.id));

	await unwarn(userToUnwarn);

	return reply(
		`❎ ${link(user)} <b>pardoned</b> ${link(userToUnwarn)} ` +
		`<b>for:</b>\n\n${allWarns[allWarns.length - 1]}` +
		` (${allWarns.length - 1}/3)`,
		replyOptions);
};


module.exports = unwarnHandler;
