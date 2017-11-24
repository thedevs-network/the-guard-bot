'use strict';

const millisecond = require('millisecond');
const { Composer } = require('telegraf');

const composer = new Composer();

const { deleteAfter } = require('../../utils/tg');
const { deleteJoinsAfter = '2 minutes' } = require('../../config');

const leaveUnmanagedHandler = require('./leaveUnmanaged');
const removeCommandsHandler = require('./removeCommands');
const kickBannedHandler = require('./kickBanned');
const syncStatusHandler = require('./syncStatus');
const antibotHandler = require('./antibot');
const addedToGroupHandler = require('./addedToGroup');

composer.on('new_chat_members', addedToGroupHandler);
composer.use(leaveUnmanagedHandler);
composer.use(removeCommandsHandler);
composer.use(kickBannedHandler);
composer.on('new_chat_members', syncStatusHandler);
composer.on('new_chat_members', antibotHandler);
composer.on(
	[ 'new_chat_members', 'left_chat_member' ],
	deleteJoinsAfter === false
		? Composer.passThru
		: deleteAfter(millisecond(deleteJoinsAfter))
);

module.exports = composer;
