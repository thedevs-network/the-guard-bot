'use strict';

const { chats = {} } = require('../../utils/config').config;

function getUserLink(user) {
	const lastName = user.last_name ? ` ${user.last_name}` : '';
	const username = user.username ? ` @${user.username}` : '';
	return `<a href="tg://user?id=${user.id}">${user.first_name}${lastName}${username}</a>`;
}

function getId(user) {
	return user.id;
}

/** @param { import('../../typings/context').ExtendedContext } ctx */
function log(ctx, next) {
	if (!chats.presenceLog) return next();
	if (ctx.updateSubTypes[0] === 'new_chat_members') {
		ctx.telegram
			.sendMessage(
				chats.presenceLog,
				ctx.message.new_chat_members.map(getUserLink).join(', ') +
					' #joined ' +
					ctx.chat.title,
				{
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: `🚫 Ban ${ctx.message.new_chat_members.length}`,
									callback_data: `/ban ${ctx.message.new_chat_members
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
