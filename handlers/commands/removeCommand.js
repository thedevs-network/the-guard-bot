'use strict';

// DB
const { getCommand, removeCommand } = require('../../stores/command');

const { isMaster } = require('../../utils/config');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const removeCommandHandler = async (ctx) => {
	const { text } = ctx.message;
	if (ctx.chat.type !== 'private') return null;

	if (ctx.from.status !== 'admin') {
		return ctx.replyWithHTML(
			'ℹ️ <b>Sorry, only admins access this command.</b>',
		);
	}
	const [ , commandName ] = text.split(' ');
	if (!commandName) {
		return ctx.replyWithHTML(
			'<b>Send a valid command.</b>\n\nExample:\n' +
			'<code>/removecommand rules</code>',
		);
	}

	const command = await getCommand({ name: commandName.toLowerCase() });
	if (!command) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Command couldn\'t be found.</b>',
		);
	}

	const role = command.role.toLowerCase();
	if (role === 'master' && !isMaster(ctx.from)) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Sorry, only master can remove this command.</b>',
		);
	}

	await removeCommand({ name: commandName.toLowerCase() });
	return ctx.replyWithHTML(
		`✅ <code>!${commandName}</code> ` +
		'<b>has been removed successfully.</b>',
	);
};

module.exports = removeCommandHandler;
