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
	't.me',
	'telegram.dog',
	'telegram.me',
	'tinyurl.com',
]);


const ClassifiedSync = taggedSum('Listed', {
	Neither: [ 'url' ],
	Warn: [ 'blacklist' ],
	// Support whitelist?
});

const ReplyType = taggedSum('ReplyType', {
	Error: [ 'errorMsg' ],
	Ok: [ 'url' ],
});

const Action = taggedSum('Action', {
	Nothing: [],
	NotifyFetchError: [ 'errorMsg' ],
	Warn: [ 'reason' ],
});


const assumeProtocol = R.unless(R.contains('://'), R.concat('http://'));
const cata = R.invoker(1, 'cata');
const constructAbsUrl = R.constructN(1, URL);
const getTag = R.prop('@@tag');
const getUrl = R.prop('url');
const isClassifiedWarn = syncCls => ClassifiedSync.Warn.is(syncCls);
const isHttp = R.where({ protocol: R.test(/https?:/) });
const isUrl = entity => entity.type === 'url' || entity.type === 'text_link ';
const memoize = R.memoizeWith(R.identity);

const obtainUrlFromText = text => ({ length, offset, url }) =>
	url
		? url
		: text.slice(offset, length + offset);


const classifySync1 = url => {
	// Support whitelist?
	if (url.pathname !== '/' && bannedDomains.has(url.host.toLowerCase())) {
		return ClassifiedSync.Warn('domain');
	}

	if (url.protocol === 'tg:' && url.host.toLowerCase() === 'resolve') {
		return ClassifiedSync.Warn('protocol');
	}

	return ClassifiedSync.Neither(url);
};

const classifyAsync = memoize(url =>
	fetch(url, { redirect: 'follow' }).then(res => {
		if (res.ok) return ReplyType.Ok(new URL(res.url));

		return ReplyType.Error(`Request to ${url} failed, ` +
			`reason: ${res.status} ${res.statusText}`);
	}).catch(ReplyType.Error));

// Feel free to improve readability of this functions, it'll benefit from it.
// Naming in the whole file also isn't the best.
// ...I hope it's all readable enough.
const classifyList = async (urls) => {
	const { Warn, Neither = [] } = R.groupBy(getTag, urls.map(classifySync1));

	if (Warn) return Action.Warn(Warn[0].blacklist);

	// eslint-disable-next-line max-len
	const resolved = await Promise.all(Neither.map(getUrl).filter(isHttp).map(classifyAsync));

	const { Ok = [], Error } = R.groupBy(getTag, resolved);

	const warnCls = Ok.map(getUrl).map(classifySync1).find(isClassifiedWarn);

	if (warnCls) return Action.Warn(warnCls.blacklist);

	if (Error) return Action.NotifyFetchError(Error[0].errorMsg);

	return Action.Nothing;
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

	if (rawUrls.length > 5) {
		const reason = 'Too many links in 1 message, possibly spam';
		ctx.deleteMessage();
		const warnMessage = await warn({ admin, reason, userToWarn });
		return ctx.replyWithHTML(warnMessage, { reply_markup });
	}

	const urls = R.uniq(rawUrls).map(constructAbsUrl);

	// if one link is repeated 3 times or more
	if (rawUrls.length - urls.length >= 2) {
		const reason = 'Link - multiple copies, possibly spam';
		ctx.deleteMessage();
		const warnMessage = await warn({ admin, reason, userToWarn });
		return ctx.replyWithHTML(warnMessage, { reply_markup });
	}

	// TODO Whitelist invite links somewhere around here
	// Could support whitelist here as well
	return classifyList(urls).then(cata({
		Nothing: next,
		NotifyFetchError(errorMsg) {
			const reply_to_message_id = message.message_id;
			ctx.reply(`️ℹ️ ${errorMsg}`, { reply_to_message_id });
			return next();
		},
		Warn: async (blacklist) => {
			const reason = `Link - blacklisted ${blacklist}`;

			if (await isAdmin(userToWarn)) return next();

			ctx.deleteMessage();
			const warnMessage = await warn({ admin, reason, userToWarn });
			return ctx.replyWithHTML(warnMessage, { reply_markup });
		},
	}));
};
