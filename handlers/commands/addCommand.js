'use strict';

// DB
const { isAdmin } = require('../../stores/user');
const { addCommand } = require('../../stores/command');

// Bot
const { replyOptions } = require('../../bot/options');

const addCommandHandler = async ({ chat, message, reply }) => {
	const user = message.from;
	if (chat.type !== 'private') {
		return null;
	}
	if (!await isAdmin(user)) {
		return reply('ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions);
	}
	await addCommand({ id: user.id });
	return reply('Enter a name for the command.\n\nFor example: <b>rules</b>',
		replyOptions);
};

module.exports = addCommandHandler;
