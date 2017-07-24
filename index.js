'use strict';

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const { inspect } = require('util');

const print = value =>
	console.log(inspect(value, { colors: true, depth: null }));

const Telegraf = require('telegraf');

const { loadJSON } = require('./utils/json');
const { link } = require('./utils/tg');

const bans = require('./bans');
const warns = require('./warns');
const admins = require('./admins');

const config = loadJSON('config.json');

const bot = new Telegraf(config.token);

bot.use((ctx, next) =>
	(print(ctx.update), next()));

bot.command('warn', ({ message, reply }) => {
	admins.isAdmin(message.from).then(isAdmin => {
		if (isAdmin) {
			if (message.reply_to_message) {
				const userToWarn = message.reply_to_message.from;
				warns.warn(userToWarn, message.text)
				.then(warns =>
					reply(
						`${link(userToWarn)} warned! (${warns}/3)`,
						{
							parse_mode: 'HTML',
							disable_web_page_preview: true,
							reply_to: message.reply_to_message.message_id
						}));
			}
		}
	});
});

bot.startPolling();
