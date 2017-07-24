'use strict';

const { readFileSync, writeFileSync } = require('fs');

const loadJSON = file => JSON.parse(readFileSync(file, 'utf8'));

const saveJSON = (file, data) => writeFileSync(file,
	JSON.stringify(data, undefined, '\t'));

module.exports = { loadJSON, saveJSON };
