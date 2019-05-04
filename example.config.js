'use strict';

/* eslint-disable sort-keys */

/*
 * Create `config.js` by running `cp example.config.js config.js`
 * in the project folder, then edit it.
 *
 * Config file in JSON format (`config.json`) is also supported.
 * For backwards compatibility, and because why not, it needs no extra code.
 */

/**
 * Millisecond
 * String to be parsed by https://npmjs.com/millisecond,
 * or number of milliseconds. Pass 0 to remove immediately.
 * @typedef {( number | string )} ms
 */

module.exports = {

	/**
	 * @type {!( number | string | (number|string)[] )}
	 * ID (number) or username (string) of master,
	 * the person who can promote and demote admins,
	 * and add the bot to groups.
	 */
	master: 123456789,

	/**
	 * @type {!string}
	 * Telegram Bot token obtained from https://t.me/BotFather.
	 */
	token: '',


	chats: {

		/**
		 * @type {(number | false)}
		 * Chat to send report notifications to.
		 * Pass false to disable this feature.
		 */
		report: -1001148607297,
	},

	/**
	 * @type {( 'all' | 'own' | 'none' )}
	 * Which messages with commands should be deleted?
	 * Defaults to 'own' -- don't delete commands meant for other bots.
	 */
	deleteCommands: 'own',

	deleteCustom: {
		longerThan: 450, // utf16 characters
		after: '20 minutes'
	},

	/**
	 * @type {(ms | false)} Millisecond
	 * Timeout before removing join and leave messages.
	 * [Look at typedef above for details.]
	 * Pass false to disable this feature.
	 */
	deleteJoinsAfter: '2 minutes',

	/**
	 * @type {(ms | { auto: (ms | false), manual: (ms | false) } | false)}
	 * Timeout before removing auto-warn messages.
	 * [Look at typedef above for details.]
	 * Pass an object with { auto, manual } for more granular control
	 * over which messages get deleted
	 * Pass false to disable this feature.
	 */
	deleteWarnsAfter: false,

	/**
	 * @type {(ms | false)}
	 * Timeout before removing ban messages.
	 * [Look at typedef above for details.]
	 * Pass false to disable this feature.
	 */
	deleteBansAfter: false,

	/**
	 * @type {string[]}
	 * List of blacklisted domains.
	 * Messages containing blacklisted domains will automatically be warned.
	 * If the link is shortened, an attempt will be made to resolve it.
	 * If resolved link is blacklisted, it will be warned for.
	 */
	blacklistedDomains: [],

	/**
	 * @type {( string[] | false )}
	 * List of whitelisted links and usernames,
	 * For channels and groups to stop warning users for them.
	 * Pass false to disable this feature
	 */
	excludeLinks: [],

	/**
	 * @type {ms}
	 * Don't count warns older than this value towards automatic ban.
	 * [Look at typedef above for details.]
	 */
	expireWarnsAfter: Infinity,

	/**
	 * @type {InlineKeyboardMarkup}
	 * Inline keyboard to be added to reply to /groups.
	 * We use it to display button opening our webpage.
	 */
	groupsInlineKeyboard: [],

	numberOfWarnsToBan: 3,

	/**
	 * @type {string[]}
	 * List of plugin names to be loaded.
	 * See Readme in plugins directory for more details.
	 */
	plugins: [],

	/**
	 * @type {InlineKeyboardMarkup}
	 * Inline keyboard to be added to warn message.
	 * We use it to display button showing our rules.
	 */
	warnInlineKeyboard: [],
};

Object.freeze(module.exports);
