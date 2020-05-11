'use strict';

const msgAlreadyDeleted = 'Bad Request: message to delete not found';

/** @param { import('telegraf').Context } ctx */
module.exports = (ctx, next) => {
	ctx.tg.deleteMessage = async (chat_id, message_id) => {
		try {
			return await ctx.tg.callApi('deleteMessage', {
				chat_id,
				message_id,
			});
		} catch (err) {
			if (err.description === msgAlreadyDeleted) {
				return false;
			}
			throw err;
		}
	};
	ctx.tg.sendMessage = (chat_id, text, extra) =>
		ctx.tg.callApi('sendMessage', {
			disable_web_page_preview: true,
			chat_id,
			text,
			...extra,
		});
	return next();
};
