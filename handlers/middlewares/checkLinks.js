'use strict';

/* eslint new-cap: ["error", {"capIsNewExceptionPattern": "^Action.\w+$"}] */

const { URL } = require('url');

const { taggedSum } = require('daggy');
const fetch = require('node-fetch');
const R = require('ramda');

const { isAdmin } = require('../../stores/user');
const { managesGroup } = require('../../stores/group');
const { telegram } = require('../../bot');

const {
	excludeLinks = [],
	blacklistedDomains = [],
	notifyBrokenLink,
} = require('../../config');

if (excludeLinks === false || excludeLinks === '*') {
	module.exports = (ctx, next) => next();
	return;
}

const normalizeTme = R.replace(
	/^(?:@|(?:https?:\/\/)?(?:t\.me|telegram\.(?:me|dog))\/)(\w+)(\/.+)?/i,
	(_match, username, rest) => /^\/\d+$/.test(rest)
		? `https://t.me/${username.toLowerCase()}`
		: `https://t.me/${username.toLowerCase()}${rest || ''}`
);

const stripQuery = s => s.split('?', 1)[0];

const customWhitelist = new Set(excludeLinks
	.map(normalizeTme)
	.map(stripQuery));

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
const conatained = R.flip(R.contains);
const constructAbsUrl = R.constructN(1, URL);
const isHttp = R.propSatisfies(R.test(/^https?:$/i), 'protocol');
const isLink = R.propSatisfies(
	conatained([ 'url', 'text_link', 'mention' ]),
	'type'
);
const memoize = R.memoizeWith(R.identity);

const domainContainedIn = R.curry((domains, url) =>
	domains.has(url.host.toLowerCase()));

const obtainUrlFromText = text => ({ length, offset, url }) =>
	url
		? url
		: text.slice(offset, length + offset);


const blacklisted = {
	protocol: url =>
		url.protocol === 'tg:' && url.host.toLowerCase() === 'resolve',
};

const isPublic = async username => {
	try {
		const chat = await telegram.getChat(username);
		return chat.type !== 'private';
	} catch (err) {
		return false;
	}
};

const dh = {
	blacklistedDomain: R.always(Action.Warn('Link to blacklisted domain')),
	nothing: R.always(Action.Nothing),
	tme: async url => {
		if (url.pathname === '/') return Action.Nothing;
		if (url.pathname.toLowerCase().startsWith('/c/')) return Action.Nothing;
		if (url.pathname.toLowerCase().startsWith('/addstickers/')) {
			return Action.Nothing;
		}
		if (url.searchParams.has('start')) return Action.Warn('Bot reflink');
		if (await managesGroup({ link: url.toString() })) return Action.Nothing;
		const [ , username ] = R.match(/^\/(\w+)(?:\/\d*)?$/, url.pathname);
		if (username && !await isPublic('@' + username)) return Action.Nothing;
		return Action.Warn('Link to Telegram group or channel');
	},
};

const domainHandlers = new Map([
	[ 't.me', dh.tme ],
	[ 'telegram.dog', dh.tme ],
	[ 'telegram.me', dh.tme ],
	...blacklistedDomains.map(domain => [ domain, dh.blacklistedDomain ])
]);

const isWhitelisted = (url) => customWhitelist.has(stripQuery(url.toString()));

class CodeError extends Error {
	constructor(code) {
		super(code);
		this.code = code;
	}
}

const unshorten = url =>
	fetch(url, { redirect: 'follow' }).then(res =>
		res.ok
			? new URL(normalizeTme(res.url))
			: Promise.reject(new CodeError(`${res.status} ${res.statusText}`)));

const checkLinkByDomain = url => {
	const domain = url.host.toLowerCase();
	const handler = domainHandlers.get(domain) || dh.nothing;
	return handler(url);
};

const classifyAsync = memoize(async url => {
	if (isWhitelisted(url)) return Action.Nothing;

	if (blacklisted.protocol(url)) return Action.Warn('Link using tg protocol');

	if (domainContainedIn(domainHandlers, url)) return checkLinkByDomain(url);

	if (!isHttp(url)) return Action.Nothing;

	try {
		const longUrl = await unshorten(url);
		if (isWhitelisted(longUrl)) return Action.Nothing;
		return checkLinkByDomain(longUrl);
	} catch (e) {
		e.url = url;
		return Action.Notify(e);
	}
});

const classifyList = (urls) =>
	Promise.all(urls.map(classifyAsync))
		.then(highestPriorityAction);

const matchTmeLinks = R.match(/\b(?:t\.me|telegram\.(?:me|dog))\/[\w-/]+/gi);

const maybeProp = prop => o => R.has(prop, o) ? [ o[prop] ] : [];

const buttonUrls = R.pipe(
	R.path([ 'reply_markup', 'inline_keyboard' ]),
	R.defaultTo([]),
	R.unnest,
	R.chain(maybeProp('url'))
);

const classifyCtx = (ctx) => {
	if (!ctx.chat.type.endsWith('group')) return Action.Nothing;

	const message = ctx.message || ctx.editedMessage;

	const entities = message.entities || message.caption_entities || [];

	const text = message.text || message.caption || '';

	const rawUrls = entities
		.filter(isLink)
		.map(obtainUrlFromText(text))
		.concat(buttonUrls(message))
		.concat(matchTmeLinks(text));

	const urls = R.uniq(rawUrls)
		.map(normalizeTme)
		.map(assumeProtocol)
		.map(constructAbsUrl);

	return classifyList(urls);
};

module.exports = async (ctx, next) =>
	(await classifyCtx(ctx)).cata({
		Nothing: next,
		Notify(error) {
			const message = ctx.message || ctx.editedMessage;
			const reply_to_message_id = message.message_id;
			if (notifyBrokenLink) {
				ctx.reply(
					`️ℹ️ Link ${error.url} seems to be broken (${error.code}).`,
					{ reply_to_message_id }
				);
			}
			return next();
		},
		Warn: async (reason) => {
			const admin = ctx.botInfo;
			const userToWarn = ctx.from;

			if (await isAdmin(userToWarn)) return next();

			ctx.deleteMessage();
			return ctx.warn({
				admin,
				reason,
				userToWarn,
				mode: 'auto',
			});
		},
	});
