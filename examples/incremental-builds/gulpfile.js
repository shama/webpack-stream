var gulp = require('gulp');
var webpack = require('../../index.js');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

gulp.task('default', function () {
  return gulp.src('entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
  gulp.watch('lib/*.js', ['default']);
});

gulp.task('setup', function (done) {
  var lib = path.join(__dirname, 'lib');
  mkdirp(lib, function () {
    for (var i = 0; i < 99; i++) {
      fs.writeFileSync(path.join(lib, 'file' + i + '.js'), 'module.exports = "' + i + '";');
    }
    done();
  });
});
