import type { Context } from 'telegraf';
import type {
	User,
	Message,
	ExtraReplyMessage,
} from 'telegraf/typings/telegram-types';

interface DbUser {
	status: 'member' | 'admin' | 'banned';
}

export interface ContextExtensions {
	ban(options: {
		admin: User,
		reason: string,
		userToBan: User,
	}): Promise<Message>;
	batchBan(options: {
		admin: User,
		reason: string,
		targets: User[],
	}): Promise<Message>;
	warn(options: {
		admin: User,
		amend?: boolean,
		reason: string,
		userToWarn: User,
		mode: 'auto' | 'manual',
	}): Promise<Message>;
	replyWithCopy(
		content: Message,
		options?: ExtraReplyMessage
	): Promise<Message>;
}

export type ExtendedContext = ContextExtensions & Context & {
	from?: DbUser,
};
