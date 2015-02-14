express = require 'express'
app = express()
router = express.Router()

app.use router

router.get '*', (req, res) ->
  res.sendfile 'src/index.html'

module.exports = app
