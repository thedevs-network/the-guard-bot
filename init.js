'use strict';

const { createInterface } = require('readline');
const { loadJSON, saveJSON } = require('./utils/json');

function loadConfig() {
	try {
		return loadJSON('config.json');
	} catch (err) {
		return {
			token: 'token'
		}
	}
}

async function validateConfig(input, config) {
	config = Object.assign({}, config);
	for (const key in config) {
		while (config[key] === key || config[key] === '') {
			console.log('Enter ' + key + ': ');
			config[key] = (await input()).trim();
		}
	}
	return config;
}

const rl = createInterface({ input: process.stdin });

const line = () =>
	new Promise(resolve =>
		rl.once('line', resolve));

validateConfig(line, loadConfig()).then(config => 
	(saveJSON('config.json', config),
	rl.close(),
	console.log('Config OK')));
