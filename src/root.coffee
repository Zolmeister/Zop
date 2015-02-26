require './polyfill'

_ = require 'lodash'
z = require 'zorium'
log = require 'clay-loglevel'

config = require './config'
HomePage = require './pages/home'
ErrorReportService = require './services/error_report'

style = require './root.styl'

style.use()

###########
# LOGGING #
###########

window.addEventListener 'error', ErrorReportService.report

if config.ENV isnt config.ENVS.PROD
  log.enableAll()
else
  log.setLevel 'error'
  log.on 'error', ErrorReportService.report
  log.on 'trace', ErrorReportService.report


#################
# ROUTING SETUP #
#################

root = document.getElementById('app')
z.router.setRoot root
z.router.add '/', HomePage
z.router.go()

log.info 'App Ready'
