'use strict';

// DB
const { addCommand, getCommand } = require('../../stores/command');

// Bot
const { Markup } = require('telegraf');
const { replyOptions } = require('../../bot/options');

const preserved = [ 'admin', 'unadmin', 'leave', 'warn', 'unwarn', 'nowarns',
	'getwarns', 'ban', 'unban', 'report', 'staff', 'link', 'groups', 'commands',
	'addcommand', 'removecommand' ];

const addCommandHandler = async ({ chat, message, reply, state }, next) => {
	const { isAdmin, user } = state;
	const { id } = user;
	if (chat.type !== 'private') return null;

	if (!isAdmin) {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}

	const [ , commandName ] = message.text.split(' ');
	const isValidName = commandName && commandName.match(/^(?:[!])?(\w+)$/);
	if (!isValidName) {
		reply(
			'<b>Send a valid command.</b>\n\nExample:\n' +
			'<code>/addcommand rules</code>',
			replyOptions
		);
		return next();
	}
	const newCommand = isValidName[1].toLowerCase();
	if (preserved.includes(newCommand)) {
		reply('❗️ Sorry you can\'t use this name, it\'s preserved.\n\n' +
			'Try another one.');
		return next();
	}

	if (await getCommand({ isActive: true, name: newCommand })) {
		reply(
			'ℹ️ <b>This command already exists.</b>\n\n' +
			'/commands - to see the list of commands.\n' +
			'/addcommand - to add a command.\n' +
			'/removecommand <code>&lt;name&gt;</code>' +
			' - to remove a command.',
			replyOptions
		);
		return next();
	}
	await addCommand({ id, name: newCommand, state: 'role' });
	reply('Who can use this command?', Markup.keyboard([
		[ 'Master', 'Admins', 'Everyone' ]
	])
		.oneTime()
		.resize()
		.extra());
	return next();
};

module.exports = addCommandHandler;
