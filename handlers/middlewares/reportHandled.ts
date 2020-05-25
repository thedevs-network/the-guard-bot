import type { ExtendedContext } from "../../typings/context";

export = (ctx: ExtendedContext) => {
	if (ctx.from?.status !== "admin") {
		return ctx.answerCbQuery("✋ Not permitted!", false, { cache_time: 600 });
	}

	const [, chatId, msgId] = ctx.match!;

	return Promise.all([
		ctx.deleteMessage(),
		ctx.tg.deleteMessage(+chatId, +msgId),
	]);
};
