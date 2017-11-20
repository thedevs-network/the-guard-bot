'use strict';

// DB
const { getCommand } = require('../../stores/command');

const runCustomCmdHandler = async (ctx, next) => {
	const { message, state } = ctx;
	const { isAdmin, isMaster } = state;
	const isCommand = /^!\w+/.test(message.text);
	if (!isCommand) {
		return next();
	}

	const commandName = message.text
		.split(' ')[0]
		.replace('!', '')
		.toLowerCase();
	const command = await getCommand({ isActive: true, name: commandName });

	if (!command) {
		return next();
	}

	const { caption, content, type } = command;
	const role = command.role.toLowerCase();
	const replyTo = message.reply_to_message
		? { reply_to_message_id: message.reply_to_message.message_id }
		: {};
	const options = Object.assign(
		replyTo,
		caption ? { caption } : {},
		{ disable_web_page_preview: true },
	);
	if (
		role === 'master' &&
		!isMaster ||
		role === 'admins' &&
		!isAdmin
	) {
		return next();
	}

	if (type === 'text') {
		ctx.replyWithHTML(content, options);
		return next();
	}
	if (type === 'photo') {
		ctx.replyWithPhoto(content, options);
		return next();
	}
	if (type === 'video') {
		ctx.replyWithVideo(content, replyTo);
		return next();
	}
	if (type === 'document') {
		ctx.replyWithDocument(content, replyTo);
		return next();
	}
	if (type === 'audio') {
		ctx.replyWithAudio(content, replyTo);
		return next();
	}
	return next();
};

module.exports = runCustomCmdHandler;
