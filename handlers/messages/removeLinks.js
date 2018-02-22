'use strict';

// Utils
const { logError } = require('../../utils/log');

// Config
const {
	excludeLinks,
	warnInlineKeyboard,
} = require('../../config');
const reply_markup = { inline_keyboard: warnInlineKeyboard };


// DB
const { getUser } = require('../../stores/user');
const { listGroups } = require('../../stores/group');

const warn = require('../../actions/warn');

const removeLinks = async (ctx, next) => {
	const { message, state, update } = ctx;
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
		/(@\w+)|(\?start=)|(((t.me)|(telegram.(me|dog)))\/\w+(\/[A-Za-z0-9_-]+)?)/gi; // eslint-disable-line max-len

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

	const isAd = usernames.length && await Promise.all(usernames
		.map(async username => {

			// if is a bot with start link
			if (username.includes('?start=')) return true;

			// detect add if it's an invite link
			if (
				username.includes('/joinchat/') &&
				!knownLinks.some(knownLink => knownLink.includes(username))
			) {
				return true;
			}

			// detect if usernames are channels or public groups
			// and if they are ads
			username = username
				.replace(/.*((t.me)|(telegram.(me|dog)))\//gi, '@')
				.replace(/\/\d+/gi, '')
				.toLowerCase();

			try {
				const { type } = await ctx.telegram.getChat(username);
				if (!type) return false;
				if (
					!excludeLinks
						.some(knownLink =>
							knownLink
								.toLowerCase()
								.includes(username.replace('@', '')))
				) {
					return true;
				}
			} catch (err) {
				logError(err);
			}
			return false;
		}));

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
		isAd && isAd.some(item => item)
	) {
		const reason = 'Forwarded or linked channels/groups';
		const admin = ctx.botInfo;
		const userToWarn = ctx.from;
		ctx.deleteMessage(updateData.message_id);

		const warnMessage = await warn({ admin, reason, userToWarn });

		return ctx.replyWithHTML(warnMessage, { reply_markup });
	}
	return next();
};

module.exports = removeLinks;
