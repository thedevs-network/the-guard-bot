'use strict';

const { getUser } = require('../../stores/user');

const syncStatusHandler = (ctx, next) => {
	const { message } = ctx;
	const { new_chat_members } = message;

	new_chat_members.forEach(async newMember => {
		if (newMember.is_bot) {
			return null;
		}

		const dbUser = await getUser({ id: newMember.id });
		// this handler runs after messages/addUser
		// so, it should always be able to obtain the user from db
		console.assert(dbUser);

		switch (dbUser.status) {
		case 'admin':
			return ctx.telegram.promoteChatMember(ctx.chat.id, dbUser.id, {
				can_change_info: false,
				can_delete_messages: true,
				can_invite_users: true,
				can_pin_messages: true,
				can_promote_members: false,
				can_restrict_members: true,
			});
		case 'banned':
			return ctx.telegram.kickChatMember(ctx.chat.id, dbUser.id);
		case 'member':
			// do nothing
			return null;
		default:
			throw new Error(`Unexpected member status: ${dbUser.status}`);
		}
	});

	return next();
};

module.exports = syncStatusHandler;
