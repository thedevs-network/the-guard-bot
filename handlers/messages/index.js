'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const removeLinksHandler = require('./removeLinks');
const checkUsernameHandler = require('./checkUsername');
const addCustomCmdHandler = require('./addCustomCmd');
const runCustomCmdHandler = require('./runCustomCmd');

composer.on(
	'message',
	checkUsernameHandler,
	addCustomCmdHandler,
	runCustomCmdHandler
);

composer.on([ 'edited_message', 'message' ], removeLinksHandler);

module.exports = composer;
