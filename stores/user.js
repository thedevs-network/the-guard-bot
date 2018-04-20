'use strict';

// Utils
const { logError } = require('../utils/log');

const Datastore = require('nedb-promise');
const R = require('ramda');

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

// Migration
User.update(
	{ username: '' },
	{ $unset: { username: true } },
	{ multi: true }
).then(() =>
	User.ensureIndex({ fieldName: 'username', sparse: true, unique: true }));

const normalizeTgUser = R.pipe(
	R.pick([ 'first_name', 'id', 'last_name', 'username' ]),
	R.evolve({ username: R.toLower }),
	R.merge({ first_name: '', last_name: '' }),
);

const getUpdatedDocument = R.prop(1);

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

const updateUser = async (rawTgUser) => {
	const tgUser = normalizeTgUser(rawTgUser);

	const { id, username } = tgUser;

	const [ rawDbUser ] = await Promise.all([
		getUser({ id }),
		User.update({ $not: { id }, username }, { $unset: { username: true } }),
	]);

	if (rawDbUser === null) {
		return User.update(
			{ id },
			{ status: 'member', warns: [], ...tgUser },
			{ returnUpdatedDocs: true, upsert: true }
		).then(getUpdatedDocument);
	}

	const dbUser = rawDbUser;

	if (!R.whereEq(tgUser, dbUser)) {
		return User.update(
			{ id },
			{ $set: tgUser },
			{ returnUpdatedDocs: true }
		).then(getUpdatedDocument);
	}

	return dbUser;
};

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

const ban = ({ id }, ban_details) => {
	const ban_reason = ban_details.reason;
	return User.update(
		{ id },
		{ $set: { ban_details, ban_reason, status: 'banned' } }
	);
};

const unban = ({ id }) =>
	User.update(
		{ id },
		{
			$set: { status: 'member', warns: [] },
			$unset: { ban_details: true, ban_reason: true },
		}
	);

const isBanned = ({ id }) =>
	User.findOne({ id, status: 'banned' })
		.then(user => user ? user.ban_reason : null);

const warn = ({ id }, reason) =>
	User.update(
		{ id },
		{ $push: { warns: reason } },
		{ returnUpdatedDocs: true }
	).then(getUpdatedDocument);

const unwarn = ({ id }) =>
	User.update(
		{ id },
		{
			$pop: { warns: 1 },
			$set: { status: 'member' },
			$unset: { ban_details: true, ban_reason: true },
		}
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
	updateUser,
	warn
};
