'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const adminHandler = require('./admin');
const unAdminHandler = require('./unadmin');
const leaveCommandHandler = require('./leave');
const warnHandler = require('./warn');
const unwarnHandler = require('./unwarn');
const nowarnsHandler = require('./nowarns');
const getWarnsHandler = require('./getwarns');
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

composer.command('admin', adminHandler);
composer.command('unadmin', unAdminHandler);
composer.command('leave', leaveCommandHandler);
composer.command('warn', warnHandler);
composer.command('unwarn', unwarnHandler);
composer.command('nowarns', nowarnsHandler);
composer.command('getwarns', getWarnsHandler);
composer.command('ban', banHandler);
composer.command('unban', unbanHandler);
composer.command('report', reportHandler);
composer.hears(/^@admins?\s?/i, reportHandler);
composer.command('staff', staffHandler);
composer.command('link', linkHandler);
composer.command('groups', groupsHandler);
composer.command('commands', commandReferenceHandler);
composer.command('addcommand', addCommandHandler);
composer.command('removecommand', removeCommandHandler);
composer.command([ 'start', 'help' ], helpHandler);

module.exports = composer;
