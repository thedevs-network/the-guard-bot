// @ts-check
'use strict';

const { Composer } = require('telegraf');

/**
 * @typedef {import('../../typings/context').ExtendedContext} ExtendedContext
 * @type {import('telegraf').Composer<ExtendedContext>}
 */
const composer = new Composer();

const { deleteAfter } = require('../../utils/tg');
const { deleteJoinsAfter = '2 minutes' } = require('../../utils/config').config;

const addedToGroupHandler = require('./addedToGroup');
const antibotHandler = require('./antibot');
const checkLinksHandler = require('./checkLinks');
const commandButtons = require('./commandButtons');
const kickBannedHandler = require('./kickBanned');
const kickedFromGroupHandler = require('./kickedFromGroup');
const leaveUnmanagedHandler = require('./leaveUnmanaged');
const monkeyPatchHandler = require('./monkeyPatch');
const presenceLogHandler = require('./logPresence');
const removeChannelForwardsHandler = require('./removeChannelForwards');
const removeCommandsHandler = require('./removeCommands');
const reportHandled = require('./reportHandled');
const syncStatusHandler = require('./syncStatus');
const updateUserDataHandler = require('./updateUserData');
const updateGroupTitleHandler = require('./updateGroupTitle');

composer.on('new_chat_members', addedToGroupHandler);
composer.on('left_chat_member', kickedFromGroupHandler);
composer.use(leaveUnmanagedHandler);
composer.use(monkeyPatchHandler);
composer.use(updateUserDataHandler);

composer.on('new_chat_members', syncStatusHandler, antibotHandler);
composer.on('message', kickBannedHandler);
composer.use(removeChannelForwardsHandler);
composer.on([ 'edited_message', 'message' ], checkLinksHandler);
composer.on('new_chat_title', updateGroupTitleHandler);
composer.on('text', removeCommandsHandler);
composer.on(
	[ 'new_chat_members', 'left_chat_member' ],
	deleteAfter(deleteJoinsAfter),
	presenceLogHandler,
);
composer.action(
	/^\/del -chat_id=(-\d+) -msg_id=(\d+) Report handled/,
	reportHandled,
);
composer.on('callback_query', commandButtons);

module.exports = composer;
