#!/usr/bin/env coffee
log = require 'clay-loglevel'

app = require '../server'
config = require '../src/config'

app.listen config.PORT, ->
  log.info 'Listening on port %d', config.PORT
