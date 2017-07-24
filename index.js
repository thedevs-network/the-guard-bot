'use strict';

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const { inspect } = require('util');
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

bot.use((ctx, next) =>
	(print(ctx.update),
	next()));

bot.command('adminme', ctx =>
	(admins.admin(ctx.from),
	ctx.reply('Admined!')));

bot.command('warn', async ({ message, chat, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return;
	}
	if (!message.reply_to_message) {
		return;
	}

	const messageToWarn = message.reply_to_message;
	const userToWarn = messageToWarn.from;
	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (reason.length === 0) {
		return reply('Need a reason');
	}

	const warnCount = await warns.warn(userToWarn, reason);
	return Promise.all([
		bot.telegram.deleteMessage(chat.id, messageToWarn.message_id),
		bot.telegram.deleteMessage(chat.id, message.message_id),
		reply(
			`${link(userToWarn)} warned! (${warnCount}/3)\nReason: ${reason}`,
			replyOptions)
	]).catch(logError);
});

bot.startPolling();
