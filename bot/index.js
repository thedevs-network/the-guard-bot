'use strict';

const Telegraf = require('telegraf');
const config = require('../config');

const bot = new Telegraf(config.token);

if (process.env.NODE_ENV === 'development') {
	bot.polling.offset = -1;
}

module.exports = bot;

// cyclic dependency
// bot/index requires context requires actions/warn requires bot/index
Object.assign(bot.context, require('./context'));
