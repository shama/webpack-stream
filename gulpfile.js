const gulp = require('gulp');
const webpack = require('./');
const rimraf = require('rimraf');
const named = require('vinyl-named');

gulp.task('default', function () {
  rimraf.sync('tmp');
  return gulp.src(['test/fixtures/entry.js', 'test/fixtures/anotherentrypoint.js'])
    .pipe(named())
    .pipe(webpack({
      mode: 'production',
      devtool: 'source-map'
    }))
    .pipe(gulp.dest('tmp/'));
});

gulp.task('watch', function () {
  gulp.watch('test/fixtures/*.js', gulp.series('default'));
});
