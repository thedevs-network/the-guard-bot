import XRegExp = require("xregexp");
import type { Message, MessageEntity } from "telegraf/typings/telegram-types";

export const strip = ({ id, username }) =>
	id ? { id } : { username: username.toLowerCase() };

const toUserObject = (s) =>
	s.user || (/^\d+$/.test(s) ? { id: +s } : { username: s.replace("@", "") });

const isTextMention = (m: MessageEntity) => m.type === "text_mention";

const spliceOut = (s: string, { offset, length }: MessageEntity) =>
	s.slice(0, offset) + s.slice(offset + length);

const botReply = ({ from, entities = [] }: Message) => {
	const textMentions = entities.filter(isTextMention);

	return from?.is_bot && textMentions.length === 1 && [textMentions[0].user];
};

const flagsRegex = /\s+(?:--?|—)(\w+)(?:=(\S*))?/g;

function* extractFlags(flagS: string) {
	// @ts-ignore
	for (const [, name, value] of flagS.matchAll(flagsRegex)) {
		yield [name.toLowerCase(), value] as const;
	}
}

const regex = XRegExp.tag("snx")`^
	\/\w+(@\w+)?
	(?<flagS> ${flagsRegex}*)
	(?<ids> (\s+@\w+|\s+\d+)*)
	(?:\s+--|\s+—)?
	(?:\s+(?<reason>.*))?
$`;

export const isCommand = (
	message?: Message
): message is Message & {
	text: string;
	entities: [{ type: "bot_command"; offset: 0 }];
} => {
	const firstEntity = message?.entities?.[0];
	return firstEntity?.type === "bot_command" && firstEntity.offset === 0;
};

export const parse = (message?: Message) => {
	if (!isCommand(message)) {
		throw new TypeError("Not a command");
	}
	const textMentions = message.entities.filter(isTextMention);
	const noTextMentions = textMentions.reduceRight(spliceOut, message.text);

	const { flagS, ids, reason = "" } = XRegExp.exec(noTextMentions, regex)!;
	const flags = new Map(extractFlags(flagS));
	const users = textMentions.concat(ids.match(/@\w+|\d+/g) || []);
	const { reply_to_message } = message;

	// prettier-ignore
	const targets = users.length
		? users.map(toUserObject)
		: reply_to_message
			? botReply(reply_to_message) || [ reply_to_message.from ]
			: [];

	return { flags, reason, targets };
};
