'use strict';

// Utils
const { loadJSON } = require('../../utils/json');

// Config
const { masterID } = loadJSON('config.json');

// DB
const { addUser, isUser } = require('../../stores/user');

const addUserHandler = async (ctx, next) => {
	const { message } = ctx;
	const newUser = message.from;
	const user = newUser && await isUser(message.from);
	const usersToAdd = [];

	if (!user && newUser) {
		usersToAdd.push(addUser(newUser));
	}

	ctx.state = {
		isAdmin: user && user.status === 'admin',
		isMaster: user.id === masterID,
		user: newUser,
	};

	if (
		message.reply_to_message &&
		message.reply_to_message.from &&
		!await isUser(message.reply_to_message.from)
	) {
		usersToAdd.push(addUser(message.reply_to_message.from));
	}

	await Promise.all(usersToAdd);

	return next();
};

module.exports = addUserHandler;
