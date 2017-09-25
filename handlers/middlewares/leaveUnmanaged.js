'use strict';

// Utils
const { logError } = require('../../utils/log');

const { managesGroup } = require('../../stores/group');

const pkg = require('../../package.json');


const caption = `\
Sorry, you need to set up your own instance \
to use me in your group or network of groups.

For managing single group, it'll be simpler for you \
to use @GroupButler_bot or @mattatabot instead.
`;

const inline_keyboard = [ [ {
	text: 'Set up your own instance',
	url: pkg.homepage,
} ] ];

const reply_markup = JSON.stringify({ inline_keyboard });

const gifs = [
	'http://i.memeful.com/media/post/4wbkyXM_700wa_0.gif',
	'https://media.giphy.com/media/vaAiMdHHBTqla/giphy.gif',
	'https://media.giphy.com/media/StaMzjNkq5PqM/giphy.gif',
	'https://media.giphy.com/media/fjYDN5flDJ756/giphy.gif',
];

const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];

const leaveUnmanagedHandler = async (ctx, next) => {
	if (ctx.chat.type === 'private' || await managesGroup(ctx.chat)) {
		return next();
	}

	try {
		await ctx.replyWithVideo(randomChoice(gifs), { caption, reply_markup });
	} catch (err) {
		logError(process.env.DEBUG)(err);
	}

	return ctx.telegram.leaveChat(ctx.chat.id);
};

module.exports = leaveUnmanagedHandler;
