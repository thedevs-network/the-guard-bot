'use strict';

// Utils
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');

// Config
const { numberOfWarnsToBan } = require('../../config.json');

// Bot
const bot = require('../../bot');
const { replyOptions } = require('../../bot/options');

// DB
const { isAdmin, ban, getWarns, warn } = require('../../stores/user');

const warnHandler = async ({ message, chat, reply, me, state }) => {
	const { user } = state;
	if (!state.isAdmin) return null;

	const userToWarn = message.reply_to_message
		? message.reply_to_message.from
		: message.commandMention
			? message.commandMention
			: null;

	if (!userToWarn) {
		return reply(
			'ℹ️ <b>Reply to a message or mentoin a user.</b>',
			replyOptions
		).then(scheduleDeletion);
	}

	if (message.chat.type === 'private' || userToWarn.username === me) {
		return null;
	}

	const reason = message.text.split(' ').slice(1).join(' ').trim();

	if (await isAdmin(userToWarn)) {
		return reply('ℹ️ <b>Can\'t warn other admins.</b>', replyOptions);
	}

	if (reason.length === 0) {
		return reply('ℹ️ <b>Need a reason to warn.</b>', replyOptions)
			.then(scheduleDeletion);
	}

	await warn(userToWarn, reason);
	const warnCount = await getWarns(userToWarn);
	const promises = [
		bot.telegram.deleteMessage(chat.id, message.message_id)
	];

	if (message.reply_to_message) {
		promises.push(bot.telegram.deleteMessage(
			chat.id,
			message.reply_to_message.message_id
		));
	}

	try {
		await reply(
			`⚠️ ${link(user)} <b>warned</b> ${link(userToWarn)} <b>for:</b>` +
			`\n\n${reason} (${warnCount.length}/${numberOfWarnsToBan})`,
			replyOptions
		);
	} catch (e) {
		// we don't expect an error
		// but we do wish to continue if one happens
		// to ban people who reach max number of warnings
		logError(e);
	}

	if (warnCount.length >= numberOfWarnsToBan) {
		promises.push(bot.telegram.kickChatMember(chat.id, userToWarn.id));
		promises.push(ban(userToWarn, 'Reached max number of warnings'));
		promises.push(reply(
			`🚫 ${link(user)} <b>banned</b> ${link(userToWarn)} ` +
			'<b>for:</b>\n\nReached max number of warnings ' +
			`(${warnCount.length}/${numberOfWarnsToBan})`,
			replyOptions
		));
	}

	return Promise.all(promises).catch(logError);
};

module.exports = warnHandler;
