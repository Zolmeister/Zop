app = require '../server'

port = process.env.PORT or 3000

app.listen port, ->
  console.log 'Listening on port %d', port
