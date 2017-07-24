'use strict';

const link = user =>
	user.username
		? `<a href="https://t.me/${user.username}">${user.username}</a>`
		: `<code>${user.first_name}</code>`;

module.exports = {
	link
};
