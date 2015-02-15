map = require 'map-stream'
fs = require 'fs'
gulp = require 'gulp'
uglify = require 'gulp-uglify'
jscrush = require 'gulp-jscrush'
nodemon = require 'gulp-nodemon'

# start the dev server
gulp.task 'dev', ->
  # Don't actually watch for changes, just run the server
  nodemon {script: 'bin/dev_server.coffee', ext: 'null', ignore: ['**/*.*']}

gulp.task 'watch', ->
  gulp.watch 'src/root.js', ['compress']

gulp.task 'compress', ->
  gulp.src 'src/root.js'
    .pipe uglify
      mangle:
        sort: true
    .pipe jscrush()
    .pipe gulp.dest './dist'
    .pipe map (file, cb) ->
      s = fs.readFileSync file.path
      console.log s.length
      cb(null, file)
