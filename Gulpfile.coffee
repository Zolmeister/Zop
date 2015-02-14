gulp = require 'gulp'
nodemon = require 'gulp-nodemon'

# start the dev server
gulp.task 'dev', ->
  # Don't actually watch for changes, just run the server
  nodemon {script: 'bin/dev_server.coffee', ext: 'null', ignore: ['**/*.*']}
