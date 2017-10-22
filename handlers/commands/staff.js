'use strict';

// Utils
const { quietLink } = require('../../utils/tg');

// DB
const { getAdmins } = require('../../stores/user');

const staffHandler = async ctx => {
	const admins = await getAdmins();

	const links = admins.map(quietLink);

	const list = links.map(s => `⭐ ${s}`).join('\n');

	return ctx.replyWithHTML(`<b>Admins in the network:</b>\n\n${list}`, {
		disable_notification: true,
		disable_web_page_preview: true,
	});
};

module.exports = staffHandler;
