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

const normalisedDeleteWarnsAfter =
	typeof deleteWarnsAfter === 'object'
		? { auto: false, manual: false, ...deleteWarnsAfter }
		: { auto: deleteWarnsAfter, manual: deleteWarnsAfter };

const reply_markup = { inline_keyboard: warnInlineKeyboard };

/** @type { import('../typings/context').ContextExtensions } */
module.exports = {
	async ban({ admin, reason, userToBan }) {
		const banMessage = await ban({ admin, reason, userToBan });
		return this.loggedReply(banMessage).then(
			scheduleDeletion(deleteBansAfter)
		);
	},
	async batchBan({ admin, reason, targets }) {
		const banMessage = await batchBan({ admin, reason, targets });
		return this.loggedReply(banMessage).then(
			scheduleDeletion(deleteBansAfter)
		);
	},
	async warn({ admin, amend, reason, userToWarn, mode }) {
		const warnMessage = await warn({ admin, amend, reason, userToWarn });
		return this.loggedReply(warnMessage, { reply_markup }).then(
			scheduleDeletion(normalisedDeleteWarnsAfter[mode])
		);
	},

	loggedReply(html, extra) {
		if (chats.adminLog) {
			this.telegram
				.sendMessage(
					chats.adminLog,
					html.toJSON().replace(/\[<code>(\d+)<\/code>\]/g, '[#u$1]'),
					{ parse_mode: 'HTML' }
				)
				.catch(() => null);
		}
		return this.replyWithHTML(html, extra);
	},

	replyWithCopy(content, options) {
		if ('text' in content) {
			return this.telegram.sendMessage(this.chat.id, content.text, {
				...options,
				entities: content.entities,
			});
		}
		if ('photo' in content) {
			return this.telegram.sendPhoto(
				this.chat.id,
				content.photo.at(-1).file_id,
				{
					...options,
					caption: content.caption,
					caption_entities: content.caption_entities,
				}
			);
		}
		if ('video' in content) {
			return this.telegram.sendVideo(
				this.chat.id,
				content.video.at(-1).file_id,
				{
					...options,
					caption: content.caption,
					caption_entities: content.caption_entities,
				}
			);
		}
		if ('video_note' in content) {
			return this.telegram.sendVideoNote(
				this.chat.id,
				content.video_note.file_id,
				{
					...options,
					thumb: content.video_note.thumb?.file_id,
					length: content.video_note.length,
					duration: content.video_note.duration,
				}
			);
		}
		return this.telegram.sendMessage(
			this.chat.id,
			`❌ <i>Unsupported message</i> <pre><code class="language-json">${JSON.stringify(
				content,
				null,
				2
			)}</code></pre>`,
			{ ...options, parse_mode: 'HTML' }
		);
	},
};
