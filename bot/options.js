// @ts-check
'use strict';

/** @type {import('telegraf/typings/telegram-types').ExtraReplyMessage} */
const replyOptions = {
	disable_web_page_preview: true,
	parse_mode: 'HTML',
	reply_markup: { remove_keyboard: true }
};

module.exports = {
	replyOptions
};
