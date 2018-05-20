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

router.on('admin', deleteMessage, adminHandler);
router.on('unadmin', deleteMessage, unAdminHandler);
router.on('leave', deleteMessage, leaveCommandHandler);
router.on('hidegroup', deleteMessage, hideGroupHandler);
router.on('showgroup', deleteMessage, showGroupHandler);
router.on('warn', deleteMessage, warnHandler);
router.on('unwarn', deleteMessage, unwarnHandler);
router.on('nowarns', deleteMessage, nowarnsHandler);
router.on('user', deleteMessage, userHandler);
router.on('ban', deleteMessage, banHandler);
router.on('unban', deleteMessage, unbanHandler);
router.on('report', deleteMessage, reportHandler);
router.on('staff', deleteMessage, staffHandler);
router.on('link', deleteMessage, linkHandler);
router.on('groups', deleteMessage, groupsHandler);
router.on('commands', deleteMessage, commandReferenceHandler);
router.on('addcommand', deleteMessage, addCommandHandler);
router.on('replacecommand', deleteMessage, addCommandHandler);
router.on('removecommand', deleteMessage, removeCommandHandler);
router.on('start', deleteMessage, helpHandler);
router.on('help', deleteMessage, helpHandler);
