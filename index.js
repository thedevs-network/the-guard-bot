'use strict';
require('dotenv').config();

// Utils
const { deleteAfter } = require('./utils/tg');

// Bot
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
});

// Middleware Handlers
const leaveUnmanagedHandler = require('./handlers/middlewares/leaveUnmanaged');
const middlewareHandler = require('./handlers/middlewares/middleware');
const removeLinksHandler = require('./handlers/middlewares/removeLinks');
const antibotHandler = require('./handlers/middlewares/antibot');
const addedToGroupHandler = require('./handlers/middlewares/addedToGroup');

// Commmands Handlers
const adminHandler = require('./handlers/commands/admin');
const unAdminHandler = require('./handlers/commands/unadmin');
const warnHandler = require('./handlers/commands/warn');
const unwarnHandler = require('./handlers/commands/unwarn');
const nowarnsHandler = require('./handlers/commands/nowarns');
const getWarnsHandler = require('./handlers/commands/getwarns');
const banHandler = require('./handlers/commands/ban');
const unbanHandler = require('./handlers/commands/unban');

bot.use(leaveUnmanagedHandler);
bot.use(middlewareHandler);
bot.on('message', removeLinksHandler);
bot.on('new_chat_members', addedToGroupHandler);
bot.on('new_chat_members', antibotHandler);
bot.on([ 'new_chat_members', 'left_chat_member' ], deleteAfter(10 * 60 * 1000));
bot.command('admin', adminHandler);
bot.command('unadmin', unAdminHandler);
bot.command('warn', warnHandler);
bot.command('unwarn', unwarnHandler);
bot.command('nowarns', nowarnsHandler);
bot.command('getwarns', getWarnsHandler);
bot.command('ban', banHandler);
bot.command('unban', unbanHandler);

bot.startPolling();
