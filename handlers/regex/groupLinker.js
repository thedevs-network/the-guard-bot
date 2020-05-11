'use strict';

const { hears } = require('telegraf');
const XRegExp = require('xregexp');

const { managesGroup } = require.main.require('./stores/group');

const { replyId } = require('../../utils/tg');

const regex = XRegExp.tag('ix')`^
	(?<groupName>.+?)
	\s(?:chat|gro?u?p)(?:\slink)?
	(?:,?\sple?a?[sz]e?)?
	\s*\?*
$`;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const handler = async (ctx, next) => {
	let [ , groupName ] = ctx.match;
	if (groupName.toLowerCase() === 'this') {
		if (!ctx.chat.title) return next();
		groupName = ctx.chat.title;
	}

	const $regex = XRegExp.tag('nix')`(^|/\s?)
		(the\s)?${groupName}(\sgroup|\schat)?
	($|\s?/)`;

	const group = await managesGroup({ title: { $regex } });
	const { link } = group || {};

	if (!link) return next();

	return ctx.reply(link, {
		disable_web_page_preview: false,
		reply_to_message_id: replyId(ctx.message),
	});
};

module.exports = hears(regex, handler);
