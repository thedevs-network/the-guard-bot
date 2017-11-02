'use strict';

const { compose } = require('telegraf');

const config = require('../config.json');
const names = config.plugins || [];

const plugins = names.map(name => `./${name}`).map(require);

module.exports = compose(plugins);
