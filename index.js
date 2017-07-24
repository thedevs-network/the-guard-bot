'use strict';

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const Telegraf = require('telegraf');

const { loadJSON } = require('./utils/json');

const bans = require('./bans');
const warns = require('./warns');

const config = loadJSON('config.json');

const bot = new Telegraf(config.token);



bot.startPolling();
