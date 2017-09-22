'use strict';
require('dotenv').config();

// Utils
const { deleteAfter } = require('./utils/tg');

// Bot
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
});

// Handlers
const middlewareHandler = require('./handlers/middleware');
const adminHandler = require('./handlers/admin');
const unAdminHandler = require('./handlers/unadmin');
const warnHandler = require('./handlers/warn');
const unwarnHandler = require('./handlers/unwarn');
const nowarnsHandler = require('./handlers/nowarns');
const getWarnsHandler = require('./handlers/getwarns');
const banHandler = require('./handlers/ban');
const unbanHandler = require('./handlers/unban');
const messageHandler = require('./handlers/message');
const antibotHandler = require('./handlers/antibot');
const addedToGroupHandler = require('./handlers/addedToGroup');
const leaveUnmanagedHandler = require('./handlers/leaveUnmanaged');

bot.on('new_chat_members', addedToGroupHandler);
bot.use(leaveUnmanagedHandler);
bot.use(middlewareHandler);
bot.command('admin', adminHandler);
bot.command('unadmin', unAdminHandler);
bot.command('warn', warnHandler);
bot.command('unwarn', unwarnHandler);
bot.command('nowarns', nowarnsHandler);
bot.command('getwarns', getWarnsHandler);
bot.command('ban', banHandler);
bot.command('unban', unbanHandler);
bot.on('message', messageHandler);
bot.on('new_chat_members', antibotHandler);
bot.on(['new_chat_members', 'left_chat_member'], deleteAfter(10 * 60 * 1000));

bot.startPolling();
