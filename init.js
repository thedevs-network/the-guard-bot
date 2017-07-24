'use strict';

const { existsSync, mkdirSync } = require('fs');
const { createInterface } = require('readline');
const { loadJSON, saveJSON } = require('./utils/json');

function dirs() {
	if (!existsSync('data')) {
		mkdirSync('data');
	}
}

function loadConfig() {
	try {
		return loadJSON('config.json');
	} catch (err) {
		return {
			token: 'token'
		};
	}
}

async function validateConfig(input, config) {
	config = Object.assign({}, config);
	for (const key in config) {
		while (config[key] === key || config[key] === '') {
			console.log('Enter ' + key + ': ');
			/* eslint no-await-in-loop: "off" */
			config[key] = (await input()).trim();
		}
	}
	return config;
}

const rl = createInterface({ input: process.stdin });

const line = () =>
	new Promise(resolve =>
		rl.once('line', resolve));

dirs();

validateConfig(line, loadConfig()).then(config =>
	(saveJSON('config.json', config),
		rl.close(),
		console.log('Config OK')));
