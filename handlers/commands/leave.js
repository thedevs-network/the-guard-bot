'use strict';

const { removeGroup } = require('../../stores/group');

const leaveCommandHandler = async ({ chat, telegram, state }) => {
	const { isMaster } = state;
	if (!isMaster) {
		return null;
	}
	await removeGroup(chat);
	return telegram.leaveChat(chat.id);
};

module.exports = leaveCommandHandler;
