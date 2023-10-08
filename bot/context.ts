import warn from "../actions/warn";
import ban from "../actions/ban";
import batchBan from "../actions/batchBan";
import { scheduleDeletion } from "../utils/tg";

import { config } from "../utils/config";
import { ContextExtensions } from "../typings/context";

const {
	warnInlineKeyboard,
	chats = {},
	deleteWarnsAfter = false,
	deleteBansAfter = false,
} = config;

const normalisedDeleteWarnsAfter =
	typeof deleteWarnsAfter === "object"
		? deleteWarnsAfter
		: { auto: deleteWarnsAfter, manual: deleteWarnsAfter };

const reply_markup = { inline_keyboard: warnInlineKeyboard };

export const extn: ContextExtensions = {
	async ban({ admin, reason, userToBan, msg }) {
		const banMessage = await ban({ admin, reason, userToBan });

		const done = await this.loggedReply(banMessage, msg).then(
			scheduleDeletion(deleteBansAfter),
		);

		if (msg)
			this.telegram
				.deleteMessage(msg.chat.id, msg.message_id)
				.catch(() => null);

		return done;
	},

	async batchBan({ admin, reason, targets }) {
		const banMessage = await batchBan({ admin, reason, targets });
		return this.loggedReply(banMessage).then(scheduleDeletion(deleteBansAfter));
	},

	async warn({ admin, amend, reason, userToWarn, mode, msg }) {
		const warnMessage = await warn({ admin, amend, reason, userToWarn });

		const done = await this.loggedReply(warnMessage, msg, {
			reply_markup,
		}).then(scheduleDeletion(normalisedDeleteWarnsAfter[mode]));

		if (msg)
			this.telegram
				.deleteMessage(msg.chat.id, msg.message_id)
				.catch(() => null);

		return done;
	},

	async loggedReply(html, reply, extra) {
		if (chats.adminLog) {
			const msg =
				reply &&
				(await this.telegram.forwardMessage(
					chats.adminLog,
					reply.chat.id,
					reply.message_id,
				));
			this.telegram
				// @ts-expect-error sendMessage is monkeypatched to accept TgHtml
				.sendMessage(chats.adminLog, html, {
					parse_mode: "HTML",
					reply_to_message_id: msg?.message_id,
				})
				.catch(() => null);
		}
		// @ts-expect-error sendMessage is monkeypatched to accept TgHtml
		return this.replyWithHTML(html, extra);
	},

	replyWithCopy(content, options) {
		return this.telegram.sendCopy(this.chat.id, content, options);
	},
};
