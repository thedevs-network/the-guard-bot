'use strict';

const { hears } = require('telegraf');
const XRegExp = require('xregexp');

const { managesGroup } = require.main.require('./stores/group');

const regex = XRegExp.tag('ix')`^
	(?:ple?a?[sz]e?,?\s)?
	(?:(?:Can|Could)\s(?:you\s|(?:some|any)(?:one|body)\s))?
	(?:(?:
		Any
		|Link\sto
		|Go\s*to
		|Ask\sin
		|Move\sthis\sto
		|(?:Give|tell|dm|pm|send|share)(?:\sme)?
		|(?:Do\swe\shave|Is\sthere)(?:\san?y?)?
	)\s+)?
	(?<groupName>.+?)
	\s(?:chat|gro?u?p)(?:\slink)?
	(?:\sexists?)?
	(?:,?\sple?a?[sz]e?)?
	\s*\?*
$`;

const handler = async (ctx, next) => {
	let [ , groupName ] = ctx.match;
	if (groupName.toLowerCase() === 'this') {
		if (!ctx.chat.title) return next();
		groupName = ctx.chat.title;
	}

	const $regex = XRegExp.tag('ni')`^(the\s)?${groupName}(\sgroup|\schat)?$`;

	const group = await managesGroup({ title: { $regex } });
	const { link } = group || {};

	if (!link) return next();

	return ctx.reply(link, { reply_to_message_id: ctx.message.message_id });
};

module.exports = hears(regex, handler);
