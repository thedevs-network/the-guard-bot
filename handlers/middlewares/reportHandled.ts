import { CallbackQuery, Update } from "telegraf/types";
import type { ExtendedContext } from "../../typings/context";

export = (ctx: ExtendedContext<Update.CallbackQueryUpdate<CallbackQuery.DataQuery>>) => {
	if (ctx.from?.status !== "admin") {
		return ctx.answerCbQuery("✋ Not permitted!", { cache_time: 600 });
	}

	const [, chatId, msgId] = ctx.match!;

	return Promise.all([
		// delete the report in the report chat
		ctx.deleteMessage(),
		// delete the forwarded contextual message in report chat
		ctx.deleteMessage(ctx.callbackQuery.message?.reply_to_message?.message_id),
		// delete the report in the actual chat
		ctx.telegram.deleteMessage(+chatId, +msgId),
	]);
};
