import replace = require("string-replace-async");
import { getCommand } from "../../stores/command";

export const substom = (reason: string): Promise<string> =>
	replace(reason, /!\s?(\w+)\s*|.+/g, async (match, name) => {
		if (!name) return match;
		const command = await getCommand({
			name: name.toLowerCase(),
			role: "admins",
			type: "copy",
		});
		if (!command) return match;
		return command.content.text + " ";
	});
