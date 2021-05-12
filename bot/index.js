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

// Otherwise the bot can't ban on reaching max warns due to botInfo not being available to get its admin ID
Object.defineProperty(bot.context, "botInfo", {
  get () { return bot.botInfo; }
})

// cyclic dependency
// bot/index requires context requires actions/warn requires bot/index
Object.assign(bot.context, require('./context'));
