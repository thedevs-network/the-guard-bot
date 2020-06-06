'use strict';

const Telegraf = require('telegraf');
const { config } = require('../utils/config');

/** @typedef { import('../typings/context').ExtendedContext } ExtendedContext */

/** @type { import('telegraf/typings').Telegraf<ExtendedContext> } */
const bot = new Telegraf(config.token);

bot.polling.offset = -1;

module.exports = bot;

// cyclic dependency
// bot/index requires context requires actions/warn requires bot/index
Object.assign(bot.context, require('./context'));
