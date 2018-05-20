'use strict';

const eq = require('../../utils/eq');
const { isCommand } = require('../../utils/tg');

module.exports = ({ me, message }) => {
	if (!isCommand(message)) return null;

	const [ , command, username ] = /^\/(\w+)(@\w+)?/.exec(message.text);

	if (username && !eq.username(username, me)) return null;

	return { route: command.toLowerCase() };
};
