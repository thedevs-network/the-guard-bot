'use strict';

const { chats = {} } = require('../../config');

function getUsername(user) {
	let str = user.first_name;
	if (user.last_name) str += ' ' + user.last_name;
	if (user.username) str += ' (@' + user.username + ')';
	return str;
}
function log(ctx, next) {
	if (!chats.presenceLog) return next();
	if (ctx.updateSubTypes[0] === 'new_chat_members') {
		ctx.telegram.sendMessage(
			chats.presenceLog,
			ctx.message.new_chat_members.map(getUsername).join(', ') +
				' #joined ' + ctx.chat.title
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
