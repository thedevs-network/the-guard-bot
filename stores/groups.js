'use strict';

// Utils
const { logError } = require('../utils/log');

const Datastore = require('nedb-promise');

const groups = new Datastore({
	autoload: true,
	filename: 'data/Group.db',
});

groups.ensureIndex({
	fieldName: 'id',
	unique: true,
});

const addGroup = group =>
	groups.insert(group)
		.catch(logError(process.env.DEBUG));

const listGroups = () =>
	groups.find({});

const managesGroup = group =>
	groups.findOne({ id: group.id });

module.exports = {
	addGroup,
	listGroups,
	managesGroup,
};
