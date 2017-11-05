'use strict';

// Config
const { master } = require('../../config.json');

// DB
const { addUser, isUser } = require('../../stores/user');

const addUserHandler = async (ctx, next) => {
	const { message } = ctx;
	const { new_chat_members } = message;
	const newUser = message.from;
	const storedUser = await isUser(newUser);
	const user = newUser && storedUser;
	const usersToAdd = [];

	if (new_chat_members) {
		new_chat_members.forEach(async member => {
			if (!await isUser(member)) {
				usersToAdd.push(addUser(member));
			}
		});
	}

	if (
		// if user does not exist in database
		!user &&
		newUser ||

		// or
		// if user's username has been changed
		storedUser &&
		newUser &&
		storedUser.username !== newUser.username
	) {
		usersToAdd.push(addUser(newUser));
	}


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

	ctx.state = {
		isAdmin: user && user.status === 'admin',
		isMaster: user &&
		(user.id === Number(master) ||
			user.username &&
			user.username.toLowerCase() ===
			String(master).replace('@', '').toLowerCase()),
		user: newUser,
	};

	return next();
};

module.exports = addUserHandler;
