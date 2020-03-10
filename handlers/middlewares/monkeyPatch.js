'use strict';

const msgAlreadyDeleted = 'Bad Request: message to delete not found';

/** @param { import('telegraf').ContextMessageUpdate } ctx */
module.exports = (ctx, next) => {
	ctx.tg.deleteMessage = async (chat_id, message_id) => {
		try {
			return await ctx.tg.callApi('deleteMessage', {
				chat_id,
				message_id
			});
		} catch (err) {
			if (err.description === msgAlreadyDeleted) {
				return false;
			}
			throw err;
		}
	};
	return next();
};
