import ms = require("millisecond");
import rateLimit = require("telegraf-ratelimit");
import type { ExtendedContext } from "../../typings/context";

function keyGenerator(ctx: ExtendedContext) {
	if (ctx.updateType !== "message") return null;
	if (ctx.from?.status !== "member") return null;
	if (!ctx.chat?.type.endsWith("group")) return null;
	return `${ctx.chat.id}:${ctx.from.id}`;
}

const permissions = { can_send_messages: false };

async function onLimitExceeded(ctx: ExtendedContext) {
	const until_date = (Date.now() + ms("2m")) / 1000;
	await ctx.restrictChatMember(ctx.from!.id, { permissions, until_date });
}

export = rateLimit({ keyGenerator, onLimitExceeded });
