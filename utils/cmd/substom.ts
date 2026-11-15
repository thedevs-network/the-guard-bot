import { getCommand } from "../../stores/command";
import replace from "string-replace-async";

export const substom = (reason: string): Promise<string> =>
	replace(reason, /!\s?(\w+)\s*|.+/g, async (match, name) => {
		if (!name) return match;
		const command = await getCommand({
			name: name.toLowerCase(),
			role: { $ne: "master" },
			type: "copy",
		});
		const text = command?.content.text || command?.content.caption;
		if (!text) return match;
		return text + " ";
	});
