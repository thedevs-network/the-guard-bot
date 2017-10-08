'use strict';

// Config
const { masterID } = require('../../config.json');

// DB
const { addUser, isUser } = require('../../stores/user');

const addUserHandler = async (ctx, next) => {
	const { message } = ctx;
	const { new_chat_members } = message;
	const newUser = message.from;
	const user = newUser && await isUser(message.from);
	const usersToAdd = [];

	if (new_chat_members) {
		new_chat_members.forEach(async member => {
			if (!await isUser(member)) {
				usersToAdd.push(addUser(member));
			}
		});
	}

	if (!user && newUser) {
		usersToAdd.push(addUser(newUser));
	}

	ctx.state = {
		isAdmin: user && user.status === 'admin',
		isMaster: user && user.id === masterID,
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
