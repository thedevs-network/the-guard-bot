'use strict';

const R = require('ramda');
const { optional, passThru } = require('telegraf');

const { permit } = require('../../stores/user');

const { html, lrm } = require('../../utils/html');
const { excludeLinks = [] } = require('../../utils/config').config;

if (excludeLinks === false || excludeLinks === '*') {
	module.exports = passThru();
	return;
}

const isChannelForward = R.pathEq(
	[ 'message', 'forward_from_chat', 'type' ],
	'channel',
);
const fromAdmin = R.pathEq([ 'from', 'status' ], 'admin');

const inGroup = ctx => ctx.chat.type.endsWith('group');

const capturingGroups = R.tail;

const toUsername = R.compose(
	capturingGroups,
	R.match(/^(?:@|(?:https?:\/\/)?(?:t\.me|telegram\.(?:me|dog))\/)(\w+)/i),
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

/** @param { import('../../typings/context').ExtendedContext } ctx */
const handler = async (ctx, next) => {
	if (await permit.revoke(ctx.from)) {
		await ctx.replyWithHTML(html`${lrm}${ctx.from.first_name} used 🎟 permit!`);
		return next();
	}

	ctx.deleteMessage().catch(() => null);
	return ctx.warn({
		admin: ctx.botInfo,
		reason: 'Channel forward',
		userToWarn: ctx.from,
		mode: 'auto',
	});
};

module.exports = optional(pred, handler);
