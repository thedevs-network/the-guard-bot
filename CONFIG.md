# config.json format

This document describes the field in config.json.

Create config.json by running:

`cp example.config.json config.json`

in the project folder, then edit it.

## "master"

`number|string`

Master admin ID as a number or username as a string.

## "token"

`string`

Telegram Bot token obtained from [https://t.me/BotFather](@BotFather).

## "plugins"

`[string]`

List of plugin names to be loaded.

## "deleteCommands"

`string`

Which messages with commands should be deleted?

Options:

* "all"
* "own" (default) - leave commands meant for other bots
* "none"

## "numberOfWarnsToBan"

`number`

Number of warns that will get someone banned.

## "groupsInlineKeyboard"

`[[inlineButton]]`

inline keyboard to be added to reply to /groups.

## "warnInlineKeyboard"

`[[inlineButton]]`

Inline keyboard to be added to warn message.

## "excludedChannels"

`[string]`

List of channels that you want to be excluded from automatic warns.

Use `"*"` to disable.

## "excludedGroups"

`[string]`

List of groups that you want to be excluded from automatic warns.

Use `"*"` to disable.

