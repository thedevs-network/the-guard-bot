'use strict';

const { hears } = require('telegraf');
const XRegExp = require('xregexp');

const { managesGroup } = require.main.require('./stores/group');

const regex = /^(?:Link to\s+)?(.+) group(?: link)?\s*\?*$/i;

const handler = async (ctx, next) => {
	let [ , groupName ] = ctx.match;
	if (groupName.toLowerCase() === 'this') {
		if (!ctx.chat.title) return next();
		groupName = ctx.chat.title;
	}

	const $regex = XRegExp.tag('i')`${groupName}`;

	const group = await managesGroup({ title: { $regex } });
	const { link } = group || {};

	if (!link) return next();

	return ctx.reply(link, { reply_to_message_id: ctx.message.message_id });
};

module.exports = hears(regex, handler);
