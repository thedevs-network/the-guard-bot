'use strict';

// Utils
const { logError } = require('../../utils/log');

const { managesGroup } = require('../../stores/group');

const pkg = require('../../package.json');


const caption = `\
Sorry, you need to set up your own instance \
to use me in your group or a network of groups.

For managing a single group, it'll be simpler for you \
to use @GroupButler_bot or @mattatabot instead.
`;

const inline_keyboard = [ [ {
	text: '🛠 Setup a New Bot',
	url: pkg.homepage,
} ] ];

const reply_markup = JSON.stringify({ inline_keyboard });

const gifs = [
	'https://media.giphy.com/media/xTk9ZBWrma4PIC9y4E/giphy.gif',
	'https://media.giphy.com/media/l2Sqc3POpzkj5r8SQ/giphy.gif',
	'https://media.giphy.com/media/StaMzjNkq5PqM/giphy.gif',
	'https://media.giphy.com/media/fjYDN5flDJ756/giphy.gif',
	'https://media.giphy.com/media/3XiQswSmbjBiU/giphy.gif',
];

const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];

const leaveUnmanagedHandler = async (ctx, next) => {
	if (ctx.chat.type === 'private' || await managesGroup(ctx.chat)) {
		return next();
	}

	try {
		await ctx.replyWithVideo(randomChoice(gifs), { caption, reply_markup });
	} catch (err) {
		logError(err);
	}
	await ctx.telegram.leaveChat(ctx.chat.id);
	return next();
};

module.exports = leaveUnmanagedHandler;
