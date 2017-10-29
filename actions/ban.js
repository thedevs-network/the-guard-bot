'use strict';

const emitter = require('./emitter');

const { telegram } = require('../bot');

const { listGroups } = require('../stores/group');
const { ban } = require('../stores/user');


module.exports = async (userToBan, reason) => {
	// move some checks from handler here?

	await ban(userToBan, reason);

	const groups = await listGroups();

	groups.forEach(group =>
		telegram.kickChatMember(group.id, userToBan.id));

	emitter.emit('ban', userToBan, reason);

	// return something useful?
};
