'use strict';

// Config
const { master } = require('../../config');

// DB
const { addUser, isUser } = require('../../stores/user');

const addUserHandler = async (ctx, next) => {
	const { message } = ctx;
	const { new_chat_members } = message;
	const newUser = Object.assign({ username: '' }, message.from);
	const storedUser = await isUser(newUser);
	const user = newUser && storedUser;
	const usersToAdd = [];

	if (new_chat_members) {
		new_chat_members.forEach(async member => {
			const joinedUser = await isUser(member);
			if (!joinedUser || !joinedUser.first_name) {
				usersToAdd.push(addUser(member));
			}
		});
	}

	if (
		// if user does not exist in database
		!user &&
		newUser ||

		// or
		// if user's data is incomplete or is changed
		storedUser &&
		newUser &&
		(storedUser.username !== newUser.username.toLowerCase() ||
		!storedUser.first_name)
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
