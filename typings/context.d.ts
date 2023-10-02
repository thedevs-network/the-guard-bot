import type { Convenience, Message, Update, User } from "telegraf/types";
import type { Context } from "telegraf";
import type { TgHtml } from "../utils/html";

interface DbUser {
	status: "member" | "admin" | "banned";
}

type ExtraReplyMessage = Convenience.ExtraReplyMessage;

export interface ContextExtensions {
	ban(
		this: ExtendedContext,
		options: {
			admin: User;
			reason: string;
			userToBan: User;
			msg?: Message;
		}
	): Promise<Message>;
	batchBan(
		this: ExtendedContext,
		options: {
			admin: User;
			reason: string;
			targets: User[];
		}
	): Promise<Message>;
	warn(
		this: ExtendedContext,
		options: {
			admin: User;
			amend?: boolean;
			reason: string;
			userToWarn: User;
			mode: "auto" | "manual";
			msg?: Message;
		}
	): Promise<Message>;

	loggedReply(
		this: ExtendedContext,
		html: TgHtml,
		msg?: Message,
		extra?: ExtraReplyMessage
	): Promise<Message>;
}

export type ExtendedContext<U extends Update = Update> = ContextExtensions &
	Context<U> & {
		from?: DbUser;
	};
