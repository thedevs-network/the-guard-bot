'use strict';

// Utils
const { logError } = require('../utils/log');

const Datastore = require('nedb-promise');

const Group = new Datastore({
	autoload: true,
	filename: 'data/Group.db',
});

Group.ensureIndex({
	fieldName: 'id',
	unique: true,
});

const addGroup = group =>
	Group.insert(group)
		.catch(logError);

const listGroups = () =>
	Group.find({});

const managesGroup = group =>
	Group.findOne({ id: group.id });

module.exports = {
	addGroup,
	listGroups,
	managesGroup,
};
