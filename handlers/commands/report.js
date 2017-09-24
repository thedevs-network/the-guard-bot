'use strict';

// Utils
const { link } = require('../../utils/tg');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const { allAdmins } = require('../../stores/admin');

const reportHandler = async ctx => {
	const msg = ctx.message;
	if (!msg.reply_to_message) {
		return ctx.reply('ℹ️ <b>Reply to message you\'d like to report</b>',
			replyOptions);
	}
	const admins = await allAdmins();
	const adminObjects = admins.map(user => ({
		first_name: '⭐️', // small hack to be able to use link function
		id: user.user_id,
	}));
	const stars = adminObjects.map(link).join('');
	const s = `📋 ${link(ctx.from)} <b>reported the message to admins:</b> ` +
		`${stars}`;
	return ctx.replyWithHTML(s, {
		reply_to_message_id: msg.reply_to_message.message_id
	});
};

module.exports = reportHandler;
