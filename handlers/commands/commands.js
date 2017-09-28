'use strict';

const commandReference = `\
<b>Master commands</b>:
<code>/admin</code> - promote replied-to person to admin,
<code>/unadmin</code> - demote admin,

<b>Admin commands</b>:
<code>/warn &lt;reason&gt;</code> - \
warn replied-to person and delete their message,
<code>/unwarn</code> - remove last warn from replied-to person,
<code>/nowarns</code> - remove all warn from replied-to person,
<code>/getwarns</code> - get all warnings from replied-to person,
<code>/ban &lt;reason&gt;</code> - \
ban replied-to person and delete their message,
<code>/unban</code> - unban replied-to person

<b>Commands for everyone</b>:
<code>/staff</code> - list admins,
<code>/groups</code> - list managed groups,
<code>/report</code> - report replied-to message to admins.
`;

const commandReferenceHandler = ({ chat, replyWithHTML }) => {
	if (chat.type !== 'private') {
		return null;
	}
	return replyWithHTML(commandReference);
};

module.exports = commandReferenceHandler;
