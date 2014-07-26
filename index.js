'use strict';

var gutil = require('gulp-util');
var File = require('vinyl');
var MemoryFileSystem = require('memory-fs');
var through = require('through');
var ProgressPlugin = require("webpack/lib/ProgressPlugin");

var PLUGIN_NAME = 'gulp-webpack';

module.exports = function(options, wp, done) {
  options = options || {};
  if (typeof done !== 'function') {
    var callingDone = false;
    done = function(err, stats) {
      if (options.quiet || callingDone) return;
      // Debounce output a little for when in watch mode
      if (options.watch) {
        callingDone = true;
        setTimeout(function() { callingDone = false; }, 500);
      }
      if (options.verbose) {
        gutil.log(stats.toString({
          colors: true,
        }));
      } else {
        gutil.log(stats.toString({
          colors: true,
          hash: false,
          timings: false,
          assets: true,
          chunks: false,
          chunkModules: false,
          modules: false,
          children: true,
        }));
      }
    }
  }

  var webpack = wp || require('webpack');
  var entry = [];

  var stream = through(function(file) {
    entry.push(file.path);
  }, function() {
    var self = this;
    if (entry.length < 2) entry = entry[0];
    if (!options.entry) options.entry = entry;
    options.output = options.output || {};
    if (!options.output.path) options.output.path = process.cwd();
    if (!options.output.filename) options.output.filename = '[hash].js';

    var compiler = webpack(options, function(err, stats) {
      if (err) {
        self.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
      }
      if (!options.watch) self.queue(null);
      done(err, stats);
    });

    // In watch mode webpack returns a wrapper object so we need to get
    // the underlying compiler
    if (options.watch) compiler = compiler.compiler;

    if (options.progress) {
      compiler.apply(new ProgressPlugin(function(percentage, msg) {
        percentage = Math.floor(percentage * 100);
        msg = percentage + "% " + msg;
        gutil.log('Webpack', msg);
      }));
    }

    var fs = compiler.outputFileSystem = new MemoryFileSystem();
    compiler.plugin('after-emit', function(compilation, callback) {
      Object.keys(compilation.assets).forEach(function(outname) {
        if (compilation.assets[outname].emitted) {
          var path = fs.join(compiler.outputPath, outname);
          var contents = fs.readFileSync(path);
          self.queue(new File({
            base: compiler.outputPath,
            path: path,
            contents: contents,
          }));
        }
      });
      callback();
    });
  });

  // If entry point manually specified, trigger that
  if (options.entry) {
    stream.end();
  }

  return stream;
};
