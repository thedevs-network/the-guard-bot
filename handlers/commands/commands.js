'use strict';

const commandReference = `\
<b>Master commands</b>:
<code>/admin</code> - Makes the user admin.
<code>/unadmin</code> - Demotes the user from admin list.

<b>Admin commands</b>:
<code>/warn &lt;reason&gt;</code> - Warns the user.
<code>/unwarn</code> - Removes the last warn from the user.
<code>/nowarns</code> - Clears warns for the user.
<code>/getwarns</code> - Shows a list of warns for the user.
<code>/ban &lt;reason&gt;</code> - Bans the user from groups.
<code>/unban</code> - Removes the user from ban list.

<b>Commands for everyone</b>:
<code>/staff</code> - Shows a list of admins.
<code>/groups</code> - Show a list of groups which the bot is admin in.
<code>/report</code> - Reports the replied-to message to admins.
`;

const commandReferenceHandler = ({ chat, replyWithHTML }) => {
	if (chat.type !== 'private') {
		return null;
	}
	return replyWithHTML(commandReference);
};

module.exports = commandReferenceHandler;
