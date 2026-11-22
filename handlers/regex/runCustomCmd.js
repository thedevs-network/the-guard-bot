'use strict';

const { Telegraf: { hears } } = require('telegraf');
const R = require('ramda');

// DB
const { getCommand } = require('../../stores/command');

const { scheduleDeletion } = require('../../utils/tg');

const { isMaster } = require('../../utils/config');

const { config } = require('../../utils/config');

const deleteCustom = config.deleteCustom || { longerThan: Infinity };

const capitalize = R.replace(/^./, R.toUpper);

const getRepliedToId = R.path([ 'reply_to_message', 'message_id' ]);

const typeToMethod = type => {
	switch (type) {
	case 'text':
		return 'replyWithHTML';
	case 'copy':
		return 'copyMessage';
	default:
		return `replyWith${capitalize(type)}`;
	}
};

const autoDelete = ({ content, type }) => {
	switch (type) {
	case 'text':
		return content.length > deleteCustom.longerThan;
	case 'copy':
		return (content.text || '').length > deleteCustom.longerThan;
	default:
		return false;
	}
};

const hasRole = (role, from) => {
	switch (role.toLowerCase()) {
	case 'master':
		return isMaster(from);
	case 'admins':
		return from && from.status === 'admin';
	default:
		return true;
	}
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const runCustomCmdHandler = async (ctx, next) => {
	const commandName = ctx.match[1].toLowerCase();
	const command = await getCommand({ isActive: true, name: commandName });

	if (!command || !hasRole(command.role, ctx.from)) {
		return next();
	}

	const { caption, content, type } = command;

	const options = {
		...caption && { caption },
		disable_web_page_preview: true,
		reply_to_message_id: getRepliedToId(ctx.message),
	};

	const method = typeToMethod(type);
	const response = method === 'copyMessage'
		? ctx.telegram[method](
			ctx.chat.id,
			content.chat.id,
			content.message_id,
			options,
		)
		: ctx[method](content, options);

	return response
		.then(({ message_id }) =>
			scheduleDeletion(
				autoDelete(command) && deleteCustom.after,
			)({
				chat: ctx.chat, message_id,
			}));
};

module.exports = hears(/^! ?(\w+)/, runCustomCmdHandler);
