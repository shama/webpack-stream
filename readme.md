# [gulp](https://github.com/wearefractal/gulp)-webpack [![Build Status](http://img.shields.io/travis/shama/gulp-webpack.svg)](https://travis-ci.org/shama/gulp-webpack)

[webpack](https://github.com/webpack/webpack) plugin for [gulp](https://github.com/gulpjs/gulp)

[![NPM](https://nodei.co/npm/gulp-webpack.png?downloads=true)](https://nodei.co/npm/gulp-webpack/)

## Usage

```js
var gulp = require('gulp');
var webpack = require('gulp-webpack');
gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});
```

The above will compile `src/entry.js` into assets with webpack into `dist/` with the output filename of `[hash].js` (webpack generated hash of the build).

You can pass webpack options in with the first argument:

```js
return gulp.src('src/entry.js')
  .pipe(webpack({
    module: {
      loaders: [
        { test: /\.css$/, loader: 'style!css' },
      ],
    },
  }))
  .pipe(gulp.dest('dist/'));
```

Or just pass in your `webpack.config.js`:

```js
return gulp.src('src/entry.js')
  .pipe(webpack( require('./webpack.config.js') ))
  .pipe(gulp.dest('dist/'));
```

If you would like to use a different version of webpack than the one this plugin uses, pass in an optional 2nd argument:

```js
var gulp = require('gulp');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(gulpWebpack({}, webpack))
    .pipe(gulp.dest('dist/'));
});
```

Pass in 3rd argument if you want to access the stats outputted from webpack when the compilation is done:


```js
var gulp = require('gulp');
var webpack = require('gulp-webpack');
gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack({
      /* config */
    }, null, function(err, stats) {
      /* Use stats to do more things if needed */
    }))
    .pipe(gulp.dest('dist/'));
});
```

## Release History
* 0.4.1 - Fixed regression for multiple entry point support.
* 0.4.0 - Display an error message if there are no input files (@3onyc). Add message on why task is not finishing, Add ability to track compilation progress, Add ability to configure stats output via options (@kompot). Bump webpack version (@koistya).
* 0.3.0 - Update deps (@kompot). Fixes to determining entry (@btipling and @abergs).
* 0.2.0 - Support for `watch` mode (@ampedandwired).
* 0.1.0 - Initial release

## License
Copyright (c) 2014 Kyle Robinson Young  
Licensed under the MIT license.
