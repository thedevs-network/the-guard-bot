'use strict';

const Datastore = require('nedb-promise');

const Warn = new Datastore({
	autoload: true,
	filename: 'data/Warn.db'
});

Warn.ensureIndex({
	fieldName: 'user_id',
	unique: true
});


const warn = (user, reason) =>
	Warn.findOne({ user_id: user.id })
		.then(isUser =>
			isUser || Warn.insert({ reasons: [], user_id: user.id }))
		.then(loadedUser =>
			Warn.update(
				{ user_id: loadedUser.user_id },
				{ $push: { reasons: reason } })
				.then(() => loadedUser.reasons.length + 1));

const unwarn = user =>
	Warn.findOne({ user_id: user.id })
		.then(isUser => isUser && isUser.reasons.pop())
		.then(lastWarn =>
			lastWarn && Warn.update(
				{ user_id: user.id },
				{ $pop: { reasons: 1 } })
				.then(() => lastWarn));

const getWarns = user =>
	Warn.findOne({ user_id: user.id })
		.then(isUser =>
			isUser && isUser.reasons)
		.then(loadedWarns => loadedWarns || []);

module.exports = {
	getWarns,
	unwarn,
	warn
};
