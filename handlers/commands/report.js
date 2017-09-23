'use strict';

// Utils
const { link } = require('../../utils/tg');

// DB
const { allAdmins } = require('../../stores/admin');

const reportHandler = async ctx => {
	const msg = ctx.message;
	if (!msg.reply_to_message) {
		return ctx.reply('Reply to message you\'d like to report');
	}
	const admins = await allAdmins();
	const adminObjects = admins.map(user => ({
		first_name: '⭐️', // small hack to be able to use link function
		id: user.user_id,
	}));
	const stars = adminObjects.map(link).join('');
	const s = `${link(ctx.from)} reported the message to admins: ${stars}`;
	return ctx.replyWithHTML(s, {
		reply_to_message_id: msg.reply_to_message.message_id
	});
};

module.exports = reportHandler;
