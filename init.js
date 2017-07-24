'use strict';

const { existsSync, mkdirSync } = require('fs');
const { createInterface } = require('readline');
const { loadJSON, saveJSON } = require('./utils/json');

const defaultConfig = {
	masterID: 'masterID',
	token: 'token'
};

function dirs() {
	if (!existsSync('data')) {
		mkdirSync('data');
	}
}

function loadConfig() {
	try {
		return loadJSON('config.json');
	} catch (err) {
		return defaultConfig;
	}
}

async function validateConfig(input, config) {
	config = Object.assign({}, defaultConfig, config);
	for (const key in config) {
		while (config[key] === key || config[key] === '') {
			console.log('Enter ' + key + ': ');
			/* eslint no-await-in-loop: "off" */
			const value = (await input()).trim();
			config[key] = Number.isNaN(Number(value))
				? value
				: Number(value);
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
