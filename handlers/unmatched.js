'use strict';

const unmatchedHandler = ctx => {
	ctx.state[unmatchedHandler.unmatched] = true;
	if (ctx.chat && ctx.chat.type === 'private') {
		ctx.reply('Sorry, I couldn\'t understand that, do you need /help?');
	}
};

unmatchedHandler.unmatched = Symbol('unmatchedHandler.unmatched');

module.exports = unmatchedHandler;
