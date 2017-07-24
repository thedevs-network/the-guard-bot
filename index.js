'use strict';

const DEBUG = false;

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const Telegraf = require('telegraf');

// Utils
const { link } = require('./utils/tg');
const { loadJSON } = require('./utils/json');
const { print, logError } = require('./utils/log');

// DBs
const bans = require('./bans');
const warns = require('./warns');
const admins = require('./admins');

const replyOptions = {
	parse_mode: 'HTML',
	disable_web_page_preview: true
};

const config = loadJSON('config.json');

const bot = new Telegraf(config.token);

bot.use(async (ctx, next) => {
	DEBUG && print(ctx.update);
	const banned = await bans.isBanned(ctx.from);
	if (banned) {
		return bot.telegram.kickChatMember(ctx.chat.id, ctx.from.id)
			.then(() => reply(
				`${link(ctx.from)} <b>banned</b>!\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError(DEBUG))
			.then(next);
	}
	return next();
});

bot.command('adminme', ctx =>
	(admins.admin(ctx.from),
	ctx.reply('Admined!')));

bot.command('warn', async ({ message, chat, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const messageToWarn = message.reply_to_message;
	const userToWarn = messageToWarn.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('Need a reason');
	}

	const warnCount = await warns.warn(userToWarn, reason);
	const promises = [
		bot.telegram.deleteMessage(chat.id, messageToWarn.message_id),
		bot.telegram.deleteMessage(chat.id, message.message_id)
	];

	if (warnCount < 3) {
		promises.push(reply(
			`${link(userToWarn)} warned! (${warnCount}/3)\n` +
			`Reason: ${reason}`,
			replyOptions));
		
	} else {
		promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
		promises.push(bans.ban(userToWarn, 'Reached max number of warnings'));
		promises.push(reply(
			`${link(userToWarn)} <b>banned</b>! (${warnCount}/3)\n` +
			`Reason: Reached max number of warnings`,
			replyOptions));
	}

	return Promise.all(promises).catch(logError(DEBUG));
});

bot.command('unwarn', async ({ message }) => {
	if (!await admins.isAdmin(message.from)) {
		return;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	
});

bot.startPolling();
