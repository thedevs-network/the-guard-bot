import { Middleware } from "telegraf";

import type { ExtendedContext } from "../../typings/context";

import { botStartTime } from "../../utils/config";

const markOldUpdate: Middleware<ExtendedContext> = (ctx, next) => {
	const startTime = botStartTime.get().valueOf() / 1000;

	ctx.oldUpdate = Boolean(ctx.message && ctx.message.date < startTime);

	return next();
};

export = markOldUpdate;
