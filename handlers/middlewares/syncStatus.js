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

		// if user is not in DB, he can't be banned.
		if (dbUser === null) {
			return null;
		}

		switch (dbUser.status) {
		case 'admin':
			return ctx.promoteChatMember(dbUser.id, {
				can_change_info: false,
				can_delete_messages: true,
				can_invite_users: true,
				can_pin_messages: true,
				can_promote_members: false,
				can_restrict_members: true,
			});
		case 'banned':
			return ctx.kickChatMember(dbUser.id);
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
