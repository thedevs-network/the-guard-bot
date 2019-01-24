'use strict';

const R = require('ramda');
const { optional, passThru } = require('telegraf');

const { excludeLinks = [] } = require('../../config');

if (excludeLinks === false || excludeLinks === '*') {
	module.exports = passThru();
	return;
}

const isChannelForward = R.pathEq(
	[ 'message', 'forward_from_chat', 'type' ],
	'channel'
);
const fromAdmin = R.pathEq([ 'from', 'status' ], 'admin');

const inGroup = ctx => ctx.chat.type.endsWith('group');

const capturingGroups = R.tail;

const toUsername = R.compose(
	capturingGroups,
	R.match(/^(?:@|(?:https?:\/\/)?(?:t\.me|telegram\.(?:me|dog))\/)(\w+)/i)
);

const customWhitelist = R.pipe(
	R.chain(toUsername),
	R.map(R.toLower),
	R.constructN(1, Set),
)(excludeLinks);

const isWhitelisted = username => customWhitelist.has(username.toLowerCase());

const fromWhitelisted = ctx =>
	isWhitelisted(ctx.message.forward_from_chat.username || '');

const pred = R.allPass([
	inGroup,
	isChannelForward,
	R.complement(fromAdmin),
	R.complement(fromWhitelisted),
]);

const handler = ctx => {
	ctx.deleteMessage();
	return ctx.warn({
		admin: ctx.botInfo,
		reason: 'Channel forward',
		userToWarn: ctx.from,
		mode: 'auto',
	});
};

module.exports = optional(pred, handler);
