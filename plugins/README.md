# Plugins #

Plugins let you extend the bot with new functionality
without touching source code of the bot.


## Using plugins ##

To use a plugin, put it in this directory and add it's name
to `plugins` array in `config.js`.

If `plugins` is undefined, no plugins are loaded.
However, this behavior may change, don't rely on it.
If you want no plugins to be loaded, explicitly set it to empty array.


## Creating a plugin ##

Plugin is basically "requirable"
(JS file, or directory with `index.js`)
which exports a valid Telegraf handler
(usually function or `Composer` instance).

Plugins are similar to [micro-bot] bots.


## Known plugins ##

* [Captcha](https://gist.github.com/poeti8/d84dfc4538510366a2d89294ff52b4ae): Adds a simple captcha to the bot to kick spam bots on join.
* [Banfiles](https://gist.github.com/poeti8/133796200d66049c9bd58e6265a52f68) Ban users that send files with specified extentions.
* [Anti Arabic](https://gist.github.com/poeti8/966ccef35d61ad2735dc0120ce3e8760) Bans users that send an Arabic/Persian message.
* [Anti X-POST](https://gist.github.com/poeti8/c3057f973466676ca8dbbb1183cd0624) Removes same messages sent by user across one or multiple groups.


[micro-bot]: https://github.com/telegraf/micro-bot
