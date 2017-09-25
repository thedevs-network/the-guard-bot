'use strict';

// Utils
const { logError } = require('../utils/log');

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
	Admin.insert({
		first_name: user.first_name,
		user_id: user.id,
	})
		.catch(logError(process.env.DEBUG));

const allAdmins = () =>
	Admin.find({});

const unadmin = user =>
	Admin.remove({ user_id: user.id })
		.catch(logError(process.env.DEBUG));

const isAdmin = user =>
	Admin.findOne({ user_id: user.id });

module.exports = {
	admin,
	allAdmins,
	isAdmin,
	unadmin
};
