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
          colors:       (options.stats && options.stats.colors)       || true,
          hash:         (options.stats && options.stats.hash)         || false,
          timings:      (options.stats && options.stats.timings)      || false,
          assets:       (options.stats && options.stats.assets)       || true,
          chunks:       (options.stats && options.stats.chunks)       || false,
          chunkModules: (options.stats && options.stats.chunkModules) || false,
          modules:      (options.stats && options.stats.modules)      || false,
          children:     (options.stats && options.stats.children)     || true,
        }));
      }
    }
  }

  var webpack = wp || require('webpack');
  var entry = [];
  var entries = Object.create(null);

  var stream = through(function(file) {
    if (file.isNull()) return;
    if ('named' in file) {
      if (!Array.isArray(entries[file.named])) entries[file.named] = [];
      entries[file.named].push(file.path);
    } else {
      entry = entry || [];
      entry.push(file.path);
    }
  }, function() {
    var self = this;
    options.output = options.output || {};

    // Determine pipe'd in entry
    if (Object.keys(entries).length > 0) {
      entry = entries;
      if (!options.output.filename) {
        // Better output default for multiple chunks
        options.output.filename = '[name].js'
      }
    } else if (entry.length < 2) {
      entry = entry[0] || entry;
    }

    if (!options.entry) options.entry = entry;
    if (!options.output.path) options.output.path = process.cwd();
    if (!options.output.filename) options.output.filename = '[hash].js';

    if (!options.entry) {
      gutil.log('gulp-webpack - No files given; aborting compilation');
      return;
    }

    var compiler = webpack(options, function(err, stats) {
      if (err) {
        self.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
      }
      if (!options.watch) self.queue(null);
      done(err, stats);
      if (options.watch && !options.quiet) {
        gutil.log("Webpack is watching for changes");
      }
    });

    // In watch mode webpack returns a wrapper object so we need to get
    // the underlying compiler
    if (options.watch) compiler = compiler.compiler;

    if (options.progress) {
      compiler.apply(new ProgressPlugin(function(percentage, msg) {
        percentage = Math.floor(percentage * 100);
        msg = percentage + '% ' + msg;
        if (percentage < 10) msg = ' ' + msg;
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
