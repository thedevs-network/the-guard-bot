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
	const { entities, forward_from_chat, text } = message;
	const managedGroups = await listGroups();
	const shouldRemoveGroups = excludedGroups !== '*';
	const shouldRemoveChannels = excludedChannels !== '*';

	if (
		message.chat.type === 'private' ||
		isAdmin ||
		!shouldRemoveGroups &&
		!shouldRemoveChannels) {
		return next();
	}

	// gather both managed groups and config excluded groups
	const knownGroups = [
		...managedGroups.map(group => group.link
			? group.link
			: ''),
		...excludedGroups
	];

	// collect channels/supergroups usernames in the text
	let isChannelAd = false;
	let isGroupAd = false;
	const regexp = /(@\w+)|(((t.me)|(telegram.me))\/\w+(\/[A-Za-z0-9_-]+)?)/g;
	const usernames =
		text
			? text.match(regexp)
			: [];

	await Promise.all(usernames.map(username => new Promise(async (resolve) => {
		// skip if already detected an ad
		if (isChannelAd || isGroupAd) return resolve();

		// detect add if it's an invite link
		if (
			username.includes('/joinchat/') &&
			!knownGroups.some(group => group.includes(username))
		) {
			isGroupAd = true;
			return resolve();
		}

		// detect if usernames are channels or public groups
		// and if they are ads
		username = username.replace(/.*((t.me)|(telegram.me))\//gi, '@');
		try {
			const { type } = await bot.telegram.getChat(username);
			if (!type) return resolve();
			if (
				type === 'channel' &&
				shouldRemoveChannels &&
				!excludedChannels
					.some(channel =>
						channel.includes(username.replace('@', '')))
			) {
				isChannelAd = true;
				return resolve();
			}
			if (
				type === 'supergroup' &&
				shouldRemoveGroups &&
				!knownGroups
					.some(group =>
						group.includes(username.replace('@', '')))
			) {
				isGroupAd = true;
				return resolve();
			}
		} catch (err) {
			return resolve();
		}
		return resolve();
	})));

	if (
		// check if is forwarded from channel
		forward_from_chat &&
		forward_from_chat.type !== 'private' &&
		shouldRemoveChannels &&
		!excludedChannels.includes(forward_from_chat.username) ||

		// check if text contains link/username of a channel or group
		text &&
		(text.includes('t.me') ||
			text.includes('telegram.me') ||
			entities && entities.some(entity => entity.type === 'mention')) &&
		(isChannelAd || isGroupAd)
	) {
		const reason = 'Forwarded or linked channels/groups';
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
