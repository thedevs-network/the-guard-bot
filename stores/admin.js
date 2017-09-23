'use strict';

const Datastore = require('nedb-promise');

const Admin = new Datastore({
	autoload: true,
	filename: 'data/Admin.db'
});

Admin.ensureIndex({
	fieldName: 'user_id',
	unique: true
});

const admin = user =>
	Admin.insert({ user_id: user.id });

const allAdmins = () =>
	Admin.find({});

const unadmin = user =>
	Admin.remove({ user_id: user.id });

const isAdmin = user =>
	Admin.findOne({ user_id: user.id });

module.exports = {
	admin,
	allAdmins,
	isAdmin,
	unadmin
};
