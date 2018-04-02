'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const adminHandler = require('./admin');
const unAdminHandler = require('./unadmin');
const leaveCommandHandler = require('./leave');
const hideGroupHandler = require('./hideGroup');
const showGroupHandler = require('./showGroup');
const warnHandler = require('./warn');
const unwarnHandler = require('./unwarn');
const nowarnsHandler = require('./nowarns');
const userHandler = require('./user');
const banHandler = require('./ban');
const unbanHandler = require('./unban');
const reportHandler = require('./report');
const staffHandler = require('./staff');
const linkHandler = require('./link');
const groupsHandler = require('./groups');
const commandReferenceHandler = require('./commands');
const addCommandHandler = require('./addCommand');
const removeCommandHandler = require('./removeCommand');
const helpHandler = require('./help');

const { deleteCommands = 'own' } = require('../../config');

if (![ 'all', 'own', 'none' ].includes(deleteCommands)) {
	throw new Error('Invalid value for `deleteCommands` in `config.json`: ' +
		deleteCommands);
}

const deleteMessage = ({ chat, message, telegram }, next) => {
	if (deleteCommands === 'own' && chat.type !== 'private') {
		telegram.deleteMessage(chat.id, message.message_id);
	}
	return next();
};

composer.command('admin', deleteMessage, adminHandler);
composer.command('unadmin', deleteMessage, unAdminHandler);
composer.command('leave', deleteMessage, leaveCommandHandler);
composer.command('hidegroup', deleteMessage, hideGroupHandler);
composer.command('showgroup', deleteMessage, showGroupHandler);
composer.command('warn', deleteMessage, warnHandler);
composer.command('unwarn', deleteMessage, unwarnHandler);
composer.command('nowarns', deleteMessage, nowarnsHandler);
composer.command('user', deleteMessage, userHandler);
composer.command('ban', deleteMessage, banHandler);
composer.command('unban', deleteMessage, unbanHandler);
composer.command('report', deleteMessage, reportHandler);
composer.hears(/^@admins?\s?/i, deleteMessage, reportHandler);
composer.command('staff', deleteMessage, staffHandler);
composer.command('link', deleteMessage, linkHandler);
composer.command('groups', deleteMessage, groupsHandler);
composer.command('commands', deleteMessage, commandReferenceHandler);
composer.command(
	[ 'addcommand', 'replaceCommand' ],
	deleteMessage,
	addCommandHandler
);
composer.command('removecommand', deleteMessage, removeCommandHandler);
composer.command([ 'start', 'help' ], deleteMessage, helpHandler);

module.exports = composer;
