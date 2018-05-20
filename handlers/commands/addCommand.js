'use strict';

// DB
const { addCommand, getCommand } = require('../../stores/command');

// Bot
const { Markup } = require('telegraf');
const { replyOptions } = require('../../bot/options');

const preserved = require('../commands').handlers;

const addCommandHandler = async (ctx) => {
	const { chat, message, reply } = ctx;
	const { id } = ctx.from;
	if (chat.type !== 'private') return null;

	if (ctx.from.status !== 'admin') {
		return reply(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
			replyOptions
		);
	}

	const [ slashCommand, commandName = '' ] = message.text.split(' ');
	const isValidName = /^!?(\w+)$/.exec(commandName);
	if (!isValidName) {
		return reply(
			'<b>Send a valid command.</b>\n\nExample:\n' +
			'<code>/addcommand rules</code>',
			replyOptions
		);
	}
	const newCommand = isValidName[1].toLowerCase();
	if (preserved.has(newCommand)) {
		return reply('❗️ Sorry you can\'t use this name, it\'s preserved.\n\n' +
			'Try another one.');
	}

	const replaceCmd = slashCommand.toLowerCase() === '/replacecommand';

	const cmdExists = await getCommand({ isActive: true, name: newCommand });

	if (!replaceCmd && cmdExists) {
		return ctx.replyWithHTML(
			'ℹ️ <b>This command already exists.</b>\n\n' +
			'/commands - to see the list of commands.\n' +
			'/addcommand <code>&lt;name&gt;</code> - to add a command.\n' +
			'/removecommand <code>&lt;name&gt;</code>' +
			' - to remove a command.',
			Markup.keyboard([ [ `/replaceCommand ${newCommand}` ] ])
				.oneTime()
				.resize()
				.extra()
		);
	}
	await addCommand({ id, name: newCommand, state: 'role' });
	return reply('Who can use this command?', Markup.keyboard([
		[ 'Master', 'Admins', 'Everyone' ]
	])
		.oneTime()
		.resize()
		.extra());
};

module.exports = addCommandHandler;
