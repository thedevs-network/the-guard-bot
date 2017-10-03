<p align="center">
  <img src="http://imageupload.co.uk/images/2017/09/28/zzzzz.png" width="180" height="180">
  <h1 align="center">The Guard Bot</h1>
</p>
The Guard is a Telegram bot made to help admins manage their groups.

Initially created to moderate [The Devs Network](https://thedevs.network).

**NOTE: The Guard is still in alpha phase and is not ready for production**

## Setup
You need [Node.js](https://nodejs.org/) (> 8.1) to run this bot.

1. Create a bot via [@BotFather](https://t.me/BotFather) and grab a **token**.
2. Clone this repository or [downlaod zip](https://github.com/TheDevs-Network/the-guard-bot/archive/master.zip).
3. Install dependencies via `npm install`.
4. Copy `config.example.json` to `config.json`, fill it properly and remove comments.
5. Start the bot via `npm start`.

Now you can add the bot as **administrator** to your groups.

## Commands
Command  | Role   | Description
-------- | ------ | -----------
`/admin` | _Master_ | Makes the user admin.
`/unadmin` | _Master_ | Demotes the user from admin list.
`/leave` | _Master_ | Makes the bot leave the group cleanly.
`/warn <reason>` | _Admin_ | Warns the user.
`/unwarn` | _Admin_ | Removes the last warn from the user.
`/nowarns` | _Admin_ | Clears warns for the user.
`/getwarns` | _Admin_ | Shows a list of warns for the user.
`/ban <reason>` | _Admin_ | Bans the user from groups.
`/unban` | _Admin_ | Removes the user from ban list.
`/staff` | _All_ | Shows a list of admins.
`/groups` | _All_ | Show a list of groups which the bot is admin in.
`/report` | _All_ | Reports the replied-to message to admins.

All commands and actions are synchronized across all of the groups managed by the owner and they work with both **replying** and **mentioning** a user.

If used by reply, `/ban` and `/warn` remove the replied-to message.

The bot is still in alpha phase so feel free to open issues and ask for a _feature_.

---

The Guard icon from [Entypo+](http://entypo.com/) by Daniel Bruce.
