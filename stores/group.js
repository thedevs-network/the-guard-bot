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

const hideGroup = ({ id }) =>
	Group.update({ id }, { $set: { link: '' } });

const updateGroup = group =>
	Group.update({ id: group.id }, { $set: group });

const listGroups = (query = {}) =>
	Group.find(query);

const listVisibleGroups = () =>
	Group.find({ $not: { link: '' } });

const managesGroup = group =>
	Group.findOne(group);

const migrateGroup = (oldId, newId) =>
	Group.update(
		{ id: oldId, type: 'group' },
		{ $set: { id: newId, type: 'supergroup' } },
	);

const removeGroup = ({ id }) =>
	Group.remove({ id });

module.exports = {
	addGroup,
	hideGroup,
	listGroups,
	listVisibleGroups,
	managesGroup,
	migrateGroup,
	removeGroup,
	updateGroup,
};
