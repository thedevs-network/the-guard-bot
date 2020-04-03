import type { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';

export type InlineKeyboard = InlineKeyboardMarkup['inline_keyboard'];

/**
 * String to be parsed by https://npmjs.com/millisecond,
 * or number of milliseconds.
 */
type ms = number | string;

export interface Config {

	/**
	 * ID (number) or username (string) of master,
	 * the person who can promote and demote admins,
	 * and add the bot to groups.
	 */
	master: number | string | (number|string)[];

	/**
	 * Telegram Bot token obtained from https://t.me/BotFather.
	 */
	token: string;

	chats?: {

		/**
		 * Chat to send member join/leave notifications to.
		 * Pass false to disable this feature.
		 */
		presenceLog?: number | false;

		/**
		 * Chat to send report notifications to.
		 * Pass false to disable this feature.
		 */
		report?: number | false;
	},

	/**
	 * Which messages with commands should be deleted?
	 * Defaults to 'own' -- don't delete commands meant for other bots.
	 */
	deleteCommands?: 'all' | 'own' | 'none';

	deleteCustom?: {
		longerThan: number; // UTF-16 characters
		after: ms;
	},

	/**
	 * Timeout before removing join and leave messages.
	 * [Look at typedef above for details.]
	 * Pass false to disable this feature.
	 */
	deleteJoinsAfter?: ms | false;

	/**
	 * Timeout before removing auto-warn messages.
	 * [Look at typedef above for details.]
	 * Pass an object with { auto, manual } for more granular control
	 * over which messages get deleted
	 * Pass false to disable this feature.
	 */
	deleteWarnsAfter?: ms | { auto: (ms | false), manual: (ms | false) } | false;

	/**
	 * Timeout before removing ban messages.
	 * [Look at typedef above for details.]
	 * Pass false to disable this feature.
	 */
	deleteBansAfter?: ms | false;

	/**
	 * List of blacklisted domains.
	 * Messages containing blacklisted domains will automatically be warned.
	 * If the link is shortened, an attempt will be made to resolve it.
	 * If resolved link is blacklisted, it will be warned for.
	 */
	blacklistedDomains?: string[];

	/**
	 * List of whitelisted links and usernames,
	 * For channels and groups to stop warning users for them.
	 * Pass false to whitelist all links and channels.
	 */
	excludeLinks?: string[] | false;

	/**
	 * Don't count warns older than this value towards automatic ban.
	 * [Look at typedef above for details.]
	 */
	expireWarnsAfter?: ms;

	/**
	 * Inline keyboard to be added to reply to /groups.
	 * We use it to display button opening our webpage.
	 */
	groupsInlineKeyboard?: InlineKeyboard;

	numberOfWarnsToBan: number;

	/**
	 * List of plugin names to be loaded.
	 * See Readme in plugins directory for more details.
	 */
	plugins?: string[];

	spamwatch?: {
		token: string;
		host?: string;
	}

	/**
	 * Inline keyboard to be added to warn message.
	 * We use it to display button showing our rules.
	 */
	warnInlineKeyboard?: InlineKeyboard;
}
