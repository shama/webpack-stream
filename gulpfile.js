var gulp = require('gulp');
var webpack = require('./');
var rimraf = require('rimraf');
var through = require('through');
var path = require('path');
var named = require('vinyl-named');

gulp.task('default', function() {
  rimraf.sync('tmp');
  return gulp.src(['test/fixtures/entry.js', 'test/fixtures/anotherentrypoint.js'])
    .pipe(named())
    .pipe(webpack())
    .pipe(gulp.dest('tmp/'));
});

gulp.task('watch', function() {
  gulp.watch('test/fixtures/*.js', ['default']);
});
