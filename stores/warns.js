'use strict';

const Datastore = require('nedb-promise');

const warns = new Datastore({
	autoload: true,
	filename: 'data/warns.db'
});

warns.ensureIndex({
	fieldName: 'id',
	unique: true
});


const warn = (user, reason) =>
	warns.findOne({ id: user.id }).then(exists =>
		exists || warns.insert(Object.assign({}, user, { warns: [] })))
		.then(loadedUser => (warns.update(
			{ id: loadedUser.id },
			{ $push: { warns: reason } }), loadedUser))
		.then(loadedUser => loadedUser.warns.length + 1);

const unwarn = user =>
	warns.findOne({ id: user.id })
		.then(exists => exists && exists.warns.pop())
		.then(lastWarn =>
			(lastWarn && warns.update({ id: user.id }, { $pop: { warns: 1 } }),
				lastWarn));

const getWarns = user =>
	warns.findOne({ id: user.id }).then(exists =>
		exists && exists.warns)
		.then(loadedWarns => loadedWarns || []);

module.exports = {
	getWarns,
	unwarn,
	warn
};
