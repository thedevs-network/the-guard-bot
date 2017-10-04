'use strict';

// Utils
const { deleteAfter } = require('./utils/tg');
const { logError } = require('./utils/log');

/**
 * @type {Telegraf}
 * Bot
 */
const bot = require('./bot');

bot.telegram.getMe().then((botInfo) => {
	bot.options.username = botInfo.username;
});


/**
 * @type {number}
 * Time in milliseconds after which join and leave messages should be deleted
 */
const delTimeout = 2 * 60 * 1000;

/**
 * @type {string}
 * Path of middlewares and commands
 */
const middleware = './handlers/middlewares';
const command = './handlers/commands';

/**
 * @type {function}
 * Middleware Handlers
 */
const leaveUnmanagedHandler = require(`${middleware}/leaveUnmanaged`);
const removeCommandsHandler = require(`${middleware}/removeCommands`);
const kickBannedHandler = require(`${middleware}/kickBanned`);
const addUserHandler = require(`${middleware}/addUser`);
const removeLinksHandler = require(`${middleware}/removeLinks`);
const checkUsernameHandler = require(`${middleware}/checkUsername`);
const addCustomCmdHandler = require(`${middleware}/addCustomCmd`);
const runCustomCmdHandler = require(`${middleware}/runCustomCmd`);
const antibotHandler = require(`${middleware}/antibot`);
const addedToGroupHandler = require(`${middleware}/addedToGroup`);

/**
 * @type {function}
 * Commmands Handlers
 */
const adminHandler = require(`${command}/admin`);
const unAdminHandler = require(`${command}/unadmin`);
const leaveCommandHandler = require(`${command}/leave`);
const warnHandler = require(`${command}/warn`);
const unwarnHandler = require(`${command}/unwarn`);
const nowarnsHandler = require(`${command}/nowarns`);
const getWarnsHandler = require(`${command}/getwarns`);
const banHandler = require(`${command}/ban`);
const unbanHandler = require(`${command}/unban`);
const reportHandler = require(`${command}/report`);
const staffHandler = require(`${command}/staff`);
const linkHandler = require(`${command}/link`);
const groupsHandler = require(`${command}/groups`);
const commandReferenceHandler = require(`${command}/commands`);
const addCommandHandler = require(`${command}/addCommand`);
const removeCommandHandler = require(`${command}/removeCommand`);
const helpHandler = require(`${command}/help`);

bot.on('new_chat_members', addedToGroupHandler);
bot.use(leaveUnmanagedHandler);
bot.use(removeCommandsHandler);
bot.use(kickBannedHandler);
bot.on('message',
	addUserHandler,
	removeLinksHandler,
	checkUsernameHandler,
	addCustomCmdHandler,
	runCustomCmdHandler
);
bot.on('new_chat_members', antibotHandler);
bot.on([ 'new_chat_members', 'left_chat_member' ], deleteAfter(delTimeout));
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
