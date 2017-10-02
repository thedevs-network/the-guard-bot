'use strict';

// Utils
const { deleteAfter } = require('./utils/tg');
const { logError } = require('./utils/log');

// Bot
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
});

// Middleware Handlers
const leaveUnmanagedHandler = require('./handlers/middlewares/leaveUnmanaged');
const middlewareHandler = require('./handlers/middlewares/middleware');
const addUserHandler = require('./handlers/middlewares/addUser');
const removeLinksHandler = require('./handlers/middlewares/removeLinks');
const checkUsernameHandler = require('./handlers/middlewares/checkUsername');
const antibotHandler = require('./handlers/middlewares/antibot');
const addedToGroupHandler = require('./handlers/middlewares/addedToGroup');

// Commmands Handlers
const adminHandler = require('./handlers/commands/admin');
const unAdminHandler = require('./handlers/commands/unadmin');
const leaveCommandHandler = require('./handlers/commands/leave');
const warnHandler = require('./handlers/commands/warn');
const unwarnHandler = require('./handlers/commands/unwarn');
const nowarnsHandler = require('./handlers/commands/nowarns');
const getWarnsHandler = require('./handlers/commands/getwarns');
const banHandler = require('./handlers/commands/ban');
const unbanHandler = require('./handlers/commands/unban');
const reportHandler = require('./handlers/commands/report');
const staffHandler = require('./handlers/commands/staff');
const linkHandler = require('./handlers/commands/link');
const groupsHandler = require('./handlers/commands/groups');
const commandReferenceHandler = require('./handlers/commands/commands');
const helpHandler = require('./handlers/commands/help');

bot.on('new_chat_members', addedToGroupHandler);
bot.use(leaveUnmanagedHandler);
bot.use(middlewareHandler);
bot.on('message', addUserHandler);
bot.on('message', removeLinksHandler);
bot.on('message', checkUsernameHandler);
bot.on('new_chat_members', antibotHandler);
bot.on([ 'new_chat_members', 'left_chat_member' ], deleteAfter(2 * 60 * 1000));
bot.command('admin', adminHandler);
bot.command('unadmin', unAdminHandler);
bot.command('leave', leaveCommandHandler);
bot.command('warn', warnHandler);
bot.command('unwarn', unwarnHandler);
bot.command('nowarns', nowarnsHandler);
bot.command('getwarns', getWarnsHandler);
bot.command('ban', banHandler);
bot.command('unban', unbanHandler);
bot.command('report', reportHandler);
bot.hears(/^@admins?$/i, reportHandler);
bot.command('staff', staffHandler);
bot.command('link', linkHandler);
bot.command('groups', groupsHandler);
bot.command('commands', commandReferenceHandler);
bot.command([ 'start', 'help' ], helpHandler);

bot.catch(logError);

bot.startPolling();
