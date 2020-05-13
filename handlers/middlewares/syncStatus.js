'use strict';

const ms = require('millisecond');
const spamwatch = require('../../utils/spamwatch');
const { getUser } = require('../../stores/user');
const { pMap } = require('../../utils/promise');

/**
 * @param { import('../../typings/context').ExtendedContext } ctx
 * @param { import('telegraf/typings/telegram-types').User } newMember
 */
const handleNewMember = async (ctx, newMember) => {
	if (await spamwatch.shouldKick(newMember)) {
		const until_date = (Date.now() + ms('24h')) / 1000;
		return ctx.kickChatMember(newMember.id, until_date);
	}

	return null;
};

/** @param { import('../../typings/context').ExtendedContext } ctx */
const syncStatusHandler = (ctx, next) => {
	pMap(ctx.message.new_chat_members, async newMember => {
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
			});
		case 'banned':
			return ctx.kickChatMember(newMember.id);
		case 'member':
			return handleNewMember(ctx, newMember);
		default:
			throw new Error(`Unexpected member status: ${dbUser.status}`);
		}
	}).catch(() => null);

	return next();
};

module.exports = syncStatusHandler;
