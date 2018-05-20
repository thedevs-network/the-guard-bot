'use strict';

const { Router } = require('telegraf');

const routingFn = require('./routingFn');

const router = new Router(routingFn);

module.exports = router;

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

router.on('admin', adminHandler);
router.on('unadmin', unAdminHandler);
router.on('leave', leaveCommandHandler);
router.on('hidegroup', hideGroupHandler);
router.on('showgroup', showGroupHandler);
router.on('warn', warnHandler);
router.on('unwarn', unwarnHandler);
router.on('nowarns', nowarnsHandler);
router.on('user', userHandler);
router.on('ban', banHandler);
router.on('unban', unbanHandler);
router.on('report', reportHandler);
router.on('staff', staffHandler);
router.on('link', linkHandler);
router.on('groups', groupsHandler);
router.on('commands', commandReferenceHandler);
router.on('addcommand', addCommandHandler);
router.on('replacecommand', addCommandHandler);
router.on('removecommand', removeCommandHandler);
router.on('start', helpHandler);
router.on('help', helpHandler);
