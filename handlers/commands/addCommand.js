'use strict';

// DB
const { addCommand } = require('../../stores/command');

// Bot
const { replyOptions } = require('../../bot/options');

const addCommandHandler = async ({ chat, reply, state }) => {
	const { isAdmin, user } = state;
	if (chat.type !== 'private') return null;

	if (!isAdmin) {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}
	await addCommand({ id: user.id });
	return reply(
		'Enter a name for the command without forward slash "/".' +
		'\n\nFor example: <b>rules</b>',
		replyOptions
	);
};

module.exports = addCommandHandler;
