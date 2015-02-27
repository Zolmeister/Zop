express = require 'express'
dust = require 'dustjs-linkedin'
fs = require 'fs'
_ = require 'lodash'
Promise = require 'bluebird'
compress = require 'compression'
log = require 'clay-loglevel'
helmet = require 'helmet'

config = require './src/config'

MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS = 10886400000 # 18 weeks

app = express()
router = express.Router()

log.enableAll()

# Dust templates
# Don't compact whitespace, because it breaks the javascript partial
dust.optimizers.format = (ctx, node) -> node

indexTpl = dust.compile fs.readFileSync('src/index.dust', 'utf-8'), 'index'

distJs = if config.ENV is config.ENVS.PROD \
          then fs.readFileSync('dist/js/bundle.js', 'utf-8')
          else null

dust.loadSource indexTpl

app.use compress()

webpackDevHost = config.WEBPACK_DEV_HOSTNAME + ':' + config.WEBPACK_DEV_PORT
scriptSrc = [
  '\'unsafe-eval\''
  '\'unsafe-inline\''
  'www.google-analytics.com'
  'cdn.wtf'
  if config.ENV is config.ENVS.DEV then webpackDevHost
]
stylesSrc = [
  '\'unsafe-inline\''
  'cdn.wtf'
  if config.ENV is config.ENVS.DEV then webpackDevHost
]
app.use helmet.contentSecurityPolicy
  scriptSrc: scriptSrc
  stylesSrc: stylesSrc
app.use helmet.xssFilter()
app.use helmet.frameguard()
app.use helmet.hsts
  # https://hstspreload.appspot.com/
  maxAge: MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS
  includeSubdomains: true # include in Google Chrome
  preload: true # include in Google Chrome
  force: true
app.use helmet.noSniff()
app.use helmet.crossdomain()
app.disable 'x-powered-by'

if config.ENV is config.ENVS.PROD
then app.use express['static'](__dirname + '/dist')
else app.use express['static'](__dirname + '/build')

app.use router

# Routes
router.get '*', (req, res) ->
  renderHomePage()
  .then (html) ->
    res.send html
  .catch (err) ->
    log.trace err
    res.status(500).send()

# Cache rendering
renderHomePage = do ->
  page =
    inlineSource: config.ENV is config.ENVS.PROD
    webpackDevHostname: config.WEBPACK_DEV_HOSTNAME
    title: 'Zop'
    description: 'Zop - (╯°□°）╯︵ ┻━┻)'
    keywords: 'Zop'
    name: 'Zop'
    twitterHandle: '@Zolmeister'
    themeColor: '#00695C'
    favicon: '/images/zorium_icon_32.png'
    icon1024: '/images/zorium_icon_1024.png'
    icon256: '/images/zorium_icon_256.png'
    url: 'http://zop.zolmeister.com'
    distjs: distJs

  rendered = Promise.promisify(dust.render, dust) 'index', page

  -> rendered

module.exports = app
