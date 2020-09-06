'use strict';

const ms = require('millisecond');
const { Telegraf } = require('telegraf');
const { config } = require('../utils/config');

/** @typedef { import('../typings/context').ExtendedContext } ExtendedContext */

/** @type { Telegraf<ExtendedContext> } */
const bot = new Telegraf(config.token, {
	handlerTimeout: ms('5s'),
	telegram: { webhookReply: false },
});

if (process.env.NODE_ENV === 'development') {
	bot.polling.offset = -1;
}

module.exports = bot;

// cyclic dependency
// bot/index requires context requires actions/warn requires bot/index
Object.assign(bot.context, require('./context'));
