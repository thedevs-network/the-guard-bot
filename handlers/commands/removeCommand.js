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
		return reply('ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions);
	}
	const [ , commandName ] = text.split(' ');
	if (!commandName) {
		return reply(
			'Enter a command name to remove.\n\n' +
			'For example:\n/removecommand <b>rules</b>',
			replyOptions);
	}

	const command = await getCommand({ name: commandName });
	if (!command) {
		return reply('ℹ️ <b>Command couldn\'t be found.</b>',
			replyOptions);
	}

	const role = command.role.toLowerCase();
	if (role === 'master' && !isMaster) {
		return reply('ℹ️ <b>Sorry, only master can remove this command.</b>',
			replyOptions);
	}

	await removeCommand({ name: commandName });
	return reply(
		`✅ <code>!${commandName}</code> ` +
		'<b>has been removed successfully.</b>',
		replyOptions);
};

module.exports = removeCommandHandler;
