'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const {
	excludedChannels,
	excludedGroups,
	numberOfWarnsToBan
} = require('../../config.json');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { ban, warn, getWarns } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const removeLinks = async ({ message, chat, reply, state }, next) => {
	const { isAdmin, user } = state;
	const groups = await listGroups();
	const groupLinks = excludedGroups !== '*' &&
		[
			...groups.map(group => group.link
				? group.link.split('/joinchat/')[1]
				: ''),
			...excludedGroups.map(group =>
				group.includes('/joinchat/')
					? group.split('/joinchat/')[1]
					: group)
		];
	if (
		message.forward_from_chat &&
		message.forward_from_chat.type !== 'private' &&
		excludedChannels !== '*' &&
		!excludedChannels.includes(message.forward_from_chat.username) ||
		message.text &&
		(message.text.includes('t.me') ||
			message.text.includes('telegram.me')) &&
		excludedGroups !== '*' &&
		!(excludedChannels.some(channel => message.text.includes(channel)) ||
			groupLinks.includes(message.text.split('/joinchat/')[1]))
	) {
		if (isAdmin) {
			return next();
		}
		const reason = 'Channel forward/link';
		await warn(user, reason);
		const warnCount = await getWarns(user);
		const promises = [
			bot.telegram.deleteMessage(chat.id, message.message_id)
		];
		if (warnCount.length < numberOfWarnsToBan) {
			promises.push(reply(
				`⚠️ ${link(user)} <b>got warned!</b> (${warnCount.length}/3)` +
				`\n\nReason: ${reason}`,
				replyOptions
			));
		} else {
			promises.push(bot.telegram.kickChatMember(chat.id, user.id));
			promises.push(ban(
				user,
				'Reached max number of warnings'
			));
			promises.push(reply(
				`🚫 ${link(user)} <b>got banned</b>! (${warnCount.length}/3)` +
				'\n\nReason: Reached max number of warnings',
				replyOptions
			));
		}
		try {
			await Promise.all(promises);
		} catch (err) {
			logError(err);
		}
		return next();
	}
	return next();
};

module.exports = removeLinks;
