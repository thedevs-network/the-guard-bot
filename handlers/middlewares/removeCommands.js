'use strict';

const { deleteCommands } = require('../../config');

const noop = Function.prototype;

const removeCommandsHandler = ({ chat, message, telegram }, next) => {
	if (
		deleteCommands === 'all' &&
		message &&
		message.text &&
		message.entities &&
		message.entities[0] &&
		message.entities[0].offset === 0 &&
		message.entities[0].type === 'bot_command' &&
		chat.type !== 'private'
	) {
		telegram.deleteMessage(chat.id, message.message_id).catch(noop);
	}
	return next();
};

module.exports = removeCommandsHandler;
