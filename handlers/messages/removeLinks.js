'use strict';

// Utils
const { link } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const {
	excludeLinks,
	numberOfWarnsToBan,
	warnInlineKeyboard,
} = require('../../config');
const reply_markup = { inline_keyboard: warnInlineKeyboard };


// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { ban, warn, getWarns, getUser } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const removeLinks = async ({ message, chat, reply, state, update }, next) => {
	const { isAdmin: isStateAdmin, user: stateUser } = state;
	const user = stateUser ||
		await getUser({ id: update.edited_message.from.id });
	const isAdmin = isStateAdmin || user.status === 'admin';
	const updateData = message || update.edited_message;
	const { entities, caption, forward_from_chat, text } = updateData;
	const managedGroups = await listGroups();

	if (
		updateData.chat.type === 'private' ||
		isAdmin ||
		!excludeLinks) {
		return next();
	}

	// gather both managed groups and config excluded links
	const knownLinks = [
		...managedGroups.map(group => group.link || ''),
		...excludeLinks
	];

	const regexp =
		/(@\w+)|(\?start=)|(((t.me)|(telegram.(me|dog)))\/\w+(\/[A-Za-z0-9_-]+)?)/g; // eslint-disable-line max-len

	const usernames =
		text
			? text.match(regexp) || []
			: [];

	// check for links in the caption
	if (caption) {
		const linksInCaption = caption.match(regexp);
		if (linksInCaption) {
			usernames.push(...linksInCaption);
		}
	}

	// checked for linked texts
	if (entities && entities.some(entity => entity.url)) {
		usernames.push(...entities
			.filter(entity => entity.url)
			.map(entity => entity.url));
	}

	const isAd = await Promise.all(usernames
		? usernames.map(username => new Promise(async (resolve) => {

			// if is a bot with start link
			if (username.includes('?start=')) return resolve(true);

			// detect add if it's an invite link
			if (
				username.includes('/joinchat/') &&
				!knownLinks.some(knownLink => knownLink.includes(username))
			) {
				return resolve(true);
			}

			// detect if usernames are channels or public groups
			// and if they are ads
			username = username
				.replace(/.*((t.me)|(telegram.(me|dog)))\//gi, '@')
				.replace(/\/\d+/gi, '')
				.toLowerCase();

			try {
				const { type } = await bot.telegram.getChat(username);
				if (!type) return resolve(false);
				if (
					!excludeLinks
						.some(knownLink =>
							knownLink
								.toLowerCase()
								.includes(username.replace('@', '')))
				) {
					return resolve(true);
				}
			} catch (err) {
				logError(err);
			}
			return resolve(false);
		}))
		: '');

	const domains = [ 't.me', 'telegram.me', 'telegram.dog' ];

	if (
		// check if is forwarded from channel
		forward_from_chat &&
		forward_from_chat.type !== 'private' &&
		excludeLinks &&
		!excludeLinks.includes(forward_from_chat.username) ||

		// check if text contains link/username of a channel or group
		(caption ||
			text &&
			(domains.some(item => text.includes(item)) ||
				entities && entities.some(entity =>
					entity.type === 'mention' ||
					entity.url))) &&
		isAd
	) {
		const reason = 'Forwarded or linked channels/groups';
		await warn(user, reason);
		const warnCount = await getWarns(user);
		const promises = [
			bot.telegram.deleteMessage(chat.id, updateData.message_id)
		];
		if (warnCount.length < numberOfWarnsToBan) {
			promises.push(reply(
				`⚠️ ${link(user)} <b>got warned!</b> ` +
				`(${warnCount.length}/${numberOfWarnsToBan})` +
				`\n\nReason: ${reason}`,
				{ parse_mode: 'HTML', reply_markup }
			));
		} else {
			promises.push(bot.telegram.kickChatMember(chat.id, user.id));
			promises.push(ban(
				user,
				'Reached max number of warnings'
			));
			promises.push(reply(
				`🚫 ${link(user)} <b>got banned</b>! ` +
				`(${warnCount.length}/${numberOfWarnsToBan})` +
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
