'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const checkUsernameHandler = require('./checkUsername');
const addCustomCmdHandler = require('./addCustomCmd');

composer.on(
	'message',
	checkUsernameHandler,
	addCustomCmdHandler,
);

module.exports = composer;
