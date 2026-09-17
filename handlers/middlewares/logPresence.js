'use strict';

const { chats = {} } = require('../../utils/config').config;
const { getNewChatMembers } = require('../../utils/config');

function getUserLink(user) {
	const lastName = user.last_name ? ` ${user.last_name}` : '';
	const username = user.username ? ` @${user.username}` : '';
	return `<a href="tg://user?id=${user.id}">${user.first_name}${lastName}${username}</a> [<code>${user.id}</code>]`;
}

function getId(user) {
	return user.id;
}

/** @param { import('../../typings/context').ExtendedContext } ctx */
function log(ctx, next) {
	if (!chats.presenceLog) return next();
	const newChatMembers = getNewChatMembers(ctx.message);
	if (newChatMembers) {
		ctx.telegram
			.sendMessage(
				chats.presenceLog,
				newChatMembers.map(getUserLink).join(', ') +
					' #joined ' +
					ctx.chat.title,
				{
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: `🚫 Ban ${newChatMembers.length}`,
									callback_data: `/ban ${newChatMembers
										.map(getId)
										.join(' ')} [joining]`,
								},
							],
						],
					},
				}
			)
			.catch(() => null);
	}
	return next();
}
module.exports = log;
