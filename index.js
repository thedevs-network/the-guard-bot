'use strict';

// validate config
require('child_process').execSync('node init.js', { stdio: 'inherit' });

const { loadJSON } = require('./utils/json');
const Telegraf = require('telegraf');

const config = loadJSON('config.json');

const bot = new Telegraf(config.token);


bot.startPolling();
