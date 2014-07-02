var gulp = require('gulp');
var webpack = require('./');
var rimraf = require('rimraf');

gulp.task('default', function() {
  rimraf.sync('tmp');
  return gulp.src('test/fixtures/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('tmp/'));
});

gulp.task('watch', function() {
  gulp.watch('test/fixtures/*.js', ['default']);
});
