'use strict';

// Utils
const { quietLink, scheduleDeletion } = require('../../utils/tg');

// DB
const { getAdmins } = require('../../stores/user');

const staffHandler = async ctx => {
	const admins = await getAdmins();
	admins.sort((a, b) => a.first_name > b.first_name ? 1 : -1);

	const links = admins.map(quietLink);

	const list = links.map(s => `⭐ ${s}`).join('\n');

	return ctx.replyWithHTML(`<b>Admins in the network:</b>\n\n${list}`, {
		disable_notification: true,
		disable_web_page_preview: true,
	}).then(scheduleDeletion());
};

module.exports = staffHandler;
