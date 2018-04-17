'use strict';

// DB
const { listCommands } = require('../../stores/command');

const { scheduleDeletion } = require('../../utils/tg');

const commandReference = `\
<b>Master commands</b>:
<code>/admin</code> - Makes the user admin.
<code>/unadmin</code> - Demotes the user from admin list.
<code>/leave &lt;name|id&gt;</code> - Makes the bot leave the group cleanly.
<code>/hidegroup</code> - Hide the group from <code>/groups</code> list.
<code>/showgroup</code> - Show the group it in <code>/groups</code> list.

<b>Admin commands</b>:
<code>/warn &lt;reason&gt;</code> - Warns the user.
<code>/unwarn</code> - Removes the last warn from the user.
<code>/nowarns</code> - Clears warns for the user.
<code>/ban &lt;reason&gt;</code> - Bans the user from groups.
<code>/unban</code> - Removes the user from ban list.
<code>/user</code> - Shows user's status and warns.
<code>/addcommand &lt;name&gt;</code> - to create a custom command.
<code>/removecommand &lt;name&gt;</code> - to remove a custom command.

<b>Commands for everyone</b>:
<code>/staff</code> - Shows a list of admins.
<code>/link</code> - Show the current group's link.
<code>/groups</code> - Show a list of groups which the bot is admin in.
<code>/report</code> - Reports the replied-to message to admins.
`;

const commandReferenceHandler = async ({ replyWithHTML }) => {
	const customCommands = await listCommands();
	const customCommandsText = customCommands.length
		? '\n<b>Custom commands:</b>\n' +
		customCommands
			.filter(command => command.isActive)
			.sort((a, b) => a.role.toLowerCase() < b.role.toLowerCase())
			.map(command =>
				`[${command.role.toLowerCase()}] ` +
				`<code>!${command.name}</code>`)
			.join('\n')
		: '';
	return replyWithHTML(commandReference + customCommandsText)
		.then(scheduleDeletion);
};

module.exports = commandReferenceHandler;
