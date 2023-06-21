'use strict';
const { Markup } = require('telegraf');
const { homepage } = require('../../package.json');

const message = `\
Hey there!

I'm an <b>administration</b> bot for @werewolfquicker group which helps to keep \
rid of <b>spammers.</b>

Send /commands for the available list of commands.

Note that you can't use me in your group.
`;

/** @param { import('../../typings/context').ExtendedContext } ctx */
const helpHandler = (ctx) => {
	if (ctx.chat.type !== 'private') return null;

	return ctx.replyWithHTML(
		message,
		Markup.inlineKeyboard([
			Markup.button.url('🛠 Setup a New Bot', homepage)
		])
	);
};

module.exports = helpHandler;
