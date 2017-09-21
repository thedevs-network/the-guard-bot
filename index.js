'use strict';
require('dotenv').config();

// Utils
const { deleteAfter } = require('./utils/tg');

// Bot
const bot = require('./bot');

// Handlers
const middlewareHandler = require('./handlers/middleware');
const adminHandler = require('./handlers/admin');
const warnHandler = require('./handlers/warn');
const unwarnHandler = require('./handlers/unwarn');
const warnsHandler = require('./handlers/warns');
const messageHandler = require('./handlers/message');
const newChatMemberHandler = require('./handlers/newChatMember');

bot.use(middlewareHandler);
bot.command('admin', adminHandler);
bot.command('warn', warnHandler);
bot.command('unwarn', unwarnHandler);
bot.command('warns', warnsHandler);
bot.on('message', messageHandler);
bot.on('new_chat_member', newChatMemberHandler);
bot.on('left_chat_member', deleteAfter(10 * 60 * 1000));

bot.startPolling();
