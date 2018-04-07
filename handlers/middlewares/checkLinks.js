'use strict';

/* eslint new-cap: ["error", {"capIsNewExceptionPattern": "^Action.\w+$"}] */

const { URL } = require('url');

const { taggedSum } = require('daggy');
const fetch = require('node-fetch');
const R = require('ramda');

const { isAdmin } = require('../../stores/user');
const { managesGroup } = require('../../stores/group');
const warn = require('../../actions/warn');


const { warnInlineKeyboard } = require('../../config');
const reply_markup = { inline_keyboard: warnInlineKeyboard };

const tmeDomains = new Set([
	't.me',
	'telegram.dog',
	'telegram.me',
]);

const bannedDomains = new Set([
	...tmeDomains,
	'chat.whatsapp.com',
	'loverdesuootnosheniya.blogspot.com',
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
const isHttp = R.propSatisfies(R.test(/^https?:$/i), 'protocol');
const isUrl = entity => entity.type === 'url' || entity.type === 'text_link ';
const memoize = R.memoizeWith(R.identity);

const domainContainedIn = R.curry((domains, url) =>
	domains.has(url.host.toLowerCase()));

const obtainUrlFromText = text => ({ length, offset, url }) =>
	url
		? url
		: text.slice(offset, length + offset);


const blacklisted = {
	domain: domainContainedIn(bannedDomains),
	protocol: url =>
		url.protocol === 'tg:' && url.host.toLowerCase() === 'resolve',
};

const whitelisted = async (url) => {
	if (domainContainedIn(tmeDomains, url)) {
		const tmeLink = new URL(url);
		tmeLink.domain = 't.me';
		tmeLink.protocol = 'https:';
		if (await managesGroup({ link: tmeLink.toString() })) return true;
	}
	// handle custom whitelist right here
	return false;
};

const unshorten = url =>
	fetch(url, { redirect: 'follow' }).then(res =>
		res.ok
			? new URL(res.url)
			: Promise.reject(new Error(`Request to ${url} failed, ` +
				`reason: ${res.status} ${res.statusText}`)));

const classifyAsync = memoize(url =>
	unshorten(url)
		.then(async long =>
			blacklisted.domain(long) && !await whitelisted(long)
				? Action.Warn('blacklisted domain')
				: Action.Nothing)
		.catch(Action.Notify));

const classifyList = (urls) => {
	if (urls.some(blacklisted.protocol)) return Action.Warn('tg: protocol');

	return Promise.all(urls.filter(isHttp).map(classifyAsync))
		.then(highestPriorityAction);
};


const classifyCtx = async (ctx) => {
	if (ctx.chat.type === 'private') return Action.Nothing;

	const message = ctx.message || ctx.editedMessage;

	const entities = message.entities || message.caption_entities || [];

	const text = message.text || message.caption;

	const rawUrls = entities
		.filter(isUrl)
		.map(obtainUrlFromText(text))
		.map(assumeProtocol);

	const urls = R.uniq(rawUrls).map(constructAbsUrl);

	// if one link is repeated 3 times or more
	if (rawUrls.length - urls.length >= 2 && !await isAdmin(ctx.from)) {
		return Action.Warn('multiple copies');
	}

	return classifyList(urls);
};

module.exports = async (ctx, next) =>
	(await classifyCtx(ctx)).cata({
		Nothing: next,
		Notify(errorMsg) {
			const message = ctx.message || ctx.editedMessage;
			const reply_to_message_id = message.message_id;
			ctx.reply(`️ℹ️ ${errorMsg}`, { reply_to_message_id });
			return next();
		},
		Warn: async (blacklist) => {
			const admin = ctx.botInfo;
			const reason = `Link - ${blacklist}`;
			const userToWarn = ctx.from;

			if (await isAdmin(userToWarn)) return next();

			ctx.deleteMessage();
			const warnMessage = await warn({ admin, reason, userToWarn });
			return ctx.replyWithHTML(warnMessage, { reply_markup });
		},
	});
