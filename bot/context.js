'use strict'

const warn = require('../actions/warn')

const config = require('../config')

const replyMarkup = { inline_keyboard: config.warnInlineKeyboard }

module.exports = {
  async warn ({ admin, reason, userToWarn }) {
    const warnMessage = await warn({ admin, reason, userToWarn })
    return this.replyWithHTML(warnMessage, { replyMarkup })
  }
}
