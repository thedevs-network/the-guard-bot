import { Context, Middleware } from "telegraf";
import { addGroup } from "../../stores/group";
import { admin } from "../../stores/user";
import { isMaster } from "../../utils/config";

const addedToGroupHandler: Middleware<Context> = async (ctx, next) => {
	const wasAdded = ctx.message?.new_chat_members?.some(
		(user) => user.username === ctx.me
	);
	if (wasAdded && isMaster(ctx.from)) {
		await admin(ctx.from!);
		const link = ctx.chat!.username
			? `https://t.me/${ctx.chat!.username.toLowerCase()}`
			: await ctx.exportChatInviteLink().catch(() => "");
		if (!link) {
			await ctx.replyWithHTML(
				"⚠️ <b>Failed to export chat invite link.</b>\n" +
					"Group won't be visible in /groups list.\n" +
					"\n" +
					"If this isn't your intention, " +
					"make sure I am permitted to export chat invite link, " +
					"and then run /showgroup."
			);
		}
		const { id, title, type } = ctx.chat!;
		await addGroup({ id, link, title, type });
		await ctx.replyWithHTML(
			"🛠 <b>Ok, I'll help you manage this group from now.</b>"
		);
	}

	return next();
};

export = addedToGroupHandler;
