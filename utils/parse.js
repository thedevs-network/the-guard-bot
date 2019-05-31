'use strict';

const XRegExp = require('xregexp');

const strip = ({ id, username }) =>
	id ? { id } : { username: username.toLowerCase() };

const toUserObject = s =>
	s.user || (/^\d+$/.test(s) ? { id: +s } : { username: s.replace('@', '') });

const isTextMention = m => m.type === 'text_mention';

const spliceOut = (s, { offset, length }) =>
	s.slice(0, offset) + s.slice(offset + length);

const botReply = ({ from, entities = [] }) => {
	const textMentions = entities.filter(isTextMention);

	return from.is_bot && textMentions.length === 2 && [ textMentions[1].user ];
};

function *extractFlags(flagS) {
	for (const [ , name, value ] of flagS.matchAll(flagsRegex)) {
		yield [ name.toLowerCase(), value ];
	}
}

const flagsRegex = /\s+(?:--?|—)(\w+)(?:=(\S*))?/g;

const regex = XRegExp.tag('snx')`^
	\/\w+(@\w+)?
	(?<flagS> ${flagsRegex}*)
	(?<ids> (\s+@\w+|\s+\d+)*)
	(?:\s+(?<reason>.*))?
$`;

const parse = message => {
	const textMentions = message.entities.filter(isTextMention);
	const noTextMentions = textMentions.reduceRight(spliceOut, message.text);

	const { flagS, ids, reason = '' } = XRegExp.exec(noTextMentions, regex);
	const flags = new Map(extractFlags(flagS));
	const users = textMentions.concat(ids.match(/@\w+|\d+/g) || []);
	const { reply_to_message } = message;
	const targets = users.length
		? users.map(toUserObject)
		: reply_to_message
			? botReply(reply_to_message) || [ reply_to_message.from ]
			: [];

	return { flags, reason, targets };
};

module.exports = {
	parse,
	strip,
};
