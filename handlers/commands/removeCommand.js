'use strict';

// DB
const { getCommand, removeCommand } = require('../../stores/command');

// Bot
const { replyOptions } = require('../../bot/options');

const removeCommandHandler = async ({ chat, message, reply, state }) => {
	const { isAdmin, isMaster } = state;
	const { text } = message;
	if (chat.type !== 'private') return null;

	if (!isAdmin) {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}
	const [ , commandName ] = text.split(' ');
	if (!commandName) {
		return reply(
			'<b>Send a valid command.</b>\n\nExample:\n' +
			'<code>/removecommand rules</code>',
			replyOptions
		);
	}

	const command = await getCommand({ name: commandName.toLowerCase() });
	if (!command) {
		return reply(
			'ℹ️ <b>Command couldn\'t be found.</b>',
			replyOptions
		);
	}

	const role = command.role.toLowerCase();
	if (role === 'master' && !isMaster) {
		return reply(
			'ℹ️ <b>Sorry, only master can remove this command.</b>',
			replyOptions
		);
	}

	await removeCommand({ name: commandName.toLowerCase() });
	return reply(
		`✅ <code>!${commandName}</code> ` +
		'<b>has been removed successfully.</b>',
		replyOptions
	);
};

module.exports = removeCommandHandler;
