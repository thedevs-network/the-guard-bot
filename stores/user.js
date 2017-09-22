'use strict';

const Datastore = require('nedb-promise');

const User = new Datastore({
	autoload: true,
	filename: 'data/User.db'
});

User.ensureIndex({
	fieldName: 'id',
	unique: true
});

const addUser = ({ id, first_name = '', last_name = '', username = '' }) =>
	User.insert({ first_name, id, last_name, username });

const isUser = ({ id }) =>
	User.findOne({ id });

module.exports = {
	addUser,
	isUser
};
