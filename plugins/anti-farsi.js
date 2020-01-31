'use strict';

const FARSI_RE = /[\u0600-\u06FF]/;
const timeout = 5 * 1000;

const replies = {
	'-1001493007117':
        'Please only send proxies here and write in English. ' +
        'For farsi chatting join [the farsi group]' +
        '(https://t.me/joinchat/E7Xrc0g4m0VlTV7oHyu8EQ).',

	'-1001178537590':
        'Please only talk in english here. ' +
        'For farsi chatting join [the farsi group]' +
        '(https://t.me/joinchat/E7Xrc0g4m0VlTV7oHyu8EQ).',
};

const chatsToReply = Object.keys(replies).map(Number);

module.exports = (ctx, next) => {
	const { message, chat, replyWithMarkdown } = ctx;

	if (!message || message.from.id === 777000) {
		return next();
	}

	const { text } = message;
	const replyOptions = {
		reply_to_message_id: message.message_id,
		disable_web_page_preview: true,
	};

	if (!text || !chatsToReply.includes(chat.id)) {
		return next();
	}

	const isFarsi = FARSI_RE.test(text);

	if (isFarsi) {
		replyWithMarkdown(replies[chat.id],	replyOptions)
			.then(reply => {
				setTimeout(() => {
					ctx.telegram.deleteMessage(reply.chat.id, reply.message_id);
					ctx.deleteMessage();
				}, timeout);
			});
	}

	return next();
};
