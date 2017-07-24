'use strict';

const Datastore = require('nedb-promise');

const admins = new Datastore({
	filename: 'data/admins.db',
	autoload: true
});

admins.ensureIndex({
	fieldName: 'id',
	unique: true
});

const admin = user =>
	admins.insert(user);

const unadmin = user =>
	admins.remove({ id: user.id });

const isAdmin = user =>
	admins.findOne({ id: user.id });

module.exports = {
	admin,
	unadmin,
	isAdmin
};
