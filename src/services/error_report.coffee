config = require '../config'

class ErrorReportService
  report: ->
    # Remove the circular dependency within error objects
    args = _.map arguments, (arg) ->

      if arg instanceof Error and arg.stack
      then arg.stack
      else if arg instanceof Error
      then arg.message
      else if arg instanceof ErrorEvent and arg.error
      then arg.error.stack
      else if arg instanceof ErrorEvent
      then arg.message
      else arg

    window.fetch config.API_URL + '/log',
      method: 'POST'
      headers:
        'Accept': 'application/json'
        'Content-Type': 'application/json'
      body:
        JSON.stringify message: args.join ' '
    .catch (err) ->
      console?.error err

module.exports = new ErrorReportService()
