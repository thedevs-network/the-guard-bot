'use strict';

// Utils
const { logError } = require('../../utils/log');

// DB
const { addUser, isUser } = require('../../stores/user');

const addUserHandler = async ({ message }, next) => {
	const usersToAdd = [];
	if (message.from && !await isUser(message.from)) {
		usersToAdd.push(message.from);
	}
	if (
		message.reply_to_message &&
		message.reply_to_message.from &&
		!await isUser(message.reply_to_message.from)
	) {
		usersToAdd.push(message.reply_to_message.from);
	}

	usersToAdd.forEach(async user => {
		try {
			await addUser(user);
		} catch (err) {
			logError(err);
		}
	});

	return next();
};

module.exports = addUserHandler;
