import type { ExtendedContext } from '../../typings/context';

export = (ctx: ExtendedContext) => {
	if (ctx.from?.status !== 'admin') {
		return ctx.answerCbQuery('✋ Not permitted!', {
			show_alert: false,
			cache_time: 600,
		});
	}

	const [, chatId, msgId] = ctx.callbackQuery?.inline_message_id!;

	return Promise.all([
		ctx.deleteMessage(),
		ctx.telegram.deleteMessage(+chatId, +msgId),
	]);
};
