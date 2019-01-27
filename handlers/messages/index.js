'use strict';

const { Composer } = require('telegraf');

const composer = new Composer();

const addCustomCmdHandler = require('./addCustomCmd');

composer.on(
	'message',
	addCustomCmdHandler,
);

module.exports = composer;
