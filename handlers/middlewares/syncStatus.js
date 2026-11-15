'use strict';

const { getUser } = require('../../stores/user');
const { pMap } = require('../../utils/promise');
const { getNewChatMembers } = require('../../utils/config');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const syncStatusHandler = (ctx, next) => {
	const newChatMembers = getNewChatMembers(ctx.message);
	pMap(newChatMembers, async newMember => {
		if (newMember.is_bot) {
			return null;
		}

		const dbUser = await getUser({ id: newMember.id });
		const { status = 'member' } = dbUser || {};

		switch (status) {
		case 'admin':
			return ctx.promoteChatMember(newMember.id, {
				can_change_info: false,
				can_delete_messages: true,
				can_invite_users: true,
				can_pin_messages: true,
				can_promote_members: false,
				can_restrict_members: true,
			}).catch(err => console.log(err));
		case 'banned':
			return ctx.banChatMember(newMember.id);
		case 'member':
			return null; // Used to have SpamWatch integration
		default:
			throw new Error(`Unexpected member status: ${dbUser.status}`);
		}
	}).catch(() => null);

	return next();
};

module.exports = syncStatusHandler;
