'use strict';

const { managesGroup, removeGroup } = require('../../stores/group');

const leaveCommandHandler = async ctx => {
	const { chat, message, telegram, state, replyWithHTML } = ctx;
	const { isMaster } = state;
	if (!isMaster) return null;

	const groupName = message.text.split(' ').slice(1).join(' ');

	if (groupName) {
		const group = /^-?\d+/.test(groupName)
			? { id: Number(groupName) }
			:	{ title: groupName };
		console.log(group);
		const isGroup = await managesGroup(group);
		if (!isGroup) {
			return replyWithHTML(
				'ℹ️ <b>Couldn\'t find a group with that ID/name.</b>'
			);
		}
		await Promise.all([
			removeGroup(isGroup),
			telegram.leaveChat(isGroup.id)
		]);
		return replyWithHTML(
			'✅ <b>I no longer manage that group.</b>'
		);
	}

	await removeGroup(chat);
	return telegram.leaveChat(chat.id);
};

module.exports = leaveCommandHandler;
