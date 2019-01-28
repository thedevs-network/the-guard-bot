'use strict';

const strip = ({ id, username }) =>
	id ? { id } : { username: username.toLowerCase() };

const toUserObject = s =>
	s.user || (/^\d+$/.test(s) ? { id: +s } : { username: s.replace('@', '') });

const isTextMention = m => m.type === 'text_mention';

const spliceOut = (s, { offset, length }) =>
	s.slice(0, offset) + s.slice(offset + length);

const parse = message => {
	// eslint-disable-next-line no-empty-character-class
	const regex = /^\/\w+(?:@\w+)?((?:@\w+|\d+|\s+)*)(.*)$/s;

	const textMentions = message.entities.filter(isTextMention);
	const noTextMentions = textMentions.reduceRight(spliceOut, message.text);

	const [ , ids, reason ] = regex.exec(noTextMentions);
	const users = textMentions.concat(ids.match(/@\w+|\d+/g) || []);
	const targets = users.length
		? users.map(toUserObject)
		: message.reply_to_message ? [ message.reply_to_message.from ] : [];

	return { reason, targets };
};

module.exports = {
	parse,
	strip,
};
