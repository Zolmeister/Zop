_ = require 'lodash'
del = require 'del'
path = require 'path'
gulp = require 'gulp'
karma = require('karma').server
mocha = require 'gulp-mocha'
rename = require 'gulp-rename'
nodemon = require 'gulp-nodemon'
gulpWebpack = require 'gulp-webpack'
coffeelint = require 'gulp-coffeelint'
runSequence = require 'run-sequence'
RewirePlugin = require 'rewire-webpack'
webpack = require 'webpack'
clayLintConfig = require 'clay-coffeescript-style-guide'

karmaConf =
  frameworks: ['mocha']
  client:
    useIframe: true
    captureConsole: true
    mocha:
      timeout: 1000
  files: [
    'build/test/bundle.js'
  ]
  browsers: ['Chrome', 'Firefox']

paths =
  static: './src/static/**/*'
  coffee: ['./src/**/*.coffee', './*.coffee', './test/*/**/*.coffee']
  root: './src/root.coffee'
  rootTests: './test/index.coffee'
  rootServerTests: './test/server.coffee'
  dist: './dist/'
  build: './build/'

# start the dev server, and auto-update
gulp.task 'dev', ['assets:dev'], ->
  gulp.start 'server:dev'

# compile sources: src/* -> build/*
gulp.task 'assets:dev', [
  'static:dev'
]

# compile sources: src/* -> dist/*
gulp.task 'assets:prod', [
  'scripts:prod'
  'static:prod'
]

# build for production
gulp.task 'build', (cb) ->
  runSequence 'clean:dist', 'assets:prod', cb

# tests
# process.exit is added due to gulp-mocha (test:server) hanging
gulp.task 'test', [
    'scripts:test'
    'test:server'
    'lint'
  ], (cb) ->
  karma.start _.defaults(singleRun: true, karmaConf), process.exit

# start the dev server
gulp.task 'server:dev', ->
  # Don't actually watch for changes, just run the server
  nodemon {script: 'bin/dev_server.coffee', ext: 'null', ignore: ['**/*.*']}

# gulp-mocha will never exit on its own.
gulp.task 'test:server', ['scripts:test'], ->
  gulp.src paths.rootServerTests
    .pipe mocha()

gulp.task 'test:phantom', ['scripts:test'], (cb) ->
  karma.start _.defaults({
    singleRun: true,
    browsers: ['PhantomJS']
  }, karmaConf), cb

gulp.task 'scripts:test', ->
  gulp.src paths.rootTests
  .pipe gulpWebpack
    module:
      postLoaders: [
        { test: /\.coffee$/, loader: 'transform/cacheable?envify' }
      ]
      loaders: [
        { test: /\.coffee$/, loader: 'coffee' }
        { test: /\.json$/, loader: 'json' }
        {
          test: /\.styl$/
          loader: 'style/useable!css!stylus?' +
                  'paths[]=bower_components&paths[]=node_modules'
        }
      ]
    plugins: [
      new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(
          'bower.json', ['main']
        )
      )
      new RewirePlugin()
    ]
    resolve:
      root: [path.join(__dirname, 'bower_components')]
      extensions: ['.coffee', '.js', '.json', '']
      # browser-builtins is for tests requesting native node modules
      modulesDirectories: ['web_modules', 'node_modules', './src',
      './node_modules/browser-builtins/builtin']
  .pipe rename 'bundle.js'
  .pipe gulp.dest paths.build + '/test/'


# run coffee-lint
gulp.task 'lint', ->
  gulp.src paths.coffee
    .pipe coffeelint(null, clayLintConfig)
    .pipe coffeelint.reporter()

gulp.task 'watch:test', ->
  gulp.watch paths.coffee, ['test:phantom']

gulp.task 'static:dev', ->
  gulp.src paths.static
    .pipe gulp.dest paths.build

#
# Production compilation
#

# rm -r dist
gulp.task 'clean:dist', (cb) ->
  del paths.dist, cb

# init.coffee --> dist/js/bundle.min.js
gulp.task 'scripts:prod', ->
  gulp.src paths.root
  .pipe gulpWebpack
    module:
      postLoaders: [
        { test: /\.coffee$/, loader: 'transform/cacheable?envify' }
      ]
      loaders: [
        { test: /\.coffee$/, loader: 'coffee' }
        { test: /\.json$/, loader: 'json' }
        {
          test: /\.styl$/
          loader: 'style/useable!css!stylus?' +
                  'paths[]=bower_components&paths[]=node_modules'
        }
      ]
    plugins: [
      new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(
          'bower.json', ['main']
        )
      )
      new webpack.optimize.UglifyJsPlugin()
    ]
    resolve:
      root: [path.join(__dirname, 'bower_components')]
      extensions: ['.coffee', '.js', '.json', '']
  .pipe rename 'bundle.js'
  .pipe gulp.dest paths.dist + '/js/'

gulp.task 'static:prod', ->
  gulp.src paths.static
    .pipe gulp.dest paths.dist
