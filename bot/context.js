'use strict';

const warn = require('../actions/warn');
const ban = require('../actions/ban');
const { scheduleDeletion } = require('../utils/tg');

const {
	warnInlineKeyboard,
	deleteWarnsAfter = false,
	deleteBansAfter = false,
} = require('../config');

const normalisedDeleteWarnsAfter = typeof deleteWarnsAfter === 'object'
	? deleteWarnsAfter : { auto: deleteWarnsAfter, manual: deleteWarnsAfter };

const reply_markup = { inline_keyboard: warnInlineKeyboard };

module.exports = {
	async ban({ admin, reason, userToBan }) {
		const banMessage = await ban({ admin, reason, userToBan });
		return this.replyWithHTML(banMessage)
			.then(scheduleDeletion(deleteBansAfter));
	},
	async warn({ admin, reason, userToWarn, mode }) {
		const warnMessage = await warn({ admin, reason, userToWarn });
		return this.replyWithHTML(warnMessage, { reply_markup })
			.then(scheduleDeletion(normalisedDeleteWarnsAfter[mode]));
	},
};
