'use strict';

var gutil = require('gulp-util');
var File = require('vinyl');
var MemoryFileSystem = require('memory-fs');
var through = require('through');

var PLUGIN_NAME = 'gulp-webpack';

var compiler = null;

module.exports = function(options, wp, done) {
  options = options || {};
  if (typeof done !== 'function') {
    done = function(err, stats) {
      if (options.quiet) return;
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

    var handler = function (err, stats) {
      if (err) {
        self.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
      }
      delete compiler._plugins['after-emit'];
      done(err, stats);
    };

    if (compiler === null) {
      compiler = webpack(options);
    }
    if (options.watch) {
      if (!options.watching) {
        compiler.watch(options.watchDelay || 200, handler);
        options.watching = true;
      }
    } else {
      compiler.run(handler);
    }

    var fs = compiler.outputFileSystem = new MemoryFileSystem();
    compiler.plugin('after-emit', function(compilation, callback) {
      Object.keys(compilation.assets).forEach(function(outname) {
        // will queue only changed assets
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
      self.queue(null);
      callback();
    });
  });

  // If entry point manually specified, trigger that
  if (options.entry) {
    // entry.push fails with
    // Cannot call method 'push' of undefined
    // if this is called
//    stream.end();
  }

  return stream;
};
