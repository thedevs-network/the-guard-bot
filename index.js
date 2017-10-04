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
const removeCommandsHandler = require('./handlers/middlewares/removeCommands');
const kickBannedHandler = require('./handlers/middlewares/kickBanned');
const addUserHandler = require('./handlers/middlewares/addUser');
const removeLinksHandler = require('./handlers/middlewares/removeLinks');
const checkUsernameHandler = require('./handlers/middlewares/checkUsername');
const addCustomCmdHandler = require('./handlers/middlewares/addCustomCmd');
const runCustomCmdHandler = require('./handlers/middlewares/runCustomCmd');
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
const addCommandHandler = require('./handlers/commands/addCommand');
const removeCommandHandler = require('./handlers/commands/removeCommand');
const helpHandler = require('./handlers/commands/help');

bot.on('new_chat_members', addedToGroupHandler);
bot.use(leaveUnmanagedHandler);
bot.use(removeCommandsHandler);
bot.use(kickBannedHandler);
bot.on('message', addUserHandler);
bot.on('message', removeLinksHandler);
bot.on('message', checkUsernameHandler);
bot.on('message', addCustomCmdHandler);
bot.on('message', runCustomCmdHandler);
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
bot.command('addcommand', addCommandHandler);
bot.command('removecommand', removeCommandHandler);
bot.command([ 'start', 'help' ], helpHandler);

bot.catch(logError);

bot.startPolling();
