'use strict';

const Datastore = require('nedb-promise');

const warns = new Datastore({
	filename: 'data/warns.db',
	autoload: true
});

warns.ensureIndex({
	fieldName: 'id',
	unique: true
});


const warn = (user, reason) =>
	warns.findOne({ id: user.id }).then(exists =>
		exists || warns.insert(Object.assign({}, user, { warns: [] })))
	.then(user => (warns.update(
		{ id: user.id },
		{ $push: { warns: reason } }), user))
	.then(user => user.warns.length + 1);

const unwarn = user =>
	warns.findOne({ id: user.id }).then(exists =>
		exists && exists.warns.pop())
	.then(warn =>
		(warn && warns.update({ id: user.id }, { $pop: { warns: 1 } })),
		warn);
	

module.exports = {
	warn,
	unwarn
};
