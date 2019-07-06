"use strict";
const config = require('../../config');
function getUsername(user) {
	var str = "";
	if (user.first_name) str += user.first_name;
	if (user.last_name) str += " " + user.last_name;
	if (user.username) str += " @" + user.username;
	return str;
}
function log(ctx, next) {
	if (!("presenceLog" in config.chats) || !config.chats.presenceLog || config.chats.presenceLog === null) return next();
	if (ctx.updateSubTypes[0] === "new_chat_members") ctx.telegram.sendMessage(
		config.chats.presenceLog,
		ctx.message.new_chat_members.map(getUsername).join(", ") + " #joined " + ctx.chat.title
	);
	else if (ctx.updateSubTypes[0] === "left_chat_member") ctx.telegram.sendMessage(
		config.chats.presenceLog,
		getUsername(ctx.message.left_chat_member) + " #left " + ctx.chat.title
	);
	next();
}
module.exports = log;