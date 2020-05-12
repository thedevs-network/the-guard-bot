import { managesGroup, removeGroup } from "../../stores/group";
import { ExtendedContext } from "../../typings/context";
import { html } from "../../utils/html";
import { isMaster } from "../../utils/config";

const leaveCommandHandler = async (ctx: ExtendedContext) => {
	if (!isMaster(ctx.from)) return null;

	const query = ctx.message!.text!.split(" ").slice(1).join(" ");

	const group = query
		? await managesGroup(
				/^-?\d+/.test(query) ? { id: +query } : { title: query }
		  )
		: ctx.chat;
	if (!group) {
		return ctx.replyWithHTML("❓ <b>Unknown group.</b>");
	}

	await removeGroup(group);
	await ctx.replyWithHTML(html`✅ <b>I no longer manage ${group.title}.</b>`);
	return ctx.tg.leaveChat(group.id);
};

export = leaveCommandHandler;
