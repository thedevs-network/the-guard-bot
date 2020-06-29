/* eslint new-cap: ["error", {"capIsNewExceptionPattern": "^(?:Action|jspack)\."}] */

import * as R from "ramda";
import { html, lrm } from "../../utils/html";
import { isAdmin, permit } from "../../stores/user";
import { config } from "../../utils/config";
import type { ExtendedContext } from "../../typings/context";
import fetch from "node-fetch";
import { jspack } from "jspack";
import { managesGroup } from "../../stores/group";
import type { MessageEntity } from "telegraf/typings/telegram-types";
import { pMap } from "../../utils/promise";
import { telegram } from "../../bot";
import { URL } from "url";
import XRegExp = require("xregexp");

const { excludeLinks = [], blacklistedDomains = [] } = config;

if (excludeLinks === false) {
	module.exports = (ctx, next) => next();
	// @ts-ignore
	return;
}

const tmeDomains = ["t.me", "telega.one", "telegram.dog", "telegram.me"];

const tmeDomainRegex = XRegExp.union(tmeDomains);

const normalizeTme = R.replace(
	XRegExp.tag("i")`^(?:@|(?:https?:\/\/)?${tmeDomainRegex}\/)(\w+)(\/.+)?`,
	(_match, username, rest) =>
		/^\/\d+$/.test(rest)
			? `https://t.me/${username.toLowerCase()}`
			: `https://t.me/${username.toLowerCase()}${rest || ""}`
);

const stripQuery = (s: string) => s.split("?", 1)[0];

const customWhitelist = new Set(excludeLinks.map(normalizeTme).map(stripQuery));

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Action {
	export enum Type {
		Nothing,
		Notify,
		Warn,
	}

	export type Nothing = { type: Type.Nothing };
	export type Notify = { type: Type.Notify; errorMsg: CodeError };
	export type Warn = { type: Type.Warn; reason: string };

	export const Nothing: Nothing = { type: Type.Nothing };
	export const Notify = (errorMsg: CodeError): Notify => ({
		type: Type.Notify,
		errorMsg,
	});
	export const Warn = (reason: string): Warn => ({
		type: Type.Warn,
		reason,
	});
}

type Action = Action.Nothing | Action.Notify | Action.Warn;

const actionPriority = (action: Action) => action.type;
const maxByActionPriority = R.maxBy(actionPriority);
const highestPriorityAction = R.reduce(maxByActionPriority, Action.Nothing);

const assumeProtocol = R.unless(R.contains("://"), R.concat("http://"));
const isHttp = R.propSatisfies(R.test(/^https?:$/i), "protocol");
const isLink = (entity: MessageEntity) =>
	["url", "text_link", "mention"].includes(entity.type);

const obtainUrlFromText = (text: string) => ({ length, offset, url = "" }) =>
	url ? url : text.slice(offset, length + offset);

const blacklisted = {
	protocol: (url: URL) =>
		url.protocol === "tg:" && url.host.toLowerCase() === "resolve",
};

const isPublic = async (username: string) => {
	try {
		const chat = await telegram.getChat(username);
		return chat.type !== "private";
	} catch (err) {
		return false;
	}
};

const inviteLinkToGroupID = (url: URL) => {
	if (url.pathname.toLowerCase().startsWith("/joinchat/")) {
		const [, groupID] = jspack.Unpack(
			">LLQ",
			Buffer.from(url.pathname.split("/")[2], "base64")
		);
		return groupID;
	}
	return null;
};

const managesLinkedGroup = (url: URL) => {
	const id = inviteLinkToGroupID(url);
	const superId = +`-100${id}`;
	const link = url.toString();
	return managesGroup({ $or: [{ id }, { id: superId }, { link }] });
};

const dh = {
	blacklistedDomain: R.always(
		Promise.resolve(Action.Warn("Link to a blacklisted domain"))
	),
	nothing: R.always(Promise.resolve(Action.Nothing)),
	tme: async (url: URL) => {
		if (url.pathname === "/") return Action.Nothing;
		if (url.pathname.toLowerCase().startsWith("/c/")) return Action.Nothing;
		if (url.pathname.toLowerCase().startsWith("/addstickers/")) {
			return Action.Nothing;
		}
		if (url.searchParams.has("start")) return Action.Warn("Bot reflink");
		if (await managesLinkedGroup(url)) return Action.Nothing;
		const [, username] = R.match(/^\/(\w+)(?:\/\d*)?$/, url.pathname);
		if (username && !(await isPublic("@" + username))) return Action.Nothing;
		return Action.Warn("Link to a Telegram group or channel");
	},
};

const domainHandlers = new Map([
	...tmeDomains.map((domain) => [domain, dh.tme] as const),
	...blacklistedDomains.map(
		(domain) => [domain, dh.blacklistedDomain] as const
	),
]);

const isWhitelisted = (url: URL) =>
	customWhitelist.has(stripQuery(url.toString()));

class CodeError extends Error {
	constructor(readonly code: string) {
		super(code);
	}
}

const unshorten = (url: URL | string) =>
	fetch(url, { redirect: "follow" }).then((res) =>
		res.ok
			? new URL(normalizeTme(res.url))
			: Promise.reject(new CodeError(`${res.status} ${res.statusText}`))
	);

const checkLinkByDomain = (url: URL) => {
	const domain = url.host.toLowerCase();
	const handler = domainHandlers.get(domain) || dh.nothing;
	return handler(url);
};

const classifyAsync = R.memoize(async (url: URL) => {
	if (isWhitelisted(url)) return Action.Nothing;

	if (blacklisted.protocol(url)) return Action.Warn("Link using tg protocol");

	if (domainHandlers.has(url.host.toLowerCase())) return checkLinkByDomain(url);

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

const classifyList = (urls: URL[]) =>
	pMap(urls, classifyAsync).then(highestPriorityAction);

const matchTmeLinks = R.match(XRegExp.tag("gi")`\b${tmeDomainRegex}\/[\w-/]+`);

const maybeProp = (prop) => (o) => (R.has(prop, o) ? [o[prop]] : []);

const buttonUrls = R.pipe(
	R.path(["reply_markup", "inline_keyboard"]),
	R.defaultTo([]),
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/unbound-method
	R.unnest,
	R.chain(maybeProp("url"))
);

const classifyCtx = (ctx: ExtendedContext) => {
	if (!ctx.chat?.type.endsWith("group")) return Action.Nothing;

	const message = ctx.message || ctx.editedMessage;

	if (!message) return Action.Nothing;

	const entities = message.entities || message.caption_entities || [];

	const text = message.text || message.caption || "";

	const rawUrls = entities
		.filter(isLink)
		.map(obtainUrlFromText(text))
		.concat(buttonUrls(message))
		.concat(matchTmeLinks(text));

	const urls = R.uniq(rawUrls)
		.map(normalizeTme)
		.map(assumeProtocol)
		.map((url) => new URL(url));

	return classifyList(urls);
};

export = async (ctx: ExtendedContext, next) => {
	const action = await classifyCtx(ctx);

	if (action.type === Action.Type.Warn) {
		const userToWarn = ctx.from!;

		if (userToWarn.id === 777000) return next();
		if (await isAdmin(userToWarn)) return next();

		if (await permit.revoke(userToWarn)) {
			await ctx.replyWithHTML(html`
				${lrm}${userToWarn.first_name} used 🎟 permit!
			`);
			return next();
		}

		ctx.deleteMessage().catch(() => null);
		return ctx.warn({
			admin: ctx.botInfo!,
			reason: action.reason,
			userToWarn,
			mode: "auto",
		});
	}

	return next();
};
