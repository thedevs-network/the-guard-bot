import { CallbackQuery, Message, Update } from "telegraf/types";
import { config } from "../../utils/config";
import type { ExtendedContext } from "../../typings/context";

export = async (
	ctx: ExtendedContext<Update.CallbackQueryUpdate<CallbackQuery.DataQuery>>,
) => {
	if (ctx.from?.status !== "admin") {
		return ctx.answerCbQuery("✋ Not permitted!", { cache_time: 600 });
	}

	// @ts-expect-error ctx.match is available but not registered in this callback type
	const [, chatId, msgId] = (ctx.match as string[])!;

	// delete the report in the actual chat
	await ctx.telegram.deleteMessage(+chatId, +msgId);

	if (config.chats?.noReportChatDeletion) return null;
	return Promise.all([
		// delete the report in the report chat
		ctx.deleteMessage(),
		// delete the forwarded contextual message in report chat
		ctx.deleteMessage(
			(ctx.callbackQuery.message as Message.TextMessage)?.reply_to_message
				?.message_id,
		),
	]);
};
