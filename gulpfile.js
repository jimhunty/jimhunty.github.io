var gulp = require('gulp');
var gutil = require('gulp-util');
var express = require('express');
var path = require('path');
var tinylr = require('tiny-lr');
var compass = require('gulp-compass');

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

var createServers = function(port, lrport) {
  var lr = tinylr();
  lr.listen(lrport, function() {
    gutil.log('LR Listening on', lrport);
  });
 
  var app = express();
  app.use(express.static(path.resolve('./')));
  app.listen(port, function() {
    gutil.log('Listening on', port);
  });
 
  return {
    lr: lr,
    app: app
  };
};

var servers = createServers(8080, 35729);

gulp.task('compass', function() {
    gulp.src('./sass/*.scss')
        .pipe(compass({
            css: 'css',
            image: 'img',
            require: ['susy'],
            comments: true,
            logging: true
        }))
        .on('error', handleError)
        .pipe(gulp.dest('css'));
});
 
gulp.task('default', function(){
  gulp.watch(["./**/*", "!./node_modules/**/*"], function(evt){
    gulp.run('compass');
    gutil.log(gutil.colors.cyan(evt.path), 'changed');
    servers.lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });
});