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
		{
			first_name,
			id,
			last_name,
			status: 'member',
			username: username.toLowerCase(),
			warns: []
		},
		{ upsert: true }
	)
		.catch(logError);

const isUser = ({ id }) =>
	User.findOne({ id });

const getUser = user =>
	User.findOne(user);

const admin = ({ id }) =>
	User.update(
		{ id },
		{ $set: { status: 'admin' } }
	);

const getAdmins = () =>
	User.find({ status: 'admin' });

const unadmin = ({ id }) =>
	User.update({ id }, { $set: { status: 'member' } });

const isAdmin = ({ id }) =>
	User.findOne({ id, status: 'admin' });

const ban = ({ id }, ban_reason) =>
	User.update({ id }, { $set: { ban_reason, status: 'banned' } });

const unban = ({ id }) =>
	User.update(
		{ id },
		{ $set: { ban_reason: null, status: 'member', warns: [] } }
	);

const isBanned = ({ id }) =>
	User.findOne({ id, status: 'banned' })
		.then(user => user ? user.ban_reason : null);

const warn = ({ id }, reason) =>
	User.update({ id }, { $push: { warns: reason } });

const unwarn = ({ id }) =>
	User.update(
		{ id },
		{ $pop: { warns: 1 }, $set: { ban_reason: null, status: 'member' } }
	);

const nowarns = unban;

const getWarns = ({ id }) =>
	User.findOne({ id })
		.then(user => user && user.warns.length > 0
			? user.warns
			: null);

module.exports = {
	addUser,
	admin,
	ban,
	getAdmins,
	getUser,
	getWarns,
	isAdmin,
	isBanned,
	isUser,
	nowarns,
	unadmin,
	unban,
	unwarn,
	warn
};
