'use strict';

const { Markup } = require('telegraf');
const { last } = require('ramda');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const {
	getCommand,
	removeCommand,
	updateCommand
} = require('../../stores/command');

const createNewCommand = ctx => {
	const { message } = ctx;
	const { caption, text, photo } = message;
	const [ type ] = ctx.updateSubTypes;

	if (text) {
		return { content: text, type: 'text' };
	}
	if (photo) {
		return {
			caption,
			content: last(photo).file_id,
			type: 'photo',
		};
	}
	return { caption, content: message[type].file_id, type };
};

const addCustomCmdHandler = async (ctx, next) => {
	if (ctx.chat.type !== 'private') return next();

	const { message, reply, from } = ctx;
	const { text } = message;
	const { id } = from;
	const isAdmin = from.status === 'admin';

	if (text && /^\/\w+/.test(text)) {
		await removeCommand({ id, isActive: false });
		return next();
	}

	const command = await getCommand({ id, isActive: false });
	if (!isAdmin ||
		!command ||
		!command.state) {
		return next();
	}

	if (command.state === 'role') {
		const role = text.toLowerCase();
		if (role !== 'master' && role !== 'admins' && role !== 'everyone') {
			reply('Please send a valid role.', Markup.keyboard([
				[ 'Master', 'Admins', 'Everyone' ]
			])
				.oneTime()
				.resize()
				.extra());
			return next();
		}
		await updateCommand({ id, role, state: 'content' });
		return reply(
			'Send the content you wish to be shown when the command is used.' +
			'.\n\nSupported contents:\n- <b>Text (HTML)</b>\n- <b>Photo</b>' +
			'\n- <b>Video</b>\n- <b>Document</b>\n- <b>Audio</b>',
			replyOptions
		);
	}

	if (command.state === 'content') {
		if (ctx.message.text) {
			try {
				await ctx.replyWithHTML(ctx.message.text);
			} catch (err) {
				return ctx.reply(err +
					'\n\nPlease fix your content and try again.');
			}
		}

		const newCommand = createNewCommand(ctx);

		await updateCommand({ ...newCommand, id, isActive: true, state: null });
		return reply(
			'✅ <b>New command has been created successfully.</b>\n\n' +
			'Custom commands work with ! instead of /.\n\n' +
			'For example: <code>!rules</code>\n\n' +
			'Custom commands can reply other messages too.\n\n' +
			'/commands - to see the list of commands.\n' +
			'/addcommand - to add a new command.\n' +
			'/removecomand <code>&lt;name&gt;</code> - to remove a command.',
			replyOptions
		);
	}
	return next();
};

module.exports = addCustomCmdHandler;
