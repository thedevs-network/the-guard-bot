'use strict';

// DB
const { listCommands } = require('../../stores/command');

const commandReference = `\
<b>Master commands</b>:
<code>/admin</code> - Makes the user admin.
<code>/unadmin</code> - Demotes the user from admin list.
<code>/leave</code> - Makes the bot leave the group cleanly.

<b>Admin commands</b>:
<code>/warn &lt;reason&gt;</code> - Warns the user.
<code>/unwarn</code> - Removes the last warn from the user.
<code>/nowarns</code> - Clears warns for the user.
<code>/getwarns</code> - Shows a list of warns for the user.
<code>/ban &lt;reason&gt;</code> - Bans the user from groups.
<code>/unban</code> - Removes the user from ban list.

<b>Commands for everyone</b>:
<code>/staff</code> - Shows a list of admins.
<code>/link</code> - Show the current group's link.
<code>/groups</code> - Show a list of groups which the bot is admin in.
<code>/report</code> - Reports the replied-to message to admins.
`;

const actions = `\n
/addcommand - to create custom commands.
/removecommand <code>&lt;name&gt;</code> - to remove a custom command.`;

const commandReferenceHandler = async ({ chat, replyWithHTML }) => {
	if (chat.type !== 'private') return null;

	const customCommands = await listCommands();
	const customCommandsText = customCommands.length
		? '\n<b>Custom commands:</b>\n' +
		customCommands
			.filter(command => command.isActive)
			.sort((a, b) => a.role < b.role)
			.map(command => `[${command.role}] <code>/${command.name}</code>`)
			.join('\n')
		: '';

	return replyWithHTML(commandReference + customCommandsText + actions);
};

module.exports = commandReferenceHandler;
