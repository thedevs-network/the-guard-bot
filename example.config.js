'use strict';

/*
 * Create `config.js` by running `cp example.config.js config.js`
 * in the project folder, then edit it.
 *
 * Config file in JSON format (`config.json`) is also supported.
 * For backwards compatibility, and because why not, it needs no extra code.
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
	deleteCommands: 'own', // eslint-disable-line sort-keys

	/**
	 * @type {( number | string | false )}
	 * Timeout before removing join and leave messages.
	 * String to be parsed by https://npmjs.com/millisecond,
	 * or number of milliseconds.
	 * Pass 0 to remove immediately.
	 * Pass false to never remove.
	 */
	deleteJoinsAfter: '2 minutes',

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
