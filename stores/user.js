'use strict';

// Utils
const { logError } = require('../utils/log');

const Datastore = require('nedb-promise');

const User = new Datastore({
	autoload: true,
	filename: 'data/User.db'
});

User.ensureIndex({
	fieldName: 'id',
	unique: true
});

User.ensureIndex({
	fieldName: 'status',
});

const addUser = ({ id, first_name = '', last_name = '', username = '' }) =>
	User.update(
		{ id },
		{ first_name, id, last_name, status: 'member', username, warns: [] },
		{ upsert: true })
		.catch(logError(process.env.DEBUG));

const isUser = ({ id }) =>
	User.findOne({ id });

const getUser = user =>
	User.findOne(user);

const admin = ({ id, first_name = '', last_name = '', username = '' }) =>
	User.update(
		{ id },
		{ first_name, id, last_name, status: 'admin', username, warns: [] })
		.catch(logError(process.env.DEBUG));

const getAdmins = () =>
	User.find({ status: 'admin' });

const unadmin = ({ id }) =>
	User.update({ id }, { $set: { status: 'member' } });

const isAdmin = ({ id }) =>
	User.findOne({ id, status: 'admin' });

const ban = (userToBan, banReason) => {
	const { id, first_name = '', last_name = '', username = '' } = userToBan;
	const userObj = { first_name, id, last_name, username, warns: [] };
	return User.findOne({ id })
		.then(user => user
			? User.update({ id }, { $set: { banReason, status: 'banned' } })
			: User.update(
				{ id },
				Object.assign({}, userObj, { banReason, status: 'banned' }),
				{ upsert: true }));
};

const unban = ({ id }) =>
	User.update({ id }, { $set: { banReason: '', status: 'member' } });

const isBanned = ({ id }) =>
	User.findOne({ id, status: 'banned' })
		.then(user => user ? user.banReason : null);

module.exports = {
	addUser,
	admin,
	ban,
	getAdmins,
	getUser,
	isAdmin,
	isBanned,
	isUser,
	unadmin,
	unban
};
