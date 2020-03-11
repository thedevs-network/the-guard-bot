'use strict';

/* eslint-disable no-console */

const { join } = require('path');
const { promisify } = require('util');
const { promises: { readFile, writeFile } } = require('fs');

const sleep = promisify(setTimeout);

const { path } = require('ramda');
const inquirer = require('inquirer');

/** @type { import('telegraf').TelegrafConstructor } */
const Telegraf = require('telegraf');

const defaults = {
	chats: {
		presenceLog: false,
		report: false
	},
	deleteCommands: 'own',
	deleteCustom: {
		longerThan: 450,
		after: '20 minutes'
	},
	deleteJoinsAfter: '2 minutes',
	deleteWarnsAfter: false,
	deleteBansAfter: false,
	blacklistedDomains: [],
	excludeLinks: [],
	expireWarnsAfter: Infinity,
	groupsInlineKeyboard: [],
	numberOfWarnsToBan: 3,
	plugins: [],
	warnInlineKeyboard: []
};

const useTemplate = (str, data) =>
	str.replace(
		/\$([\w.]+)/g,
		(_, name) =>
			path(name.split('.'), data)
	);

const displayTelegramName = user =>
	user.username
		? '@' + user.username
		: user.first_name;

const prepareConfigForTemplate = conf =>
	Object.fromEntries(Object.entries(conf).map(([ k, v ]) =>
		/* eslint-disable indent, operator-linebreak */
		k === 'master' ? [
			k,
			displayTelegramName(v)
				? `${v.id} /* ${displayTelegramName(v)} */`
				: String(v.id)
		] :
		typeof v === 'boolean' ? [ k, String(v) ] :
		typeof v === 'number' ? [ k, String(v) ] :
		typeof v === 'string' ? [ k, `'${v}'` ] :
		Array.isArray(v) ? [
			k,
			`[ ${v.map(x => typeof x === 'string' ? `'${x}'` : x).join(', ')} ]`
		] :
		[ k, prepareConfigForTemplate(v) ]));
		/* eslint-enable indent, operator-linebreak */

const loadTemplate = () =>
	readFile(join(__dirname, 'config.jstemplate'), 'utf8');

const load = () => {
	try {
		/* eslint-disable-next-line global-require */
		return require(join(process.cwd(), 'config'));
	} catch (err) {
		return defaults;
	}
};

const save = contents =>
	writeFile(join(process.cwd(), 'config.js'), contents);

const generateUniqueKey = () =>
	'meme' || String(Math.random()).split('.')[1].slice(0, 6);

const getMasterFromTelegram = async (token, existing) => {
	const bot = new Telegraf(token);
	const key = generateUniqueKey();
	const { username } = await bot.telegram.getMe();
	if (existing) {
		const { keepExistingMaster } = await inquirer.prompt({
			type: 'confirm',
			name: 'keepExistingMaster',
			message: `Keep existing master(s)? (${existing})`
		});
		if (keepExistingMaster) {
			if (Array.isArray(existing)) {
				return existing.map(x => ({ id: x }));
			}
			return { id: existing };
		}
	}
	const masterp = new Promise(resolve =>
		bot.start(ctx => {
			const [ , entered ] = ctx.message.text.split(' ');
			if (!entered || entered !== key) {
				return console.error(displayTelegramName(ctx.from) +
					': failed with incorrect or missing key!');
			}
			return resolve(ctx.from);
		}));
	await bot.launch({ polling: { timeout: 1 } });
	console.log('Please open a conversation with the Telegram bot ' +
		`using this link: https://t.me/${username}?start=${key}\n` +
		`or find it in Telegram @${username} and type: /start ${key}`);

	const master = await masterp;

	// needed to ensure the bot actually clears this update
	await sleep(100);

	await bot.stop();
	console.log(displayTelegramName(master) +
		` registered as master for @${username}`);
	return master;

};

const config = load();

inquirer.prompt({
	type: 'input',
	name: 'token',
	default: config.token,
	message: 'Please input your Telegram Bot token ' +
			'obtained from https://t.me/BotFather'
})
	.then(async ({ token }) => ({
		token,
		master: await getMasterFromTelegram(token, config.master)
	}))
	.then(async conf => ({
		...conf,
		...await inquirer.prompt({
			type: 'confirm',
			name: 'editAdvancedConfig',
			default: false,
			message: 'Edit advanced config?'
		})
	}))
	.then(conf => {
		if (conf.editAdvancedConfig) {
			throw new Error('Editing advanced config is not implemented yet!');
		}
		return conf;
	})
	.then(async conf =>
		save(useTemplate(
			await loadTemplate(),
			prepareConfigForTemplate({ ...defaults, ...conf })
		)));
