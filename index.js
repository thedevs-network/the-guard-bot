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
const middleware = './handlers/middlewares',
      command = './handlers/commands';

/**
 * @type {function}
 * Middleware Handlers
 */
const leaveUnmanagedHandler = require(`${middleware}/leaveUnmanaged`),
	  removeCommandsHandler = require(`${middleware}/removeCommands`),
	  kickBannedHandler = require(`${middleware}/kickBanned`),
	  addUserHandler = require(`${middleware}/addUser`),
	  removeLinksHandler = require(`${middleware}/removeLinks`),
	  checkUsernameHandler = require(`${middleware}/checkUsername`),
	  addCustomCmdHandler = require(`${middleware}/addCustomCmd`),
	  runCustomCmdHandler = require(`${middleware}/runCustomCmd`),
	  antibotHandler = require(`${middleware}/antibot`),
	  addedToGroupHandler = require(`${middleware}/addedToGroup`);

/**
 * @type {function}
 * Commmands Handlers
 */
const adminHandler = require(`${command}/admin`),
	  unAdminHandler = require(`${command}/unadmin`),
	  leaveCommandHandler = require(`${command}/leave`),
	  warnHandler = require(`${command}/warn`),
	  unwarnHandler = require(`${command}/unwarn`),
	  nowarnsHandler = require(`${command}/nowarns`),
	  getWarnsHandler = require(`${command}/getwarns`),
	  banHandler = require(`${command}/ban`),
	  unbanHandler = require(`${command}/unban`),
	  reportHandler = require(`${command}/report`),
	  staffHandler = require(`${command}/staff`),
	  linkHandler = require(`${command}/link`),
	  groupsHandler = require(`${command}/groups`),
	  commandReferenceHandler = require(`${command}/commands`),
	  addCommandHandler = require(`${command}/addCommand`),
	  removeCommandHandler = require(`${command}/removeCommand`),
	  helpHandler = require(`${command}/help`);

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
