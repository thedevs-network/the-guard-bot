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

- https://gist.github.com/GingerPlusPlus/ef6273e4155bc5db89e4db8b3bdc14a8


[micro-bot]: https://github.com/telegraf/micro-bot
