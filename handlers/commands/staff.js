'use strict';

// Utils
const { html, TgHtml } = require('../../utils/html');
const { quietLink, scheduleDeletion } = require('../../utils/tg');

// DB
const { getAdmins } = require('../../stores/user');

/** @param { import('../../typings/context').ExtendedContext } ctx */
const staffHandler = async ctx => {
	const admins = await getAdmins();
	admins.sort((a, b) => a.first_name > b.first_name ? 1 : -1);

	const links = admins.map(quietLink);

	const list = TgHtml.join('\n', links.map(s => html`⭐ ${s}`));

	return ctx.replyWithHTML(html`<b>Admins in the network:</b>\n\n${list}`, {
		disable_notification: true,
		disable_web_page_preview: true,
	}).then(scheduleDeletion());
};

module.exports = staffHandler;
