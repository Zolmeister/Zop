Zock = require 'zock'
log = require 'clay-loglevel'

config = require './config'

mock = new Zock()
  .logger log.info
  .base(config.API_URL)
  .post '/log'
  .reply 200, {}
  .base(config.API_URL)

window.XMLHttpRequest = ->
  mock.XMLHttpRequest()

module.exports = mock
