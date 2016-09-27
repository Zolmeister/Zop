express = require 'express'
app = express()
router = express.Router()

app.use router

router.get '/js', (req, res) ->
  res.sendfile 'src/root.js'

router.get '/', (req, res) ->
  res.sendfile 'src/index.html'

router.get '/ping', (req, res) ->
  res.end 'pong'

module.exports = app
