'use strict';

const Datastore = require('nedb-promise');

const bans = new Datastore({
	autoload: true,
	filename: 'data/bans.db'
});

bans.ensureIndex({
	fieldName: 'id',
	unique: true
});

const ban = (user, reason) =>
	bans.insert(Object.assign({}, user, { reason })).then(() => reason);

const unban = user =>
	bans.remove({ id: user.id });

const isBanned = user =>
	bans.findOne({ id: user.id }).then(bannedUser =>
		bannedUser
			? bannedUser.reason
			: bannedUser);

module.exports = {
	ban,
	isBanned,
	unban
};
