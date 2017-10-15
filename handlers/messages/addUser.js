'use strict';

// Config
const { master } = require('../../config.json');

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
		isMaster: user &&
		(user.id === Number(master) ||
			user.username &&
			user.username.toLowerCase() ===
			String(master).replace('@', '').toLowerCase()),
		user: newUser,
	};

	if (
		message.reply_to_message &&
		message.reply_to_message.from &&
		!await isUser(message.reply_to_message.from)
	) {
		usersToAdd.push(addUser(message.reply_to_message.from));
	}

	if (
		message.forward_from &&
		!await isUser(message.forward_from)
	) {
		usersToAdd.push(addUser(message.forward_from));
	}

	await Promise.all(usersToAdd);

	return next();
};

module.exports = addUserHandler;
