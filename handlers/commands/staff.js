'use strict';

// Utils
const { link } = require('../../utils/tg');

// DB
const { allAdmins } = require('../../stores/admin');

const staffHandler = async ctx => {
	const admins = await allAdmins();

	const links = admins
		// this first .map wouldn't have to be here
		// if we stored whole user as-is
		// ie. if id was available as id, not user_id
		.map(admin => ({
			first_name: admin.first_name,
			id: admin.user_id,
		}))
		.map(link);

	const list = links.map(s => `⭐ ${s}`).join('\n');

	return ctx.replyWithHTML(`<b>Admins in the network:</b>\n\n${list}`, {
		disable_notification: true,
	});
};

module.exports = staffHandler;
