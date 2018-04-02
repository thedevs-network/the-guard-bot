'use strict';

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
	Group.update({ id: group.id }, group, { upsert: true });

const updateGroup = group =>
	Group.update({ id: group.id }, { $set: group });

const listGroups = () =>
	Group.find({});

const managesGroup = group =>
	Group.findOne(group);

const removeGroup = ({ id }) =>
	Group.remove({ id });

module.exports = {
	addGroup,
	listGroups,
	managesGroup,
	removeGroup,
	updateGroup,
};
