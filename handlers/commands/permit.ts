import { displayUser, scheduleDeletion } from "../../utils/tg";
import { html, lrm } from "../../utils/html";
import { parse, strip } from "../../utils/cmd";
import type { ExtendedContext } from "../../typings/context";
import { permit } from "../../stores/user";

export = async (ctx: ExtendedContext) => {
	if (ctx.from?.status !== "admin") return null;

	const { targets } = parse(ctx.message);
	if (targets.length !== 1) {
		return ctx
			.replyWithHTML("ℹ️ <b>Specify one user to permit.</b>")
			.then(scheduleDeletion());
	}

	const permitted = await permit(strip(targets[0]), {
		by_id: ctx.from.id,
		date: new Date(),
	});

	return ctx.replyWithHTML(html`
		🎟 ${lrm}${ctx.from.first_name} <b>permitted</b> ${displayUser(permitted)} to
		promote once within the next 24 hours!
	`);
};
