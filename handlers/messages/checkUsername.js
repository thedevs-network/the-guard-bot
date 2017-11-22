'use strict';

// DB
const { addUser, getUser } = require('../../stores/user');

const checkUsernameHandler = async ({ message }, next) => {
	if (!message.entities) {
		return next();
	}
	const messageArr = message.text ? message.text.split(' ') : '';
	const isCommand = /^\/\w+/.test(messageArr[0]);
	const hasMention = message.entities.some(entity =>
		entity.type === 'mention');
	const hasTextMention = message.entities.some(entity =>
		entity.type === 'text_mention');
	const hasId = /^\d+/.test(messageArr[1]);

	if (!isCommand) {
		return next();
	}

	if (hasMention) {
		const username = messageArr[1].toLowerCase();
		const isUsername = /^@\w+/.test(username);
		if (!isUsername) {
			return next();
		}
		const user = await getUser({ username: username.replace('@', '') });
		if (user) {
			const regex = new RegExp(` ${username}`, 'i');
			message.text = message.text.replace(regex, '');
			message.commandMention = user;
		}
		return next();
	}

	if (hasTextMention) {
		const [ { user } ] = message.entities.filter(entity => entity.user);
		const name = user.first_name;
		if (name.split(' ')[0] !== messageArr[1]) {
			return next();
		}
		message.text = message.text.replace(` ${name}`, '');
		message.commandMention = user;
		return next();
	}

	if (hasId) {
		const [ , id ] = messageArr;
		const user = await getUser({ id: Number(id) });
		if (!user) {
			await addUser({ id: Number(id) });
		}
		message.text = message.text.replace(` ${id}`, '');
		message.commandMention = user
			? user
			: await getUser({ id: Number(id) });
		return next();
	}
	return next();
};

module.exports = checkUsernameHandler;
