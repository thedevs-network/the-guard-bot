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
 * Pass false to disable option.
 * @typedef {( number | string | false )} ms
 */

module.exports = {

	/**
	 * @type {!( number | string )}
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


	/**
	 * @type {( 'all' | 'own' | 'none' )}
	 * Which messages with commands should be deleted?
	 * Defaults to 'own' -- don't delete commands meant for other bots.
	 */
	deleteCommands: 'own',

	/**
	 * @type {ms} Millisecond
	 * Timeout before removing join and leave messages.
	 * [Look at typedef above for details.]
	 */
	deleteJoinsAfter: '2 minutes',

	/**
	 * @type {(ms | { auto: ms, manual: ms })}
	 * Timeout before removing auto-warn messages.
	 * [Look at typedef above for details.]
	 * Pass an object with { auto, manual } for more granular control
	 * over which messages get deleted
	 */
	deleteWarnsAfter: false,

	/**
	 * @type {ms}
	 * Timeout before removing ban messages.
	 * [Look at typedef above for details.]
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
	 * @type {InlineKeyboardMarkup}
	 * Inline keyboard to be added to reply to /groups.
	 * We use it to display button opening our webpage.
	 */
	groupsInlineKeyboard: [],

	notifyBrokenLink: false,

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
