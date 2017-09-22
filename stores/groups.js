'use strict';

const Datastore = require('nedb-promise');

const groups = new Datastore({
	autoload: true,
	filename: 'data/groups.db',
});

groups.ensureIndex({
	fieldName: 'id',
	unique: true,
});

const addGroup = group =>
	groups.insert(group);

const listGroups = () =>
	groups.find({});

const managesGroup = group =>
	groups.findOne({ id: group.id });

module.exports = {
	addGroup,
	listGroups,
	managesGroup,
};
