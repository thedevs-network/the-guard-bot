'use strict';

const warn = require('../actions/warn');
const ban = require('../actions/ban');
const batchBan = require('../actions/batchBan');
const { scheduleDeletion } = require('../utils/tg');

const {
	warnInlineKeyboard,
	deleteWarnsAfter = false,
	deleteBansAfter = false,
} = require('../utils/config').config;

const normalisedDeleteWarnsAfter = typeof deleteWarnsAfter === 'object'
	? { auto: false, manual: false, ...deleteWarnsAfter }
	: { auto: deleteWarnsAfter, manual: deleteWarnsAfter };

const reply_markup = { inline_keyboard: warnInlineKeyboard };

/** @type { import('../typings/context').ContextExtensions } */
module.exports = {
	async ban({ admin, reason, userToBan }) {
		const banMessage = await ban({ admin, reason, userToBan });
		return this.replyWithHTML(banMessage)
			.then(scheduleDeletion(deleteBansAfter));
	},
	batchBan({ admin, reason, targets }) {
		return batchBan({ admin, reason, targets })
			.then(this.replyWithHTML)
			.then(scheduleDeletion(deleteBansAfter));
	},
	async warn({ admin, amend, reason, userToWarn, mode }) {
		const warnMessage = await warn({ admin, amend, reason, userToWarn });
		return this.replyWithHTML(warnMessage, { reply_markup })
			.then(scheduleDeletion(normalisedDeleteWarnsAfter[mode]));
	},

	replyWithCopy(content, options) {
		return this.tg.sendCopy(this.chat.id, content, options);
	},
};
