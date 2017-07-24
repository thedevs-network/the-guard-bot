'use strict';

const { readFileSync, writeFileSync } = require('fs');

const loadJSON = file => JSON.parse(readFileSync(file, 'utf8'));

const saveJSON = (file, data) => writeFileSync(file,
	JSON.stringify(data, null, '\t'));

module.exports = { loadJSON, saveJSON };
