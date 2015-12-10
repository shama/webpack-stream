var gulp = require('gulp');
var webpack = require('./');
var rimraf = require('rimraf');
var named = require('vinyl-named');

gulp.task('default', function () {
  rimraf.sync('tmp');
  return gulp.src(['test/fixtures/entry.js', 'test/fixtures/anotherentrypoint.js'])
    .pipe(named())
    .pipe(webpack({
      devtool: 'source-map'
    }))
    .pipe(gulp.dest('tmp/'));
});

gulp.task('watch', function () {
  gulp.watch('test/fixtures/*.js', ['default']);
});
