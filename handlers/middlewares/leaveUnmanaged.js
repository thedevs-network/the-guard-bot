'use strict';

// Utils
const { logError } = require('../../utils/log');

const { managesGroup } = require('../../stores/group');

const { chats = {} } = require('../../config');

const pkg = require('../../package.json');


const caption = `\
Sorry, you need to set up your own instance \
to use me in your group or a network of groups.

If you don't wish to self host, \
you can try @MissRose_bot instead.
`;

const inline_keyboard = [ [ {
	text: '🛠 Setup a New Bot',
	url: pkg.homepage,
} ] ];

const reply_markup = JSON.stringify({ inline_keyboard });

const gifIds = [
	'xTk9ZBWrma4PIC9y4E',
	'l2Sqc3POpzkj5r8SQ',
	'StaMzjNkq5PqM',
	'fjYDN5flDJ756',
	'3XiQswSmbjBiU'
];

const gifs = gifIds.map(x => `https://media.giphy.com/media/${x}/giphy.gif`);


/**
 * @param {Array} arr An anonymous array
 * @returns {Number} A random number
 */
const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];


/**
 * @param {TelegrafContext} ctx - Telegraf context object
 * @param {Function} next - method for returning next object
 * @returns {Promise.<*>} - returns next object
 */
const leaveUnmanagedHandler = async (ctx, next) => {
	if (
		ctx.chat.type === 'private' ||
		Object.values(chats).includes(ctx.chat.id) ||
		await managesGroup({ id: ctx.chat.id })) {
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
