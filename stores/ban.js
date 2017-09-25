'use strict';

// Utils
const { logError } = require('../utils/log');

const Datastore = require('nedb-promise');

const Ban = new Datastore({
	autoload: true,
	filename: 'data/Ban.db'
});

Ban.ensureIndex({
	fieldName: 'user_id',
	unique: true
});

const ban = (user, reason) =>
	Ban.insert({ reason, user_id: user.id })
		.catch(logError(process.env.DEBUG));

const unban = user =>
	Ban.remove({ user_id: user.id })
		.catch(logError(process.env.DEBUG));

const isBanned = user =>
	Ban.findOne({ user_id: user.id }).then(bannedUser =>
		bannedUser
			? bannedUser.reason
			: bannedUser);

module.exports = {
	ban,
	isBanned,
	unban
};
