'use strict';

/* eslint-disable new-cap */

const { URL } = require('url');

const { taggedSum } = require('daggy');
const fetch = require('node-fetch');
const R = require('ramda');

const { isAdmin } = require('../../stores/user');
const warn = require('../../actions/warn');


const { warnInlineKeyboard } = require('../../config');
const reply_markup = { inline_keyboard: warnInlineKeyboard };

const bannedDomains = new Set([
	'chat.whatsapp.com',
	'loverdesuootnosheniya.blogspot.com',
	't.me',
	'telegram.dog',
	'telegram.me',
	'your-sweet-dating.com',
]);


const Action = taggedSum('Action', {
	Nothing: [],
	Notify: [ 'errorMsg' ],
	Warn: [ 'reason' ],
});

const cata = R.invoker(1, 'cata');
const actionPriority = cata({
	// Numbers are relative to each other
	Nothing: () => 0,
	Notify: () => 10,
	Warn: () => 20,
});
const maxByActionPriority = R.maxBy(actionPriority);
const highestPriorityAction = R.reduce(maxByActionPriority, Action.Nothing);

const assumeProtocol = R.unless(R.contains('://'), R.concat('http://'));
const constructAbsUrl = R.constructN(1, URL);
const isHttp = R.where({ protocol: R.test(/https?:/) });
const isUrl = entity => entity.type === 'url' || entity.type === 'text_link ';
const memoize = R.memoizeWith(R.identity);

const obtainUrlFromText = text => ({ length, offset, url }) =>
	url
		? url
		: text.slice(offset, length + offset);


const blacklisted = {
	domain: url =>
		bannedDomains.has(url.host.toLowerCase()),
	protocol: url =>
		url.protocol === 'tg:' && url.host.toLowerCase() === 'resolve',
};

const unshorten = memoize(url =>
	fetch(url, { redirect: 'follow' }).then(res =>
		res.ok
			? new URL(res.url)
			: Promise.reject(new Error(`Request to ${url} failed, ` +
				`reason: ${res.status} ${res.statusText}`))));

const classifyAsync = url =>
	unshorten(url).then(long => blacklisted.domain(long)
		? Action.Warn('blacklisted domain')
		: Action.Nothing).catch(Action.Notify);

const classifyList = (urls) => {
	if (urls.some(blacklisted.protocol)) return Action.Warn('tg: protocol');

	return Promise.all(urls.filter(isHttp).map(classifyAsync))
		.then(highestPriorityAction);
};


module.exports = async (ctx, next) => {
	if (ctx.chat.type === 'private') return next();

	const message = ctx.message || ctx.editedMessage;

	const entities = message.entities || message.caption_entities || [];

	const text = message.text || message.caption;

	const rawUrls = entities
		.filter(isUrl)
		.map(obtainUrlFromText(text))
		.map(assumeProtocol);

	const admin = ctx.botInfo;
	const userToWarn = ctx.from;

	const urls = R.uniq(rawUrls).map(constructAbsUrl);

	// if one link is repeated 3 times or more
	if (rawUrls.length - urls.length >= 2 && !await isAdmin(userToWarn)) {
		const reason = 'Link - multiple copies, possibly spam';
		ctx.deleteMessage();
		const warnMessage = await warn({ admin, reason, userToWarn });
		return ctx.replyWithHTML(warnMessage, { reply_markup });
	}

	// TODO Whitelist invite links somewhere around here
	// Could support whitelist here as well
	return (await classifyList(urls)).cata({
		Nothing: next,
		Notify(errorMsg) {
			const reply_to_message_id = message.message_id;
			ctx.reply(`️ℹ️ ${errorMsg}`, { reply_to_message_id });
			return next();
		},
		Warn: async (blacklist) => {
			const reason = `Link - ${blacklist}`;

			if (await isAdmin(userToWarn)) return next();

			ctx.deleteMessage();
			const warnMessage = await warn({ admin, reason, userToWarn });
			return ctx.replyWithHTML(warnMessage, { reply_markup });
		},
	});
};
