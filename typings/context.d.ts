import type {
	ExtraReplyMessage,
	Message,
	User,
} from "telegraf/typings/telegram-types";
import type { Context } from "telegraf";
import type { TgHtml } from "../utils/html";

interface DbUser {
	status: "member" | "admin" | "banned";
}

export interface ContextExtensions {
	ban(
		this: ExtendedContext,
		options: {
			admin: User;
			reason: string;
			userToBan: User;
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
		}
	): Promise<Message>;

	loggedReply(
		this: ExtendedContext,
		html: TgHtml,
		extra?: ExtraReplyMessage
	): Promise<Message>;
	replyWithHTML(
		this: void,
		html: string | TgHtml,
		extra?: ExtraReplyMessage
	): Promise<Message>;
	replyWithCopy(
		this: ExtendedContext,
		content: Message,
		options?: ExtraReplyMessage
	): Promise<Message>;
}

export type ExtendedContext = ContextExtensions &
	Context & {
		from?: DbUser;
	};
