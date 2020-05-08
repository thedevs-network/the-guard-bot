'use strict';

const requireDir = require('require-directory');
const R = require('ramda');
const { Router } = require('telegraf');

const routingFn = require('./routingFn');

const router = new Router(routingFn);

module.exports = router;

const exclude = (_, filename) => filename === 'routingFn.js';
const rename = R.toLower;

const extensions = [ 'js', 'ts' ];
const handlers = requireDir(module, { exclude, extensions, rename });
router.handlers = new Map(Object.entries(handlers));
