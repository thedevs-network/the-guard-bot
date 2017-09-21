'use strict';

const Telegraf = require('telegraf');
const { loadJSON } = require('../utils/json');
const config = loadJSON('config.json');

const bot = new Telegraf(config.token);

module.exports = bot;


