'use strict';

const Telegraf = require('telegraf');
const config = require('../config');

const bot = new Telegraf(config.token);

if (process.env.NODE_ENV === 'development') {
	bot.polling.offset = -1;
}

module.exports = bot;
