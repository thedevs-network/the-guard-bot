'use strict';

const DEBUG = true;

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const Telegraf = require('telegraf');

// Utils
const { loadJSON } = require('./utils/json');
const { print, logError } = require('./utils/log');
const { link, deleteAfter } = require('./utils/tg');

// DBs
const bans = require('./stores/bans');
const warns = require('./stores/warns');
const admins = require('./stores/admins');

const replyOptions = {
	disable_web_page_preview: true,
	parse_mode: 'HTML'
};

const config = loadJSON('config.json');

const bot = new Telegraf(config.token);

bot.command('adminme', ctx =>
	(admins.admin(ctx.from),
		ctx.reply('Admined')));

bot.on('new_chat_member', deleteAfter(10 * 60 * 1000));
bot.on('left_chat_member', deleteAfter(10 * 60 * 1000));

bot.use(async (ctx, next) => {
	DEBUG && ctx.message && print(ctx.message);
	const banned = await bans.isBanned(ctx.from);
	if (banned) {
		return bot.telegram.kickChatMember(ctx.chat.id, ctx.from.id)
			.then(() => ctx.reply(
				`${link(ctx.from)} <b>banned</b>!\n` +
				`Reason: ${banned}`,
				replyOptions))
			.catch(logError(DEBUG))
			.then(next);
	}
	return next();
});

bot.command('warn', async ({ message, chat, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
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

	if (await admins.isAdmin(userToWarn)) {
		return reply('Can\'t warn other admin');
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
			'Reason: Reached max number of warnings',
			replyOptions));
	}

	return Promise.all(promises).catch(logError(DEBUG));
});

bot.command('unwarn', async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}

	const messageToUnwarn = message.reply_to_message;
	const userToUnwarn = messageToUnwarn.from;

	const warnCount = await warns.getWarns(userToUnwarn);
	const warn = await warns.unwarn(userToUnwarn);

	return reply(
		`${link(userToUnwarn)} pardoned for: ${warn}\n(${warnCount}/3)`,
		replyOptions);
});

bot.command('warns', async ({ message, reply }) => {
	if (!await admins.isAdmin(message.from)) {
		return null;
	}
	if (!message.reply_to_message) {
		return reply('Reply to a message');
	}
	let i = 0;
	const theUser = message.reply_to_message.from;
	return reply('Warns for ' + link(theUser) + '\n' +
		(await warns.getWarns(theUser))
			.map(x => ++i + '. ' + x)
			.join('\n'), replyOptions);
});

bot.on('message', async ({ message, chat, reply }) => {
	if (
		message.forward_from_chat &&
		message.forward_from_chat.type !== 'private' &&
		message.forward_from_chat.username !== 'thedevs'
	) {
		const userToWarn = message.from;
		if (await admins.isAdmin(userToWarn)) {
			return null;
		}
		const reason = 'Forward from ' +
			message.forward_from_chat.type +
			': ' + link(message.forward_from_chat);
		const warnCount = await warns.warn(userToWarn, reason);
		const promises = [
			bot.telegram.deleteMessage(chat.id, message.message_id)
		];
		if (warnCount < 3) {
			promises.push(reply(
				`${link(userToWarn)} warned! (${warnCount}/3)\n` +
				`Reason: ${reason}`,
				replyOptions));
		} else {
			promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
			promises.push(bans.ban(userToWarn,
				'Reached max number of warnings'));
			promises.push(reply(
				`${link(userToWarn)} <b>banned</b>! (${warnCount}/3)\n` +
				'Reason: Reached max number of warnings',
				replyOptions));
		}
		return Promise.all(promises).catch(logError(DEBUG));
	}
	return null;
});

bot.startPolling();
