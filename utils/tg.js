'use strict'

const { telegram } = require('../bot')

const R = require('ramda')

const isCommand = R.pipe(
  R.defaultTo({}),
  R.path([ 'entities', 0 ]),
  R.defaultTo({}),
  R.whereEq({ offset: 0, type: 'bot_command' })
)

const escapeHtml = s => s
  .replace(/</g, '&lt;')

const link = ({ id, firstName }) =>
  `<a href="tg://user?id=${id}">${escapeHtml(firstName)}</a>`

const quietLink = (user) =>
  user.username
    ? `<a href="t.me/${user.username}">${escapeHtml(user.first_name)}</a>`
    : link(user)

/**
 * @param {number} ms
 * Deletes messages after (ms) milliseconds
 * @returns {undefined}
 */
const deleteAfter = ms => (ctx, next) => {
  setTimeout(ctx.deleteMessage, ms)
  next()
}

const scheduleDeletion = ({ chat, messageId }) => {
  if (chat.type === 'private') {
    return null
  }
  return setTimeout(
    () => telegram.deleteMessage(chat.id, messageId),
    5 * 60 * 1000
  )
}

module.exports = {
  deleteAfter,
  escapeHtml,
  isCommand,
  link,
  quietLink,
  scheduleDeletion
}
