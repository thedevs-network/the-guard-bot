'use strict';

const { chats = {} } = require('../../utils/config').config;

function getUsername(user) {
	let str = user.first_name;
	if (user.last_name) str += ' ' + user.last_name;
	if (user.username) str += ' (@' + user.username + ')';
	return str;
}

function getId(user) {
	return user.id;
}

/** @param { import('../../typings/context').ExtendedContext } ctx */
function log(ctx, next) {
	if (!chats.presenceLog) return next();
	if (ctx.updateSubTypes[0] === 'new_chat_members') {
		ctx.telegram.sendMessage(
			chats.presenceLog,
			ctx.message.new_chat_members.map(getUsername).join(', ') +
				' #joined ' + ctx.chat.title,
			{ reply_markup: { inline_keyboard: [ [ {
				text: '🚫 Ban all',
				callback_data: `/ban ${
					ctx.message.new_chat_members
						.map(getId)
						.join(' ')} [joining]`
			} ] ] } }
		);
	} else if (ctx.updateSubTypes[0] === 'left_chat_member') {
		ctx.telegram.sendMessage(
			chats.presenceLog,
			getUsername(ctx.message.left_chat_member) +
				' #left ' + ctx.chat.title
		);
	}
	return next();
}
module.exports = log;
