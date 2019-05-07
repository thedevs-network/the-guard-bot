const FARSI_RE = /[\u0600-\u06FF]/;

module.exports = ({ message, chat, replyWithMarkdown }, next) => {
    if (!message) {
        return next();
    }

    const { text } = message;
    const replyOptions = { reply_to_message_id: message.message_id };

    if (!text || !['group', 'supergroup'].includes(chat.type) || chat.id === -1001211669317) {
        return next();
    }

    const isFarsi = FARSI_RE.test(text);

    if (isFarsi) {
        replyWithMarkdown('Please only send proxies here and write in English. For farsi chatting join [the farsi group](https://t.me/joinchat/E7Xrc0g4m0VlTV7oHyu8EQ).', replyOptions);
    }

    return next();
}
