'use strict';

const warn = require('../actions/warn');
const ban = require('../actions/ban');
const batchBan = require('../actions/batchBan');
const { scheduleDeletion } = require('../utils/tg');

const {
	warnInlineKeyboard,
	chats = {},
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
		return this.loggedReply(banMessage)
			.then(scheduleDeletion(deleteBansAfter));
	},
	async batchBan({ admin, reason, targets }) {
		const banMessage = await batchBan({ admin, reason, targets });
		return this.loggedReply(banMessage)
			.then(scheduleDeletion(deleteBansAfter));
	},
	async warn({ admin, amend, reason, userToWarn, mode }) {
		const warnMessage = await warn({ admin, amend, reason, userToWarn });
		return this.loggedReply(warnMessage, { reply_markup })
			.then(scheduleDeletion(normalisedDeleteWarnsAfter[mode]));
	},

	loggedReply(html, extra) {
		if (chats.adminLog) {
			this.tg
				.sendMessage(
					chats.adminLog,
					html.toJSON().replace(/\[<code>(\d+)<\/code>\]/g, '[#u$1]'),
					{ parse_mode: 'HTML' },
				)
				.catch(() => null);
		}
		return this.replyWithHTML(html, extra);
	},

	replyWithCopy(content, options) {
		return this.tg.sendCopy(this.chat.id, content, options);
	},
};
