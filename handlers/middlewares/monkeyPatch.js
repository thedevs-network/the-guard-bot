'use strict';

const { telegram } = require('../../bot');

const msgAlreadyDeleted = 'Bad Request: message to delete not found';

/** @param { import('telegraf').Context } ctx */
module.exports = (ctx, next) => {
	ctx.telegram.deleteMessage = async (chat_id, message_id) => {
		try {
			return await ctx.telegram.callApi('deleteMessage', {
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
	telegram.deleteMessage = ctx.telegram.deleteMessage;
	ctx.telegram.sendMessage = (chat_id, text, extra) =>
		ctx.telegram.callApi('sendMessage', {
			disable_web_page_preview: true,
			chat_id,
			text,
			...extra,
		});
	return next();
};
