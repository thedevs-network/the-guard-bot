'use strict';

// DB
const { addCommand, getCommand } = require('../../stores/command');

// Bot
const { Markup } = require('telegraf');

const Cmd = require('../../utils/cmd');
const { isMaster } = require('../../utils/config');
const { inlineKeyboard } = require('../../utils/tg');

const preserved = require('../commands').handlers;

const roleBtn = (btRole, { newCommand, currentRole }) => {
	const noop = btRole.toLowerCase() === currentRole.toLowerCase();
	return {
		text: '✅ '.repeat(noop) + btRole,
		callback_data: Cmd.stringify({
			command: 'addcommand',
			flags: {
				noop,
				role: btRole,
				replace: 'soft',
			},
			reason: newCommand,
		}),
	};
};

const roleKbRow = (cmdData) => [
	roleBtn('Admins', cmdData),
	roleBtn('Everyone', cmdData),
];

const normalizeRole = (role = '') => {
	const lower = role.toLowerCase();
	return lower === 'master' || lower === 'admins'
		? lower
		: 'everyone';
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const addCommandHandler = async (ctx) => {
	const { chat, message, reply } = ctx;
	if (chat.type === 'channel') return null;
	const { id } = ctx.from;

	if (ctx.from.status !== 'admin') {
		return ctx.replyWithHTML(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
		);
	}

	const { flags, reason: commandName } = Cmd.parse(message);
	if (flags.has('noop')) return null;

	const isValidName = /^!?(\w+)$/.exec(commandName);
	if (!isValidName) {
		return ctx.replyWithHTML(
			'<b>Send a valid command.</b>\n\nExample:\n' +
			'<code>/addcommand rules</code>',
		);
	}
	const newCommand = isValidName[1].toLowerCase();
	if (preserved.has(newCommand)) {
		return reply('❗️ Sorry you can\'t use this name, it\'s preserved.\n\n' +
			'Try another one.');
	}

	const replaceCmd = flags.has('replace');
	const content = message.reply_to_message;

	const cmdExists = await getCommand({ isActive: true, name: newCommand });

	if (!replaceCmd && cmdExists) {
		return ctx.replyWithHTML(
			'ℹ️ <b>This command already exists.</b>\n\n' +
			'/commands - to see the list of commands.\n' +
			'/addcommand <code>&lt;name&gt;</code> - to add a command.\n' +
			'/removecommand <code>&lt;name&gt;</code>' +
			' - to remove a command.',
			Markup.keyboard([ [ `/addcommand -replace ${newCommand}` ] ])
				.selective()
				.oneTime()
				.resize()
				.extra(),
		);
	}
	if (cmdExists && cmdExists.role === 'master' && !isMaster(ctx.from)) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Sorry, only master can replace this command.</b>',
		);
	}

	const softReplace = flags.get('replace') === 'soft';
	if (content || softReplace) {
		const role = normalizeRole(flags.get('role'));
		await addCommand({
			id,
			role,
			type: 'copy',
			caption: null,
			isActive: true,
			name: newCommand,
			...softReplace || { content },
		});
		return ctx.replyWithHTML(
			`✅ <b>Successfully added <code>!${isValidName[1]}</code></b>.\n` +
			'Who should be able to use it?',
			inlineKeyboard(roleKbRow({ currentRole: role, newCommand })),
		);
	}

	// eslint-disable-next-line max-len
	return ctx.replyWithHTML('ℹ️ <b>Reply to a message you\'d like to save</b>');
};

module.exports = addCommandHandler;
