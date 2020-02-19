'use strict';

const camelToSnake = s => s.replace(/[A-Z]/g, c => '_' + c.toLowerCase());

exports.stringify = ({ command = '', flags = {}, reason = '' }) => {
	const flagS = Object.entries(flags)
		.flatMap(([ key, value ]) => {
			switch (value) {
			case null:
			case false:
			case undefined: // eslint-disable-line no-undefined
				return [];
			case true:
				return [ '-' + camelToSnake(key) ];
			default:
				return [ `-${camelToSnake(key)}=${value}` ];
			}
		}).join(' ');
	return [
		'/' + command,
		flagS,
		reason
	].filter(Boolean).join(' ');
};
