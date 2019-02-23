'use strict';
const { Markup } = require('telegraf');
const { homepage } = require('../../package.json');

const message = `\
Hey there!

I'm an <b>administration</b> bot that helps you to keep \
your <b>groups</b> safe from <b>spammers.</b>

Send /commands to get the list of available commands.

If you want to use me for your groups, \
note that I'm more useful on a network of groups and \
you also need to <b>setup a new bot.</b>

So if you don't wish to self-host, @MissRose_bot \
might be a better choice for you.
`;

const helpHandler = ({ chat, replyWithHTML }) => {
	if (chat.type !== 'private') return null;

	return replyWithHTML(
		message,
		Markup.inlineKeyboard([
			Markup.urlButton('🛠 Setup a New Bot', homepage)
		]).extra()
	);
};

module.exports = helpHandler;
