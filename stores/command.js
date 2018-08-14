'use strict';

const Datastore = require('nedb-promise');

const Command = new Datastore({
	autoload: true,
	filename: 'data/Command.db',
});

Command.ensureIndex({
	fieldName: 'name',
	unique: true,
});

const addCommand = command =>
	Command.update(
		{ name: command.name },
		Object.assign({}, command, { isActive: false }),
		{ upsert: true }
	);

const updateCommand = (data) =>
	Command.update({ id: data.id, isActive: false }, { $set: data });

const removeCommand = command => Command.remove(command);

const getCommand = (data) => Command.findOne(data);

const listCommands = () =>
	Command.cfind({ isActive: true }).sort({ name: 1 }).exec();

module.exports = {
	addCommand,
	getCommand,
	listCommands,
	removeCommand,
	updateCommand,
};
