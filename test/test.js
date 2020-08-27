var test = require('tape');
var webpack = require('../');
var path = require('path');
var fs = require('vinyl-fs');
var named = require('vinyl-named');

var base = path.resolve(__dirname, 'fixtures');

test('streams output assets', function (t) {
  t.plan(3);
  var entry = fs.src('test/fixtures/entry.js');
  var stream = webpack({
    config: {
      mode: 'development',
      output: {
        filename: 'bundle.js'
      }
    },
    quiet: true
  });
  stream.on('data', function (file) {
    var basename = path.basename(file.path);
    var contents = file.contents.toString();
    switch (basename) {
      case 'bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case '0.bundle.js':
        t.ok(/var chunk = true;/i.test(contents), 'should contain "var chunk = true;"');
        break;
    }
  });
  entry.pipe(stream);
});

test('multiple entry points', function (t) {
  t.plan(3);
  var stream = webpack({
    config: {
      mode: 'development',
      entry: {
        'one': path.join(base, 'entry.js'),
        'two': path.join(base, 'anotherentrypoint.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    },
    quiet: true
  });
  stream.on('data', function (file) {
    var basename = path.basename(file.path);
    var contents = file.contents.toString();
    switch (basename) {
      case 'one.bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'two.bundle.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  stream.end();
});

test('stream multiple entry points', function (t) {
  t.plan(3);
  var entries = fs.src(['test/fixtures/entry.js', 'test/fixtures/anotherentrypoint.js']);
  var stream = webpack({
    config: {
      mode: 'development'
    },
    quiet: true
  });
  stream.on('data', function (file) {
    var basename = path.basename(file.path);
    var contents = file.contents.toString();
    switch (basename) {
      case 'entry.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'anotherentrypoint.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  entries.pipe(named()).pipe(stream);
});

test('empty input stream', function (t) {
  t.plan(1);

  var entry = fs.src('test/path/to/nothing', { allowEmpty: true });
  var stream = webpack({
    config: {},
    quiet: true
  });
  var data = null;

  stream.on('data', function (file) {
    data = file;
  });

  stream.on('end', function () {
    t.ok(data === null, 'should not write any output');
  });

  entry.pipe(named()).pipe(stream);
});

test('multi-compile', function (t) {
  t.plan(3);

  var stream = webpack({
    quiet: true,
    config: [{
      mode: 'development',
      entry: {
        'one': path.join(base, 'entry.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    }, {
      mode: 'development',
      entry: {
        'two': path.join(base, 'anotherentrypoint.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    }]
  });
  stream.on('data', function (file) {
    var basename = path.basename(file.path);
    var contents = file.contents.toString();
    switch (basename) {
      case 'one.bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'two.bundle.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  stream.end();
});

test('no options', function (t) {
  t.plan(1);
  var stream = webpack();
  stream.on('end', function () {
    t.ok(true, 'ended without error');
  });
  stream.end();
});

test('error formatting', function (t) {
  t.plan(2);
  // TODO: Fix this to test to rely less on large string outputs as those can change
  // and still be ok.
  var expectedMessage = '\x1b[31mError\x1b[39m in plugin "\x1b[36mwebpack-stream\x1b[39m"\nMessage:\n    ./test/fixtures/entry.js\nModule Error (from ./test/fak';
  var entry = fs.src('test/fixtures/entry.js');
  var stream = webpack({
    quiet: true,
    config: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: './test/fake-error-loader'
          }
        ]
      }
    }
  });
  stream.on('error', function (err) {
    t.equal(err.toString().slice(0, expectedMessage.length), expectedMessage, 'error message');
  });
  stream.on('compilation-error', function (err) {
    t.equal(err.toString().slice(0, expectedMessage.length), expectedMessage, 'compilation-error message');
  });
  entry.pipe(stream);
});
